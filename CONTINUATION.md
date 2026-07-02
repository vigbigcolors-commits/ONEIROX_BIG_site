# CONTINUATION — Oneirox (читай первым в новом чате Cursor)

**Обновлено:** 3 июля 2026  
**Контрольная точка (git tag):** `03.07.2026_Oneirox_stable` → commit `a985df4`  
**API контрольная точка:** `STABLE_DECODE_07.02.2026` → commit `3acabd5`  
**Предыдущие точки:** `07.02.2026_Oneirox_stable` → `f6acb06` · `07.02.2026_Oneirox_pagespeed` → `365d1b5`  
**Сайт (статика):** `D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox`  
**GitHub:** https://github.com/vigbigcolors-commits/ONEIROX_BIG_site  
**Cloudflare Pages:** oneirox-big-site → **https://oneirox.com**  
**API (Python):** `D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++` → Railway  
**Цель:** **инструмент** (WebApplication / Decode), не блог

---

## Контрольная точка `03.07.2026_Oneirox_stable` (3 июля 2026)

**Зафиксировано — стабильный прод, Decode ~9/10, UI + анимация:**

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
| **Mobile PageSpeed** — critical CSS, self-hosted fonts | ✅ |
| **Hero нейроны** — canvas + SVG synapses на neiro.webp | ✅ |
| **Decode UI** — кнопка под textarea (без scrollbar overlap) | ✅ |
| **Decode result** — Playfair SIGNAL, Work Sans body | ✅ |
| **Back-to-top** — sync CSS + direct script | ✅ |
| **API Decode** — you/your, термины в скобках, sanitizer | ✅ |

**Коммиты сайта (`a985df4`):**
- `a985df4` — **нейроанимация hero**: `oneirox-neural-bg.js` direct defer (не idle-defer)
- `f6acb06` — кнопка Decode под полем на всех экранах
- `1eca3ac` — back-to-top: `site-nav.css` + direct `<script defer>`
- `af4c7b5` — типографика результата (`decode-deferred.css`)
- `365d1b5` — PageSpeed split CSS, self-hosted fonts

**Скрипты главной (НЕ ЛОМАТЬ порядок загрузки):**
```html
<script src="/js/oneirox-decode.js" defer></script>
<script src="/js/oneirox-neural-bg.js" defer></script>   <!-- hero canvas — DIRECT -->
<script src="/js/back-to-top.js" defer></script>           <!-- DIRECT -->
<script src="/js/perf-defer.js" defer></script>           <!-- только share.js idle -->
```

**Анимация — что где:**
| Слой | Файл | Загрузка |
|------|------|----------|
| Canvas нейросеть в hero | `oneirox-neural-bg.js` | **direct defer** на index.html |
| SVG synapses на иконке | `decode.css` (CSS keyframes) | critical CSS, сразу |
| Share после Decode | `oneirox-share.js` | через `perf-defer.js` idle |

⚠️ **Не возвращать neural-bg в perf-defer** — idle до 2.8s, пользователь не видит нейроны.

**API (`STABLE_DECODE_07.02.2026` → `3acabd5`):**
- Один вызов Claude (O3-style) — **без** multi-call rewrite
- `sanitize_decode_output()` — her brain / her amygdala / organ-diagnosis
- Partner/breakup CLIENT note в `build_user_message()`
- `_fix_morning_question()` — «Did she tell you»
- Промпт: WHO YOU SPEAK TO, PLAIN LANGUAGE BRIDGE

**Качество Decode (проверено на partner/breakup, ~9/10):**
- ✅ «Your grief is structural», «she made the interpretive leap»
- ✅ MORNING: marriage / timelines / pressure
- ⚠️ Мелочи модели (sanitizer TODO): «scan her dreams sleep», «her dreams and amygdala»

**Откат сайта:**
```powershell
cd "D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox"
git fetch origin
git checkout 03.07.2026_Oneirox_stable
```

