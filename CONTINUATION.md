# CONTINUATION — Oneirox (читай первым в новом чате Cursor)

**Обновлено:** 2 июля 2026  
**Контрольная точка (git tag):** `07.02.2026_Oneirox_stable` → commit `f6acb06`  
**API контрольная точка:** `STABLE_DECODE_07.02.2026` → commit `3acabd5`  
**Предыдущие точки:** `07.02.2026_Oneirox_pagespeed` → `365d1b5` · `07.02.2026_Oneirox` → `311663c`  
**Сайт (статика):** `D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox`  
**GitHub:** https://github.com/vigbigcolors-commits/ONEIROX_BIG_site  
**Cloudflare Pages:** oneirox-big-site → **https://oneirox.com**  
**API (Python):** `D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++` → Railway  
**Цель:** **инструмент** (WebApplication / Decode), не блог

---

## Контрольная точка `07.02.2026_Oneirox_stable` (2 июля 2026)

**Зафиксировано — стабильный прод, Decode ~9/10, UI отполирован:**

| Что | Статус |
|-----|--------|
| Домен oneirox.com на Cloudflare Pages | ✅ |
| GitHub `ONEIROX_BIG_site` синхронизирован | ✅ |
| Главная + Decode + API Railway | ✅ |
| About, Methodology, Disclaimer, Privacy, Terms, Phase, Tools | ✅ |
| 310→307 редиректов WP (`public/_redirects`) | ✅ |
| `sitemap.xml` + `robots.txt` | ✅ |
| Schema WebApplication + мобильный Decode (textarea) | ✅ |
| Логотип — пульсирующее сердце 60 BPM | ✅ |
| **Mobile PageSpeed** — critical CSS, self-hosted fonts, idle scripts | ✅ |
| **Decode UI** — кнопка под textarea (без наложения на scrollbar) | ✅ |
| **Decode result** — Playfair SIGNAL, Work Sans body | ✅ |
| **Back-to-top** — sync CSS + direct script на главной | ✅ |
| **API Decode** — голос «you/your», термины в скобках, sanitizer | ✅ |

**Коммиты этой точки (сайт, `f6acb06`):**
- `f6acb06` — кнопка Decode под полем на всех экранах
- `1eca3ac` — back-to-top: стили в `site-nav.css`, прямой `<script defer>`
- `af4c7b5` — типографика результата Decode (`decode-deferred.css`)
- `365d1b5` и ранее — PageSpeed split CSS, self-hosted fonts (`07.02.2026_Oneirox_pagespeed`)

**API (`STABLE_DECODE_07.02.2026` → `3acabd5`):**
- Один вызов Claude (O3-style) — **без** multi-call rewrite (ломало прод)
- `sanitize_decode_output()` — убирает `her amygdala`, `her brain`, organ-diagnosis
- Partner/breakup note в `build_user_message()` — сон партнёра, расставание
- `_fix_morning_question()` — «Did she tell you», не «Had you told you»
- Промпт: `WHO YOU SPEAK TO`, `PLAIN LANGUAGE BRIDGE`, ban her/his brain

**Откат сайта:**
```powershell
cd "D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox"
git fetch origin
git checkout 07.02.2026_Oneirox_stable
```

**Откат API:**
```powershell
cd "D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++"
git fetch origin
git checkout STABLE_DECODE_07.02.2026 -- main.py dream_validation.py ONEIROX_PROMPT.txt test_dream.py
git push origin HEAD:main
```
→ Railway Dashboard → **Redeploy** (автодеплой выключен)

**Быстрый откат API без git:** Railway → Deployments → redeploy предыдущий зелёный.

**Старая точка отката API (до sanitizer):** tag `STABLE_DECODE_O3`

---

## Контрольная точка `07.02.2026_Oneirox_pagespeed` (2 июля 2026)

**Зафиксировано — рабочий прод + mobile PageSpeed:**

| Что | Статус |
|-----|--------|
| Mobile PageSpeed — critical CSS ~19 KB, self-hosted fonts, idle scripts | ✅ |
| Анимация мозга + synapses на мобиле | ✅ |

