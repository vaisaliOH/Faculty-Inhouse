export interface Faculty {
  id: string;
  name: string;
  email: string;
}

export interface Venue {
  venue: string;
  slot?: string;
  timeOfVisit?: string;
  feedback?: string;
  isSubmitted?: boolean;
}

export interface ScheduleData {
  venue: string;
  slot: string;
  timeOfVisit: string;
}

export interface FeedbackSubmission {
  venue: string;
  slot: string;
  feedback: string;
  timestamp: string;
}

export interface AdminFeedback {
  venue: string;
  slot: string;
  timeOfVisit: string;
  timeEntered: string;
  feedback: string;
}

export interface AuditCheck {
  hasAudit: boolean;
  dayOrder?: number;
  date?: string;
}