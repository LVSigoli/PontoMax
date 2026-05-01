export interface HttpRequest {
  recordedAt?: string
  kind?: "ENTRY" | "EXIT"
  timezone?: string
}
