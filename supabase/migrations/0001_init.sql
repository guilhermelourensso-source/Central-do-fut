-- ============================================================
-- CENTRAL DE JOGOS — Schema inicial
-- Rode este arquivo no SQL Editor do seu projeto Supabase
-- (Project > SQL Editor > New query > colar e executar)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- TIMES
-- ------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  name text not null default 'Meu Time',
  city text,
  state text,
  logo_url text,
  primary_color text not null default '#f2c94c',
  secondary_color text not null default '#0a0a0b',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TEMPORADAS
-- ------------------------------------------------------------
create table if not exists public.seasons (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists seasons_team_id_idx on public.seasons(team_id);

-- Garante que só exista uma temporada ativa por time
create or replace function public.ensure_single_active_season()
returns trigger as $$
begin
  if new.is_active then
    update public.seasons
      set is_active = false
      where team_id = new.team_id and id <> new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_single_active_season on public.seasons;
create trigger trg_single_active_season
  after insert or update of is_active on public.seasons
  for each row execute function public.ensure_single_active_season();

-- ------------------------------------------------------------
-- JOGADORES
-- ------------------------------------------------------------
create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  number int,
  position text,
  photo_url text,
  is_guest boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists players_team_id_idx on public.players(team_id);

-- ------------------------------------------------------------
-- GOLEIROS
-- ------------------------------------------------------------
create table if not exists public.goalkeepers (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  photo_url text,
  is_guest boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists goalkeepers_team_id_idx on public.goalkeepers(team_id);

-- ------------------------------------------------------------
-- JOGOS
-- ------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  match_date date not null,
  location text,
  competition text,
  opponent text not null,
  goals_for int not null default 0,
  goals_against int not null default 0,
  goalkeeper_id uuid references public.goalkeepers(id),
  highlight_player_id uuid references public.players(id),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists matches_team_id_idx on public.matches(team_id);
create index if not exists matches_season_id_idx on public.matches(season_id);

-- ------------------------------------------------------------
-- GOLS POR JOGADOR/JOGO
-- ------------------------------------------------------------
create table if not exists public.match_goals (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  goals int not null default 0 check (goals >= 0),
  unique (match_id, player_id)
);

-- ------------------------------------------------------------
-- ASSISTÊNCIAS POR JOGADOR/JOGO
-- ------------------------------------------------------------
create table if not exists public.match_assists (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  assists int not null default 0 check (assists >= 0),
  unique (match_id, player_id)
);

-- ------------------------------------------------------------
-- Criação automática de time + jogador/goleiro "Convidado"
-- quando um novo usuário se cadastra
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_team_id uuid;
  new_season_id uuid;
begin
  insert into public.teams (user_id, name)
    values (new.id, 'Meu Time')
    returning id into new_team_id;

  insert into public.seasons (team_id, name, is_active)
    values (new_team_id, to_char(now(), 'YYYY'), true)
    returning id into new_season_id;

  insert into public.players (team_id, name, is_guest)
    values (new_team_id, 'Convidados', true);

  insert into public.goalkeepers (team_id, name, is_guest)
    values (new_team_id, 'Convidado', true);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.teams enable row level security;
alter table public.seasons enable row level security;
alter table public.players enable row level security;
alter table public.goalkeepers enable row level security;
alter table public.matches enable row level security;
alter table public.match_goals enable row level security;
alter table public.match_assists enable row level security;

-- TEAMS: o usuário só vê/edita o próprio time
create policy "teams_select_own" on public.teams for select using (auth.uid() = user_id);
create policy "teams_update_own" on public.teams for update using (auth.uid() = user_id);
create policy "teams_insert_own" on public.teams for insert with check (auth.uid() = user_id);
create policy "teams_delete_own" on public.teams for delete using (auth.uid() = user_id);

-- Helper: função que confirma se o time pertence ao usuário logado
create or replace function public.is_team_owner(check_team_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.teams where id = check_team_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- SEASONS
create policy "seasons_all_own" on public.seasons for all
  using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- PLAYERS
create policy "players_all_own" on public.players for all
  using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- GOALKEEPERS
create policy "goalkeepers_all_own" on public.goalkeepers for all
  using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- MATCHES
create policy "matches_all_own" on public.matches for all
  using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- MATCH_GOALS (acesso via o time do jogo)
create policy "match_goals_all_own" on public.match_goals for all
  using (exists (select 1 from public.matches m where m.id = match_id and public.is_team_owner(m.team_id)))
  with check (exists (select 1 from public.matches m where m.id = match_id and public.is_team_owner(m.team_id)));

-- MATCH_ASSISTS (acesso via o time do jogo)
create policy "match_assists_all_own" on public.match_assists for all
  using (exists (select 1 from public.matches m where m.id = match_id and public.is_team_owner(m.team_id)))
  with check (exists (select 1 from public.matches m where m.id = match_id and public.is_team_owner(m.team_id)));

-- ------------------------------------------------------------
-- STORAGE: bucket para logos e fotos
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('team-assets', 'team-assets', true)
  on conflict (id) do nothing;

create policy "team_assets_public_read" on storage.objects
  for select using (bucket_id = 'team-assets');

create policy "team_assets_owner_write" on storage.objects
  for insert with check (bucket_id = 'team-assets' and auth.uid() is not null);

create policy "team_assets_owner_update" on storage.objects
  for update using (bucket_id = 'team-assets' and auth.uid() is not null);

create policy "team_assets_owner_delete" on storage.objects
  for delete using (bucket_id = 'team-assets' and auth.uid() is not null);
