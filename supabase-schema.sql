-- Supabase Database Schema for Nutrition Tracking App
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create foods table
create table if not exists foods (
  id bigserial primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create nutrients table
create table if not exists nutrients (
  id text primary key,
  name text not null unique,
  unit text not null,
  rda numeric not null,
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create food_nutrients junction table
create table if not exists food_nutrients (
  id bigserial primary key,
  food_id bigint references foods(id) on delete cascade not null,
  nutrient_name text not null,
  value numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(food_id, nutrient_name)
);

-- Create user_foods table (for tracking what users eat)
create table if not exists user_foods (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  food_id bigint references foods(id) on delete cascade not null,
  quantity numeric not null default 100,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better query performance
create index if not exists food_nutrients_food_id_idx on food_nutrients(food_id);
create index if not exists food_nutrients_nutrient_name_idx on food_nutrients(nutrient_name);
create index if not exists user_foods_user_id_idx on user_foods(user_id);
create index if not exists user_foods_date_idx on user_foods(date);
create index if not exists user_foods_user_id_date_idx on user_foods(user_id, date);

-- Enable Row Level Security (RLS)
alter table foods enable row level security;
alter table nutrients enable row level security;
alter table food_nutrients enable row level security;
alter table user_foods enable row level security;

-- Create policies

-- Foods: Public read access
create policy "Foods are viewable by everyone"
  on foods for select
  using (true);

-- Nutrients: Public read access
create policy "Nutrients are viewable by everyone"
  on nutrients for select
  using (true);

-- Food nutrients: Public read access
create policy "Food nutrients are viewable by everyone"
  on food_nutrients for select
  using (true);

-- User foods: Users can only see their own data
create policy "Users can view their own food logs"
  on user_foods for select
  using (auth.uid() = user_id);

create policy "Users can insert their own food logs"
  on user_foods for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own food logs"
  on user_foods for update
  using (auth.uid() = user_id);

create policy "Users can delete their own food logs"
  on user_foods for delete
  using (auth.uid() = user_id);

-- Insert sample nutrients
insert into nutrients (id, name, unit, rda, icon) values
  ('vitamin-c', 'Vitamin C', 'mg', 90, '🍊'),
  ('protein', 'Protein', 'g', 50, '🍗'),
  ('calcium', 'Calcium', 'mg', 1000, '🥛'),
  ('iron', 'Iron', 'mg', 18, '🥬'),
  ('vitamin-d', 'Vitamin D', 'IU', 600, '☀️'),
  ('potassium', 'Potassium', 'mg', 3500, '🍌'),
  ('fiber', 'Fiber', 'g', 25, '🌾'),
  ('vitamin-b12', 'Vitamin B12', 'mcg', 2.4, '🐟'),
  ('magnesium', 'Magnesium', 'mg', 400, '🥜')
on conflict (id) do nothing;

-- Insert sample foods
insert into foods (name) values
  ('Banana'),
  ('Orange'),
  ('Chicken Breast'),
  ('Spinach'),
  ('Salmon'),
  ('Almonds'),
  ('Kiwi'),
  ('Egg'),
  ('Milk'),
  ('Yogurt'),
  ('Lentils'),
  ('Mushrooms'),
  ('Avocado'),
  ('Pumpkin Seeds')
on conflict (name) do nothing;

-- Insert sample food nutrients (values per 100g)
insert into food_nutrients (food_id, nutrient_name, value) values
  ((select id from foods where name = 'Banana'), 'Vitamin C', 8.7),
  ((select id from foods where name = 'Banana'), 'Potassium', 358),
  ((select id from foods where name = 'Banana'), 'Fiber', 2.6),
  ((select id from foods where name = 'Orange'), 'Vitamin C', 53.2),
  ((select id from foods where name = 'Orange'), 'Fiber', 2.4),
  ((select id from foods where name = 'Chicken Breast'), 'Protein', 31),
  ((select id from foods where name = 'Chicken Breast'), 'Vitamin B12', 0.3),
  ((select id from foods where name = 'Spinach'), 'Iron', 2.7),
  ((select id from foods where name = 'Spinach'), 'Calcium', 99),
  ((select id from foods where name = 'Spinach'), 'Potassium', 558),
  ((select id from foods where name = 'Spinach'), 'Magnesium', 79),
  ((select id from foods where name = 'Spinach'), 'Vitamin C', 8.4),
  ((select id from foods where name = 'Salmon'), 'Protein', 25),
  ((select id from foods where name = 'Salmon'), 'Vitamin D', 570),
  ((select id from foods where name = 'Salmon'), 'Vitamin B12', 3.2),
  ((select id from foods where name = 'Salmon'), 'Potassium', 363),
  ((select id from foods where name = 'Salmon'), 'Magnesium', 27),
  ((select id from foods where name = 'Salmon'), 'Iron', 0.8),
  ((select id from foods where name = 'Almonds'), 'Protein', 21),
  ((select id from foods where name = 'Almonds'), 'Calcium', 264),
  ((select id from foods where name = 'Almonds'), 'Iron', 3.7),
  ((select id from foods where name = 'Almonds'), 'Magnesium', 270),
  ((select id from foods where name = 'Almonds'), 'Fiber', 3.5),
  ((select id from foods where name = 'Kiwi'), 'Vitamin C', 92.7),
  ((select id from foods where name = 'Egg'), 'Protein', 6),
  ((select id from foods where name = 'Egg'), 'Vitamin D', 87),
  ((select id from foods where name = 'Egg'), 'Vitamin B12', 0.6),
  ((select id from foods where name = 'Milk'), 'Calcium', 300),
  ((select id from foods where name = 'Milk'), 'Vitamin D', 65),
  ((select id from foods where name = 'Milk'), 'Vitamin B12', 0.5),
  ((select id from foods where name = 'Yogurt'), 'Calcium', 200),
  ((select id from foods where name = 'Lentils'), 'Protein', 9),
  ((select id from foods where name = 'Lentils'), 'Iron', 6.5),
  ((select id from foods where name = 'Lentils'), 'Fiber', 7.9),
  ((select id from foods where name = 'Mushrooms'), 'Vitamin D', 114),
  ((select id from foods where name = 'Avocado'), 'Potassium', 485),
  ((select id from foods where name = 'Pumpkin Seeds'), 'Magnesium', 262)
on conflict (food_id, nutrient_name) do nothing;
