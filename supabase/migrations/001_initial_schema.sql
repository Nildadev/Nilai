-- bolt.diy Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  updated_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone)
);

-- Create conversations table
create table if not exists conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  updated_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  metadata jsonb default '{}'::jsonb
);

-- Create messages table
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  metadata jsonb default '{}'::jsonb
);

-- Create projects table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  files jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  updated_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone)
);

-- Create indexes for better query performance
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists conversations_created_at_idx on conversations(created_at desc);
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at desc);
create index if not exists projects_user_id_idx on projects(user_id);
create index if not exists projects_created_at_idx on projects(created_at desc);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table projects enable row level security;

-- Drop existing policies if they exist (to avoid conflicts on re-run)
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can view own conversations" on conversations;
drop policy if exists "Users can create own conversations" on conversations;
drop policy if exists "Users can update own conversations" on conversations;
drop policy if exists "Users can delete own conversations" on conversations;
drop policy if exists "Users can view messages from own conversations" on messages;
drop policy if exists "Users can create messages in own conversations" on messages;
drop policy if exists "Users can delete messages from own conversations" on messages;
drop policy if exists "Users can view own projects" on projects;
drop policy if exists "Users can create own projects" on projects;
drop policy if exists "Users can update own projects" on projects;
drop policy if exists "Users can delete own projects" on projects;

-- Create policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create policies for conversations
create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

-- Create policies for messages
create policy "Users can view messages from own conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own conversations"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete messages from own conversations"
  on messages for delete
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Create policies for projects
create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers if exist
drop trigger if exists update_conversations_updated_at on conversations;
drop trigger if exists update_projects_updated_at on projects;

-- Create triggers for updated_at
create trigger update_conversations_updated_at
  before update on conversations
  for each row execute procedure update_updated_at_column();

create trigger update_projects_updated_at
  before update on projects
  for each row execute procedure update_updated_at_column();

-- Create function to search conversations
create or replace function search_conversations(search_query text)
returns setof conversations as $$
begin
  return query
  select *
  from conversations
  where title ilike '%' || search_query || '%'
  order by created_at desc;
end;
$$ language plpgsql security definer;

-- Create function to get conversation with messages
create or replace function get_conversation_with_messages(conv_id uuid)
returns json as $$
declare
  conv conversations;
  msgs json;
begin
  select * into conv from conversations where id = conv_id;
  
  if conv is null then
    return null;
  end if;
  
  select json_agg(row_to_json(m)) into msgs
  from (
    select * from messages
    where conversation_id = conv_id
    order by created_at asc
  ) m;
  
  return json_build_object(
    'conversation', row_to_json(conv),
    'messages', coalesce(msgs, '[]'::json)
  );
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- Add comments for documentation
comment on table profiles is 'User profiles linked to Supabase Auth';
comment on table conversations is 'Chat conversations for bolt.diy';
comment on table messages is 'Individual messages within conversations';
comment on table projects is 'Projects created and managed in bolt.diy';
comment on function search_conversations is 'Full-text search for conversations by title';
comment on function get_conversation_with_messages is 'Get a conversation with all its messages';
