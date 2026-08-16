/**
 * Deterministic unique copy composer — atoms from the row only.
 * No web scrapes. Shared chrome labels are NOT composed here.
 */

import { hashString } from "./seed.mjs";

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

/** How the memory tends to arrive on waking, by context — several human phrasings each. */
const CTX_FEEL = {
  onset: [
    "it tends to blur into whatever you were thinking about right before sleep took hold",
    "it often gets folded into the last waking thought, so the edges are hard to place",
    "it rarely stands alone in memory — it arrives merged with the drift into sleep",
    "it is easy to mistake for a stray thought rather than a body event",
  ],
  "mid-cycle": [
    "it usually repeats quietly without breaking sleep, so it is easy to miss until you look for it",
    "it tends to sit in the background, noticed only in hindsight the next morning",
    "it rarely wakes you outright, so recall depends on catching it deliberately",
    "it recurs without much drama, which is exactly why it goes undocumented",
  ],
  awakening: [
    "it is often the last thing you notice, arriving just as you surface",
    "it tends to dominate the first few seconds of being awake",
    "it lands right at the surface, sharper than anything from earlier in the night",
    "it is usually the clearest single data point from the whole night",
  ],
  fragmentation: [
    "it arrives in disconnected pieces rather than one continuous thread",
    "it shows up as a handful of unrelated snapshots instead of a story",
    "it resists being told as one memory — expect fragments, not a narrative",
    "it comes back out of order, which is itself part of the signature",
  ],
};

const CTX_MARKER_TAIL = {
  onset: [
    "building as the stage gate closes",
    "stacking up right before the cycle settles",
    "loading in as the transition completes",
  ],
  "mid-cycle": [
    "repeating steadily through an already-stable stretch",
    "holding a steady pattern well inside the cycle",
    "recurring without much variation mid-stretch",
  ],
  awakening: [
    "building toward the moment of waking",
    "sharpening as arousal climbs toward the surface",
    "stacking up right at the exit window",
  ],
  fragmentation: [
    "each one restarting the signal rather than continuing it",
    "each fragment resetting rather than building on the last",
    "landing as separate bursts instead of one continuous run",
  ],
};

const LENS_SUFFIX = {
  onset: [
    "arriving right at stage entry",
    "surfacing as the stage gate opens",
    "showing up before the cycle settles",
    "catching the transition into this stage",
  ],
  "mid-cycle": [
    "recurring deep inside the cycle",
    "repeating well inside an established stretch",
    "showing up mid-stretch, away from either edge",
    "settling in once the cycle is underway",
  ],
  awakening: [
    "concentrated at the exit toward waking",
    "clustering right where arousal breaks the surface",
    "loading onto the last stretch before waking",
    "peaking as the exit window opens",
  ],
  fragmentation: [
    "scattered across broken stage fragments",
    "cut into pieces by fragmentation bursts",
    "showing up in short, interrupted bursts",
    "breaking apart across unstable segments",
  ],
};

const MECH_TAIL = [
  "read as mechanism, not dream-symbol shorthand",
  "a mechanism read, not a symbol lookup",
  "treated as physiology here, not folklore",
  "scored as hardware, not metaphor",
];

