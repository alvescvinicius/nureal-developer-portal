import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { ApiService } from '../../core/services/api.service';
import { ApiSummary } from '../../core/models/api.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  apis: ApiSummary[] = [];
  loading = true;
  loadError = false;

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.listApis().subscribe({
      next: (apis) => {
        this.apis = apis;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }
}
