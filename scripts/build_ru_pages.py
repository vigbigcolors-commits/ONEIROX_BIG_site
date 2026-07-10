# -*- coding: utf-8 -*-
"""Transform copied EN pages under public/ru/ into Russian locale pages."""
from __future__ import annotations

import re
from pathlib import Path

try:
    from ru_extra import EXTRA
except ImportError:
    EXTRA = []

ROOT = Path(__file__).resolve().parents[1] / "public"

# Longest-first. Prefer tagged UI strings — never bare "About" (breaks knowsAbout).
TRANSLATIONS: list[tuple[str, str]] = [
    (
        "Oneirox — Scientific AI Dream Decoder | Sleep Neurobiology",
        "Oneirox — научный ИИ-декодер снов | нейробиология сна",
    ),
    (
        "Decode dreams through sleep neuroscience, not symbol dictionaries. Free AI dream decoder by Vigen G.R. — 5+ years research, 50+ books, 14 peer-reviewed frameworks.",
        "Расшифруйте сны через нейробиологию сна, а не словари символов. Бесплатный ИИ-декодер снов от Vigen G.R. — 5+ лет исследований, 50+ книг, 14 научных рамок.",
    ),
    (
        "Free web app: decode dreams through REM neuroscience, not symbol dictionaries. SIGNAL · BODY · MORNING — one mechanism-based reading per dream.",
        "Бесплатное веб-приложение: расшифровка снов через нейробиологию REM, а не словари символов. SIGNAL · BODY · MORNING (СИГНАЛ · ТЕЛО · УТРО) — одно механизмное чтение на сон.",
    ),
    (
        "Scientific AI dream decoder — free, no login. Decode is the core tool.",
        "Научный ИИ-декодер снов — бесплатно, без регистрации. Decode — главный инструмент.",
    ),
    (
        "Oneirox — Scientific AI Dream Decoder",
        "Oneirox — научный ИИ-декодер снов",
    ),
    (
        "About Vigen G.R. — Sleep Physiology Researcher &amp; Oneirox Founder",
        "О Vigen G.R. — исследователь физиологии сна и основатель Oneirox",
    ),
    (
        "Vigen G.R. is an independent sleep physiology and somatic signals researcher who built Oneirox — a scientific AI dream decoder grounded in REM neuroscience, not symbol dictionaries. Five years of research. Fifty books. Fourteen frameworks.",
        "Vigen G.R. — независимый исследователь физиологии сна и соматических сигналов, создатель Oneirox: научного ИИ-декодера снов на основе нейробиологии REM, а не словарей символов. Пять лет исследований. Пятьдесят книг. Четырнадцать рамок.",
    ),
    (
        "Independent researcher who built Oneirox — scientific AI dream decoder grounded in REM neuroscience, amygdalar threat processing, and somatic body signals.",
        "Независимый исследователь, создавший Oneirox — научный ИИ-декодер снов на основе нейробиологии REM, обработки угрозы миндалевидным телом и соматических сигналов тела.",
    ),
    (
        "Sleep physiology researcher. Five years. Fifty books. One mechanism-based dream decoder.",
        "Исследователь физиологии сна. Пять лет. Пятьдесят книг. Один механизмный декодер снов.",
    ),
    (
        "Oneirox Methodology — How I Read Dreams | Vigen G.R.",
        "Методология Oneirox — как я читаю сны | Vigen G.R.",
    ),
    (
        "The Oneirox methodology: five principles for reading dreams as neurobiological events — not symbol tables. Written by Vigen G.R. after 50+ books and five years of research. Still evolving.",
        "Методология Oneirox: пять принципов чтения снов как нейробиологических событий — не таблиц символов. Написано Vigen G.R. после 50+ книг и пяти лет исследований. Всё ещё развивается.",
    ),
    (
        "Not a clinician. Not a dictionary. A human-written methodology grounded in REM neuroscience, somatic markers, and five years of reading.",
        "Не клиницист. Не словарь. Авторская методология на основе нейробиологии REM, соматических маркеров и пяти лет чтения.",
    ),
    (
        "Five principles. One reading sequence. Fifty books. Written by a researcher, not an algorithm.",
        "Пять принципов. Одна последовательность чтения. Пятьдесят книг. Написано исследователем, а не алгоритмом.",
    ),
    (
        "Oneirox Methodology — How I Read Dreams",
        "Методология Oneirox — как я читаю сны",
    ),
    (
        "Dream Phase Calculator — Lunar Chronobiology | Oneirox",
        "Калькулятор фазы сна — лунная хронобиология | Oneirox",
    ),
    (
        "Enter your dream date. Read lunar phase effects on REM and deep sleep — Cajochen et al. 2013. Chronobiology for dream decoding, not astrology.",
        "Укажите дату сна. Узнайте влияние лунной фазы на REM и глубокий сон — Cajochen et al. 2013. Хронобиология для расшифровки снов, не астрология.",
    ),
    (
        "What was the moon doing the night you dreamed? 30% less deep sleep, 25% more REM near full moon — peer-reviewed chronobiology.",
        "Что делала Луна в ночь вашего сна? На 30% меньше глубокого сна, на 25% больше REM около полнолуния — рецензируемая хронобиология.",
    ),
    (
        "Dream Phase Calculator — Oneirox",
        "Калькулятор фазы сна — Oneirox",
    ),
    (
        "Privacy Policy — Oneirox Dream Decoder",
        "Политика конфиденциальности — Oneirox Dream Decoder",
    ),
    (
        "Oneirox privacy policy: no accounts, no dream data sales. What we collect when you use Decode, Mapper, and Phase Calculator — and what stays on your device.",
        "Политика конфиденциальности Oneirox: без аккаунтов, без продажи данных снов. Что мы собираем при использовании Decode, Mapper и калькулятора фазы — и что остаётся на вашем устройстве.",
    ),
    (
        "Transparent privacy for a free dream decoder. No login. No selling your dreams.",
        "Прозрачная конфиденциальность для бесплатного декодера снов. Без входа. Без продажи ваших снов.",
    ),
    (
        "Privacy Policy — Oneirox",
        "Политика конфиденциальности — Oneirox",
    ),
    (
        "Terms of use for Oneirox: free web application for scientific dream interpretation. Acceptable use, intellectual property, limitations, and health-related boundaries.",
        "Условия использования Oneirox: бесплатное веб-приложение для научной интерпретации снов. Допустимое использование, интеллектуальная собственность, ограничения и границы, связанные со здоровьем.",
    ),
    (
        "Terms of Use — Oneirox Dream Decoder",
        "Условия использования — Oneirox Dream Decoder",
    ),
    ("Terms of Use — Oneirox", "Условия использования — Oneirox"),
    (
        "Oneirox is not medical advice, diagnosis, or therapy. Authoritative health disclaimer for the Dream Decoder — research instrument only. Crisis resources included.",
        "Oneirox — не медицинский совет, не диагноз и не терапия. Авторитетный дисклеймер о здоровье для Dream Decoder — только исследовательский инструмент. Включены ресурсы помощи в кризисе.",
    ),
    (
        "Medical &amp; Health Disclaimer — Oneirox | YMYL",
        "Медицинский дисклеймер — Oneirox | YMYL",
    ),
    (
        "Not a clinician. Not a dictionary. Research-informed interpretation instrument — with clear YMYL boundaries.",
        "Не клиницист. Не словарь. Инструмент интерпретации на основе исследований — с ясными границами YMYL.",
    ),
    (
        "Health Disclaimer — Oneirox Dream Decoder",
        "Дисклеймер о здоровье — Oneirox Dream Decoder",
    ),
    (
        "Neuro-somatic decoding · Dream interpretation",
        "Нейро-соматическая расшифровка · интерпретация снов",
    ),
    (
        "Your body decoded the dream <span class=\"onx-highlight\">before you woke up.</span>",
        "Ваше тело расшифровало сон <span class=\"onx-highlight\">раньше, чем вы проснулись.</span>",
    ),
    ("Type your dream here", "Опишите сон здесь"),
    (
        "Snakes, falling, water, teeth, being chased — or <em>how your body felt</em>",
        "Змеи, падение, вода, зубы, погоня — или <em>что чувствовало тело</em>",
    ),
    (
        "Press Decode — Oneirox reads the neural echo, not a symbol dictionary.",
        "Нажмите Decode — Oneirox читает нейронный отклик, а не словарь символов.",
    ),
    (
        "Free interactive AI dream decoder. Type your dream, press Decode, receive one mechanism-based reading — not a symbol dictionary.",
        "Бесплатный интерактивный ИИ-декодер снов. Опишите сон, нажмите Decode — получите одно механизмное чтение, а не словарь символов.",
    ),
    ("About · Experience · Expertise", "О проекте · Опыт · Экспертиза"),
    (
        "I read dreams as <em>physiology</em> — not symbols.",
        "Я читаю сны как <em>физиологию</em> — не как символы.",
    ),
    (
        "I am <strong>not</strong> a licensed clinician. I am not a therapist. I am someone who spent five years reading what actually happens in the sleeping brain — because every existing dream tool kept answering the wrong question.",
        "Я <strong>не</strong> лицензированный клиницист. Я не терапевт. Я человек, который пять лет читал о том, что реально происходит в спящем мозге — потому что каждый существующий инструмент для снов отвечал не на тот вопрос.",
    ),
    (
        "Sleep Physiology &amp; Somatic Signals Researcher · Independent · Developer",
        "Исследователь физиологии сна и соматических сигналов · независимый · разработчик",
    ),
    ("Vigen G.R. — Sleep physiology researcher", "Vigen G.R. — исследователь физиологии сна"),
    ("Oneirox — neurobiology of dreaming", "Oneirox — нейробиология сновидений"),
    ("Research credentials", "Исследовательские основания"),
    ("Years of focused research", "Лет целенаправленных исследований"),
    ("Books on sleep &amp; neuroscience", "Книг о сне и нейронауке"),
    ("Researchers in the Decode engine", "Исследователей в движке Decode"),
    ("Why Oneirox exists", "Почему существует Oneirox"),
    (
        "The question no dream dictionary could answer",
        "Вопрос, на который не ответит ни один словарь снов",
    ),
    (
        "Why every dream tool gets this wrong",
        "Почему каждый инструмент для снов ошибается",
    ),
    ("Experience · E-E-A-T", "Опыт · E-E-A-T"),
    (
        "Who I am — and what I am <em>not</em>",
        "Кто я — и кем я <em>не</em> являюсь",
    ),
    ("How I read a dream", "Как я читаю сон"),
    ("What I built", "Что я построил"),
    (
        "Three instruments, one neurobiological lens",
        "Три инструмента, одна нейробиологическая линза",
    ),
    ("Authority · lineage", "Авторитет · линия исследований"),
    (
        "The science behind every interpretation",
        "Наука за каждой интерпретацией",
    ),
    ("Trust · limits · honesty", "Доверие · границы · честность"),
    (
        "What Oneirox is — and is not",
        "Чем является Oneirox — и чем не является",
    ),
    (
        "The signal was there when you woke up.<br><em>Decode it now.</em>",
        "Сигнал уже был, когда вы проснулись.<br><em>Расшифруйте его сейчас.</em>",
    ),
    (
        "Free · No login · Grounded in sleep neuroscience",
        "Бесплатно · Без входа · На основе нейробиологии сна",
    ),
    ("Open the Dream Decoder →", "Открыть декодер снов →"),
    ("Open Dream Decoder →", "Открыть декодер снов →"),
    ("Related pages", "Связанные страницы"),
    ("Full methodology", "Полная методология"),
    (
        "Independent researcher &amp; developer",
        "Независимый исследователь и разработчик",
    ),
    ("About Vigen G.R. — Oneirox", "О Vigen G.R. — Oneirox"),
    # Tagged nav / UI only
    (">How it works</a>", ">Как это работает</a>"),
    (">Methodology</a>", ">Методология</a>"),
    (">Science</a>", ">Наука</a>"),
    (">Tools</a>", ">Инструменты</a>"),
    (">About</a>", ">О проекте</a>"),
    (">Privacy</a>", ">Конфиденциальность</a>"),
    (">Terms</a>", ">Условия</a>"),
    (">Disclaimer</a>", ">Дисклеймер</a>"),
    (">Mapper</a>", ">Карта</a>"),
    ('aria-label="Main"', 'aria-label="Основная навигация"'),
    ('aria-label="Footer"', 'aria-label="Подвал"'),
    ('aria-label="Language"', 'aria-label="Язык"'),
    ('aria-label="Back to top"', 'aria-label="Наверх"'),
    (">Top</span>", ">Вверх</span>"),
    ("Oneirox Dream Decoder", "Oneirox Декодер снов"),
    ("Dream Decoder", "Декодер снов"),
    ("Sensory Dream Mapper", "Сенсорная карта сна"),
    ("Dream Phase Calculator", "Калькулятор фазы сна"),
    ("Oneirox is not", "Oneirox — это не"),
    ("Oneirox is", "Oneirox — это"),
    ("Expertise", "Экспертиза"),
]


