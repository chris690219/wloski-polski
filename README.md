# Włoski z Polskim 🇮🇹🇵🇱

Darmowa aplikacja do nauki włoskiego dla Polaków, w stylu Duolingo. Działa w przeglądarce, także offline. Konta z synchronizacją są opcjonalne.

## Co potrafi

- **Kurs A1**: 11 jednostek, 33 lekcje, ponad 200 słów i 100 zdań. Każda jednostka ma wskazówki gramatyczne pisane z myślą o Polakach (wymowa, rodzajniki, *essere/avere*, fałszywi przyjaciele…).
- **Ścieżka nauki**: kolejne lekcje odblokowują się po ukończeniu poprzednich. Wszystkie lekcje naraz można odblokować w ustawieniach po podaniu kodu dostępu. Kod ustawia się w `js/config.js` (pole `unlockCodeHash`, instrukcja w komentarzu).
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
js/course.js          TREŚĆ KURSU: jednostki, lekcje, słowa, zdania, wskazówki
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

Lekcje są w `js/course.js`. Słowo to `['włoski', 'polski', 'notatka (opcjonalnie)']`. Warianty poprawnej odpowiedzi rozdziela się ukośnikiem, np. `'dzisiaj/dziś'`. Zdanie to `['Zdanie po włosku.', 'Zdanie po polsku.']`.

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
