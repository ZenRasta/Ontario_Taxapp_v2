export interface SpouseInfo {
  age: number;
  rrsp_balance: number;
  other_income?: number;
  cpp_at_65?: number;
  oas_at_65?: number;
  tfsa_balance?: number;
  defined_benefit_pension?: number;
}

export interface StrategyParamsInput {
  bracket_fill_ceiling?: number;
  lump_sum_amount?: number;
  lump_sum_year_offset?: number;
  target_depletion_age?: number;
  cpp_start_age?: number;
  oas_start_age?: number;
  interest_rate?: number;
  loan_pct_rrif?: number;
  spouse?: SpouseInfo;
}


export type GoalEnum =
  | 'minimize_tax'
  | 'maximize_spending'
  | 'preserve_estate'
  | 'simplify';

export interface StrategyMeta {
  code: string;
  label: string;
  blurb: string;
  default_complexity: number;
  typical_goals: string[];
}

export interface StrategiesResponse {
  strategies: StrategyMeta[];
  recommended: string[];
}

