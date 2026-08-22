create extension if not exists pgcrypto;

create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;
alter table public.admin_users enable row level security;
drop policy if exists admin_self_read on public.admin_users;
create policy admin_self_read on public.admin_users for select using (user_id = auth.uid());

create table if not exists public.profiles (id uuid primary key default gen_random_uuid(), name text not null, headline text, bio text, profile_photo_url text, location text, email text, phone text, resume_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), title text not null, short_description text, description text, thumbnail_url text, github_url text, live_url text, technologies text[] not null default '{}', category text, start_date date, end_date date, featured boolean not null default false, published boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.project_images (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, storage_path text not null, alt_text text, display_order integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.certifications (id uuid primary key default gen_random_uuid(), title text not null, organization text, issue_date date, credential_id text, credential_url text, certificate_url text, description text, featured boolean not null default false, published boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.gallery (id uuid primary key default gen_random_uuid(), image_url text not null, title text, caption text, category text, date date, featured boolean not null default false, published boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.achievements (id uuid primary key default gen_random_uuid(), title text not null, description text, organization text, date date, image_url text, url text, featured boolean not null default false, published boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.experiences (id uuid primary key default gen_random_uuid(), organization text not null, position text not null, location text, start_date date, end_date date, currently_working boolean not null default false, description text, technologies text[], document_url text, organization_url text, published boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.education (id uuid primary key default gen_random_uuid(), institution text not null, degree text not null, branch text, start_year integer, end_year integer, grade text, description text, logo_url text, published boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.skills (id uuid primary key default gen_random_uuid(), name text not null, category text not null, level integer check (level between 0 and 100), published boolean not null default true, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.social_links (id uuid primary key default gen_random_uuid(), profile_id uuid references public.profiles(id) on delete cascade, label text not null, url text not null, display_order integer not null default 0);
create table if not exists public.site_settings (key text primary key, value jsonb not null default '{}', updated_at timestamptz not null default now());
create table if not exists public.contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null check (position('@' in email) > 1), subject text, message text not null, is_read boolean not null default false, created_at timestamptz not null default now());

create index if not exists projects_published_order on public.projects(published, display_order);
create index if not exists gallery_published_order on public.gallery(published, display_order);
create index if not exists contact_messages_created on public.contact_messages(created_at desc);

-- Public reads are limited to published content. Admin writes require admin_users membership.
do $$ declare table_name text; begin foreach table_name in array array['profiles','projects','project_images','certifications','gallery','achievements','experiences','education','skills','social_links','site_settings','contact_messages'] loop execute format('alter table public.%I enable row level security', table_name); execute format('drop policy if exists public_read on public.%I', table_name); execute format('drop policy if exists admin_all on public.%I', table_name); end loop; end $$;
create policy public_read on public.profiles for select using (true);
create policy public_read on public.projects for select using (published = true);
create policy public_read on public.project_images for select using (exists (select 1 from projects p where p.id = project_id and p.published));
create policy public_read on public.certifications for select using (published = true);
create policy public_read on public.gallery for select using (published = true);
create policy public_read on public.achievements for select using (published = true);
create policy public_read on public.experiences for select using (published = true);
create policy public_read on public.education for select using (published = true);
create policy public_read on public.skills for select using (published = true);
create policy public_read on public.social_links for select using (true);
create policy public_read on public.site_settings for select using (true);
create policy admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.projects for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.project_images for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.certifications for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.gallery for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.achievements for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.experiences for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.education for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.skills for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.social_links for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.contact_messages for select, update, delete using (public.is_admin()) with check (public.is_admin());
create policy public_insert_contact on public.contact_messages for insert with check (length(name) between 1 and 120 and length(message) between 1 and 5000);

insert into storage.buckets (id, name, public) values ('portfolio-images','portfolio-images',true),('certificates','certificates',true),('gallery','gallery',true),('resume','resume',true) on conflict (id) do nothing;
create policy storage_public_read on storage.objects for select using (bucket_id in ('portfolio-images','certificates','gallery','resume'));
create policy storage_admin_insert on storage.objects for insert with check (public.is_admin() and bucket_id in ('portfolio-images','certificates','gallery','resume'));
create policy storage_admin_update on storage.objects for update using (public.is_admin()) with check (public.is_admin());
create policy storage_admin_delete on storage.objects for delete using (public.is_admin());
