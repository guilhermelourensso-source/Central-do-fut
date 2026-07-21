export type Team = {
  id: string
  user_id: string
  name: string
  city: string | null
  state: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  created_at: string
  updated_at: string
}

export type Season = {
  id: string
  team_id: string
  name: string
  is_active: boolean
  created_at: string
}

export type Player = {
  id: string
  team_id: string
  name: string
  number: number | null
  position: string | null
  photo_url: string | null
  is_guest: boolean
  created_at: string
}

export type Goalkeeper = {
  id: string
  team_id: string
  name: string
  photo_url: string | null
  is_guest: boolean
  created_at: string
}

export type Match = {
  id: string
  team_id: string
  season_id: string
  match_date: string
  location: string | null
  competition: string | null
  opponent: string
  goals_for: number
  goals_against: number
  goalkeeper_id: string | null
  highlight_player_id: string | null
  notes: string | null
  created_at: string
}

export type MatchGoal = {
  id: string
  match_id: string
  player_id: string
  goals: number
}

export type MatchAssist = {
  id: string
  match_id: string
  player_id: string
  assists: number
}

export type MatchWithDetails = Match & {
  match_goals: (MatchGoal & { players: Pick<Player, 'id' | 'name' | 'is_guest'> })[]
  match_assists: (MatchAssist & { players: Pick<Player, 'id' | 'name' | 'is_guest'> })[]
  goalkeeper: Pick<Goalkeeper, 'id' | 'name'> | null
  highlight_player: Pick<Player, 'id' | 'name'> | null
}

export interface Database {
  public: {
    Tables: {
      teams: { Row: Team; Insert: Partial<Team>; Update: Partial<Team> }
      seasons: { Row: Season; Insert: Partial<Season>; Update: Partial<Season> }
      players: { Row: Player; Insert: Partial<Player>; Update: Partial<Player> }
      goalkeepers: { Row: Goalkeeper; Insert: Partial<Goalkeeper>; Update: Partial<Goalkeeper> }
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> }
      match_goals: { Row: MatchGoal; Insert: Partial<MatchGoal>; Update: Partial<MatchGoal> }
      match_assists: { Row: MatchAssist; Insert: Partial<MatchAssist>; Update: Partial<MatchAssist> }
    }
  }
}
