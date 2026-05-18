import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { TopicData } from '../../models/topic-data';

@Component({
  selector: 'app-category',
  imports: [RouterLink],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  category = this.dataService.categoryTitle;
  topicData = signal<TopicData[]>([]);
  loading = signal(false);
  categoryColor = signal<string>('#fef08a'); // default yellow
  categoryBorderColor = signal<string>('#fde047'); // default yellow border

  constructor() {
    // effect suoritetaan aina kun joku sen "seuraama" signaali muuttuu
    effect(() => {
      // Haetaan reitistä kategoria categoryParam-muuttujaan
      const categoryParam = this.route.snapshot.paramMap.get('category');

      if (!categoryParam) return;

      if (categoryParam === 'moving') {
        this.categoryColor.set('#a183ff');
        this.categoryBorderColor.set('#8966ff');
      } else if (categoryParam === 'cleaning') {
        this.categoryColor.set('#fd82b6');
        this.categoryBorderColor.set('#f965a3');
      } else if (categoryParam === 'finances') {
        this.categoryColor.set('#ff9d5c');
        this.categoryBorderColor.set('#ff8738');
      }

      this.loading.set(true);

      // Kutsutaan servicen metodia ja jos dataa saadaan, se sijoitetaan topicData-signaalimuuttujaan
      this.dataService.getTopicData(categoryParam).subscribe({
        next: (data) => {
          this.topicData.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }
}
