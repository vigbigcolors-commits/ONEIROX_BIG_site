# CONTINUATION — Oneirox (читай первым в новом чате Cursor)

**Обновлено:** 2 июля 2026  
**Контрольная точка (git tag):** `07.02.2026_Oneirox_pagespeed` → commit `365d1b5`  
**Предыдущая точка:** `07.02.2026_Oneirox` → `311663c`  
**Сайт (статика):** `D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox`  
**GitHub:** https://github.com/vigbigcolors-commits/ONEIROX_BIG_site  
**Cloudflare Pages:** oneirox-big-site → **https://oneirox.com**  
**API (Python):** `D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++` → Railway  
**Цель:** **инструмент** (WebApplication / Decode), не блог

---

## Контрольная точка `07.02.2026_Oneirox_pagespeed` (2 июля 2026)

**Зафиксировано — рабочий прод + mobile PageSpeed:**

| Что | Статус |
|-----|--------|
| Домен oneirox.com на Cloudflare Pages | ✅ |
| GitHub `ONEIROX_BIG_site` синхронизирован | ✅ |
| Главная + Decode + API Railway | ✅ |
| About, Methodology, Disclaimer, Privacy, Terms, Phase, Tools | ✅ |
| 310→307 редиректов WP (`public/_redirects`) | ✅ (петли /about/ исправлены) |
| `sitemap.xml` + `robots.txt` | ✅ |
| Schema WebApplication + мобильный Decode (textarea) | ✅ |
| Логотип — пульсирующее сердце 60 BPM | ✅ |
| **Mobile PageSpeed** — critical CSS ~19 KB, self-hosted fonts, idle scripts | ✅ |
| Анимация мозга + synapses на мобиле | ✅ |

**Оптимизации главной (commit `365d1b5`):**
- `decode.css` — только hero + форма (critical path)
- `decode-deferred.css` — panel body, results, neuro spotlight (async)
- `main.css` — below-fold sections (async)
- `fonts.css` + `public/fonts/*.woff2` — без Google Fonts RTT
- `perf-defer.js` — neural-bg, share, back-to-top после `load` + idle
- JSON-LD перенесён в конец `<body>`
- `fetchpriority="high"` на `neiro.webp`

**Вернуться к этой точке:**
```powershell
cd "D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox"
git fetch origin
git checkout 07.02.2026_Oneirox_pagespeed
# или новая ветка от тега:
git checkout -b restore-from-checkpoint 07.02.2026_Oneirox_pagespeed
```

---

## Контрольная точка `07.02.2026_Oneirox` (2 июля 2026) — предыдущая

**Зафиксировано — рабочий прод:**

| Что | Статус |
|-----|--------|
| Домен oneirox.com на Cloudflare Pages | ✅ |
| GitHub `ONEIROX_BIG_site` синхронизирован | ✅ |
| Главная + Decode + API Railway | ✅ |
| About, Methodology, Disclaimer, Privacy, Terms, Phase, Tools | ✅ |
| 310→307 редиректов WP (`public/_redirects`) | ✅ (петли /about/ исправлены) |
| `sitemap.xml` + `robots.txt` | ✅ |
| Schema WebApplication + мобильный Decode (textarea) | ✅ |
| Логотип — пульсирующее сердце 60 BPM | ✅ |

**Вернуться к этой точке:**
```powershell
cd "D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox"
git fetch origin
git checkout 07.02.2026_Oneirox
```

**Не путать с устаревшей копией:** `C:\Users\Vigen\Downloads\Oneirox` — без git, не деплоится.

---

## Фраза для нового чата (копируй целиком)

```
Открыл workspace Oneirox. Прочитай CONTINUATION.md.
Контрольная точка: git tag 07.02.2026_Oneirox_pagespeed (commit 365d1b5).
Папка: D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox
Decode не ломать (oneirox-decode.js + decode.css + контракт формы).
API: D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++ (Railway).
```

Или прикрепи: `@CONTINUATION.md` `@public/index.html` `@public/js/oneirox-decode.js`

---

## Два проекта — два репозитория (ВАЖНО)

| Слой | Папка на диске | GitHub | Деплой |
|------|----------------|--------|--------|
| **Сайт** (HTML/CSS/JS) | `D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox` | **ONEIROX_BIG_site** ✅ | **Cloudflare Pages** → `public/` |
| **API** (FastAPI) | `D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++` | `oneirox-api` ✅ | **Railway** |

**Связь:** `public/js/oneirox-decode.js` → `POST https://oneirox-api-production.up.railway.app/analyze`  
Локально: `http://127.0.0.1:8000/analyze` (запустить uvicorn в папке API)

### API — что где (ничего не прятали)

