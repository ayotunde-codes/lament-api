export const REVIEW_TAGS = [
  'Compensation',
  'Management',
  'Work-life',
  'Culture',
  'Hiring',
  'Onboarding',
  'Growth',
  'Exit',
  'Day-to-day',
] as const;

export type ReviewTag = (typeof REVIEW_TAGS)[number];
