import { includes } from "zod/v4-mini";

export type AnalysisOverview = {
  id: number;
  analysis: AnalysisResult;
  message: string;
  saved: boolean;
}

export type AnalysisResult = {
  analyzed_posts: number;
  anxiety_level: number;
  keywords: string[];
  model_version: string,
  sentiment: string,
  stress_level: number;
  summary: string;
}

export type AnalysisRequest = {
  geographical_region: string;
  start_date: string;
  end_date: string;
  age_range: string;
  topics: string[] | null;
  communities: string[] | null;
  post_count: number;
  save: boolean;
  include_comments: boolean;
}