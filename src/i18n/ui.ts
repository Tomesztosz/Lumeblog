export const LLMS_COPY = {
  name:'Lume Journal',
  hu:{summary:'Kétnyelvű, független órás folyóirat: óratörténetek, formatervezés és a szerkezetek működésének magyarázata.',
    detail:'A cikkek magyarul és angolul olvashatók, forrásjegyzékkel. Az interaktív Műhely saját működési szemléltetéseket kínál, a megjelenési naptár hivatalos forrásokra épül. Az alábbi linkek a nyilvános HTML-oldalakra vezetnek, nem külön Markdown-változatokra.',
    complete:'Teljes kétnyelvű tartalomjegyzék',completeNote:'Az összes alkalmas cikk, modell és áttekintő oldal. A rövidített jegyzék válogatása nem keresési népszerűséget fejez ki.'},
  en:{summary:'An independent bilingual watch journal covering watch history, design and how watch mechanisms work.',
    detail:'Articles are available in Hungarian and English with source lists. The interactive Workshop offers original functional illustrations; the release calendar relies on official sources. Links below lead to public HTML pages, not separate Markdown versions.',
    complete:'Complete bilingual directory',completeNote:'Every eligible article, model and overview page. Selection in the compact directory does not imply search popularity.'},
  categories:{movement:{hu:'Óraszerkezetek',en:'Movement Mechanics'},independents:{hu:'Független óragyártók és mikromárkák',en:'Independent Makers & Microbrands'},'hands-on':{hu:'Órák és gyártók',en:'Watches & Makers'},heritage:{hu:'Óratörténet',en:'Heritage & Iconic Models'},workshop:{hu:'Interaktív Műhely',en:'Interactive Workshop'},releases:{hu:'Megjelenési naptár',en:'Watch Releases'},optional:{hu:'További tájékozódás',en:'Optional'}},
} as const;

export const CONTENT_LINKS = {
  hu: {title:'Értsd meg működés közben', models:'Kapcsolódó modellek', articles:'Olvass tovább', calendar:'A naptárban', family:'A modellcsalád története', exact:'Az óráról részletesen', editorial:'Szerkesztői válogatás.', observe:'Ezt figyeld meg', limitation:'A modell határai', preview:'Szerkesztői előnézet, még nem nyilvános gyűjtőoldal'},
  en: {title:'See how it works', models:'Related models', articles:'Further reading', calendar:'In the calendar', family:'The model family story', exact:'Read about this watch', editorial:'An editorial connection.', observe:'What to observe', limitation:'Model limitations', preview:'Editorial preview, not a published collection'},
} as const;

export const MODEL_READING_GUIDES = {
  'gatlomu': {
    hu:{question:'Miért áll meg a gátkerék, miközben a billegő tovább leng?',observe:'Lassítás közben kövesd a horgony két kövét: felváltva zárják a kereket, majd az oldás után impulzust közvetítenek.',limitation:'A rajz a mozgássorrendet szemlélteti, nem gyártási méreteket vagy kenési előírást.'},
    en:{question:'Why does the escape wheel stop while the balance keeps swinging?',observe:'Slow the model and follow the two pallet stones: they alternately lock the wheel and transmit an impulse after release.',limitation:'The diagram explains the sequence, not manufacturing dimensions or lubrication requirements.'},
  },
  'co-axial': {
    hu:{question:'Mikor jut közvetlenül a billegőhöz az impulzus?',observe:'Hasonlítsd össze a közvetett és a közvetlen impulzus fázisát. Az egyik út a horgonyon át vezet, a másik megkerüli azt.',limitation:'A modell Daniels klasszikus elvét mutatja, nem minden Omega-kaliber pontos geometriáját.'},
    en:{question:'When does the balance receive a direct impulse?',observe:'Compare the indirect and direct impulse phases. One path goes through the lever; the other bypasses it.',limitation:'The model shows Daniels’ classic principle, not the exact geometry of every Omega calibre.'},
  },
  'rattrapante': {
    hu:{question:'Hogyan állhat meg a részidőmutató a stopper megállítása nélkül?',observe:'Indítsd el a stoppert, rögzíts részidőt, majd engedd el a mutatót. Az egyik mutató végig fut, a másik visszazárkózik hozzá.',limitation:'A sematikus mechanizmus nem egy konkrét gyártói kaliber alkatrészrajza.'},
    en:{question:'How can a split hand stop without stopping the chronograph?',observe:'Start the chronograph, take a split, then release the hand. One hand keeps running while the other catches up.',limitation:'This schematic is not a parts drawing of a particular manufacturer’s calibre.'},
  },
  'ugro-masodperc': {
    hu:{question:'Mitől vár egy másodpercig a mechanikus mutató?',observe:'Kövesd a csillag és a kioldókar kapcsolatát. A mutató szakaszos mozgása külön feladat a járat szabályozásától.',limitation:'Az ugró másodperc elvét szemlélteti, nem helyettesíti az egyes kaliberek műszaki dokumentációját.'},
    en:{question:'Why does a mechanical seconds hand wait for a full second?',observe:'Follow the star and release lever. Intermittent hand motion is a separate task from regulating the movement.',limitation:'This explains jumping seconds; it does not replace technical documentation for individual calibres.'},
  },
  'rotor': {
    hu:{question:'Hogyan lesz a csukló mozgásából a hajtórugóban tárolt energia?',observe:'Kövesd a rotor és a felhúzó kerékrendszer mozgását. A lengő tömeg nem közvetlenül a mutatókat hajtja.',limitation:'A rajz egy működési elvet emel ki; az automata felhúzásnak többféle gyári megoldása létezik.'},
    en:{question:'How does wrist motion store energy in the mainspring?',observe:'Follow the rotor and winding train. The oscillating weight does not drive the hands directly.',limitation:'The diagram isolates a principle; manufacturers use several different automatic-winding systems.'},
  },
  'spring-drive': {
    hu:{question:'Mi fékezi a siklókereket hagyományos gátlómű nélkül?',observe:'Kövesd az energiát a rugótól a siklókerékig, és figyeld meg a szabályozás kikapcsolásának hatását.',limitation:'A szabályozás vázlata nem a Tri-Synchro Regulator teljes elektromos kapcsolási rajza.'},
    en:{question:'What brakes the glide wheel without a conventional escapement?',observe:'Follow the energy from the mainspring to the glide wheel and observe what happens when regulation is disabled.',limitation:'This is a regulation schematic, not a complete electrical circuit diagram of the Tri-Synchro Regulator.'},
  },
  'g-shock': {
    hu:{question:'Miért nem csak a tok vastagsága számít egy esésnél?',observe:'Hasonlítsd össze a merev és a párnázott rögzítést. A modul lassulása fontosabb, mint az esés önmagában.',limitation:'Az összehasonlítás szemléltetés, nem hitelesített ütésállósági mérés vagy termékteszt.'},
    en:{question:'Why is case thickness not the only factor in a fall?',observe:'Compare rigid and cushioned mounting. The module’s deceleration matters more than the fall alone.',limitation:'This is an illustration, not a certified shock-resistance measurement or product test.'},
  },
  'oszlopkerek': {
    hu:{question:'Hogyan vezényel több kart egyetlen gombnyomás?',observe:'Indíts és állíts meg egy ciklust. Figyeld, mikor támaszkodik a kar pillérre, és mikor esik a pillérek közötti résbe.',limitation:'A kapcsolás módja nem határozza meg önmagában a kronográf pontosságát vagy tengelykapcsolójának típusát.'},
    en:{question:'How does a single push coordinate several levers?',observe:'Start and stop a cycle. Watch when a lever rests on a column and when it drops into the gap between columns.',limitation:'The control mechanism alone determines neither timekeeping accuracy nor the type of chronograph clutch.'},
  },
  'vilagora': {
    hu:{question:'Hogyan olvasható le egyszerre több város ideje?',observe:'Válassz várost, majd kövesd a városgyűrű és a huszonnégy órás korong kapcsolatát.',limitation:'Az alapelv nem oldja meg automatikusan az eltérő nyári időszámítást és a törtórás időzónákat.'},
    en:{question:'How can one dial show the time in several cities?',observe:'Select a city and follow the relationship between the city ring and the 24-hour disc.',limitation:'The basic principle does not automatically account for differing daylight-saving rules or fractional time zones.'},
  },
  'minute-repeater': {
    hu:{question:'Miért három csoportban üti el az időt a percütő?',observe:'Állíts be például 10:37-et: tíz óraütés, két negyedórás hangpár és hét percütés követi egymást.',limitation:'A hang és a rajz saját szemléltetés, nem egy gyári óra hangfelvétele vagy alkatrészrajza.'},
    en:{question:'Why does a minute repeater strike in three groups?',observe:'Set 10:37: ten hour strikes, two quarter-hour pairs and seven minute strikes follow in sequence.',limitation:'The sound and diagram are original illustrations, not a recording or parts drawing of a production watch.'},
  },
} as const;

