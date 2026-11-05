export type UserRole = "buyer" | "reporter" | "admin";

export type IdentifierType = "bank_account" | "whatsapp";

export type ReportStatus = "pending" | "approved" | "rejected";

export interface BlacklistEntry {
  readonly id: string;
  readonly identifierType: IdentifierType;
  readonly identifierValue: string;
  readonly status: "blacklisted";
  readonly reportCount: number;
  readonly chronologySummary: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SearchQueryResult {
  readonly found: boolean;
  readonly query: string;
  readonly identifierType: IdentifierType;
  readonly entry: BlacklistEntry | null;
}
