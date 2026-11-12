/**
 * Helper to safely resolve LTA DataMall AccountKey across various environment variable naming conventions
 * Supports Vercel, Node, Docker, and Vite naming standards with automatic whitespace & quote trimming.
 */

export function getLtaApiKey() {
  const raw =
    process.env.LTA_API_KEY ||
    process.env.LTA_KEY ||
    process.env.LTA_APIKEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNTKEY ||
    process.env.ACCOUNT_KEY ||
    process.env.ACCOUNTKEY ||
    process.env.DATAMALL_API_KEY ||
    process.env.DATAMALL_APIKEY ||
    process.env.DATAMALL_KEY ||
    process.env.DATAMALL_ACCOUNT_KEY ||
    process.env.DATAMALL_ACCOUNTKEY ||
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_DATAMALL_API_KEY ||
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.VITE_LTA_API_KEY ||
    process.env.VITE_LTA_KEY ||
    process.env.VITE_ACCOUNT_KEY;

  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  // Strip accidental enclosing quotes if entered with quotes in Vercel UI
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed || null;
}
