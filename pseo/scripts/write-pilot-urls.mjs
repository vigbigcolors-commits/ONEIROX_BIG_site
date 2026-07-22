import fs from "node:fs";
const xml = fs.readFileSync("public/sitemap-somatic.xml", "utf8");
const all = [...xml.matchAll(/<loc>(https:\/\/oneirox\.com\/somatic\/[^<]+)<\/loc>/g)].map((m) => m[1]);
const utils = all.filter((u) => /\/somatic\/.+\/.+\/.+\/$/.test(u));
console.log("total_loc", all.length);
console.log("utility_urls", utils.length);
fs.writeFileSync("pseo/data/indexing-pilot-urls.txt", utils.slice(0, 10).join("\n") + "\n");
console.log(utils.slice(0, 10).join("\n"));
