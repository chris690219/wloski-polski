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
    apiKey: 'AIzaSyCSRtplvt8ebwh0IR1xbgVrvAetcg8P85w',
    authDomain: 'nauka-wloskiego.firebaseapp.com',
    projectId: 'nauka-wloskiego',
    storageBucket: 'nauka-wloskiego.firebasestorage.app',
    messagingSenderId: '601644761718',
    appId: '1:601644761718:web:57d5a5b1ac282badda1557',
  },
};
