import { PAGE_SIZE } from "./constants"

export function makeInitialPagination() {
  return {
    page: 0,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  }
}
