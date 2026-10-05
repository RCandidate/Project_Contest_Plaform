export type Role = 'participant' | 'expert' | 'moderator' | 'admin';

export interface Contest {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'admitted'
  | 'winner'
  | 'runner_up';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  university?: string;
  faculty?: string;
  department?: string;
  course?: number;
  city?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
  position?: string;
  bio?: string;
  isExpertVisible?: boolean;
  isEmailVerified?: boolean;
}

export interface Nomination {
  id: string;
  name: string;
  description?: string;
  shortName?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TeamMember {
  name: string;
  role: string;
  email?: string;
}

export interface Supervisor {
  name: string;
  title: string;
  email?: string;
}

export interface AppFile {
  id: string;
  originalName: string;
  size: number;
  category: string;
  createdAt: string;
}

export interface ApplicationLog {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  comment?: string;
  changedById: string;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  nominationId: string;
  nomination?: Nomination;
  projectTitle: string;
  projectDescription: string;
  keywords?: string[];
  teamMembers?: TeamMember[];
  supervisor?: Supervisor;
  status: ApplicationStatus;
  adminComment?: string;
  submittedAt?: string;
  files?: AppFile[];
  logs?: ApplicationLog[];
  user?: User;
  contestId?: string;
  contest?: Contest;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  contestId?: string;
  contest?: Contest;
  createdAt: string;
  isPinned: boolean;
}

export interface Document {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  category?: string;
  isPublished: boolean;
  sortOrder: number;
  contestId?: string;
  contest?: Contest;
  createdAt: string;
  updatedAt: string;
}

export interface Winner {
  id: string;
  projectTitle: string;
  teamName: string;
  description?: string;
  year?: number;
  place: number;
  nomination?: Nomination;
  nominationId: string;
  photoUrl?: string;
  university?: string;
  contestId?: string;
  contest?: Contest;
}

export interface AnalyticsSummary {
  totalApplications: number;
  totalUsers: number;
  totalUniversities: number;
  newThisWeek: number;
  underReview: number;
  teamApplications: number;
  avgTeamSize: number;
}

export interface AnalyticsByStatus { status: string; count: number; }
export interface AnalyticsActivityItem {
  id: string;
  toStatus: string;
  fromStatus: string | null;
  createdAt: string;
  projectTitle: string;
  userName: string;
  nominationName: string;
}

export interface AnalyticsByNomination { nomination: string; count: number; }
export interface AnalyticsTimeline { date: string; count: number; }
export interface AnalyticsTopUniversity { university: string; count: number; }
export interface AnalyticsGeography { city: string; count: number; }
export interface AnalyticsKeyword { keyword: string; count: number; }

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateApplicationDto {
  nominationId: string;
  projectTitle: string;
  projectDescription: string;
  keywords?: string[];
  teamMembers?: TeamMember[];
  supervisor?: Supervisor;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Черновик',
  submitted: 'На проверке',
  accepted: 'Принята',
  rejected: 'Отклонена',
  admitted: 'Допущена к очному этапу',
  winner: 'Победитель',
  runner_up: 'Призёр',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  admitted: 'bg-blue-100 text-blue-800',
  winner: 'bg-purple-100 text-purple-800',
  runner_up: 'bg-indigo-100 text-indigo-800',
};

export type ContactMessageStatus = 'pending' | 'done';

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}
