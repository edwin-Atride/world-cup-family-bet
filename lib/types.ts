export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type PredictionPick = 'home' | 'draw' | 'away';
export type Profile = { id:string; email:string | null; username:string; role:'admin'|'user'; total_points:number; created_at:string };
export type Match = { id:string; api_fixture_id:number | null; home_team:string; away_team:string; home_logo:string | null; away_logo:string | null; kickoff_at:string; venue:string | null; status:MatchStatus; home_score:number | null; away_score:number | null; round:string | null; updated_at:string; hidden?:boolean; penalties:boolean; penalty_winner?:'home'|'away'|null; bracket_round?:'r32'|'r16'|'qf'|'sf'|'f'|null; match_number?:number|null; next_match_number?:number|null; next_slot?:'home'|'away'|null };
export type Prediction = { id:string; user_id:string; match_id:string; pick:PredictionPick; pred_home:number | null; pred_away:number | null; pred_penalties:boolean; points:number; created_at:string };
export type LeaderboardRow = { user_id:string; username:string; total_points:number; exact_scores:number; correct_results:number; predictions_count:number };
