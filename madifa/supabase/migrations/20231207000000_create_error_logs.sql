-- Create error_logs table
create table if not exists public.error_logs (
  id uuid default gen_random_uuid() primary key,
  error_message text not null,
  error_code text not null,
  stack_trace text,
  user_id uuid references auth.users(id),
  component text,
  action text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.error_logs enable row level security;

create policy "Error logs are viewable by admins"
  on public.error_logs for select
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Error logs are insertable by anyone"
  on public.error_logs for insert
  to authenticated
  with check (true);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_error_logs_updated_at
  before update on public.error_logs
  for each row
  execute procedure public.handle_updated_at(); 