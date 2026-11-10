export type Role = "participant" | "expert" | "moderator" | "admin" | "employer";

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


// ─── Банк работ ──────────────────────────────────────────────────────────────

export interface BankProject {
  id: string;
  title: string;
  summary: string;
  description?: string;
  keywords: string[];
  nomination: { id: string; name: string; shortName?: string } | null;
  contest: { id: string; name: string } | null;
  status: ApplicationStatus;
  teamSize: number;
  createdAt: string;
}

export type BankTopicStatus =
  | "pending"
  | "published"
  | "taken"
  | "rejected"
  | "archived";

export interface BankTopic {
  id: string;
  title: string;
  description: string;
  organization: string;
  status?: BankTopicStatus;
  moderationComment?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export type BankOfferStatus = 'new' | 'viewed' | 'accepted' | 'declined';

export interface BankOffer {
  id: string;
  applicationId: string;
  message: string;
  status: BankOfferStatus;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  application?: { id: string; projectTitle: string };
  employer?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export type BankCommentAuthorKind = "employer" | "owner" | "staff" | "unknown";

export interface BankComment {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string } | null;
  authorKind: BankCommentAuthorKind;
}

export const BANK_COMMENT_AUTHOR_LABELS: Record<BankCommentAuthorKind, string> =
  {
    employer: "Работодатель",
    owner: "Автор проекта",
    staff: "Модератор",
    unknown: "",
  };


export const BANK_TOPIC_STATUS_LABELS: Record<BankTopicStatus, string> = {
  pending: "На модерации",
  published: "Опубликована",
  rejected: "Отклонена",
  archived: "В архиве",
  taken: "Занята",
};

export const BANK_TOPIC_STATUS_COLORS: Record<BankTopicStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-gray-100 text-gray-700",
  taken: "bg-gray-200 text-gray-700",
};

export const BANK_OFFER_STATUS_LABELS: Record<BankOfferStatus, string> = {
  new: 'Новое',
  viewed: 'Просмотрено',
  accepted: 'Принято',
  declined: 'Отклонено',
};

export const BANK_OFFER_STATUS_COLORS: Record<BankOfferStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  viewed: 'bg-gray-100 text-gray-700',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

// ─── Оценки экспертов ────────────────────────────────────────────────────────

export interface ScoreQuality {
  code: string;
  label: string;
}

export interface Score {
  applicationId: string;
  expertId: string;
  points: number;
  qualities: string[];
  specialOpinion: string | null;
}

export interface ScoreMatrix {
  experts: { id: string; firstName: string; lastName: string }[];
  projects: { id: string; projectTitle: string; nomination: string | null }[];
  scores: Score[];
}
