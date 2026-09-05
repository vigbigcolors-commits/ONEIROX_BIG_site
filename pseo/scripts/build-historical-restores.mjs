/**
 * Restores the ten highest-priority historical WordPress articles at their
 * original URLs. The supplied export remains the editorial source of truth;
 * this script only normalizes its HTML into the current static page shell.
 *
 * Usage: node pseo/scripts/build-historical-restores.mjs <wp-posts.json>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const input = process.argv[2];
if (!input) throw new Error("Usage: node pseo/scripts/build-historical-restores.mjs <wp-posts.json>");

const pages = [
  {
    slug: "dreaming-about-someone-you-havent-seen-in-years",
    title: "Dreaming About Someone You Haven't Seen in Years",
    description: "Why someone from your past can appear in a dream years later, and how to reflect on the memory without treating it as a message or prediction.",
    lead: "Dreaming about someone you have not seen in years can make an old relationship feel suddenly present again. The dream does not, by itself, tell you that you should contact them or that they are thinking of you.",
    answer: "Start with what the person and that period of life bring up for you now. A recent situation, feeling, place, or conversation can make an older memory newly available in a dream.",
    links: [["/dreams/recurring-dreams/", "why recurring dreams happen"], ["/#lab-search", "Lab Search"]],
  },
  {
    slug: "dream-about-someone-texting-you-meaning",
    title: "Dream About Someone Texting You: What It Can Mean",
    description: "A practical way to read a dream about someone texting you: the sender, message, reply, silence, and feelings on waking all matter more than a fixed symbol.",
    lead: "A text in a dream often makes a question about contact feel immediate: what was said, who sent it, whether you replied, and what the silence meant. Those details are more useful than treating texting as a fixed dream symbol.",
    answer: "Notice the emotional problem the message creates in the dream—anticipation, relief, uncertainty, regret, or pressure—and compare it with what is active in waking life.",
    links: [["/dreams/recurring-dreams/", "recurring dreams about people"], ["/#lab-search", "Lab Search"]],
  },
  {
    slug: "dream-about-someone-you-dont-talk-to-anymore-meaning",
    title: "Dream About Someone You Don't Talk to Anymore",
    description: "Why a person you no longer speak with may appear in a dream, with a grounded way to reflect on unfinished feelings without reading the dream as a command.",
    lead: "A dream about someone you no longer talk to can reopen a memory without requiring action in the relationship. It may be more useful to ask what feels unfinished to you than to assume the dream predicts renewed contact.",
    answer: "The scene, your reaction, and the current context matter. A person can return in a dream because they are tied to a period, conflict, hope, or version of yourself that is relevant again.",
    links: [["/dreams/recurring-dreams/", "dreams that repeat around a person"], ["/#lab-search", "Lab Search"]],
  },
  {
    slug: "dream-about-big-snake-meaning-interpretation",
    title: "Dream About a Big Snake: Meaning and Interpretation",
    description: "How to think about a dream involving a large snake, including size, distance, movement, fear, and what made the scene feel significant.",
    lead: "A large snake can make a dream feel more urgent because size changes the scale of the encounter. It does not supply one universal meaning; the setting, distance, movement, and your reaction are what make the scene specific.",
    answer: "Consider whether the dream emphasized watching, being approached, escaping, or dealing with the snake. Those actions usually reveal more than the animal's size alone.",
    links: [["/dreams/snakes/", "the main guide to snake dreams"], ["/dreams/snakes/bitten/", "a snake bite dream"]],
  },
  {
    slug: "dream-about-a-dog-in-your-house",
    title: "Dream About a Dog in Your House",
    description: "A grounded interpretation of dreaming about a dog in your house, using the dog's behaviour, familiarity, and the feeling of home as the important details.",
    lead: "A dog inside a house places an animal associated with companionship or threat inside a private, familiar setting. Whether the dog is welcome, strange, calm, barking, or aggressive changes the question the dream raises.",
    answer: "Start with the dog's behaviour and your sense of safety in the house. The setting can matter as much as the dog itself because it tells you where the dream located the encounter.",
    links: [["/dreams/dogs/", "the broader guide to dog dreams"], ["/#lab-search", "Lab Search"]],
  },
  {
    slug: "dream-about-someone-confessing-love-meaning",
    title: "Dream About Someone Confessing Love",
    description: "How to reflect on a dream in which someone confesses love, without treating the dream as proof of another person's feelings or a prediction of contact.",
    lead: "When someone confesses love in a dream, the scene can feel unusually direct. It is still not evidence of what that person feels or what will happen next; it is a dream scenario worth reading through your own feelings and context.",
    answer: "Ask what the confession changed in the dream. Relief, surprise, discomfort, longing, or hesitation can point to a current emotional question without turning the dream into a message from the other person.",
    links: [["/dreams/recurring-dreams/", "why people recur in dreams"], ["/#lab-search", "Lab Search"]],
  },
  {
    slug: "dream-about-someone-ignoring-you-meaning",
    title: "Dream About Someone Ignoring You",
    description: "What a dream about being ignored can bring up: unanswered communication, exclusion, uncertainty, and the feelings that stayed after waking.",
    lead: "Being ignored in a dream often concentrates a familiar feeling: waiting for a response, not being seen, or not knowing where you stand. The dream cannot establish another person's motives, but it can make your own reaction clear.",
    answer: "Focus on who ignored you, what you needed from them in the scene, and what happened next. Those details help distinguish a current communication worry from an older memory that has been reactivated.",
    links: [["/dreams/recurring-dreams/", "recurring people and memories"], ["/#lab-search", "Lab Search"]],
  },
  {
    slug: "dream-about-saving-a-dog",
    title: "Dream About Saving a Dog",
    description: "A practical way to interpret a dream about saving a dog by looking at the rescue, the dog's condition, your role, and what the dream left you feeling.",
    lead: "Saving a dog puts care, responsibility, urgency, and attachment into the same scene. The rescue matters: it is different from simply seeing a dog, being chased by one, or losing one.",
    answer: "Think about what the dog needed, whether you could help, and how you felt after the rescue. Those details can be more revealing than assigning a fixed meaning to dogs or saving.",
    links: [["/dreams/dogs/", "the broader guide to dog dreams"], ["/#lab-search", "Lab Search"]],
  },
  {
    slug: "dream-about-head-injury-meaning",
    title: "Dream About a Head Injury: Meaning and Context",
    description: "How to reflect on a dream about a head injury without treating it as a diagnosis or prediction, and when a real symptom needs medical attention.",
    lead: "A dream about a head injury can be disturbing, especially when it includes pain, blood, or a sudden impact. A dream alone cannot diagnose an injury or predict one, but the details may be worth reflecting on.",
    answer: "Separate the dream from waking symptoms. If you have had a real head injury or have new concerning symptoms, seek medical advice rather than using dream interpretation as a substitute for care.",
    links: [["/somatic/", "the somatic sleep library"], ["/disclaimer/", "Oneirox's limits and disclaimer"]],
  },
  {
    slug: "dream-about-someone-helping-you-meaning",
    title: "Dream About Someone Helping You",
    description: "A grounded interpretation of dreams about receiving help, with attention to who helped, what they did, and what support or pressure the scene carried.",
    lead: "A dream about someone helping you can make support feel concrete: someone arrives, notices a problem, or helps you through something you could not manage alone. The meaning lies in the relationship and the kind of help, not in a universal symbol.",
    answer: "Ask what was difficult before help appeared and whether accepting it felt easy, relieving, embarrassing, or complicated. That sequence often makes the dream more useful to reflect on.",
    links: [["/dreams/recurring-dreams/", "how memory themes return in dreams"], ["/#lab-search", "Lab Search"]],
  },
];

function esc(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function cleanWordPressHtml(value) {
  return String(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(?:script|style|iframe)[\s\S]*?<\/(?:script|style|iframe)>/gi, "")
    .replace(/<h1\b[^>]*>/gi, "<h2>")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<a\b[^>]*>/gi, "")
    .replace(/<\/a>/gi, "")
    .replace(/\s(?:class|style|id|data-[\w-]+)=(?:\"[^\"]*\"|'[^']*')/gi, "")
    .replace(/<hr\b[^>]*>/gi, "<hr>")
    .trim();
}

function pageHtml(entry, post) {
  const url = `https://oneirox.com/${entry.slug}/`;
  const links = entry.links.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join(" · ");
  const source = cleanWordPressHtml(post.content_html);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(entry.title)} | Oneirox</title>
  <meta name="description" content="${esc(entry.description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index,follow">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/dreams/assets/dream-meaning.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${esc(entry.title)}","description":"${esc(entry.description)}","url":"${url}","author":{"@type":"Person","name":"Vigen G.R."}}</script>
</head>
<body class="dm-body">
  <header class="dm-top"><a class="dm-brand" href="/">Oneirox</a><nav class="dm-nav" aria-label="Dream Meaning"><a href="/dreams/">Dream Meaning</a><a href="/lab/">Lab</a><a href="/#lab-search">Lab Search</a></nav></header>
  <main class="dm-main">
    <p class="dm-breadcrumb"><a href="/">Oneirox</a> · <a href="/dreams/">Dream Meaning</a> · ${esc(entry.title)}</p>
    <h1 class="dm-title">${esc(entry.title)}</h1>
    <p class="dm-lead">${esc(entry.lead)}</p>
    <section class="dm-signal" aria-label="A direct answer"><span class="dm-signal__tag">A DIRECT ANSWER</span><p>${esc(entry.answer)}</p></section>
    <div class="dm-prose dm-prose--gold">
${source}
    </div>
    <section class="dm-related" aria-label="Related reading"><h2>Related reading</h2><p>${links}</p></section>
    <p class="dm-disclaimer">This article is for reflection and education. It is not medical, mental-health, or relationship advice.</p>
  </main>
  <footer class="dm-foot"><a href="/dreams/">Dream Meaning</a> · <a href="/mechanics/rem/">REM mechanics</a> · <a href="/somatic/">Somatic utilities</a> · <a href="/#lab-search">Lab Search</a></footer>
</body>
</html>`;
}

const posts = JSON.parse(fs.readFileSync(input, "utf8"));
for (const entry of pages) {
  const post = posts.find((item) => item.slug === entry.slug);
  if (!post?.content_html) throw new Error(`Missing WordPress article: ${entry.slug}`);
  const dir = path.join(root, "public", entry.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), pageHtml(entry, post));
}
console.log(`Restored ${pages.length} historical pages.`);
