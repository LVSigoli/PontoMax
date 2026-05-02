export function normalizeWorkdayDate(date: string) {
  const matchedDate = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0]

  if (matchedDate) {
    return matchedDate
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return ""
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
  const day = String(parsedDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
