import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../core/services/api.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { ApiDetail } from '../../core/models/api.models';

@Component({
  selector: 'app-api-ambientes',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './api-ambientes.component.html',
  styleUrl: './api-ambientes.component.scss',
})
export class ApiAmbientesComponent implements OnInit {
  detail: ApiDetail | null = null;
  loading = true;
  loadError = false;
  displayedColumns = ['environment', 'url'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
    readonly environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.apiService.getApiDetail(slug).subscribe({
      next: (detail) => {
        this.detail = detail;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  get environmentRows(): { environment: string; url: string }[] {
    if (!this.detail) return [];
    return Object.entries(this.detail.environments).map(([environment, url]) => ({
      environment,
      url,
    }));
  }
}
