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
}
