-- Migration scoring V2 à exécuter dans Supabase SQL Editor
-- Garde les comptes, profils, matchs et pronostics existants.

alter table matches
add column if not exists hidden boolean not null default false;

alter table matches
add column if not exists penalties boolean not null default false;

alter table predictions
add column if not exists pred_penalties boolean not null default false;

-- Reset complet des points existants avant le nouveau calcul.
update predictions set points = 0;

-- Nouvelle règle :
-- bon choix = 1 point
-- score exact = 2 points
-- penaltys prédits oui + match avec penaltys = +2 points
-- penaltys prédits oui + match sans penaltys = -1 point
-- pas de prediction penalty = 0 point bonus/malus
create or replace function public.prediction_points(
  pick text,
  pred_home int,
  pred_away int,
  pred_penalties boolean,
  home_score int,
  away_score int,
  match_penalties boolean
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
  else
    result_pick := 'draw';
  end if;

  if pick = result_pick then
    total := total + 1;
  end if;

  if pred_home is not null
    and pred_away is not null
    and pred_home = home_score
    and pred_away = away_score then
    total := total + 2;
  end if;

  if pred_penalties then
    if match_penalties then
      total := total + 2;
    else
      total := total - 1;
    end if;
  end if;

  return total;
end;
$$;

create or replace function public.calculate_all_points()
returns void language sql security definer as $$
  update predictions p
  set points = public.prediction_points(
    p.pick,
    p.pred_home,
    p.pred_away,
    coalesce(p.pred_penalties, false),
    m.home_score,
    m.away_score,
    coalesce(m.penalties, false)
  )
  from matches m
  where p.match_id = m.id
    and m.status = 'finished';
$$;

create or replace view leaderboard as
select
  prof.id as user_id,
  prof.username,
  coalesce(sum(pr.points), 0)::int as total_points,
  count(pr.*) filter (
    where m.status = 'finished'
      and pr.pred_home is not null
      and pr.pred_away is not null
      and pr.pred_home = m.home_score
      and pr.pred_away = m.away_score
  )::int as exact_scores,
  count(pr.*) filter (where pr.points > 0)::int as correct_results,
  count(pr.*)::int as predictions_count
from profiles prof
left join predictions pr on pr.user_id = prof.id
left join matches m on m.id = pr.match_id
group by prof.id, prof.username;

-- Recalcule immédiatement avec les nouvelles règles.
select public.calculate_all_points();
