export interface TimeRecordLocationPayload {
  latitude: number
  longitude: number
  accuracyMeters?: number
}

export interface HttpRequest {
  recordedAt?: string
  kind?: "ENTRY" | "EXIT"
  timezone?: string
  location?: TimeRecordLocationPayload
}