def apply_translations(html: str) -> str:
    pairs = list(TRANSLATIONS) + list(EXTRA)
    for en, ru in sorted(pairs, key=lambda x: len(x[0]), reverse=True):
        html = html.replace(en, ru)
    return html


def rewrite_internal_links(html: str) -> str:
    """Rewrite site links to /ru/… but never touch lang-switcher EN targets."""
    # Temporarily protect switcher block
    protected: list[str] = []

    def stash(m: re.Match[str]) -> str:
        protected.append(m.group(0))
        return f"__LANG_SWITCHER_{len(protected) - 1}__"

    html = re.sub(
        r'<nav class="site-lang"[\s\S]*?</nav>',
        stash,
        html,
        count=1,
    )

    pairs = [
        ('href="/about/"', 'href="/ru/about/"'),
        ('href="/methodology/"', 'href="/ru/methodology/"'),
        ('href="/phase/"', 'href="/ru/phase/"'),
        ('href="/privacy/"', 'href="/ru/privacy/"'),
        ('href="/terms/"', 'href="/ru/terms/"'),
        ('href="/disclaimer/"', 'href="/ru/disclaimer/"'),
        ('href="/#decode"', 'href="/ru/#decode"'),
        ('href="/#how"', 'href="/ru/#how"'),
        ('href="/#onx-tools"', 'href="/ru/#onx-tools"'),
        ('href="/#science"', 'href="/ru/#science"'),
        ('href="/" class="site-logo"', 'href="/ru/" class="site-logo"'),
        ('href="/">Oneirox</a>', 'href="/ru/">Oneirox</a>'),
        ('href="/">', 'href="/ru/">'),
        ('item": "https://oneirox.com/about/"', 'item": "https://oneirox.com/ru/about/"'),
        ('item": "https://oneirox.com/methodology/"', 'item": "https://oneirox.com/ru/methodology/"'),
        ('item": "https://oneirox.com/phase/"', 'item": "https://oneirox.com/ru/phase/"'),
        ('item": "https://oneirox.com/privacy/"', 'item": "https://oneirox.com/ru/privacy/"'),
        ('item": "https://oneirox.com/terms/"', 'item": "https://oneirox.com/ru/terms/"'),
        ('item": "https://oneirox.com/disclaimer/"', 'item": "https://oneirox.com/ru/disclaimer/"'),
        ('item": "https://oneirox.com/"', 'item": "https://oneirox.com/ru/"'),
    ]
    for a, b in pairs:
        html = html.replace(a, b)
    html = html.replace("/ru/ru/", "/ru/")

    for i, block in enumerate(protected):
        html = html.replace(f"__LANG_SWITCHER_{i}__", block)
    return html


