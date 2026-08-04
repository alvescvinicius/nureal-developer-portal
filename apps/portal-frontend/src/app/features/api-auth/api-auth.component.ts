import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../core/services/api.service';
import { ApiDetail } from '../../core/models/api.models';

@Component({
  selector: 'app-api-auth',
  standalone: true,
  imports: [CommonModule, JsonPipe, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './api-auth.component.html',
  styleUrl: './api-auth.component.scss',
})
export class ApiAuthComponent implements OnInit {
  detail: ApiDetail | null = null;
  loading = true;
  loadError = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
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

  get securitySchemes(): [string, unknown][] {
    return Object.entries(this.detail?.openapi.components?.securitySchemes ?? {});
  }

  authInstructions(): string {
    switch (this.detail?.meta.auth) {
      case 'apiKey':
        return "Envie sua chave de API no header 'X-API-Key' em todas as requisições.";
      case 'bearer':
        return "Envie um token JWT no header 'Authorization: Bearer <token>'.";
      case 'oauth2':
        return 'Obtenha um access token via OAuth2 (client credentials) e envie no header Authorization: Bearer <token>.';
      default:
        return 'Consulte a equipe responsável pela API para detalhes de autenticação.';
    }
  }
}
