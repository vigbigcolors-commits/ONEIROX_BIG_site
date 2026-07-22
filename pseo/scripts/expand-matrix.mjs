/**
 * Expand gold somatic seeds + symptom catalog into a unique matrix (~target rows).
 * Usage: node pseo/scripts/expand-matrix.mjs [--target=1500] [--pilot=200]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clamp, hashString, mulberry32, uniqueSorted } from "../lib/seed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GOLD_PATH = path.join(ROOT, "data", "somatic-matrix.gold.json");
const OUT_PATH = path.join(ROOT, "data", "somatic-matrix.json");

const PHASES = ["N1", "N2", "N3", "REM"];
const PHASE_SLUG = { N1: "n1", N2: "n2", N3: "n3", REM: "rem" };
const CONTEXTS = ["onset", "mid-cycle", "awakening", "fragmentation"];

const PHASE_EEG = {
  N1: { min: 4, max: 7, band: "theta" },
  N2: { min: 11, max: 16, band: "sigma" },
  N3: { min: 0.5, max: 2, band: "delta" },
  REM: { min: 4, max: 8, band: "theta" },
};

const TX = [
  "GABA",
  "glycine",
  "acetylcholine",
  "norepinephrine",
  "serotonin",
  "dopamine",
  "orexin",
  "histamine",
  "glutamate",
  "adenosine",
  "melatonin",
];

const SOURCES_POOL = [
  "Sleep stage EEG banding",
  "Brainstem motor inhibition",
  "Autonomic sleep physiology",
  "Thalamocortical gating",
  "REM–NREM flip-flop",
  "Homeostatic sleep pressure",
  "Aminergic–cholinergic balance",
  "Muscle atonia circuits",
];

/** Catalog: physiological triggers with phase affinity (higher = more valid). */
const CATALOG = [
  { slug: "sleep-paralysis-onset", name: "Sleep paralysis at REM–wake border", affinity: { REM: 3, N1: 1, N2: 0, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["limb immobility", "chest pressure", "inability to vocalize"] },
  { slug: "hypnic-jerk", name: "Hypnic myoclonus (sleep start)", affinity: { N1: 3, N2: 1, N3: 0, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["sudden limb twitch", "falling sensation", "brief heart-rate spike"] },
  { slug: "hypnagogic-tachycardia", name: "Tachycardia in hypnagogia", affinity: { N1: 3, N2: 1, N3: 0, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["racing heartbeat", "warm flush", "restless limbs"] },
  { slug: "rem-atonia-failure", name: "Partial REM atonia failure", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["twitching limbs", "talking / vocalization", "brief motor breakthrough"] },
  { slug: "sleep-related-bruxism", name: "Sleep-related bruxism", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["jaw tension", "tooth grinding", "temporalis tightness"] },
  { slug: "nocturnal-hyperhidrosis", name: "Nocturnal hyperhidrosis", affinity: { N3: 3, N2: 2, REM: 2, N1: 1 }, utility: "eeg_baseline", atonia: "N/A", markers: ["profuse sweating", "clammy skin", "heat flush"] },
  { slug: "hypnopompic-somatic-surge", name: "Hypnopompic somatic surge", affinity: { REM: 3, N1: 2, N2: 1, N3: 1 }, utility: "phase_disruption", atonia: "partial_failure", markers: ["whole-body jolt", "breath catch", "skin crawl"] },
  { slug: "rem-eye-twitch-burst", name: "Phasic REM eye-twitch burst", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["rapid eye movements", "lid flutter", "facial micro-twitches"] },
  { slug: "k-complex-arousal", name: "K-complex linked micro-arousal", affinity: { N2: 3, N3: 1, N1: 1, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["brief body startle", "breath irregularity", "finger twitch"] },
  { slug: "sleep-spindle-burst", name: "Dense sleep-spindle burst", affinity: { N2: 3, N3: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["still body", "slow breathing", "reduced muscle tone"] },
  { slug: "slow-wave-body-stillness", name: "Deep NREM body stillness", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["minimal movement", "slow vital signs", "heavy limb weight"] },
  { slug: "rem-hrv-constriction", name: "REM HRV constriction", affinity: { REM: 3, N2: 1, N1: 1, N3: 0 }, utility: "phase_disruption", atonia: "preserved", markers: ["irregular heartbeat feel", "chest flutter", "shallow breath bursts"] },
  { slug: "hypnagogic-limb-float", name: "Hypnagogic limb-float percept", affinity: { N1: 3, N2: 1, REM: 1, N3: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["floating limbs", "body-boundary blur", "light numbness"] },
  { slug: "periodic-limb-movement", name: "Periodic limb movements in sleep", affinity: { N2: 3, N1: 2, N3: 2, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["rhythmic leg kicks", "ankle dorsiflexion", "micro-arousal after kick"] },
  { slug: "sleep-onset-breath-pause", name: "Sleep-onset breathing pause", affinity: { N1: 3, N2: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["breath hold feel", "chest stillness", "gasping restart"] },
  { slug: "rem-genital-engorgement", name: "REM-linked genital engorgement", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["genital vascular engorgement", "pelvic warmth", "preserved limb atonia"] },
  { slug: "early-n3-stillness", name: "Early-night N3 stillness window", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["deep muscle looseness", "low reactivity", "cool extremities"] },
  { slug: "fragmented-rem", name: "Fragmented REM with micro-arousals", affinity: { REM: 3, N1: 1, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "partial_failure", markers: ["start-stop REM feel", "brief body shifts", "dry mouth on wakelets"] },
  { slug: "alpha-intrusion-nrem", name: "Alpha intrusion into NREM", affinity: { N2: 3, N3: 2, N1: 2, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["unrefreshing stillness", "muscle tension pockets", "light sleep feel"] },
  { slug: "tonic-rem-stillness", name: "Tonic REM stillness", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["full-body atonia", "irregular breathing", "warm face"] },
  { slug: "microsleep-nod", name: "Microsleep nod into N1", affinity: { N1: 3, N2: 1, N3: 0, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["head drop", "eyelid closure", "grip loosen"] },
  { slug: "n3-confusional-motor", name: "Confusional arousal motor residue", affinity: { N3: 3, N2: 2, N1: 1, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["slow clumsy movement", "mumbled speech motor", "disoriented posture"] },
  { slug: "rem-thermoreg-blunt", name: "REM thermoregulatory blunting", affinity: { REM: 3, N2: 1, N1: 1, N3: 1 }, utility: "eeg_baseline", atonia: "preserved", markers: ["odd hot/cold shifts", "reduced shivering drive", "skin temperature drift"] },
  { slug: "n2-swallow-burst", name: "Sleep-related swallow reflex burst", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["throat swallow", "laryngeal click", "brief neck tension"] },
  { slug: "pre-rem-atonia-ramp", name: "Pre-REM atonia ramp", affinity: { N2: 3, REM: 2, N1: 1, N3: 1 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["progressive limb heaviness", "face slackening", "eye movement precursors"] },
  { slug: "awakening-motor-ready", name: "Morning cortisol-linked motor readiness", affinity: { N1: 3, REM: 2, N2: 1, N3: 1 }, utility: "eeg_baseline", atonia: "N/A", markers: ["stretch urge", "limb warmth return", "jaw unclench"] },
  { slug: "rem-sawtooth-onset", name: "REM sawtooth-wave window", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["eye-movement onset", "facial stillness", "limb lock-in"] },
  { slug: "n3-bradycardia", name: "N3-linked relative bradycardia", affinity: { N3: 3, N2: 2, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["slow pulse feel", "cool skin", "deep chest ease"] },
  { slug: "exploding-head-burst", name: "Exploding-head sensory burst", affinity: { N1: 3, N2: 1, REM: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["loud internal bang percept", "scalp jolt", "startle freeze"] },
  { slug: "rem-distal-twitch", name: "Distal REM muscle twitches", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["finger twitches", "toe flicks", "facial micro-jerks"] },
  { slug: "hypnagogic-jerk-cascade", name: "Cascading hypnagogic myoclonus", affinity: { N1: 3, N2: 1, N3: 0, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["serial limb jerks", "startle breath", "bed-frame kick"] },
  { slug: "rem-nose-twitch", name: "REM facial distal twitch", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["nose twitch", "lip flicker", "cheek micro-jerk"] },
  { slug: "n2-cortical-upstate", name: "N2 cortical up-state stillness", affinity: { N2: 3, N3: 2, N1: 1, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["quiet limbs", "even breath", "soft jaw"] },
  { slug: "rem-irregular-respiration", name: "REM irregular respiration", affinity: { REM: 3, N1: 1, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "preserved", markers: ["uneven breath", "brief apnea-like pause", "chest flutter"] },
  { slug: "n3-growth-window", name: "N3 recovery stillness window", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["heavy limbs", "low startle", "slow swallow"] },
  { slug: "sleep-talk-nrem", name: "NREM sleep-talk motor residue", affinity: { N2: 3, N3: 2, N1: 2, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["mumbled vocalization", "jaw movement", "throat tension"] },
  { slug: "rem-sleep-talk", name: "REM-linked vocal breakthrough", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["spoken fragments", "lip movement", "neck strain"] },
  { slug: "n1-vestibular-spin", name: "Hypnagogic vestibular spin", affinity: { N1: 3, REM: 2, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["spinning percept", "inner-ear tug", "grip tighten"] },
  { slug: "n2-sensory-gating", name: "N2 sensory gating quietude", affinity: { N2: 3, N3: 2, N1: 1, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["muffled external sound", "still torso", "soft blinkless lids"] },
  { slug: "rem-pupil-shift", name: "REM autonomic pupil shift", affinity: { REM: 3, N1: 1, N2: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["lid shimmer", "orbital warmth", "facial atonia"] },
  { slug: "n3-hard-to-rouse", name: "High-threshold N3 arousal", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["delayed motor response", "sluggish stretch", "deep inertia"] },
  { slug: "hypnopompic-immobility", name: "Hypnopompic residual immobility", affinity: { REM: 3, N1: 2, N2: 1, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["can't move on wake", "eye-only movement", "chest weight"] },
  { slug: "n2-microarousal-hr", name: "N2 micro-arousal heart bump", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["heart bump", "finger flex", "breath catch"] },
  { slug: "rem-phasic-hr-surge", name: "Phasic REM heart-rate surge", affinity: { REM: 3, N2: 0, N1: 1, N3: 0 }, utility: "phase_disruption", atonia: "preserved", markers: ["pulse surge", "chest thump", "limb stillness"] },
  { slug: "n1-ear-whoosh", name: "Hypnagogic auditory whoosh", affinity: { N1: 3, N2: 1, REM: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["internal whoosh", "scalp tingle", "shoulder hitch"] },
  { slug: "n3-sweat-cooling", name: "N3 evaporative cooling sweat", affinity: { N3: 3, N2: 2, REM: 1, N1: 1 }, utility: "eeg_baseline", atonia: "N/A", markers: ["light sweat", "cool sheet cling", "still core"] },
  { slug: "rem-leg-kick-isolated", name: "Isolated REM leg kick", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["single leg kick", "hip twitch", "sheet tug"] },
  { slug: "n2-brux-microburst", name: "Brief N2 brux microburst", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["short grind", "masseter flicker", "temple ache residue"] },
  { slug: "sleep-start-abdominal", name: "Abdominal hypnic start", affinity: { N1: 3, N2: 1, N3: 0, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["abdominal jolt", "diaphragm hitch", "hand clench"] },
  { slug: "rem-chin-atonia", name: "REM chin EMG silence", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["jaw slack", "chin silence", "tongue rest"] },
  { slug: "n2-spindle-quiet-hands", name: "Spindle-linked hand quietude", affinity: { N2: 3, N3: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["still fingers", "warm palms", "slow nail-bed pulse"] },
  { slug: "n3-snore-vibration", name: "N3 airway vibration (snore)", affinity: { N3: 3, N2: 2, REM: 1, N1: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["throat vibration", "chest rumble", "dry mouth"] },
  { slug: "rem-airway-tone-drop", name: "REM upper-airway tone drop", affinity: { REM: 3, N2: 1, N1: 1, N3: 1 }, utility: "phase_disruption", atonia: "preserved", markers: ["quieter inhale", "soft palate slack", "nasal effort"] },
  { slug: "n1-body-map-blur", name: "N1 body-map blur", affinity: { N1: 3, REM: 2, N2: 1, N3: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["unclear limb position", "hand size distort", "light float"] },
  { slug: "n2-leg-cramp-micro", name: "Nocturnal leg-cramp micro-onset", affinity: { N2: 3, N1: 2, N3: 2, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["calf tighten", "toe curl", "pain-wake nudge"] },
  { slug: "rem-tear-film-shift", name: "REM ocular surface shift", affinity: { REM: 3, N1: 1, N2: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["dry eye residue", "lid stick", "orbital ache soft"] },
  { slug: "n3-immune-rest-still", name: "Deep-rest somatic quiet", affinity: { N3: 3, N2: 2, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["immune-rest stillness", "low fidget", "steady core temp"] },
  { slug: "fragmented-n2-toss", name: "Fragmented N2 toss-turn", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["side-to-side roll", "pillow adjust", "brief eyes-open"] },
  { slug: "rem-clench-release", name: "REM hand clench–release", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["fist clench", "finger splay", "forearm twitch"] },
  { slug: "n1-phosphene-flash", name: "Hypnagogic phosphene flash", affinity: { N1: 3, REM: 2, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["light flash behind lids", "brow twitch", "startle inhale"] },
  { slug: "n2-heartbeat-awareness", name: "N2 heartbeat awareness spike", affinity: { N2: 3, N1: 2, REM: 2, N3: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["felt heartbeat", "chest focus", "still limbs"] },
  { slug: "rem-middle-ear-muscle", name: "REM middle-ear muscle activity", affinity: { REM: 3, N1: 1, N2: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["ear click", "pressure pop", "jaw hinge soft"] },
  { slug: "n3-delta-wave-lock", name: "Delta-wave motor lock", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["immobile trunk", "slow breath", "heavy eyelids"] },
  { slug: "pre-wake-stretch-reflex", name: "Pre-wake stretch reflex", affinity: { N1: 3, REM: 2, N2: 2, N3: 1 }, utility: "eeg_baseline", atonia: "N/A", markers: ["full-body stretch", "yawn motor", "toe point"] },
  { slug: "rem-sympathetic-burst", name: "REM sympathetic burst", affinity: { REM: 3, N1: 1, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "preserved", markers: ["skin prickle", "pulse jump", "palm sweat"] },
  { slug: "n2-thumb-twitch", name: "N2 distal thumb twitch", affinity: { N2: 3, N1: 2, REM: 1, N3: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["thumb flick", "thenar twitch", "brief arousal"] },
  { slug: "n1-falling-elevator", name: "Hypnagogic falling-elevator", affinity: { N1: 3, N2: 1, N3: 0, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["elevator-drop feel", "gut lift", "arm flail"] },
  { slug: "rem-genital-pulse", name: "REM pelvic vascular pulse", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["pelvic pulse", "warmth wave", "limb lock"] },
  { slug: "n3-parasomnia-gate", name: "N3 motor gate instability", affinity: { N3: 3, N2: 2, N1: 1, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["sit-up impulse", "blank stare motor", "slow walk residue"] },
  { slug: "n2-pillow-grip", name: "N2 pillow-grip tension", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["hand grip on fabric", "forearm hold", "shoulder hike"] },
  { slug: "rem-eyelid-flutter", name: "REM eyelid flutter train", affinity: { REM: 3, N1: 1, N2: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["lid flutter", "orbicularis twitch", "brow stillness"] },
  { slug: "n1-throat-click", name: "N1 airway click", affinity: { N1: 3, N2: 2, REM: 1, N3: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["throat click", "swallow once", "neck soft"] },
  { slug: "n2-sigma-reset", name: "Sigma-band sensory reset", affinity: { N2: 3, N3: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["external mute", "still ankles", "even nostrils"] },
  { slug: "rem-tonic-jaw-drop", name: "Tonic REM jaw drop", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["open-mouth rest", "dry lip", "chin hang"] },
  { slug: "n3-core-cooling", name: "N3 core-cooling drift", affinity: { N3: 3, N2: 2, N1: 1, REM: 1 }, utility: "eeg_baseline", atonia: "N/A", markers: ["cooler core feel", "blanket seek", "curl posture"] },
  { slug: "fragment-rem-eye-only", name: "Fragmented REM eye-only wake", affinity: { REM: 3, N1: 2, N2: 1, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["eyes open immobile", "panic breath", "limb lock"] },
  { slug: "n2-ankle-roll", name: "N2 ankle roll micro-move", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["ankle roll", "heel scrape", "brief EEG bump"] },
  { slug: "n1-heartbeat-in-ear", name: "N1 pulse-in-ear percept", affinity: { N1: 3, N2: 2, REM: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["pulse in ear", "temple beat", "still body"] },
  { slug: "rem-shoulder-drop", name: "REM shoulder-drop atonia", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["shoulder melt", "scapula rest", "arm dead-weight"] },
  { slug: "n3-hard-swallow", name: "Rare N3 protective swallow", affinity: { N3: 3, N2: 2, N1: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["single swallow", "larynx rise", "delta resume"] },
  { slug: "n2-nose-itch-suppress", name: "N2 itch-suppress stillness", affinity: { N2: 3, N3: 2, N1: 1, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["unacted itch", "face still", "breath even"] },
  { slug: "rem-finger-piano", name: "REM finger piano twitches", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["sequential finger taps", "wrist soft", "forearm quiet"] },
  { slug: "n1-skin-crawl", name: "Hypnagogic skin-crawl", affinity: { N1: 3, REM: 2, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["formication-like crawl", "shoulder shiver", "sheet kick"] },
  { slug: "n2-ear-canal-itch", name: "N2 ear-canal itch micro-arousal", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["ear itch", "head turn", "hand-to-ear abort"] },
  { slug: "rem-pelvic-floor-twitch", name: "REM pelvic-floor twitch", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["pelvic twitch", "lower-abs flicker", "limb atonia hold"] },
  { slug: "n3-immobility-max", name: "Maximal N3 immobility", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["zero fidget", "slow vitals", "deep inertia"] },
  { slug: "n1-lip-numb", name: "Hypnagogic lip numbness", affinity: { N1: 3, N2: 1, REM: 1, N3: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["lip numb", "cheek tingle", "soft jaw"] },
  { slug: "n2-knee-draw", name: "N2 knee-draw posture shift", affinity: { N2: 3, N1: 2, N3: 2, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["knees draw up", "hip flex", "blanket tug"] },
  { slug: "rem-neck-atonia", name: "REM neck extensor atonia", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["neck melt", "head heavy", "pillow sink"] },
  { slug: "n3-arousal-threshold", name: "Elevated N3 arousal threshold", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["ignored noise", "no flinch", "continued stillness"] },
  { slug: "hypnopompic-chest-weight", name: "Hypnopompic chest-weight", affinity: { REM: 3, N1: 2, N2: 1, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["chest weight", "shallow first breaths", "limb delay"] },
  { slug: "n2-wrist-flex", name: "N2 wrist-flex microburst", affinity: { N2: 3, N1: 2, REM: 1, N3: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["wrist flex", "finger curl", "forearm EMG bump"] },
  { slug: "rem-cheek-puff", name: "REM cheek puff micro-move", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["cheek puff", "soft exhale burst", "lip part"] },
  { slug: "n1-room-tilt", name: "Hypnagogic room-tilt", affinity: { N1: 3, REM: 1, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["room tilt percept", "hand brace", "abdominal clutch"] },
  { slug: "n3-delta-hrv-high", name: "N3 high HRV calm", affinity: { N3: 3, N2: 2, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["calm pulse variability", "warm belly", "loose hips"] },
  { slug: "rem-foot-point", name: "REM foot-point twitch", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["foot point", "plantar flex", "calf flicker"] },
  { slug: "n2-shoulder-shrug-abort", name: "Aborted N2 shoulder shrug", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["half shrug", "trap flicker", "return to still"] },
  { slug: "n1-tongue-rest", name: "N1 tongue-rest shift", affinity: { N1: 3, N2: 2, REM: 1, N3: 1 }, utility: "eeg_baseline", atonia: "N/A", markers: ["tongue drop", "soft palate ease", "jaw unclench"] },
  { slug: "rem-brow-knit", name: "Phasic REM brow knit", affinity: { REM: 3, N2: 0, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["brow knit", "glabella twitch", "eye burst sync"] },
  { slug: "n3-limb-heaviness", name: "N3 extreme limb heaviness", affinity: { N3: 3, N2: 2, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["lead limbs", "no urge to move", "deep exhale"] },
  { slug: "n2-cortical-k-guard", name: "Protective K-complex stillness", affinity: { N2: 3, N3: 1, N1: 1, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["freeze after sound", "held breath beat", "resume spindle"] },
  { slug: "rem-autonomic-swing", name: "REM autonomic swing", affinity: { REM: 3, N1: 1, N2: 1, N3: 0 }, utility: "phase_disruption", atonia: "preserved", markers: ["hot-cold swing", "pulse irregular", "palm damp"] },
  { slug: "n1-hand-size-distort", name: "N1 hand-size distortion", affinity: { N1: 3, REM: 2, N2: 1, N3: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["huge/small hand feel", "finger tingle", "wrist float"] },
  { slug: "n2-tooth-contact", name: "N2 light tooth contact", affinity: { N2: 3, N1: 2, N3: 1, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["tooth touch", "masseter tone", "no full grind"] },
  { slug: "rem-diaphragm-flutter", name: "REM diaphragm flutter", affinity: { REM: 3, N2: 1, N1: 1, N3: 0 }, utility: "phase_disruption", atonia: "preserved", markers: ["diaphragm flutter", "hiccup-like tick", "chest still else"] },
  { slug: "n3-first-cycle-peak", name: "First-cycle N3 peak stillness", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["peak stillness", "lowest fidget", "cool feet"] },
  { slug: "awakening-rem-hangover-motor", name: "REM-exit motor hangover", affinity: { REM: 3, N1: 2, N2: 1, N3: 0 }, utility: "atonia_risk", atonia: "partial_failure", markers: ["slow limb reboot", "face numb fade", "stand delay"] },
  { slug: "n2-blanket-kick", name: "N2 thermal blanket kick", affinity: { N2: 3, N1: 2, N3: 2, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["blanket kick", "foot uncover", "return to curl"] },
  { slug: "n1-neck-snap-percept", name: "Hypnagogic neck-snap percept", affinity: { N1: 3, N2: 1, N3: 0, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["neck snap feel", "shoulder jump", "heart spike"] },
  { slug: "rem-tongue-base-relax", name: "REM tongue-base relaxation", affinity: { REM: 3, N2: 1, N1: 1, N3: 1 }, utility: "atonia_risk", atonia: "preserved", markers: ["tongue base drop", "airway soft", "snore risk tone"] },
  { slug: "n3-no-dream-motor", name: "Dreamless N3 motor quiet", affinity: { N3: 3, N2: 1, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["no dream motor", "blank stillness", "slow swallow rare"] },
  { slug: "n2-elbow-flex", name: "N2 elbow-flex micro", affinity: { N2: 3, N1: 2, REM: 1, N3: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["elbow flex", "biceps flicker", "re-settle"] },
  { slug: "rem-scalp-tingle", name: "REM scalp autonomic tingle", affinity: { REM: 3, N1: 1, N2: 0, N3: 0 }, utility: "eeg_baseline", atonia: "preserved", markers: ["scalp tingle", "hair-line prickle", "face atonia"] },
  { slug: "fragmented-n1-loop", name: "Fragmented N1 onset loop", affinity: { N1: 3, N2: 1, N3: 0, REM: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["doze-wake loop", "head bob", "grip reset"] },
  { slug: "n2-hip-rotate", name: "N2 hip rotate settle", affinity: { N2: 3, N3: 2, N1: 2, REM: 1 }, utility: "phase_disruption", atonia: "N/A", markers: ["hip rotate", "pelvis settle", "quiet after"] },
  { slug: "rem-wrist-drop", name: "REM wrist-drop atonia", affinity: { REM: 3, N2: 1, N1: 0, N3: 0 }, utility: "atonia_risk", atonia: "preserved", markers: ["wrist drop", "hand open", "finger limp"] },
  { slug: "n3-auditory-gate", name: "N3 auditory gate closed", affinity: { N3: 3, N2: 2, N1: 0, REM: 0 }, utility: "eeg_baseline", atonia: "N/A", markers: ["sound ignored", "no orient", "continued delta"] },
  { slug: "n1-solar-plexus-drop", name: "Hypnagogic solar-plexus drop", affinity: { N1: 3, N2: 1, REM: 1, N3: 0 }, utility: "phase_disruption", atonia: "N/A", markers: ["solar plexus drop", "anxiety-like gut", "hand to belly"] },
];

const CONTEXT_COPY = {
  onset: "at the transition into this stage",
  "mid-cycle": "during stable time-in-stage",
  awakening: "near exit toward wake",
  fragmentation: "when the stage is interrupted by micro-arousals",
};

const CONTEXT_GAUGE = {
  onset: { atonia: 0, arousal: 8, coherence: -5 },
  "mid-cycle": { atonia: 5, arousal: -5, coherence: 10 },
  awakening: { atonia: -8, arousal: 15, coherence: -12 },
  fragmentation: { atonia: -5, arousal: 12, coherence: -18 },
};

function parseArgs(argv) {
  let target = 1500;
  for (const a of argv) {
    if (a.startsWith("--target=")) target = Number(a.slice(9));
  }
  return { target };
}

function fingerprint(entry) {
  return [
    entry.eeg_frequency_hz_range.band,
    entry.eeg_frequency_hz_range.min.toFixed(2),
    entry.eeg_frequency_hz_range.max.toFixed(2),
    uniqueSorted(entry.neurotransmitters_involved).join("|"),
    uniqueSorted(entry.somatic_markers).join("|"),
    entry.atonia_state,
    entry.utility_type,
  ].join("::");
}

function differenceScore(a, b) {
  let d = 0;
  if (a.eeg_frequency_hz_range.band !== b.eeg_frequency_hz_range.band) d++;
  if (Math.abs(a.eeg_frequency_hz_range.min - b.eeg_frequency_hz_range.min) >= 0.3) d++;
  if (Math.abs(a.eeg_frequency_hz_range.max - b.eeg_frequency_hz_range.max) >= 0.3) d++;
  const ta = new Set(a.neurotransmitters_involved);
  const tb = new Set(b.neurotransmitters_involved);
  const tOverlap = [...ta].filter((x) => tb.has(x)).length;
  if (tOverlap <= Math.min(ta.size, tb.size) - 1) d++;
  const ma = new Set(a.somatic_markers);
  const mb = new Set(b.somatic_markers);
  const mOverlap = [...ma].filter((x) => mb.has(x)).length;
  if (mOverlap <= 1) d++;
  if (a.atonia_state !== b.atonia_state) d++;
  if (a.chart_seed !== b.chart_seed) d += 0; // seed uniqueness checked separately
  return d;
}

function mutateEeg(base, phase, context, rng) {
  const phaseEeg = PHASE_EEG[phase];
  let min = phaseEeg.min + (rng() - 0.5) * 0.8;
  let max = phaseEeg.max + (rng() - 0.5) * 1.2;
  if (context === "fragmentation") {
    max += 1.5 + rng();
  }
  if (context === "awakening") {
    max += 0.8;
    min += 0.3;
  }
  min = clamp(Number(min.toFixed(2)), 0.3, 30);
  max = clamp(Number(max.toFixed(2)), min + 0.4, 40);
  let band = phaseEeg.band;
  if (context === "fragmentation" && rng() > 0.55) band = "mixed";
  if (phase === "N2" && rng() > 0.85) band = "mixed";
  return { min, max, band };
}

function transmittersFor(sym, phase, context, rng) {
  const base = [];
  if (sym.utility === "atonia_risk") base.push("glycine", "GABA");
  if (phase === "REM") base.push("acetylcholine");
  if (phase === "N3") base.push("GABA", "adenosine");
  if (phase === "N2") base.push("GABA", "glutamate");
  if (phase === "N1") base.push("orexin", "GABA");
  if (context === "awakening" || context === "fragmentation") base.push("norepinephrine");
  if (context === "onset" && phase === "N1") base.push("histamine");
  while (base.length < 3) base.push(TX[Math.floor(rng() * TX.length)]);
  return uniqueSorted(base).slice(0, 3 + Math.floor(rng() * 2));
}

function markersFor(sym, context, rng) {
  const extra = {
    onset: "transition tone shift",
    "mid-cycle": "stable stage somatic quiet",
    awakening: "exit-bound motor reboot",
    fragmentation: "micro-arousal body hitch",
  };
  const pool = [...sym.markers, extra[context]];
  // slight wording variant via order + optional add-on
  const addons = [
    "brief autonomic flicker",
    "residual muscle tone change",
    "stage-boundary sensory gate",
    "ventilatory rhythm wobble",
  ];
  if (rng() > 0.4) pool.push(pickAddon(rng, addons));
  return uniqueSorted(pool).slice(0, 3 + Math.floor(rng() * 2));
}

function pickAddon(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function gauges(sym, context, rng) {
  const adj = CONTEXT_GAUGE[context];
  const baseAtonia =
    sym.atonia === "preserved" ? 88 : sym.atonia === "partial_failure" ? 55 : 35;
  const baseArousal =
    sym.utility === "phase_disruption" ? 65 : sym.utility === "atonia_risk" ? 45 : 28;
  const baseCoh = sym.utility === "eeg_baseline" ? 75 : 48;
  return {
    gauge_atonia: clamp(Math.round(baseAtonia + adj.atonia + (rng() - 0.5) * 10), 5, 98),
    gauge_arousal: clamp(Math.round(baseArousal + adj.arousal + (rng() - 0.5) * 10), 5, 98),
    gauge_coherence: clamp(Math.round(baseCoh + adj.coherence + (rng() - 0.5) * 8), 5, 98),
  };
}

function buildEntry(sym, phase, context) {
  const idKey = `${sym.slug}|${phase}|${context}`;
  const seed = hashString(idKey) % 100000000;
  const rng = mulberry32(seed);
  const eeg = mutateEeg(PHASE_EEG[phase], phase, context, rng);
  const txs = transmittersFor(sym, phase, context, rng);
  const markers = markersFor(sym, context, rng);
  const g = gauges(sym, context, rng);
  let atonia = sym.atonia;
  if (phase !== "REM" && atonia === "preserved" && sym.utility !== "atonia_risk") {
    atonia = "N/A";
  }
  if (phase === "REM" && sym.utility === "atonia_risk" && context === "fragmentation") {
    atonia = "partial_failure";
  }

  const title = `${sym.name} · ${phase} · ${context}`;
  const summary = `${sym.name} modeled ${CONTEXT_COPY[context]} in ${phase}. EEG emphasis ${eeg.min}–${eeg.max} Hz (${eeg.band}); transmitters ${txs.join(", ")}.`;

  return {
    id: `${sym.slug}--${PHASE_SLUG[phase]}--${context}`,
    slug_symptom: sym.slug,
    slug_phase: PHASE_SLUG[phase],
    slug_context: context,
    physiological_symptom: sym.name,
    sleep_phase: phase,
    context,
    eeg_frequency_hz_range: eeg,
    neurotransmitters_involved: txs,
    somatic_markers: markers,
    atonia_state: atonia,
    chart_seed: seed,
    utility_type: sym.utility,
    title,
    summary,
    ...g,
    sources: [
      SOURCES_POOL[seed % SOURCES_POOL.length],
      SOURCES_POOL[(seed >> 3) % SOURCES_POOL.length],
    ],
  };
}

function passesUniqueness(candidate, accepted) {
  for (let i = accepted.length - 1; i >= Math.max(0, accepted.length - 40); i--) {
    const prev = accepted[i];
    if (prev.chart_seed === candidate.chart_seed) return false;
    if (
      prev.slug_symptom === candidate.slug_symptom &&
      prev.slug_phase === candidate.slug_phase &&
      prev.slug_context === candidate.slug_context
    ) {
      return false;
    }
    if (differenceScore(candidate, prev) < 2 && prev.slug_symptom === candidate.slug_symptom) {
      return false;
    }
  }
  return true;
}

function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const gold = JSON.parse(fs.readFileSync(GOLD_PATH, "utf8"));
  const accepted = [];
  const seenFp = new Set();
  const seenId = new Set();

  for (const e of gold.entries) {
    const row = {
      id: `${e.slug_symptom}--${e.slug_phase}--${e.slug_context}`,
      ...e,
    };
    accepted.push(row);
    seenFp.add(fingerprint(row));
    seenId.add(row.id);
  }

  const candidates = [];
  for (const sym of CATALOG) {
    for (const phase of PHASES) {
      const aff = sym.affinity[phase] ?? 0;
      if (aff < 1) continue;
      for (const context of CONTEXTS) {
        // Prefer higher affinity; still allow aff==1 for coverage
        if (aff === 1 && (context === "mid-cycle" || context === "onset") && Math.random() < 0) {
          // keep deterministic — no Math.random
        }
        candidates.push({ sym, phase, context, aff });
      }
    }
  }

  // Stable sort: higher affinity first, then slug
  candidates.sort((a, b) => {
    if (b.aff !== a.aff) return b.aff - a.aff;
    const ka = `${a.sym.slug}|${a.phase}|${a.context}`;
    const kb = `${b.sym.slug}|${b.phase}|${b.context}`;
    return ka.localeCompare(kb);
  });

  for (const c of candidates) {
    if (accepted.length >= target) break;
    const entry = buildEntry(c.sym, c.phase, c.context);
    if (seenId.has(entry.id)) continue;
    const fp = fingerprint(entry);
    // Allow same band fingerprint across different symptoms; block exact id dupes
    if (!passesUniqueness(entry, accepted)) {
      // nudge seed / eeg slightly
      entry.chart_seed = (entry.chart_seed + 17) % 100000000;
      entry.eeg_frequency_hz_range = {
        ...entry.eeg_frequency_hz_range,
        min: clamp(Number((entry.eeg_frequency_hz_range.min + 0.17).toFixed(2)), 0.3, 30),
        max: clamp(Number((entry.eeg_frequency_hz_range.max + 0.23).toFixed(2)), 0.8, 40),
      };
      if (!passesUniqueness(entry, accepted)) continue;
    }
    seenId.add(entry.id);
    seenFp.add(fp);
    accepted.push(entry);
  }

  // If still short, add lower-affinity fills with distinct context seeds
  if (accepted.length < target) {
    for (const sym of CATALOG) {
      for (const phase of PHASES) {
        for (const context of CONTEXTS) {
          if (accepted.length >= target) break;
          const entry = buildEntry(sym, phase, context);
          if (seenId.has(entry.id)) continue;
          entry.chart_seed = hashString(entry.id + "|fill") % 100000000;
          entry.summary = entry.summary + " Modeled as comparative stage contrast.";
          entry.somatic_markers = uniqueSorted([
            ...entry.somatic_markers,
            `${phase.toLowerCase()} contrast marker`,
          ]).slice(0, 5);
          if (!passesUniqueness(entry, accepted)) continue;
          seenId.add(entry.id);
          accepted.push(entry);
        }
      }
    }
  }

  const out = {
    version: 1,
    generated_at: new Date().toISOString(),
    count: accepted.length,
    entries: accepted.slice(0, target),
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.entries.length} entries → ${OUT_PATH}`);
  if (out.entries.length < target) {
    console.warn(`Warning: only ${out.entries.length}/${target} unique rows generated`);
    process.exitCode = 1;
  }
}

main();
