-- V3 Bracket Coupe du Monde
-- Garde les comptes/profils existants. Ajoute les champs du tableau final.

alter table matches add column if not exists hidden boolean not null default false;
alter table matches add column if not exists bracket_round text check (bracket_round in ('r32','r16','qf','sf','f'));
alter table matches add column if not exists match_number int unique;
alter table matches add column if not exists next_match_number int;
alter table matches add column if not exists next_slot text check (next_slot in ('home','away'));
alter table matches add column if not exists penalties boolean not null default false;
alter table matches add column if not exists penalty_winner text check (penalty_winner in ('home','away'));

alter table predictions add column if not exists pred_penalties boolean not null default false;

create or replace function public.prediction_points(
  pick text,
  pred_home int,
  pred_away int,
  pred_penalties boolean,
  home_score int,
  away_score int,
  official_penalties boolean,
  official_penalty_winner text
)
returns int language plpgsql immutable as $$
declare
  result_pick text;
  total int := 0;
begin
  if home_score is null or away_score is null then
    return 0;
  end if;

  if home_score > away_score then
    result_pick := 'home';
  elsif home_score < away_score then
    result_pick := 'away';
  elsif official_penalties and official_penalty_winner in ('home','away') then
    result_pick := official_penalty_winner;
  else
    result_pick := 'draw';
  end if;

  if pick = result_pick then
    total := total + 1;
  end if;

  if pred_home is not null and pred_away is not null and pred_home = home_score and pred_away = away_score then
    total := total + 2;
  end if;

  if pred_penalties then
    if official_penalties and pick = result_pick then
      total := total + 2;
    else
      total := total - 1;
    end if;
  end if;

  return total;
end;$$;

create or replace function public.calculate_all_points()
returns void language sql security definer as $$
  update predictions p
  set points = public.prediction_points(
    p.pick,
    p.pred_home,
    p.pred_away,
    coalesce(p.pred_penalties,false),
    m.home_score,
    m.away_score,
    coalesce(m.penalties,false),
    m.penalty_winner
  )
  from matches m
  where p.match_id = m.id
  and m.status = 'finished';
$$;

-- reset des points pour repartir avec les nouvelles règles
update predictions set points = 0;
select public.calculate_all_points();

-- Policies admin utiles pour gérer le tableau depuis le site
drop policy if exists "admins can manage matches" on matches;
create policy "admins can manage matches"
on matches
for all
to authenticated
using (
  exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
)
with check (
  exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

drop policy if exists "admins can manage predictions" on predictions;
create policy "admins can manage predictions"
on predictions
for all
to authenticated
using (
  exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
)
with check (
  exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);


drop policy if exists "predictions update own before lock" on predictions;
create policy "predictions update own before lock"
on predictions
for update
to authenticated
using (
  auth.uid() = user_id
  and exists(select 1 from matches m where m.id = match_id and m.kickoff_at > now() + interval '10 minutes')
)
with check (
  auth.uid() = user_id
  and exists(select 1 from matches m where m.id = match_id and m.kickoff_at > now() + interval '10 minutes')
);
