set search_path = public;

grant select on table users to authenticated;

create policy users_select_own
on users
for select
to authenticated
using (id = (select auth.uid()));
