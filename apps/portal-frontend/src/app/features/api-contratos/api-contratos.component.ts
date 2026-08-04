import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../core/services/api.service';
import { ApiDetail, EndpointSummary } from '../../core/models/api.models';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

interface ErrorRow {
  status: string;
  description: string;
}

@Component({
  selector: 'app-api-contratos',
  standalone: true,
  imports: [
    CommonModule,
    JsonPipe,
    MatExpansionModule,
    MatChipsModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './api-contratos.component.html',
  styleUrl: './api-contratos.component.scss',
})
export class ApiContratosComponent implements OnInit {
  detail: ApiDetail | null = null;
  endpoints: EndpointSummary[] = [];
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
        this.endpoints = this.buildEndpointList(detail);
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  errorRows(endpoint: EndpointSummary): ErrorRow[] {
    const responses = endpoint.operation.responses ?? {};
    return Object.entries(responses)
      .filter(([status]) => status.startsWith('4') || status.startsWith('5'))
      .map(([status, response]) => ({
        status,
        description: response.description ?? '',
      }));
  }

  successResponses(endpoint: EndpointSummary): [string, unknown][] {
    const responses = endpoint.operation.responses ?? {};
    return Object.entries(responses).filter(([status]) => status.startsWith('2'));
  }

  requestBodySchema(endpoint: EndpointSummary): unknown {
    const content = endpoint.operation.requestBody?.content?.['application/json'];
    return content?.schema ?? null;
  }

  responseSchema(response: unknown): unknown {
    const content = (response as { content?: Record<string, { schema?: unknown }> })?.content?.[
      'application/json'
    ];
    return content?.schema ?? null;
  }

  private buildEndpointList(detail: ApiDetail): EndpointSummary[] {
    const items: EndpointSummary[] = [];
    const paths = detail.openapi?.paths ?? {};
    Object.entries(paths).forEach(([path, pathItem]) => {
      HTTP_METHODS.forEach((method) => {
        const operation = (pathItem as Record<string, unknown>)[method];
        if (operation) {
          items.push({ path, method, operation: operation as EndpointSummary['operation'] });
        }
      });
    });
    return items;
  }
}
