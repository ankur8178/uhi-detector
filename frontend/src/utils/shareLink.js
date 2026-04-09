/**
 * Builds a shareable URL with ?city= param and copies it to clipboard.
 * Returns { url, copied: true } on success.
 */
export async function buildAndCopyShareLink(city) {
  const url = `${window.location.origin}/results?city=${encodeURIComponent(city)}`
  try {
    await navigator.clipboard.writeText(url)
    return { url, copied: true }
  } catch {
    return { url, copied: false }
  }
}