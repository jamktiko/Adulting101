import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import { PostItNote } from '../post-it-note/post-it-note';
import { Settings } from '../settings/settings';

interface CustomNote {
  id: number;
  dbId?: string; //tietokannan _id, jos tallennettu
  title: string;
  content?: string;
  color: string;
  route?: string;
  isDeletable: boolean;
  position: { x: number; y: number };
  basePosition?: { x: number; y: number };
}

const GRID_SIZE = 25;
const NOTE_WIDTH = 150;
const NOTE_HEIGHT = 150;
const PADDING = 8;

function snap(x: number, y: number, maxX: number, maxY: number) {
  let sx = Math.round(x / GRID_SIZE) * GRID_SIZE;
  let sy = Math.round(y / GRID_SIZE) * GRID_SIZE;

  sx = Math.max(PADDING, Math.min(sx, maxX - NOTE_WIDTH - PADDING));
  sy = Math.max(PADDING, Math.min(sy, maxY - NOTE_HEIGHT - PADDING));

  return { x: sx, y: sy };
}

@Component({
  selector: 'app-board',
  imports: [PostItNote, FormsModule, CdkDrag, Settings],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements AfterViewInit, OnInit {
  @ViewChild('boardArea') boardRef!: ElementRef;
  private router = inject(Router);

  showSettingsModal = false;
  showAddForm = false;
  newNote: Omit<CustomNote, 'position' | 'isDeletable'> = {
    id: 0,
    title: '',
    content: '',
    color: '#fbcfe8',
  };

  // Yhdistetään navigointi- ja kustomit laput samaan arrayhin hallinnan helpottamiseksi
  customNotes: CustomNote[] = [
    {
      id: -1,
      title: 'Arkivinkit',
      color: '#99fd81',
      route: '/topics',
      isDeletable: false,
      position: { x: 50, y: 150 },
      basePosition: { x: 50, y: 150 },
    },
    {
      id: -2,
      title: 'Budjetti',
      color: '#f8e85a',
      route: '/budgeting',
      isDeletable: false,
      position: { x: 250, y: 150 },
      basePosition: { x: 250, y: 150 },
    },
    {
      id: -3,
      title: 'Viihde',
      color: '#78c3ff',
      route: '/entertainment',
      isDeletable: false,
      position: { x: 450, y: 150 },
      basePosition: { x: 450, y: 150 },
    },
  ];

  noteIdCounter = 1;
  noteToDelete: number | null = null;
  magnifiedNote: CustomNote | null = null;
  isEditingNote = false;

  isDragging = false;
  ghostPosition: { x: number; y: number } | null = null;

  // Resoluutiosta riippuva dynaaminen koko skaalaukselle
  noteScale = 1.0;

  private readonly backendApiBase = 'https://375jfhty7h.execute-api.eu-north-1.amazonaws.com/api';

  ngAfterViewInit() {
    // Varmistetaan minimaalisella viiveellä että DOM ja elementtien koot on laskettu
    setTimeout(() => {
      this.ensureNotesInBounds();
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.ensureNotesInBounds();
  }

  ensureNotesInBounds() {
    if (!this.boardRef) return;
    const rect = this.boardRef.nativeElement.getBoundingClientRect();

    // Suojakerroin: ei päivitetä jos alue ei ole vielä kunnolla ruudulla
    if (rect.width === 0 || rect.height === 0) return;

    // Alustetaan basePosition jos sitä ei ole vielä kertaakaan asetetu
    this.customNotes.forEach((note) => {
      if (!note.basePosition) {
        note.basePosition = { ...note.position };
      }
    });

    const isOverlapping = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      scale: number,
    ) => {
      const w = NOTE_WIDTH * scale;
      const h = NOTE_HEIGHT * scale;
      return !(
        p1.x + w + 8 <= p2.x ||
        p2.x + w + 8 <= p1.x ||
        p1.y + h + 8 <= p2.y ||
        p2.y + h + 8 <= p1.y
      );
    };

    const sortedNotes = [...this.customNotes].sort(
      (a, b) => a.basePosition!.x - b.basePosition!.x || a.basePosition!.y - b.basePosition!.y,
    );

    let placed: { x: number; y: number }[] = [];
    let scale = 1.0;
    const minScale = 0.4;
    const scaleStep = 0.1;
    let placementFound = false;

    // Kokeillaan sijoitusta eri koko-skaaloilla
    while (!placementFound && scale >= minScale) {
      placed = [];
      let fitAll = true;

      for (const note of sortedNotes) {
        let newX = Math.max(
          PADDING,
          Math.min(note.basePosition!.x, rect.width - NOTE_WIDTH * scale - PADDING),
        );
        let newY = Math.max(
          PADDING,
          Math.min(note.basePosition!.y, rect.height - NOTE_HEIGHT * scale - PADDING),
        );

        let newPos = { x: newX, y: newY };
        let overlap = true;
        let failsafe = 0;

        // Etsitään vapaa paikka
        while (overlap && failsafe < 500) {
          overlap = placed.some((p) => isOverlapping(newPos, p, scale));
          if (overlap) {
            newPos.x += GRID_SIZE; // Kokeillaan ensin siirtää oikealle
            if (newPos.x + NOTE_WIDTH * scale > rect.width - PADDING) {
              newPos.x = PADDING; // Rivin vaihto
              newPos.y += GRID_SIZE; // Siirretään alaspäin
              // Jos loppuu korkeussuunnassa tila, alue ei riitä!
              if (newPos.y + NOTE_HEIGHT * scale > Math.max(rect.height, 600) - PADDING) {
                fitAll = false;
                break;
              }
            }
          }
          failsafe++;
        }

        if (!fitAll) break; // Ei mahtunut tällä skaalalla

        placed.push({ ...newPos });
      }

      if (fitAll) {
        placementFound = true; // Mahtui!
      } else {
        scale -= scaleStep; // Pienennetään skaalaa ja yritetään uudelleen
      }
    }

    if (!placementFound) {
      // Jos ei mahtunut edes minimiskaalalla, pakotetaan minimiin ja hyväksytään overlap
      scale = minScale;
      // Ajetaan minimillä, vaikka menisi päällekkäin
      placed = [];
      for (const note of sortedNotes) {
        let newPos = {
          x: Math.max(
            PADDING,
            Math.min(note.basePosition!.x, rect.width - NOTE_WIDTH * scale - PADDING),
          ),
          y: Math.max(
            PADDING,
            Math.min(note.basePosition!.y, rect.height - NOTE_HEIGHT * scale - PADDING),
          ),
        };
        let overlap = true;
        let failsafe = 0;
        while (overlap && failsafe < 100) {
          overlap = placed.some((p) => isOverlapping(newPos, p, scale));
          if (overlap) {
            newPos.x += GRID_SIZE;
            if (newPos.x + NOTE_WIDTH * scale > rect.width - PADDING) {
              newPos.x = PADDING;
              newPos.y += GRID_SIZE;
              if (newPos.y + NOTE_HEIGHT * scale > Math.max(rect.height, 600) - PADDING) {
                break;
              }
            }
          }
          failsafe++;
        }
        placed.push({ ...newPos });
      }
    }

    // Päivitetään skaala HTML:ää varten, koko gridi skaalautuu kerralla täsmälleen suhteessa
    this.noteScale = scale;

    // Päivitetään koordinaatit
    sortedNotes.forEach((note, index) => {
      const newPos = placed[index];
      if (newPos.x !== note.position.x || newPos.y !== note.position.y) {
        note.position = newPos;
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  async addNote() {
    const title = this.newNote.title.trim();
    const content = (this.newNote.content ?? '').trim();

    if (!title) return;

    // Jos haluat varmasti että DB-tallennus onnistuu, vaadi sisältöä:
    if (!content) return;

    const createdNote: CustomNote = {
      id: this.noteIdCounter++,
      title,
      content,
      color: this.newNote.color,
      isDeletable: true,
      position: { x: 50, y: 350 }, // Oletussijainti uusille lapuille alareunaan
      basePosition: { x: 50, y: 350 },
    };

    this.customNotes.push(createdNote);

    if (this.isLoggedIn()) {
      this.saveNotesToLocalStorage();
      try {
        await this.saveNoteToDb(createdNote);
        this.saveNotesToLocalStorage(); // tallennetaan dbId mukaan
      } catch (e) {
        console.error('Tietokantatallennus epäonnistui (lappu jäi localStorageen)', e);
      }
    }

    this.newNote = { id: 0, title: '', content: '', color: '#fbcfe8' };
    this.showAddForm = false;
  }

  // Raahauksen logiikat
  onDragMove(event: CdkDragMove, note: CustomNote) {
    this.isDragging = true;
    if (!this.boardRef) return;
    const rect = this.boardRef.nativeElement.getBoundingClientRect();
    const pointer = event.pointerPosition;

    const scaledWidth = NOTE_WIDTH * this.noteScale;
    const scaledHeight = NOTE_HEIGHT * this.noteScale;

    // Laske offset hiiren sijainnista ja laske ghost-snäppäys huomioiden käynnissä oleva skaala.
    const x = pointer.x - rect.left - scaledWidth / 2;
    const y = pointer.y - rect.top - scaledHeight / 2;

    this.ghostPosition = snap(x, y, rect.width, rect.height);
  }

  onDragEnd(event: CdkDragEnd, note: CustomNote) {
    if (this.ghostPosition) {
      note.position = { ...this.ghostPosition };

      // Koska käyttäjä raahasi sen visuaaliseen kohtaan (joka saattaa olla skaalattu),
      // tallennetaan basePosition skaalaamattomana yhtenäisen pohjapiirroksen varalle:
      note.basePosition = {
        x: this.ghostPosition.x / this.noteScale,
        y: this.ghostPosition.y / this.noteScale,
      };

      event.source.setFreeDragPosition(this.ghostPosition);
      this.ghostPosition = null;
    }

    // Estetään klikkaus nollaamalla raahauslippu pienellä viiveellä (koska click laukeaa dragEndin jälkeen)
    setTimeout(() => {
      this.isDragging = false;
    }, 50);
  }

  deleteCustomNote(id: number) {
    this.noteToDelete = id; // Avaa vahvistusikkunan
  }

  confirmDelete() {
    if (this.noteToDelete === null) return;

    const note = this.customNotes.find((n) => n.id === this.noteToDelete);

    // Poista UI:sta heti
    this.customNotes = this.customNotes.filter((n) => n.id !== this.noteToDelete);

    // Päivitä localStorage (tämä sinulla on jo)
    if (this.isLoggedIn()) {
      this.saveNotesToLocalStorage();
    }

    // Poista myös tietokannasta, jos lapulla on dbId
    if (this.isLoggedIn() && note?.dbId) {
      this.deleteNoteFromDb(note.dbId).catch((e) => {
        console.error('Tietokantapoisto epäonnistui', e);
        // (Halutessa: voit palauttaa lapun UI:hin tässä)
      });
    }

    this.noteToDelete = null;
  }

  cancelDelete() {
    this.noteToDelete = null; // Sulkee vahvistusikkunan
  }

  handleNoteClick(note: CustomNote) {
    if (this.isDragging) return; // Älä tee mitään jos kyseessä oli juuri päättynyt raahaus

    if (note.route) {
      this.router.navigate([note.route]); // Navigointilaput
    } else {
      this.magnifiedNote = note; // Kustomilaput suurennetaan
    }
  }

  closeMagnifiedNote() {
    this.magnifiedNote = null;
    this.isEditingNote = false;
  }

  toggleEditMode() {
    this.isEditingNote = !this.isEditingNote;
  }

  toggleSettingsModal() {
    this.showSettingsModal = !this.showSettingsModal;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    if (!this.isLoggedIn()) return;
    this.loadNotesFromLocalStorage();
  }

  private isLoggedIn(): boolean {
    return !!localStorage.getItem('idToken');
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  private getUserId(): string | null {
    const token = localStorage.getItem('idToken');
    if (!token) return null;
    const payload = this.decodeJwtPayload(token);
    return payload?.sub ?? null; // Cogniton userSub
  }

  private storageKey(userId: string): string {
    return `boardNotes_${userId}`;
  }

  private saveNotesToLocalStorage(): void {
    const userId = this.getUserId();
    if (!userId) return;

    const deletableNotes = this.customNotes.filter((n) => n.isDeletable);
    localStorage.setItem(this.storageKey(userId), JSON.stringify(deletableNotes));
  }

  private loadNotesFromLocalStorage(): void {
    const userId = this.getUserId();
    if (!userId) return;

    const raw = localStorage.getItem(this.storageKey(userId));
    if (!raw) return;

    try {
      const savedNotes = JSON.parse(raw) as CustomNote[];
      const navigationNotes = this.customNotes.filter((n) => !n.isDeletable);

      this.customNotes = [...navigationNotes, ...savedNotes];

      const maxId = savedNotes.reduce((m, n) => Math.max(m, n.id), 0);
      this.noteIdCounter = Math.max(this.noteIdCounter, maxId + 1);
    } catch (e) {
      console.error('Virhe localStorage-muistilapuissa', e);
    }
  }

  private async saveNoteToDb(note: CustomNote): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    const res = await fetch(`${this.backendApiBase}/users/${encodeURIComponent(userId)}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // HUOM: backend tallentaa nyt vain title+content (väri/position ei säily ilman backend-muutosta)
      body: JSON.stringify({ title: note.title, content: note.content ?? '' }),
    });

    if (!res.ok) throw new Error(await res.text());

    const saved = await res.json();
    note.dbId = saved?._id; // server.js palauttaa subdokumentin, jossa yleensä on _id
  }

  private async deleteNoteFromDb(noteDbId: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    const res = await fetch(
      `${this.backendApiBase}/users/${encodeURIComponent(userId)}/notes/${encodeURIComponent(noteDbId)}`,
      { method: 'DELETE' },
    );

    if (!res.ok) throw new Error(await res.text());
  }
}
