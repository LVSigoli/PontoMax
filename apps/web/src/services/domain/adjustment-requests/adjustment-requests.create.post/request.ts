export interface HttpRequest {
  workdayDate: string
  justification: string
  userId?: number
  records: Array<{
    timeEntryId?: number
    actionType: "CREATE" | "UPDATE" | "DELETE"
    targetKind: "ENTRY" | "EXIT"
    originalRecordedAt?: string
    newRecordedAt?: string
    reason?: string
  }>
}
