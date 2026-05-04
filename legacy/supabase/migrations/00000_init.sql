-- 00000_init.sql
-- Users (if additional profile data needed beyond auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Fridge Items
CREATE TABLE IF NOT EXISTS public.fridge_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  normalized_name text,
  category text,
  quantity numeric,
  unit text,
  purchase_date date,
  expiry_date date,
  storage_area text,
  barcode text,
  source_type text,
  image_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Waste Events
CREATE TABLE IF NOT EXISTS public.waste_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  fridge_item_id uuid references public.fridge_items on delete set null,
  outcome text check (outcome in ('saved', 'wasted')) not null,
  reason text,
  quantity numeric,
  estimated_value numeric,
  estimated_carbon_kg numeric,
  logged_at timestamptz default now()
);

-- Recipes
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  ingredients_json jsonb,
  steps_json jsonb,
  nutrition_json jsonb,
  source text check (source in ('ai', 'manual')),
  from_items_json jsonb,
  created_at timestamptz default now()
);

-- Meal Plans
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  meal_slot text check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  recipe_id uuid references public.recipes on delete set null,
  notes text
);

-- Shopping List Items
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  normalized_name text,
  category text,
  quantity numeric,
  unit text,
  status text check (status in ('pending', 'bought')) default 'pending',
  auto_suggested boolean default false,
  linked_fridge_item_id uuid references public.fridge_items on delete set null,
  store_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Nutrition Logs
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  meal_time timestamptz default now(),
  items_json jsonb,
  photo_url text,
  calories numeric,
  macros_json jsonb,
  notes text,
  created_at timestamptz default now()
);

-- Rewards
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  points integer default 0,
  lifetime_points integer default 0,
  current_streak_days integer default 0,
  longest_streak_days integer default 0,
  eco_score numeric default 0,
  last_activity_at timestamptz default now(),
  UNIQUE(user_id)
);

-- Badge Awards
CREATE TABLE IF NOT EXISTS public.badge_awards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  badge_code text not null,
  awarded_at timestamptz default now(),
  meta_json jsonb
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.fridge_items enable row level security;
alter table public.waste_events enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.rewards enable row level security;
alter table public.badge_awards enable row level security;

-- Policies for profiles
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- Policies for fridge_items
create policy "Users can view own fridge_items" on public.fridge_items for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own fridge_items" on public.fridge_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own fridge_items" on public.fridge_items for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own fridge_items" on public.fridge_items for delete to authenticated using (auth.uid() = user_id);

-- Policies for waste_events
create policy "Users can view own waste_events" on public.waste_events for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own waste_events" on public.waste_events for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own waste_events" on public.waste_events for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own waste_events" on public.waste_events for delete to authenticated using (auth.uid() = user_id);

-- Policies for recipes
create policy "Users can view own recipes" on public.recipes for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own recipes" on public.recipes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own recipes" on public.recipes for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own recipes" on public.recipes for delete to authenticated using (auth.uid() = user_id);

-- Policies for meal_plans
create policy "Users can view own meal_plans" on public.meal_plans for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own meal_plans" on public.meal_plans for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own meal_plans" on public.meal_plans for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own meal_plans" on public.meal_plans for delete to authenticated using (auth.uid() = user_id);

-- Policies for shopping_list_items
create policy "Users can view own shopping_list_items" on public.shopping_list_items for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own shopping_list_items" on public.shopping_list_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own shopping_list_items" on public.shopping_list_items for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own shopping_list_items" on public.shopping_list_items for delete to authenticated using (auth.uid() = user_id);

-- Policies for nutrition_logs
create policy "Users can view own nutrition_logs" on public.nutrition_logs for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own nutrition_logs" on public.nutrition_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own nutrition_logs" on public.nutrition_logs for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own nutrition_logs" on public.nutrition_logs for delete to authenticated using (auth.uid() = user_id);

-- Policies for rewards
create policy "Users can view own rewards" on public.rewards for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own rewards" on public.rewards for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own rewards" on public.rewards for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own rewards" on public.rewards for delete to authenticated using (auth.uid() = user_id);

-- Policies for badge_awards
create policy "Users can view own badge_awards" on public.badge_awards for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own badge_awards" on public.badge_awards for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own badge_awards" on public.badge_awards for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own badge_awards" on public.badge_awards for delete to authenticated using (auth.uid() = user_id);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('meals', 'meals', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('items', 'items', false) on conflict do nothing;

-- Storage RLS Policies
create policy "Users can view own receipts" on storage.objects for select to authenticated using (bucket_id = 'receipts' and (auth.uid())::text = (storage.foldername(name))[1]);
create policy "Users can upload own receipts" on storage.objects for insert to authenticated with check (bucket_id = 'receipts' and (auth.uid())::text = (storage.foldername(name))[1]);
create policy "Users can delete own receipts" on storage.objects for delete to authenticated using (bucket_id = 'receipts' and (auth.uid())::text = (storage.foldername(name))[1]);

create policy "Users can view own meals" on storage.objects for select to authenticated using (bucket_id = 'meals' and (auth.uid())::text = (storage.foldername(name))[1]);
create policy "Users can upload own meals" on storage.objects for insert to authenticated with check (bucket_id = 'meals' and (auth.uid())::text = (storage.foldername(name))[1]);
create policy "Users can delete own meals" on storage.objects for delete to authenticated using (bucket_id = 'meals' and (auth.uid())::text = (storage.foldername(name))[1]);

create policy "Users can view own items" on storage.objects for select to authenticated using (bucket_id = 'items' and (auth.uid())::text = (storage.foldername(name))[1]);
create policy "Users can upload own items" on storage.objects for insert to authenticated with check (bucket_id = 'items' and (auth.uid())::text = (storage.foldername(name))[1]);
create policy "Users can delete own items" on storage.objects for delete to authenticated using (bucket_id = 'items' and (auth.uid())::text = (storage.foldername(name))[1]);