export const COAXIAL_MODEL = {
  hu: {
    title: 'Két út a billegőhöz', intro: 'Kövesd végig a Co-Axial egy teljes lengését. A nagy kerék, a kisebb impulzuskerék és a horgony külön is megvizsgálható.',
    workshop: 'Műhely / Co-Axial', schematic: 'Működési vázlat, nem méretarányos', play: 'Lejátszás', pause: 'Szünet', reset: 'Elölről', step: 'Következő fázis', speed: 'Lassítás',
    phaseLabel: 'A lengés fázisai', partsLabel: 'Alkatrészek', pathLabel: 'Az energia útja', wheelLabel: 'Gátkerék', balanceLabel: 'Billegő', locked: 'Zárva', released: 'Felszabadítva',
    states: ['Zárás a kilépőkövön', 'Oldás a villán keresztül', 'Közvetett impulzus', 'Zárás és szabad lengés', 'Visszaút', 'A belépőkő oldása', 'Közvetlen impulzus', 'Ismét zárva'],
    descriptions: [
      'A hajtórugó terheli a kerékrendszert, de a kilépőkő megállítja a gátkereket. A billegő közelít a kapcsolódási tartományhoz.',
      'A billegő vezetőköve beleér a villába, és elmozdítja a horgonyt. A zárókő kilép a kerék fogának útjából. Az oldást a billegő végzi.',
      'A kisebb kerék foga a horgony külön impulzuskövét tolja. A horgony a villán és a vezetőkövön át ad energiát a billegőnek.',
      'A következő fogot a belépőkő megfogja. Az impulzus véget ér; a billegő elválik a villától, tovább leng, majd a hajszálrugó visszafordítja.',
      'A billegő az ellenkező irányból tér vissza. A gátkerék közben nem haladt tovább: a hajtórugó erejét továbbra is a zárás tartja vissza.',
      'A vezetőkő a villa másik oldalát mozdítja meg. A horgony ismét oldja a zárást; most a közvetlen impulzus útja nyílik meg.',
      'A nagyobb kerék foga közvetlenül a billegő tárcsáján lévő impulzuskövet tolja. Az energia ezúttal nem a horgonyon át jut a billegőhöz.',
      'A kilépőkő ismét megfog egy fogat. A billegő befejezi szabad ívét és visszafordul. A két kerékszint együtt, azonos szöggel lépett tovább.'
    ],
    parts: ['Teljes szerkezet', 'Közös tengelyű kerekek', 'Horgony és három köve', 'Billegő és tárcsája'],
    partNotes: [
      'A számok a rajz alkatrészeit azonosítják. A két kerékszint egyetlen merev egységként forog; a billegőnek külön tengelye van.',
      '1: nagyobb kerék, a zárás és a közvetlen impulzus számára. 2: kisebb kerék, a horgony impulzusához. Egy tengely, két feladatkör.',
      '3: horgony. A és B: zárókövek. C: külön impulzuskő. A villa oldáskor a billegőtől kap mozgást, közvetett impulzuskor energiát ad vissza neki.',
      '4: billegő és hajszálrugó. D: közvetlen impulzuskő a tárcsán. E: vezetőkő a villához. A kettő nem ugyanaz az alkatrész.'
    ],
    paths: {
      indirect: 'Hajtórugó → kerékrendszer → kisebb kerék → C → horgony → villa / E → billegő',
      direct: 'Hajtórugó → kerékrendszer → nagyobb kerék → D → billegő',
      none: 'Nincs fenntartó impulzus. A zárás visszatartja a kerékrendszert; a billegő és a hajszálrugó egymás között cserél energiát. Oldáskor ebből jut a horgony mozgatására is.'
    },
    compareTitle: 'Mi változik a svájci horgonyhoz képest?',
    compare: 'A svájci horgony-gátlómű mindkét irányban a horgonyon át ad impulzust, a fog végigcsúszik az impulzusfelületen. A Co-Axial különválasztja a zárást és az impulzust, és az egyik irányban közvetlen kapcsolatot használ. A rövid érintkezés nem jelent nulla súrlódást.',
    limits: 'Oktatómodell Daniels EP0018796 szabadalmának elve alapján. A fogalakok, érintkezési hézagok, mozgásszögek és fázisidők szemléltetők; nem gyártási geometria vagy ütközésszimuláció. A hajszálrugó jelképes. A színezett vonal energiautat jelöl, nem alkatrészt. A valós biztonsági tárcsa és határoló elemek nincsenek részletezve. 1× itt 12 másodperces oktatási ciklus, nem az óra valós sebessége.',
    noScript: 'Az animációhoz JavaScript szükséges. A kiinduló ábra és a cikk működésleírása enélkül is olvasható.',
  },
  en: {
    title: 'Two paths to the balance', intro: 'Follow one complete Co-Axial oscillation. Inspect the large wheel, the smaller impulse wheel and the lever separately.',
    workshop: 'Workshop / Co-Axial', schematic: 'Functional schematic, not to scale', play: 'Play', pause: 'Pause', reset: 'Reset', step: 'Next phase', speed: 'Playback',
    phaseLabel: 'Oscillation phases', partsLabel: 'Components', pathLabel: 'Energy path', wheelLabel: 'Escape wheel', balanceLabel: 'Balance', locked: 'Locked', released: 'Released',
    states: ['Exit-pallet lock', 'Unlocking through the fork', 'Indirect impulse', 'Locking and free arc', 'Return arc', 'Entry-pallet unlock', 'Direct impulse', 'Locked again'],
    descriptions: [
      'The mainspring loads the train, but the exit pallet arrests the escape wheel. The balance approaches the engagement region.',
      'The roller pin enters the fork and moves the lever. The locking pallet withdraws from the tooth. The balance supplies the unlocking motion.',
      'The small wheel pushes the separate impulse jewel on the lever. The lever delivers energy to the balance through its fork and the roller pin.',
      'The entry pallet catches the next tooth. Impulse ends; the balance leaves the fork, continues its free arc and is turned back by the hairspring.',
      'The balance returns from the opposite direction. Meanwhile, the escape wheel has remained stationary, held against the mainspring by the lock.',
      'The roller pin moves the other side of the fork. The lever unlocks again, this time preparing the direct impulse path.',
      'A tooth on the large wheel pushes the impulse jewel on the balance roller directly. Energy reaches the balance without passing through the lever.',
      'The exit pallet catches a tooth again. The balance completes its free arc and reverses. Both wheel levels have advanced together by the same angle.'
    ],
    parts: ['Complete assembly', 'Coaxial wheels', 'Lever and its three jewels', 'Balance and roller'],
    partNotes: [
      'Numbers identify the components. Both wheel levels rotate as one rigid assembly; the balance has its own, separate axis.',
      '1: large wheel, for locking and direct impulse. 2: small wheel, for impulse to the lever. One axis, two sets of functions.',
      '3: lever. A and B: locking pallets. C: separate impulse jewel. At unlocking the fork takes motion from the balance; during indirect impulse it returns energy.',
      '4: balance and hairspring. D: direct impulse jewel on the roller. E: roller pin engaging the fork. These are separate components.'
    ],
    paths: {
      indirect: 'Mainspring → train → small wheel → C → lever → fork / E → balance',
      direct: 'Mainspring → train → large wheel → D → balance',
      none: 'No maintaining impulse. Locking restrains the train while the balance and hairspring exchange energy. Unlocking also draws energy from the oscillator to move the lever.'
    },
    compareTitle: 'What changes from the Swiss lever?',
    compare: 'A Swiss lever delivers both impulses through the lever as a tooth slides along an impulse face. The Co-Axial separates locking from impulse and uses direct transmission in one direction. Short contact does not mean zero friction.',
    limits: 'Teaching model based on the principle of Daniels patent EP0018796. Tooth profiles, clearances, angles and phase durations are illustrative, not manufacturing geometry or a contact simulation. The hairspring is symbolic. Coloured lines indicate energy paths, not components. Safety roller and banking details are omitted. Here 1× means a 12-second teaching cycle, not the real running speed of a watch.',
    noScript: 'Animation requires JavaScript. The initial drawing and the article explanation remain available without it.',
  },
} as const;

