/*
 * Treść kursu – poziom A2 („Codzienne sytuacje”).
 * Format taki sam jak w course.js:
 *   słowo:  [włoski, polski, notatka?]   – warianty oddzielone ukośnikiem
 *   zdanie: [włoski, polski]
 * Ten plik musi być wczytany PRZED course.js.
 */
const COURSE_RAW_A2 = [
  {
    title: 'Przeszłość z „avere”', icon: '📜', color: '#7a5af8',
    tip: `
      <p><b>Passato prossimo</b> to podstawowy czas przeszły: <i>avere</i> lub <i>essere</i> + imiesłów.</p>
      <table>
        <tr><td><i>-are</i></td><td>→ <i>-ato</i></td><td><i>parlare → ho parlato</i></td></tr>
        <tr><td><i>-ere</i></td><td>→ <i>-uto</i></td><td><i>avere → ho avuto</i></td></tr>
        <tr><td><i>-ire</i></td><td>→ <i>-ito</i></td><td><i>dormire → ho dormito</i></td></tr>
      </table>
      <p>Ważne formy nieregularne: <i>fare → fatto, vedere → visto, prendere → preso, leggere → letto, scrivere → scritto, bere → bevuto</i>.</p>
      <p>Przeczenie stoi przed <i>avere</i>: <i>Non ho capito</i> = „Nie zrozumiałem”.</p>`,
    lessons: [
      { title: 'Co robiłeś?',
        words: [
          ['ho mangiato', 'zjadłem/zjadłam/jadłem/jadłam'],
          ['ho parlato', 'rozmawiałem/rozmawiałam/mówiłem/mówiłam'],
          ['ho lavorato', 'pracowałem/pracowałam'],
          ['ho dormito', 'spałem/spałam'],
          ['ho capito', 'zrozumiałem/zrozumiałam/rozumiem', 'często znaczy po prostu „rozumiem”'],
          ['hai mangiato?', 'jadłeś?/zjadłeś?/jadłaś?/zjadłaś?'],
        ],
        sentences: [
          ['Ieri ho lavorato molto.', 'Wczoraj dużo pracowałem.'],
          ['Ho mangiato una pizza.', 'Zjadłem pizzę.'],
          ['Hai dormito bene?', 'Dobrze spałeś?'],
          ['Non ho capito.', 'Nie zrozumiałem.'],
        ] },
      { title: 'Formy nieregularne',
        words: [
          ['ho fatto', 'zrobiłem/zrobiłam/robiłem/robiłam'],
          ['ho visto', 'widziałem/widziałam/zobaczyłem/zobaczyłam'],
          ['ho preso', 'wziąłem/wzięłam'],
          ['ho letto', 'przeczytałem/przeczytałam/czytałem/czytałam'],
          ['ho scritto', 'napisałem/napisałam/pisałem/pisałam'],
          ['ho bevuto', 'wypiłem/wypiłam/piłem/piłam'],
        ],
        sentences: [
          ['Che cosa hai fatto ieri?', 'Co robiłeś wczoraj?'],
          ['Ho visto un film.', 'Obejrzałem film.'],
          ['Ho letto un libro interessante.', 'Przeczytałem ciekawą książkę.'],
          ['Ho preso il treno.', 'Pojechałem pociągiem.'],
        ] },
      { title: 'Kiedy to było?',
        words: [
          ['ieri sera', 'wczoraj wieczorem'],
          ['la settimana scorsa', 'w zeszłym tygodniu'],
          ["l'anno scorso", 'w zeszłym roku'],
          ['già', 'już'],
          ['ancora', 'jeszcze'],
          ['fa', 'temu', 'stoi po określeniu czasu: due giorni fa = dwa dni temu'],
        ],
        sentences: [
          ['Due giorni fa ho visto Marco.', 'Dwa dni temu widziałem Marca.'],
          ['Hai già mangiato?', 'Czy już jadłeś?'],
          ['Non ho ancora finito.', 'Jeszcze nie skończyłem.'],
          ["L'anno scorso ho studiato l'italiano.", 'W zeszłym roku uczyłem się włoskiego.'],
        ] },
    ],
  },
  {
    title: 'Przeszłość z „essere”', icon: '🚶', color: '#0e9384',
    tip: `
      <p>Czasowniki ruchu i zmiany (<i>andare, venire, arrivare, partire, uscire, tornare, stare, nascere, succedere</i>) tworzą przeszłość z <b>essere</b>.</p>
      <p>Wtedy imiesłów <b>zgadza się z osobą</b>, jak w polskim „poszedł / poszła”:</p>
      <table>
        <tr><td>on</td><td><i>è andato</i></td><td>oni</td><td><i>sono andati</i></td></tr>
        <tr><td>ona</td><td><i>è andata</i></td><td>one</td><td><i>sono andate</i></td></tr>
      </table>
      <p><i>Sono stato</i> znaczy zarówno „byłem”, jak i „byłem gdzieś”: <i>Sei mai stato a Roma?</i></p>`,
    lessons: [
      { title: 'Gdzie byłeś?',
        words: [
          ['sono andato/sono andata', 'poszedłem/poszłam/pojechałem/pojechałam'],
          ['sono arrivato/sono arrivata', 'przyjechałem/przyjechałam/dotarłem/dotarłam'],
          ['sono partito/sono partita', 'wyjechałem/wyjechałam'],
          ['sono tornato/sono tornata', 'wróciłem/wróciłam'],
          ['sono uscito/sono uscita', 'wyszedłem/wyszłam'],
          ['sono stato/sono stata', 'byłem/byłam'],
        ],
        sentences: [
          ['Sono andato a Roma.', 'Pojechałem do Rzymu.'],
          ['Anna è arrivata ieri.', 'Anna przyjechała wczoraj.'],
          ['Sei mai stato in Italia?', 'Czy byłeś kiedyś we Włoszech?'],
          ['Sono tornata a casa tardi.', 'Wróciłam do domu późno.'],
        ] },
      { title: 'My, wy, oni',
        words: [
          ['siamo andati', 'poszliśmy/pojechaliśmy'],
          ['siete arrivati', 'przyjechaliście/dotarliście'],
          ['sono partiti', 'wyjechali'],
          ['è nato/è nata', 'urodził się/urodziła się'],
          ['è venuto/è venuta', 'przyszedł/przyszła/przyjechał/przyjechała'],
          ['è successo', 'stało się/zdarzyło się'],
        ],
        sentences: [
          ['Che cosa è successo?', 'Co się stało?'],
          ['Siamo andati al mare.', 'Pojechaliśmy nad morze.'],
          ['Mia figlia è nata a Cracovia.', 'Moja córka urodziła się w Krakowie.'],
          ['Marco non è venuto.', 'Marco nie przyszedł.'],
        ] },
      { title: 'Weekend i wakacje',
        words: [
          ['il fine settimana', 'weekend'],
          ['le vacanze', 'wakacje/urlop'],
          ['in vacanza', 'na wakacjach/na urlopie'],
          ['il viaggio', 'podróż'],
          ['visitare', 'zwiedzać/odwiedzać'],
          ['è stato bello', 'było fajnie/było pięknie'],
        ],
        sentences: [
          ["Com'è andato il viaggio?", 'Jak minęła podróż?'],
          ['Il fine settimana è stato bello.', 'Weekend był udany.'],
          ['Abbiamo visitato Firenze.', 'Zwiedziliśmy Florencję.'],
          ['Sono stato in vacanza in Sicilia.', 'Byłem na wakacjach na Sycylii.'],
        ] },
    ],
  },
  {
    title: 'Czasowniki zwrotne', icon: '🪥', color: '#dd2590',
    tip: `
      <p>Czasowniki zwrotne mają w bezokoliczniku końcówkę <i>-si</i>: <i>alzarsi</i> (wstawać), <i>lavarsi</i> (myć się).</p>
      <table>
        <tr><td>io</td><td><i>mi alzo</i></td><td>noi</td><td><i>ci alziamo</i></td></tr>
        <tr><td>tu</td><td><i>ti alzi</i></td><td>voi</td><td><i>vi alzate</i></td></tr>
        <tr><td>lui/lei</td><td><i>si alza</i></td><td>loro</td><td><i>si alzano</i></td></tr>
      </table>
      <p>Zaimek stoi <b>przed</b> czasownikiem. Polskie „się” nie zawsze się pokrywa: <i>alzarsi</i> = „wstawać”.</p>
      <p>W przeszłości zawsze z <i>essere</i>: <i>mi sono alzato / alzata</i>.</p>`,
    lessons: [
      { title: 'Poranek',
        words: [
          ['svegliarsi', 'budzić się'],
          ['mi sveglio', 'budzę się'],
          ['alzarsi', 'wstawać'],
          ['mi alzo', 'wstaję'],
          ['lavarsi', 'myć się'],
          ['vestirsi', 'ubierać się'],
        ],
        sentences: [
          ['Mi sveglio alle sette.', 'Budzę się o siódmej.'],
          ['Mi alzo presto.', 'Wstaję wcześnie.'],
          ['Ti alzi tardi?', 'Późno wstajesz?'],
          ['Mi lavo e mi vesto.', 'Myję się i ubieram.'],
        ] },
      { title: 'Jak się czujesz?',
        words: [
          ['si chiama', 'nazywa się/ma na imię'],
          ['riposarsi', 'odpoczywać'],
          ['annoiarsi', 'nudzić się'],
          ['divertirsi', 'bawić się/dobrze się bawić'],
          ['sentirsi', 'czuć się'],
          ['mi sento bene', 'czuję się dobrze/dobrze się czuję'],
        ],
        sentences: [
          ['Come si chiama tua sorella?', 'Jak ma na imię twoja siostra?'],
          ['Ci divertiamo molto.', 'Bardzo dobrze się bawimy.'],
          ['Mi sento stanco.', 'Czuję się zmęczony.'],
          ['Il sabato mi riposo.', 'W soboty odpoczywam.'],
        ] },
      { title: 'Wczoraj rano',
        words: [
          ['mi sono alzato/mi sono alzata', 'wstałem/wstałam'],
          ['mi sono svegliato/mi sono svegliata', 'obudziłem się/obudziłam się'],
          ['mi sono divertito/mi sono divertita', 'dobrze się bawiłem/dobrze się bawiłam'],
          ['ci siamo visti', 'widzieliśmy się/spotkaliśmy się'],
          ['la mattina', 'rano/ranek'],
          ['la sera', 'wieczorem/wieczór'],
        ],
        sentences: [
          ['Stamattina mi sono svegliata tardi.', 'Dziś rano obudziłam się późno.'],
          ['Ci siamo divertiti alla festa.', 'Dobrze się bawiliśmy na imprezie.'],
          ['A che ora ti sei alzato?', 'O której wstałeś?'],
        ] },
    ],
  },
  {
    title: 'Dom', icon: '🏠', color: '#b54708',
    tip: `
      <p><i>C'è</i> = „jest” (coś się znajduje), <i>ci sono</i> = „są”:</p>
      <p><i>C'è un balcone.</i> – Jest balkon. <i>Ci sono due bagni.</i> – Są dwie łazienki.</p>
      <p>Przyimki miejsca: <i>sopra</i> (na, nad), <i>sotto</i> (pod), <i>accanto a</i> (obok), <i>davanti a</i> (przed), <i>dietro</i> (za).</p>
      <p><b>Pułapka:</b> „pokój” to <i>la stanza</i> lub <i>la camera</i>, a „sypialnia” to <i>la camera da letto</i>.</p>`,
    lessons: [
      { title: 'Pokoje',
        words: [
          ["l'appartamento", 'mieszkanie'],
          ['la cucina', 'kuchnia'],
          ['il bagno', 'łazienka'],
          ['la camera da letto', 'sypialnia'],
          ['il soggiorno', 'salon/pokój dzienny'],
          ['il balcone', 'balkon'],
        ],
        sentences: [
          ["C'è un balcone?", 'Czy jest balkon?'],
          ["L'appartamento ha due camere da letto.", 'Mieszkanie ma dwie sypialnie.'],
          ['La cucina è piccola.', 'Kuchnia jest mała.'],
        ] },
      { title: 'Meble',
        words: [
          ['il letto', 'łóżko'],
          ['la sedia', 'krzesło'],
          ["l'armadio", 'szafa'],
          ['la finestra', 'okno'],
          ['la porta', 'drzwi'],
          ['il divano', 'kanapa/sofa'],
        ],
        sentences: [
          ['Il gatto dorme sul divano.', 'Kot śpi na kanapie.'],
          ['Apri la finestra, per favore.', 'Otwórz okno, proszę.'],
          ['Ci sono tre sedie in cucina.', 'W kuchni są trzy krzesła.'],
        ] },
      { title: 'Gdzie to jest?',
        words: [
          ["c'è", 'jest', 'znaczy „jest, znajduje się”'],
          ['ci sono', 'są'],
          ['sopra', 'na/nad'],
          ['sotto', 'pod'],
          ['accanto a', 'obok'],
          ['davanti a', 'przed'],
        ],
        sentences: [
          ['Il libro è sotto il letto.', 'Książka jest pod łóżkiem.'],
          ['La banca è accanto al supermercato.', 'Bank jest obok supermarketu.'],
          ['Ci sono molti negozi qui.', 'Tu jest dużo sklepów.'],
        ] },
    ],
  },
  {
    title: 'Ubrania i zakupy', icon: '👗', color: '#c11574',
    tip: `
      <p>Przymiotnik koloru zgadza się z rzeczownikiem: <i>la camicia bianca, i pantaloni neri</i>.</p>
      <p>Niektóre kolory się nie odmieniają: <i>blu, rosa, viola, beige</i>.</p>
      <p>Ile kosztuje (jedna rzecz)? – <i>Quanto costa?</i> Ile kosztują? – <i>Quanto costano?</i></p>
      <p><i>I pantaloni</i> (spodnie) i <i>gli occhiali</i> (okulary) są w liczbie mnogiej – tak jak po polsku.</p>`,
    lessons: [
      { title: 'Ubrania',
        words: [
          ['la camicia', 'koszula'],
          ['la maglietta', 'koszulka/t-shirt'],
          ['i pantaloni', 'spodnie'],
          ['la gonna', 'spódnica'],
          ['il vestito', 'sukienka/garnitur', 'zależnie od kontekstu'],
          ['la giacca', 'kurtka/marynarka'],
        ],
        sentences: [
          ['Questa camicia è bella.', 'Ta koszula jest ładna.'],
          ['Cerco dei pantaloni neri.', 'Szukam czarnych spodni.'],
          ['Il vestito rosso costa cinquanta euro.', 'Czerwona sukienka kosztuje pięćdziesiąt euro.'],
        ] },
      { title: 'Buty i dodatki',
        words: [
          ['le scarpe', 'buty'],
          ['la borsa', 'torebka/torba'],
          ['il cappello', 'kapelusz/czapka'],
          ['gli occhiali', 'okulary'],
          ["l'ombrello", 'parasol'],
          ['la taglia', 'rozmiar', 'rozmiar ubrania; rozmiar butów to il numero'],
        ],
        sentences: [
          ['Che taglia porta?', 'Jaki rozmiar Pan nosi?'],
          ['Le scarpe sono troppo piccole.', 'Buty są za małe.'],
          ["Ho dimenticato l'ombrello.", 'Zapomniałem parasola.'],
        ] },
      { title: 'W sklepie',
        words: [
          ['posso provare?', 'czy mogę przymierzyć?'],
          ['il camerino', 'przymierzalnia'],
          ['lo sconto', 'zniżka/rabat'],
          ['i saldi', 'wyprzedaż/wyprzedaże'],
          ['la cassa', 'kasa'],
          ['lo scontrino', 'paragon'],
        ],
        sentences: [
          ['Quanto costano queste scarpe?', 'Ile kosztują te buty?'],
          ["Dov'è il camerino?", 'Gdzie jest przymierzalnia?'],
          ['Pago alla cassa.', 'Płacę przy kasie.'],
          ["C'è uno sconto?", 'Czy jest zniżka?'],
        ] },
    ],
  },
  {
    title: 'Zdrowie', icon: '🩺', color: '#d92d20',
    tip: `
      <p>„Boli mnie…” mówimy na dwa sposoby:</p>
      <p><i>Mi fa male la testa</i> (jedna rzecz), <i>mi fanno male i piedi</i> (wiele rzeczy).</p>
      <p><i>Ho mal di testa / mal di gola / mal di schiena</i> – boli mnie głowa / gardło / plecy.</p>
      <p>Liczba mnoga bywa nieregularna: <i>il braccio → le braccia</i>, <i>la mano → le mani</i>.</p>
      <p>W nagłym wypadku dzwoń pod <b>112</b> – działa w całej Unii Europejskiej.</p>`,
    lessons: [
      { title: 'Ciało',
        words: [
          ['la testa', 'głowa'],
          ['il braccio', 'ręka/ramię', 'l. mn.: le braccia'],
          ['la mano', 'dłoń/ręka', 'l. mn.: le mani'],
          ['la gamba', 'noga'],
          ['il piede', 'stopa'],
          ['la schiena', 'plecy'],
        ],
        sentences: [
          ['Mi fa male la testa.', 'Boli mnie głowa.'],
          ['Mi fanno male i piedi.', 'Bolą mnie stopy.'],
          ['Ho mal di schiena.', 'Bolą mnie plecy.'],
        ] },
      { title: 'Choroba',
        words: [
          ['il raffreddore', 'przeziębienie/katar'],
          ['la febbre', 'gorączka'],
          ['la tosse', 'kaszel'],
          ['ho mal di gola', 'boli mnie gardło'],
          ['sto male', 'źle się czuję/jestem chory/jestem chora'],
          ['malato', 'chory'],
        ],
        sentences: [
          ['Ho la febbre.', 'Mam gorączkę.'],
          ['Mio figlio è malato.', 'Mój syn jest chory.'],
          ['Ho il raffreddore e la tosse.', 'Mam katar i kaszel.'],
        ] },
      { title: 'U lekarza',
        words: [
          ['il medico', 'lekarz'],
          ['la farmacia', 'apteka'],
          ['la medicina', 'lekarstwo/lek'],
          ["l'ospedale", 'szpital'],
          ["l'appuntamento", 'wizyta/umówione spotkanie'],
          ['aiuto!', 'pomocy!/ratunku!'],
        ],
        sentences: [
          ['Devo andare dal medico.', 'Muszę iść do lekarza.'],
          ["Dov'è la farmacia più vicina?", 'Gdzie jest najbliższa apteka?'],
          ['Prenda questa medicina due volte al giorno.', 'Proszę brać to lekarstwo dwa razy dziennie.'],
          ["Chiamate un'ambulanza!", 'Wezwijcie karetkę!'],
        ] },
    ],
  },
  {
    title: 'Praca i nauka', icon: '💼', color: '#344054',
    tip: `
      <p>„Czym się zajmujesz?” – <i>Che lavoro fai?</i></p>
      <p>„Jestem nauczycielem” – <i>Faccio l'insegnante</i> albo <i>Sono insegnante</i> (bez rodzajnika po <i>sono</i>).</p>
      <p>Wiele zawodów ma formę żeńską: <i>il cuoco → la cuoca</i>, <i>l'infermiere → l'infermiera</i>. <i>L'insegnante</i> jest wspólne.</p>
      <p><i>Imparare</i> = uczyć się czegoś (<i>imparo l'italiano</i>), <i>studiare</i> = uczyć się, studiować.</p>`,
    lessons: [
      { title: 'Zawody',
        words: [
          ["l'insegnante", 'nauczyciel/nauczycielka'],
          ["l'ingegnere", 'inżynier'],
          ["l'infermiera", 'pielęgniarka'],
          ["l'avvocato", 'prawnik/adwokat'],
          ['il cuoco', 'kucharz'],
          ['che lavoro fai?', 'czym się zajmujesz?/jaki masz zawód?'],
        ],
        sentences: [
          ["Faccio l'insegnante.", 'Jestem nauczycielem.'],
          ['Mia moglie è infermiera.', 'Moja żona jest pielęgniarką.'],
          ['Che lavoro fa tuo padre?', 'Czym zajmuje się twój tata?'],
        ] },
      { title: 'W biurze',
        words: [
          ["l'ufficio", 'biuro'],
          ['il collega', 'kolega z pracy/współpracownik', 'kobieta: la collega'],
          ['la riunione', 'zebranie/spotkanie'],
          ['il capo', 'szef'],
          ['lo stipendio', 'pensja/wypłata'],
          ['il computer', 'komputer'],
        ],
        sentences: [
          ['Ho una riunione alle dieci.', 'Mam zebranie o dziesiątej.'],
          ['Il mio capo è simpatico.', 'Mój szef jest sympatyczny.'],
          ['Lavoro in ufficio dal lunedì al venerdì.', 'Pracuję w biurze od poniedziałku do piątku.'],
        ] },
      { title: 'Szkoła i studia',
        words: [
          ['la scuola', 'szkoła'],
          ["l'università", 'uniwersytet/uczelnia'],
          ['lo studente', 'student/uczeń', 'kobieta: la studentessa'],
          ["l'esame", 'egzamin'],
          ['la lezione', 'lekcja/zajęcia'],
          ['imparare', 'uczyć się/nauczyć się'],
        ],
        sentences: [
          ['Domani ho un esame.', 'Jutro mam egzamin.'],
          ["Imparo l'italiano da un anno.", 'Uczę się włoskiego od roku.'],
          ['La lezione comincia alle nove.', 'Lekcja zaczyna się o dziewiątej.'],
        ] },
    ],
  },
  {
    title: 'Pogoda i pory roku', icon: '🌦️', color: '#0086c9',
    tip: `
      <p>O pogodzie często mówimy z <i>fare</i>: <i>fa caldo, fa freddo, fa bel tempo</i>.</p>
      <p><i>Piove</i> – pada deszcz, <i>nevica</i> – pada śnieg, <i>c'è il sole</i> – świeci słońce, <i>c'è vento</i> – wieje wiatr.</p>
      <p>Pory roku: <i>d'estate</i> (latem), <i>d'inverno</i> (zimą), <i>in primavera, in autunno</i>.</p>
      <p>Miesiące piszemy małą literą: <i>a maggio</i> – w maju, <i>ad agosto</i> – w sierpniu.</p>`,
    lessons: [
      { title: 'Jaka jest pogoda?',
        words: [
          ['che tempo fa?', 'jaka jest pogoda?/jaka pogoda?'],
          ['piove', 'pada deszcz/pada'],
          ['nevica', 'pada śnieg'],
          ["c'è il sole", 'świeci słońce/jest słonecznie'],
          ["c'è vento", 'wieje wiatr/jest wietrznie'],
          ['fa bel tempo', 'jest ładna pogoda'],
        ],
        sentences: [
          ['Oggi piove.', 'Dzisiaj pada deszcz.'],
          ['Che brutto tempo!', 'Co za brzydka pogoda!'],
          ['Domani farà bel tempo.', 'Jutro będzie ładna pogoda.'],
        ] },
      { title: 'Pory roku',
        words: [
          ['la primavera', 'wiosna'],
          ["l'estate", 'lato'],
          ["l'autunno", 'jesień'],
          ["l'inverno", 'zima'],
          ['la stagione', 'pora roku/sezon'],
          ['il tempo', 'pogoda/czas', 'znaczy i „pogoda”, i „czas”'],
        ],
        sentences: [
          ["D'inverno nevica.", 'Zimą pada śnieg.'],
          ["L'estate in Italia è molto calda.", 'Lato we Włoszech jest bardzo gorące.'],
          ['Qual è la tua stagione preferita?', 'Jaka jest twoja ulubiona pora roku?'],
        ] },
      { title: 'Od stycznia do czerwca',
        words: [
          ['gennaio', 'styczeń'],
          ['febbraio', 'luty'],
          ['marzo', 'marzec'],
          ['aprile', 'kwiecień'],
          ['maggio', 'maj'],
          ['giugno', 'czerwiec'],
        ],
        sentences: [
          ['Il mio compleanno è a maggio.', 'Moje urodziny są w maju.'],
          ['A marzo fa ancora freddo.', 'W marcu jest jeszcze zimno.'],
        ] },
      { title: 'Od lipca do grudnia',
        words: [
          ['luglio', 'lipiec'],
          ['agosto', 'sierpień'],
          ['settembre', 'wrzesień'],
          ['ottobre', 'październik'],
          ['novembre', 'listopad'],
          ['dicembre', 'grudzień'],
        ],
        sentences: [
          ['Ad agosto andiamo al mare.', 'W sierpniu jedziemy nad morze.'],
          ['Natale è il venticinque dicembre.', 'Boże Narodzenie jest dwudziestego piątego grudnia.'],
        ] },
    ],
  },
  {
    title: 'Przyszłość', icon: '🔮', color: '#6941c6',
    tip: `
      <p><b>Futuro semplice</b> – końcówki: <i>-ò, -ai, -à, -emo, -ete, -anno</i>.</p>
      <p><i>parlare → parlerò, prendere → prenderò, partire → partirò</i></p>
      <p>Nieregularne: <i>essere → sarò, avere → avrò, andare → andrò, fare → farò, venire → verrò, vedere → vedrò</i>.</p>
      <p>W mowie potocznej o planach często używa się czasu teraźniejszego: <i>Domani vado a Roma</i> = „Jutro jadę do Rzymu”.</p>`,
    lessons: [
      { title: 'Plany',
        words: [
          ['parlerò', 'porozmawiam/będę mówić'],
          ['lavorerò', 'będę pracować'],
          ['partirò', 'wyjadę'],
          ['prenderò', 'wezmę'],
          ['vedrò', 'zobaczę'],
          ['domani mattina', 'jutro rano'],
        ],
        sentences: [
          ['Domani lavorerò fino a tardi.', 'Jutro będę pracować do późna.'],
          ['Ti chiamerò stasera.', 'Zadzwonię do ciebie dziś wieczorem.'],
          ['Prenderò un caffè.', 'Wezmę kawę.'],
        ] },
      { title: 'Formy nieregularne',
        words: [
          ['sarò', 'będę'],
          ['avrò', 'będę mieć/będę miał/będę miała'],
          ['andrò', 'pójdę/pojadę'],
          ['farò', 'zrobię/będę robić'],
          ['verrò', 'przyjdę/przyjadę'],
          ['sarà', 'będzie'],
        ],
        sentences: [
          ["L'anno prossimo andrò in Italia.", 'W przyszłym roku pojadę do Włoch.'],
          ['Domani sarà una bella giornata.', 'Jutro będzie piękny dzień.'],
          ['Verrai alla festa?', 'Przyjdziesz na imprezę?'],
        ] },
      { title: 'Kiedy?',
        words: [
          ["l'anno prossimo", 'w przyszłym roku'],
          ['la settimana prossima', 'w przyszłym tygodniu'],
          ['tra', 'za', 'o czasie: tra due giorni = za dwa dni'],
          ['forse', 'może/być może'],
          ['spero', 'mam nadzieję'],
          ['presto', 'wkrótce/wcześnie'],
        ],
        sentences: [
          ['Tra un mese avrò le vacanze.', 'Za miesiąc będę miał wakacje.'],
          ['Spero di vederti presto.', 'Mam nadzieję, że wkrótce cię zobaczę.'],
          ['Forse domani pioverà.', 'Może jutro będzie padać.'],
        ] },
    ],
  },
  {
    title: 'Przyimki z rodzajnikiem', icon: '🧩', color: '#4e5ba6',
    tip: `
      <p>Przyimki <i>a, da, di, in, su</i> łączą się z rodzajnikiem w jedno słowo:</p>
      <table>
        <tr><th></th><th>il</th><th>la</th><th>l'</th><th>i</th><th>le</th></tr>
        <tr><td>a</td><td>al</td><td>alla</td><td>all'</td><td>ai</td><td>alle</td></tr>
        <tr><td>da</td><td>dal</td><td>dalla</td><td>dall'</td><td>dai</td><td>dalle</td></tr>
        <tr><td>di</td><td>del</td><td>della</td><td>dell'</td><td>dei</td><td>delle</td></tr>
        <tr><td>in</td><td>nel</td><td>nella</td><td>nell'</td><td>nei</td><td>nelle</td></tr>
        <tr><td>su</td><td>sul</td><td>sulla</td><td>sull'</td><td>sui</td><td>sulle</td></tr>
      </table>
      <p><i>Da</i> + osoba = „u kogoś / do kogoś”: <i>vado dal medico</i> – idę do lekarza.</p>`,
    lessons: [
      { title: 'W, do, na – „in” i „a”',
        words: [
          ['nel cassetto', 'w szufladzie'],
          ['nella borsa', 'w torebce/w torbie'],
          ['al bar', 'w barze/do baru'],
          ['alla stazione', 'na dworcu/na dworzec'],
          ["all'aeroporto", 'na lotnisku/na lotnisko'],
          ['al cinema', 'w kinie/do kina'],
        ],
        sentences: [
          ['Le chiavi sono nella borsa.', 'Klucze są w torebce.'],
          ['Ci vediamo alla stazione.', 'Spotkamy się na dworcu.'],
          ['Andiamo al cinema stasera?', 'Idziemy dziś wieczorem do kina?'],
        ] },
      { title: 'U kogo? Czyje? – „da” i „di”',
        words: [
          ['dal medico', 'u lekarza/do lekarza'],
          ['dal dentista', 'u dentysty/do dentysty'],
          ['la casa dei nonni', 'dom dziadków'],
          ['il centro della città', 'centrum miasta'],
          ['dalle nove', 'od dziewiątej'],
          ['del pane', 'trochę chleba/chleb', '„del, della” = trochę, część czegoś'],
        ],
        sentences: [
          ['Vado dal dentista.', 'Idę do dentysty.'],
          ['Vorrei del pane.', 'Chciałbym trochę chleba.'],
          ['Il negozio è aperto dalle nove alle otto.', 'Sklep jest otwarty od dziewiątej do ósmej.'],
        ] },
      { title: 'Na czym? – „su”',
        words: [
          ['sul tavolo', 'na stole'],
          ['sulla sedia', 'na krześle'],
          ['sul letto', 'na łóżku'],
          ['sulla spiaggia', 'na plaży'],
          ['sul treno', 'w pociągu'],
          ["sull'autobus", 'w autobusie'],
        ],
        sentences: [
          ['Il telefono è sul tavolo.', 'Telefon jest na stole.'],
          ['Ho dimenticato la borsa sul treno.', 'Zostawiłem torbę w pociągu.'],
          ['Passiamo la giornata sulla spiaggia.', 'Spędzamy dzień na plaży.'],
        ] },
    ],
  },
  {
    title: 'Czas wolny', icon: '🎭', color: '#099250',
    tip: `
      <p>„Lubię” to po włosku „podoba mi się”:</p>
      <p><i>Mi piace</i> + jedna rzecz lub czasownik: <i>mi piace la musica, mi piace leggere</i>.</p>
      <p><i>Mi piacciono</i> + wiele rzeczy: <i>mi piacciono i gatti</i>.</p>
      <p><i>Ti piace?</i> – Lubisz? <i>Non mi piace</i> – Nie lubię.</p>
      <p>„Gram w piłkę” – <i>gioco a calcio</i>, „uprawiam sport” – <i>faccio sport</i>.</p>`,
    lessons: [
      { title: 'Lubię…',
        words: [
          ['mi piace', 'lubię/podoba mi się'],
          ['mi piacciono', 'lubię/podobają mi się', 'z liczbą mnogą: mi piacciono i film'],
          ['ti piace?', 'lubisz?/podoba ci się?'],
          ['non mi piace', 'nie lubię/nie podoba mi się'],
          ['preferisco', 'wolę'],
          ['odio', 'nienawidzę'],
        ],
        sentences: [
          ['Mi piace molto leggere.', 'Bardzo lubię czytać.'],
          ['Mi piacciono i gatti.', 'Lubię koty.'],
          ['Ti piace la cucina italiana?', 'Lubisz kuchnię włoską?'],
        ] },
      { title: 'Hobby',
        words: [
          ['leggere', 'czytać'],
          ['cucinare', 'gotować'],
          ['ballare', 'tańczyć'],
          ['cantare', 'śpiewać'],
          ['viaggiare', 'podróżować'],
          ['fare sport', 'uprawiać sport'],
        ],
        sentences: [
          ['Nel tempo libero cucino.', 'W wolnym czasie gotuję.'],
          ['Mi piace viaggiare con gli amici.', 'Lubię podróżować z przyjaciółmi.'],
          ['Mia sorella canta molto bene.', 'Moja siostra bardzo dobrze śpiewa.'],
        ] },
      { title: 'Wyjścia',
        words: [
          ['il cinema', 'kino'],
          ['il teatro', 'teatr'],
          ['il museo', 'muzeum'],
          ['il concerto', 'koncert'],
          ['la partita', 'mecz'],
          ['il calcio', 'piłka nożna'],
        ],
        sentences: [
          ["Stasera c'è una partita di calcio.", 'Dziś wieczorem jest mecz piłki nożnej.'],
          ['Andiamo al museo domenica?', 'Idziemy w niedzielę do muzeum?'],
          ['Il concerto è stato fantastico.', 'Koncert był fantastyczny.'],
        ] },
    ],
  },
];
