import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import { PostItNote } from '../post-it-note/post-it-note';
import { Settings } from '../settings/settings';

interface CustomNote {
  id: number;
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
export class Board implements AfterViewInit {
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

    const isOverlapping = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      // Tarkistetaan menevätkö 150x150 laatikot päällekkäin
      return !(
        p1.x + NOTE_WIDTH + 8 <= p2.x ||
        p2.x + NOTE_WIDTH + 8 <= p1.x ||
        p1.y + NOTE_HEIGHT + 8 <= p2.y ||
        p2.y + NOTE_HEIGHT + 8 <= p1.y
      );
    };

    // Alustetaan basePosition jos sitä ei ole vielä kertaakaan asetettu
    this.customNotes.forEach((note) => {
      if (!note.basePosition) {
        note.basePosition = { ...note.position };
      }
    });

    // Järjestetään laput ensisijaisesti base-koordinaatin mukaan
    const sortedNotes = [...this.customNotes].sort(
      (a, b) => a.basePosition!.x - b.basePosition!.x || a.basePosition!.y - b.basePosition!.y,
    );
    const placed: { x: number; y: number }[] = [];

    sortedNotes.forEach((note) => {
      // Lasketaan sijainti alkuperäisen paikan perusteella, ei nykyisen rajoitetun sijainnin
      let newPos = snap(note.basePosition!.x, note.basePosition!.y, rect.width, rect.height);

      let overlap = true;
      let failsafe = 0;

      // Haetaan ensimmäinen vapaa paikka alaspäin
      while (overlap && failsafe < 200) {
        overlap = placed.some((p) => isOverlapping(newPos, p));
        if (overlap) {
          newPos.y += GRID_SIZE; // Siirretään ruudukon verran alaspäin
          if (newPos.y + NOTE_HEIGHT > rect.height - PADDING) {
            newPos.y = PADDING; // Aloitetaan ylhäältä
            newPos.x += GRID_SIZE * 2; // Siirrytään hieman oikealle
            if (newPos.x + NOTE_WIDTH > rect.width - PADDING) {
              // Taulu ei enää riitä estämään limitystä, pakotetaan pysäytys
              break;
            }
          }
        }
        failsafe++;
      }

      placed.push({ ...newPos });

      // Päivitetään cdkDragille uusi sijainti vain jos se muuttui
      if (newPos.x !== note.position.x || newPos.y !== note.position.y) {
        note.position = newPos;
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addNote() {
    if (this.newNote.title.trim() === '') return;

    this.customNotes.push({
      ...this.newNote,
      id: this.noteIdCounter++,
      isDeletable: true,
      position: { x: 50, y: 350 }, // Oletussijainti uusille lapuille alareunaan
      basePosition: { x: 50, y: 350 },
    });

    this.newNote = { id: 0, title: '', content: '', color: '#fbcfe8' };
    this.showAddForm = false;
  }

  // Raahauksen logiikat
  onDragMove(event: CdkDragMove, note: CustomNote) {
    this.isDragging = true;
    if (!this.boardRef) return;
    const rect = this.boardRef.nativeElement.getBoundingClientRect();
    const pointer = event.pointerPosition;

    // Laske offset hiiren sijainnista ja laske ghost-snäppäys.
    // Oletus: CdkDragFreeDragPosition asennetaan elementtiin joka on 'position: absolute; top:0; left:0;'
    const x = pointer.x - rect.left - NOTE_WIDTH / 2;
    const y = pointer.y - rect.top - NOTE_HEIGHT / 2;

    this.ghostPosition = snap(x, y, rect.width, rect.height);
  }

  onDragEnd(event: CdkDragEnd, note: CustomNote) {
    if (this.ghostPosition) {
      note.position = { ...this.ghostPosition };
      note.basePosition = { ...this.ghostPosition }; // Koska käyttäjä raahasi sen tähän, se on uusi koti
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
    if (this.noteToDelete !== null) {
      this.customNotes = this.customNotes.filter((note) => note.id !== this.noteToDelete);
      this.noteToDelete = null; // Sulkee vahvistusikkunan
    }
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

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    this.router.navigate(['/login']);
  }
}
