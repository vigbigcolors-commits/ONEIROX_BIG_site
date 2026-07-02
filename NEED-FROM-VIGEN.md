# Что нужно от Vigen — честный список

## Как я «изучаю» 50 книг и 14 исследований

**Я не читаю 50 книг за ночь.** И не притворяюсь, что я — ты.

Правильная модель для E-E-A-T:

| Источник | Кто автор контента | Роль AI |
|----------|-------------------|---------|
| **Твой список книг** | Vigen G.R. — ты их читал | Верстаю, группирую, оформляю |
| **14 исследований** | Ты выбираешь те, что реально легли в Oneirox | Пишу карточки по твоим заметкам + DOI |
| **Текст «обо мне»** | Только твои слова | Редактирую стиль, не выдумываю биографию |
| **Методология** | Уже в `ONEIROX_PROMPT.txt` | Перевожу на язык сайта |

**Золотое правило:** на сайте только то, что ты можешь защитить как исследователь. Я не добавляю фейковые цитаты.

---

## Приоритет 1 — дай сегодня/завтра (минимум для старта)

### A. Автор (E-E-A-T ядро)
Файл: `content/author.json` — заполни или пришли текстом:

- [ ] Полное имя: **Vigen G.R.**
- [ ] Одно предложение: кто ты *(независимый исследователь и разработчик, не нейробиолог)*
- [ ] Bio 3–5 предложений от первого лица — **твоими словами**
- [ ] Фото (jpg/png) → `public/images/vigen.jpg`
- [ ] Ссылки: LinkedIn, GitHub, email (опционально)
- [ ] Годы исследований: **5+**
- [ ] Число книг: **50+** (ок, если точнее 52 — пиши честно)

### B. 14 исследований
Файл: `content/studies.json`

Для каждого:
```json
{
  "authors": "Cajochen et al.",
  "year": 2013,
  "title": "…",
  "oneirox_use": "Одна фраза: как это используется в Decode",
  "doi_or_url": "https://…"
}
```

**Можно проще:** список в Telegram/Word — я перенесу в JSON.

Черновик из API уже есть (Walker, Revonsuo, Damasio…) — **подтверди или замени**.

### C. 50 книг
Файл: `content/books.json`

**Формат:** автор, название, тема (sleep / dreams / neuro / somatic / trauma / philosophy)

**Можно:** экспорт Kindle, скрин списка, txt — я структурирую.

Без твоего списка — на сайте будет заглушка «50+ books» без имён (слабый E-E-A-T).

### D. Старые URL WordPress
Файл: `content/redirects.csv`
```
/old-path/,/,301
/dream-about-snake/,/,301
```
Нужен для Cloudflare `_redirects` — меньше 404.

---

## Приоритет 2 — файлы из папки D:\aONEIROX

Уже вижу у тебя:
- `ONEIROX_API` — API, промпт, мозг Decode ✅
- `DECODE +++` — HTML блоки ✅
- `SENSORY MAPPER V2.6` — mapper HTML
- `CUSTOM HTML Bloks` — карточки
- Скриншоты дизайна (референс) ✅

Нужно положить в `Oneirox/tools/`:
- [ ] `sensory-dream-mapper-v2.6.html` (или актуальная версия)
- [ ] Phase Calculator HTML (если отдельный файл)

---

## Приоритет 3 — не срочно

- [ ] Логотип SVG
- [ ] Favicon
- [ ] 2–3 примера Decode (анонимные) для блока «Sample reading»
- [ ] FAQ — 8 вопросов твоими словами
- [ ] Privacy policy текст

---

## Что я делаю без твоих списков (сразу)

- [x] Папка проекта `Oneirox/`
- [x] Палитра `docs/DESIGN-TOKENS.css`
- [x] Копия `oneirox-decode.js`, `oneirox-share.js`
- [ ] Главная `index.html` по референсу + твоя палитра
- [ ] SEO: meta, JSON-LD WebApplication + Person
- [ ] Локальный сервер для теста

---

## Контент с live-сайта (импортирован)

| Файл | Источник |
|------|----------|
| `content/pages/about.json` | [oneirox.com/about](https://oneirox.com/about/) |
| `content/pages/methodology.json` | [oneirox.com/methodology](https://oneirox.com/methodology/) |
| `content/books.json` | Methodology — flagship books + what changed |
| `content/author.json` | About + твой bio (усилен) |

**На новой главной:** не копировать 287 articles как акцент — pivot на инструмент. Stats: 5+ / 50+ / 14 researchers.

**Редиректы:** `/about/` и `/methodology/` → новые статические страницы или якоря на главной.

---

*Обновляй галочки по мере готовности.*
