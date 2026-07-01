# Włoski ↔ Polski — Nauka słówek

Offline aplikacja do nauki włoskiego (jeden plik HTML, dane w `localStorage`).

## Jak wystawić na GitHub Pages

1. Stwórz nowe repozytorium na GitHub (np. `wloski-polski`) — może być publiczne lub prywatne (Pages działa dla obu w planie darmowym, o ile repo jest publiczne; dla prywatnego repo Pages wymaga GitHub Pro).
2. Wgraj plik `index.html` (i ten `README.md`, opcjonalnie) do repozytorium — root katalogu, bez podfolderów.
3. Wejdź w **Settings → Pages** w repozytorium.
4. W sekcji **Build and deployment** wybierz:
   - Source: **Deploy from a branch**
   - Branch: **main** (lub `master`), folder: **/ (root)**
5. Kliknij **Save**. Po chwili (1–2 min) GitHub poda adres:
   `https://<twoja-nazwa-uzytkownika>.github.io/<nazwa-repo>/`
6. Otwórz ten adres — aplikacja powinna działać identycznie jak lokalnie.

## Ważne uwagi

- **localStorage jest przypisany do domeny** — jeśli korzystasz z aplikacji zarówno lokalnie (plik na dysku), jak i na GitHub Pages, to są to **dwa niezależne zestawy danych** (różne "źródła" w oczach przeglądarki). Słówka i statystyki się nie zsynchronizują automatycznie między nimi.
- Żeby przenieść słówka między wersjami, użyj przycisku **💾 Eksportuj plik** w aplikacji — pobierze on nowy plik HTML z wbudowanymi słówkami (`EMBEDDED_WORDS`), który możesz wgrać z powrotem do repo jako nowy `index.html`.
- Aktualizacja słówek na GitHub Pages = commit nowego `index.html` do repo (np. przez przeglądarkę: "Edit this file" albo `git push`).

## Aktualizacja przez git (opcjonalnie)

```bash
git clone https://github.com/<twoja-nazwa-uzytkownika>/<nazwa-repo>.git
cd <nazwa-repo>
# skopiuj nowy index.html tutaj
git add index.html
git commit -m "Update vocabulary"
git push
```

Po push GitHub Pages automatycznie przebuduje stronę (kilkadziesiąt sekund do 1–2 minut).
