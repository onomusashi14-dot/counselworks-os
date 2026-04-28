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
  matterNumber?: string;
  matter_number?: string;
  clientName?: string;
  client_name?: string;
  caseType?: string;
  case_type?: string;
  status: CaseStatus;
  phase?: string;
  priority?: "low" | "normal" | "high" | "urgent" | string;
  blocker?: string | null;
  healthStatus?: string;
  health_status?: string;
  openRequests?: number;
  open_requests?: number;
  pendingDrafts?: number;
  pending_drafts?: number;
  primaryAttorneyId?: string;
  primary_attorney_id?: string;
  attorneyId?: string;
  attorney_id?: string;
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
  openedDate?: string;
  opened_date?: string;
};

export type RequestStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "in_progress"
  | "waiting_client"
  | "pending_attorney"
  | "completed"
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
  | "drafted"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "delivered"
  | "sent"
  | string;

export type Draft = {
  id: string;
  title?: string;
  subject?: string;
  type?: string;
  draftType?: string;
  draft_type?: string;
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
  return c.name || c.title || c.clientName || c.client_name || c.matterNumber || c.matter_number || `Case ${c.id.slice(0, 8)}`;
}

export function requestDisplayTitle(r: ClientRequest): string {
  return r.subject || r.title || r.clientName || r.client_name || `Request ${r.id.slice(0, 8)}`;
}

function humanDraftType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function draftDisplayTitle(d: Draft): string {
  return d.title || d.subject || (d.draftType ? humanDraftType(d.draftType) : null) || (d.draft_type ? humanDraftType(d.draft_type) : null) || (d.type ? humanDraftType(d.type) : null) || `Draft ${d.id.slice(0, 8)}`;
}

export function updatedAt(obj: {
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
}): string | undefined {
  return obj.updatedAt ?? obj.updated_at ?? obj.createdAt ?? obj.created_at;
}


export type Lead = {
  id: string;
  subject?: string;
  title?: string;
  clientName?: string;
  client_name?: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  caseType?: string;
  case_type?: string;
  caseId?: string | null;
  case_id?: string | null;
  assigneeId?: string | null;
  assignee_id?: string | null;
  note?: string;
  message?: string;
  body?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

export function leadDisplayTitle(l: Lead): string {
  return l.subject || l.title || l.clientName || l.client_name || l.email || `Lead ${l.id.slice(0, 8)}`;
}

export type CWFile = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  documentType: string;
  status: string;
  reviewStatus?: string;
  createdAt: string;
  uploadedBy: string;
  entityType?: string | null;
  entityId?: string | null;
  linkId?: string | null;
  linkedAt?: string | null;
};