**Оптимизации главной (commit `365d1b5`):**
- `decode.css` — только hero + форма (critical path)
- `decode-deferred.css` — panel body, results, neuro spotlight (async)
- `main.css` — below-fold sections (async)
- `fonts.css` + `public/fonts/*.woff2` — без Google Fonts RTT
- `perf-defer.js` — neural-bg, share после `load` + idle
- JSON-LD перенесён в конец `<body>`
- `fetchpriority="high"` на `neiro.webp`

**Вернуться:**
```powershell
git checkout 07.02.2026_Oneirox_pagespeed
```

---

## Контрольная точка `07.02.2026_Oneirox` (2 июля 2026) — базовый прод

Базовый рабочий прод до PageSpeed-оптимизаций. `git checkout 07.02.2026_Oneirox`

**Не путать с устаревшей копией:** `C:\Users\Vigen\Downloads\Oneirox` — без git, не деплоится.

---

## Фраза для нового чата (копируй целиком)

```
Открыл workspace Oneirox. Прочитай CONTINUATION.md.
Контрольная точка сайт: git tag 07.02.2026_Oneirox_stable (commit f6acb06).
Контрольная точка API: git tag STABLE_DECODE_07.02.2026 (commit 3acabd5).
Папка сайт: D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox
Decode не ломать (oneirox-decode.js + decode.css + контракт формы).
API: D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++ (Railway, Redeploy вручную).
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

### API — что где

| Файл | Роль |
|------|------|
| `main.py` | FastAPI, `/analyze`, rate limit, Claude, `sanitize_decode_output()` |
| `dream_validation.py` | Валидация, `build_user_message()`, sanitizer, MORNING fix |
| `ONEIROX_PROMPT.txt` | Промпт Decode (встроен через `build_user_message`) |
| `dream.txt` | **Только тест** — `py test_dream.py dream.txt` (в .gitignore) |
| `test_dream.py` | Локальный тест без сайта |

**Не коммитить в API:** `.env`, `dream.txt`, `API KEY/`, `ЗАПАС/`

**⚠️ НЕ возвращать multi-call Claude rewrite** — вызывало таймауты и «Something went wrong».

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
uvicorn main:app --reload --port 8000
```

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
- Форма: textarea сверху, кнопка **снизу на всю ширину** (все экраны)
- API body: `{ "text": "..." }` → `{ "interpretation": "..." }`
- Парсинг ответа: `[SIGNAL]` `[BODY]` `[MORNING]`
- Mapper context: `localStorage` key `onx_mapper_data`, TTL 30 min

---

## CSS / JS — карта файлов (главная)

| Файл | Назначение |
|------|------------|
| `public/css/decode.css` | ⚠️ Critical Decode — hero, форма, synapses |
| `public/css/decode-deferred.css` | Panel body, results typography — async |
| `public/css/site-nav.css` | Header, logo, **back-to-top** |
| `public/js/oneirox-decode.js` | ⚠️ Мозг Decode — не ломать |
| `public/js/back-to-top.js` | Кнопка наверх — **direct defer** на index.html |
| `public/js/perf-defer.js` | Idle-load: neural-bg, share |

---

## Git tags (хронология)

| Tag | Repo | Commit | Смысл |
|-----|------|--------|-------|
| `07.02.2026_Oneirox_stable` | site | `f6acb06` | **Текущая** — полный стабильный прод |
| `07.02.2026_Oneirox_pagespeed` | site | `365d1b5` | PageSpeed оптимизации |
| `07.02.2026_Oneirox` | site | `311663c` | Базовый прод |
| `STABLE_DECODE_07.02.2026` | API | `3acabd5` | **Текущая** — Decode sanitizer + prompt |
| `STABLE_DECODE_O3` | API | rollback | Экстренный откат до O3 |

---

## TODO дальше (опционально)

- [ ] Sanitizer: мелкая грамматика модели («the dream was she staging»)
- [ ] Фото `vigen.jpg` для About
- [ ] `/library/` для топ WP-статей
- [ ] README на GitHub API

---

## Ссылки

| Что | URL |
|-----|-----|
| Сайт | https://oneirox.com |
| API prod | https://oneirox-api-production.up.railway.app/analyze |
| API version | https://oneirox-api-production.up.railway.app/version |
| Спека главной | `docs/HOMEPAGE-SPEC.md` |

---

*Обновляй этот файл после каждой значимой сессии. Это единая точка входа.*