def set_lang_switcher(html: str, en_path: str, ru_path: str) -> str:
    switcher = f'''<nav class="site-lang" aria-label="Язык">
          <a href="{en_path}" hreflang="en" lang="en">EN</a>
          <span class="site-lang__sep" aria-hidden="true">|</span>
          <a href="{ru_path}" hreflang="ru" lang="ru" aria-current="page">RU</a>
        </nav>'''
    html = re.sub(
        r'<nav class="site-lang"[\s\S]*?</nav>',
        switcher,
        html,
        count=1,
    )
    return html


def set_canonical_hreflang(html: str, en_url: str, ru_url: str) -> str:
    html = re.sub(
        r'<link rel="canonical" href="[^"]+">\s*'
        r'(?:<link rel="alternate" hreflang="[^"]+" href="[^"]+">\s*)*',
        f'''<link rel="canonical" href="{ru_url}">
  <link rel="alternate" hreflang="en" href="{en_url}">
  <link rel="alternate" hreflang="ru" href="{ru_url}">
  <link rel="alternate" hreflang="x-default" href="{en_url}">
''',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta property="og:url" content="[^"]+">',
        f'<meta property="og:url" content="{ru_url}">',
        html,
        count=1,
    )
    if "og:locale" not in html:
        html = html.replace(
            '<meta property="og:type"',
            '<meta property="og:locale" content="ru_RU">\n  <meta property="og:locale:alternate" content="en_US">\n  <meta property="og:type"',
            1,
        )
    return html


