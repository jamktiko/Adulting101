// import { Component, inject } from '@angular/core';
// import { DataService } from '../../services/data.service';

// @Component({
//   selector: 'app-category',
//   imports: [],
//   templateUrl: './category.html',
//   styleUrl: './category.css',
// })
// export class Category {
//   dataService = inject(DataService);
// }

import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
// import { toSignal } from '@angular/core';

@Component({
  selector: 'app-category',
  imports: [],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  category = signal<string | null>(null);
  data = signal<any>(null);
  loading = signal(false);

  /*
  Kun komponentti latautuu muistiin, haetaan reitistä id,
  jonka perusteella haetaan komponenttiin id:tä vastaava sisältö.
  */
  // ngOnInit(): void {
  //   this.route.paramMap.subscribe((params) => {
  //     const pageId = params.get('category');
  //     // Haetaan sisältötaulukko palvelimelta. Se tulee sisään content-muuttujassa
  //     this.cservice.getContent().subscribe((content) => {
  //       // Haetaan sisältötaulukosta olio, jonka id on sama kuin reitistä haettu id.
  //       // valitun "sivun" sisältö menee pageContent-muuttujaan
  //       this.pageContent = content.find((content) => content.id === pageId);
  //     });
  //   });
  // }

  // constructor() {
  //   effect(() => {
  //     // Lue kategoria reitistä
  //     const categoryParam = this.route.snapshot.paramMap.get('category');
  //     this.category.set(categoryParam);

  //     if (!categoryParam) return;

  //     this.loading.set(true);

  //     // Kutsui oikea metodi kategorian perusteella
  //     if (categoryParam === 'moving') {
  //       this.dataService.getMovingData().subscribe({
  //         next: (data) => {
  //           this.data.set(data);
  //           this.loading.set(false);
  //         },
  //         error: () => this.loading.set(false),
  //       });
  //     } else if (categoryParam === 'cleaning') {
  //       this.dataService.getCleaningData().subscribe({
  //         next: (data) => {
  //           this.data.set(data);
  //           this.loading.set(false);
  //         },
  //         error: () => this.loading.set(false),
  //       });
  //     }
  //   });
  // }
}
