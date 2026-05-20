
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Aquatic
create table public.aquatic_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fish_type text not null,
  stock_in integer not null default 0,
  stock_out integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.aquatic_inventory enable row level security;
create policy "owner all aquatic_inventory" on public.aquatic_inventory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.aquatic_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sale_date date not null default current_date,
  fish_type text not null,
  quantity integer not null,
  unit_price numeric(12,2) not null,
  total_revenue numeric(14,2) generated always as (quantity * unit_price) stored,
  buyer_name text,
  payment_method text,
  created_at timestamptz not null default now()
);
alter table public.aquatic_sales enable row level security;
create policy "owner all aquatic_sales" on public.aquatic_sales for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.aquatic_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_date date not null default current_date,
  expense_type text not null,
  amount numeric(14,2) not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.aquatic_expenses enable row level security;
create policy "owner all aquatic_expenses" on public.aquatic_expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Timepieces
create table public.timepieces_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand text not null,
  model text not null,
  stock_in integer not null default 0,
  stock_out integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.timepieces_inventory enable row level security;
create policy "owner all timepieces_inventory" on public.timepieces_inventory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.timepieces_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sale_date date not null default current_date,
  brand text not null,
  model text not null,
  quantity integer not null default 1,
  unit_price numeric(14,2) not null,
  total_revenue numeric(14,2) generated always as (quantity * unit_price) stored,
  buyer_name text,
  payment_method text,
  created_at timestamptz not null default now()
);
alter table public.timepieces_sales enable row level security;
create policy "owner all timepieces_sales" on public.timepieces_sales for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.timepieces_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_date date not null default current_date,
  expense_type text not null,
  amount numeric(14,2) not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.timepieces_expenses enable row level security;
create policy "owner all timepieces_expenses" on public.timepieces_expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lending
create table public.lending_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  borrower_name text not null,
  guarantor_name text,
  capital numeric(14,2) not null,
  interest_rate numeric(6,4) not null default 0.20,
  term_days integer not null default 40,
  date_borrowed date not null default current_date,
  due_date date,
  received_date date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lending_records enable row level security;
create policy "owner all lending_records" on public.lending_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- News posts (Home feed)
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  body text,
  created_at timestamptz not null default now()
);
alter table public.news_posts enable row level security;
create policy "owner all news_posts" on public.news_posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Only authenticated users can read their org's data
CREATE POLICY "authenticated read expenses"
ON expenses FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- Only admins can insert/update/delete
CREATE POLICY "admin write expenses"
ON expenses FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);