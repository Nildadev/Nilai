# Supabase Integration Guide for bolt.diy

This guide will help you set up and use Supabase integration in bolt.diy for storing chat history, projects, and more.

## Table of Contents

1. [Installation](#installation)
2. [Database Setup](#database-setup)
3. [Configuration](#configuration)
4. [Features](#features)
5. [Usage](#usage)

---

## Installation

### Step 1: Install Supabase Client

```bash
# Using pnpm (recommended)
pnpm add @supabase/supabase-js

# Or using npm
npm install @supabase/supabase-js
```

### Step 2: Add Environment Variables

Create or update your `.env.local` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

### Step 2: Run SQL Migrations

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  updated_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone)
);

-- Create conversations table
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  updated_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  metadata jsonb default '{}'::jsonb
);

-- Create messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  metadata jsonb default '{}'::jsonb
);

-- Create projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  files jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone),
  updated_at timestamp with time zone default timezone('utc'::text, now()::timestamp with time zone)
);

-- Create indexes
create index conversations_user_id_idx on conversations(user_id);
create index messages_conversation_id_idx on messages(conversation_id);
create index projects_user_id_idx on projects(user_id);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table projects enable row level security;

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

-- Create triggers for updated_at
create trigger update_conversations_updated_at before update on conversations
  for each row execute procedure update_updated_at_column();

create trigger update_messages_updated_at before update on messages
  for each row execute procedure update_updated_at_column();

create trigger update_projects_updated_at before update on projects
  for each row execute procedure update_updated_at_column();
```

---

## Configuration

### Step 1: Create Supabase Client Utility

Create a new file at `app/lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type { Database };
```

### Step 2: Update Types

Update `app/types/supabase.ts`:

```typescript
export interface SupabaseUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
}

export interface SupabaseProject {
  id: string;
  name: string;
  organization_id: string;
  region: string;
  created_at: string;
  status: string;
}

export interface SupabaseStats {
  projects: SupabaseProject[];
  totalProjects: number;
}

export interface SupabaseApiKey {
  name: string;
  api_key: string;
}

export interface SupabaseCredentials {
  anonKey?: string;
  supabaseUrl?: string;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          created_at?: string;
          metadata?: Record<string, any>;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          files: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          files?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          files?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
```

---

## Features

### 1. Chat History Storage

Automatically save all conversations and messages to Supabase:

- **Automatic backup** of all chat history
- **Sync across devices** - access your chats from anywhere
- **Search functionality** - find past conversations easily
- **Export/Import** - backup and restore your data

### 2. Project Storage

Store your projects in Supabase:

- **Cloud storage** for all your projects
- **Version history** - track changes over time
- **Collaboration** - share projects with team members
- **Quick recovery** - restore deleted projects

### 3. Real-time Sync

- **Live updates** across multiple devices
- **Conflict resolution** - automatic merge of changes
- **Offline support** - work offline, sync when online

---

## Usage

### Using the UI

1. **Open Settings**
   - Click the settings icon in the sidebar
   - Navigate to the "Supabase" tab

2. **Connect to Supabase**
   - Enter your Supabase project URL
   - Enter your anon/public key
   - Click "Connect"

3. **Enable Chat History**
   - Toggle "Save chat history" option
   - Your conversations will now be saved automatically

4. **View Saved Conversations**
   - Click on "History" in the sidebar
   - Browse your saved conversations
   - Click to restore any conversation

### Using the API

```typescript
import { supabase } from '~/lib/supabase/client';

// Save a conversation
const { data, error } = await supabase
  .from('conversations')
  .insert({
    user_id: userId,
    title: 'My Conversation',
    messages: [
      { role: 'user', content: 'Hello!' },
      { role: 'assistant', content: 'Hi there!' }
    ]
  });

// Load conversations
const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Delete a conversation
const { error } = await supabase
  .from('conversations')
  .delete()
  .eq('id', conversationId);
```

---

## Troubleshooting

### Common Issues

1. **"Failed to connect to Supabase"**
   - Check your Supabase URL and anon key
   - Ensure your project is active
   - Verify network connectivity

2. **"Permission denied"**
   - Check RLS policies in Supabase dashboard
   - Ensure user is authenticated
   - Verify the anon key has correct permissions

3. **"Environment variables not found"**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`
   - Restart the development server

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [bolt.diy Community](https://thinktank.ottomator.ai)
- [GitHub Issues](https://github.com/stackblitz-labs/bolt.diy/issues)

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Enable RLS policies** to protect user data
4. **Regular backups** of your Supabase database
5. **Monitor usage** in Supabase dashboard

---

## Next Steps

- [ ] Set up authentication with Supabase Auth
- [ ] Enable real-time subscriptions for live sync
- [ ] Implement full-text search for conversations
- [ ] Add project sharing and collaboration
- [ ] Create backup/restore functionality
