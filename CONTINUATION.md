# CONTINUATION — Oneirox (читай первым в новом чате Cursor)

**Обновлено:** 1 июля 2026  
**Проект:** `C:\Users\Vigen\Downloads\Oneirox`  
**Сайт:** https://oneirox.com  
**Цель:** инструмент (не статьи) → GitHub + Cloudflare Pages

---

## Как продолжить в Cursor

### Разговор пропадёт?
**Нет.** История чата остаётся в том же диалоге Cursor.

### Что изменится при открытии папки `Oneirox`?
- Cursor увидит **новую рабочую папку** (файлы проекта)
- Старый чат **может остаться** — открой его снова или начни новый
- В **новом чате** напиши:

```
Прочитай CONTINUATION.md в корне проекта Oneirox и продолжай работу над главной.
Decode не ломать. Палитра в public/css/tokens.css
```

Или прикрепи: `@CONTINUATION.md` `@public/index.html`

---

## Где что лежит

| Путь | Назначение |
|------|------------|
| `public/index.html` | **Главная страница** (начата) |
| `public/css/tokens.css` | Палитра (зафиксирована) |
| `public/css/insight.css` | How / Why / Mechanisms / Science / Trust / FAQ — editorial блоки |
| `public/css/main.css` | Layout, footer, back-to-top |
| `public/css/decode.css` | **Только Decode** — не смешивать с main |
| `public/js/oneirox-decode.js` | ⚠️ Мозг Decode — не ломать |
| `public/js/oneirox-share.js` | Share, canvas, email |
| `content/author.json` | Bio Vigen (готово) |
| `content/pages/about.json` | Тексты с oneirox.com/about |
| `content/pages/methodology.json` | Тексты с oneirox.com/methodology |
| `content/books.json` | 12 flagship books + шаблон 50+ |
| `content/studies.json` | 14 исследований (черновик) |
| `NEED-FROM-VIGEN.md` | Что ещё нужно от Vigen |
| `docs/HOMEPAGE-SPEC.md` | Спека главной |
| `docs/DESIGN-TOKENS.css` | Копия палитры для справки |

### Старый WordPress плагин (не удалять, reference)
`C:\Users\Vigen\Downloads\oneirox-core.php_plugin_без букв\`

### API (мозг на Railway)
`D:\aONEIROX +++++++++\ONEIROX_API +++++++++++++\`  
`POST https://oneirox-api-production.up.railway.app/analyze`  
Промпт: `ONEIROX_PROMPT.txt`

---

## Палитра (НЕ МЕНЯТЬ без причины)

```
#3a4435  forest — текст
#566e58  moss — кнопки, CTA
#5c7a58  sage — highlight
#73a563  leaf — акцент
#9aaa90  mist — вторичный текст
#cbd4c2  canvas — фон страницы
#b9c6ad  panel
#c4d8b4  card
#cfedaf  glow
```

Шрифты: **Playfair Display** + **Work Sans**  
Max width: **1200px**

---

## Decode — священный контракт

```html
<div class="onx-search-wrap">
  <form>
    <input type="search" ... />
    <button type="submit">Decode</button>
  </form>
</div>
```

- Логика: `public/js/oneirox-decode.js`
- Стили: **только** `public/css/decode.css`
- Менять дизайн главной в `main.css` — **Decode не трогать**

---

## Позиционирование Vigen (E-E-A-T)

- **Vigen** — Sleep Physiology & Somatic Signals Researcher
- Independent researcher & developer — **не клинический нейробиолог**
- 5+ лет · 50+ книг · 14 researchers в движке
- Quote: *"The image is never the point. The feeling that generated the image is the point."*
- На главной **не акцентировать** «287 articles» — pivot на инструмент

Live reference:
- https://oneirox.com/about/
- https://oneirox.com/methodology/

---

## Что уже сделано (главная — сессия 1 июля 2026)

1. ✅ Decode hero — нейро-анимация, neiro.webp иконка, клетка на фоне
2. ✅ Why Decode exists — баннер мозга, brain guides, клетка без кривых линий
3. ✅ Логотип + favicon (SVG + PNG + manifest)
4. ✅ Убраны ♥, ECG-блок, mapper link под spotlight
5. ✅ SEO-блоки без карточек: How, Why, Mechanisms, Science, Trust, FAQ (`insight.css`)
6. ✅ FAQ schema.org — 6 вопросов в JSON-LD
7. ✅ Back to top кнопка (`back-to-top.js`)
8. ✅ Tools cards на главной (Mapper + Phase)

### Ранее
1. ✅ Разделили Decode от A–Z
2. ✅ Миграция папка Oneirox для Cloudflare
3. ✅ About + Methodology JSON, author bio
4. ✅ Палитра зафиксирована

**Главная на сегодня — готова к деплою.** Следующий этап: GitHub + Cloudflare.

---

## Локальный запуск

```powershell
cd C:\Users\Vigen\Downloads\Oneirox
npm run dev
```
→ http://localhost:3000

---

## План миграции (порядок)

```
1. Локалка — главная + tools работают
2. GitHub repo
3. Cloudflare Pages (preview *.pages.dev)
4. Тест Decode на preview
5. Домен oneirox.com → Cloudflare DNS
6. _redirects — старые WP URL → главная / tools (минимум 404)
7. Search Console — новый sitemap
```

---

## TODO — следующие шаги

- [ ] Vigen: фото → `public/images/vigen.jpg`
- [ ] Vigen: `why-decode-banner.webp` в `public/images/` (если ещё не залит)
- [ ] `public/_redirects` для Cloudflare
- [ ] `sitemap.xml`, `robots.txt`
- [ ] GitHub push + Cloudflare Pages
- [ ] Тест Decode на preview URL
- [ ] Домен oneirox.com → Cloudflare DNS
- [ ] Остальные ~38 книг в books.json (опционально)

---

## Что дать Vigen в новом чате

1. Фото  
2. Mapper + Phase HTML файлы  
3. Список старых URL WordPress (для редиректов)  
4. Правки текстов если что-то не так на главной  

---

## Фраза для нового чата (копируй)

> Открыл папку `C:\Users\Vigen\Downloads\Oneirox`. Прочитай `CONTINUATION.md`. Главная готова — деплой на GitHub + Cloudflare. Decode не ломать.

---

*Этот файл — единая точка входа. Обновляй после каждой сессии.*