export const RATTRAPANTE_MODEL = {
  hu: {
    title: 'Két befutó, egy stopper', workshop: 'Műhely',
    intro: 'Állítsd meg az egyik mutatót, miközben a másik tovább méri az időt. A számlap mellett azt is látod, mi tartja helyben a részidőt.',
    dial: 'Amit leolvasol', mechanism: 'Ami mögötte történik', schematic: 'ELVI RAJZ',
    main: 'Kronográf', splitHand: 'Utolérő mutató', cam: 'Szívbütyök és követőkar', clamp: 'Kétoldali fék',
    total: 'Mért idő', retained: 'Utolérő mutató', gap: 'Különbség',
    start: 'Indítás', stop: 'Megállítás', resume: 'Folytatás', freeze: 'Részidő', catch: 'Utolérés', reset: 'Nullázás', step: '+1 másodperc', speed: 'Tempó', decimal: ',',
    ready: 'Indítsd el, vagy léptesd kézzel. A két mutató most egymás fölött áll.',
    following: 'A fék nyitva van. A követőkar a szívbütyökhöz támaszkodik, a két mutató együtt halad.',
    holding: 'A fék rögzíti az utolérő kereket, az izolátor elemelte a követőkart. A kronográf tovább halad.',
    stoppedHeld: 'Mindkét idő leolvasható. Az Utolérés elengedi a féket, és újra egymás fölé viszi a mutatókat.',
    stopped: 'A mérés szünetel. Folytathatod, kézzel léptetheted vagy nullázhatod.',
    end: 'A 60 másodperces bemutató véget ért. Nullázással újrakezdheted. Ez a modell időkerete, nem a valódi kronográfé.',
    example: 'Példa betöltése: 12 és 18 másodperc',
    exampleNote: 'Az első befutó 12 másodpercnél ér célba, a második 18-nál. A különbség 6 másodperc. Az Utolérés gombbal engedd össze a mutatókat, majd indíts új mérést.',
    how: 'Mit jelentenek a mozgó alkatrészek?',
    explainFollow: 'A belső szívbütyök a kronográffal együtt forog. A rugóval terhelt követőkar közvetíti a mozgását az utolérő keréknek.',
    explainHold: 'Részidőnél a külső fékpofák megfogják az utolérő kereket. A követőkar elemelkedik a tovább forgó bütyöktől: ezt teszi lehetővé az izolátor.',
    explainCatch: 'Utoléréskor a fék nyit, a követőkar visszaül a bütyökre, a mutatók ismét fedik egymást. A valódi visszazárás gyors; itt az új helyzetét mutatjuk.',
    limits: 'Oktatási modell egyetlen másodperces mutatópárral. Nem az L001.1 méretarányos másolata: a percszámláló, a flyback, az oszlopkerék és az izolátor vezérlőelemei nincsenek kirajzolva. A bütyökprofil és a karok mozgása szemléltető. Nem mér súrlódást vagy járáspontosságot. Nincs automatikus lejátszás; kézzel is léptethető.',
    noScript: 'A modell kezeléséhez JavaScript szükséges. A működés magyarázata a cikkben és a fenti alkatrészleírásban is olvasható.',
  },
  en: {
    title: 'Two finishers, one stopwatch', workshop: 'Workshop',
    intro: 'Hold one hand while the other keeps timing. Beside the dial, see the mechanism that retains the intermediate time.',
    dial: 'What you read', mechanism: 'What happens inside', schematic: 'SCHEMATIC',
    main: 'Chronograph', splitHand: 'Split-seconds hand', cam: 'Heart cam and follower', clamp: 'Two-sided brake',
    total: 'Elapsed time', retained: 'Split hand', gap: 'Difference',
    start: 'Start', stop: 'Stop', resume: 'Resume', freeze: 'Split', catch: 'Catch up', reset: 'Reset', step: '+1 second', speed: 'Speed', decimal: '.',
    ready: 'Start the timer or advance it by hand. Both hands are aligned.',
    following: 'The clamp is open. The follower rests against the heart cam and both hands move together.',
    holding: 'The clamp holds the split wheel and the isolator has lifted the follower. The chronograph keeps running.',
    stoppedHeld: 'Both times can be read. Catch up releases the clamp and aligns the hands again.',
    stopped: 'Timing is paused. Resume, advance by hand, or reset.',
    end: 'The 60-second demonstration has ended. Reset to begin again. This is the model’s limit, not the real chronograph’s.',
    example: 'Load example: 12 and 18 seconds',
    exampleNote: 'The first finisher arrives at 12 seconds, the second at 18. The difference is 6 seconds. Use Catch up to align the hands, then start a new measurement.',
    how: 'What do the moving parts represent?',
    explainFollow: 'The inner heart cam turns with the chronograph. A spring-loaded follower transmits its motion to the split-seconds wheel.',
    explainHold: 'For a split reading, the outer jaws grip the split wheel. The follower lifts away from the still-rotating cam, illustrating the isolator’s function.',
    explainCatch: 'On release, the clamp opens and the follower returns to the cam, aligning the hands. Real rejoining is rapid; this model shows the resulting position.',
    limits: 'An educational model with one pair of seconds hands, not a scale replica of L001.1. The minute counter, flyback, column wheel and isolator control parts are omitted. Cam profile and lever travel are illustrative. No friction or rate accuracy is simulated. No autoplay; manual stepping is available.',
    noScript: 'JavaScript is required to operate the model. The article and the component explanation above describe its operation in text.',
  },
} as const;