**Откат API:**
```powershell
cd "D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++"
git checkout STABLE_DECODE_07.02.2026 -- main.py dream_validation.py ONEIROX_PROMPT.txt test_dream.py
git push origin HEAD:main
```
→ Railway → **Redeploy** (автодеплой выключен)

---

## Фраза для нового чата (копируй целиком)

```
Открыл workspace Oneirox. Прочитай CONTINUATION.md.
Сайт: tag 03.07.2026_Oneirox_stable (a985df4).
API: tag STABLE_DECODE_07.02.2026 (3acabd5).
Папка сайт: D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox
Decode не ломать (oneirox-decode.js + decode.css + контракт формы).
Нейроанимацию не defer-ить (neural-bg.js = direct script).
API: D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++ (Railway, Redeploy вручную).
```

Или прикрепи: `@CONTINUATION.md` `@public/index.html` `@public/js/oneirox-decode.js`

---

## Два проекта — два репозитория (ВАЖНО)

| Слой | Папка | GitHub | Деплой |
|------|-------|--------|--------|
| **Сайт** | `D:\aONEIROX +++++++++\ONEIROX  2 -------------------\Oneirox` | ONEIROX_BIG_site | Cloudflare Pages → `public/` |
| **API** | `D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++` | oneirox-api | Railway |

**Связь:** `oneirox-decode.js` → `POST https://oneirox-api-production.up.railway.app/analyze`

### API — файлы

| Файл | Роль |
|------|------|
| `main.py` | FastAPI, `/analyze`, rate limit, Claude, sanitizer |
| `dream_validation.py` | `build_user_message()`, `sanitize_decode_output()`, MORNING fix |
| `ONEIROX_PROMPT.txt` | Промпт Decode |
| `test_dream.py` | `py test_dream.py dream.txt` |

**Не коммитить:** `.env`, `dream.txt`, `API KEY/`, `ЗАПАС/`

**⚠️ НЕ возвращать multi-call Claude rewrite** — таймауты, «Something went wrong».

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
- Стили: `decode.css` + `decode-deferred.css` (async)
- Форма: textarea сверху, кнопка снизу на всю ширину
- API: `{ "text": "..." }` → `{ "interpretation": "..." }`
- Парсинг: `[SIGNAL]` `[BODY]` `[MORNING]`

---

## CSS / JS — главная

| Файл | Назначение |
|------|------------|
| `decode.css` | Critical: hero, форма, **synapse SVG**, neural-bg container |
| `decode-deferred.css` | Panel, results, neuro spotlight — async |
| `oneirox-neural-bg.js` | Canvas нейросеть hero — **direct defer** |
| `oneirox-decode.js` | Логика Decode |
| `back-to-top.js` | Кнопка наверх — direct defer |
| `perf-defer.js` | Только `oneirox-share.js` idle |

---

## Git tags (хронология)

| Tag | Repo | Commit | Смысл |
|-----|------|--------|-------|
| `03.07.2026_Oneirox_stable` | site | `a985df4` | **Текущая** — прод + нейроанимация |
| `07.02.2026_Oneirox_stable` | site | `f6acb06` | UI без fix neural-bg |
| `07.02.2026_Oneirox_pagespeed` | site | `365d1b5` | PageSpeed |
| `07.02.2026_Oneirox` | site | `311663c` | Базовый прод |
| `STABLE_DECODE_07.02.2026` | API | `3acabd5` | **Текущая** Decode |
| `STABLE_DECODE_O3` | API | rollback | Экстренный откат |

---

## TODO дальше (опционально)

- [ ] Sanitizer: «scan her dreams sleep» → «read her sleep from outside»
- [ ] Sanitizer: «her dreams and amygdala» → plain language
- [ ] Sanitizer: «the dream was she staging»
- [ ] Фото `vigen.jpg` для About
- [ ] README на GitHub API

---

## Ссылки

| Что | URL |
|-----|-----|
| Сайт | https://oneirox.com |
| API | https://oneirox-api-production.up.railway.app/analyze |
| API docs | CONTINUE.md в папке ONEIROX_API |

---

*Обновляй после каждой значимой сессии. Единая точка входа.*
