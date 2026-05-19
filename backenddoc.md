# Backend-arkkitehtuurin dokumentaatio

Tämä dokumentti kuvaa sovelluksen Node.js/Express-taustajärjestelmän (backend) rakenteen, tietoturvakäytännöt, tietokantamallit sekä API-rajapinnat.

## 1. Yleisarkkitehtuuri

Backend on rakennettu Node.js-ympäristöön käyttäen Express-sovelluskehystä. Tietokantana toimii MongoDB (Mongoose ORM) ja käyttäjien tunnistautumisesta (autentikoinnista) huolehtii AWS Cognito.
Sovellus noudattaa kerrosarkkitehtuuria:

1. **Server** (server.js): Sovelluksen käynnistys, globaalit asetukset ja reititykset.
2. **Middleware**: Pyyntöjen esikäsittely (tietoturva, validointi, luvitus).
3. **Models**: Tietokannan skeemat ja rakenteet (Mongoose).
4. **Utils**: Ulkoiset integraatiot (AWS Cognito) ja apufunktiot (Sanitizer).

## 2. Tietoturva ja Middleware-kerros

Palvelimen tietoturva on varmistettu usealla eri tasolla ennen kuin pyynnöt etenevät tietokantaan saakka.
Globaalit Middlewaret

- CORS (cors): Sallii resurssien jakamisen ristiin eri alkuperien välillä (mahdollistaa Angular-frontendin yhteydenpidon).
- Helmet (helmet): Suojaa sovellusta tunnetuilta HTTP-otsikoiden haavoittuvuuksilta.
- Rate Limiter (express-rate-limit): Rajoittaa pyynnöt maksimissaan 100 pyyntöön 15 minuutissa per IP-osoite osoitteessa /api/. Estää palvelunestohyökkäyksiä (DoS) ja raakaa voimaa (Brute-force).
- Cache Control: Estää arkaluontoisen datan tallentumisen selaimen välimuistiin (no-store, no-cache).
  Tietoturva- ja apufunktiot (backend/utils/)
