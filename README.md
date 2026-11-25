# Włoski z Polskim 🇮🇹🇵🇱

Darmowa aplikacja do nauki włoskiego dla Polaków, w stylu Duolingo. Działa w przeglądarce, także offline. Konta z synchronizacją są opcjonalne.

## Co potrafi

- **Dwa poziomy kursu, A1 i A2**: 22 jednostki, 67 lekcji, ponad 400 słów i 200 zdań. Każda jednostka ma wskazówki gramatyczne pisane z myślą o Polakach.
  - **A1 „Podstawy”**: wymowa, powitania, liczby, jedzenie, rodzina, *essere/avere*, podróże, fałszywi przyjaciele.
  - **A2 „Codzienne sytuacje”**: czas przeszły (*passato prossimo* z *avere* i *essere*), czasowniki zwrotne, dom, ubrania i zakupy, zdrowie, praca i nauka, pogoda i miesiące, czas przyszły, przyimki z rodzajnikiem, czas wolny (*mi piace*).
  - Poziom A2 odblokowuje się po ukończeniu A1 albo od razu po podaniu osobistego kodu.
- **Ścieżka nauki**: kolejne lekcje odblokowują się po ukończeniu poprzednich. Wszystkie lekcje naraz można odblokować **osobistym kodem**: zalogowany uczeń prosi o kod, administrator zatwierdza prośbę, a aplikacja generuje kod przypisany do konta ucznia (opis niżej).
- **8 typów ćwiczeń**: nowe słowo, wybór odpowiedzi (IT→PL i PL→IT), łączenie par, pisanie tłumaczenia, dyktando (słuchanie), układanie zdania z kafelków, układanie zdania ze słuchu, wybór tłumaczenia zdania.
- **Wymowa włoska** przez wbudowaną w przeglądarkę syntezę mowy, także w wolnym tempie 🐢.
- **Ćwiczenia mówienia 🎤**: powiedz słowo lub zdanie na głos, a przeglądarka sprawdzi wymowę. Działa w Chrome, Edge i Safari (wymaga internetu i zgody na mikrofon). Można je wyłączyć w ustawieniach albo pominąć na 15 minut przyciskiem „Nie mogę teraz mówić”.
- **Konta i synchronizacja ☁️** (opcjonalnie, przez Firebase): logowanie kontem Google lub linkiem z e-maila. Postęp synchronizuje się między telefonem a komputerem, a nauka bez internetu dalej działa.
- **Wyrozumiałe sprawdzanie**: brak akcentu, brak polskiego znaku, brak rodzajnika lub drobna literówka nie są liczone jako błąd, ale aplikacja o nich przypomina.
- **Powtórki z odstępami (system Leitnera)**: słowa wracają wtedy, gdy zaczynasz je zapominać. Do tego lista błędów, trening najsłabszych słów i trening słuchu.
- **Motywacja**: XP, dzienny cel, seria dni 🔥 oraz wykres z ostatnich 7 dni.
- **Moje słówka**: własna lista z kategoriami, import i eksport CSV, osobny trening.
- **Aplikacja na telefon (PWA)**: na telefonie wybierz „Dodaj do ekranu głównego”. Działa bez internetu.
- Tryb jasny i ciemny, kopia zapasowa postępu (plik JSON).

Poprzednia wersja aplikacji jest w folderze [`klasyczna/`](klasyczna/). Słówka zapisane w niej w tej samej przeglądarce są **automatycznie importowane** do nowej wersji.

## Uruchomienie

- **GitHub Pages** (zalecane): *Settings → Pages → Deploy from a branch → `main` / (root)*. Aplikacja będzie pod adresem `https://<użytkownik>.github.io/wloski-polski/`.
- **Lokalnie**: otwórz `index.html` w przeglądarce. Wszystko działa, oprócz instalacji jako aplikacja (PWA wymaga serwera). Możesz też uruchomić `python3 -m http.server` i wejść na `http://localhost:8000`.

## Struktura

```
index.html            szkielet aplikacji
css/style.css         wygląd (zmienne kolorów, tryb ciemny)
js/course.js          TREŚĆ KURSU, poziom A1, oraz lista poziomów (LEVELS)
js/course-a2.js       TREŚĆ KURSU, poziom A2
js/config.js          konfiguracja Firebase (puste = bez kont)
js/core.js            sprawdzanie odpowiedzi, zapis stanu, powtórki (SRS), mowa, rozpoznawanie mowy
js/sync.js            konta i synchronizacja (Firebase), scalanie postępu z kilku urządzeń
js/lesson.js          generowanie ćwiczeń i przebieg lekcji
js/app.js             ekrany: Nauka, Powtórki, Słówka, Profil
sw.js                 service worker (tryb offline)
manifest.webmanifest  instalacja jako aplikacja
firestore.rules       reguły bezpieczeństwa bazy danych (do wklejenia w Firebase)
klasyczna/            poprzednia wersja
```

Bez frameworków i bez kroku budowania: wystarczy edytować pliki i zrobić commit.

### Dodawanie treści

