# Oneirox Homepage — спецификация (E-E-A-T + SEO + UI)

**Статус:** ждём папку с API, Decode, assets от Vigen  
**Цель:** главная = **инструмент** + **доверие** + **шедевр дизайна**

---

## 1. Принцип страницы

| Было (статьи) | Будет (инструмент) |
|---------------|-------------------|
| 1000 URL «dream about X» | 1 сильная главная + 3–5 tool pages |
| Трафик из long-tail | Трафик из бренда + «scientific dream decoder» |
| Thin content | Experience + Expertise в каждом блоке |

**Правило:** пользователь за 5 секунд понимает *куда писать сон*; Google за 5 секунд понимает *кто автор и что за продукт*.

---

## 2. Структура `index.html` (сверху вниз)

```
┌─────────────────────────────────────────────────────────┐
│  HEADER — logo, nav: Decode | Mapper | Phase | Science  │
├─────────────────────────────────────────────────────────┤
│  ① HERO + DECODE (священный контракт формы)            │
│     H1, eyebrow, панель ввода, ECG                      │
├─────────────────────────────────────────────────────────┤
│  ② WHAT IS ONEIROX DECODE                               │
│     3 колонки: Somatic · Neural echo · Not symbols      │
├─────────────────────────────────────────────────────────┤
│  ③ HOW IT WORKS (3 шага + мини-иллюстрации)             │
│     Describe → API reads signal → SIGNAL/BODY/MORNING   │
├─────────────────────────────────────────────────────────┤
│  ④ TOOLS — Mapper + Phase Calculator (карточки)         │
├─────────────────────────────────────────────────────────┤
│  ⑤ SCIENCE — 14 исследований (карточки с citation)      │
│     Cajochen, Hobson, Walker, … — ссылка на PubMed/DOI  │
├─────────────────────────────────────────────────────────┤
│  ⑥ KNOWLEDGE — 50 книг (сгруппировано по темам)         │
│     Sleep · Neuro · Dreams · Somatic — не просто список   │
├─────────────────────────────────────────────────────────┤
│  ⑦ AUTHOR — Vigen G.R. (E-E-A-T ядро)                   │
│     фото, bio, independent researcher & developer       │
│     «почему я построил Oneirox» — 1 абзац от первого    │
├─────────────────────────────────────────────────────────┤
│  ⑧ METHODOLOGY & LIMITATIONS (честность = Trust)        │
│     что инструмент делает / не делает                   │
├─────────────────────────────────────────────────────────┤
│  ⑨ FAQ (8–12 вопросов) → FAQPage schema                 │
├─────────────────────────────────────────────────────────┤
│  FOOTER — ©, privacy, contact, sameAs (social)          │
└─────────────────────────────────────────────────────────┘
```

**Decode result + Share** — появляются динамически после submit (как сейчас в JS).

---

## 3. E-E-A-T 10/10 — что Google должен увидеть

### Experience
- Реальный инструмент с интерактивом (Decode form)
- Screenshot/описание Mapper pipeline
- Примеры формата ответа (анонимизированный sample reading)

### Expertise
- Блок **14 исследований** — название, автор, год, 1 строка «что взяли в Oneirox»
- Блок **50 книг** — автор, название, тема (sleep / REM / amygdala / somatic)
- Методология: grounded in sleep neurobiology, not Jung/Freud dictionaries

### Authoritativeness
- `Person` schema: Vigen G.R.
- `sameAs`: LinkedIn, ORCID (если есть), GitHub
- Ссылки на первоисточники (PubMed, journals)

### Trustworthiness
- «Independent researcher & developer» — явно в Author block
- Limitations: not medical advice, not diagnosis
- Контакт / about
- HTTPS, чистый код, быстрая загрузка (Cloudflare)

---

## 4. SEO технически

### Meta (главная)
```html
<title>Oneirox — Scientific Dream Decoder | Sleep Neurobiology</title>
<meta name="description" content="Decode dreams through sleep neuroscience, not symbol dictionaries. Built by independent researcher Vigen G.R. from 14 studies and 50 foundational texts.">
<link rel="canonical" href="https://oneirox.com/">
```

### JSON-LD (в `<head>`)
1. `WebApplication` — name, url, applicationCategory, offers (free)
2. `Person` — Vigen G.R., jobTitle, description, sameAs
3. `Organization` или `WebSite` — oneirox.com
4. `FAQPage` — из блока FAQ