/* ============================================================
   LUME — kétnyelvűség egy helyen
   Minden felületi szöveg és minden útvonal-szelet itt él.
   Új nyelvi szöveg → ide, ne a sablonokba.
   ============================================================ */

export const LANGS = ['hu', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'hu';

export function modelPageUrl(lang: Lang, key: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) throw new Error('Invalid model key');
  return `${lang === 'hu' ? '/muhely/' : '/en/workshop/'}${key}/`;
}
export const SHARED_MODEL_UI = {
  hu: {
    eyebrow: 'Lume Műhely / Interaktív modell', pageLink: 'A modell saját oldala',
    share: 'Megosztás', copy: 'Link másolása', copied: 'A linket a vágólapra másoltuk.',
    failed: 'Használd a kézzel másolható linket: jelöld ki és másold ki az alábbi címet.',
    cancelled: 'A megosztást megszakítottad.', shared: 'A megosztófelület megnyílt.',
    linkLabel: 'A modell megosztható címe', fullStory: 'Értsd meg a működését',
    fullStoryNote: 'A részletes magyarázatot, a műszaki hátteret és a forrásokat a kapcsolódó cikkben találod.',
    allModels: 'További modellek a Műhelyben', note: 'Saját oktatási szemléltetés, nem egy konkrét kaliber teljes szimulációja.',
    jumpingTitle: 'Ugró másodperc', jumpingDescription: 'Hasonlítsd össze a folyamatos belső ritmust a másodpercenként lépő mutatóval. Lassíts, léptess, és figyeld meg a csillag és a kar kapcsolatát.',
    imageCredit: 'A megosztási előnézet képe',
  },
  en: {
    eyebrow: 'Lume Workshop / Interactive model', pageLink: 'Open the model page',
    share: 'Share', copy: 'Copy link', copied: 'Link copied to the clipboard.',
    failed: 'Use the manual alternative: select and copy the link below.',
    cancelled: 'Sharing cancelled.', shared: 'The sharing interface opened.',
    linkLabel: 'Shareable model address', fullStory: 'Understand how it works',
    fullStoryNote: 'Find the detailed explanation, technical background and sources in the accompanying article.',
    allModels: 'More models in the Workshop', note: 'An original educational illustration, not a complete simulation of a particular calibre.',
    jumpingTitle: 'Jumping seconds', jumpingDescription: 'Compare the continuous internal rhythm with a hand that advances once per second. Slow down, step through and explore the relationship between the star and flirt.',
    imageCredit: 'Share preview image',
  },
} as const;

