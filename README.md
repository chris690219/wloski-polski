# Włoski z Polskim 🇮🇹🇵🇱

Darmowa aplikacja do nauki włoskiego dla Polaków, w stylu Duolingo. Działa w przeglądarce, offline, bez kont i bez serwera.

## Co potrafi

- **Kurs A1**: 11 jednostek, 33 lekcje, ponad 200 słów i 100 zdań. Każda jednostka ma wskazówki gramatyczne pisane z myślą o Polakach (wymowa, rodzajniki, *essere/avere*, fałszywi przyjaciele…).
- **Ścieżka nauki**: kolejne lekcje odblokowują się po ukończeniu poprzednich (można to wyłączyć w ustawieniach).
- **8 typów ćwiczeń**: nowe słowo, wybór odpowiedzi (IT→PL i PL→IT), łączenie par, pisanie tłumaczenia, dyktando (słuchanie), układanie zdania z kafelków, układanie zdania ze słuchu, wybór tłumaczenia zdania.
- **Wymowa włoska** przez wbudowaną w przeglądarkę syntezę mowy, także w wolnym tempie 🐢.
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
js/core.js            sprawdzanie odpowiedzi, zapis stanu, powtórki (SRS), mowa
js/lesson.js          generowanie ćwiczeń i przebieg lekcji
js/app.js             ekrany: Nauka, Powtórki, Słówka, Profil
sw.js                 service worker (tryb offline)
manifest.webmanifest  instalacja jako aplikacja
klasyczna/            poprzednia wersja
```

Bez frameworków i bez kroku budowania: wystarczy edytować pliki i zrobić commit.

### Dodawanie treści

Lekcje są w `js/course.js`. Słowo to `['włoski', 'polski', 'notatka (opcjonalnie)']`. Warianty poprawnej odpowiedzi rozdziela się ukośnikiem, np. `'dzisiaj/dziś'`. Zdanie to `['Zdanie po włosku.', 'Zdanie po polsku.']`.

Po większych zmianach podbij `VERSION` w `sw.js`, żeby telefony pobrały nową wersję.

## Plany: konta i synchronizacja

Na razie postęp jest zapisany tylko w przeglądarce (`localStorage`). Cały stan to jeden obiekt JSON obsługiwany przez `Storage` w `js/core.js`. Aby dodać konta (np. Supabase lub Firebase), wystarczy podmienić `Storage.adapter` na taki, który zapisuje i wczytuje stan z serwera. Reszta aplikacji nie wymaga zmian.
