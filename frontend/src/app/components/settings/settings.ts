import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  @Output() closeSettings = new EventEmitter<void>();

  close() {
    this.closeSettings.emit();
  }

  changeTheme(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const theme = selectElement.value;

    // Poistaa vanhat teemat ja asettaa uuden root-elementtiin
    document.documentElement.setAttribute('data-theme', theme);
  }

  changeFont(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const font = selectElement.value;

    // Asettaa livenä CSS muuttujan koko sovelluksen käyttöön
    document.documentElement.style.setProperty('--app-font', font);
  }
}
