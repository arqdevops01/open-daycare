set search_path = public;

create type user_role as enum ('staff', 'parent', 'admin');
create type user_status as enum ('pending', 'active');

create function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  daycare_id uuid not null references daycares (id),
  role user_role not null,
  status user_status not null default 'active',
  full_name text not null constraint users_full_name_not_blank check (btrim(full_name) <> ''),
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_daycare_id_idx on users (daycare_id);

create trigger users_set_updated_at
before update on users
for each row
execute function set_updated_at();

alter table users enable row level security;
revoke all privileges on table users from anon, authenticated;
revoke all on function set_updated_at() from anon, authenticated;
