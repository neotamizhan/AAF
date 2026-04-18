export function normalizeCandidateName(value: string) {
  return value
    .trim()
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}
