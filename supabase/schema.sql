create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student','adviser')),
  preferred_language text not null default 'en' check (preferred_language in ('en','te','hi','ml')),
  education_level text,
  career_domain text,
  created_at timestamptz not null default now()
);
create table if not exists public.adviser_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  domain text not null,
  experience_years integer not null default 0,
  bio text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role','student');
  if user_role not in ('student','adviser') then user_role := 'student'; end if;
  insert into public.profiles (id,full_name,role,preferred_language,education_level,career_domain)
  values (new.id,coalesce(new.raw_user_meta_data->>'full_name',''),user_role,
    coalesce(new.raw_user_meta_data->>'preferred_language','en'),
    nullif(new.raw_user_meta_data->>'education_level',''),
    nullif(new.raw_user_meta_data->>'career_domain',''));
  if user_role = 'adviser' then
    insert into public.adviser_applications (user_id,full_name,email,domain,experience_years,bio)
    values (new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,
      coalesce(new.raw_user_meta_data->>'career_domain','General'),
      coalesce(nullif(new.raw_user_meta_data->>'experience_years','')::integer,0),
      coalesce(new.raw_user_meta_data->>'bio',''));
  end if;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
alter table public.profiles enable row level security;
alter table public.adviser_applications enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Advisers read own application" on public.adviser_applications;
create policy "Advisers read own application" on public.adviser_applications for select to authenticated using (auth.uid() = user_id);