- Sanitizer (sanitizer.js): Estää XSS-hyökkäykset (Cross-Site Scripting) siivoamalla merkkijonoista HTML- ja JavaScript-rakenteet (regex /[<>"']/g) sekä rajoittamalla syötteen pituuden 500 merkkiin.
  Validointi (middleware/validators.js)
  Käyttää express-validator-kirjastoa tarkistamaan saapuvan datan laadun ennen tietokantaoperaatioita. Jos datassa on virheitä, palautetaan välittömästi 400 Bad Request ja virheen yksityiskohdat.
- Budget & Recurring: Varmistaa, että tyypit ovat joko income tai expense, summat ovat liukulukuja (0.01 - 999999.99) ja päivämäärät ISO8601-standardia.
- Signup: Pakottaa vahvan salasanan (vähintään 8 merkkiä, sis. ison kirjaimen, pienen kirjaimen ja numeron) sekä validoi sähköpostiosoitteen.
  Pääsynvalvonta (middleware/authCheck.js)
- Käyttäjän luvitus (authCheck): Varmistaa, että pyynnön tekevä käyttäjä muokkaa vain omia tietojaan vertaamalla URL-parametrin userId-arvoa AWS Cogniton palauttamaan tokenin sisältämään req.user.sub-tunnisteeseen. Mikäli tunnisteet eivät täsmää, palautetaan 403 Forbidden.

## 3. Ulkoiset integraatiot: AWS Cognito (backend/utils/cognito.js)

Käyttäjähallinta on ulkoistettu AWS Cognito -palveluun käyttäen @aws-sdk/client-cognito-identity-provider-kirjastoa. Viestinnässä käytetään turvallisuussyistä laitekohtaista SECRET_HASH-tiivistettä (HMAC-SHA256).

- signUpUser(username, email, password): Rekisteröi käyttäjän Cognitoon.
- confirmUser(username, code): Vahvistaa käyttäjätilin sähköpostiin saadulla koodilla.
- loginUser(username, password): Autentikoi käyttäjän ja palauttaa onnistuessaan JWT-tokenit (idToken, accessToken, refreshToken).

## 4. Tietokantamallit (backend/models/)

MongoDB:ssä käytetään seuraavia Mongoose-malleja:

1. User.js: Käyttäjätili. Tallentaa Cogniton generoiman \_id-tunnisteen (UserSub), käyttäjänimen, sähköpostin, muuttolistan ostetut tuotteet, viikkosiivouksen suoritetut tehtävät sekä muistilaput (sub-document taulukko).
2. Budget.js: Kuukausikohtainen budjetti. Sisältää user_id:n, month-merkkijonon (muodossa YYYY-MM), budjettirajan (monthlyBudgetLimit) ja taulukon yksittäisistä tulo- ja menoriveistä (entries).
3. RecurringEntry.js: Toistuvat tulo- ja menoerät (esim. palkka tai vuokra). Sisältää kentän frequency(viikoittain/kuukausittain).
4. MoveItem.js: Muuttolistan oletustavarat ja niiden kategoriat.
5. CleanItem.js: Viikkosiivouksen vakiotehtävät.
6. Topic.js: Arki-sivun kategorioiden sisällöt ja aiheet.
7. Entertainment.js: Viihde-osion data.

## 5. API-rajapinnat (End-points)

#### Autentikointi

- POST /api/signup - Rekisteröi käyttäjän Cognitoon ja luo vastaavan käyttäjän MongoDB-tietokantaan.
- POST /api/login - Kirjaa käyttäjän sisään ja palauttaa JWT-tokenit.
- POST /api/confirm - Vahvistaa käyttäjätilin sähköpostikoodilla.

#### Käyttäjät & Listat

- GET /api/users - Hakee kaikki järjestelmän käyttäjät (Ylläpito).
- GET /api/users/:userId/move-checklist - Hakee muuttolistan ja merkitsee tuotteet ostetuiksi, jos ne löytyvät käyttäjän profiilista.
- PATCH /api/users/:userId/toggle-move-item - Lisää tai poistaa tuotteen käyttäjän ostetuista tavaroista ($addToSet / $pull).
- GET /api/users/:userId/cleaning-checklist - Hakee viikkosiivouslistan. Huom! Sisältää automaattisen nollauksen (shouldResetWeekly), joka tyhjentää tehtävät uuden viikon alkaessa.
- PATCH /api/users/:userId/toggle-cleaning-task - Merkitsee siivoustehtävän tehdyksi tai tekemättömäksi.

#### Budjetinhallinta

- GET /api/budgets/:userId/:month - Hakee tietyn kuukauden budjettitiedot. Jos dataa ei ole, palauttaa tyhjän taulukon.
- PATCH /api/budgets/:userId/:month/limit - Päivittää tai luo (upsert: true) kuukauden budjettirajan.
- POST /api/budgets/:userId/:month/entry - Lisää yksittäisen tulo- tai menorivin ja suorittaa datan sanitoinnin (XSS-suojaus).
- DELETE /api/budgets/:userId/:month/entry/:entryId - Poistaa yksittäisen budjettimerkinnän ID:n perusteella.
- GET /api/budgets/recurring/:userId - Hakee käyttäjän kaikki toistuvat maksut.
- POST /api/budgets/recurring/:userId - Luo uuden toistuvan maksun.
- DELETE /api/budgets/recurring/:entryId - Poistaa toistuvan maksun.

#### Muistilaput (Notes)

- GET /api/users/:userId/notes - Hakee käyttäjän henkilökohtaiset muistilaput.
- POST /api/users/:userId/notes - Lisää uuden muistilapun käyttäjä-dokumentin sisään.
- DELETE /api/users/:userId/notes/:noteId - Poistaa tietyn muistilapun.

#### Arki-aiheet

- GET /api/topics/:category - Hakee aihealueen sisällöt kategorian mukaan.

## 6. Palvelimen käynnistys

Ympäristömuuttujat ladataan .env-tiedostosta sovelluksen juuresta. Palvelin kuuntelee ympäristömuuttujan määrittämää porttia tai oletuksena porttia 3000.
Käynnistyskehote kehitysympäristössä:
Bash
`node server.js`
tai tarvittaessa
`npm run dev`