### Семантика
- Один `<h1>` — в hero (про decode / body decoded the dream)
- `<section aria-labelledby="...">` для каждого блока
- `alt` на всех декоративных SVG

### Performance
- CSS один файл, JS defer
- Шрифты: preconnect Google Fonts
- Декор: CSS/SVG, не тяжёлые PNG

---

## 5. UI/UX — дизайн «нейробиология»

### Палитра
| Token | Hex | Использование |
|-------|-----|---------------|
| Neural sage | `#6b8f52` | CTA, акценты |
| Synapse gold | `#c4a86a` | highlights, citations |
| Cortex ink | `#141210` | текст |
| REM blue | `#1a2848` | Phase card, ночные блоки |
| Glia cream | `#f7f4ee` | фон секций |
| Axon glow | `rgba(107,143,82,0.15)` | фоны, карточки |

### Декор (лёгкий, не мешает чтению)
- Фоновая сетка «neural mesh» (SVG pattern, opacity 3–5%)
- Тонкие EEG-линии между секциями (как ECG в hero)
- Иконки: synapse nodes, brain cross-section line art
- **Без** stock photos мозга — только line art / gradient

### Типографика
- Заголовки: **Playfair Display**
- UI + body: **Work Sans**
- Citations: **Georgia** или serif italic

### UX
- Decode panel — самый контрастный элемент на странице
- Sticky header с кнопкой «Decode» на mobile
- Плавный scroll к `#decode` из nav
- Карточки исследований — hover с DOI link

---

## 6. Файлы — что ждём от Vigen в одной папке

```
oneirox-migration/
├── api/                    # если есть backend код (Railway)
├── decode/
│   ├── oneirox-decode.js   # мозг Decode
│   └── oneirox-share.js
├── tools/
│   ├── dream-mapper.html
│   └── phase-calculator.html
├── assets/
│   ├── images/             # фото Vigen, иконки
│   └── fonts/              # опционально
├── content/
│   ├── studies.json        # 14 исследований (или .md)
│   ├── books.json          # 50 книг
│   └── author.json         # bio Vigen G.R.
├── legacy/                 # старые WP URL для редиректов
│   └── urls.csv
└── (любые существующие CSS/HTML)
```

**Минимум для старта:** `oneirox-decode.js`, `oneirox-share.js`, тексты 14+50+author.

---

## 7. Структура репозитория (локалка → Cloudflare)

```
oneirox-site/
├── public/
│   ├── index.html          # главная (всё в одном или includes)
│   ├── css/
│   │   ├── main.css        # layout, sections, decor
│   │   └── decode.css      # только decode panel (изолировано)
│   ├── js/
│   │   ├── oneirox-decode.js
│   │   └── oneirox-share.js
│   ├── mapper/
│   │   └── index.html
│   ├── phase/
│   │   └── index.html
│   ├── images/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── _redirects            # Cloudflare Pages redirects
├── content/                  # JSON для studies, books, author
├── package.json              # optional: live-server для локалки
└── README.md
```

### Decode изоляция (не ломать!)
- `decode.css` + `oneirox-decode.js` — не трогать при правке `main.css`
- HTML контракт формы — в `index.html` секция `#decode`

---

## 8. Порядок работ утром

1. Vigen кладёт все файлы в папку → открываем в Cursor
2. Создаём `oneirox-site/public/index.html` по этой спецификации
3. Переносим Decode JS без изменений логики
4. Наполняем блоки 14 studies + 50 books из `content/`
5. Author block Vigen G.R.
6. Локальный тест (`npx serve public` или live-server)
7. GitHub push → Cloudflare Pages preview
8. Домен + `_redirects`

---

## 9. Чеклист «готово»

- [ ] Decode submit → API → result → share bar
- [ ] Lighthouse Performance > 90
- [ ] JSON-LD валидатор (Google Rich Results)
- [ ] Mobile: форма + кнопка Decode удобны
- [ ] 14 studies с реальными citations
- [ ] 50 books отображаются читабельно
- [ ] Author Vigen G.R. с Person schema
- [ ] FAQ 8+ вопросов
- [ ] `_redirects` для старых URL

---

*Связано с CONTINUATION.md секции 11–12. Обновлять по ходу сборки.*
