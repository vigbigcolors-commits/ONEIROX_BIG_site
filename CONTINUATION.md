# CONTINUATION — Oneirox (читай первым в новом чате Cursor)

**Обновлено:** 1 июля 2026 (полный снимок проекта)  
**Сайт (статика):** `C:\Users\Vigen\Downloads\Oneirox`  
**API (Python):** `D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++`  
**Домен:** https://oneirox.com  
**Цель:** **инструмент** (WebApplication / Decode), не блог → GitHub + Cloudflare Pages

---

## Фраза для нового чата (копируй целиком)

```
Открыл workspace Oneirox. Прочитай CONTINUATION.md в C:\Users\Vigen\Downloads\Oneirox.
Decode не ломать (oneirox-decode.js + decode.css + контракт формы).
API живёт отдельно в D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++ — не переносить в сайт.
Продолжай с TODO из CONTINUATION.md.
```

Или прикрепи: `@CONTINUATION.md` `@public/index.html` `@public/js/oneirox-decode.js`

---

## Два проекта — два репозитория (ВАЖНО)

| Слой | Папка на диске | GitHub | Деплой |
|------|----------------|--------|--------|
| **Сайт** (HTML/CSS/JS) | `C:\Users\Vigen\Downloads\Oneirox` | **ещё нет** — создать `oneirox` или `oneirox-site` | **Cloudflare Pages** → папка `public/` |
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
cd C:\Users\Vigen\Downloads\Oneirox
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
| `public/css/tokens.css` | Палитра — **не менять без причины** |
| `public/css/site-nav.css` | Header, logo, nav, кнопки, **сердце в логотипе** |
| `public/css/page.css` | Inner pages shell (импорт tokens + site-nav) |
| `public/css/main.css` | Footer, back-to-top, часть кнопок |

### Главная
| Файл | Назначение |
|------|------------|
| `public/css/decode.css` | ⚠️ **Только Decode** — neiro.webp, synapses, панель |
| `public/css/main.css` | Hero layout, tools, footer |
| `public/css/flow.css` | Flow cards |
| `public/css/why-decode.css` | Why Decode block + grid |
| `public/css/tools.css` | Tools cards |
| `public/css/insight.css` | How, Why, Mechanisms, Science, Trust, FAQ |
| `public/js/oneirox-decode.js` | ⚠️ **Мозг Decode** — не ломать |
| `public/js/oneirox-neural-bg.js` | Нейро-анимация фона hero |
| `public/js/oneirox-share.js` | Share |
| `public/js/back-to-top.js` | Кнопка наверх |

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
    <input type="search" name="dream" ... />
    <button type="submit">Decode</button>
  </form>
</div>
```

- Логика: **только** `public/js/oneirox-decode.js`
- Стили: **только** `public/css/decode.css`
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

Шрифты: **Playfair Display** + **Work Sans**  
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

## Git / деплой — следующие шаги

### Сайт (первый push)
```powershell
cd C:\Users\Vigen\Downloads\Oneirox
git init
git add public/ content/ docs/ CONTINUATION.md README.md NEED-FROM-VIGEN.md package.json .gitignore scripts/
git commit -m "Oneirox static site — homepage, tools, legal, editorial pages"
git remote add origin https://github.com/vigbigcolors-commits/oneirox.git
git push -u origin main
```

### Cloudflare Pages
- Repo: **сайт** (не API)
- Build output directory: **`public`**
- Build command: *(пусто)*
- Custom domain: oneirox.com

### API (уже на GitHub)
```powershell
cd "D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++"
git push origin main   # только при изменениях main.py / промпта
```

### TODO перед продакшеном
- [ ] `public/_redirects` — старые WP URL → новые пути
- [ ] `public/sitemap.xml` + `public/robots.txt`
- [ ] GitHub repo для сайта + Cloudflare Pages
- [ ] Тест Decode на preview URL
- [ ] DNS oneirox.com → Cloudflare
- [ ] Vigen: `vigen.jpg`, список редиректов со старого WP
- [ ] Mapper page — усилить дизайн как Phase (опционально)
- [ ] Остальные книги в `content/books.json` (опционально)

---

## Workspace в Cursor

Обычно открыты **две папки**:
1. `C:\Users\Vigen\Downloads\Oneirox` — сайт
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
