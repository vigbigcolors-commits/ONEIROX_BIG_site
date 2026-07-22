/**
 * Density / traffic-potential score for crawl-budget ranking.
 * Programmatic SEO = ranked dataset, not text spam.
 */

const HIGH_INTENT_SYMPTOMS = new Set([
  "sleep-paralysis-onset",
  "hypnic-jerk",
  "hypnagogic-tachycardia",
  "rem-atonia-failure",
  "hypnopompic-somatic-surge",
  "hypnopompic-immobility",
  "exploding-head-burst",
  "exploding-head-sensory-burst",
  "periodic-limb-movement",
  "sleep-related-bruxism",
  "fragmented-rem",
  "fragmented-rem-microarousal",
  "n3-confusional-motor",
  "n3-confusional-arousal-motor",
  "microsleep-nod",
  "n1-microsleep-nod",
  "rem-distal-twitch",
  "rem-muscle-twitch-finger",
  "pre-rem-atonia-ramp",
  "alpha-intrusion-nrem",
  "sleep-onset-breath-pause",
  "sleep-onset-apnea-like-pause",
  "n1-falling-elevator",
  "hypnagogic-limb-float",
]);

const CONTEXT_WEIGHT = {
  onset: 3,
  awakening: 3,
  fragmentation: 2,
  "mid-cycle": 1,
};

const PHASE_WEIGHT = {
  REM: 3,
  N1: 3,
  N3: 2,
  N2: 2,
};

/**
 * Higher = denser unique dataset + stronger long-tail intent.
 */
export function scoreEntry(entry) {
  let s = 0;
  const eeg = entry.eeg_frequency_hz_range || {};
  const span = Math.abs((eeg.max ?? 0) - (eeg.min ?? 0));
  s += Math.min(20, span * 4);
  s += Math.min(15, (entry.neurotransmitters_involved?.length || 0) * 4);
  s += Math.min(15, (entry.somatic_markers?.length || 0) * 3);
  s += Math.min(10, (entry.sources?.length || 0) * 4);

  if (entry.atonia_state === "partial_failure") s += 12;
  if (entry.atonia_state === "preserved") s += 6;
  if (entry.utility_type === "atonia_risk") s += 8;
  if (entry.utility_type === "phase_disruption") s += 6;
  if (entry.utility_type === "eeg_baseline") s += 4;

  s += PHASE_WEIGHT[entry.sleep_phase] || 0;
  s += CONTEXT_WEIGHT[entry.context] || 0;

  if (HIGH_INTENT_SYMPTOMS.has(entry.slug_symptom)) s += 25;
  if (entry.chart_seed >= 10001 && entry.chart_seed <= 10030) s += 20; // gold seeds

  // Prefer richer summaries (data prose, not fluff length alone)
  const sumLen = (entry.summary || "").length;
  if (sumLen >= 120 && sumLen <= 420) s += 8;

  // Gauge spread = more "calculator-like" uniqueness
  const g = [
    entry.gauge_atonia ?? 50,
    entry.gauge_arousal ?? 50,
    entry.gauge_coherence ?? 50,
  ];
  const spread = Math.max(...g) - Math.min(...g);
  s += Math.min(12, spread / 5);

  return Math.round(s * 10) / 10;
}

/**
 * Mark top N as indexable; ensure utility_type diversity in top set.
 */
export function markIndexable(entries, topN = 50) {
  const scored = entries.map((e) => ({
    ...e,
    density_score: scoreEntry(e),
    indexable: false,
  }));
  scored.sort((a, b) => b.density_score - a.density_score);

  const picked = [];
  const byType = { eeg_baseline: 0, phase_disruption: 0, atonia_risk: 0 };
  const minPerType = Math.max(1, Math.floor(topN / 6));

  // Pass 1: ensure type floors
  for (const e of scored) {
    if (picked.length >= topN) break;
    const t = e.utility_type;
    if (byType[t] < minPerType) {
      picked.push(e);
      byType[t]++;
    }
  }
  // Pass 2: fill by score
  for (const e of scored) {
    if (picked.length >= topN) break;
    if (picked.includes(e)) continue;
    picked.push(e);
    byType[e.utility_type] = (byType[e.utility_type] || 0) + 1;
  }

  const pickIds = new Set(picked.map((e) => e.id));
  const rankById = new Map(picked.map((e, i) => [e.id, i + 1]));
  return scored
    .map((e) => ({
      ...e,
      indexable: pickIds.has(e.id),
      index_rank: rankById.get(e.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.indexable !== b.indexable) return a.indexable ? -1 : 1;
      return b.density_score - a.density_score;
    });
}
