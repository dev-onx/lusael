export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'studio';
export type IntentType = 'buy' | 'rent' | 'invest';
export type District = 'Marina District' | 'Fox Hills' | 'Energy City' | 'Qetaifan Island' | 'Al Erkyah';

export interface Property {
  id: string;
  title: string;
  district: District;
  price_qar: number;
  rent_monthly_qar: number;
  bedrooms: number;
  bathrooms: number;
  size_sqm: number;
  property_type: PropertyType;
  view: string;
  year_built: number;
  amenities: string[];
  distance_to_metro_m: number;
  distance_to_west_bay_km: number;
  description: string;
  image_url: string;
  rental_yield_pct: number;
  price_trend_1yr_pct: number;
  developer: string;
}

export interface UserBrief {
  intent: IntentType;
  budget_min: number;
  budget_max: number;
  bedrooms: number | null;
  lifestyle_tags: string[];
  commute_anchor: string | null;
  investment_focus: boolean;
  timeline: string;
}

export interface ScoreResult {
  lifestyle_score: number;
  lifestyle_justification: string;
  investment_score: number;
  investment_explanation: string;
  combined_score: number;
  why_this_one: string;
}

export interface ScoredProperty extends Property {
  scores: ScoreResult;
  is_wildcard?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IntakeResponse {
  message: string;
  brief?: UserBrief;
  is_complete: boolean;
}

export interface RecommendationsRequest {
  brief: UserBrief;
  offset?: number;
  mode?: 'standard' | 'more' | 'wildcards';
}

export interface CompareRequest {
  property_ids: string[];
  brief: UserBrief;
}

export interface SSEChunk {
  type: 'delta' | 'done' | 'error' | 'brief';
  content?: string;
  brief?: UserBrief;
  error?: string;
}
