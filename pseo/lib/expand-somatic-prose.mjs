/**
 * Unique long-form for somatic hubs + utility rows.
 * Interpolates live titles, Hz, gauges, markers — no shared essay.
 */

import { hashString } from "./seed.mjs";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function vigenMaybe(key, sentence) {
  if (hashString(key) % 5 !== 2) return "";
  return `<h2>A note from Vigen</h2><p>${sentence}</p>`;
}

export function phaseHubEssayHtml(slug, label, list, copy) {
  const n = list.length;
  const titles = list.map((e) => e.title);
  const contexts = [...new Set(list.map((e) => e.context || e.slug_context).filter(Boolean))];
  const symptoms = [...new Set(list.map((e) => e.physiological_symptom || e.slug_symptom).filter(Boolean))];
  const ctx = contexts.join(", ") || "onset / mid-cycle / fragmentation / awakening";
  const sym = symptoms.join(", ") || label;
  const sparse =
    n < 5
      ? `<p>This ${esc(label)} hub is intentionally small. Dense-gate is stricter than “cover the keyword.” Right now ${n} row${n === 1 ? "" : "s"} pass. ${esc(titles[0] || "The indexed title")} is the live example: use it if the waking body matches; do not pad the hub with thin cousins. When more ${esc(label)} rows earn markers + context + a 17-character-class bind (for somatic: example-complete fields), they appear here via drip, not by hand.</p>
  <p>Slow-wave / ${esc(label)} nights are easy to misread as “nothing happened” because recall is poor. That is why a single motor-residue row still deserves a hub: confusional arousal leftover, stillness, or N3-exit jerks are stage-shift hardware. If your night was vivid story, you were probably not in ${esc(label)} for the remembered scene — check REM or N2 hubs instead of forcing this URL.</p>`
      : "";

  const catalog = list
    .map((e) => {
      const eeg = e.eeg_frequency_hz_range || {};
      const marks = (e.somatic_markers || []).slice(0, 4).join(", ") || "see row";
      const href = `/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/`;
      return `<p class="sx-essay-row"><a href="${esc(href)}">${esc(e.title)}</a> — ${esc(e.physiological_symptom || e.slug_symptom)} · ${esc(e.sleep_phase || label)}/${esc(e.context || e.slug_context)} · ${esc(eeg.min)}–${esc(eeg.max)} Hz ${esc(eeg.band || "")}. Atonia ${esc(e.atonia_state || "n/a")}. Markers: ${esc(marks)}. Density ${esc(String(e.density_score ?? "—"))}.</p>`;
    })
    .join("\n");

  const key = `phase-hub-${slug}-${n}-${titles[0] || "empty"}`;
  const vigen = vigenMaybe(
    key,
    `I am Vigen. I index ${esc(label)} utilities only when the row is dense — markers, phase+context, and a body-matchable title. “${esc(copy.h2)}” is the rule I actually use at 6 a.m., not a slogan. This hub currently holds ${n} such rows.`,
  );

  return `<section class="sx-essay" aria-label="${esc(label)} long read">
  <h2>Why ${esc(label)} gets its own hub</h2>
  <p>${esc(copy.lead)} This hub is not a blog about “${esc(label)} dreams.” It is the index of ${n} high-density metric utilities currently allowed to crawl. Each card is a different symptom × ${esc(label)} × context triple. Same phase, different hardware. Mixing N1/N2/N3/REM into one omen paragraph is how thin pages get born; this URL refuses that mix.</p>
  <p>Contexts present in the live ${esc(label)} index: ${esc(ctx)}. Symptom families: ${esc(sym)}. If two links look similar, read the context suffix — onset is not awakening; fragmentation is not mid-cycle. Cortical language for this stage stays inside ${esc(label)} physiology, not a personality metaphor.</p>
  <h2>Row-level facts currently indexed for ${esc(label)}</h2>
  <p>Open a utility when you woke with a body fact that matches the title, not when you merely searched the phase name. Full ${esc(label)} batch (${n}):</p>
  ${catalog}
  ${sparse}
  <p>How to work a night that belongs on this hub: 1) write the first twenty seconds of residue (heat, weight, mute, twitch, jaw, breath). 2) pick the ${esc(label)} card whose title names that residue. 3) read that row’s gauges and markers — numbers are URL-specific. 4) carry the row into Lab Search; do not paste a symbol. 5) if the night was mostly plot, use Dream Meaning; if it was mostly body, stay in /somatic.</p>
  <p>${esc(label)} is a sleep-architecture label, not a type of person. N1 is a theta gate into sleep, N2 a sigma/spindle window, N3 a delta well, REM a dreaming state with spinal atonia. This page only lists ${esc(label)}. Neighbor hubs: <a href="/somatic/phase/n1/">N1</a>, <a href="/somatic/phase/n2/">N2</a>, <a href="/somatic/phase/n3/">N3</a>, <a href="/somatic/phase/rem/">REM</a>.</p>
  <p>What this hub will not do: diagnose apnea, REM sleep behavior disorder, or psychiatric disease. Persistent dream enactment, choking, or daytime collapse needs a clinician. What it will do: keep ${esc(label)} metrics honest so Decode is not guessing from a plot summary. Methodology lives on <a href="/about/">About</a>; Lab Notes by Vigen sit at <a href="/notes/">/notes</a>.</p>
  ${vigen}
</section>`;
}

