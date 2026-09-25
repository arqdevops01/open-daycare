create table daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null constraint daycares_name_not_blank check (btrim(name) <> ''),
  created_at timestamptz not null default now()
);

alter table daycares enable row level security;
revoke all privileges on table daycares from anon, authenticated;

insert into daycares (name) values
  ('Guardería Sala Soles'),
  ('Guardería Estrellitas'),
  ('Guardería Gigantes'),
  ('Guardería Arcoíris');
