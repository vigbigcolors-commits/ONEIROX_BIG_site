# Oneirox.com — static site (GitHub + Cloudflare Pages)

Scientific dream decoder. Not a symbol dictionary.

## Quick start (local)

```powershell
cd "D:\aONEIROX +++++++++\Oneirox"
npx --yes serve public -p 3000
```

Open http://localhost:3000

## Structure

```
Oneirox/
├── public/           # deploy this folder to Cloudflare Pages
│   ├── index.html    # homepage (in progress)
│   ├── css/
│   │   ├── tokens.css    ← palette (from docs/DESIGN-TOKENS.css)
│   │   ├── main.css      ← layout, sections, decor
│   │   └── decode.css    ← decode panel only (isolated)
│   └── js/
│       ├── oneirox-decode.js   ⚠️ do not break
│       └── oneirox-share.js
├── content/          # JSON — author, studies, books
├── docs/             # specs, design tokens
├── tools/            # mapper, phase calculator pages
└── NEED-FROM-VIGEN.md
```

## Design palette

See `docs/DESIGN-TOKENS.css` — colors: `#3a4435` `#566e58` `#73a563` `#cbd4c2` `#c4d8b4` …

## API

`POST https://oneirox-api-production.up.railway.app/analyze`

## Next session in Cursor

```
Read NEED-FROM-VIGEN.md and docs/HOMEPAGE-SPEC.md. Continue Oneirox homepage.
```
