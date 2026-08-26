/**
 * Patch dream-lf-matrix.json: set article_mode gold for 9 scenarios.
 * Run: node pseo/scripts/patch-gold-wave.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const MATRIX = path.join(ROOT, "dream-lf-matrix.json");

const PATCHES = {
  "sleep-paralysis/with-presence": {
    article_mode: "gold",
    custom_body_file: "sleep-paralysis-with-presence.html",
    meta_title: "Sleep Paralysis with a Presence or Shadow Figure | Oneirox",
    meta_description:
      "Why a sensed presence or shadow figure during sleep paralysis is different from paralysis alone — layers of atonia, presence, and hallucination without visitation claims.",
    kicker: "Presence during paralysis",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does a presence during sleep paralysis mean?",
        a: "It usually means wake-like awareness while the body stays locked, plus a threat-agent hallucination filling incomplete sensory data — terrifying and common, not proof of a visitor.",
      },
      {
        q: "Is a shadow figure the same as sensed presence?",
        a: "No. Presence can arrive without a finished visual. A shadow is visual completion; footsteps or pressure are other channels. Write which you had.",
      },
      {
        q: "When should I talk to a clinician?",
        a: "Recurrent episodes with daytime sleepiness, choking/snoring collapse, or severe schedule disruption deserve a sleep-aware clinician. This page is educational, not a diagnosis.",
      },
    ],
    morning_prompt:
      "Note sleep-onset vs waking, presence vs visual vs auditory vs pressure, and sleep timing that week.",
    related_somatic: [
      {
        href: "/somatic/sleep-paralysis-onset/rem/awakening/",
        label: "Sleep paralysis onset — REM/awakening",
      },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
  },
  "falling/hypnic-onset-jolt": {
    article_mode: "gold",
    custom_body_file: "falling-hypnic-onset-jolt.html",
    meta_title: "Falling Sensation When Falling Asleep — Hypnic Jolt | Oneirox",
    meta_description:
      "Why the falling-as-you-doze jolt is an N1 sleep-onset event — hypnic jerk and vestibular misbind — not the same as a long REM falling dream.",
    kicker: "Sleep-onset falling jolt",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "Why do I feel like I’m falling as I fall asleep?",
        a: "Often a hypnic jerk plus a brief body-position mismatch at sleep onset gets narrated as falling — then you wake. It is timing-linked to N1, not a prophecy.",
      },
      {
        q: "Is this the same as dreaming of falling from a height?",
        a: "Usually not. Onset jolts are seconds and body-first. Longer mid-night falling scenes are different REM plots.",
      },
      {
        q: "What makes hypnic jolts more frequent?",
        a: "Sleep debt, irregular bedtimes, late caffeine, and high evening arousal are commonly discussed gates — check those before omen charts.",
      },
    ],
    morning_prompt: "Confirm onset timing, real twitch, and caffeine/sleep-debt for that day.",
    related_somatic: [{ href: "/somatic/hypnic-jerk/n1/onset/", label: "Hypnic jerk — N1/onset" }],
    related_mechanics: {
      href: "/mechanics/rem/cycle-timing/",
      label: "Sleep-cycle timing",
    },
  },
  "teeth-falling-out/with-blood": {
    article_mode: "gold",
    custom_body_file: "teeth-falling-out-with-blood.html",
    meta_title: "Teeth Falling Out Dream with Blood — Intensity, Not Omen | Oneirox",
    meta_description:
      "Why blood in a teeth-falling dream raises felt injury intensity without creating a universal symbolic meaning — and how to check jaw clues carefully.",
    kicker: "Bloody teeth dream",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does it mean when teeth fall out with blood in a dream?",
        a: "Blood usually marks higher injury tagging and arousal in an oral scene — not a fixed death or money omen. Check morning jaw state before symbol charts.",
      },
      {
        q: "Does blood prove bruxism?",
        a: "No. Bruxism is a waking/sleep physiology hypothesis to check with sore jaw, cheek bite, or grinding reports — not a diagnosis from one dream.",
      },
      {
        q: "Is bloody worse than painless teeth dreams?",
        a: "It often feels worse as intensity. That is amplitude in the scene, not a guaranteed worse waking fortune.",
      },
    ],
    morning_prompt: "Note blood/pain/spitting, then check jaw, cheek, temples, and sleep fragmentation.",
    related_somatic: [
      {
        href: "/somatic/sleep-related-bruxism/n2/mid-cycle/",
        label: "Sleep-related bruxism — N2",
      },
    ],
    related_mechanics: {
      href: "/mechanics/rem/pgo-autonomic/",
      label: "PGO & autonomic surge",
    },
  },
  "being-chased/known-person": {
    article_mode: "gold",
    custom_body_file: "being-chased-known-person.html",
    meta_title: "Dream of Being Chased by Someone You Know | Oneirox",
    meta_description:
      "How a known pursuer differs from anonymous chase dreams — autobiographical memory on pursuit hardware, without relationship fortune-telling.",
    kicker: "Named pursuer chase",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does it mean to be chased by someone I know in a dream?",
        a: "Often the chase engine binds an unfinished relational file to pursuit geometry. The person is continuity content — not proof of their waking intent.",
      },
      {
        q: "Why not a stranger?",
        a: "Anonymous pursuers fit diffuse threat. Named pursuers fit specific hot interpersonal memory. Motor lock can feel the same either way.",
      },
      {
        q: "Does this mean that person is dangerous?",
        a: "Not by default. Casting someone as pursuer can mean the relationship file is emotionally salient, not that they will harm you tomorrow.",
      },
    ],
    morning_prompt: "Name the person/role, unfinished waking thread, and whether violence exceeded waking reality.",
    related_somatic: [
      {
        href: "/somatic/cortisol-awakening-motor/n1/awakening/",
        label: "Cortisol-linked awakening",
      },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
  },
  "snakes/in-bed": {
    article_mode: "gold",
    custom_body_file: "snakes-in-bed.html",
    meta_title: "Snake in Bed Dream Meaning — Threat in Sleep Space | Oneirox",
    meta_description:
      "Why a snake in bed combines threat imagery with intimate sleep space and possible tactile cues — distinct from merely seeing, chasing, or being bitten.",
    kicker: "Snake in the sleep surface",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does a snake in my bed mean in a dream?",
        a: "It places a threat image on the sleep surface — maximum proximity. Check whether it was only present, touching, or biting before any relationship superstition.",
      },
      {
        q: "Is a snake in bed the same as a snake bite dream?",
        a: "No. Bed presence or touch is not contact-complete bite. Bite nights need the bite-specific reading.",
      },
      {
        q: "Why did I still feel it after waking?",
        a: "Residual pressure, tingling, or sheet tangle can outlast the dream image. Treat lasting numbness or pain as body-first.",
      },
    ],
    morning_prompt: "Record present vs touch vs bite, mattress location, and any waking skin residue.",
    related_somatic: [
      { href: "/somatic/hypnagogic-tachycardia/n1/onset/", label: "Hypnagogic tachycardia — N1/onset" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
  },
  "snakes/dead-snake": {
    article_mode: "gold",
    custom_body_file: "snakes-dead-snake.html",
    meta_title: "Dead Snake Dream Meaning — Threat Offline, Not Instant Victory | Oneirox",
    meta_description:
      "What a dead or inert snake in a dream can mean when threat imagery remains but approach and attack are offline — without assuming the problem is solved.",
    kicker: "Inert snake, threat offline",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does a dead snake mean in a dream?",
        a: "Often a fear-relevant image with the approach engine off — residual category without live attack. That can feel like relief, but it is not automatic proof a waking conflict is closed.",
      },
      {
        q: "Is killing the snake different from finding it dead?",
        a: "Yes as agency story. Killing leans closure fantasy; finding leans discovery/aftermath. Neither is a guaranteed certificate of resolution.",
      },
      {
        q: "Why was I still afraid of a dead snake?",
        a: "Visual offline and autonomic charge can diverge. Fear can stay high even when the plot shows an inert body.",
      },
    ],
    morning_prompt: "Note dead vs merely still, who caused death, fear level, and any conflict that only went quiet.",
    related_somatic: [],
    related_mechanics: {
      href: "/mechanics/rem/cortex-eeg/",
      label: "REM cortex & EEG",
    },
  },
  "snakes/coiled-watching": {
    article_mode: "gold",
    custom_body_file: "snakes-coiled-watching.html",
    meta_title: "Coiled Snake Watching You in a Dream — Vigilance Threat | Oneirox",
    meta_description:
      "Why a coiled staring snake is stationary monitored threat — freeze and anticipation — not chase, not bite, not a color omen.",
    kicker: "Watched by a coil",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does a coiled snake watching me mean?",
        a: "It usually maps to vigilance under uncertainty: threat held ready without strike or chase. Write whether distance stayed fixed and whether you froze too.",
      },
      {
        q: "How is that different from a snake bite dream?",
        a: "Watching is open-loop monitoring. A bite is contact completion. Different verbs, different pages.",
      },
      {
        q: "Does the stare mean someone is jealous?",
        a: "Not as a scientific claim. Eye-contact intensity tracks monitoring demand in the scene — personal social mappings are optional after that.",
      },
    ],
    morning_prompt: "Note distance held, movement yes/no, freeze in yourself, and any waking problem you are only monitoring.",
    related_somatic: [],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
  },
  "homeland-and-diaspora/mount-ararat": {
    article_mode: "gold",
    custom_body_file: "homeland-and-diaspora-mount-ararat.html",
    meta_title: "Dream About Mount Ararat — Place Memory & Diaspora | Oneirox",
    meta_description:
      "How Mount Ararat dreams often draw on homeland place memory and diaspora geography — cultural density and personal affect without Noah-dictionary claims.",
    kicker: "Ararat as place memory",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does dreaming of Mount Ararat mean?",
        a: "Often a high-density homeland place image entering REM — belonging, distance, or return themes — not a mandatory flood-myth decoding.",
      },
      {
        q: "I have never been to Armenia. Why Ararat?",
        a: "Mediated cultural memory can still load a place file from family, images, and talk. That is continuity, not a supernatural summons.",
      },
      {
        q: "Is this a spiritual prophecy?",
        a: "Oneirox does not treat Ararat dreams as prophecy. Affect and personal/community meaning are yours; neuroscience only supports familiar places being easy to cast in sleep.",
      },
    ],
    morning_prompt: "Write affect (home/loss/awe), access (close/far/blocked), and any recent homeland cues.",
    related_somatic: [],
    related_mechanics: {
      href: "/mechanics/rem/cycle-timing/",
      label: "REM cycle timing",
    },
  },
  "house-dreams/childhood-house": {
    article_mode: "gold",
    custom_body_file: "house-dreams-childhood-house.html",
    meta_title: "Dream About Childhood House or Home — Place Memory | Oneirox",
    meta_description:
      "Why childhood-house dreams reactivate old spatial-affect maps — returning, trapped, or observing — without claiming house universally equals the self.",
    kicker: "Childhood house in dreams",
    lead: "",
    body_paragraphs: [],
    variants: [
      {
        q: "What does it mean to dream about your childhood home?",
        a: "Usually an old place-memory map coming online — rooms, people, era — not a fixed law that house equals the self.",
      },
      {
        q: "Why is the layout wrong?",
        a: "Memory recombination. Wrong-and-right floorplans are reconstruction, not real-estate prophecy.",
      },
      {
        q: "Why can’t I leave the house in the dream?",
        a: "Trapped verb reduces escape options inside an old map. Note returning vs trapped vs observing — those verbs matter more than décor.",
      },
    ],
    morning_prompt: "Note era/address, who was present, returning/trapped/observing, and current instability that may have pulled the old map.",
    related_somatic: [],
    related_mechanics: {
      href: "/mechanics/rem/cycle-timing/",
      label: "REM cycle timing",
    },
  },
};

const raw = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
let n = 0;
for (const e of raw.entries) {
  const key = `${e.parent_slug}/${e.slug}`;
  const patch = PATCHES[key];
  if (!patch) continue;
  Object.assign(e, patch);
  n++;
}
if (n !== Object.keys(PATCHES).length) {
  console.error(`Patched ${n}, expected ${Object.keys(PATCHES).length}`);
  process.exit(1);
}
fs.writeFileSync(MATRIX, JSON.stringify(raw, null, 2) + "\n");
console.log(`Patched ${n} gold LF entries`);
