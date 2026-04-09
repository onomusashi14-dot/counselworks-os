export type UserRole = "attorney" | "staff";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  firmId: string;
}

export type CaseStatus = "intake" | "active" | "discovery" | "negotiation" | "litigation" | "settled" | "closed";

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  client: string;
  type: string;
  status: CaseStatus;
  assignedAttorney: string;
  courtDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = "pending" | "approved" | "in_progress" | "completed" | "denied";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Request {
  id: string;
  title: string;
  description: string;
  caseId: string;
  caseName: string;
  status: RequestStatus;
  priority: Priority;
  requestedBy: string;
  assignedTo: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  caseId: string;
  caseName: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "success" | "urgent";
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  activeCases: number;
  pendingRequests: number;
  documentsThisWeek: number;
  upcomingDeadlines: number;
}
