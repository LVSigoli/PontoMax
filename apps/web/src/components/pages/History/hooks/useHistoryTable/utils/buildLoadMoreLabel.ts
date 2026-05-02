interface Params {
  hasMore: boolean
  isInitialLoading: boolean
  isLoadingMore: boolean
}

export function buildLoadMoreLabel({
  hasMore,
  isInitialLoading,
  isLoadingMore,
}: Params) {
  if (isInitialLoading) {
    return "Carregando historico..."
  }

  if (isLoadingMore) {
    return "Carregando mais registros..."
  }

  if (hasMore) {
    return "Role para carregar mais"
  }

  return "Todos os registros foram carregados"
}
