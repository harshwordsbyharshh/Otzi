export const ALLOWED_DISCIPLINES = [
  "Social Media Management & Marketing",
  "AI Agents",
  "Paid Ad Management",
  "Google Business Profile Management",
  "SEO Management",
  "Creative Production",
] as const;

export type AllowedDiscipline = (typeof ALLOWED_DISCIPLINES)[number];

export type LeadStatus = "new" | "contacted" | "archived";

export interface LeadRecord {
  id: string;
  full_name: string;
  organization: string | null;
  email: string;
  disciplines: string[];
  details: string;
  status: LeadStatus;
  created_at: string;
}

export interface LeadInput {
  full_name: string;
  organization?: string | null;
  email: string;
  disciplines: string[];
  details: string;
}

export type LeadFilterStatus = "all" | LeadStatus;

export interface LeadActionResult {
  success: boolean;
  error?: string;
  lead?: LeadRecord;
}
