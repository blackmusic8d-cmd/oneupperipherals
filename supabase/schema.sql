-- Run this once in your Supabase project's SQL Editor (Supabase Dashboard -> SQL Editor -> New query)

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  icon_name text default 'Folder',
  subcategories jsonb default '[]'::jsonb
);

create table if not exists products (
  id text primary key,
  name text not null,
  slug text,
  category_id text references categories(id),
  subcategory text default 'General',
  brand text default 'Generic',
  price numeric not null,
  original_price numeric,
  rating numeric default 4.5,
  review_count integer default 0,
  stock integer default 0,
  description text default '',
  specifications jsonb default '{}'::jsonb,
  images jsonb default '[]'::jsonb,
  is_featured boolean default false,
  is_best_seller boolean default false,
  is_new_arrival boolean default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,
  order_number text,
  customer_name text,
  customer_phone text,
  customer_address text,
  items jsonb not null,
  total_amount numeric not null,
  status text default 'pending',
  created_at timestamptz default now(),
  notes text,
  payment_method text default 'whatsapp_manual'
);

create table if not exists reviews (
  id text primary key,
  product_id text references products(id) on delete cascade,
  user_name text not null,
  rating integer not null,
  comment text not null,
  created_at timestamptz default now(),
  verified_purchase boolean default true
);

create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  phone text default '',
  address text default '',
  wishlist_product_ids jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Row Level Security: block all direct access from the browser.
-- The app never talks to Supabase directly from the frontend — only through
-- the Netlify Function, which uses the secret service-role key that bypasses RLS.
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table users enable row level security;
