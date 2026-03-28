type ActiveFilters = {
  nameFilter?: string
  filterItems?: Array<{
    field: string
    value: Array<string>
    relatedType: string
  }>
}

function buildLibraryUrlWithFilters(
  libraryPath: string,
  activeFilters: ActiveFilters,
): string {
  const params = new URLSearchParams()

  if ((activeFilters.nameFilter ?? '') !== '') {
    params.set('nameFilter', activeFilters.nameFilter ?? '')
  }
  if ((activeFilters.filterItems ?? []).length > 0) {
    params.set('filters', JSON.stringify(activeFilters.filterItems ?? []))
  }

  const encodedPath = libraryPath
    .split('/')
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment))
      } catch {
        return encodeURIComponent(segment)
      }
    })
    .join('/')

  const queryString = params.toString()
  return queryString ? `${encodedPath}?${queryString}` : encodedPath
}

export { buildLibraryUrlWithFilters }
export type { ActiveFilters }
