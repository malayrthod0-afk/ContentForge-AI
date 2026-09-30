export type PlatformName = 'Instagram' | 'LinkedIn' | 'X' | 'Facebook' | 'YouTube';

export interface EventItem {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  speaker: string;
  topics?: string;
  image_url?: string;
  attended?: number | boolean;
  created_at?: string;
}

export interface FeedbackItem {
  id: string;
  event_id: string;
  feedback_text: string;
  rating: number;
  created_at: string;
  event_name?: string;
  event_date?: string;
  event_location?: string;
  event_speaker?: string;
}

export interface VariationItem {
  style: 'Professional' | 'Engaging' | 'Storytelling';
  hook: string;
  content: string;
  hashtags: string[];
  cta: string;
  scoreAuthenticity: number;
  scoreEngagement: number;
  scorePlatformFit: number;
  whyThisWorks: string;
}

export interface PlatformResult {
  platform: string;
  variations: VariationItem[];
}
