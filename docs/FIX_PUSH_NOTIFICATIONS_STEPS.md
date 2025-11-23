# Ghid Pas-cu-Pas pentru Repararea Notificărilor Push pe iOS (TestFlight)

Analizând screenshot-urile tale, situația este următoarea:
1.  **Expo Credentials (Screenshot 3):** Ai un "Push Key" (p8) configurat corect. Aceasta este metoda modernă și recomandată de Apple/Expo.
2.  **Apple Developer (Screenshot 6):** Îți arată "Certificates (0)". **NU** ai nevoie de acele certificate SSL dacă folosești "Push Key" de la punctul 1. Poți ignora acea fereastră.
3.  **Expo Dashboard (Screenshot 1):** "No data available" înseamnă că Expo nu a înregistrat cereri valide de trimitere, cel mai probabil din cauza token-ului sau a configurării profilului.

## Problema Identificată
Deși ai activat "Push Notifications" în Apple Developer (Screenshot 4), **Provisioning Profile-ul** tău (Screenshot 2) este din **8 Noiembrie**. Dacă ai activat notificările pe Apple Developer *după* acea dată, profilul este vechi și nu conține permisiunea ("entitlement") necesară pentru a primi notificări.

Fără acest entitlement în profil, aplicația de pe TestFlight nu primește un token valid de la Apple, deci nu poate primi notificări.

---

## Pasul 1: Regenerarea Profilului de Provizionare (Obligatoriu)

Trebuie să forțăm Expo (EAS) să regenereze profilul de provizionare pentru a include permisiunea de Push Notifications.

1.  Deschide terminalul în VS Code.
2.  Rulează comanda pentru un nou build de iOS:
    ```powershell
    eas build --platform ios --profile production --auto-submit
    ```
    *(Sau `--profile preview` dacă folosești profilul de preview, dar pentru TestFlight e de obicei production)*.
3.  **FOARTE IMPORTANT:** În timpul procesului de build, EAS te va întreba dacă vrei să refolosești credențialele existente sau să le regenerezi.
    *   Dacă te întreabă de **Provisioning Profile**, alege opțiunea de a **genera unul nou** (sau "Setup new credentials").
    *   EAS va detecta că ai activat "Push Notifications" în Apple Developer și va crea un profil nou care include această permisiune.

## Pasul 2: Verificarea Token-ului

După ce noul build este instalat pe telefon (prin TestFlight):
1.  Deschide aplicația.
2.  Asigură-te că ești logat.
3.  Aplicația ar trebui să ceară permisiunea de notificări (dacă nu a făcut-o deja).
4.  În baza de date Supabase, verifică tabela `profiles` pentru utilizatorul tău.
    *   Câmpul `expo_push_token` trebuie să conțină un token care începe cu `ExponentPushToken[...]`.

## Pasul 3: Testarea Manuală

Pentru a verifica dacă totul funcționează fără a aștepta un trigger din bază:
1.  Mergi la [Expo Push Notification Tool](https://expo.dev/notifications).
2.  Copiază token-ul tău din baza de date (`ExponentPushToken[...]`).
3.  Lipește-l în tool și trimite un mesaj de test.
4.  Dacă primești eroarea `DeviceNotRegistered`, înseamnă că build-ul vechi nu avea permisiunile corecte (ceea ce rezolvăm la Pasul 1).

## Rezumat
Nu îți lipsesc certificate (Screenshot 6 e irelevant când ai Key). Problema este că **Provisioning Profile-ul** (Screenshot 2) a fost generat *înainte* să activezi serviciul de Push pe Apple, deci build-ul actual nu are "dreptul" să primească notificări.

**Soluție:** Un nou `eas build` care să regenereze profilul.