export function somaticEntryKey(entry) {
  return `${entry.slug_symptom}--${entry.slug_phase}--${entry.slug_context}`;
}

export function missingSomaticReviewFields(entry) {
  const missing = [];
  for (const field of [
    "reviewed_at",
    "reviewed_title",
    "reviewed_description",
    "search_intent",
    "safety_boundary",
  ]) {
    if (!String(entry[field] || "").trim()) missing.push(field);
  }
  if (!Array.isArray(entry.citations) || entry.citations.length === 0) {
    missing.push("citations");
  }
  for (const field of ["established", "supported_hypothesis", "unknown_or_limitation"]) {
    if (!String(entry.evidence_sections?.[field] || "").trim()) {
      missing.push(`evidence_sections.${field}`);
    }
  }
  return missing;
}

export function isSomaticBuildEligible(entry) {
  return (
    entry.indexable === true &&
    entry.science_reviewed_core === true &&
    missingSomaticReviewFields(entry).length === 0
  );
}