function cap(s) {
  const str = String(s || "");
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function decap(s) {
  const str = String(s || "");
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

/** Deterministic per-row, per-field choice — independent of other fields on the same row. */
function seededPick(entry, salt, arr) {
  const base = entry.id || `${entry.slug_symptom}-${entry.slug_phase}-${entry.slug_context}`;
  const h = hashString(`${base}::${salt}`);
  return arr[h % arr.length];
}

/** Context-bound rephrase so same symptom reads differently across its own context siblings. */
function symptomLens(entry) {
  const s = decap(entry.physiological_symptom);
  const suffixes = LENS_SUFFIX[entry.context];
  const suffix = suffixes ? seededPick(entry, "lens", suffixes) : null;
  return suffix ? `${s}, ${suffix}` : s;
}

/** Qualitative read of the three gauges — real numbers, plain-language interpretation. */
function gaugeReadout(entry) {
  const atonia = entry.gauge_atonia ?? 50;
  const arousal = entry.gauge_arousal ?? 50;
  const coherence = entry.gauge_coherence ?? 50;
  const atoniaPool =
    atonia >= 70
      ? ["the motor brake is holding firm", "motor inhibition is strong here", "the brake is locked down tight"]
      : atonia <= 30
      ? ["the motor brake is thin, so movement can leak through", "inhibition is weak, leaving room for movement", "the brake is loose enough to slip"]
      : ["the motor brake is only partial", "inhibition sits at a middle setting", "the brake is engaged but not complete"];
  const backdropPool =
    arousal >= 65 && coherence <= 45
      ? ["against a jagged, low-coherence backdrop", "over an unsettled, choppy backdrop", "set against a noisy, broken backdrop"]
      : arousal <= 35 && coherence >= 65
      ? ["against a stable, well-organized backdrop", "over a calm, coherent backdrop", "set against a steady, orderly backdrop"]
      : arousal >= 65
      ? ["against a higher-arousal backdrop", "over a more charged backdrop", "set against an activated backdrop"]
      : coherence <= 40
      ? ["against a fragmented backdrop", "over a loosely organized backdrop", "set against a scattered backdrop"]
      : ["against a moderately organized backdrop", "over a middling, mixed backdrop", "set against a fairly even backdrop"];
  const atoniaPhrase = seededPick(entry, "gauge-a", atoniaPool);
  const backdropPhrase = seededPick(entry, "gauge-b", backdropPool);
  return `${atoniaPhrase}, ${backdropPhrase}`;
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
  const lens = symptomLens(entry);
  const bullets = [];

  const openers = [
    `${cap(lens)} sits inside ${entry.sleep_phase} sleep, with cortical activity running ${eeg.band} at ${eeg.min}–${eeg.max} Hz.`,
    `Cortically, this row runs ${eeg.band} at ${eeg.min}–${eeg.max} Hz while ${lens} plays out in ${entry.sleep_phase} sleep.`,
    `${entry.sleep_phase} sleep frames ${lens}, against a ${eeg.band} trace of ${eeg.min}–${eeg.max} Hz.`,
  ];
  bullets.push(seededPick(entry, "bullet1", openers));

  if (tx[0]) {
    const atom = TX_ATOM[tx[0]] || "tagged as a primary chemical driver in this dataset row";
    const rest = tx.slice(1, 3).join(", ");
    const chemOpts = [
      `${cap(tx[0])} leads the chemistry here (${atom})${rest ? `; ${rest} also show up` : ""}; density for this row is ${entry.density_score ?? "n/a"}.`,
      `The lead transmitter is ${tx[0]} (${atom})${rest ? `, alongside ${rest}` : ""} — this row's density score is ${entry.density_score ?? "n/a"}.`,
      `Chemistry is ${tx[0]}-led here (${atom})${rest ? `, with ${rest} co-listed` : ""}; density ${entry.density_score ?? "n/a"} on this row.`,
    ];
    bullets.push(seededPick(entry, "bullet2", chemOpts));
  }

  bullets.push(
    `Dataset row #${entry.chart_seed}: atonia ${entry.gauge_atonia}/100, arousal ${entry.gauge_arousal}/100, coherence ${entry.gauge_coherence}/100 — ${gaugeReadout(entry)}.`
  );

  if (markers.length) {
    const rotated = [...markers].sort();
    if (entry.context === "fragmentation") rotated.reverse();
    if (entry.context === "awakening") rotated.push(rotated.shift());
    const tailPool = CTX_MARKER_TAIL[entry.context] || ["consistent with the stage above"];
    const tail = seededPick(entry, "markertail", tailPool);
    bullets.push(
      `On this ${entry.context} row the markers stack as ${rotated.map((m) => `"${m}"`).join(" → ")} — ${tail}.`
    );
  }

  const mechTail = seededPick(entry, "mechtail", MECH_TAIL);
  const closers = [
    `The Lab treats "${markers[0] || entry.physiological_symptom}" here as ${entry.context} somatic evidence layered onto imagery for ${entry.sleep_phase} sleep — ${mechTail}.`,
    `"${markers[0] || entry.physiological_symptom}" gets weighted as ${entry.context} body evidence for ${entry.sleep_phase} sleep in Lab Search — ${mechTail}.`,
    `The BODY line on this page leans on "${markers[0] || entry.physiological_symptom}" for this ${entry.context}/${entry.sleep_phase} row — ${mechTail}.`,
  ];
  bullets.push(seededPick(entry, "bullet5", closers));

  return bullets;
}

export function composeUniqueSummary(entry) {
  const eeg = entry.eeg_frequency_hz_range || {};
  const tx = entry.neurotransmitters_involved || [];
  const markers = entry.somatic_markers || [];
  const leads = CTX_LEAD[entry.context] || ["In this stage,"];
  const lead = seededPick(entry, "sumlead", leads);
  const lens = symptomLens(entry);
  const patterns = [
    () =>
      `${lead} ${lens} plays out under ${entry.sleep_phase} sleep at ${eeg.min}–${eeg.max} Hz (${eeg.band}). Chemistry here runs ${tx.join(", ") || "unspecified"}, and the markers people report are ${markers.join(", ") || "general somatic load"}. Gauges read ${entry.gauge_atonia}/${entry.gauge_arousal}/${entry.gauge_coherence} (atonia/arousal/coherence).`,
    () =>
      `In ${entry.sleep_phase} sleep, ${lens} ${CTX_PHRASE[entry.context] || "in this stage"}. Cortical band ${eeg.band} spans ${eeg.min}–${eeg.max} Hz; ${tx[0] || "mixed chemistry"} leads, atonia state is "${entry.atonia_state}", and this row's density score is ${entry.density_score ?? "n/a"}.`,
    () =>
      `Dataset row #${entry.chart_seed} frames ${lens} — ${tx.slice(0, 3).join(" + ") || "mixed transmitters"} against arousal ${entry.gauge_arousal}/100 and coherence ${entry.gauge_coherence}/100.`,
    () =>
      `${lead} the marker named most often is "${markers[0] || "somatic load"}" — the clearest signal for ${lens}. Band ${eeg.band} at ${eeg.min}–${eeg.max} Hz; ${tx[0] || "mixed"} chemistry; density ${entry.density_score ?? "n/a"}.`,
    () =>
      `${cap(lens)} maps onto [${markers.join(" · ")}] inside ${eeg.band} ${eeg.min}–${eeg.max} Hz, atonia "${entry.atonia_state}" — ${seededPick(entry, "summtail", MECH_TAIL)}.`,
    () =>
      `Row #${entry.chart_seed}: ${lens}, ${entry.sleep_phase} sleep, gauges ${entry.gauge_atonia}/${entry.gauge_arousal}/${entry.gauge_coherence}. Markers on file: ${markers.join(", ") || "general somatic load"}; chemistry ${tx.join(" + ") || "mixed"}.`,
    () =>
      `${cap(lens)} — atonia state "${entry.atonia_state}", band ${eeg.band} (${eeg.min}–${eeg.max} Hz), lead transmitter ${tx[0] || "mixed"}. Density ${entry.density_score ?? "n/a"} for row #${entry.chart_seed}.`,
  ];
  return seededPick(entry, "sumpattern", patterns)();
}

export function composeUniqueTitle(entry) {
  const eeg = entry.eeg_frequency_hz_range || {};
  const s = entry.physiological_symptom;
  const variants = [
    `${s} in ${entry.sleep_phase} sleep (${entry.context})`,
    `${entry.sleep_phase}/${entry.context}: ${s}`,
    `${s} · ${eeg.band} ${eeg.min}–${eeg.max} Hz · ${entry.sleep_phase}`,
  ];
  const seed = hashString(entry.id || entry.slug_symptom + entry.slug_phase + entry.slug_context);
  return variants[seed % variants.length];
}

export function composeDecodeHint(entry) {
  const m = (entry.somatic_markers || [])[0] || "the body signal";
  const ctxPhrase = CTX_PHRASE[entry.context] || `during ${entry.context}`;
  const variants = [
    `If your recall includes "${m}" during ${entry.context} ${entry.sleep_phase} sleep, Lab Search weights it as somatic context beside the imagery — mechanism first, not symbolism.`,
    `Recall naming "${m}" in ${entry.sleep_phase} sleep, ${ctxPhrase}, gets read by the Lab as body evidence, not as a dream symbol.`,
    `The Lab treats "${m}" as a mechanism marker when it shows up ${ctxPhrase} in ${entry.sleep_phase} sleep — not something to look up in a dictionary.`,
    `"${m}" logged ${ctxPhrase} shifts how Lab Search ranks ${entry.sleep_phase} sleep pages: body signal first, imagery second.`,
    `For ${entry.sleep_phase} sleep ${ctxPhrase}, "${m}" is exactly the kind of detail the Lab weights over plot — mechanism before meaning.`,
  ];
  return seededPick(entry, "decodehint", variants);
}

/** What a person is likely to notice on waking, in plain language. */
export function composeFeltOnWaking(entry) {
  const markers = entry.somatic_markers || [];
  const m0 = markers[0] || "a diffuse body signal";
  const m1 = markers[1];
  const feelPool = CTX_FEEL[entry.context] || ["it registers as a background body signal"];
  const feel = seededPick(entry, "feel", feelPool);
  const tail = m1 ? ` with "${m1}" close behind` : "";
  return `On waking, the marker named most often is "${m0}"${tail}. Because this row sits at ${entry.context} in ${entry.sleep_phase} sleep, ${feel}.`;
}

/** Concrete explanation of how Lab Search weighs this specific row. */
export function composeDecodeUse(entry) {
  const markers = entry.somatic_markers || [];
  const m0 = markers[0] || "this marker";
  const tx0 = (entry.neurotransmitters_involved || [])[0];
  const txPhrase = tx0 ? ` — tied here to ${tx0} activity` : "";
  const variants = [
    `When your recall names "${m0}"${txPhrase}, Lab Search reads it as body-side evidence for the BODY line of the matching page rather than as a symbol. It adjusts the mechanism ranking for ${entry.sleep_phase} sleep instead of guessing at what "${m0}" might "mean".`,
    `The Lab does not look up "${m0}" in a symbol table${txPhrase}; it uses it to weight the BODY line of your ${entry.sleep_phase} reading toward mechanism.`,
    `Naming "${m0}"${txPhrase} shifts the Lab's ${entry.sleep_phase}-sleep reading toward physiology — the BODY line moves, the SIGNAL line does not chase a symbolic guess.`,
    `"${m0}"${txPhrase} is treated by Lab Search as a body-side input for ${entry.sleep_phase} sleep, not as imagery to interpret — it changes the mechanism weighting, not the story.`,
  ];
  return seededPick(entry, "decodeuse", variants);
}

const PILLARS = {
  atonia: {
    href: "/mechanics/rem/atonia/",
    label: "Atonia lock",
    blurb: "the GABA–glycine brake that holds skeletal muscle offline during REM",
  },
  "pgo-autonomic": {
    href: "/mechanics/rem/pgo-autonomic/",
    label: "PGO & autonomic drive",
    blurb: "the pontine spikes and autonomic swings behind eye, breath, and skin signals",
  },
  "cortex-eeg": {
    href: "/mechanics/rem/cortex-eeg/",
    label: "Cortex & EEG",
    blurb: "the wake-like cortical activity that drives memory work in this stage",
  },
  "cycle-timing": {
    href: "/mechanics/rem/cycle-timing/",
    label: "Cycle timing",
    blurb: "how episodes lengthen and shift across the night",
  },
};

/** Map a row onto the REM mechanics chapter it most concretely illustrates. */
export function pillarFor(entry) {
  const zones = entry.body_zones || bodyZonesFromMarkers(entry.somatic_markers);
  let key;
  if (entry.utility_type === "atonia_risk") key = "atonia";
  else if (entry.utility_type === "phase_disruption" || entry.layout_profile === "compare_related") key = "cycle-timing";
  else if (zones.includes("ocular") || zones.includes("autonomic-skin") || zones.includes("thoracic")) key = "pgo-autonomic";
  else key = "cortex-eeg";
  return { key, ...PILLARS[key] };
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
  if (entry.indexable) {
    mods.add("felt_on_waking");
    mods.add("decode_use");
    mods.add("physiology_pillar");
  }
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