| Файл | Роль |
|------|------|
| `main.py` | FastAPI, `/analyze`, rate limit, Claude |
| `dream_validation.py` | Валидация сна, бюджет ответа, `build_user_message()` |
| `ONEIROX_PROMPT.txt` | Системный промпт Decode |
| `dream.txt` | **Только тест** — `py test_dream.py dream.txt` (в .gitignore) |
| `test_dream.py` | Локальный тест без сайта |

**Не коммитить в API:** `.env`, `dream.txt`, `API KEY/`, `ЗАПАС/`

---

## Локальный запуск

```powershell
# Сайт
cd "D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox"
npm run dev
```
→ http://localhost:3000

```powershell
# API (если нужен локальный Decode)
cd "D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++"
# .venv активировать, затем:
uvicorn main:app --reload --port 8000
```

---

## Страницы сайта (статус)

| URL | Файл | Статус |
|-----|------|--------|
| `/` | `public/index.html` | ✅ Главная — hero Decode, tools, SEO-блоки, JSON-LD WebApplication |
| `/about/` | `public/about/index.html` | ✅ ~2000 слов, E-E-A-T, editorial |
| `/methodology/` | `public/methodology/index.html` | ✅ ~2200 слов, 5 principles, books, timeline |
| `/privacy/` | `public/privacy/index.html` | ✅ Legal editorial |
| `/terms/` | `public/terms/index.html` | ✅ Legal editorial |
| `/disclaimer/` | `public/disclaimer/index.html` | ✅ YMYL — тёмный hero, crisis resources |
| `/phase/` | `public/phase/index.html` | ✅ Dream Phase Calculator — lunar UI |
| `/tools/oneirox-dream-mapper.html` | `public/tools/…` | ✅ Mapper (свой дизайн) |
| `/tools/oneirox-dream-phase-calculator.html` | дубликат/legacy | ⚠️ основной инструмент → `/phase/` |

---

## CSS / JS — карта файлов

### Глобальные
| Файл | Назначение |
|------|------------|
| `public/css/tokens.css` | Палитра + body reset — **не менять без причины** |
| `public/css/fonts.css` | Self-hosted Playfair + Work Sans (`public/fonts/`) |
| `public/css/site-nav.css` | Header, logo, nav, кнопки, **сердце в логотипе** |
| `public/css/page.css` | Inner pages shell (импорт fonts + tokens + site-nav) |
| `public/css/main.css` | Footer, sections, instruments — **async на главной** |

### Главная
| Файл | Назначение |
|------|------------|
| `public/css/decode.css` | ⚠️ **Critical Decode** — hero, форма, synapses, stats |
| `public/css/decode-deferred.css` | Panel body, results, neuro spotlight — **async** |
| `public/css/flow.css` | Flow cards — async |
| `public/css/why-decode.css` | Why Decode block — async |
| `public/css/tools.css` | Tools cards — async |
| `public/css/insight.css` | How, Why, Mechanisms, Science, Trust, FAQ — async |
| `public/js/oneirox-decode.js` | ⚠️ **Мозг Decode** — не ломать |
| `public/js/perf-defer.js` | Idle-load: neural-bg, share, back-to-top |
| `public/js/oneirox-neural-bg.js` | Нейро-анимация фона hero (deferred) |
| `public/js/oneirox-share.js` | Share (deferred) |
| `public/js/back-to-top.js` | Кнопка наверх (deferred) |

### Inner pages
| Файл | Страница |
|------|----------|
| `about.css` | About |
| `methodology.css` | Methodology |
| `legal.css` | Privacy, Terms |
| `disclaimer.css` | Disclaimer (YMYL) |
| `phase.css` + `phase-calc.css` | Phase shell + калькулятор UI |
| `public/js/phase-calculator.js` | Логика луны (вынесена из inline) |
| `ecg.css` | Legacy — сердце под Decode **убрано**; не используется |

---

## Логотип (текущий)

- Текст: **One** (чёрный) + **irox** (градиент teal)
- Справа от текста: **контур сердца** `#2bcccf`, пульс **60 BPM** (lub-dub)
- Круг-прицел (glyph) **убран** — только текст + сердце
- Стили: `.site-logo__heart` в `site-nav.css`
- На всех страницах с `site-header`

---

## Decode — священный контракт (НЕ ЛОМАТЬ)

```html
<div class="onx-search-wrap">
  <form role="search" method="get" action="/">
    <textarea name="dream" rows="4" ...></textarea>
    <button type="submit">Decode</button>
  </form>
</div>
```

- Логика: **только** `public/js/oneirox-decode.js`
- Стили: **только** `public/css/decode.css` (+ `decode-deferred.css` для below-fold panel)
- API body: `{ "text": "..." }` → `{ "interpretation": "..." }`
- Парсинг ответа: `[SIGNAL]` `[BODY]` `[MORNING]`
- Mapper context: `localStorage` key `onx_mapper_data`, TTL 30 min

