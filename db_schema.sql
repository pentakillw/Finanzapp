-- Habilitar la extensión UUID si no está habilitada
create extension if not exists "uuid-ossp";

-- 1. Tabla de Perfiles (profiles)
-- Se vincula automáticamente con auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  user_name text,
  currency text default 'MXN',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Políticas de seguridad para profiles
create policy "Los usuarios pueden ver su propio perfil" 
  on public.profiles for select 
  using ( auth.uid() = id );

create policy "Los usuarios pueden actualizar su propio perfil" 
  on public.profiles for update 
  using ( auth.uid() = id );

create policy "Los usuarios pueden insertar su propio perfil" 
  on public.profiles for insert 
  with check ( auth.uid() = id );

-- 2. Tabla de Categorías (categories)
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null, -- 'income' or 'expense'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Usuarios pueden ver sus categorias"
  on public.categories for select
  using ( auth.uid() = user_id );

create policy "Usuarios pueden crear categorias"
  on public.categories for insert
  with check ( auth.uid() = user_id );

create policy "Usuarios pueden editar sus categorias"
  on public.categories for update
  using ( auth.uid() = user_id );

create policy "Usuarios pueden eliminar sus categorias"
  on public.categories for delete
  using ( auth.uid() = user_id );

-- 3. Tabla de Deudas (debts)
create table public.debts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  lender text,
  total_amount numeric,
  paid_amount numeric default 0,
  monthly_payment numeric,
  next_payment date,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.debts enable row level security;

create policy "CRUD completo de deudas para el dueño"
  on public.debts for all
  using ( auth.uid() = user_id );

-- 4. Tabla de Transacciones (transactions)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  type text not null, -- 'income' or 'expense'
  category text,
  date date not null,
  status text default 'Completado',
  is_recurring_instance boolean default false,
  recurrence_id uuid, -- Link opcional a la recurrencia padre
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "CRUD completo de transacciones para el dueño"
  on public.transactions for all
  using ( auth.uid() = user_id );

-- 5. Tabla de Transacciones Recurrentes (recurring_transactions)
create table public.recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  type text not null,
  category text,
  frequency text not null, -- 'daily', 'weekly', 'monthly', 'yearly'
  next_due_date date not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.recurring_transactions enable row level security;

create policy "CRUD completo de recurrentes para el dueño"
  on public.recurring_transactions for all
  using ( auth.uid() = user_id );

-- Trigger automático (Opcional pero recomendado) para crear perfil al registrarse
-- Esto asegura que auth.users y public.profiles estén sincronizados
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, user_name, currency)
  values (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'currency');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
