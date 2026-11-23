-- קטלוג מוצרים (ברקוד, שם, יצרן, מחיר בכל רשת) לבחירת מוצר מדויק באפליקציה.
-- הסנכרון הלילי ממלא ומעדכן אותו. להדביק ב-Supabase: SQL Editor > New query > Run. אפשר להריץ שוב בלי נזק.
create table if not exists public.catalog (
  code       text        primary key,                 -- ברקוד (או קוד פנימי של הרשת)
  name       text        not null,
  mfr        text,
  stores     jsonb       not null default '{}'::jsonb, -- {"s1":{"n":"שם ברשת","p":12.9},"s2":{...}}
  updated_at timestamptz not null default now()
);
alter table public.catalog enable row level security;
revoke all on public.catalog from anon;
grant select on public.catalog to authenticated;
drop policy if exists "household read catalog" on public.catalog;
create policy "household read catalog" on public.catalog for select to authenticated using (public.is_household());
-- כתיבה: רק הסנכרון הלילי (service key), האפליקציה קוראת בלבד.
