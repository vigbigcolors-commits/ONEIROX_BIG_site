/**
 * Wave A LF dream entries (~42) — snakes/teeth/dogs/falling/chase + adjacent.
 * Run via compose-dream-lf-matrix.mjs
 */
export const WAVE_A = [
  {
    parent_slug: "snakes",
    slug: "bitten",
    title: "Dream About Being Bitten by a Snake",
    meta_title: "Snake Bite Dream Meaning — Contact Threat in REM | Oneirox",
    meta_description:
      "A snake bite in a dream is contact threat, not omen. Amygdala-led REM maps cutaneous contact onto a high-salience predator schema.",
    kicker: "When the threat lands on skin",
    lead: "The fang finds you. There is a flash of contact, then either panic or a strange calm that does not match the image. This is not a prophecy about enemies — it is a threat circuit that completed the contact phase.",
    signal:
      "Your REM threat map finished the loop: detection → approach → cutaneous contact, so the narrative ends with a bite instead of a distant coil.",
    body_paragraphs: [
      "Snake imagery recruits ancient predator-detection circuitry. Öhman’s work on fear-relevant stimuli shows snakes hold attention faster than many cultural threats; during REM, that bias can dominate scene construction even when you have never been bitten awake. The bite specifically marks contact completion — the simulation did not stay at watching distance.",
      "Skin contact in dream reports often co-occurs with phasic REM: brief autonomic surges, PGO-linked bursts, and a spike in amygdala drive. The cortex explains the surge with the most available predator schema. Blood or pain in the scene usually tracks higher arousal amplitude, not a separate “spiritual” layer.",
      "If you wake with a real sting, itch, or pressure on skin, treat that as interoceptive seed first — a real cutaneous signal can be narrativized as a bite within seconds of REM storytelling.",
    ],
    variants: [
      {
        q: "Bitten on the hand or arm",
        a: "Distal limbs are high-resolution in the body map; hand/arm bites often pair with nights when you were gesturing, typing, or holding tension in the upper limb before sleep.",
      },
      {
        q: "Bite with no pain",
        a: "Contact without pain is still a completed threat loop — lower nociceptive tagging, same predator schema.",
      },
      {
        q: "Multiple bites",
        a: "Repeated contact usually means the arousal spike re-triggered mid-scene rather than a coded message about repeated betrayal.",
      },
    ],
    morning_prompt:
      "On waking, check skin and pulse first: any real itch, pressure, or heart-race residue? That outranks symbol lookup.",
    related_somatic: [
      { href: "/somatic/hypnagogic-tachycardia/n1/onset/", label: "Hypnagogic tachycardia — N1/onset" },
      { href: "/somatic/rem-eye-twitch-burst/rem/mid-cycle/", label: "Phasic REM eye-twitch burst" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO waves & autonomic surge" },
    mechanism_key: "cutaneous_contact_threat_complete",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "snakes",
    slug: "chasing-you",
    title: "Dream About a Snake Chasing You",
    meta_title: "Snake Chasing You Dream — Pursuit Threat Simulation | Oneirox",
    meta_description:
      "A snake chase dream is pursuit-format threat rehearsal with a predator schema — Revonsuo-style simulation, not a Jungian shadow metaphor.",
    kicker: "Pursuit format, predator face",
    lead: "It does not strike once and leave. It follows. Your legs feel wrong. The distance never quite closes. That geometry is REM motor throttling wearing a snake mask.",
    signal:
      "Threat-simulation is running in chase mode; the pursuer is rendered as a snake because your fear-relevant bias made that the cheapest high-salience face for the chase engine.",
    body_paragraphs: [
      "Chase nightmares are among the most cross-cultural dream themes. Revonsuo’s threat-simulation theory treats them as offline rehearsal: detect, flee, fail-to-escape-cleanly. Swapping a human pursuer for a snake does not invent a new mechanism — it swaps the threat face onto the same pursuit loop.",
      "REM atonia dampens felt motor output. Inside the dream that often becomes “I cannot run.” The snake staying just behind you is a narrative that absorbs brainstem motor inhibition, not a coded message about a person you are avoiding.",
      "If the chase starts after a sudden jolt or heart-race, you may be seeing a hypnic or phasic arousal event get rewritten into pursuit within the same sleep cycle.",
    ],
    variants: [
      {
        q: "Snake chasing you indoors",
        a: "Indoor pursuit compresses escape routes — common when daytime stress feels spatially trapped (work, family rooms) without requiring a house-symbol dictionary.",
      },
      {
        q: "You cannot scream while chased",
        a: "Vocal atonia spill: attempted shout meets REM muscle lock; the dream absorbs it as mute panic.",
      },
    ],
    morning_prompt:
      "What waking decision still has no response? Chase geometry clusters around deferred action, not deferred people.",
    related_somatic: [
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked motor awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "pursuit_loop_predator_schema",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "snakes",
    slug: "shedding-skin",
    title: "Dream About a Snake Shedding Its Skin",
    meta_title: "Snake Shedding Skin Dream — Boundary Update Signal | Oneirox",
    meta_description:
      "Shedding-snake dreams track body-boundary and change rehearsal in REM memory consolidation — not a spiritual rebirth slogan.",
    kicker: "Boundary rewrite, not rebirth slogan",
    lead: "The snake peels. Something old comes off. Something raw shows underneath. Dictionaries call this transformation; the lab reads it as a body-boundary update during memory consolidation.",
    signal:
      "Your cortex is rehearsing a surface-change event — old map peeling while a new sensory boundary comes online — using the biological fact that snakes actually shed.",
    body_paragraphs: [
      "Unlike bite or chase scenes, shedding is low-chase, high-boundary. Dreams that stage molting, peeling, or layer-removal often appear when waking identity, role, or body image is under revision. Continuity hypothesis: daytime unfinished business about “what stays / what goes” gets a concrete visual.",
      "Interoception matters. Nights with itch, dry skin, sheet friction, or post-illness body oddness give REM a real surface signal. A shedding snake is an efficient story for “my surface is changing.”",
      "High calm during shedding usually means lower amygdala drive than bite nights — same animal category, different autonomic envelope.",
    ],
    variants: [
      {
        q: "You help the snake shed",
        a: "Agency in the scene often mirrors waking locus of control: you are initiating a change, not only enduring one.",
      },
      {
        q: "Shed skin left behind",
        a: "Residue imagery leans memory-consolidation — what remains after an update — more than omen.",
      },
    ],
    morning_prompt:
      "Name one waking role or habit that is mid-change. If nothing comes, check for real skin irritation overnight.",
    related_somatic: [
      { href: "/somatic/n1-skin-crawl/n1/onset/", label: "N1 skin-crawl percept" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "boundary_molting_consolidation",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "snakes",
    slug: "coiled-watching",
    title: "Dream About a Coiled Snake Watching You",
    meta_title: "Coiled Snake Watching Dream — Freeze Threat Pose | Oneirox",
    meta_description:
      "A coiled watching snake is freeze-phase threat simulation: high vigilance, low locomotion — not a color omen.",
    kicker: "Freeze phase, not strike phase",
    lead: "It does not chase. It watches. Coil tight, head angled, distance fixed. That pose is the threat system stuck in freeze — maximum monitoring, minimum movement.",
    signal:
      "Your REM threat circuit is in vigilance-without-locomotion mode; the coiled snake is the freeze schema rendered as predator geometry.",
    body_paragraphs: [
      "Threat responses are not only fight or flight. Freeze and tonic immobility are core mammalian options. In REM, when motor output is already locked by atonia, freeze narratives are cheap to build: a still threat that watches you matches the felt inability to act.",
      "Eye contact with a coiled snake often coincides with elevated heart-rate variability swings on wearable data from nightmare labs — monitoring without resolution. Dictionaries invent “wisdom” or “jealousy”; the physiology is unresolved vigilance.",
      "If the coil never strikes across the whole dream, the night’s arousal may have stayed sub-threshold for a full panic cascade while still keeping threat online.",
    ],
    variants: [
      {
        q: "Snake watches but never moves",
        a: "Classic freeze tableau — threat salience without pursuit completion.",
      },
      {
        q: "You freeze when it looks at you",
        a: "Mutual immobility: dream ego mirrors REM motor lock.",
      },
    ],
    morning_prompt:
      "Where in waking life are you monitoring a problem without acting? That matches freeze geometry better than symbol charts.",
    related_somatic: [
      { href: "/somatic/hypnopompic-immobility/rem/awakening/", label: "Hypnopompic immobility" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "freeze_vigilance_coil_pose",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "snakes",
    slug: "many-snakes",
    title: "Dream About Many Snakes",
    meta_title: "Many Snakes Dream Meaning — Parallel Threat Load | Oneirox",
    meta_description:
      "Multiple snakes in one dream usually mark parallel threat load or fragmented REM — not a dictionary of swarm omens.",
    kicker: "Parallel threats, one night",
    lead: "Not one snake — a field of them. Floor, trees, water, everywhere you look. Overwhelm is the point: the threat engine multiplied instances instead of refining one pursuer.",
    signal:
      "Your cortex instantiated threat as a population when a single agent could not carry the load — common under multi-source stress or fragmented REM.",
    body_paragraphs: [
      "Crowding a scene with many identical threats is a known nightmare pattern under high allostatic load. Instead of one coherent story, REM sprays the same fear-relevant category across space. That is parallel processing under pressure, not a special “abundance of enemies” prophecy.",
      "Fragmented REM — microarousals, alcohol rebound, irregular schedules — can restart scene construction mid-cycle. Each restart may spawn another snake instance before the previous narrative closed.",
      "If the snakes ignore each other and only orient to you, that still reads as ego-centered threat simulation, not an ecosystem metaphor.",
    ],
    variants: [
      {
        q: "Snakes covering the floor",
        a: "Ground-plane fill maximizes unavoidable contact risk in the dream’s spatial logic — escape cost is high by design.",
      },
      {
        q: "Snakes of different sizes",
        a: "Size variance often tracks arousal amplitude changes across the night, not a coded hierarchy of people.",
      },
    ],
    morning_prompt:
      "List stressors that arrived the same week. Many-snakes nights cluster when load is plural, not singular.",
    related_somatic: [
      { href: "/somatic/fragmented-rem/rem/fragmentation/", label: "Fragmented REM" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "parallel_threat_population",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "snakes",
    slug: "dead-snake",
    title: "Dream About a Dead Snake",
    meta_title: "Dead Snake Dream Meaning — Threat Offline Signal | Oneirox",
    meta_description:
      "A dead snake dream often marks threat-offline consolidation — the fear-relevant object without the autonomic engine running.",
    kicker: "Threat object, engine off",
    lead: "The snake is there, but it does not move. Dead, limp, already finished. Dictionaries sell victory metaphors. Mechanically, you are looking at a fear-relevant object with the arousal engine dialed down.",
    signal:
      "Predator schema is still available to imagery, but amygdala drive is low enough that the scene resolves as inert rather than attacking.",
    body_paragraphs: [
      "Fear-relevant categories can appear in non-threat modes. A dead snake keeps the category (attention bias) while removing pursuit, bite, and freeze. That combination often shows up after a stressor has been partially resolved waking — residual imagery without live panic.",
      "Memory consolidation sometimes replays the “solved” version of a fear stimulus. Lab nightmare treatments that reduce affective charge can leave patients dreaming of the same figure with lower intensity; dead/inert variants fit that arc.",
      "If disgust dominates over fear, olfactory or visceral cues may be co-driving the scene more than predator detection.",
    ],
    variants: [
      {
        q: "You kill the snake",
        a: "Active termination usually mirrors waking agency reclaiming a previously stuck threat loop.",
      },
      {
        q: "Finding a dead snake unexpectedly",
        a: "Discovery without combat leans consolidation residue over live simulation.",
      },
    ],
    morning_prompt:
      "Did a waking conflict ease in the last 48 hours? Dead-threat imagery often lags resolution by a night or two.",
    related_somatic: [
      { href: "/somatic/early-n3-stillness/n3/mid-cycle/", label: "Early N3 stillness" },
    ],
    related_mechanics: { href: "/mechanics/rem/cortex-eeg/", label: "REM cortex & EEG" },
    mechanism_key: "threat_schema_arousal_offline",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "snakes",
    slug: "in-house",
    title: "Dream About Snakes in the House",
    meta_title: "Snakes in the House Dream — Territory Breach Threat | Oneirox",
    meta_description:
      "Snakes inside the house mark territory-breach threat simulation — safe-space violation, not a furniture omen chart.",
    kicker: "Safe space breached",
    lead: "Home should be the one place the predator is not. Then you open a door and it is in the kitchen, the hallway, under the bed. The violation of territory is the mechanism.",
    signal:
      "REM is staging threat inside a place tagged as safe in waking memory — a high-salience breach that amplifies amygdala response without needing a new animal meaning.",
    body_paragraphs: [
      "Place cells and contextual memory still operate in sleep. Inserting a fear-relevant animal into a home layout exploits the contrast between “safe context” and “predator category.” That contrast alone elevates arousal.",
      "Domestic snake dreams often cluster when waking stress involves privacy, boundaries, or someone entering your space — continuity of theme, not a coded plumbing metaphor.",
      "Searching room-to-room for the snake is exploratory threat mapping: the cortex keeps sampling locations because the threat was not localized to one completed contact.",
    ],
    variants: [
      {
        q: "Snake under the bed",
        a: "Proximal-to-body hiding places maximize startle potential at awakening edges.",
      },
      {
        q: "Snake in a childhood home",
        a: "Older spatial maps carry denser affective tags; breach there hits harder than a hotel room.",
      },
    ],
    morning_prompt:
      "Whose access to your space feels wrong right now — physical or digital? Territory breach tracks access, not reptiles.",
    related_somatic: [
      { href: "/somatic/k-complex-arousal/n2/mid-cycle/", label: "K-complex arousal — N2" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO waves & autonomic surge" },
    mechanism_key: "safe_context_predator_breach",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "snakes",
    slug: "in-bed",
    title: "Dream About a Snake in Your Bed",
    meta_title: "Snake in Bed Dream — Intimate-Zone Threat | Oneirox",
    meta_description:
      "A snake in the bed is intimate-zone threat plus real sheet/skin cues — proximity, not sexual superstition by default.",
    kicker: "Threat in the sleep surface",
    lead: "It is in the sheets with you. Against your leg, under the pillow, along your spine. This is maximum proximity: the predator schema occupying the same surface your body occupies.",
    signal:
      "Intimate-zone threat plus possible real cutaneous feedback from sheets, partner movement, or limb paresthesia get bound into one snake-in-bed narrative.",
    body_paragraphs: [
      "The bed is both a sleep instrument and an affectively loaded place. Threat there compresses escape options to near zero inside the dream’s logic. Amygdala responds hard to inescapable proximity.",
      "Real signals matter: a foot cramp, sheet tuck, partner’s leg, or hypnagogic limb-float can be misattributed as a living form beside you. Snake is a high-salience default for elongated pressure along the body.",
      "Sexualized readings are optional continuity overlays, not required. Start with proximity + cutaneous seed before symbolism.",
    ],
    variants: [
      {
        q: "Snake wrapping your leg in bed",
        a: "Limb wrapping maps cleanly onto real pressure or circulatory oddness in the same limb.",
      },
      {
        q: "You wake and still feel it",
        a: "Hypnopompic residue: dream percept briefly outlives REM before sensory gates reopen fully.",
      },
    ],
    morning_prompt:
      "Any real pressure, cramp, or sheet tangle on waking? Log that before any relationship interpretation.",
    related_somatic: [
      { href: "/somatic/hypnagogic-limb-float/n1/onset/", label: "Hypnagogic limb float" },
      { href: "/somatic/n1-skin-crawl/n1/onset/", label: "N1 skin-crawl" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "intimate_surface_cutaneous_bind",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "teeth-falling-out",
    slug: "with-blood",
    title: "Dream About Teeth Falling Out with Blood",
    meta_title: "Teeth Falling Out with Blood Dream — High-Arousal Bruxism | Oneirox",
    meta_description:
      "Bloody teeth dreams add amygdala spike to oral-pressure interoception — higher arousal bruxism nights, not a death omen.",
    kicker: "Oral pressure + threat dye",
    lead: "Teeth loosen, then blood. The mouth fills. Search engines will sell you catastrophe. The mechanism is usually the same jaw story with the threat dial turned up.",
    signal:
      "Sleep-related oral pressure is still the seed; blood tags the scene with higher limbic arousal so the narrative reads as injury, not mere looseness.",
    body_paragraphs: [
      "Sleep bruxism delivers real periodontal and masseter signals. On higher-arousal nights — stress, caffeine, REM fragmentation — amygdala dye stains the same oral data as injury. Blood is the dye, not a new dental mechanism.",
      "Survey work links teeth dreams to anxiety load, but the bloody subset clusters with more intense autonomic nights. That is amplitude, not a separate superstition lane.",
      "If you taste metal or wake with a bitten cheek, treat that as possible microtrauma seed worth a dental check — physiology first.",
    ],
    variants: [
      {
        q: "Spitting teeth and blood",
        a: "Expulsion motor framing often pairs with stronger masseter bursts and a need to “clear” the oral cavity in the dream’s logic.",
      },
      {
        q: "Blood but little pain",
        a: "Visual threat tagging without full nociceptive narrative — common when arousal is visual-limbic more than pain-map driven.",
      },
    ],
    morning_prompt:
      "Jaw sore? Cheek bitten? Headache at the temples? Those three checks beat omen lists.",
    related_somatic: [
      { href: "/somatic/sleep-related-bruxism/n2/mid-cycle/", label: "Sleep-related bruxism — N2" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "oral_pressure_high_arousal_bleed",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "teeth-falling-out",
    slug: "painless",
    title: "Dream About Teeth Falling Out with No Pain",
    meta_title: "Painless Teeth Falling Out Dream — Low-Intensity Bruxism | Oneirox",
    meta_description:
      "Painless teeth-loss dreams are the common low-intensity oral-pressure narrative — bruxism without the injury dye.",
    kicker: "Pressure without injury dye",
    lead: "They loosen and fall, and it barely hurts. Weirdly calm. That calm is data: same oral channel, lower threat tagging.",
    signal:
      "Interoceptive jaw/gum noise is being explained as tooth loss without a strong nociceptive or blood layer — typical of milder bruxism nights.",
    body_paragraphs: [
      "The painless variant is statistically common and under-dramatized online because it does not click as hard. Mechanically it is cleaner: pressure and vibration in the mouth become “teeth leaving” without injury theater.",
      "Lower amygdala drive keeps the scene odd rather than terrifying. You may even try to push teeth back in — problem-solving cortex online enough to act inside the dream.",
      "Still check for waking clench habits. Absence of dream pain does not equal absence of jaw load.",
    ],
    variants: [
      {
        q: "Teeth fall out one by one calmly",
        a: "Serial low-intensity events often map to longer, quieter tension rather than a single sharp clench.",
      },
      {
        q: "You collect the fallen teeth",
        a: "Collecting is executive framing — daytime problem-solving style leaking into REM narrative.",
      },
    ],
    morning_prompt:
      "Even without dream pain: any morning jaw tightness? Log yes/no for a week.",
    related_somatic: [
      { href: "/somatic/sleep-related-bruxism/n2/mid-cycle/", label: "Sleep-related bruxism — N2" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "oral_pressure_low_nociception",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "teeth-falling-out",
    slug: "crumbling",
    title: "Dream About Teeth Crumbling",
    meta_title: "Teeth Crumbling Dream — Slow Oral Tension Narrative | Oneirox",
    meta_description:
      "Crumbling teeth map to prolonged low-grade jaw tension — a slow oral signal getting a slow narrative, not decay prophecy.",
    kicker: "Slow signal, slow story",
    lead: "They do not pop out clean. They grit, powder, rot at the edges. Time stretches. That tempo usually mirrors longer-duration tension, not a sudden clench.",
    signal:
      "A prolonged oral-pressure or grinding pattern is being narrativized as structural failure over time rather than a single extraction event.",
    body_paragraphs: [
      "Sharp clench → sudden tooth loss. Sustained grinding → crumbling, rotting, chalk-texture imagery. The cortex matches narrative time scale to signal time scale more often than dream dictionaries admit.",
      "Texture details (sand, chalk, soft enamel) are somatosensory storytelling. Periodontal ligament noise plus vibration is enough raw material.",
      "If you use a night guard and still get crumbling dreams, the residual micro-movements can still seed imagery even when macroscopic grinding is reduced.",
    ],
    variants: [
      {
        q: "Teeth turn to chalk or sand",
        a: "Granular texture is a common translation of vibration + pressure without a clean break event.",
      },
      {
        q: "Crumbling while eating in the dream",
        a: "Oral-motor dream content plus real jaw load — eating scenes recruit the same effector maps.",
      },
    ],
    morning_prompt:
      "Was last night’s stress a long grind (deadline week) rather than a single shock? Tempo matches.",
    related_somatic: [
      { href: "/somatic/n2-brux-microburst/n2/mid-cycle/", label: "N2 brux microburst" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "prolonged_grind_structural_fail",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "teeth-falling-out",
    slug: "pulling-own",
    title: "Dream About Pulling Out Your Own Teeth",
    meta_title: "Pulling Own Teeth Dream — Agency + Oral Interoception | Oneirox",
    meta_description:
      "Pulling your own teeth pairs oral-pressure seed with active-agent framing — locus of control, not self-harm prophecy.",
    kicker: "You are the motor",
    lead: "You grip and pull. It is your decision inside the dream. That active verb matters: same mouth channel, different agency frame.",
    signal:
      "Oral interoception is present, but the dream ego initiates the removal — motor framing follows waking locus of control more than a different dental mechanism.",
    body_paragraphs: [
      "Passive tooth loss (“they fell”) and active extraction (“I pulled”) often split on agency. People mid-decision — quitting, confronting, relocating — show more active-verb oral dreams in continuity research patterns.",
      "The hand-to-mouth motor loop is heavily practiced waking; REM can drive it even under partial atonia, producing a vivid sense of gripping and twisting.",
      "If disgust or relief dominates, note which — affective valence is the useful morning datum, not a moral reading.",
    ],
    variants: [
      {
        q: "Pulling with pliers or tools",
        a: "Tool use raises planning cortex involvement inside the scene — more executive, less pure panic.",
      },
      {
        q: "Relief after pulling",
        a: "Relief suggests the oral pressure story resolved; check whether jaw load actually eased on waking.",
      },
    ],
    morning_prompt:
      "What change are you actively forcing waking? Match the verb, not the tooth.",
    related_somatic: [
      { href: "/somatic/sleep-related-bruxism/n2/mid-cycle/", label: "Sleep-related bruxism — N2" },
    ],
    related_mechanics: { href: "/mechanics/rem/cortex-eeg/", label: "REM cortex & EEG" },
    mechanism_key: "agentic_oral_extraction_frame",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "teeth-falling-out",
    slug: "someone-elses",
    title: "Dream About Someone Else's Teeth Falling Out",
    meta_title: "Someone Else's Teeth Falling Out Dream — Social Continuity | Oneirox",
    meta_description:
      "Another person's teeth falling out leans continuity and social concern more than your own bruxism map — still not superstition.",
    kicker: "Their mouth, your consolidation",
    lead: "It is not your jaw in the mirror. It is theirs. You watch teeth leave someone else’s mouth. Physiology may be quieter; social memory is louder.",
    signal:
      "This variant leans continuity hypothesis: concern about another person’s stress or health is consolidating, with oral-loss imagery as a borrowed high-salience body story.",
    body_paragraphs: [
      "When the mouth in the dream is not mapped to your own proprioception, bruxism is a weaker first hypothesis. Ask who the person is and what unfinished worry attaches to them.",
      "You can still have mild jaw tension the same night — mechanisms stack — but the narrative spotlight on another face is a social-affect signature.",
      "Empathy circuits and REM emotional memory work are both online; watching damage to another’s face is an efficient rehearsal of relational threat.",
    ],
    variants: [
      {
        q: "A child's teeth falling out",
        a: "Caregiving load and developmental worry are common daytime seeds for this cast.",
      },
      {
        q: "A partner's teeth falling out",
        a: "Intimate co-regulation stress often borrows oral-loss imagery when appearance/health anxiety is active for them.",
      },
    ],
    morning_prompt:
      "Whose wellbeing were you carrying yesterday? Name them before checking your own jaw.",
    related_somatic: [
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "social_continuity_oral_proxy",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "teeth-falling-out",
    slug: "recurring",
    title: "Recurring Teeth Falling Out Dreams",
    meta_title: "Recurring Teeth Dreams — Rehearsal Loop + Bruxism | Oneirox",
    meta_description:
      "Recurring teeth-loss dreams are a rehearsal loop: unresolved oral load and/or unresolved stress script replaying across nights.",
    kicker: "Same mouth, many nights",
    lead: "Again. Same loosening. Same panic or same calm. Recurrence is not a curse — it is an unfinished rehearsal plus a body channel that keeps sending the same seed.",
    signal:
      "A stable oral-pressure source and/or an unresolved affective script is being re-run because neither the jaw load nor the daytime loop has closed.",
    body_paragraphs: [
      "Recurring dreams often mark incomplete emotional processing (stuck rehearsal) and/or a repeating physiological seed. For teeth, both can be true: nightly bruxism plus ongoing performance or appearance stress.",
      "Changing the morning response — jaw check, night-guard consistency, one concrete daytime decision — often breaks the loop faster than interpreting the symbol again.",
      "If the dream updates slightly each time (blood appears, then vanishes), you are watching arousal amplitude drift across nights, not a prophetic series.",
    ],
    variants: [
      {
        q: "Same dream weekly for months",
        a: "Long loops need both dental/sleep hygiene review and a daytime unfinished-business audit.",
      },
      {
        q: "Recurring only during deadlines",
        a: "State-dependent: stress gates the oral narrative without inventing a new mechanism.",
      },
    ],
    morning_prompt:
      "What is identical across the nights you remember? Body (jaw) or plot (shame/deadline)? Track which.",
    related_somatic: [
      { href: "/somatic/sleep-related-bruxism/n2/mid-cycle/", label: "Sleep-related bruxism — N2" },
      { href: "/somatic/fragmented-rem/rem/fragmentation/", label: "Fragmented REM" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "rehearsal_loop_oral_seed",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "dogs",
    slug: "biting",
    title: "Dream About a Dog Biting You",
    meta_title: "Dog Biting Dream Meaning — Social Predator Contact | Oneirox",
    meta_description:
      "A dog bite dream is social-animal threat contact — attachment-category predator with completed contact, not a loyalty omen.",
    kicker: "Familiar animal, contact complete",
    lead: "Teeth in skin — but it is a dog, not a snake. That swap matters: dogs sit in both attachment and threat categories, so the bite carries social charge.",
    signal:
      "Completed contact threat using a social mammal schema — often higher relational continuity than reptile bites, same contact-completion geometry.",
    body_paragraphs: [
      "Dogs are fear-relevant and affiliation-relevant at once. A bite from that category frequently consolidates interpersonal conflict, boundary failure, or betrayed expectation — continuity — while still using standard REM threat hardware.",
      "Compared with snake bites, dog-bite dreams more often include known animals (your dog, a neighbor’s). Known faces raise the odds the daytime seed is relational rather than abstract predator bias.",
      "Real nighttime startles from pets in the bed can seed contact imagery; rule out literal animal movement before symbolism.",
    ],
    variants: [
      {
        q: "Your own dog bites you",
        a: "Attachment + threat collision — high affective load; ask what boundary felt crossed waking.",
      },
      {
        q: "Strange dog bites then flees",
        a: "Hit-and-run contact: phasic arousal spike with quick scene termination.",
      },
    ],
    morning_prompt:
      "Was a trust or boundary issue active yesterday involving someone “on your side”? Start there.",
    related_somatic: [
      { href: "/somatic/hypnagogic-tachycardia/n1/onset/", label: "Hypnagogic tachycardia" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "social_mammal_bite_contact",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "dogs",
    slug: "chasing",
    title: "Dream About a Dog Chasing You",
    meta_title: "Dog Chasing You Dream — Social Pursuit Threat | Oneirox",
    meta_description:
      "Dog chase dreams run pursuit threat with a social-animal face — atonia-throttled flight, not a color omen.",
    kicker: "Pursuit with a pack animal face",
    lead: "Barking behind you. Claws on pavement. You cannot get distance. Same chase engine as human pursuers, different species costume.",
    signal:
      "Threat-simulation in pursuit mode using a domestic canid schema — often faster, more primal onset than social-human chase casting.",
    body_paragraphs: [
      "Animal pursuit can recruit older threat-detection pathways than interpersonal chase scenes. The felt speed and panic onset are often sharper even when the waking stressor is mundane.",
      "Leg heaviness remains an atonia signature. The dog’s tireless pace is narrative cover for your throttled motor output.",
      "If the dog belongs to someone you know, continuity may point to that person’s pressure on you — still not an omen about the animal.",
    ],
    variants: [
      {
        q: "Pack of dogs chasing you",
        a: "Population pursuit = parallel social pressure, same as many-snakes geometry with a mammal cast.",
      },
      {
        q: "Dog chases but never bites",
        a: "Pursuit without contact completion — monitoring pressure more than finished conflict.",
      },
    ],
    morning_prompt:
      "Who or what has been “on your heels” for a decision? Name the pressure source.",
    related_somatic: [
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked motor awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "canid_pursuit_threat_loop",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "dogs",
    slug: "barking-aggressively",
    title: "Dream About a Dog Barking Aggressively",
    meta_title: "Aggressive Dog Barking Dream — Acoustic Threat Salience | Oneirox",
    meta_description:
      "Aggressive barking dreams center acoustic threat salience — auditory amygdala drive — more than bite or chase completion.",
    kicker: "Sound as the weapon",
    lead: "No bite. No chase. Just volume — a dog screaming threat at you. The mechanism is auditory salience hijacking the threat map.",
    signal:
      "Acoustic threat without locomotion: REM is tagging a high-intensity sound event as social-animal alarm, often seeded by real nighttime noise or internal auditory imagery.",
    body_paragraphs: [
      "Amygdala responds strongly to alarm vocalizations. In REM, a barking dog is an efficient alarm avatar. You may never see teeth because the sound was enough to carry the night’s arousal.",
      "Real seeds: a dog outside, a partner snoring spike, tinnitus surge, or exploding-head-like auditory burst can be rewritten as barking.",
      "If you freeze rather than run, you are in acoustic-freeze rather than pursuit mode — different geometry from chase dreams.",
    ],
    variants: [
      {
        q: "Barking you cannot locate",
        a: "Unlocalized sound = auditory salience without a stable visual bind — common near microarousals.",
      },
      {
        q: "Barking behind a door",
        a: "Barrier + alarm: threat known but not yet contact-complete.",
      },
    ],
    morning_prompt:
      "Any real noise events last night? Note them before interpreting the dog.",
    related_somatic: [
      { href: "/somatic/exploding-head-sensory-burst/n1/onset/", label: "Exploding-head sensory burst" },
      { href: "/somatic/n1-ear-whoosh/n1/onset/", label: "N1 ear whoosh" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "acoustic_alarm_canid_avatar",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "dogs",
    slug: "puppy",
    title: "Dream About a Puppy",
    meta_title: "Puppy Dream Meaning — Caregiving + Soft Approach System | Oneirox",
    meta_description:
      "Puppy dreams recruit caregiving and soft-approach affect more than predator threat — attachment rehearsal, not omen.",
    kicker: "Care system online",
    lead: "Small, soft, needy or playful. The autonomic color is usually warm or tender-anxious, not chase-panic. Different circuit emphasis.",
    signal:
      "Affiliation and caregiving motivational systems are shaping the animal schema — low predator drive, high approach/nurture content.",
    body_paragraphs: [
      "Not every dog dream is threat. Juvenile animal imagery often co-travels with caregiving load, new projects, or soft attachment needs consolidating overnight.",
      "If anxiety appears, it is often “can I keep it safe / can I keep up” — competence worry layered on affiliation, not bite threat.",
      "Real contact with puppies or baby-care days strongly bias continuity toward this cast.",
    ],
    variants: [
      {
        q: "Lost puppy you must find",
        a: "Search + care = responsibility rehearsal under mild stress.",
      },
      {
        q: "Puppy that becomes aggressive",
        a: "Affect flip mid-dream often marks a phasic arousal spike rewriting the same character.",
      },
    ],
    morning_prompt:
      "What new responsibility felt small-but-demanding yesterday? Match scale, not species.",
    related_somatic: [
      { href: "/somatic/early-n3-stillness/n3/mid-cycle/", label: "Early N3 stillness" },
    ],
    related_mechanics: { href: "/mechanics/rem/cortex-eeg/", label: "REM cortex & EEG" },
    mechanism_key: "caregiving_affiliation_juvenile",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "dogs",
    slug: "dying",
    title: "Dream About a Dog Dying",
    meta_title: "Dog Dying Dream — Attachment Loss Rehearsal | Oneirox",
    meta_description:
      "A dying dog dream rehearses attachment loss with a high-bond animal schema — grief circuitry, not a prediction about pets.",
    kicker: "Bond object offline",
    lead: "The dog is hurt, dying, or already gone. The chest drop is real. This is attachment-loss rehearsal, not a veterinary prophecy by default.",
    signal:
      "Grief and separation systems are consolidating using a high-bond animal as the loss object — continuity with relationship or pet worry, not omen.",
    body_paragraphs: [
      "Attachment figures in dreams are not limited to humans. Pets occupy dense affective memory. Staging their death is a known way REM processes anticipated or symbolic loss.",
      "If your real pet is healthy, ask what human bond or role feels endangered. The dog may be a safer face for a harder grief.",
      "Autonomic signature is often sadness or hollow panic rather than chase adrenaline — different from bite/chase nights.",
    ],
    variants: [
      {
        q: "You cannot save the dog",
        a: "Helpless caregiving is common when waking control over a bond feels insufficient.",
      },
      {
        q: "A childhood dog dies again",
        a: "Old grief can re-open when a new loss echoes it — memory linking, not prediction.",
      },
    ],
    morning_prompt:
      "What bond feels fragile right now — pet, person, or role? Name it without forcing the dream to predict.",
    related_somatic: [
      { href: "/somatic/hypnopompic-chest-weight/rem/awakening/", label: "Hypnopompic chest weight" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "attachment_loss_animal_object",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "dogs",
    slug: "attacking",
    title: "Dream About a Dog Attacking",
    meta_title: "Dog Attack Dream — Full Assault Threat Simulation | Oneirox",
    meta_description:
      "Dog attack dreams are full-assault threat simulation — contact plus pursuit plus high autonomic amplitude.",
    kicker: "Full assault mode",
    lead: "Not a nip — an attack. Knocked down, mauled, cornered. This is the threat engine at high amplitude with a social mammal avatar.",
    signal:
      "High-amplitude threat simulation combining approach, contact, and dominance struggle — often after acute interpersonal or safety stress.",
    body_paragraphs: [
      "Attack differs from bite by scope: whole-body struggle, longer scene, higher sympathetic drive. Wearable spikes (if measured) tend to be larger than single-nip dreams.",
      "Casting a dog rather than a stranger still keeps social-category threat available — betrayal or dominance themes are common continuity matches.",
      "If you fight back successfully, agency is online; if you cannot move, atonia is writing the script.",
    ],
    variants: [
      {
        q: "Attacked in public",
        a: "Audience + assault = social evaluation threat stacked on physical threat.",
      },
      {
        q: "You wake mid-attack",
        a: "Arousal crossed wake threshold mid-scene — classic nightmare exit.",
      },
    ],
    morning_prompt:
      "Rate last night’s stress 1–10. Attack dreams cluster at the high end of the same week’s load.",
    related_somatic: [
      { href: "/somatic/hypnopompic-somatic-surge/rem/awakening/", label: "Hypnopompic somatic surge" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "high_amplitude_assault_canid",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "falling",
    slug: "hypnic-onset-jolt",
    title: "Dream About Falling as You Fall Asleep",
    meta_title: "Falling Asleep Jolt Dream — Hypnic Jerk Mechanism | Oneirox",
    meta_description:
      "The classic falling-as-you-doze dream is usually a hypnic jerk plus vestibular misbind — N1 physiology, not prophecy.",
    kicker: "N1 myoclonic startle",
    lead: "You are drifting, then the bed vanishes and you drop. You jerk awake. That is one of the best-mapped dream-body events in sleep science.",
    signal:
      "A hypnic jerk (sleep-onset myoclonus) plus transient vestibular/proprioceptive misbind is being narrativized as falling at the N1 edge.",
    body_paragraphs: [
      "Hypnic jerks are common in healthy people, especially with caffeine, stress, or irregular schedules. The muscle twitch is real; the falling story is the cortex explaining a sudden motor and vestibular mismatch while consciousness is half-online.",
      "Unlike long REM falling dreams, onset jolts are brief, often single-cycle, and tightly coupled to the bodily startle.",
      "If jolts are frequent and violent, discuss with a clinician — still, the dream content itself is usually explanatory theater, not omen.",
    ],
    variants: [
      {
        q: "Falling then immediate wake",
        a: "Classic hypnic exit — arousal ends the scene before REM storytelling deepens.",
      },
      {
        q: "Falling into bed from height at onset",
        a: "Same N1 mechanism with a taller visual drop attached to the twitch.",
      },
    ],
    morning_prompt:
      "Caffeine late? Sleep debt? Irregular bedtime? Those three gate hypnic frequency.",
    related_somatic: [
      { href: "/somatic/hypnic-jerk/n1/onset/", label: "Hypnic jerk — N1/onset" },
      { href: "/somatic/n1-falling-elevator/n1/onset/", label: "N1 falling-elevator percept" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "Sleep-cycle timing" },
    mechanism_key: "n1_hypnic_vestibular_jolt",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "falling",
    slug: "great-height-rem",
    title: "Dream About Falling from a Great Height",
    meta_title: "Falling from Height Dream — REM Vestibular Threat | Oneirox",
    meta_description:
      "Long falling-from-height dreams are REM vestibular/threat scenes — distinct from brief hypnic jolts at sleep onset.",
    kicker: "Long drop, REM story",
    lead: "Cliff, building, sky. The drop lasts. Wind, stomach lift, ground rushing. This is not the two-second hypnic twitch — it is a full REM vestibular narrative.",
    signal:
      "REM is running an extended vestibular-threat simulation; height multiplies predicted impact cost inside the dream’s physics.",
    body_paragraphs: [
      "REM can generate rich motion scenes while real vestibular input is low and motor output is locked. The mismatch is fertile ground for falling narratives that feel physically true.",
      "Great-height versions often carry evaluation or loss-of-control themes from waking life — continuity layered on vestibular hardware.",
      "Unlike onset jolts, these dreams may not wake you immediately; you can fall for “minutes” of dream time across a REM period.",
    ],
    variants: [
      {
        q: "Falling from a building you chose to jump",
        a: "Agency in the drop often mirrors waking risk decisions — still vestibular theater underneath.",
      },
      {
        q: "Falling with someone else",
        a: "Shared drop = shared stakes in a waking bond or team stressor.",
      },
    ],
    morning_prompt:
      "Was this a long scene or a one-second jolt? Length sorts REM story from hypnic jerk.",
    related_somatic: [
      { href: "/somatic/n1-vestibular-spin/n1/onset/", label: "N1 vestibular spin" },
    ],
    related_mechanics: { href: "/mechanics/rem/cortex-eeg/", label: "REM cortex & EEG" },
    mechanism_key: "extended_rem_vestibular_drop",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "falling",
    slug: "never-landing",
    title: "Dream About Falling but Never Landing",
    meta_title: "Endless Falling Dream — Unresolved Vestibular Loop | Oneirox",
    meta_description:
      "Never-landing falls are unresolved vestibular loops — REM keeps the drop open because impact/arousal never closes the scene.",
    kicker: "Drop without reset",
    lead: "You fall and fall. The ground does not arrive. Panic stretches. The missing landing is the clue: the loop never got a termination signal.",
    signal:
      "Vestibular-threat simulation without a closing impact or wake event — an open loop that can feel infinite inside REM time.",
    body_paragraphs: [
      "Landing usually ends the scene via predicted impact or actual arousal. When neither arrives, REM may hold the falling state. That open loop is unsettling precisely because prediction error never resolves.",
      "People under chronic unresolved stress report more never-landing falls — continuity of “no endpoint” matching dream physics.",
      "Lucid dreamers sometimes notice the endless drop as a cue; most sleepers just endure it until the REM period shifts.",
    ],
    variants: [
      {
        q: "Falling through clouds forever",
        a: "Low-detail endless drop = vestibular loop with weak visual binding.",
      },
      {
        q: "You try to fly instead of land",
        a: "Motor reframing mid-loop — cortex attempting a new prediction to end the error.",
      },
    ],
    morning_prompt:
      "What waking problem has no scheduled endpoint? Open loops like open falls.",
    related_somatic: [
      { href: "/somatic/n1-falling-elevator/n1/onset/", label: "N1 falling-elevator" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "open_loop_vestibular_no_impact",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "falling",
    slug: "stairs",
    title: "Dream About Falling Down Stairs",
    meta_title: "Falling Down Stairs Dream — Segmented Loss of Control | Oneirox",
    meta_description:
      "Stair-fall dreams segment loss of control into steps — motor prediction errors on a familiar action map.",
    kicker: "Familiar action, broken prediction",
    lead: "Missed step. Then another. Stairs are practiced motor sequences; when REM corrupts the prediction, the fall arrives in beats.",
    signal:
      "A highly trained locomotor sequence (stair negotiation) is failing inside REM motor simulation — segmented prediction error, not a career omen by default.",
    body_paragraphs: [
      "Stairs are overlearned. Dreams love corrupting overlearned actions (also: driving, speaking, writing). Each missed tread is a discrete prediction failure.",
      "Unlike cliff falls, stair falls often include attempted recovery — grab rail, catch balance — showing partial executive presence inside the nightmare.",
      "Real seeds: actual near-misses on stairs, knee pain, or vestibular oddness the day before.",
    ],
    variants: [
      {
        q: "Falling down stairs at work or school",
        a: "Place tags add evaluation stress to the motor failure.",
      },
      {
        q: "Endless staircase fall",
        a: "Hybrid of stair segmentation and never-landing open loop.",
      },
    ],
    morning_prompt:
      "Any real balance, knee, or stair near-miss lately? Body first, metaphor second.",
    related_somatic: [
      { href: "/somatic/hypnic-jerk/n1/onset/", label: "Hypnic jerk" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "segmented_locomotor_prediction_fail",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "falling",
    slug: "elevator-drop",
    title: "Dream About an Elevator Dropping",
    meta_title: "Elevator Falling Dream — Contained Vestibular Panic | Oneirox",
    meta_description:
      "Elevator-drop dreams are contained vestibular panic — free fall without open sky, often tied to N1 elevator percepts.",
    kicker: "Free fall in a box",
    lead: "The cable fails. The cabin drops. Walls stay close. Contained free fall has a different fear texture than open air — still vestibular, more claustrophobic.",
    signal:
      "Vestibular free-fall simulation inside a bounded volume — combines drop physics with enclosure, sometimes seeded by real N1 elevator-like percepts.",
    body_paragraphs: [
      "Elevators are cultural shortcuts for vertical motion under someone else’s control. Dreams use them when loss-of-control themes need a machine avatar.",
      "Oneirox somatic notes include N1 falling-elevator percepts — brief bodily drops at sleep onset that can expand into full elevator narratives in later REM.",
      "Cable-snap imagery is narrative cover for a sudden autonomic dip/spike, not a safety inspection of your building.",
    ],
    variants: [
      {
        q: "Elevator free-fall then stop",
        a: "Arrested drop often coincides with a microarousal that partially wakes the scene.",
      },
      {
        q: "Crowded elevator dropping",
        a: "Social evaluation + vestibular threat stacked in one cabin.",
      },
    ],
    morning_prompt:
      "Where do you feel carried by systems you do not steer? Match the cabin, not the cable.",
    related_somatic: [
      { href: "/somatic/n1-falling-elevator/n1/onset/", label: "N1 falling-elevator percept" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "contained_volume_freefall",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "being-chased",
    slug: "known-person",
    title: "Dream About Being Chased by Someone You Know",
    meta_title: "Chased by Someone You Know — Relational Threat REM | Oneirox",
    meta_description:
      "Known-person chase dreams bind threat-simulation to an active relational stressor — continuity plus REM pursuit hardware.",
    kicker: "Familiar face, pursuit engine",
    lead: "It is not a stranger. It is someone with a name. That name is the continuity clue; the chase geometry is still REM threat hardware.",
    signal:
      "Pursuit threat-simulation with a personally tagged pursuer — memory consolidation is attaching an unresolved relational file to the chase loop.",
    body_paragraphs: [
      "Undefined pursuers fit diffuse stress. Named pursuers fit specific unfinished interpersonal business. The legs still feel heavy for atonia reasons either way.",
      "The known person need not be literally dangerous waking. Your brain may cast them as pursuer because they are the highest-salience agent attached to a conflict you have not closed.",
      "If you feel guilt while fleeing, note that — affective tone sorts confrontation-avoidance from pure fear.",
    ],
    variants: [
      {
        q: "Chased by a boss or teacher",
        a: "Evaluation authority cast into pursuit — performance threat with legs.",
      },
      {
        q: "Chased by an ex",
        a: "Attachment residue plus pursuit — see also ex-partner LF pages for bond-specific angles.",
      },
    ],
    morning_prompt:
      "What conversation with that person is still pending? Pending talk feeds named chase.",
    related_somatic: [
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "named_agent_pursuit_continuity",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "being-chased",
    slug: "stranger",
    title: "Dream About Being Chased by a Stranger",
    meta_title: "Chased by a Stranger Dream — Diffuse Threat Simulation | Oneirox",
    meta_description:
      "Stranger chase dreams are diffuse threat simulation — amygdala online, no stable identity bind for the pursuer.",
    kicker: "Threat without a file",
    lead: "No face you can place. Or a face that keeps changing. Diffuse stress often cannot afford a name, so the chase engine runs anonymous.",
    signal:
      "High threat drive with low identity binding — common when waking load is general overload rather than one interpersonal conflict.",
    body_paragraphs: [
      "Anonymous pursuers are not “your shadow” by requirement. They are what you get when threat-simulation lacks a specific agent memory to cast.",
      "Fog, masks, and shapeshifting pursuers are binding failures: the cortex keeps trying to stabilize a face under high arousal and fails.",
      "Treat daytime diffuse anxiety, sleep loss, and stimulant use as amplifiers before inventing a secret enemy.",
    ],
    variants: [
      {
        q: "Faceless pursuer",
        a: "Identity bind failed — threat salience without person file.",
      },
      {
        q: "Crowd chasing you",
        a: "Social-evaluation threat multiplied into a population pursuer.",
      },
    ],
    morning_prompt:
      "Is stress plural and unnamed right now? Anonymous chase likes plural load.",
    related_somatic: [
      { href: "/somatic/fragmented-rem/rem/fragmentation/", label: "Fragmented REM" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "diffuse_anonymous_pursuit",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "being-chased",
    slug: "legs-wont-move",
    title: "Dream About Being Chased but Legs Won't Move",
    meta_title: "Chase Dream Legs Won't Move — REM Atonia Signature | Oneirox",
    meta_description:
      "Heavy legs in a chase dream are the REM atonia signature leaking into narrative — motor lock, not weakness prophecy.",
    kicker: "Brainstem throttle as plot",
    lead: "You need to sprint. Your legs are concrete. The pursuer gains. This is one of the cleanest body-to-story maps in nightmare science.",
    signal:
      "REM atonia is dampening motor output; the chase narrative absorbs that as ineffective running — hardware signature, not moral metaphor.",
    body_paragraphs: [
      "During REM, spinal motor neurons are actively inhibited. Dreamed running still “happens” in motor cortex maps, but the felt efficacy collapses. Heavy-leg chase is that collapse told as story.",
      "People who lucid-dream sometimes recognize leg-lock as a REM cue. For everyone else, it just feels like failure.",
      "If the same heavy-leg feeling persists after waking, that is hypnopompic atonia spill — different page, related mechanism.",
    ],
    variants: [
      {
        q: "Legs in mud or water while chased",
        a: "Narrative metaphors for the same throttle — viscosity stories for inhibited output.",
      },
      {
        q: "You crawl instead of run",
        a: "Motor downgrade mid-scene as atonia deepens or arousal shifts.",
      },
    ],
    morning_prompt:
      "Did any immobility linger after waking? If yes, read sleep-paralysis / atonia pages next.",
    related_somatic: [
      { href: "/somatic/hypnopompic-immobility/rem/awakening/", label: "Hypnopompic immobility" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "atonia_throttled_flight_fail",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "being-chased",
    slug: "animal-pursuer",
    title: "Dream About Being Chased by an Animal",
    meta_title: "Animal Chasing You Dream — Primal Pursuit Circuit | Oneirox",
    meta_description:
      "Animal chase dreams often recruit faster primal threat circuits than human social chase — still threat simulation, not omen.",
    kicker: "Older circuit, faster onset",
    lead: "Teeth, claws, wings — not a person. Animal pursuit can feel more sudden and bodily than interpersonal chase. Different casting, same engine family.",
    signal:
      "Threat-simulation using a non-human predator schema — often faster amygdala onset than social-evaluation chase casts.",
    body_paragraphs: [
      "Evolutionarily older threat detectors respond hard to animal predators. REM can recruit those detectors even when your waking stress is a spreadsheet.",
      "Species choice (dog, snake, insect swarm) often follows personal fear ranking and recent media exposure more than a fixed symbol table.",
      "Compare with human-chase nights: if animal chases dominate, ask whether stress feels bodily/visceral rather than conversational.",
    ],
    variants: [
      {
        q: "Insects swarming as chase",
        a: "Population + disgust + pursuit — parallel load with contamination flavor.",
      },
      {
        q: "Large predator in open field",
        a: "Classic open-terrain pursuit rehearsal — high visual motion, high autonomic.",
      },
    ],
    morning_prompt:
      "Was yesterday’s stress more bodily (panic, caffeine, illness) than social? Animal casts like visceral load.",
    related_somatic: [
      { href: "/somatic/hypnagogic-tachycardia/n1/onset/", label: "Hypnagogic tachycardia" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "nonhuman_predator_pursuit",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "being-chased",
    slug: "recurring-chase",
    title: "Recurring Chase Dreams",
    meta_title: "Recurring Chase Dreams — Stuck Threat Rehearsal | Oneirox",
    meta_description:
      "Recurring chase nightmares are stuck threat rehearsal — unfinished daytime response plus REM pursuit hardware on repeat.",
    kicker: "Same flight path, many nights",
    lead: "Different streets, same fleeing. Recurrence means the rehearsal did not get a completion signal — decision still open, body still primed.",
    signal:
      "An unresolved avoidance or deferred-response loop is being re-simulated across nights until waking action or safety learning updates the file.",
    body_paragraphs: [
      "Nightmare recurrence is well documented when daytime coping stays frozen. The chase is not randomly invented each night; it is a saved rehearsal.",
      "Imagery rehearsal therapy and targeted waking decisions both reduce recurrence by giving the loop a new ending — mechanism change, not symbol change.",
      "Track whether the pursuer updates. Stable pursuer → specific unfinished file. Changing pursuer → diffuse load with stable chase geometry.",
    ],
    variants: [
      {
        q: "Same route every time",
        a: "Spatial habit in the nightmare — strong memory trace; good candidate for deliberate rewrite waking.",
      },
      {
        q: "Chase only returns under deadlines",
        a: "State-gated recurrence — stress opens the saved loop.",
      },
    ],
    morning_prompt:
      "What response have you postponed for more than a week? Recurring chase loves postponed response.",
    related_somatic: [
      { href: "/somatic/fragmented-rem/rem/fragmentation/", label: "Fragmented REM" },
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "stuck_pursuit_rehearsal_loop",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "cats",
    slug: "attacking",
    title: "Dream About a Cat Attacking You",
    meta_title: "Cat Attacking Dream — Ambivalent Close-Range Threat | Oneirox",
    meta_description:
      "Cat attack dreams are close-range ambivalent threat — affiliation category flipped into assault, not a luck omen.",
    kicker: "Soft category, hard contact",
    lead: "Claws out from something that should be gentle. That flip — comfort animal as attacker — is the affective signature.",
    signal:
      "An affiliation-tagged animal schema is running in assault mode — ambivalence and boundary violation themes are common continuity matches.",
    body_paragraphs: [
      "Cats occupy a different niche than dogs in many cultures: intimacy plus unpredictability. Attack scenes exploit that ambivalence.",
      "Scratches to face or hands often co-occur with real facial/hand sensory noise or anxiety about appearance/social face.",
      "Unlike dog assaults, cat attacks are frequently silent and sudden — startle geometry more than chase geometry.",
    ],
    variants: [
      {
        q: "House cat turns feral",
        a: "Safe-to-threat flip inside a familiar agent — boundary shock.",
      },
      {
        q: "Big cat (lion/tiger) attack",
        a: "Upscaled predator category — higher primal amplitude, less pet ambivalence.",
      },
    ],
    morning_prompt:
      "Where did comfort flip to threat in waking life recently? Match the flip.",
    related_somatic: [
      { href: "/somatic/n1-skin-crawl/n1/onset/", label: "N1 skin-crawl" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "affiliation_flip_close_assault",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "cats",
    slug: "watching-presence",
    title: "Dream About a Cat Watching You",
    meta_title: "Cat Watching You Dream — Silent Vigilance Threat | Oneirox",
    meta_description:
      "A watching cat dream is silent vigilance — monitoring without chase, often social-evaluation flavored.",
    kicker: "Eyes without pursuit",
    lead: "It stares. It does not blink on your schedule. No chase, no cuddle — just monitoring. That is freeze-adjacent social vigilance.",
    signal:
      "High monitoring, low locomotion: evaluation or boundary awareness rendered as a feline gaze rather than a human crowd.",
    body_paragraphs: [
      "Gaze is a powerful social threat cue in primates. A cat’s stare borrows that cue with fewer conversational details — pure being-seen.",
      "If the dream feels uncanny rather than cute, limbic tagging is threat-leaning despite the pet category.",
      "Compare with coiled-snake watching: similar freeze geometry, different species affect.",
    ],
    variants: [
      {
        q: "Many cats watching",
        a: "Audience multiplication — social evaluation without human faces.",
      },
      {
        q: "Cat eyes in the dark",
        a: "Low-light vigilance scene — often near awakening edges.",
      },
    ],
    morning_prompt:
      "Where do you feel observed without a clear confrontation? Watching dreams like that gap.",
    related_somatic: [
      { href: "/somatic/hypnopompic-immobility/rem/awakening/", label: "Hypnopompic immobility" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "silent_gaze_vigilance_feline",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "cats",
    slug: "inside-house",
    title: "Dream About Cats in the House",
    meta_title: "Cats in the House Dream — Territory + Ambivalent Agents | Oneirox",
    meta_description:
      "Cats filling a house mark territory shared with ambivalent agents — boundary load at home, not luck symbolism.",
    kicker: "Home filled with soft agents",
    lead: "Cats on counters, in closets, too many for the rooms. Territory is crowded by creatures that do not take orders. Boundary theme without a dog’s loyalty script.",
    signal:
      "Home-context memory is populated with semi-autonomous agents — often continuity with household boundary, privacy, or caretaking load.",
    body_paragraphs: [
      "Unlike snake-in-house (clear predator breach), cats-in-house can feel invasive without being fully predatory — ambivalence again.",
      "Quantity matters: one cat may be affiliation; a swarm is load. Parallel-agent crowding mirrors many-snakes geometry with softer affect.",
      "Real multi-pet homes bias this imagery via continuity — still useful to ask what feels unmanageable at home.",
    ],
    variants: [
      {
        q: "Stray cats entering freely",
        a: "Access control failure in the dream’s spatial logic — privacy theme.",
      },
      {
        q: "Hidden litter or mess",
        a: "Disgust + territory — contamination of safe space.",
      },
    ],
    morning_prompt:
      "What household or privacy boundary feels porous? Start with access, not omen.",
    related_somatic: [
      { href: "/somatic/k-complex-arousal/n2/mid-cycle/", label: "K-complex arousal" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "home_territory_ambivalent_crowd",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "cats",
    slug: "dead-cat",
    title: "Dream About a Dead Cat",
    meta_title: "Dead Cat Dream — Soft Attachment Loss Signal | Oneirox",
    meta_description:
      "A dead cat dream rehearses soft attachment loss — quieter grief circuitry than dog-death nights for many dreamers.",
    kicker: "Quiet bond offline",
    lead: "The cat is still. Grief may be muted or sharp. Soft-attachment loss uses a quieter animal than many dog-death scenes, but the consolidation job is similar.",
    signal:
      "Attachment-loss rehearsal with a low-chase, high-intimacy animal object — grief or role-loss continuity without predator engine.",
    body_paragraphs: [
      "Dead-cat imagery often appears when a subtle bond or private comfort ends — not only literal pet death. Independence, moving out, or friendship fade can cast here.",
      "Lower chase energy than dead-dog nights for some dreamers reflects the animal’s typical behavioral niche in memory, not moral ranking.",
      "If horror dominates over sadness, check for disgust or uncanny-valley tagging rather than pure grief.",
    ],
    variants: [
      {
        q: "Finding a dead cat outdoors",
        a: "Discovery without caregiving failure — loss as fact more than guilt.",
      },
      {
        q: "Your cat dies in your arms",
        a: "High intimacy loss — strong candidate for real pet worry or parallel human goodbye.",
      },
    ],
    morning_prompt:
      "What quiet comfort ended or is ending? Soft losses cast soft animals.",
    related_somatic: [
      { href: "/somatic/hypnopompic-chest-weight/rem/awakening/", label: "Hypnopompic chest weight" },
    ],
    related_mechanics: { href: "/mechanics/rem/cortex-eeg/", label: "REM cortex & EEG" },
    mechanism_key: "soft_attachment_loss_feline",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "sleep-paralysis",
    slug: "with-presence",
    title: "Sleep Paralysis with a Presence in the Room",
    meta_title: "Sleep Paralysis Presence — Intruder Hallucination + Atonia | Oneirox",
    meta_description:
      "A felt presence during sleep paralysis is intruder hallucination on REM atonia — terrifying, common, not a visitation.",
    kicker: "Atonia + intruder schema",
    lead: "You cannot move. Something is in the room. You know it is there before you see it. This is one of the most replicated REM-wake overlap phenomena in the literature.",
    signal:
      "REM atonia persists into wake-like awareness while threat-intruder hallucination fills the sensory gap — classic sleep-paralysis package.",
    body_paragraphs: [
      "Sleep paralysis occurs when REM muscle inhibition outlasts the dream or arrives at the wrong edge of sleep. Consciousness returns; the body stays locked.",
      "Felt presence is a common accompanying hallucination: the brain expects an agent when threat arousal is high and sensory data is incomplete. Cross-cultural “old hag / intruder” reports share this hardware.",
      "Supine position, irregular sleep, and anxiety increase odds. It is frightening and usually benign — still worth clinical advice if frequent.",
    ],
    variants: [
      {
        q: "Shadow figure at the foot of the bed",
        a: "Common visual bind for the presence hallucination — shape without face detail.",
      },
      {
        q: "Presence without visual form",
        a: "Pure agency detection without imagery — still the same intruder tagging.",
      },
    ],
    morning_prompt:
      "Sleep schedule chaos this week? Irregular REM timing is a major gate for paralysis nights.",
    related_somatic: [
      { href: "/somatic/sleep-paralysis-onset/rem/awakening/", label: "Sleep paralysis onset — REM/awakening" },
      { href: "/somatic/hypnopompic-immobility/rem/awakening/", label: "Hypnopompic immobility" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "atonia_intruder_presence_hallucination",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "sleep-paralysis",
    slug: "cannot-speak",
    title: "Sleep Paralysis When You Cannot Speak",
    meta_title: "Sleep Paralysis Can't Speak — Vocal Atonia Spill | Oneirox",
    meta_description:
      "Mute sleep paralysis is vocal atonia: attempted speech meets REM muscle lock while awareness is online.",
    kicker: "Voice locked with the body",
    lead: "You try to call out. Nothing. Or a thin whisper. The mute attempt is not metaphorical — laryngeal muscles are under the same REM lock.",
    signal:
      "Attempted phonation during residual REM atonia fails at the effector — dream/wake awareness experiences it as silenced panic.",
    body_paragraphs: [
      "Speech is a motor act. Under atonia it fails like limb movement fails. Many reports of “trying to scream” during paralysis are literal motor attempts.",
      "The panic loop amplifies: failed shout → more threat → stronger struggle → longer subjective episode.",
      "Focusing on a small toe or finger wiggle is a practical exit strategy some people learn — recruiting a motor channel that sometimes releases first.",
    ],
    variants: [
      {
        q: "Only a squeak comes out",
        a: "Partial effector breakthrough — atonia lifting unevenly.",
      },
      {
        q: "You can think words clearly but not speak",
        a: "Cortex online, cranial motor off — classic dissociation of the paralysis state.",
      },
    ],
    morning_prompt:
      "Did trying harder to yell make it worse? Note that — struggle amplifies the loop.",
    related_somatic: [
      { href: "/somatic/sleep-paralysis-onset/rem/awakening/", label: "Sleep paralysis onset" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "vocal_effector_atonia_fail",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "sleep-paralysis",
    slug: "chest-weight",
    title: "Sleep Paralysis with Chest Pressure",
    meta_title: "Sleep Paralysis Chest Weight — Thoracic Load + Atonia | Oneirox",
    meta_description:
      "Chest pressure in sleep paralysis mixes REM atonia with thoracic/breathing percepts — the classic incubus phenomenology.",
    kicker: "Weight on the sternum",
    lead: "Something sits on your chest. Breathing feels wrong. The incubus legend wrote theology around a respiratory-motor event.",
    signal:
      "REM atonia plus altered thoracic/breathing interoception is narrativized as an external weight — often with intruder hallucination stacked on top.",
    body_paragraphs: [
      "Supine sleep, mild airway resistance, and high CO2 sensitivity can color chest percepts during paralysis. The brain prefers an agent-cause (“something on me”) over “my breathing map is noisy.”",
      "Hypnopompic chest-weight experiences can occur near awakening without full classic paralysis; the overlap is real and documented in somatic utilities here.",
      "If daytime breathlessness or snoring is present, bring that to a clinician — dream mechanism does not rule out sleep-disordered breathing.",
    ],
    variants: [
      {
        q: "Weight plus visible figure",
        a: "Full incubus package: atonia + thoracic load + intruder bind.",
      },
      {
        q: "Weight without fear",
        a: "Lower amygdala tagging — same body event, different affective dye.",
      },
    ],
    morning_prompt:
      "Snoring, dry mouth, or morning headache? Flag those for a sleep conversation.",
    related_somatic: [
      { href: "/somatic/hypnopompic-chest-weight/rem/awakening/", label: "Hypnopompic chest weight" },
      { href: "/somatic/sleep-paralysis-onset/rem/awakening/", label: "Sleep paralysis onset" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "thoracic_load_incubus_bind",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "sleep-paralysis",
    slug: "hypnopompic-exit",
    title: "Sleep Paralysis as You Wake",
    meta_title: "Waking Sleep Paralysis — Hypnopompic Atonia Spill | Oneirox",
    meta_description:
      "Paralysis at awakening is hypnopompic atonia spill — REM lock lingering into wake, often briefer than mid-night episodes.",
    kicker: "Exit gate stuck",
    lead: "The alarm exists. Morning light exists. Your body does not answer yet. Waking paralysis is the exit gate lagging behind awareness.",
    signal:
      "Hypnopompic REM atonia spill: consciousness and environmental cues return before motor release completes.",
    body_paragraphs: [
      "Sleep paralysis is often discussed as middle-of-night terror, but hypnopompic (wake-edge) forms are common. They can be shorter and less hallucinated — or just as vivid.",
      "Alarm clocks, partner movement, and light can arrive while the lock remains, creating the uncanny “I am awake but stored” state.",
      "Regular sleep timing reduces odds. Panic during the wait prolongs subjective duration.",
    ],
    variants: [
      {
        q: "Paralysis only in the morning",
        a: "Exit-gate predominance — still REM physiology, different clock time.",
      },
      {
        q: "You hear the room clearly while locked",
        a: "Sensory wake with motor REM — hallmark hypnopompic split.",
      },
    ],
    morning_prompt:
      "How long did it last subjectively? Short morning locks often need less story and more schedule hygiene.",
    related_somatic: [
      { href: "/somatic/hypnopompic-immobility/rem/awakening/", label: "Hypnopompic immobility" },
      { href: "/somatic/awakening-rem-hangover-motor/rem/awakening/", label: "REM hangover motor awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/atonia/", label: "REM atonia lock" },
    mechanism_key: "hypnopompic_exit_atonia_lag",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "water-and-drowning",
    slug: "drowning",
    title: "Dream About Drowning",
    meta_title: "Drowning Dream Meaning — Respiratory Threat Simulation | Oneirox",
    meta_description:
      "Drowning dreams are respiratory-threat simulations — airway and breath interoception bound into water narrative.",
    kicker: "Breath as the stakes",
    lead: "Water fills the mouth. You cannot get air. Panic is immediate. This is threat simulation aimed at the respiratory map, not a prediction about lakes.",
    signal:
      "Airway/breath interoception plus high amygdala drive is narrativized as drowning — one of the body’s highest-priority threat stories.",
    body_paragraphs: [
      "Breathing threats rank high in alarm hierarchies. REM can stage drowning when CO2 sensitivity, congestion, supine airway resistance, or panic predisposition is elevated.",
      "Water is an efficient medium for “no air” stories. The specific ocean/pool/bathtub is continuity costume.",
      "Recurrent drowning nightmares deserve a conversation about anxiety and possible sleep-disordered breathing — mechanism-informed, not dismissive.",
    ],
    variants: [
      {
        q: "Drowning in a pool vs ocean",
        a: "Contained vs open water changes spatial panic more than core respiratory mechanism.",
      },
      {
        q: "You watch yourself drown",
        a: "Dissociated viewpoint — sometimes lower motor struggle, still respiratory threat tagging.",
      },
    ],
    morning_prompt:
      "Congestion, snoring, or panic residual on waking? Breath first.",
    related_somatic: [
      { href: "/somatic/hypnopompic-chest-weight/rem/awakening/", label: "Hypnopompic chest weight" },
      { href: "/somatic/hypnagogic-tachycardia/n1/onset/", label: "Hypnagogic tachycardia" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "respiratory_threat_water_bind",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "water-and-drowning",
    slug: "tidal-wave",
    title: "Dream About a Tidal Wave",
    meta_title: "Tidal Wave Dream — Overwhelming Approach Threat | Oneirox",
    meta_description:
      "Tidal-wave dreams stage overwhelming approach threat — large-scale unavoidable force, often stress-load continuity.",
    kicker: "Unavoidable approaching mass",
    lead: "The horizon rises. A wall of water comes for the city, the beach, you. You cannot outrun scale. That is the point of the image.",
    signal:
      "Threat-simulation using an approaching large-scale force — common when waking stressors feel bigger than personal agency.",
    body_paragraphs: [
      "Tidal waves differ from drowning-in-place: the key is approach of overwhelming magnitude. Agency feels mismatched to the problem size — continuity with work, family, or world-scale anxiety.",
      "Visual motion of a rising wall is high-salience; REM loves it when arousal is high but the threat is not interpersonal.",
      "If you surf or survive the wave, coping rehearsal is online; if you only watch, freeze/monitoring dominates.",
    ],
    variants: [
      {
        q: "Wave hits but you survive",
        a: "Impact-with-agency — stress is huge but not coded as lethal in the night’s affective math.",
      },
      {
        q: "Multiple waves",
        a: "Serial overwhelm — repeated load pulses across the dream.",
      },
    ],
    morning_prompt:
      "What problem currently feels larger than your tools? Match scale language, not ocean lore.",
    related_somatic: [
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/cortex-eeg/", label: "REM cortex & EEG" },
    mechanism_key: "large_scale_approach_overwhelm",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "anxiety-dreams",
    slug: "free-floating-dread",
    title: "Dream About Free-Floating Dread",
    meta_title: "Free-Floating Anxiety Dream — Untargeted Limbic Drive | Oneirox",
    meta_description:
      "Free-floating dread dreams are untargeted limbic drive — high anxiety affect without a stable threat object.",
    kicker: "Alarm without a file",
    lead: "Nothing is chasing you. Nothing is breaking. You still know something is terribly wrong. That is affect without a bound object.",
    signal:
      "Elevated limbic arousal during REM fails to bind to a specific threat schema — dread fills the scene as atmosphere.",
    body_paragraphs: [
      "Not all anxiety dreams are chase or exam scripts. Sometimes the hardware runs hot and content stays thin: hallways, gray light, waiting rooms, “wrongness.”",
      "Generalized anxiety daytime predicts more untargeted dream affect. The fix is rarely a symbol; it is arousal and daytime load management.",
      "If dread always finds an object by dream’s end, you are watching binding succeed late — useful to note what object finally appeared.",
    ],
    variants: [
      {
        q: "Dread in an empty house",
        a: "Place without agent — context anxiety more than pursuit.",
      },
      {
        q: "Dread that something already happened",
        a: "Retrospective threat affect — common after rumination-heavy evenings.",
      },
    ],
    morning_prompt:
      "Body anxiety on waking (chest, gut) without a story? Log somatic residue separately from plot.",
    related_somatic: [
      { href: "/somatic/hypnagogic-tachycardia/n1/onset/", label: "Hypnagogic tachycardia" },
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/pgo-autonomic/", label: "PGO & autonomic surge" },
    mechanism_key: "untargeted_limbic_dread",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "naked-in-public",
    slug: "workplace",
    title: "Dream About Being Naked at Work",
    meta_title: "Naked at Work Dream — Evaluation Exposure Threat | Oneirox",
    meta_description:
      "Naked-at-work dreams are social-evaluation exposure — competence threat in a high-stakes context, not a morality tale.",
    kicker: "Exposure where status lives",
    lead: "The office. The meeting. No clothes. Shame or odd calm. This is evaluation threat staged as body exposure in the place your status is scored.",
    signal:
      "Social-evaluation circuitry binds “being seen incorrectly / unprepared” to literal bodily exposure in a work context map.",
    body_paragraphs: [
      "Public nakedness dreams are classic social-threat simulations. Workplace casting raises the stakes because hierarchical eyes are in the scene.",
      "People under performance review, new roles, or impostor-load report these more — continuity, not a clothing prophecy.",
      "Calm nakedness (no shame) often means lower amygdala dye on the same exposure schema — oddness without panic.",
    ],
    variants: [
      {
        q: "Naked in a presentation",
        a: "Peak evaluation moment — exposure timed to performance.",
      },
      {
        q: "Only you notice you are naked",
        a: "Internal evaluation threat more than external audience response.",
      },
    ],
    morning_prompt:
      "Where is your competence on display this week? Match the audience, not the outfit.",
    related_somatic: [
      { href: "/somatic/cortisol-awakening-motor/n1/awakening/", label: "Cortisol-linked awakening" },
    ],
    related_mechanics: { href: "/mechanics/rem/cortex-eeg/", label: "REM cortex & EEG" },
    mechanism_key: "workplace_evaluation_exposure",
    indexable: true,
    wave: "A",
  },
  {
    parent_slug: "house-dreams",
    slug: "childhood-house",
    title: "Dream About Your Childhood House",
    meta_title: "Childhood House Dream — Old Spatial-Affect Map | Oneirox",
    meta_description:
      "Childhood-house dreams reactivate old spatial-affect maps — dense memory, not a real-estate omen.",
    kicker: "Old map, live affect",
    lead: "The hallway is wrong and right at once. Rooms from age nine. Your current adult body walking a child’s floorplan. Memory architecture is the mechanism.",
    signal:
      "Early spatial-affect maps are being re-entered during consolidation — high-density autobiographical place memory online in REM.",
    body_paragraphs: [
      "Houses in dreams often stand for self-structure in popular talk. Mechanically, childhood homes are simply among the densest place memories you own — easy for REM to load.",
      "Returning there during adult stress is common: the brain searches early safety/threat templates when current maps feel unstable.",
      "Detail accuracy varies; emotional tone of the rooms is the useful morning signal.",
    ],
    variants: [
      {
        q: "Childhood house with wrong rooms",
        a: "Map corruption — memory reconsolidation under stress, not a secret wing prophecy.",
      },
      {
        q: "Parents still living there as then",
        a: "Time-locked cast — affective memory more than current family logistics.",
      },
    ],
    morning_prompt:
      "What current instability sent you looking for an old map? Name the instability.",
    related_somatic: [
      { href: "/somatic/early-n3-stillness/n3/mid-cycle/", label: "Early N3 stillness" },
    ],
    related_mechanics: { href: "/mechanics/rem/cycle-timing/", label: "REM cycle timing" },
    mechanism_key: "autobiographical_place_map_reactivation",
    indexable: true,
    wave: "A",
  },
];

console.log(`WAVE_A entries: ${WAVE_A.length}`);
