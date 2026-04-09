export type UserRole = "attorney" | "staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firmId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type CaseStatus =
  | "intake"
  | "active"
  | "discovery"
  | "negotiation"
  | "litigation"
  | "settled"
  | "closed";

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  status: CaseStatus;
  assignedTo: string;
  assignedToName: string;
  caseType: string;
  courtDate: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export type RequestStatus = "pending" | "approved" | "denied" | "in_progress" | "completed";
export type RequestPriority = "low" | "medium" | "high" | "urgent";

export interface Request {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  requestedBy: string;
  requestedByName: string;
  assignedTo: string | null;
  assignedToName: string | null;
  caseId: string | null;
  caseTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  caseId: string | null;
  caseTitle: string | null;
  uploadedBy: string;
  uploadedByName: string;
  category: "pleading" | "discovery" | "correspondence" | "evidence" | "internal" | "other";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  activeCases: number;
  pendingRequests: number;
  documentsThisWeek: number;
  upcomingDeadlines: number;
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "action" | "success";
  read: boolean;
  createdAt: string;
}