// Shared bilingual copy for the approved inline model and offline article review.
export const JUMPING_SECONDS_MODEL = {
  hu: {
    title4: 'Belül nyolc lépés. Kívül egy.',
    title: 'Belül hat lépés. Kívül egy.', intro: 'Indítsd el, lassítsd le, vagy haladj egyetlen féllengésenként. A két mutató ugyanazt az időt mutatja, más ritmusban.',
    rhythm: 'A két ritmus', mechanism: 'Csillag és kar', balance: 'Billegő', ordinary: 'Hagyományos mutató', jumping: 'Ugró mutató',
    star: 'Ötágú csillag', flirt: 'Oldódó kar (flirt)', output: 'Másodpercmutató',
    balanceNote: 'A belső időalap tovább dolgozik.', ordinaryNote: 'Minden féllengésnél egy kis lépés.', jumpingNote: 'Egész másodpercenként egy osztás.',
    starNote: 'Egy fordulat öt másodperc alatt.', flirtNote: 'Oldásonként egy teljes fordulat.', outputNote: 'Az áttétel egy fordulatból egy osztást készít.',
    play: 'Indítás', pause: 'Szünet', step: 'Egy féllengés', reset: 'Elölről', speed: 'Lejátszás', slow: 'Négyszeres lassítás', real: 'Valós idő', frequency: 'Billegőfrekvencia',
    time: 'Modellidő', beats: 'Féllengés', jumps: 'Ugrás', scrub: 'Vizsgált időpont, 0 és 5 másodperc között',
    disclaimer: 'Saját működési szemléltetés, nem egy kaliber méretarányos rekonstrukciója. A csillag és a kar külön nézete a Lange leírását követi; az oldás mozdulatát a láthatóságért elnyújtottuk. A remontoirt, a teljes áttételt és az alkatrészek térbeli kapcsolódását ez a modell nem ábrázolja.',
    stopped: 'A modell megállt.', running: 'A modell elindult.', end: 'Az öt másodperces részlet véget ért.',
  },
  en: {
    title4: 'Eight steps inside. One outside.',
    title: 'Six steps inside. One outside.', intro: 'Play, slow down, or advance one half-oscillation at a time. Both hands display the same time with different rhythms.',
    rhythm: 'Two rhythms', mechanism: 'Star and flirt', balance: 'Balance', ordinary: 'Conventional hand', jumping: 'Jumping hand',
    star: 'Five-pointed star', flirt: 'Released lever (flirt)', output: 'Seconds hand',
    balanceNote: 'The internal timebase keeps working.', ordinaryNote: 'One small step per half-oscillation.', jumpingNote: 'One marker per whole second.',
    starNote: 'One revolution in five seconds.', flirtNote: 'One full turn per release.', outputNote: 'Gearing converts one revolution into one marker.',
    play: 'Play', pause: 'Pause', step: 'One half-oscillation', reset: 'Reset', speed: 'Playback', slow: 'Quarter speed', real: 'Real time', frequency: 'Balance frequency',
    time: 'Model time', beats: 'Half-oscillations', jumps: 'Jumps', scrub: 'Inspection time, between 0 and 5 seconds',
    disclaimer: 'An original functional illustration, not a scale reconstruction of a calibre. The separate star-and-flirt view follows Lange’s description; the release motion is extended for visibility. The remontoir, complete gearing and physical arrangement of components are not represented.',
    stopped: 'Model paused.', running: 'Model playing.', end: 'The five-second sequence has ended.',
  },
} as const;

/* Isolated, development-only design study. No live layout uses this copy. */
export const JOURNAL_META = {
  hu: {
    aboutTitle: 'A Lume órás naplóról',
    aboutDescription: 'A Lume kétnyelvű órás napló microbrandekről, óratörténetről és szerkezetekről, heti három forrásokra épülő történettel.',
    notFoundDescription: 'Ez az oldal nincs meg.',
  },
  en: {
    aboutTitle: 'About Lume Watch Journal',
    aboutDescription: 'Lume is a bilingual watch journal about microbrands, watch history and movements, publishing three carefully sourced stories every week.',
    notFoundDescription: "This page doesn't exist.",
  },
} as const;

