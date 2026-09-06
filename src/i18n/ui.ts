/* ============================================================
   LUME — kétnyelvűség egy helyen
   Minden felületi szöveg és minden útvonal-szelet itt él.
   Új nyelvi szöveg → ide, ne a sablonokba.
   ============================================================ */

export const LANGS = ['hu', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'hu';

/* ---------- rovatok ---------- */
export const COLUMN_KEYS = ['in-hand', 'origins', 'movement'] as const;
export type ColumnKey = (typeof COLUMN_KEYS)[number];

type ColumnCopy = {
  slug: string;
  name: string;
  title: string;
  blurb: string;
  seoTitle: string;
  seoDescription: string;
};

export const COLUMNS: Record<ColumnKey, Record<Lang, ColumnCopy>> = {
  'in-hand': {
    hu: {
      slug: 'kezben',
      name: 'Kézben',
      title: 'A hét microbrandje',
      blurb: 'Egy kis műhely egy órája, kézbe véve és sokáig nézve.',
      seoTitle: 'Microbrand órák kézben',
      seoDescription:
        'Független és microbrand órák részletes bemutatói: modellek, alapítók, formaterv és az élmény, amit az óra valóban a csuklón nyújt.',
    },
    en: {
      slug: 'in-hand',
      name: 'In Hand',
      title: "The week's microbrand",
      blurb: 'One watch from one small maker, taken in hand and looked at for a long time.',
      seoTitle: 'Independent and Microbrand Watches',
      seoDescription:
        'In-depth stories about independent and microbrand watches: their models, founders, design and what the watches are really like on the wrist.',
    },
  },
  origins: {
    hu: {
      slug: 'eredet',
      name: 'Eredet',
      title: 'Márkatörténelem',
      blurb: 'Honnan jött valójában egy ház vagy egy referencia — a legenda mögötti tényekkel.',
      seoTitle: 'Óramárkák és ikonikus modellek története',
      seoDescription:
        'Óramárkák és ikonikus modellek eredete ellenőrizhető forrásokkal: tervezők, mérföldkövek és a legendák mögött álló valódi történetek.',
    },
    en: {
      slug: 'origins',
      name: 'Origins',
      title: 'Brand history',
      blurb: 'Where a house or a reference actually came from — with the facts behind the legend.',
      seoTitle: 'Watch Brand and Model Histories',
      seoDescription:
        'The origins of watch brands and iconic models, researched through verifiable sources: designers, milestones and the facts behind the legends.',
    },
  },
  movement: {
    hu: {
      slug: 'szerkezet',
      name: 'Szerkezet',
      title: 'Mérnöki megközelítés',
      blurb: 'A számlap alatti mechanika, alkatrészenként: gátlómű, kronográf, GMT, spirál.',
      seoTitle: 'Óraszerkezetek: működés és mérnöki megoldások',
      seoDescription:
        'Mechanikus és hibrid óraszerkezetek működése érthetően: kronográf, oszlopkerék, gátlómű, Spring Drive és más mérnöki megoldások.',
    },
    en: {
      slug: 'movement',
      name: 'Movement',
      title: 'The engineering',
      blurb: 'The mechanics under the dial, one piece at a time: escapement, chronograph, GMT, hairspring.',
      seoTitle: 'Watch Movements: Mechanics and Engineering',
      seoDescription:
        'How mechanical and hybrid watch movements work: chronographs, column wheels, escapements, Spring Drive and other engineering solutions explained.',
    },
  },
};

/* a „Rólam" oldal szelete nyelvenként */
export const ABOUT_SLUG: Record<Lang, string> = { hu: 'rolam', en: 'about' };
export const WORKSHOP_SLUG: Record<Lang, string> = { hu: 'muhely', en: 'workshop' };

/* ---------- felületi szövegek ---------- */
export const UI = {
  hu: {
    siteTitle: 'Lume | Karórák, óratörténetek és óraszerkezetek',
    siteDescription:
      'Kétnyelvű órás napló: microbrandek kézben, márkatörténelem a legenda mögötti tényekkel, és a számlap alatti mechanika. Heti három írás.',
    tagline: 'Órás napló. Magyarul és angolul.',

    /* fejléc */
    navAriaLabel: 'Fő navigáció',
    about: 'Rólam',
    workshop: 'Műhely',
    langSwitchLabel: 'Switch to English',
    langSwitchText: 'EN',
    lightsOff: 'Lámpa le',
    lightsOn: 'Lámpa fel',
    skipToContent: 'Ugrás a tartalomra',

    /* hero */
    eyebrow: 'Órás napló',
    heroTitleBefore: 'Tanulj meg ',
    heroTitleEm: 'órát olvasni.',
    heroLede:
      'A lume az a halk fény, amitől a számlap sötétben is olvasható marad. Ez a napló ugyanezt csinálja magukkal az órákkal: olvashatóvá teszi őket — a kis független műhelyeket, a régi házak igazi történetét, és a számlap alatt dolgozó gépezetet.',
    readLatest: 'Olvasd a legfrissebbet',
    heroLightsOff: 'vagy oltsd le a villanyt',
    heroLightsOn: 'vagy kapcsold fel a lámpát',
    dialAlt: 'Vintage számlap világító indexekkel',

    /* rovatok szekció */
    weeklyThree: 'A heti három',
    weeklyDays: 'Hétfő · Szerda · Péntek',

    /* legfrissebb */
    latest: 'Legfrissebb',
    newestFirst: 'Legújabb elöl',
    allInColumn: 'Mind a rovatban',

    /* Lume Műhely */
    workshopEyebrow: 'Interaktív szerkezetek',
    workshopTitle: 'Az óra belülről.',
    workshopLede:
      'Működő modellek a pénteki Szerkezet-cikkekhez. Indítsd el, lassítsd le, kapcsold ki — és nézd meg, mit csinál valójában a számlap alatti gépezet.',
    workshopSeoTitle: 'Lume Műhely: interaktív óraszerkezetek',
    workshopSeoDescription:
      'Interaktív modellek mechanikus és hibrid óraszerkezetekhez: gátlómű, Spring Drive, oszlopkerék és a pénteki Lume-cikkek új modelljei.',
    workshopFriday: 'Új modell minden pénteken',
    workshopBench: 'A műhely asztalán',
    workshopNewest: 'Legújabb modell',
    workshopCount: (n: number) => `${n} működő modell`,
    workshopLoad: 'Modell elindítása',
    workshopClose: 'Modell bezárása',
    workshopLive: 'Működő modell',
    workshopRead: 'A teljes cikk',
    workshopNoModels: 'Az első modell hamarosan elkészül.',
    workshopLevel: {
      foundation: 'Alapok',
      intermediate: 'Középhaladó',
      advanced: 'Haladó',
    },
    homeWorkshopEyebrow: 'Lume Műhely · pénteki modell',
    homeWorkshopTitle: 'Ne csak olvasd. Indítsd el.',
    homeWorkshopText:
      'A pénteki cikkekhez működő modellek készülnek. A teljes gyűjtemény egy helyen, és minden új Szerkezet-cikkel automatikusan bővül.',
    homeWorkshopEnter: 'Belépek a Műhelybe',

    /* ethos */
    ethosEyebrow: 'Amiben hiszünk',
    ethosLineBefore: 'Semmi megjelenésnapi hajsza. Semmi hype. Átgondolt írások, ',
    ethosLineBold: 'elfogultan a tárgy felé.',

    /* hírlevél */
    subTitle: 'Új írások hetente, a postaládádba.',
    subNote: 'Semmi más. Bármikor leiratkozhatsz.',
    subPlaceholder: 'te@pelda.hu',
    subButton: 'Feliratkozom',
    subDone: 'Fent vagy a listán.',
    subError: 'Most nem sikerült. Próbáld újra kicsit később.',

    /* követés — hírlevél helyett egyelőre csak RSS */
    followVia: 'Az új írásokat itt tudod követni:',

    /* lábléc */
    footColumns: 'Rovatok',
    footJournal: 'A napló',
    /* parkolva: a hírlevél-sáv egyelőre nincs kirakva az oldalra */
    footNewsletter: 'Hírlevél',
    footArchive: 'Archívum',
    footCopy: '© 2026 Lume',
    footPlace: 'Lassan írva, Budapesten.',

    /* cikk / lista */
    minutes: (n: number) => `${n} perc`,
    backToColumn: 'Vissza a rovathoz',
    sources: 'Források',
    articleContents: 'A cikk részei',
    articleProgress: 'Olvasási folyamat',
    copyLink: 'Hivatkozás másolása',
    linkCopied: 'Kimásolva',
    copyLinkError: 'Nem sikerült kimásolni',
    continueReading: 'Olvass tovább',
    continueReadingNote: 'Három történet a naplóból',
    noPostsYet: 'Ebben a rovatban még nincs írás. Hamarosan.',
    noPostsYetHome: 'Az első írás hamarosan.',
    readOn: 'Tovább',
    breadcrumb: 'Útvonal',
    writtenBy: 'Szerző:',
    updatedOn: 'Frissítve:',
    archive: 'Minden cikk',
    archiveTitle: 'Karórák, történetek, szerkezetek.',
    archiveSeoTitle: 'Órás cikkek: márkák, modellek és szerkezetek',
    archiveDescription: 'A Lume összes írása egy helyen. Független óramárkák, ikonikus karórák története és az óraszerkezetek működése, ellenőrizhető forrásokkal.',
    archiveSearch: 'Keress márkára, modellre vagy szerkezetre',
    archiveSearchHint: 'Például: Seiko, Monaco, rotor',
    archiveNoResults: 'Erre most nincs találat. Próbálj másik márkát vagy rövidebb kifejezést.',
    archiveResults: (n: number) => `${n} cikk`,
  },

  en: {
    siteTitle: 'Lume | Watches, Watch History and Movements',
    siteDescription:
      'A bilingual watch journal: microbrands in hand, brand history with the facts behind the legend, and the machinery under the dial. Three pieces a week.',
    tagline: 'A watch journal. In Hungarian and English.',

    navAriaLabel: 'Main navigation',
    about: 'About',
    workshop: 'Workshop',
    langSwitchLabel: 'Váltás magyarra',
    langSwitchText: 'HU',
    lightsOff: 'Lights off',
    lightsOn: 'Lights on',
    skipToContent: 'Skip to content',

    eyebrow: 'A watch journal',
    heroTitleBefore: 'Learn to ',
    heroTitleEm: 'read a watch.',
    heroLede:
      'Lume is the quiet glow that keeps a dial legible in the dark. This journal does the same for the watches themselves — it makes them legible: the small independent makers, the real histories of the old houses, and the machinery under the dial.',
    readLatest: 'Read the latest',
    heroLightsOff: 'or turn the lights off',
    heroLightsOn: 'or turn the lights on',
    dialAlt: 'Vintage dial with luminous indices',

    weeklyThree: 'The weekly three',
    weeklyDays: 'Mon · Wed · Fri',

    latest: 'Latest',
    newestFirst: 'Newest first',
    allInColumn: 'All in this column',

    workshopEyebrow: 'Interactive movements',
    workshopTitle: 'Inside the watch.',
    workshopLede:
      'Working models made for the Friday Movement pieces. Start them, slow them down, switch things off — and see what the machinery beneath the dial actually does.',
    workshopSeoTitle: 'Lume Workshop: Interactive Watch Movements',
    workshopSeoDescription:
      'Interactive models of mechanical and hybrid watch movements: the escapement, Spring Drive, column wheel and new models from Lume’s Friday pieces.',
    workshopFriday: 'A new model every Friday',
    workshopBench: 'On the workbench',
    workshopNewest: 'Newest model',
    workshopCount: (n: number) => `${n} working ${n === 1 ? 'model' : 'models'}`,
    workshopLoad: 'Start the model',
    workshopClose: 'Close the model',
    workshopLive: 'Working model',
    workshopRead: 'Read the full piece',
    workshopNoModels: 'The first model is coming soon.',
    workshopLevel: {
      foundation: 'Foundations',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    homeWorkshopEyebrow: 'Lume Workshop · Friday model',
    homeWorkshopTitle: 'Do not just read it. Set it in motion.',
    homeWorkshopText:
      'The Friday pieces come with working models. The complete collection lives in one place and grows automatically with every new Movement article.',
    homeWorkshopEnter: 'Enter the Workshop',

    ethosEyebrow: 'What this is',
    ethosLineBefore: 'No release-day scramble. No hype. Considered pieces, ',
    ethosLineBold: 'biased toward the object.',

    subTitle: 'New pieces weekly, in your inbox.',
    subNote: 'Nothing else. Unsubscribe whenever.',
    subPlaceholder: 'you@example.com',
    subButton: 'Subscribe',
    subDone: "You're on the list.",
    subError: "That didn't go through. Please try again in a moment.",

    followVia: 'You can follow new pieces here:',

    footColumns: 'Columns',
    footJournal: 'The journal',
    footNewsletter: 'Newsletter',
    footArchive: 'Archive',
    footCopy: '© 2026 Lume',
    footPlace: 'Written slowly, in Budapest.',

    minutes: (n: number) => `${n} min`,
    backToColumn: 'Back to the column',
    sources: 'Sources',
    articleContents: 'In this piece',
    articleProgress: 'Reading progress',
    copyLink: 'Copy link',
    linkCopied: 'Copied',
    copyLinkError: 'Could not copy',
    continueReading: 'Continue reading',
    continueReadingNote: 'Three stories from the journal',
    noPostsYet: 'No pieces in this column yet. Soon.',
    noPostsYetHome: 'The first piece is coming soon.',
    readOn: 'Read on',
    breadcrumb: 'Breadcrumb',
    writtenBy: 'Written by',
    updatedOn: 'Updated:',
    archive: 'All articles',
    archiveTitle: 'Watches, stories, movements.',
    archiveSeoTitle: 'Watch Articles: Brands, Models and Movements',
    archiveDescription: 'Every Lume article in one place. Independent watch brands, the history of iconic watches and how watch movements work, with verifiable sources.',
    archiveSearch: 'Search for a brand, model or movement',
    archiveSearchHint: 'For example: Seiko, Monaco, rotor',
    archiveNoResults: 'No matching articles yet. Try another brand or a shorter search.',
    archiveResults: (n: number) => `${n} ${n === 1 ? 'article' : 'articles'}`,
  },
} as const;

export type UIStrings = (typeof UI)[Lang];

/* ---------- útvonal-segédek ---------- */

/** `/` HU-nál, `/en/` EN-nél. */
export function langBase(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/' : `/${lang}/`;
}

/** Rovat-listaoldal URL-je. */
export function columnUrl(lang: Lang, key: ColumnKey): string {
  return `${langBase(lang)}${COLUMNS[key][lang].slug}/`;
}

/** Cikk URL-je. */
export function postUrl(lang: Lang, key: ColumnKey, slug: string): string {
  return `${columnUrl(lang, key)}${slug}/`;
}

/** Rólam oldal URL-je. */
export function aboutUrl(lang: Lang): string {
  return `${langBase(lang)}${ABOUT_SLUG[lang]}/`;
}

/** Lume Műhely / Lume Workshop URL-je. */
export function workshopUrl(lang: Lang): string {
  return `${langBase(lang)}${WORKSHOP_SLUG[lang]}/`;
}

export function archiveUrl(lang: Lang): string {
  return lang === 'hu' ? '/cikkek/' : '/en/articles/';
}

export function otherLang(lang: Lang): Lang {
  return lang === 'hu' ? 'en' : 'hu';
}

/** Dátum a napló formátumában: HU 2026.07.24 · EN 24 Jul 2026 */
export function formatDate(date: Date, lang: Lang): string {
  if (lang === 'hu') {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Olvasási idő percben, ha a frontmatter nem mondja meg. */
export function readingTime(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
// Calendar copy lives here alongside the rest of the bilingual interface.
export const CALENDAR_UI = {
  hu: {
    nav: 'Naptár',
    seoTitle: 'Óramegjelenési naptár: a Lume válogatása',
    seoDescription:
      'Válogatott, hivatalos forrásból ellenőrzött közelgő óramegjelenések, automatikus státusszal és letölthető naptárbejegyzéssel.',
    eyebrow: 'Lume Naptár · válogatott megjelenések',
    title: 'Ami érkezik. És ami már megérkezett.',
    lede:
      'Óraújdonságok a figyelt márkáktól, hivatalos forrásból. Külön jelöljük a dátumra váró bejelentéseket, a biztos megjelenéseket és a már bemutatott órákat. Ha nincs dátum, nem találunk ki hozzá.',
    overview: 'Áttekintés',
    introduced: 'Bemutatott újdonságok',
    announced: 'Bejelentve, dátumra vár',
    statusIntroduced: 'Már bemutatva',
    statusToday: 'A megadott időszakban',
    dayPrecision: 'Napra pontos dátum',
    undated: 'Nincs megjelenési dátum',
    unknownEdition: 'Nincs megadott darabszám',
    undatedNote: 'Nincs igazolt megjelenési nap, ezért nincs naptárletöltés.',
    overviewHelp: 'Az áttekintés a közelgő és dátum nélküli újdonságokat, valamint az elmúlt 60 nap naptári eseményeit mutatja. A bemutatás nem jelent helyi raktárkészletet.',
    statusLabel: 'Állapot', monthLabel: 'Hónap', brandLabel: 'Márka', searchLabel: 'Márka vagy modell keresése',
    resetFilters: 'Szűrők törlése',
    noBrandResults: 'Ehhez a márkához még nincs megfelelő ellenőrzött bejegyzés. Ez nem jelenti azt, hogy nincs újdonsága.',
    radarCount: (n: number) => `${n} bejegyzés`,
    radarSources: (n: number) => `${n} hivatalos forrás`,
    clientDaysMany: '{n} nap múlva', clientResultsOne: '1 találat', clientResultsMany: '{n} találat',
    curated: 'Válogatott, nem teljes lista',
    verified: 'Forrás ellenőrizve',
    upcomingCount: (n: number) => `${n} közelgő megjelenés`,
    next: 'A következő',
    selection: 'Miért van itt',
    releaseDate: 'Megjelenés',
    availability: 'Elérhetőség',
    edition: 'Kiadás',
    price: 'Irányár',
    confirmed: 'Megerősített',
    monthPrecision: 'Hónap pontosságú dátum',
    officialSource: 'Hivatalos forrás',
    addCalendar: 'Naptárhoz adom',
    imageCredit: 'Kép',
    filters: 'Szűrés',
    allMonths: 'Minden hónap',
    allBrands: 'Minden márka',
    allStatuses: 'Minden állapot',
    activeStatuses: 'Közelgő és aktuális',
    archivedStatuses: 'Lezárt időszakok',
    noResults: 'Nincs a szűrésnek megfelelő megjelenés.',
    results: (n: number) => `${n} találat`,
    statusUpcoming: 'Közeleg',
    statusCurrent: 'Ebben a hónapban',
    statusArchived: 'A megadott időszak lezárult',
    daysOne: '1 nap múlva',
    daysMany: (n: number) => `${n} nap múlva`,
    limited: (n: number) => `${new Intl.NumberFormat('hu-HU').format(n)} darab`,
    continuous: 'Állandó kollekció',
    homeEyebrow: 'Lume Naptár',
    homeTitle: 'A következő órák a láthatáron.',
    homeText: 'Nem teljes hírzaj, hanem néhány előre kiválasztott megjelenés, ellenőrzött dátummal.',
    homeOpen: 'Teljes naptár',
    radarEyebrow: 'Figyelt források',
    radarTitle: 'Márkaradar',
    radarText:
      'A sajtóoldalak mellett az újdonság- és termékoldalakat is követjük. A kártyák száma az ellenőrzött bejegyzéseinket jelzi, nem a márka összes új óráját. A forrásletöltés önmagában nem szerkesztői ellenőrzés.',
    radarMajor: 'Nagy gyártók',
    radarIndependent: 'Microbrandek és függetlenek',
    radarActive: 'Van aktív bejegyzés',
    radarWatched: 'Még nincs feldolgozott bejegyzés',
    radarOfficial: 'Hivatalos oldal',
    radarLastChecked: (date: string) => `Utolsó rögzített radaráttekintés: ${date}`,
  },
  en: {
    nav: 'Calendar',
    seoTitle: 'Watch Release Calendar: The Lume Selection',
    seoDescription:
      'A curated list of upcoming watch releases verified against official sources, with automatic status updates and downloadable calendar entries.',
    eyebrow: 'Lume Calendar · selected releases',
    title: 'What is coming. And what has arrived.',
    lede:
      'Watch novelties from monitored brands, verified against official sources. Announcements awaiting dates, confirmed releases and introduced watches are kept distinct. We never invent a missing date.',
    overview: 'Overview',
    introduced: 'Introduced novelties',
    announced: 'Announced, awaiting a date',
    statusIntroduced: 'Already introduced',
    statusToday: 'Within the stated window',
    dayPrecision: 'Day-level date',
    undated: 'No release date',
    unknownEdition: 'Quantity not specified',
    undatedNote: 'No verified release day, so no calendar download.',
    overviewHelp: 'The overview includes upcoming and undated novelties plus calendar events from the past 60 days. Introduction does not imply local stock availability.',
    statusLabel: 'Status', monthLabel: 'Month', brandLabel: 'Brand', searchLabel: 'Search brand or model',
    resetFilters: 'Clear filters',
    noBrandResults: 'We do not yet have a matching verified entry for this brand. This does not mean it has no new watches.',
    radarCount: (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
    radarSources: (n: number) => `${n} official ${n === 1 ? 'source' : 'sources'}`,
    clientDaysMany: 'in {n} days', clientResultsOne: '1 result', clientResultsMany: '{n} results',
    curated: 'Curated, not exhaustive',
    verified: 'Source checked',
    upcomingCount: (n: number) => `${n} upcoming ${n === 1 ? 'release' : 'releases'}`,
    next: 'Next up',
    selection: 'Why it is here',
    releaseDate: 'Release',
    availability: 'Availability',
    edition: 'Edition',
    price: 'Indicative price',
    confirmed: 'Confirmed',
    monthPrecision: 'Month-level date',
    officialSource: 'Official source',
    addCalendar: 'Add to calendar',
    imageCredit: 'Image',
    filters: 'Filters',
    allMonths: 'All months',
    allBrands: 'All brands',
    allStatuses: 'All statuses',
    activeStatuses: 'Upcoming and current',
    archivedStatuses: 'Past event windows',
    noResults: 'No releases match these filters.',
    results: (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`,
    statusUpcoming: 'Upcoming',
    statusCurrent: 'Due this month',
    statusArchived: 'Stated window has ended',
    daysOne: 'in 1 day',
    daysMany: (n: number) => `in ${n} days`,
    limited: (n: number) => `${new Intl.NumberFormat('en-GB').format(n)} pieces`,
    continuous: 'Permanent collection',
    homeEyebrow: 'Lume Calendar',
    homeTitle: 'The next watches on the horizon.',
    homeText: 'Not the whole news cycle, but a few releases selected in advance and checked against official dates.',
    homeOpen: 'Full calendar',
    radarEyebrow: 'Monitored sources',
    radarTitle: 'Brand radar',
    radarText:
      'We follow novelty and product pages as well as press rooms. Counts refer to our verified entries, not every new watch from a brand. Downloading a source is not an editorial review.',
    radarMajor: 'Major makers',
    radarIndependent: 'Microbrands and independents',
    radarActive: 'Active entry',
    radarWatched: 'No processed entry yet',
    radarOfficial: 'Official site',
    radarLastChecked: (date: string) => `Last recorded radar review: ${date}`,
  },
} as const;