**Правило:** дизайн главной меняем в `main.css` / `insight.css` — **не трогать** decode.css и oneirox-decode.js без явной задачи на API.

---

## SEO / JSON-LD (главная)

Главная `index.html` — жёсткий акцент **WebApplication**, не статья:

- `@id` `https://oneirox.com/#decode-app` — **WebApplication + SoftwareApplication**
- `WebPage.mainEntity` → decode-app
- `WebSite.potentialAction` → SearchAction (Decode)
- `HowTo` — как пользоваться Decode
- `FAQPage` — 6 вопросов
- `hasPart`: Mapper + Phase Calculator

About / Methodology / Legal / Phase — ссылаются на `#decode-app` как `about` / `isPartOf`.

`site.webmanifest`: `start_url: /#decode`, `short_name: Decode`

---

## Палитра (НЕ МЕНЯТЬ без причины)

```
#3a4435  forest — текст
#566e58  moss — кнопки
#5c7a58  sage
#73a563  leaf
#00a5a8 / #2bcccf  teal / emerald — акценты, сердце
#cbd4c2  canvas — фон
#c4d8b4  card
#cfedaf  glow
```

Шрифты: **Playfair Display** + **Work Sans** (self-hosted в `public/fonts/`, `fonts.css`)  
Max width: **1200px** (`--onx-max-width`)

---

## Позиционирование Vigen (E-E-A-T)

- **Vigen G.R.** — Sleep Physiology & Somatic Signals Researcher
- Independent researcher & developer — **не клиницист, не терапевт**
- 5+ лет · 50+ книг · 14 frameworks в движке
- Quote: *"The image is never the point. The feeling that generated the image is the point."*
- Голос: mechanism over mysticism, somatic-first, 3am clarity

Контент-источники: `content/author.json`, `content/pages/about.json`, `content/pages/methodology.json`, `content/books.json`, `content/studies.json`

---

## Что сделано (сводка всех сессий)

### Главная
- Decode hero + neural canvas + neiro.webp (150×150) + synapse SVG overlay
- Why Decode — banner, brain guides, grid background
- Editorial блоки без карточек (insight.css): How, Why, Mechanisms, Science, Trust, FAQ
- Tools cards → Mapper + Phase
- Favicon SVG + PNG + webmanifest
- Back-to-top
- JSON-LD WebApplication (ядро = Decode)

### Inner pages (editorial, ~2000+ слов где нужно)
- About, Methodology, Privacy, Terms, Disclaimer (YMYL bomb), Phase

### Навигация
- Единый `site-header` на всех страницах
- Phase page: пункт **Phase** с `aria-current="page"`

### Изображения (нужны от Vigen если ещё нет в `public/images/`)
- `neiro.webp` — иконка Decode
- `banner-neurobiology.webp`, `why-decode-banner.webp`
- `vigen.jpg` — фото автора (About fallback → neiro.webp)

---

## Git / деплой — статус на 07.02.2026_Oneirox_pagespeed

- [x] GitHub `ONEIROX_BIG_site` + push на `main`
- [x] Cloudflare Pages, build output `public`
- [x] DNS oneirox.com → Cloudflare
- [x] `public/_redirects` (307 правил WP → новый сайт)
- [x] `public/sitemap.xml` + `public/robots.txt`
- [x] Тест Decode на production
- [x] Git tag **`07.02.2026_Oneirox`** (базовый прод)
- [x] Git tag **`07.02.2026_Oneirox_pagespeed`** (mobile perf)
- [x] Mobile PageSpeed: critical CSS split, self-hosted fonts, idle scripts

### TODO дальше

- [ ] Перепроверить PageSpeed mobile на production (цель 90+)
- [ ] Фото `vigen.jpg` для About (опционально)
- [ ] `/library/` для топ WP-статей из экспорта (опционально)
---

## Workspace в Cursor

Обычно открыты **две папки**:
1. `D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox` — сайт (актуальный)
2. `D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++` — API

Это нормально. В git — **раздельно**.

---

## Ссылки

| Что | URL |
|-----|-----|
| API prod | https://oneirox-api-production.up.railway.app/analyze |
| Cajochen DOI | https://doi.org/10.1016/j.cub.2013.07.029 |
| Спека главной | `docs/HOMEPAGE-SPEC.md` |
| Что нужно от Vigen | `NEED-FROM-VIGEN.md` |
| WP plugin (reference) | `C:\Users\Vigen\Downloads\oneirox-core.php_plugin_без букв\` |

---

## История чата

Транскрипты прошлых сессий Cursor хранятся локально в проекте Cursor (agent-transcripts). Если контекст обрезался — **CONTINUATION.md** восстанавливает всё важное.

---

*Обновляй этот файл после каждой значимой сессии. Это единая точка входа.*
