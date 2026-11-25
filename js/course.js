/*
 * Treść kursu: włoski dla Polaków (poziom A1).
 *
 * Format słowa:   [włoski, polski, notatka?]
 *   - warianty poprawnej odpowiedzi oddzielamy ukośnikiem: "dzisiaj/dziś"
 *   - pierwszy wariant jest pokazywany jako „główny”
 * Format zdania:  [włoski, polski]
 *   - zdania służą do układania z kafelków (PL → IT) i do wyboru tłumaczenia
 */
const COURSE_RAW = [
  {
    title: 'Pierwsze kroki', icon: '👋', color: '#2e9e5b',
    tip: `
      <p>Włoski czyta się prawie tak, jak się pisze. Kilka zasad na start:</p>
      <table>
        <tr><td><b>c</b> + e/i</td><td>jak „cz”</td><td><i>ciao</i> → „czao”</td></tr>
        <tr><td><b>ch</b></td><td>jak „k”</td><td><i>che</i> → „ke”</td></tr>
        <tr><td><b>gn</b></td><td>jak „ń”</td><td><i>signora</i> → „sińora”</td></tr>
        <tr><td><b>gl</b> + i</td><td>jak „li”</td><td><i>famiglia</i> → „familia”</td></tr>
        <tr><td><b>sc</b> + e/i</td><td>jak „sz”</td><td><i>scusi</i> → „skuzi”, ale <i>pesce</i> → „pesze”</td></tr>
      </table>
      <p><b>Akcent ma znaczenie!</b> <i>e</i> = „i”, a <i>è</i> = „jest”.</p>
      <p><i>Scusi</i> mówisz do obcych (forma grzecznościowa), <i>scusa</i> – do znajomych.</p>`,
    lessons: [
      { title: 'Powitania',
        words: [
          ['ciao', 'cześć', 'na powitanie i na pożegnanie'],
          ['buongiorno', 'dzień dobry'],
          ['buonasera', 'dobry wieczór'],
          ['arrivederci', 'do widzenia'],
          ['sì', 'tak'],
          ['no', 'nie'],
        ],
        sentences: [
          ['Ciao, Marco!', 'Cześć, Marco!'],
          ['Buongiorno, signora!', 'Dzień dobry pani!'],
          ['Buonasera, signore!', 'Dobry wieczór panu!'],
        ] },
      { title: 'Grzeczności',
        words: [
          ['grazie', 'dziękuję'],
          ['prego', 'proszę/nie ma za co', 'odpowiedź na „grazie”'],
          ['per favore', 'proszę', 'gdy o coś prosisz'],
          ['scusi', 'przepraszam', 'forma grzecznościowa (do obcych)'],
          ['scusa', 'przepraszam', 'do znajomych'],
          ['buonanotte', 'dobranoc'],
        ],
        sentences: [
          ['Grazie mille!', 'Dziękuję bardzo!'],
          ['Arrivederci e grazie!', 'Do widzenia i dziękuję!'],
          ['Buonanotte, Marco!', 'Dobranoc, Marco!'],
          ['Scusi, signora!', 'Przepraszam panią!'],
        ] },
      { title: 'Jak się masz?',
        words: [
          ['come stai?', 'jak się masz?'],
          ['bene', 'dobrze'],
          ['male', 'źle'],
          ['molto', 'bardzo/dużo'],
          ['e tu?', 'a ty?'],
          ['anche', 'też/także'],
        ],
        sentences: [
          ['Sto bene, grazie.', 'Mam się dobrze, dziękuję.'],
          ['Molto bene, e tu?', 'Bardzo dobrze, a ty?'],
          ['Anche io sto bene.', 'Ja też mam się dobrze.'],
          ['Non molto bene.', 'Niezbyt dobrze.'],
        ] },
    ],
  },
  {
    title: 'O mnie', icon: '🙋', color: '#1e88b6',
    tip: `
      <p>Narodowość ma formę męską i żeńską:</p>
      <table>
        <tr><td>on</td><td><i>polacco</i></td><td><i>italiano</i></td></tr>
        <tr><td>ona</td><td><i>polacca</i></td><td><i>italiana</i></td></tr>
      </table>
      <p>Zaimek <i>io</i> (ja) zwykle się pomija, tak jak w polskim: <i>sono Marco</i> = „jestem Marco”.</p>
      <p><b>Uwaga:</b> „mówię po włosku” = <i>parlo italiano</i> (bez przyimka).</p>`,
    lessons: [
      { title: 'Przedstawianie się',
        words: [
          ['mi chiamo', 'nazywam się/mam na imię'],
          ['come ti chiami?', 'jak się nazywasz?/jak masz na imię?'],
          ['piacere', 'miło mi'],
          ['io', 'ja'],
          ['tu', 'ty'],
          ['sono', 'jestem'],
        ],
        sentences: [
          ['Mi chiamo Anna.', 'Nazywam się Anna.'],
          ['Piacere, io sono Marco.', 'Miło mi, jestem Marco.'],
          ['Ciao, sono Luca.', 'Cześć, jestem Luca.'],
        ] },
      { title: 'Skąd jesteś?',
        words: [
          ['di dove sei?', 'skąd jesteś?'],
          ['sono di', 'jestem z'],
          ['polacco', 'Polak/polski'],
          ['polacca', 'Polka/polska'],
          ['italiano', 'Włoch/włoski'],
          ['italiana', 'Włoszka/włoska'],
          ['la Polonia', 'Polska'],
          ["l'Italia", 'Włochy'],
        ],
        sentences: [
          ['Sono polacco.', 'Jestem Polakiem.'],
          ['Sono di Varsavia.', 'Jestem z Warszawy.'],
          ['Marco è italiano.', 'Marco jest Włochem.'],
          ['Anna è polacca.', 'Anna jest Polką.'],
        ] },
      { title: 'Mieszkam i mówię',
        words: [
          ['abito a', 'mieszkam w'],
          ['parlo', 'mówię'],
          ['non', 'nie', 'stoi przed czasownikiem: non parlo'],
          ['un po\'', 'trochę'],
          ["l'italiano", 'włoski/język włoski'],
          ['il polacco', 'polski/język polski'],
        ],
        sentences: [
          ['Abito a Cracovia.', 'Mieszkam w Krakowie.'],
          ["Parlo un po' di italiano.", 'Mówię trochę po włosku.'],
          ['Parli polacco?', 'Mówisz po polsku?'],
          ['Non parlo italiano.', 'Nie mówię po włosku.'],
        ] },
    ],
  },
  {
    title: 'Liczby', icon: '🔢', color: '#8e5bd0',
    tip: `
      <p>Liczby 11–16 kończą się na <i>-dici</i>: <i>undici, dodici, tredici…</i></p>
      <p>Od 17 jest odwrotnie: <i>diciassette, diciotto, diciannove</i>.</p>
      <p>Wiek wyrażamy czasownikiem „mieć”: <i>Ho venti anni</i> = „Mam dwadzieścia lat”.</p>`,
    lessons: [
      { title: 'Od zera do pięciu',
        words: [
          ['zero', 'zero'],
          ['uno', 'jeden'],
          ['due', 'dwa'],
          ['tre', 'trzy'],
          ['quattro', 'cztery'],
          ['cinque', 'pięć'],
        ],
        sentences: [
          ['Uno, due, tre!', 'Raz, dwa, trzy!'],
          ['Tre o quattro?', 'Trzy czy cztery?'],
        ] },
      { title: 'Od sześciu do dziesięciu',
        words: [
          ['sei', 'sześć', 'też: „jesteś” (tu sei)'],
          ['sette', 'siedem'],
          ['otto', 'osiem'],
          ['nove', 'dziewięć'],
          ['dieci', 'dziesięć'],
        ],
        sentences: [
          ['Due caffè, per favore.', 'Dwie kawy, proszę.'],
          ['Sette o otto?', 'Siedem czy osiem?'],
        ] },
      { title: 'Duże liczby i wiek',
        words: [
          ['venti', 'dwadzieścia'],
          ['trenta', 'trzydzieści'],
          ['cinquanta', 'pięćdziesiąt'],
          ['cento', 'sto'],
          ['mille', 'tysiąc'],
          ['quanti anni hai?', 'ile masz lat?'],
        ],
        sentences: [
          ['Ho venti anni.', 'Mam dwadzieścia lat.'],
          ['Ho trenta anni.', 'Mam trzydzieści lat.'],
          ['Mia nonna ha cento anni.', 'Moja babcia ma sto lat.'],
        ] },
    ],
  },
  {
    title: 'Jedzenie i picie', icon: '🍕', color: '#e07a1f',
    tip: `
      <p>Włoskie rzeczowniki mają rodzajnik określony:</p>
      <table>
        <tr><td><i>il</i></td><td>męski</td><td><i>il pane, il vino</i></td></tr>
        <tr><td><i>la</i></td><td>żeński</td><td><i>la pizza, la mela</i></td></tr>
        <tr><td><i>l'</i></td><td>przed samogłoską</td><td><i>l'acqua, l'insalata</i></td></tr>
        <tr><td><i>lo</i></td><td>męski przed s+spółgł., z</td><td><i>lo zucchero</i></td></tr>
      </table>
      <p>Słowa na <b>-o</b> są zwykle męskie, na <b>-a</b> – żeńskie. Ucz się ich razem z rodzajnikiem.</p>`,
    lessons: [
      { title: 'Napoje i chleb',
        words: [
          ['il pane', 'chleb'],
          ["l'acqua", 'woda'],
          ['il vino', 'wino'],
          ['il caffè', 'kawa'],
          ['il latte', 'mleko'],
          ['la birra', 'piwo'],
        ],
        sentences: [
          ['Un caffè, per favore.', 'Kawę, proszę.'],
          ['Il vino è buono.', 'Wino jest dobre.'],
          ['Acqua o vino?', 'Woda czy wino?'],
        ] },
      { title: 'Na talerzu',
        words: [
          ['la pizza', 'pizza'],
          ['la pasta', 'makaron'],
          ['il formaggio', 'ser'],
          ['la carne', 'mięso'],
          ['il pesce', 'ryba'],
          ["l'insalata", 'sałatka/sałata'],
        ],
        sentences: [
          ['La pasta è buona.', 'Makaron jest dobry.'],
          ['Pizza o pasta?', 'Pizza czy makaron?'],
          ['Il formaggio è molto buono.', 'Ser jest bardzo dobry.'],
        ] },
      { title: 'Jem i piję',
        words: [
          ['la mela', 'jabłko'],
          ["l'arancia", 'pomarańcza'],
          ['buono', 'dobry/smaczny'],
          ['mangio', 'jem'],
          ['bevo', 'piję'],
          ['ho fame', 'jestem głodny/jestem głodna', 'dosł. „mam głód”'],
        ],
        sentences: [
          ['Mangio una mela.', 'Jem jabłko.'],
          ["Bevo l'acqua.", 'Piję wodę.'],
          ['Ho fame!', 'Jestem głodny!'],
          ['La pizza è molto buona.', 'Pizza jest bardzo dobra.'],
        ] },
    ],
  },
  {
    title: 'Rodzina', icon: '👨‍👩‍👧', color: '#d6456b',
    tip: `
      <p>Z członkiem rodziny w liczbie pojedynczej <b>nie używamy</b> rodzajnika przed zaimkiem:</p>
      <p><i>mia madre</i> (moja mama), <i>mio fratello</i> (mój brat)</p>
      <p>…ale w liczbie mnogiej już tak: <i>i miei genitori</i> (moi rodzice).</p>
      <p><b>Pułapka:</b> <i>i parenti</i> to <b>krewni</b>, a nie rodzice!</p>`,
    lessons: [
      { title: 'Rodzice i rodzeństwo',
        words: [
          ['la madre', 'matka/mama'],
          ['il padre', 'ojciec/tata'],
          ['il fratello', 'brat'],
          ['la sorella', 'siostra'],
          ['i genitori', 'rodzice'],
          ['la famiglia', 'rodzina'],
        ],
        sentences: [
          ['Ho un fratello.', 'Mam brata.'],
          ['Ho una sorella.', 'Mam siostrę.'],
          ['Ciao, mamma!', 'Cześć, mamo!'],
        ] },
      { title: 'Dzieci i dziadkowie',
        words: [
          ['il figlio', 'syn'],
          ['la figlia', 'córka'],
          ['il nonno', 'dziadek'],
          ['la nonna', 'babcia'],
          ['mio', 'mój'],
          ['mia', 'moja'],
        ],
        sentences: [
          ['Mia madre è polacca.', 'Moja mama jest Polką.'],
          ['Mio padre è italiano.', 'Mój tata jest Włochem.'],
          ['Mia nonna abita a Roma.', 'Moja babcia mieszka w Rzymie.'],
        ] },
      { title: 'Bliscy',
        words: [
          ['il marito', 'mąż'],
          ['la moglie', 'żona'],
          ['il bambino', 'dziecko/chłopczyk'],
          ['il ragazzo', 'chłopak'],
          ['la ragazza', 'dziewczyna'],
          ["l'amico", 'przyjaciel/kolega'],
          ["l'amica", 'przyjaciółka/koleżanka'],
        ],
        sentences: [
          ['Lei è mia moglie.', 'Ona jest moją żoną.'],
          ['Marco è il mio amico.', 'Marco jest moim przyjacielem.'],
          ['Ho due bambini.', 'Mam dwoje dzieci.'],
        ] },
    ],
  },
  {
    title: 'Być i mieć', icon: '⭐', color: '#c9a227',
    tip: `
      <p>Dwa najważniejsze czasowniki: <i>essere</i> (być) i <i>avere</i> (mieć).</p>
      <table>
        <tr><th></th><th>essere</th><th>avere</th></tr>
        <tr><td>io</td><td>sono</td><td>ho</td></tr>
        <tr><td>tu</td><td>sei</td><td>hai</td></tr>
        <tr><td>lui/lei</td><td>è</td><td>ha</td></tr>
        <tr><td>noi</td><td>siamo</td><td>abbiamo</td></tr>
        <tr><td>voi</td><td>siete</td><td>avete</td></tr>
        <tr><td>loro</td><td>sono</td><td>hanno</td></tr>
      </table>
      <p>Litera <b>h</b> jest niema: <i>ho</i> czytamy „o”.</p>
      <p>Włosi „mają” głód, pragnienie i zimno: <i>ho fame, ho sete, ho freddo</i>.</p>`,
    lessons: [
      { title: 'Essere – być',
        words: [
          ['io sono', 'ja jestem'],
          ['tu sei', 'ty jesteś'],
          ['lui è', 'on jest'],
          ['lei è', 'ona jest'],
          ['noi siamo', 'my jesteśmy'],
          ['voi siete', 'wy jesteście'],
          ['loro sono', 'oni są/one są'],
        ],
        sentences: [
          ['Noi siamo polacchi.', 'Jesteśmy Polakami.'],
          ['Voi siete italiani?', 'Jesteście Włochami?'],
          ['Loro sono di Roma.', 'Oni są z Rzymu.'],
          ['Lei è molto bella.', 'Ona jest bardzo ładna.'],
        ] },
      { title: 'Avere – mieć',
        words: [
          ['io ho', 'ja mam'],
          ['tu hai', 'ty masz'],
          ['lui ha', 'on ma'],
          ['noi abbiamo', 'my mamy'],
          ['voi avete', 'wy macie'],
          ['loro hanno', 'oni mają/one mają'],
        ],
        sentences: [
          ['Hai fame?', 'Jesteś głodny?'],
          ['Abbiamo un gatto.', 'Mamy kota.'],
          ['Loro hanno una casa.', 'Oni mają dom.'],
          ['Lui ha un cane.', 'On ma psa.'],
        ] },
      { title: 'Zwierzęta i rzeczy',
        words: [
          ['il gatto', 'kot'],
          ['il cane', 'pies'],
          ['la casa', 'dom'],
          ['la macchina', 'samochód'],
          ['il libro', 'książka'],
          ['il telefono', 'telefon'],
        ],
        sentences: [
          ['Ho un gatto e un cane.', 'Mam kota i psa.'],
          ['La casa è bella.', 'Dom jest piękny.'],
          ["Dov'è il mio telefono?", 'Gdzie jest mój telefon?'],
        ] },
    ],
  },
  {
    title: 'Podróże', icon: '✈️', color: '#0f9d9a',
    tip: `
      <p>„Do” / „w” z miastami to <i>a</i>, a z krajami – <i>in</i>:</p>
      <p><i>Vado a Roma</i> (jadę do Rzymu), <i>abito in Italia</i> (mieszkam we Włoszech).</p>
      <p><i>Dov'è…?</i> = „Gdzie jest…?” – to skrót od <i>dove è</i>.</p>
      <p><b>Pułapka:</b> <i>la camera</i> to <b>pokój</b>, nie kamera!</p>`,
    lessons: [
      { title: 'Transport',
        words: [
          ['il treno', 'pociąg'],
          ["l'aereo", 'samolot'],
          ["l'autobus", 'autobus'],
          ['la stazione', 'dworzec/stacja'],
          ["l'aeroporto", 'lotnisko'],
          ['il biglietto', 'bilet'],
        ],
        sentences: [
          ["Dov'è la stazione?", 'Gdzie jest dworzec?'],
          ['Un biglietto per Roma, per favore.', 'Bilet do Rzymu, proszę.'],
          ['Il treno è in ritardo.', 'Pociąg jest opóźniony.'],
        ] },
      { title: 'Kierunki',
        words: [
          ['dove', 'gdzie'],
          ['a destra', 'w prawo/na prawo'],
          ['a sinistra', 'w lewo/na lewo'],
          ['dritto', 'prosto'],
          ['vicino', 'blisko'],
          ['lontano', 'daleko'],
        ],
        sentences: [
          ['Sempre dritto.', 'Cały czas prosto.'],
          ['Gira a destra.', 'Skręć w prawo.'],
          ['La stazione è vicino.', 'Dworzec jest blisko.'],
          ['Roma è lontano?', 'Czy Rzym jest daleko?'],
        ] },
      { title: 'Hotel i morze',
        words: [
          ["l'albergo", 'hotel'],
          ['la camera', 'pokój', 'fałszywy przyjaciel – to nie kamera!'],
          ['la chiave', 'klucz'],
          ['la strada', 'ulica/droga'],
          ['la spiaggia', 'plaża'],
          ['il mare', 'morze'],
        ],
        sentences: [
          ["Dov'è l'albergo?", 'Gdzie jest hotel?'],
          ['La spiaggia è bella.', 'Plaża jest piękna.'],
          ['Andiamo al mare!', 'Jedziemy nad morze!'],
        ] },
    ],
  },
  {
    title: 'Czas', icon: '⏰', color: '#5b6bd0',
    tip: `
      <p>Dni tygodnia piszemy <b>małą literą</b>. Prawie wszystkie są męskie – oprócz <i>la domenica</i>.</p>
      <p><i>Lunedì</i> = „w poniedziałek”, a <i>il lunedì</i> = „w poniedziałki” (co tydzień).</p>
      <p>Godzina: <i>Sono le tre</i> = „Jest trzecia”, ale <i>È l'una</i> = „Jest pierwsza”.</p>`,
    lessons: [
      { title: 'Dni tygodnia',
        words: [
          ['lunedì', 'poniedziałek'],
          ['martedì', 'wtorek'],
          ['mercoledì', 'środa'],
          ['giovedì', 'czwartek'],
          ['venerdì', 'piątek'],
          ['sabato', 'sobota'],
          ['domenica', 'niedziela'],
        ],
        sentences: [
          ['Oggi è lunedì.', 'Dzisiaj jest poniedziałek.'],
          ['A sabato!', 'Do soboty!'],
        ] },
      { title: 'Kiedy?',
        words: [
          ['oggi', 'dzisiaj/dziś'],
          ['domani', 'jutro'],
          ['ieri', 'wczoraj'],
          ['adesso', 'teraz'],
          ['sempre', 'zawsze'],
          ['mai', 'nigdy'],
          ['tardi', 'późno'],
        ],
        sentences: [
          ['A domani!', 'Do jutra!'],
          ['A presto!', 'Do zobaczenia wkrótce!'],
          ['Non è mai tardi.', 'Nigdy nie jest za późno.'],
        ] },
      { title: 'Godziny i miesiące',
        words: [
          ['che ore sono?', 'która godzina?'],
          ["l'ora", 'godzina'],
          ['il giorno', 'dzień'],
          ['la settimana', 'tydzień'],
          ['il mese', 'miesiąc'],
          ["l'anno", 'rok'],
        ],
        sentences: [
          ['Sono le tre.', 'Jest trzecia.'],
          ["È l'una.", 'Jest pierwsza.'],
          ['Una settimana a Roma.', 'Tydzień w Rzymie.'],
        ] },
    ],
  },
  {
    title: 'Opisy i kolory', icon: '🎨', color: '#c2410c',
    tip: `
      <p>Przymiotnik stoi zwykle <b>po</b> rzeczowniku i zgadza się z nim w rodzaju:</p>
      <p><i>il vino rosso</i> (czerwone wino), <i>la casa rossa</i> (czerwony dom)</p>
      <p>Przymiotniki na <b>-e</b> mają jedną formę: <i>verde, grande, felice</i>.</p>
      <p><b>Pułapka:</b> <i>caldo</i> znaczy <b>gorący</b>! <i>Fa caldo</i> = „jest gorąco”.</p>`,
    lessons: [
      { title: 'Kolory',
        words: [
          ['rosso', 'czerwony'],
          ['bianco', 'biały'],
          ['nero', 'czarny'],
          ['verde', 'zielony'],
          ['blu', 'niebieski/granatowy'],
          ['giallo', 'żółty'],
        ],
        sentences: [
          ['Il vino rosso.', 'Czerwone wino.'],
          ['La macchina nera.', 'Czarny samochód.'],
          ['Il mare è blu.', 'Morze jest niebieskie.'],
        ] },
      { title: 'Duży i mały',
        words: [
          ['grande', 'duży/wielki'],
          ['piccolo', 'mały'],
          ['bello', 'piękny/ładny'],
          ['brutto', 'brzydki'],
          ['nuovo', 'nowy'],
          ['vecchio', 'stary'],
        ],
        sentences: [
          ['La casa è piccola.', 'Dom jest mały.'],
          ['Ho una macchina nuova.', 'Mam nowy samochód.'],
          ['Il cane è vecchio.', 'Pies jest stary.'],
        ] },
      { title: 'Samopoczucie',
        words: [
          ['caldo', 'gorący/ciepły', 'fałszywy przyjaciel – to nie „zimny”!'],
          ['freddo', 'zimny'],
          ['stanco', 'zmęczony'],
          ['felice', 'szczęśliwy'],
          ['contento', 'zadowolony'],
          ['triste', 'smutny'],
        ],
        sentences: [
          ['Fa caldo oggi.', 'Dzisiaj jest gorąco.'],
          ['Sono molto stanco.', 'Jestem bardzo zmęczony.'],
          ['Ho freddo.', 'Jest mi zimno.'],
        ] },
    ],
  },
  {
    title: 'Codzienne czynności', icon: '🏃', color: '#3f8f3f',
    tip: `
      <p>Czasowniki dzielą się na trzy grupy: <i>-are, -ere, -ire</i>.</p>
      <p>Forma „ja” prawie zawsze kończy się na <b>-o</b>:</p>
      <p><i>parlare → parlo, mangiare → mangio, dormire → dormo</i></p>
      <p>Wyjątki warto zapamiętać: <i>andare → vado, fare → faccio, bere → bevo</i>.</p>
      <p>Niektóre czasowniki na <i>-ire</i> dodają <i>-isc-</i>: <i>capire → capisco</i>.</p>`,
    lessons: [
      { title: 'Jeść, spać, pracować',
        words: [
          ['mangiare', 'jeść'],
          ['bere', 'pić'],
          ['dormire', 'spać'],
          ['lavorare', 'pracować'],
          ['parlare', 'mówić/rozmawiać'],
          ['studiare', 'uczyć się/studiować'],
        ],
        sentences: [
          ['Lavoro a Varsavia.', 'Pracuję w Warszawie.'],
          ["Studio l'italiano.", 'Uczę się włoskiego.'],
          ['Dormo molto.', 'Dużo śpię.'],
        ] },
      { title: 'Iść, robić, chcieć',
        words: [
          ['andare', 'iść/jechać'],
          ['venire', 'przychodzić/przyjść'],
          ['fare', 'robić'],
          ['volere', 'chcieć'],
          ['potere', 'móc'],
          ['capire', 'rozumieć'],
        ],
        sentences: [
          ['Non capisco.', 'Nie rozumiem.'],
          ['Vado a casa.', 'Idę do domu.'],
          ['Che cosa fai?', 'Co robisz?'],
          ['Posso entrare?', 'Czy mogę wejść?'],
        ] },
      { title: 'Pytania',
        words: [
          ['che cosa?', 'co?'],
          ['chi?', 'kto?'],
          ['quando?', 'kiedy?'],
          ['perché?', 'dlaczego?', 'oznacza też „ponieważ”'],
          ['come?', 'jak?'],
          ['quanto?', 'ile?'],
        ],
        sentences: [
          ['Chi è?', 'Kto to?'],
          ['Perché no?', 'Dlaczego nie?'],
          ['Quando parti?', 'Kiedy wyjeżdżasz?'],
        ] },
    ],
  },
  {
    title: 'Restauracja i zakupy', icon: '🛍️', color: '#9c4dcc',
    tip: `
      <p><i>Vorrei…</i> („chciałbym / chciałabym”) to najgrzeczniejszy sposób, by coś zamówić.</p>
      <p><i>Quanto costa?</i> – ile kosztuje (jedna rzecz), <i>Quanto costano?</i> – ile kosztują.</p>
      <p><b>Fałszywi przyjaciele</b> to słowa, które brzmią znajomo, ale znaczą coś innego:</p>
      <table>
        <tr><td><i>la firma</i></td><td>podpis</td><td>(firma = <i>l'azienda</i>)</td></tr>
        <tr><td><i>il burro</i></td><td>masło</td><td></td></tr>
        <tr><td><i>i parenti</i></td><td>krewni</td><td>(rodzice = <i>i genitori</i>)</td></tr>
        <tr><td><i>il sale</i></td><td>sól</td><td>(sala = <i>la sala</i>)</td></tr>
      </table>`,
    lessons: [
      { title: 'W restauracji',
        words: [
          ['vorrei', 'chciałbym/chciałabym'],
          ['il menù', 'menu/karta'],
          ['il conto', 'rachunek'],
          ['il tavolo', 'stolik/stół'],
          ['il cameriere', 'kelner'],
          ['buon appetito', 'smacznego'],
        ],
        sentences: [
          ['Il conto, per favore.', 'Rachunek, proszę.'],
          ['Vorrei un caffè.', 'Chciałbym kawę.'],
          ['Un tavolo per due, per favore.', 'Stolik dla dwóch osób, proszę.'],
        ] },
      { title: 'Na zakupach',
        words: [
          ['quanto costa?', 'ile to kosztuje?/ile kosztuje?'],
          ['caro', 'drogi'],
          ['economico', 'tani'],
          ['il negozio', 'sklep'],
          ['i soldi', 'pieniądze'],
          ['la carta', 'karta/papier'],
        ],
        sentences: [
          ['Quanto costa il biglietto?', 'Ile kosztuje bilet?'],
          ['È troppo caro.', 'To jest za drogie.'],
          ['Posso pagare con la carta?', 'Czy mogę zapłacić kartą?'],
        ] },
      { title: 'Fałszywi przyjaciele',
        words: [
          ['la firma', 'podpis', 'firma po włosku to „l\'azienda”'],
          ['il burro', 'masło'],
          ['i parenti', 'krewni', 'rodzice to „i genitori”'],
          ['il sale', 'sól'],
          ['salire', 'wchodzić/wsiadać'],
          ['morbido', 'miękki'],
          ['la squadra', 'drużyna'],
        ],
        sentences: [
          ['Il pane con il burro.', 'Chleb z masłem.'],
          ['Una firma, per favore.', 'Podpis, proszę.'],
          ['I miei parenti abitano a Napoli.', 'Moi krewni mieszkają w Neapolu.'],
        ] },
    ],
  },
];

