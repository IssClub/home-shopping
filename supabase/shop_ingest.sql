-- קליטת פקודות קניות מהסוכן Instinct (דרך מייל וסקריפט Google).
-- להדביק ב-Supabase: SQL Editor > New query > Run. אפשר להריץ שוב בלי נזק.
-- אחרי ההרצה, להגדיר סוד קליטה (פעם אחת), מחליפים את הטקסט במילה ארוכה ואקראית:
--   insert into public.ingest_config(name, secret) values ('shop', 'REPLACE_WITH_LONG_RANDOM_SECRET')
--   on conflict (name) do update set secret = excluded.secret;

create table if not exists public.ingest_config (
  name   text primary key,
  secret text not null
);
alter table public.ingest_config enable row level security;
revoke all on public.ingest_config from anon, authenticated;   -- נגיש רק מלוח הבקרה

-- מניעת קליטה כפולה של אותו מייל
create table if not exists public.ingest_seen (
  msg_id text primary key,
  at     timestamptz not null default now()
);
alter table public.ingest_seen add column if not exists ops jsonb;   -- הפקודות שהגיעו באותו מייל, לצורך מעקב
alter table public.ingest_seen enable row level security;
revoke all on public.ingest_seen from anon, authenticated;

-- p_ops: מערך של {"op":"add|done|remove","id":"...","name":"...","qty":1,"cat":"dairy"}
create or replace function public.shop_ingest(p_secret text, p_msg text, p_ops jsonb)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  o jsonb; v_id text; v_alt text; v_qty int; v_cat text; v_key text; v_alias jsonb; v_cust text;
  added int := 0; marked int := 0; removed int := 0; missing int := 0;
  cats text[] := array['produce','bakery','dairy','meat','frozen','dry','canned','snacks','choc','drinks','clean','care','other'];
begin
  if p_secret is null or p_secret <> coalesce((select secret from ingest_config where name = 'shop'), '') then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  if p_msg is null or length(p_msg) = 0 or length(p_msg) > 300 then
    raise exception 'bad message id';
  end if;
  if jsonb_typeof(p_ops) <> 'array' or jsonb_array_length(p_ops) > 100 then
    raise exception 'bad ops';
  end if;
  if exists (select 1 from ingest_seen where msg_id = p_msg) then
    return jsonb_build_object('duplicate', true);
  end if;
  insert into ingest_seen(msg_id, ops) values (p_msg, p_ops);

  for o in select * from jsonb_array_elements(p_ops) loop
    v_id := o ->> 'id';
    if v_id is null or v_id !~ '^i[0-9a-z]{1,12}$' then missing := missing + 1; continue; end if;
    -- שם שמוזג בעבר באפליקציה (config/aliases) מפנה למוצר שנשאר
    if (o ->> 'name') is not null then
      v_key := regexp_replace(translate(btrim(regexp_replace(o ->> 'name', '\s+', ' ', 'g')), 'ךםןףץ', 'כמנפצ'), '["''׳״`]', '', 'g');
      select data -> 'map' -> v_key into v_alias from docs where col = 'config' and id = 'aliases';
      if v_alias is not null and (v_alias ->> 'id') ~ '^i[0-9a-z]{1,12}$'
         and exists (select 1 from docs where col = 'items' and id = v_alias ->> 'id') then
        v_id := v_alias ->> 'id';
      end if;
    end if;
    -- אם אין מוצר עם המזהה הזה אבל יש מוצר באותו שם (בלי גרשיים ורווחים), משתמשים בו
    v_alt := null;
    if (o ->> 'name') is not null and not exists (select 1 from docs where col = 'items' and id = v_id) then
      select id into v_alt from docs
      where col = 'items'
        and regexp_replace(lower(data ->> 'name'), '[׳''"״\s]', '', 'g') = regexp_replace(lower(o ->> 'name'), '[׳''"״\s]', '', 'g')
      limit 1;
      if v_alt is not null then v_id := v_alt; end if;
    end if;
    if o ->> 'op' = 'add' then
      v_qty := greatest(1, least(99, coalesce((o ->> 'qty')::int, 1)));
      -- קטגוריה מובנית (לפי מזהה), או קטגוריה שהוספתם באפליקציה (לפי מזהה או לפי השם בעברית)
      v_cat := case when (o ->> 'cat') = any (cats) then o ->> 'cat' else 'other' end;
      if v_cat = 'other' and coalesce(o ->> 'cat', '') <> '' then
        select e ->> 'id' into v_cust
        from docs d, jsonb_array_elements(coalesce(d.data -> 'list', '[]'::jsonb)) e
        where d.col = 'config' and d.id = 'categories'
          and (e ->> 'id' = o ->> 'cat' or e ->> 'name' = btrim(o ->> 'cat'))
        limit 1;
        if v_cust is not null then v_cat := v_cust; end if;
        v_cust := null;
      end if;
      insert into docs(col, id, data, updated_at)
      values ('items', v_id,
        jsonb_build_object('name', left(o ->> 'name', 60), 'cat', v_cat, 'qty', v_qty, 'done', false,
                           'ts', (extract(epoch from now()) * 1000)::bigint, 'by', 'agent'), now())
      on conflict (col, id) do update
        set data = docs.data || jsonb_build_object('qty', least(99, coalesce((docs.data ->> 'qty')::int, 1) + v_qty), 'done', false),
            updated_at = now();
      added := added + 1;
    elsif o ->> 'op' = 'done' then
      update docs set data = data || '{"done": true}'::jsonb, updated_at = now() where col = 'items' and id = v_id;
      if found then marked := marked + 1; else missing := missing + 1; end if;
    elsif o ->> 'op' = 'remove' then
      delete from docs where col = 'items' and id = v_id;
      if found then removed := removed + 1; else missing := missing + 1; end if;
    else
      missing := missing + 1;
    end if;
  end loop;
  return jsonb_build_object('added', added, 'done', marked, 'removed', removed, 'missing', missing);
end;
$$;
revoke all on function public.shop_ingest(text, text, jsonb) from public;
grant execute on function public.shop_ingest(text, text, jsonb) to anon;
