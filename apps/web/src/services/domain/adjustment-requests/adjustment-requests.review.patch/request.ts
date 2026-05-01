export interface HttpRequest {
  status: "APPROVED" | "REJECTED"
  reviewNotes?: string
}