def transform_ru(html: str, *, en_url: str, ru_url: str, page: str) -> str:
    html = html.replace('<html lang="en">', '<html lang="ru">', 1)
    html = set_canonical_hreflang(html, en_url, ru_url)
    html = apply_translations(html)

    en_path = en_url.replace("https://oneirox.com", "") or "/"
    ru_path = ru_url.replace("https://oneirox.com", "") or "/ru/"
    html = set_lang_switcher(html, en_path, ru_path)
    html = rewrite_internal_links(html)

    html = html.replace('aria-label="Oneirox home"', 'aria-label="Oneirox — главная"', 1)

    if page == "home":
        html = html.replace(
            '"@id": "https://oneirox.com/#webpage"',
            '"@id": "https://oneirox.com/ru/#webpage"',
        )
    if page == "about":
        html = html.replace(
            '"@id": "https://oneirox.com/about/#profilepage"',
            '"@id": "https://oneirox.com/ru/about/#profilepage"',
        )
        html = html.replace(
            '"url": "https://oneirox.com/about/"',
            '"url": "https://oneirox.com/ru/about/"',
        )
        html = html.replace(
            '"mainEntityOfPage": { "@id": "https://oneirox.com/about/#profilepage" }',
            '"mainEntityOfPage": { "@id": "https://oneirox.com/ru/about/#profilepage" }',
        )

    if "oneirox-lang.js" not in html:
        html = html.replace(
            "</body>",
            '  <script src="/js/oneirox-lang.js" data-cfasync="false" defer></script>\n</body>',
            1,
        )
    return html


