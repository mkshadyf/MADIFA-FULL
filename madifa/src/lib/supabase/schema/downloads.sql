-- Downloads table to track downloaded content
create table downloads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content_id uuid references content(id) on delete cascade not null,
  blob_url text not null,
  size bigint not null,
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_accessed timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb,
  
  unique(user_id, content_id)
);

create index idx_downloads_user_id on downloads(user_id);
create index idx_downloads_content_id on downloads(content_id);
create index idx_downloads_last_accessed on downloads(last_accessed);

-- Function to update last_accessed timestamp
create or replace function update_downloads_last_accessed()
returns trigger as $$
begin
  new.last_accessed = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update last_accessed
create trigger downloads_last_accessed
  before update on downloads
  for each row
  execute function update_downloads_last_accessed();

-- Function to get orphaned downloads (no associated content)
create or replace function get_orphaned_downloads()
returns table (
  id uuid,
  user_id uuid,
  content_id uuid,
  blob_url text,
  downloaded_at timestamp with time zone
) as $$
begin
  return query
  select d.id, d.user_id, d.content_id, d.blob_url, d.downloaded_at
  from downloads d
  left join content c on d.content_id = c.id
  where c.id is null;
end;
$$ language plpgsql; 