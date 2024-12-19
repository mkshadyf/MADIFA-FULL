create table download_queue (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content_id uuid references content(id) on delete cascade not null,
  priority integer default 0,
  status text check (status in ('queued', 'downloading', 'paused', 'completed', 'error')) not null,
  progress numeric(5,2) default 0,
  error text,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb,
  
  unique(user_id, content_id)
);

create index idx_download_queue_user_status on download_queue(user_id, status);
create index idx_download_queue_priority on download_queue(priority desc);

-- Function to update updated_at timestamp
create or replace function update_download_queue_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger download_queue_updated_at
  before update on download_queue
  for each row
  execute function update_download_queue_updated_at(); 