PAGES = [
    ("ru/index.html", "https://oneirox.com/", "https://oneirox.com/ru/", "home"),
    ("ru/about/index.html", "https://oneirox.com/about/", "https://oneirox.com/ru/about/", "about"),
    ("ru/methodology/index.html", "https://oneirox.com/methodology/", "https://oneirox.com/ru/methodology/", "methodology"),
    ("ru/phase/index.html", "https://oneirox.com/phase/", "https://oneirox.com/ru/phase/", "phase"),
    ("ru/privacy/index.html", "https://oneirox.com/privacy/", "https://oneirox.com/ru/privacy/", "privacy"),
    ("ru/terms/index.html", "https://oneirox.com/terms/", "https://oneirox.com/ru/terms/", "terms"),
    ("ru/disclaimer/index.html", "https://oneirox.com/disclaimer/", "https://oneirox.com/ru/disclaimer/", "disclaimer"),
]


def main() -> None:
    for rel, en_url, ru_url, page in PAGES:
        path = ROOT / rel
        # Always start from fresh EN source
        en_rel = rel.replace("ru/", "", 1) if rel != "ru/index.html" else "index.html"
        if rel == "ru/index.html":
            en_path = ROOT / "index.html"
        else:
            en_path = ROOT / en_rel
        html = en_path.read_text(encoding="utf-8")
        out = transform_ru(html, en_url=en_url, ru_url=ru_url, page=page)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(out, encoding="utf-8")
        print(f"OK {rel}")


if __name__ == "__main__":
    main()
