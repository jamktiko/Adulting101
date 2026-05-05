import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-category',
  imports: [],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  category = this.dataService.categoryTitle;
  content = signal<any>(null);
  loading = signal(false);

  constructor() {
    // effect suoritetaan aina kun joku sen "seuraama" signaali muuttuu
    effect(() => {
      // Haetaan reitistä kategoria categoryParam-muuttujaan
      const categoryParam = this.route.snapshot.paramMap.get('category');

      if (!categoryParam) return;

      this.loading.set(true);

      // Kutsutaan servicen metodia ja jos dataa saadaan, se sijoitetaan content-signaalimuuttujaan
      this.dataService.getTopicData(categoryParam).subscribe({
        next: (data) => {
          this.content.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }
}
