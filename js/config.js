/*
 * Konfiguracja kont i synchronizacji (Firebase).
 *
 * Gdy pola są puste, aplikacja działa jak dotąd: bez kont, tylko w przeglądarce.
 * Instrukcja włączenia: README.md → „Konta i synchronizacja”.
 *
 * Wklej tu wartości z konsoli Firebase:
 * Project settings → General → Your apps → (aplikacja Web) → SDK setup and configuration → Config.
 * Te wartości są publiczne z założenia (trafiają do każdej przeglądarki).
 * Dane użytkowników chronią reguły z pliku firestore.rules.
 */
window.WP_CONFIG = {
  firebase: {
    apiKey: '',
    authDomain: '',      // np. 'twoj-projekt.firebaseapp.com'
    projectId: '',
    appId: '',
  },
};
