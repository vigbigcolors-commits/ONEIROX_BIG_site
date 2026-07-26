/**
 * Deterministic unique copy composer — atoms from the row only.
 * No web scrapes. Shared chrome labels are NOT composed here.
 */

import { hashString, mulberry32 } from "./seed.mjs";

const ZONE_BY_MARKER = [
  { re: /jaw|tooth|temporalis|brux|face|lip|cheek|nose|vocal|throat|laryngeal|swallow/i, zone: "craniofacial" },
  { re: /eye|lid|pupil|orbital|vision/i, zone: "ocular" },
  { re: /chest|breath|heart|pulse|hr|respir|apnea|gasping/i, zone: "thoracic" },
  { re: /limb|leg|ankle|toe|finger|arm|grip|kick|twitch|jerk|myoclon/i, zone: "limbs" },
  { re: /pelvic|genital|abdomen|gut/i, zone: "pelvic" },
  { re: /skin|sweat|heat|cold|temperature|flush|clammy/i, zone: "autonomic-skin" },
  { re: /whole-body|body|stillness|immobility|atonia|paralysis|heaviness/i, zone: "axial-motor" },
];

const TX_ATOM = {
  GABA: "inhibitory tone rises across cortical and spinal targets",
  glycine: "spinal motor neurons receive glycinergic brake",
  acetylcholine: "cholinergic REM drive elevates cortical activation",
  norepinephrine: "aminergic wake pressure returns toward cortex",
  serotonin: "serotonergic tone modulates sensory gating",
  dopamine: "dopaminergic bursts can tag salience without waking narrative",
  orexin: "orexinergic wake promotion destabilizes sleep continuity",
  histamine: "histaminergic arousal bias increases cortical readiness",
  glutamate: "glutamatergic excitation can outpace local inhibition",
  adenosine: "adenosine pressure weights homeostatic sleep drive",
  melatonin: "melatonin context biases circadian gate timing",
};

const CTX_LEAD = {
  onset: [
    "At the entrance into this stage,",
    "As the stage gate opens,",
    "On the approach into sleep architecture,",
  ],
  "mid-cycle": [
    "Deep in the mid-cycle window,",
    "While the night is already underway,",
    "Inside an established cycle segment,",
  ],
  awakening: [
    "Near the exit toward waking,",
    "As wake pressure climbs,",
    "On the hypnopompic border,",
  ],
  fragmentation: [
    "During fragmentation bursts,",
    "When continuity breaks into shards,",
    "Across interrupted stage fragments,",
  ],
};

const CTX_PHRASE = {
  onset: "at stage entry",
  "mid-cycle": "in the mid-cycle window",
  awakening: "near the exit toward wake",
  fragmentation: "during fragmentation bursts",
};

/** Context-bound rephrase so same symptom ≠ shared 3-grams across URLs */
function symptomLens(entry) {
  const s = entry.physiological_symptom;
  const c = entry.context;
  const lenses = {
    onset: `onset-framed “${s}”`,
    "mid-cycle": `mid-cycle expression of “${s}”`,
    awakening: `exit-edge “${s}”`,
    fragmentation: `fragment-bound “${s}”`,
  };
  return lenses[c] || `“${s}”`;
}