export function utilityEssayHtml(entry) {
  const title = entry.title || "";
  const eeg = entry.eeg_frequency_hz_range || {};
  const markers = (entry.somatic_markers || []).join(", ") || "row markers";
  const tx = (entry.neurotransmitters_involved || []).join(", ") || "tagged transmitters";
  const bullets = (entry.mechanism_bullets || []).map((b) => `<li>${esc(b)}</li>`).join("");
  const felt = entry.felt_on_waking || "";
  const hint = entry.decode_hint || "";
  const use = entry.decode_use || "";
  const atonia = entry.atonia_state || "";
  const phase = entry.sleep_phase || "";
  const ctx = entry.context || "";
  const symptom = entry.physiological_symptom || "";
  const density = entry.density_score ?? "—";
  const seed = entry.chart_seed ?? "";
  const ga = entry.gauge_atonia ?? "—";
  const gr = entry.gauge_arousal ?? "—";
  const gc = entry.gauge_coherence ?? "—";
  const key = `${entry.slug_symptom}/${entry.slug_phase}/${entry.slug_context}`;

  const vigen = vigenMaybe(
    key,
    `I am Vigen. I left <em>${esc(title)}</em> in the catalog because the gauges (${esc(String(ga))}/${esc(String(gr))}/${esc(String(gc))}) plus markers (${esc(markers)}) are enough to be useful. If they were not, this URL would stay noindex.`,
  );

  return `<section class="sx-essay" aria-label="How to read this utility">
  <h2>How to read ${esc(title)}</h2>
  <p>This row is ${esc(symptom)} in ${esc(phase)} (${esc(ctx)}). Cortical window ${esc(eeg.min)}–${esc(eeg.max)} Hz (${esc(eeg.band)}). Atonia state: ${esc(atonia)}. Density ${esc(String(density))}. Chart seed ${esc(String(seed))} is deterministic for this URL — the trace is a model of the row, not a clinical EEG.</p>
  <p>Gauges on this page: atonia ${esc(String(ga))}, arousal ${esc(String(gr))}, coherence ${esc(String(gc))}. Markers: ${esc(markers)}. Transmitters tagged: ${esc(tx)}. Those fields are why two “similar” titles are not duplicates. If a marker did not happen to you, say so — do not wear the whole row.</p>
  <h2>What the body is doing — not what the image “means”</h2>
  <p>${esc(felt || hint || "Felt-on-waking is empty on this row; use markers and gauges only.")} ${esc(hint)}</p>
  ${bullets ? `<ol class="sx-essay-mech">${bullets}</ol>` : ""}
  <h2>How Lab Search should use this row</h2>
  <p>${esc(use || "Paste the symptom name plus phase plus one marker. Skip omen language.")} Then open Decode if you also have a plot. The plot is optional; the body line is not.</p>
  <p>This utility will not treat ${esc(symptom)} as a spirit, a pregnancy test, or a death omen. It will treat it as a stage-bound somatic metric. If symptoms are nightly, worsening, or include dream enactment, that is clinical, not catalog.</p>
  ${vigen}
</section>`;
}
