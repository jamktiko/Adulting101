import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';
import { Checklist } from '../models/checklist';
import { Guide } from '../models/guide';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const muutto: Checklist[] = [
      {
        id: 'muutto-001',
        title: 'Vuokra-asujan muistilista',
        items: [
          'Tarkista vuokrasopimuksen irtisanomisaika',
          'Tarkista, sisältyykö vuokraan vesi ja sähkö',
          'Allekirjoita vuokrasopimus',
          'Kuvaa asunnon viat ennen kuin muutat',
          'Tee muuttoilmoitus',
          'Hanki kotivakuutus',
          'Hanki sähkösopimus ja internetliittymä',
        ],
      },
      {
        id: 'muutto-002',
        title: 'Poismuuttajan muistilista',
        items: [
          'Tee muuttoilmoitus',
          'Irtisano sähkösopimus ja netti',
          'Jätä asunto sellaiseen kuntoon, jossa olet sen vastaanottanut',
          'Muista siivota myös kaappien päältä sekä hellan takaa',
          'Siirrä kotivakuutus uuteen osoitteeseen tai katkaise kotivakuutus',
          'Sovi avainten palautuksesta',
          'Sovi takuuvuokran takaisinmaksusta',
        ],
      },
    ];

    const siivous: Guide[] = [
      {
        id: 'siivous-001',
        title: 'Pyykkäys',
        content: [
          'Lajittele vaatteet värin mukaan',
          'Tarkista, mitä ainetta laitetaan mihinkin pyykkikoneen lokeroon',
          'Älä täytä konetta liian täyteen',
          'Käytä oikeaa pesuainetta ja annostele se oikein',
          'Valitse oikea pesuohjelma vaatteiden materiaalin mukaan',
          'Älä unohda tarkistaa vaatteiden taskuja ennen pesua',
          'Kuivaa vaatteet oikein, vältä liiallista kuivaamista',
        ],
      },
      {
        id: 'siivous-002',
        title: 'Imurointi',
        content: [
          'Muista ostaa pölypusseja',
          'Tarkista, että imuri on ehjä ja toimii',
          'Imuroi säännöllisesti, vähintään kerran viikossa',
          'Imuroi kaikki pinnat, myös matot, sohvat ja verhot',
          'Älä unohda imuroida nurkkia ja kalusteiden alle',
          'Puhdista imurin suodatin säännöllisesti',
        ],
      },
      {
        id: 'siivous-003',
        title: 'Kierrätys',
        content: [
          'Tarkista, missä on lähin kierrätyspiste',
          'Lajittele jätteet oikein: paperi, kartonki, metalli, lasi, muovi ja sekajäte',
          'Puhdista kierrätykseen menevät astiat ennen lajittelua',
          'Älä laita kierrätykseen vaarallisia jätteitä, kuten paristoja tai lääkkeitä',
          'Vältä laittamasta kierrätykseen likaista tai märkiä jätteitä',
          'Muista, että kierrätys on tärkeää ympäristön kannalta',
        ],
      },
    ];

    const talous: Guide[] = [
      {
        id: 'talous-001',
        title: 'Arjen rahankäyttö',
        content: [
          'Tee realistinen kuukausibudjetti ja tarkista tilanne esim. kerran viikossa',
          'Priorisoi pakolliset menot ensin',
          'Vältä impulssiostoksia – anna itsellesi "harkinta-aika" ennen ostamista',
          'Seuraa toistuvia tilauksia (suoratoistopalvelut ym.) ja karsi turhat',
        ],
      },
      {
        id: 'talous-002',
        title: 'Säästäminen ja varautuminen',
        content: [
          'Rakenna puskurirahasto (tavoite esim. 2-3 kuukauden menot)',
          'Siirrä edes pieni summa säästöön joka kuukausi',
          'Hyödynnä automaattinen säästäminen (siirto heti palkkapäivänä)',
          'Säästä myös epäsäännöllisiin menoihin (esim. vakuutukset, lomat, kodin hankinnat)',
          'Avaa erillinen säästötili, jotta rahat eivät sekoitu käyttörahaan',
        ],
      },
      {
        id: 'talous-003',
        title: 'Laskut ja sopimukset',
        content: [
          'Ota e-lasku ja/tai suoramaksu käyttöön, jotta laskut eivät unohdu',
          'Pidä kalenterimuistutukset eräpäivistä',
          'Jos et pysty maksamaan laskua, ota yhteyttä laskuttajaan ja sovi maksusuunnitelma',
          'Kilpailuta säännöllisesti sopimukset (puhelin, sähkö, vakuutukset)',
        ],
      },
      {
        id: 'talous-004',
        title: 'Velka ja luotto',
        content: [
          'Vältä korkeakorkoisia pikavippejä ja kulutusluottoja',
          'Ymmärrä korko ja todellinen vuosikorko ennen lainaa',
          'Älä ota lainaa, jos et ole varma takaisinmaksukyvystäsi',
          'Maksa luottokorttilasku aina kokonaan, jos mahdollista',
          'Jos velkaa on, priorisoi korkeakorkoiset pois ensin',
        ],
      },
      {
        id: 'talous-005',
        title: 'Tulot',
        content: [
          'Pidä huolta oikeasta veroprosentista (ettei tule mätkyjä)',
          'Selvitä mahdolliset tuet (opintotuki, asumistuki jne.)',
        ],
      },
      {
        id: 'talous-006',
        title: 'Turvallisuus ja pitkän aikavälin suunnittelu',
        content: [
          'Hanki perusvakuutukset (ainakin kotivakuutus)',
          'Aloita sijoittaminen pienesti, kun perusasiat kunnossa',
        ],
      },
    ];

    return { muutto, siivous, talous };
  }
}