function uniqueToken(entry) {
  return `OX-${entry.slug_symptom.slice(0, 8)}-${entry.slug_phase}-${entry.slug_context}-${entry.chart_seed}`;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

export function bodyZonesFromMarkers(markers) {
  const zones = new Set();
  for (const m of markers || []) {
    for (const rule of ZONE_BY_MARKER) {
      if (rule.re.test(m)) zones.add(rule.zone);
    }
  }
  if (!zones.size) zones.add("axial-motor");
  return [...zones].slice(0, 4);
}

export function composeMechanismBullets(entry) {
  const eeg = entry.eeg_frequency_hz_range || {};
  const tx = entry.neurotransmitters_involved || [];
  const markers = entry.somatic_markers || [];
  const seed = entry.chart_seed;
  const lens = symptomLens(entry);
  const tok = uniqueToken(entry);
  const bullets = [];
  bullets.push(
    `${tok}: ${lens} locked under ${entry.sleep_phase} with cortical window ${eeg.min}–${eeg.max} Hz (${eeg.band}).`
  );
  if (tx[0]) {
    const atom = TX_ATOM[tx[0]] || "tagged as a primary chemical driver in this dataset row";
    bullets.push(
      `For ${entry.context} only — ${tx[0]} leads (${atom}); co-listed ${tx.slice(1, 3).join(", ") || "none"}; density ${entry.density_score ?? "n/a"}.`
    );
  }
  bullets.push(
    `URL gauges ${tok}: atonia ${entry.gauge_atonia} · arousal ${entry.gauge_arousal} · coherence ${entry.gauge_coherence}; motor ${entry.atonia_state}.`
  );
  if (markers.length) {
    const rotated = [...markers].sort();
    if (entry.context === "fragmentation") rotated.reverse();
    if (entry.context === "awakening") rotated.push(rotated.shift());
    bullets.push(`Context-ordered markers (${entry.context}): ${rotated.map((m) => `«${m}»`).join(" → ")}.`);
  }
  bullets.push(
    `Decode surface ${tok}: weight «${markers[0] || entry.physiological_symptom}» as ${entry.context} somatic evidence — not dictionary symbolism.`
  );
  return bullets;
}

export function composeUniqueSummary(entry) {
  const seed = hashString(entry.id || `${entry.slug_symptom}-${entry.slug_phase}-${entry.slug_context}`);
  const rng = mulberry32(seed);
  const eeg = entry.eeg_frequency_hz_range || {};
  const tx = entry.neurotransmitters_involved || [];
  const markers = entry.somatic_markers || [];
  const leads = CTX_LEAD[entry.context] || ["In this stage,"];
  const lead = pick(rng, leads);
  const lens = symptomLens(entry);
  const tok = uniqueToken(entry);
  const patterns = [
    () =>
      `${lead} ${lens} scores under ${entry.sleep_phase} at ${eeg.min}–${eeg.max} Hz (${eeg.band}). Chemistry ${tx.join(" · ") || "unspecified"}. Felt: ${markers.join(" ¦ ") || "general load"}. Token ${tok}; gauges ${entry.gauge_atonia}/${entry.gauge_arousal}/${entry.gauge_coherence}.`,
    () =>
      `${tok} · ${lens} · ${entry.sleep_phase}. Band ${eeg.band} ${eeg.min}–${eeg.max} Hz. Atonia=${entry.atonia_state}. Markers «${markers[0] || "n/a"}» then «${markers[1] || "n/a"}».`,
    () =>
      `Utility ${entry.id} frames ${lens} ${CTX_PHRASE[entry.context] || ""}. Transmitters ${tx.slice(0, 3).join(" ⊕ ") || "mixed"}; arousal ${entry.gauge_arousal}/100 vs coherence ${entry.gauge_coherence}/100; ${tok}.`,
    () =>
      `${lead} isolates «${markers[0] || "somatic load"}» as the lead signal for ${lens}. Hz ${eeg.min}–${eeg.max}; ${tx[0] || "mixed"}; density ${entry.density_score ?? "n/a"}; ${tok}.`,
    () =>
      `Mechanism page ${tok}: ${lens} maps [${markers.join(" ‖ ")}] onto ${eeg.band} ${eeg.min}–${eeg.max} Hz with atonia ${entry.atonia_state} — not dream-symbol copy.`,
  ];
  return pick(rng, patterns)();
}

export function composeUniqueTitle(entry) {
  const eeg = entry.eeg_frequency_hz_range || {};
  const lens = symptomLens(entry);
  const variants = [
    `${lens} · ${entry.sleep_phase}`,
    `${entry.physiological_symptom} · ${eeg.band} ${eeg.min}–${eeg.max} Hz · ${entry.context}`,
    `${entry.sleep_phase}/${entry.context}: ${entry.physiological_symptom}`,
    `${uniqueToken(entry)} · ${entry.physiological_symptom}`,
  ];
  const seed = hashString(entry.id || entry.slug_symptom + entry.slug_phase + entry.slug_context);
  return variants[seed % variants.length];
}

export function composeDecodeHint(entry) {
  const m = (entry.somatic_markers || [])[0] || "the body signal";
  const tok = uniqueToken(entry);
  return `${tok}: if recall includes «${m}» under ${entry.context}/${entry.sleep_phase}, Decode weights somatic context beside imagery — mechanism first.`;
}

export function chooseLayoutProfile(entry) {
  const zones = entry.body_zones || bodyZonesFromMarkers(entry.somatic_markers);
  const tx = entry.neurotransmitters_involved || [];
  if (entry.utility_type === "atonia_risk") return "atonia_risk";
  if (entry.utility_type === "phase_disruption") {
    if ((entry.related_ids || []).length >= 2) return "compare_related";
    return "phase_disruption";
  }
  if (tx.length >= 3 && (entry.gauge_coherence ?? 50) > 55) return "transmitter_focus";
  if (zones.length >= 2) return "somatic_map";
  if ((entry.density_score ?? 0) < 70) return "sparse_minimal";
  return "eeg_baseline";
}

export function modulesFor(entry, layout) {
  const mods = new Set(["mechanism", "gauges", "cta", "markers"]);
  if (layout === "eeg_baseline" || layout === "transmitter_focus") mods.add("eeg");
  if (layout === "phase_disruption" || layout === "compare_related") mods.add("compare");
  if (layout === "atonia_risk") mods.add("atonia_hero");
  if (layout === "transmitter_focus") mods.add("tx_cards");
  if (layout === "somatic_map") mods.add("zone_map");
  if (layout === "compare_related") mods.add("related");
  if (layout !== "sparse_minimal") mods.add("stepper");
  mods.add("useful_vote");
  if (entry.sources?.length) mods.add("sources");
  // sparse drops heavy panels
  if (layout === "sparse_minimal") {
    mods.delete("compare");
    mods.delete("tx_cards");
    mods.delete("zone_map");
    mods.delete("related");
  }
  return [...mods];
}

export function buildZoneSvg(zones) {
  const active = new Set(zones || []);
  const fill = (z, color) => (active.has(z) ? color : "#d5ddd0");
  return `<svg class="sx-zone-svg" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="60" cy="28" rx="18" ry="20" fill="${fill("craniofacial", "#00a5a8")}" stroke="#8a9a88"/>
  <circle cx="52" cy="26" r="3" fill="${fill("ocular", "#3189cc")}"/>
  <circle cx="68" cy="26" r="3" fill="${fill("ocular", "#3189cc")}"/>
  <rect x="42" y="50" width="36" height="44" rx="10" fill="${fill("thoracic", "#5cb888")}" stroke="#8a9a88"/>
  <rect x="46" y="96" width="28" height="26" rx="8" fill="${fill("pelvic", "#73a563")}" stroke="#8a9a88"/>
  <rect x="22" y="56" width="14" height="50" rx="6" fill="${fill("limbs", "#268571")}" stroke="#8a9a88"/>
  <rect x="84" y="56" width="14" height="50" rx="6" fill="${fill("limbs", "#268571")}" stroke="#8a9a88"/>
  <rect x="48" y="124" width="10" height="48" rx="5" fill="${fill("limbs", "#268571")}" stroke="#8a9a88"/>
  <rect x="62" y="124" width="10" height="48" rx="5" fill="${fill("limbs", "#268571")}" stroke="#8a9a88"/>
  <rect x="40" y="48" width="40" height="8" rx="3" fill="${fill("axial-motor", "#3a4435")}" opacity="0.85"/>
  <circle cx="96" cy="40" r="8" fill="${fill("autonomic-skin", "#c45a3a")}" opacity="0.75"/>
</svg>`;
}