export const DESIGN_STUDY = {
  hu: {
    localTime: 'Helyi idő', clockBrand: 'LUME', clockSignature: 'EST. MMXXVI',
    previewNote: 'Új Lume · előnézet', about: 'A naplóról', all: 'Minden rovat', newest: 'Legújabb elöl', oldest: 'Legrégebbi elöl', shortest: 'Rövidebb írások elöl', sort: 'Sorrend', reset: 'Szűrés törlése', results: '{n} írás', empty: 'Itt most nincs ilyen írás.', emptyHint: 'Próbálj másik kifejezést, vagy nézd meg az összes rovatot.',
    imageMissing: 'A kép most nem tölthető be.', imageRetry: 'Újrapróbálom', enlarge: 'Kép megnyitása nagy nézetben', nextStories: 'Innen érdemes továbbindulni.', relatedNote: 'Kapcsolódó történetek a naplóból.', copy: 'Hivatkozás másolása', copied: 'Hivatkozás másolva', copyFailed: 'Nem sikerült másolni. A címsorból kimásolhatod a hivatkozást.', updated: 'Frissítve', backTop: 'A lap tetejére',
    archiveLead: 'Egyre több történet. Mindegyikhez vezet egy út.', columnLeads: { 'in-hand': 'Kis műhelyek, nagy figyelem a részletekre.', origins: 'Az órák mögött mindig ott van valaki.', movement: 'Amit a számlap eltakar, itt láthatóvá válik.' },
    aboutTitle: 'Órákra fordított idő.', aboutLead: 'A Lume egy tanulásból születő napló. Arról, amit egy órán elsőre nem veszünk észre.', aboutBody: ['Nem újságíróként írom, hanem tanulóként. A cél a saját tudásom bővítése: mit csinál egy kis független műhely, honnan jött valójában egy régi ház, és hogyan működik a mechanika a számlap alatt. Ami közben összeáll, azt itt leírom, hogy másnak is olvasható legyen.', 'Hetente három írás jelenik meg: hétfőn Kézben, szerdán Eredet, pénteken Szerkezet. A tárgy érdekel, nem a hírciklus. A megjelenési naptár külön segít követni a hivatalosan bejelentett újdonságokat.', 'Ha egy állítás mögött nem áll ellenőrizhető forrás, akkor vagy odaírom, hogy bizonytalan, vagy nem kerül bele. A cikkek végén ott vannak a felhasznált források. A képek mellett pedig az, hogy kitől származnak.', 'A napló magyarul és angolul olvasható. Ugyanazok a történetek, ugyanazzal a kíváncsisággal.'], follow: 'Új írások, a saját olvasódban.', rssNote: 'Az RSS-sel regisztráció nélkül követheted a naplót.',
    notFoundTitle: 'Ezt az oldalt nem találtuk.', notFoundText: 'Lehet, hogy megváltozott a címe, vagy hiba csúszott a hivatkozásba. A történethez más út is vezethet.', notFoundLink: 'Vissza a nyitóoldalra', notFoundNav: 'Keress, vagy válassz egy rovatot.', notFoundPreview: '404 oldal előnézete',
    modelHint: 'A modell csak az elindítás után töltődik be.', modelStandalone: 'Megnyitás külön oldalon', sourceNotes: 'Források és ellenőrzés', calendarLead: 'Mi érkezik. Mi mutatkozott be. Mire várunk még.', weekDays: ['Hétfő', 'Szerda', 'Péntek'],
    title: 'Lume · Új nézőpont', label: 'Designpróba 01', home: 'Nyitóoldal', reader: 'Olvasófelület', current: 'Jelenlegi oldal',
    magazine: 'Független órás folyóirat', motto: 'Órák. Közelről.', nav: 'Tájékozódás', skip: 'Ugrás a tartalomhoz',
    search: 'Keresés a cikkekben', searchHint: 'Márka, modell vagy történet', searchEmpty: 'Erre most nincs találat.', close: 'Bezárás',
    off: 'Lámpa le', on: 'Lámpa fel', feature: 'A szerkesztő asztalán', featureTop: 'Tíz másodperc.', featureBottom: 'Egy saját világ.',
    featureText: 'Egy New York-i kávézó, egy tervező és az a rövid szünet, amiből megszületett a Brew.',
    read: 'Elolvasom a történetet', closeLook: 'Nézd meg közelről', photo: 'Fotó', brewAlt: 'A Brew Metric acéltokja és színes számlapja csuklón, közelről',
    selection: 'Három nézőpont', selectionText: 'A tárgy. Az ember. Ami belül történik.', archive: 'Minden írás',
    atelierAlt: 'Az Atelier Wen Perception számlapjának részlete', rolexAlt: 'Az arany Rolex Day-Date zöld számlappal', rotorAlt: 'A Grand Seiko szerkezete és rotorja közelről',
    workshop: 'A számlap mögött', workshopTitle: 'A mozdulatból\nenergia lesz.', workshopText: 'Mit csinál az a félkör az óra hátlapja mögött? Kövesd végig a rotor útját a csuklótól a főrugóig.', workshopLink: 'Megértem a rotort',
    browse: 'Merre indulnál?', browseText: 'Nem kell tudnod a referenciaszámot.',
    routes: [{label: 'Egy jó órát keresek',note: 'Kis műhelyek, saját elképzelések.',column:'in-hand'}, {label: 'A történet érdekel',note: 'Emberek és tárgyak a nevek mögött.',column:'origins'}, {label: 'Érteni szeretném',note: 'A szerkezet, részenként.',column:'movement'}],
    footer: 'Az órákra időt kell hagyni.', footerText: 'Történetek, tárgyak és az öröm, amikor végre megérted, hogyan működik.',
    instagram: 'Instagram', instagramLabel: 'Lume az Instagramon',
    contents: 'Ebben az írásban', font: 'Betűméret', standard: 'Normál', larger: 'Nagyobb', back: 'Vissza a válogatáshoz', original: 'A cikk a jelenlegi oldalon', sources: 'Források', written: 'Szöveg: Lume',
    imageViewer: 'Kép nagy nézetben', imageHelp: 'Részletek, közelről.', minutes: 'perc', appearance: 'Megjelenés',
    progress: 'Olvasási haladás', noResults: 'Nincs találat', calendar: 'Megjelenési naptár', workshopNav: 'Műhely',
  },
  en: {
    localTime: 'Local time', clockBrand: 'LUME', clockSignature: 'EST. MMXXVI',
    previewNote: 'New Lume · preview', about: 'About the journal', all: 'All sections', newest: 'Newest first', oldest: 'Oldest first', shortest: 'Shorter reads first', sort: 'Sort by', reset: 'Clear filters', results: '{n} stories', empty: 'No stories match just yet.', emptyHint: 'Try another phrase, or explore every section.',
    imageMissing: 'This image could not be loaded.', imageRetry: 'Try again', enlarge: 'Open the photograph in a larger view', nextStories: 'A little further down the path.', relatedNote: 'Related stories from the journal.', copy: 'Copy link', copied: 'Link copied', copyFailed: 'Could not copy. You can copy the link from the address bar.', updated: 'Updated', backTop: 'Back to top',
    archiveLead: 'A growing collection of stories. A way into every one.', columnLeads: { 'in-hand': 'Small makers. An eye for the details.', origins: 'There is always someone behind the watch.', movement: 'A closer look at what the dial keeps hidden.' },
    aboutTitle: 'Time spent with watches.', aboutLead: 'Lume is a journal born out of learning. About what we miss when we first look at a watch.', aboutBody: ['I write as a student, not as a journalist. The point is to widen my own knowledge: what a small independent maker does, where an old house came from, and how the mechanics under the dial work. Whatever comes together gets written down here, so it becomes legible to someone else too.', 'Three pieces a week: In Hand on Monday, Origins on Wednesday, Movement on Friday. The object is the subject, not the news cycle. The release calendar separately follows officially announced watches.', 'If a claim has no verifiable source, I either mark it as uncertain or leave it out. Sources are listed at the end of every piece. Photographs carry their own credits.', 'The journal is available in Hungarian and English. The same stories, and the same curiosity.'], follow: 'New stories, in your own reader.', rssNote: 'Follow the journal through RSS, without an account.',
    notFoundTitle: 'We could not find this page.', notFoundText: 'Its address may have changed, or the link may contain a typo. There might be another way to the story.', notFoundLink: 'Back to the front page', notFoundNav: 'Search, or choose a section.', notFoundPreview: '404 page preview',
    modelHint: 'The model loads only when you start it.', modelStandalone: 'Open on a separate page', sourceNotes: 'Sources and checks', calendarLead: 'What is coming. What is new. What we are waiting for.', weekDays: ['Monday', 'Wednesday', 'Friday'],
    title: 'Lume · A closer look', label: 'Design study 01', home: 'Front page', reader: 'Reading view', current: 'Current site',
    magazine: 'An independent watch journal', motto: 'Watches. Up close.', nav: 'Explore', skip: 'Skip to content',
    search: 'Search the journal', searchHint: 'A brand, a watch, a story', searchEmpty: 'No matching stories yet.', close: 'Close',
    off: 'Lights off', on: 'Lights on', feature: 'On the editor’s desk', featureTop: 'Ten seconds.', featureBottom: 'A world of its own.',
    featureText: 'A New York café, a designer, and the small pause that became Brew.',
    read: 'Read the story', closeLook: 'Take a closer look', photo: 'Photo', brewAlt: 'A close view of the Brew Metric steel case and colourful dial on the wrist',
    selection: 'Three perspectives', selectionText: 'The object. The person. What happens inside.', archive: 'All stories',
    atelierAlt: 'A close view of the Atelier Wen Perception dial', rolexAlt: 'The gold Rolex Day-Date with a green dial', rotorAlt: 'A close view of the Grand Seiko movement and rotor',
    workshop: 'Behind the dial', workshopTitle: 'Movement becomes\nenergy.', workshopText: 'What does that semicircle behind the caseback do? Follow the rotor’s path from your wrist to the mainspring.', workshopLink: 'Understand the rotor',
    browse: 'Where shall we start?', browseText: 'You don’t need a reference number.',
    routes: [{label:'Find a watch',note:'Small makers with their own ideas.',column:'in-hand'}, {label:'Discover a story',note:'People and objects behind the names.',column:'origins'}, {label:'Understand the mechanics',note:'A movement, piece by piece.',column:'movement'}],
    footer: 'Give watches a little time.', footerText: 'Stories, objects, and the pleasure of finally understanding how something works.',
    instagram: 'Instagram', instagramLabel: 'Lume on Instagram',
    contents: 'In this story', font: 'Text size', standard: 'Standard', larger: 'Larger', back: 'Back to the selection', original: 'Read on the current site', sources: 'Sources', written: 'Words: Lume',
    imageViewer: 'Full-size image', imageHelp: 'Take a closer look.', minutes: 'min', appearance: 'Appearance',
    progress: 'Reading progress', noResults: 'No results', calendar: 'Release calendar', workshopNav: 'Workshop',
  },
} as const;

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
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Budapest',
    }).format(date).replaceAll('-', '.');
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Budapest',
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
    title: 'Tudd, mire érdemes várni.',
    lede:
      'Megjelenések, rövid rendelési ablakok és várható szállítások, hivatalos forrásból válogatva. Nézd meg, mi aktuális, és mentsd el azt, amiről nem szeretnél lemaradni.',
    overview: 'Áttekintés',
    introduced: 'Friss, 14 nap',
    announced: 'Bejelentve, dátumra vár',
    statusIntroduced: 'Már bemutatva',
    statusToday: 'A megadott időszakban',
    dayPrecision: 'Napra pontos dátum',
    undated: 'Nincs megjelenési dátum',
    unknownEdition: 'Nincs megadott darabszám',
    undatedNote: 'Nincs igazolt megjelenési nap, ezért nincs naptárletöltés.',
    overviewHelp: 'Az aktuális nézet a még érvényes időszakokat és a közelgő eseményeket mutatja. A lejárt terv nem igazolja a megjelenést. Egy órához több külön esemény is tartozhat.',
    viewReview: 'Ellenőrzésre vár', statusReview: 'Ellenőrzésre vár', statusCancelled: 'Visszavonva',
    focusGroup: '{n} esemény átfedő időszakban', focusGroupDates: 'A pontos sorrend nem ismert.',
    emptyHelp: 'Nézd meg a dátumra váró vagy a korábbi eseményeket a fenti nézetekben.',
    estimated: 'becsült', qualifier_late: 'hónap vége', qualifier_early: 'hónap eleje', qualifier_mid: 'hónap közepe',
    historyTitle: 'Dátumváltozások', originalPlan: 'Korábbi terv', sourceClaim: 'Elfogadott gyártói közlés',
    icsUncertain: 'Ez egy tervezett időablak, nem igazolt megjelenési nap. A letöltött fájl nem frissül automatikusan.',
    icsPlanned: 'Tervezett esemény. A letöltött fájl nem frissül automatikusan.',
    'event_presentation': 'Bemutató', 'event_sales': 'Értékesítés kezdete', 'event_preorder-open': 'Előrendelés nyitása', 'event_preorder-close': 'Előrendelés zárása', 'event_shipping': 'Kiszállítás kezdete', 'event_restock': 'Új készlet / rendelési kör', 'event_order-window': 'Rendelési időszak',
    'completed_presentation': 'Bemutatva', 'completed_sales': 'Értékesítés elindult', 'completed_preorder-open': 'Előrendelés megnyílt', 'completed_preorder-close': 'Előrendelés lezárult', 'completed_shipping': 'Kiszállítás elindult', 'completed_restock': 'Új kör megnyílt', 'completed_order-window': 'Rendelési időszak igazolva',
    viewActive: 'Aktuális', viewRecent: 'Friss, 14 nap', viewAnnounced: 'Dátumra vár', viewArchive: 'Korábbiak',
    statusStale: 'Újraellenőrzésre vár', statusCompleted: 'Igazoltan lezárult', statusOldAnnouncement: 'Korábbi bemutató',
    statusOrderWindow: 'Előrendelési időszak', statusDeliveryWindow: 'Várható szállítási időszak',
    sourceAging: 'A forrás újbóli ellenőrzést igényel. Az aktuális elérhetőséget nézd meg a gyártónál.',
    eventLaunch: 'Megjelenés', eventPreorder: 'Előrendelés', eventDelivery: 'Szállítás',
    focusEmpty: 'Most nincs ellenőrzött közelgő esemény.', focusOpen: 'Megnézem a részleteket',
    firstSeenLabel: 'Nálunk felvéve', archiveHelp: 'A korábbi tervek és az igazolt események megmaradnak. A lejárt terv nem bizonyítja a megjelenést.',
    noScript: 'JavaScript nélkül az összes rögzített bejegyzés látható, az oldal készítésekor számolt állapottal. A szűrők és az élő dátumfrissítés JavaScriptet igényelnek.',
    statusLabel: 'Állapot', monthLabel: 'Hónap', brandLabel: 'Márka', searchLabel: 'Márka vagy modell keresése',
    resetFilters: 'Szűrők törlése',
    noBrandResults: 'Ehhez a márkához még nincs megfelelő ellenőrzött bejegyzés. Ez nem jelenti azt, hogy nincs újdonsága.',
    radarCount: (n: number) => `${n} aktuális esemény`,
    radarSources: (n: number) => `${n} hivatalos forrás`,
    clientDaysMany: '{n} nap múlva', clientResultsOne: '1 esemény', clientResultsMany: '{n} esemény',
    clientRadarOne: '1 aktuális esemény', clientRadarMany: '{n} aktuális esemény',
    icsLaunch: 'Várható megjelenés', icsPreorder: 'Előrendelési időszak', icsDelivery: 'Várható szállítás',
    curated: 'Válogatott, nem teljes lista',
    verified: 'Forrás ellenőrizve',
    upcomingCount: (n: number) => `${n} közelgő megjelenés`,
    next: 'Most erre figyelj',
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
    archivedStatuses: 'Korábbi események',
    noResults: 'Nincs a szűrésnek megfelelő megjelenés.',
    results: (n: number) => `${n} esemény`,
    statusUpcoming: 'Közeleg',
    statusCurrent: 'A megadott időszakra jelezve',
    statusArchived: 'Lejárt terv, teljesülése nem igazolt',
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
      'A napi gépi figyelő találataiból ellenőrzés és szerkesztői válogatás után lesz új kártya. A számok az aktuális és közelgő eseményeket jelzik, nem a teljes kínálatot. A forrásletöltés nem teljes szerkesztői ellenőrzés.',
    radarMajor: 'Nagy gyártók',
    radarIndependent: 'Microbrandek és függetlenek',
    radarActive: 'Van aktív bejegyzés',
    radarWatched: 'Nincs aktuális naptári esemény',
    radarOfficial: 'Hivatalos oldal',
    radarLastChecked: (date: string) => `Utolsó rögzített radaráttekintés: ${date}`,
    radarTargetedChecked: (date: string) => `Célzott frissítés: ${date}. A forráslefedettség részleges; a nem bejelentett terveket nem találgatjuk.`,
  },
  en: {
    nav: 'Calendar',
    seoTitle: 'Watch Release Calendar: The Lume Selection',
    seoDescription:
      'A curated list of upcoming watch releases verified against official sources, with automatic status updates and downloadable calendar entries.',
    eyebrow: 'Lume Calendar · selected releases',
    title: 'Know what is worth waiting for.',
    lede:
      'Releases, short order windows and expected shipping dates, selected from official sources. See what is relevant now and save the dates you do not want to miss.',
    overview: 'Overview',
    introduced: 'Recent, 14 days',
    announced: 'Announced, awaiting a date',
    statusIntroduced: 'Already introduced',
    statusToday: 'Within the stated window',
    dayPrecision: 'Day-level date',
    undated: 'No release date',
    unknownEdition: 'Quantity not specified',
    undatedNote: 'No verified release day, so no calendar download.',
    overviewHelp: 'Current shows unexpired windows and upcoming events. An expired plan does not prove a release. One watch can have several distinct events.',
    viewReview: 'Needs review', statusReview: 'Needs review', statusCancelled: 'Cancelled',
    focusGroup: '{n} events in overlapping windows', focusGroupDates: 'Their exact order is not known.',
    emptyHelp: 'Explore awaiting dates or earlier events using the views above.',
    estimated: 'estimated', qualifier_late: 'late in the month', qualifier_early: 'early in the month', qualifier_mid: 'mid-month',
    historyTitle: 'Date history', originalPlan: 'Previous plan', sourceClaim: 'Accepted official statement',
    icsUncertain: 'This is a planned window, not a confirmed release day. The downloaded file does not update automatically.',
    icsPlanned: 'Planned event. The downloaded file does not update automatically.',
    'event_presentation': 'Presentation', 'event_sales': 'Sales opening', 'event_preorder-open': 'Preorder opening', 'event_preorder-close': 'Preorder closing', 'event_shipping': 'Shipping start', 'event_restock': 'Restock / new round', 'event_order-window': 'Ordering window',
    'completed_presentation': 'Introduced', 'completed_sales': 'Sales opened', 'completed_preorder-open': 'Preorders opened', 'completed_preorder-close': 'Preorders closed', 'completed_shipping': 'Shipping started', 'completed_restock': 'New round opened', 'completed_order-window': 'Ordering window confirmed',
    viewActive: 'Current', viewRecent: 'Recent, 14 days', viewAnnounced: 'Awaiting dates', viewArchive: 'Earlier',
    statusStale: 'Needs another review', statusCompleted: 'Confirmed completed', statusOldAnnouncement: 'Earlier introduction',
    statusOrderWindow: 'Preorder window', statusDeliveryWindow: 'Expected shipping window',
    sourceAging: 'This source needs another review. Check the maker for current availability.',
    eventLaunch: 'Release', eventPreorder: 'Preorder', eventDelivery: 'Shipping',
    focusEmpty: 'No verified upcoming event right now.', focusOpen: 'View the details',
    firstSeenLabel: 'Added here', archiveHelp: 'Past plans and confirmed events remain available. An expired plan does not prove occurrence.',
    noScript: 'Without JavaScript, all recorded entries are shown with their build-time status. Filters and live date updates require JavaScript.',
    statusLabel: 'Status', monthLabel: 'Month', brandLabel: 'Brand', searchLabel: 'Search brand or model',
    resetFilters: 'Clear filters',
    noBrandResults: 'We do not yet have a matching verified entry for this brand. This does not mean it has no new watches.',
    radarCount: (n: number) => `${n} current ${n === 1 ? 'event' : 'events'}`,
    radarSources: (n: number) => `${n} official ${n === 1 ? 'source' : 'sources'}`,
    clientDaysMany: 'in {n} days', clientResultsOne: '1 event', clientResultsMany: '{n} events',
    clientRadarOne: '1 current event', clientRadarMany: '{n} current events',
    icsLaunch: 'Expected release', icsPreorder: 'Preorder window', icsDelivery: 'Expected shipping',
    curated: 'Curated, not exhaustive',
    verified: 'Source checked',
    upcomingCount: (n: number) => `${n} upcoming ${n === 1 ? 'release' : 'releases'}`,
    next: 'Worth watching now',
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
    archivedStatuses: 'Earlier events',
    noResults: 'No releases match these filters.',
    results: (n: number) => `${n} ${n === 1 ? 'event' : 'events'}`,
    statusUpcoming: 'Upcoming',
    statusCurrent: 'Within the stated window',
    statusArchived: 'Planned window ended; occurrence unconfirmed',
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
      'Daily automated discoveries become new cards after verification and editorial selection. Counts show current and upcoming events, not the full range. Fetching a source is not a full editorial review.',
    radarMajor: 'Major makers',
    radarIndependent: 'Microbrands and independents',
    radarActive: 'Active entry',
    radarWatched: 'No current calendar event',
    radarOfficial: 'Official site',
    radarLastChecked: (date: string) => `Last recorded radar review: ${date}`,
    radarTargetedChecked: (date: string) => `Targeted update: ${date}. Source coverage is partial; unannounced plans are not inferred.`,
  },
} as const;
