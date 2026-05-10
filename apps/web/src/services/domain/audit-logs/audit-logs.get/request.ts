export interface HttpRequest {
  companyId?: number
  actorUserId?: number
  entityType?: string
  action?: string
  entityId?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
