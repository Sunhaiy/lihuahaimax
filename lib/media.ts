export function resolveMediaUrl(
  primary?: string | null,
  fallback?: string | null
) {
  return primary || fallback || null
}
