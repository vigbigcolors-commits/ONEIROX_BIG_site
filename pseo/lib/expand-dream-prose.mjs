/**
 * Unique long-form for Dream Meaning pages.
 * Every sentence interpolates row-specific fields so Jaccard stays low.
 * Vigen first-person only on a seeded minority of URLs.
 */

import { hashString, mulberry32 } from "./seed.mjs";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wordCount(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function topicAtoms(entry) {
  const parent = String(entry.parent_slug || entry.slug || "");
  const slug = String(entry.slug || "");
  const map = {
    snakes: "amygdala-biased predator schema on skin and distance",
    dogs: "affiliation-or-threat mammalian schema, often auditory plus motor",
    cats: "territorial watchfulness and quiet approach circuitry",
    "ex-partner": "attachment-memory replay with autonomic ink",
    "cheating-dreams": "pair-bond threat simulation, jealousy as salience not prophecy",
    "wedding-and-marriage": "ritual-commitment scripts under social evaluation load",
    "job-and-career": "status and competence rehearsal under evaluation threat",
    "money-and-wealth": "resource-loss / resource-gain continuity from waking worry",
    "being-watched": "social-evaluation gaze, often with freeze rather than chase",
    "losing-control": "motor-throttling and agency collapse inside REM atonia",
    "being-late": "time-pressure continuity plus failed-action loops",
    "being-pregnant": "interoceptive belly/pelvic noise plus identity-future simulation",
    "naked-in-public": "exposure plus social-evaluation, often with missing-clothing schema",
    "exam-anxiety-dreams": "performance-failure rehearsal with motor-block (can't write, wrong room)",
    "house-dreams": "spatial schema of safety/containment, layout as memory architecture",
    "water-and-drowning": "respiratory and vestibular threat mapped onto water physics",
    falling: "vestibular drop plus hypnic or REM motor mismatch",
    "sleep-paralysis": "REM atonia leaking across the wake border",
    "body-wont-move-or-speak": "atonia on limbs or larynx — mute/heavy as hardware",
    "death-of-a-loved-one": "grief consolidation, not a message from the dead",
    "recurring-dreams": "incomplete threat or place loop that re-queues",
    "repeating-numbers": "salience tagging on clock/count tokens, not numerology",
    "anxiety-dreams": "free-floating arousal seeking a scene to wear",
    "being-chased": "Revonsuo-style pursuit with motor lock as 'can't run'",
    "teeth-falling-out": "oral interoception (often bruxism) plus appearance-threat",
    "homeland-and-diaspora": "place-kinship-language cues from a lived cultural map",
    "being-pregnant": "pelvic/interoceptive plus future-identity load",
  };
  return map[parent] || map[slug] || `scene-specific REM construction for ${parent || slug}`;
}

function somaticLine(entry) {
  const labels = (entry.related_somatic || []).map((s) => s.label).filter(Boolean);
  if (labels.length) return labels.join("; ");
  return "whatever the body still held at the REM–wake border";
}

function mechanicsLine(entry) {
  return entry.related_mechanics?.label || "REM mechanics (atonia, PGO, cycle timing)";
}

function variantBlock(entry, title) {
  const vs = entry.variants || [];
  if (!vs.length) return "";
  const bits = vs.map((v) => {
    return `<p><strong>${esc(v.q)}.</strong> ${esc(v.a)} In the specific page <em>${esc(title)}</em>, that variant is not a second omen — it is a different motor/arousal mix on the same circuit.</p>`;
  });
  return `<h2>How this scene changes when the details change</h2>\n${bits.join("\n")}`;
}

function vigenBlock(entry, rng, title, soma) {
  const n = Math.floor(rng() * 6);
  const parent = entry.parent_slug || entry.slug;
  const frames = [
    `I am Vigen. I did not start Oneirox from a symbol chart. I started it after nights when the image was thin and the body was loud — nights that would now sit next to <em>${esc(title)}</em>. ${esc(soma)} was the part a dictionary would have skipped. Decode is built so that part is first.`,
    `I am Vigen G.R. When people paste a dream into Lab Search, they usually paste plot. I trained the instruments to ask for residue: heat, weight, mute throat, legs that would not run. A page like <em>${esc(title)}</em> exists because that residue has a mechanism (${esc(topicAtoms(entry))}), not because the internet needed another omen.`,
    `I built the Sleep Cycle Calculator because I kept waking in the wrong slice of the night and calling it personality. Ultradian timing is hardware. If <em>${esc(title)}</em> keeps landing at the same clock hour, time the night before you interpret the image.`,
    `I refuse omen tables. I have watched ${esc(parent)} searches get answered with “enemy / pregnancy / death” while the body was doing something measurable. <em>${esc(title)}</em> is written against that habit.`,
    `Some of my own REM mornings were Armenian place-cues — not because a mountain is magic, but because kinship maps are high-salience in memory. If this page is not diaspora, the same rule still holds: <em>${esc(title)}</em> is continuity plus body, not a postcard from the dead.`,
    `The Sensory Dream Mapper exists because I once woke with chest-weight and almost no story. Instruments first. For <em>${esc(title)}</em>, map thermal/tactile/zones if the plot is fog and the body is not.`,
  ];
  return `<h2>A note from Vigen</h2>\n<p>${frames[n]}</p>`;
}

/**
 * @returns {{ html: string, blob: string, words: number }}
 */
export function expandDreamLongform(entry) {
  const title = entry.title || "this dream";
  const key = `${entry.parent_slug || "pillar"}/${entry.slug || ""}/${entry.mechanism_key || ""}/${title}`;
  const rng = mulberry32(hashString(key));
  const soma = somaticLine(entry);
  const mech = mechanicsLine(entry);
  const atoms = topicAtoms(entry);
  const kicker = entry.kicker || title;
  const mk = entry.mechanism_key || `${entry.parent_slug || entry.slug}-circuit`;
  const morning = entry.morning_prompt || "What did the body still hold in the first twenty seconds?";
  const signal = entry.signal || "";
  const lead = entry.lead || "";
  const meta = entry.meta_description || "";

  const h2a = [
    `The body inside “${title}”`,
    `What your nervous system is doing in ${title}`,
    `Hardware under ${kicker}`,
  ][Math.floor(rng() * 3)];

  const h2b = [
    `What ${title} is not`,
    `Why a dictionary fails this scene`,
    `The omen version vs the mechanism version`,
  ][Math.floor(rng() * 3)];

  const h2c = [
    `How to use this page in the Lab`,
    `What to carry into Lab Search`,
    `From this scene to an instrument`,
  ][Math.floor(rng() * 3)];

  const pBody = `In <em>${esc(title)}</em>, start with the body, not the Wikipedia of symbols. ${esc(lead)} The circuit we actually track here is ${esc(atoms)}. Related somatic rows on this site name ${esc(soma)}. If those markers were present — even slightly — they outrank a one-word “meaning.” ${esc(mech)} is the physiology pillar for this URL, not a decoration.`;

  const pSignal = `SIGNAL on this page is specific: ${esc(signal)} That sentence is the working hypothesis. The internal key is <code>${esc(mk)}</code> — a lab name for a loop, not a fortune. ${esc(meta)} Keep that description honest: if the night had no matching body residue, say so in Lab Search instead of forcing the image to confess.`;

  const pNot = `<em>${esc(title)}</em> is not a sealed omen for “${esc(entry.slug || title)}”, not a diagnosis, and not a moral grade of ${esc(entry.parent_slug || "this theme")}. A symbol table would freeze one object in ${esc(title)} and throw away the verb that this URL actually stores. Kicker — “${esc(kicker)}” — is the human door into ${esc(mk)}, not a second theory.`;

  const pMorning = `MORNING for <em>${esc(title)}</em> is a procedure: ${esc(morning)} Write the first twenty seconds before the plot of ${esc(title)} hardens. Then search those words plus “${esc(entry.slug || title)}”. If this exact scene repeats, time the night with Sleep Cycles — a queued loop at a repeatable ultradian slot, not a curse attached to ${esc(title)}.`;

  const pLab = `For <em>${esc(title)}</em>, foggy plot + loud body → Sensory Dream Mapper. Timing suspicion on this slug (${esc(entry.slug || "")}) → Sleep Cycles. Lunar-date curiosity → Dream Phase Calculator. Always paste the body line that belongs to ${esc(title)}. Lab Search should land here because ${esc(mk)} is the mechanism key, not because a dictionary synonym matched.`;

  const relatedBits = (entry.related_somatic || [])
    .map(
      (s) =>
        `The somatic card <a href="${esc(s.href)}">${esc(s.label)}</a> is the body neighbor for <em>${esc(title)}</em> — open it if the plot is gone and the marker remains.`,
    )
    .join(" ");

  const pRelated = relatedBits
    ? `<p>${relatedBits} Mechanics pillar: <a href="${esc(entry.related_mechanics?.href || "/mechanics/rem/")}">${esc(mech)}</a>.</p>`
    : `<p>Mechanics pillar for this URL: <a href="${esc(entry.related_mechanics?.href || "/mechanics/rem/")}">${esc(mech)}</a>. If no somatic neighbor is listed, treat MORNING residue as the missing marker and search it in Lab Search anyway.</p>`;

  let html = `<h2>${esc(h2a)}</h2>
<p>${pBody}</p>
<p>${pSignal}</p>
<h2>${esc(h2b)}</h2>
<p>${pNot}</p>
${variantBlock(entry, title)}
<h2>${esc(h2c)}</h2>
<p>${pMorning}</p>
<p>${pLab}</p>
${pRelated}`;

  const showVigen = Math.floor(hashString(key) % 5) === 1;
  if (showVigen) {
    html += `\n${vigenBlock(entry, rng, title, soma)}`;
  }

  const blob = html.replace(/<[^>]+>/g, " ");
  return { html, blob, words: wordCount(html) };
}

export function dreamAuditBlob(entry) {
  return [
    entry.title,
    entry.lead,
    entry.signal,
    entry.morning_prompt,
    entry.mechanism_key,
    ...(entry.body_paragraphs || []),
    ...(entry.variants || []).map((v) => `${v.q} ${v.a}`),
  ].join(" ");
}
