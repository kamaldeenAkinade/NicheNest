export type TimeRange = '24hours' | 'week' | 'month' | '3months';

export interface Keyword {
  keyword: string;
  volume: number;
  revenue: string;
}

export interface KeywordDetails {
  relatedKeywords: {
    keyword: string;
    volume: number;
    type: 'short' | 'long';
    competitors: number;
  }[];
  profitableTopics: string[];
  authorTips: string[];
}
