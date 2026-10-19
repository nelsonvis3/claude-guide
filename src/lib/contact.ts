export const CONTACT_TYPES = ["query", "complaint", "suggestion", "other"] as const;
export type ContactState = { status: "idle" | "sent" | "invalid" | "unavailable" | "error" };
