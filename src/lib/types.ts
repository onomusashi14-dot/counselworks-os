export type Firm = {
  id: string;
  name: string;
  domain?: string;
};

export type CaseStatus =
  | "intake"
  | "active"
  | "blocked"
  | "awaiting_client"
  | "in_review"
  | "closed"
  | string;

export type Case = {
  id: string;
  name?: string;
  title?: string;
  clientName?: string;
  client_name?: string;
  status: CaseStatus;
  priority?: "low" | "normal" | "high" | "urgent" | string;
  blocker?: string | null;
  openRequests?: number;
  open_requests?: number;
  pendingDrafts?: number;
  pending_drafts?: number;
  attorneyId?: string;
  attorney_id?: string;
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
};

export type RequestStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "in_progress"
  | "waiting_client"
  | "closed"
  | string;

export type ClientRequest = {
  id: string;
  subject?: string;
  title?: string;
  clientName?: string;
  client_name?: string;
  email?: string;
  status: RequestStatus;
  caseId?: string | null;
  case_id?: string | null;
  assigneeId?: string | null;
  assignee_id?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

export type DraftStatus =
  | "drafting"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "sent"
  | string;

export type Draft = {
  id: string;
  title?: string;
  subject?: string;
  type?: string;
  caseId?: string | null;
  case_id?: string | null;
  status: DraftStatus;
  authorId?: string;
  author_id?: string;
  authorName?: string;
  author_name?: string;
  body?: string;
  content?: string;
  summary?: string;
  rejectionReason?: string;
  rejection_reason?: string;
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
};

export type Notification = {
  id: string;
  kind?: string;
  type?: string;
  title?: string;
  message?: string;
  body?: string;
  readAt?: string | null;
  read_at?: string | null;
  createdAt?: string;
  created_at?: string;
  url?: string;
  link?: string;
};

export function caseDisplayName(c: Case): string {
  return c.name || c.title || c.clientName || c.client_name || `Case ${c.id}`;
}

export function requestDisplayTitle(r: ClientRequest): string {
  return r.subject || r.title || r.clientName || r.client_name || `Request ${r.id}`;
}

export function draftDisplayTitle(d: Draft): string {
  return d.title || d.subject || `Draft ${d.id}`;
}

export function updatedAt(obj: {
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
}): string | undefined {
  return obj.updatedAt ?? obj.updated_at ?? obj.createdAt ?? obj.created_at;
}