/* Poziomy kursu. Jednostki kolejnych poziomów dopisujemy na końcu,
 * więc identyfikatory lekcji poziomu A1 (u1l1…u11l3) się nie zmieniają. */
const LEVELS = [
  { id: 'A1', title: 'Podstawy', icon: '🌱', desc: 'Powitania, liczby, jedzenie, rodzina, podróże i pierwsze czasowniki.' },
  { id: 'A2', title: 'Codzienne sytuacje', icon: '🚀', desc: 'Czas przeszły i przyszły, dom, zakupy, zdrowie, praca, pogoda i czas wolny.' },
];
const RAW_UNITS = [
  ...COURSE_RAW.map(u => ({ ...u, level: 'A1' })),
  ...(typeof COURSE_RAW_A2 !== 'undefined' ? COURSE_RAW_A2 : []).map(u => ({ ...u, level: 'A2' })),
];

/* Zbudowanie struktury z identyfikatorami. */
const COURSE = RAW_UNITS.map((u, ui) => ({
  id: 'u' + (ui + 1),
  index: ui,
  level: u.level,
  numInLevel: RAW_UNITS.slice(0, ui + 1).filter(x => x.level === u.level).length,
  title: u.title, icon: u.icon, color: u.color, tip: u.tip,
  lessons: u.lessons.map((l, li) => ({
    id: 'u' + (ui + 1) + 'l' + (li + 1),
    unitIndex: ui,
    index: li,
    title: l.title,
    words: l.words.map(([it, pl, note]) => ({ it, pl, note: note || '', key: 'c:' + it.toLowerCase() })),
    sentences: (l.sentences || []).map(([it, pl]) => ({ it, pl, sentence: true, key: 's:' + it.toLowerCase() })),
  })),
}));

const ALL_LESSONS = COURSE.flatMap(u => u.lessons);
const ALL_COURSE_WORDS = ALL_LESSONS.flatMap(l => l.words);
const ALL_SENTENCES = ALL_LESSONS.flatMap(l => l.sentences);

const levelUnits = id => COURSE.filter(u => u.level === id);
const levelLessons = id => ALL_LESSONS.filter(l => COURSE[l.unitIndex].level === id);
