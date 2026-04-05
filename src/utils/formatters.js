export function formatDateTime(isoValue) {
  if (!isoValue) return '-'
  return new Date(isoValue).toLocaleString()
}
