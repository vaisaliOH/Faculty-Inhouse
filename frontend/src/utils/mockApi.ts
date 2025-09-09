import { Faculty, Venue, ScheduleData, AdminFeedback, AuditCheck } from '../types';

// Mock data
const mockFaculties: Faculty[] = [
  { id: 'F101', name: 'Dr. Jane Smith', email: 'jane.smith@university.edu' },
  { id: 'F102', name: 'Prof. John Doe', email: 'john.doe@university.edu' },
  { id: 'F103', name: 'Dr. Alice Johnson', email: 'alice.johnson@university.edu' },
];

const mockVenues: Venue[] = [
  { venue: 'TP401' },
  { venue: 'TP402' },
  { venue: 'Lab-CS1' },
  { venue: 'Seminar Hall' },
];

const mockScheduleData: ScheduleData[] = [
  { venue: 'TP401', slot: 'A', timeOfVisit: '08:00 - 08:50' },
  { venue: 'TP402', slot: 'B', timeOfVisit: '09:00 - 09:50' },
  { venue: 'Lab-CS1', slot: 'C', timeOfVisit: '10:00 - 10:50' },
  { venue: 'Seminar Hall', slot: 'D', timeOfVisit: '11:00 - 11:50' },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Faculty login
  loginFaculty: async (facultyId: string, email: string): Promise<Faculty> => {
    await delay(1000);
    const faculty = mockFaculties.find(f => f.id === facultyId && f.email === email);
    if (!faculty) {
      throw new Error('Invalid credentials');
    }
    return faculty;
  },

  // Admin login
  loginAdmin: async (facultyId: string, email: string, password: string): Promise<Faculty> => {
    await delay(1000);
    if (password !== 'admin123') {
      throw new Error('Invalid password');
    }
    const faculty = mockFaculties.find(f => f.id === facultyId && f.email === email);
    if (!faculty) {
      throw new Error('Invalid credentials');
    }
    return faculty;
  },

  // Check if audit is scheduled
  checkAuditSchedule: async (): Promise<AuditCheck> => {
    await delay(500);
    // Simulate random audit assignment (80% chance of having audit)
    const hasAudit = Math.random() > 0.2;
    return {
      hasAudit,
      dayOrder: hasAudit ? Math.floor(Math.random() * 5) + 1 : undefined,
      date: hasAudit ? new Date().toISOString().split('T')[0] : undefined,
    };
  },

  // Get venues for faculty
  getVenues: async (dayOrder: number): Promise<Venue[]> => {
    await delay(800);
    return [...mockVenues];
  },

  // Get schedule for batch
  getSchedule: async (dayOrder: number, batch: number): Promise<ScheduleData[]> => {
    await delay(600);
    return [...mockScheduleData];
  },

  // Submit feedback
  submitFeedback: async (feedback: any): Promise<{ success: boolean }> => {
    await delay(1000);
    console.log('Feedback submitted:', feedback);
    return { success: true };
  },

  // Get faculty by day
  getFacultyByDay: async (dayOrder: number): Promise<Faculty[]> => {
    await delay(700);
    return [...mockFaculties];
  },

  // Get feedback for faculty
  getFeedbackForFaculty: async (dayOrder: number, facultyId: string): Promise<AdminFeedback[]> => {
    await delay(900);
    return [
      {
        venue: 'TP401',
        slot: 'A',
        timeOfVisit: '08:00 - 08:50',
        timeEntered: '2025-01-15T09:30:00Z',
        feedback: 'Class was on time. Good student engagement.',
      },
      {
        venue: 'TP402',
        slot: 'B',
        timeOfVisit: '09:00 - 09:50',
        timeEntered: '2025-01-15T10:15:00Z',
        feedback: 'Excellent lecture delivery. Interactive session.',
      },
    ];
  },
};