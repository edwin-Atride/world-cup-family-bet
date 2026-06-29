-- À exécuter dans Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text not null,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  api_fixture_id bigint unique,
  home_team text not null,
  away_team text not null,
  home_logo text,
  away_logo text,
  kickoff_at timestamptz not null,
  venue text,
  status text not null default 'upcoming' check (status in ('upcoming','live','finished')),
  home_score int,
  away_score int,
  round text,
  updated_at timestamptz default now(),
  hidden boolean not null default false,
  penalties boolean not null default false
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  pick text not null check (pick in ('home','draw','away')),
  pred_home int check (pred_home is null or pred_home >= 0),
  pred_away int check (pred_away is null or pred_away >= 0),
  pred_penalties boolean not null default false,
  points int not null default 0,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id,email,username,role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1)),case when lower(new.email)=lower(current_setting('app.admin_email', true)) then 'admin' else 'user' end)
  on conflict (id) do nothing;
  return new;
end;$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.prediction_points(pick text, pred_home int, pred_away int, pred_penalties boolean, home_score int, away_score int, match_penalties boolean, match_penalty_winner text)
returns int language plpgsql immutable as $$
declare result_pick text; total int := 0;
begin
  if home_score is null or away_score is null then return 0; end if;
  if home_score > away_score then result_pick := 'home';
  elsif home_score < away_score then result_pick := 'away';
  elsif match_penalties and match_penalty_winner in ('home','away') then result_pick := match_penalty_winner;
  else result_pick := 'draw'; end if;
  if pick = result_pick then total := total + 1; end if;
  if pred_home is not null and pred_away is not null and pred_home = home_score and pred_away = away_score then total := total + 2; end if;
  if pred_penalties then
    if match_penalties and pick = result_pick then total := total + 2; else total := total - 1; end if;
  end if;
  return total;
end;$$;

create or replace function public.calculate_all_points()
returns void language sql security definer as $$
  update predictions p set points = public.prediction_points(p.pick,p.pred_home,p.pred_away,coalesce(p.pred_penalties,false),m.home_score,m.away_score,coalesce(m.penalties,false),m.penalty_winner)
  from matches m where p.match_id=m.id and m.status='finished';
$$;

create or replace view leaderboard as
select p.id as user_id, p.username, coalesce(sum(pr.points),0)::int as total_points,
  count(pr.*) filter (where m.status='finished' and pr.pred_home is not null and pr.pred_away is not null and pr.pred_home=m.home_score and pr.pred_away=m.away_score)::int as exact_scores,
  count(pr.*) filter (where pr.points>0)::int as correct_results,
  count(pr.*)::int as predictions_count
from profiles p
left join predictions pr on pr.user_id=p.id
left join matches m on m.id=pr.match_id
group by p.id,p.username;

alter table profiles enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;

create policy "profiles read all" on profiles for select using (true);
create policy "profiles update own username" on profiles for update using (auth.uid()=id) with check (auth.uid()=id);
create policy "matches read all" on matches for select using (true);
create policy "predictions read own" on predictions for select using (auth.uid()=user_id);
create policy "predictions insert own before kickoff" on predictions for insert with check (
  auth.uid()=user_id and exists(select 1 from matches m where m.id=match_id and m.kickoff_at > now() + interval '10 minutes')
);
create policy "predictions update own before lock" on predictions for update using (
  auth.uid()=user_id and exists(select 1 from matches m where m.id=match_id and m.kickoff_at > now() + interval '10 minutes')
) with check (
  auth.uid()=user_id and exists(select 1 from matches m where m.id=match_id and m.kickoff_at > now() + interval '10 minutes')
);

-- Les paris sont modifiables jusqu'à 10 minutes avant le coup d'envoi.

-- IMPORTANT : après avoir créé ton compte admin, exécute cette ligne en remplaçant l'email :
-- update profiles set role='admin' where email='ton-email-admin@example.com';
