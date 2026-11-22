-- קניות הבית: מבנה נתונים וכללי אבטחה ל-Supabase
-- להדביק ב-Supabase: SQL Editor > New query > Run. אפשר להריץ שוב בלי נזק.

-- 1) בני הבית: רק אימיילים שמופיעים כאן יכולים לקרוא ולכתוב.
--    ממלאים בעצמכם (Table Editor > household > Insert row), או:
--    insert into public.household(email) values ('me@example.com');
create table if not exists public.household (
  email text primary key
);
alter table public.household enable row level security;
-- בלי policies: האפליקציה לא יכולה לקרוא או לשנות את הרשימה. רק לוח הבקרה.
revoke all on public.household from anon, authenticated;

create or replace function public.is_household()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_household() from public, anon;
grant execute on function public.is_household() to authenticated;

-- 2) כל נתוני האפליקציה: items, prices, config. כל שורה היא "מסמך" JSON.
create table if not exists public.docs (
  col        text        not null check (col in ('items', 'prices', 'config')),
  id         text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);
alter table public.docs enable row level security;
revoke all on public.docs from anon;

drop policy if exists "household select" on public.docs;
drop policy if exists "household insert" on public.docs;
drop policy if exists "household update" on public.docs;
drop policy if exists "household delete" on public.docs;
create policy "household select" on public.docs for select to authenticated using (public.is_household());
create policy "household insert" on public.docs for insert to authenticated with check (public.is_household());
create policy "household update" on public.docs for update to authenticated using (public.is_household()) with check (public.is_household());
create policy "household delete" on public.docs for delete to authenticated using (public.is_household());

-- 3) עדכונים בזמן אמת בין המכשירים
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs'
  ) then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;
