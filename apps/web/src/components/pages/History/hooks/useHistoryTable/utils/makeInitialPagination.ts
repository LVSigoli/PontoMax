import type { PaginationMeta } from "@/services/domain"

import { PAGE_SIZE } from "./constants"

export function makeInitialPagination(): PaginationMeta {
  return {
    page: 0,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  }
}