Lekcje są w `js/course.js` (A1) i `js/course-a2.js` (A2). Nowy poziom dodaje się jako kolejny plik, wpis w `LEVELS` w `js/course.js` i `<script>` w `index.html` przed `course.js`. Słowo to `['włoski', 'polski', 'notatka (opcjonalnie)']`. Warianty poprawnej odpowiedzi rozdziela się ukośnikiem, np. `'dzisiaj/dziś'`. Zdanie to `['Zdanie po włosku.', 'Zdanie po polsku.']`.

Po większych zmianach podbij `VERSION` w `sw.js`, żeby telefony pobrały nową wersję.

## Konta i synchronizacja (Firebase)

Bez konfiguracji aplikacja działa jak dotąd: postęp zostaje tylko w przeglądarce. Aby włączyć konta:

1. Wejdź na [console.firebase.google.com](https://console.firebase.google.com) i wybierz projekt (albo utwórz nowy; Google Analytics nie jest potrzebne).
2. **Project settings → General → Your apps → ikona `</>` (Web)**. Nadaj nazwę i zarejestruj aplikację (bez Firebase Hosting). Skopiuj wartości `apiKey`, `authDomain`, `projectId` i `appId` do pliku **`js/config.js`**.
3. **Build → Authentication → Get started → Sign-in method**:
   - włącz **Google**,
   - włącz **Email/Password**, a w nim opcję **Email link (passwordless sign-in)**.
4. **Authentication → Settings → Authorized domains → Add domain** i dodaj `chris690219.github.io` (adres Twojej strony na GitHub Pages).
5. **Build → Firestore Database → Create database**. Wybierz *production mode* i lokalizację, np. `europe-central2 (Warsaw)`.
6. W **Firestore → Rules** wklej zawartość pliku **`firestore.rules`** i kliknij **Publish**. Te reguły sprawiają, że każdy widzi i zmienia wyłącznie własny postęp.
7. Zrób commit `js/config.js` na `main`. Po chwili w zakładce **Profil** pojawi się karta „Konto i synchronizacja”.

Darmowy plan Firebase (Spark) w zupełności wystarczy: jedna synchronizacja to jeden odczyt i jeden zapis, a limit wynosi kilkadziesiąt tysięcy operacji dziennie.

**Jak działa synchronizacja.** Aplikacja zapisuje wszystko najpierw w przeglądarce. Po zalogowaniu, kilka sekund po każdej zmianie, pobiera stan z chmury, scala go z lokalnym i zapisuje wynik w obu miejscach. Scalanie nie gubi postępu z żadnego urządzenia: XP liczone jest dzień po dniu, lekcje według najlepszego wyniku, a słowa według najnowszej powtórki. „Wyzeruj postęp” i „Wczytaj kopię” wygrywają ze starszymi danymi z chmury. Przy braku internetu synchronizacja odbywa się po odzyskaniu połączenia.

Wartości w `js/config.js` są publiczne z założenia: Firebase przekazuje je każdej przeglądarce. Dane chronią reguły z `firestore.rules`.

## Osobiste kody odblokowujące

Wszystkie lekcje (także poziom A2) można odblokować kodem. Każdy kod jest **osobisty**: działa tylko na koncie, dla którego został wygenerowany.

**Jak to działa**
1. Zalogowany uczeń włącza w Profilu „Odblokuj wszystkie lekcje” (albo klika „Poproś o kod” w nagłówku poziomu) i wysyła prośbę, opcjonalnie z krótką wiadomością.
2. Administrator widzi prośby w Profilu, w karcie „🛡️ Prośby o kod”. Liczba oczekujących pojawia się też na zakładce Profil.
3. Po kliknięciu „Zatwierdź” aplikacja generuje kod w formacie `ITA-XXXX-XXXX`. Przycisk „📧 Wyślij e-mail” otwiera gotową wiadomość do ucznia z kodem.
4. Uczeń wpisuje kod i wszystkie lekcje się odblokowują. Administrator widzi, czy kod został już użyty.

**Ustawienie administratora (jednorazowo)**
1. Zaloguj się w aplikacji i w Profilu, w karcie „Konto i synchronizacja”, skopiuj **ID konta**.
2. W konsoli Firebase otwórz **Firestore Database → Data → Start collection**. Nazwa kolekcji: `admins`. **Document ID**: wklej swoje ID konta. Dodaj dowolne pole, np. `role` = `admin`, i zapisz.
3. Wklej aktualną zawartość `firestore.rules` w **Firestore → Rules** i kliknij **Publish**.
4. Odśwież aplikację. W Profilu pojawi się karta „🛡️ Prośby o kod”.

Administratorów nie zapisuje się w kodzie aplikacji, więc ich adresy e-mail nie są publiczne. Kolejnego administratora dodaje się tak samo, kolejnym dokumentem w `admins`.

**Bezpieczeństwo:** sam kod widzi tylko administrator (kolekcja `unlockCodes`). Uczeń ma w swojej prośbie jedynie skrót kodu, którym aplikacja sprawdza wpisany kod. Lekcje są jednak częścią strony, więc to zabezpieczenie dla zwykłych użytkowników, a nie ochrona przed osobą techniczną.

Bez planu płatnego Firebase aplikacja nie wysyła powiadomień o nowych prośbach. Sprawdzaj je w Profilu, a e-mail z kodem wysyłasz jednym kliknięciem.
