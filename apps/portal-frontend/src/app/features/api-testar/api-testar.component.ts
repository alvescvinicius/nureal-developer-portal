import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

import { ApiService } from '../../core/services/api.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { ApiDetail, EndpointSummary, TryApiResponsePayload } from '../../core/models/api.models';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

@Component({
  selector: 'app-api-testar',
  standalone: true,
  imports: [
    CommonModule,
    JsonPipe,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatCardModule,
  ],
  templateUrl: './api-testar.component.html',
  styleUrl: './api-testar.component.scss',
})
export class ApiTestarComponent implements OnInit {
  slug = '';
  detail: ApiDetail | null = null;
  endpoints: EndpointSummary[] = [];
  loading = true;
  loadError = false;

  selectedEndpoint: EndpointSummary | null = null;
  pathParamValues: Record<string, string> = {};
  queryParamValues: Record<string, string> = {};
  headerValues: Record<string, string> = {};
  bodyText = '';
  bodyError = '';

  sending = false;
  sendError = '';
  response: TryApiResponsePayload | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
    readonly environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.slug = slug;

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

  onEndpointChange(): void {
    this.pathParamValues = {};
    this.queryParamValues = {};
    this.headerValues = { ...this.defaultAuthHeader() };
    this.response = null;
    this.sendError = '';
    this.bodyError = '';

    const endpoint = this.selectedEndpoint;
    if (!endpoint) {
      this.bodyText = '';
      return;
    }

    (endpoint.operation.parameters ?? []).forEach((param) => {
      if (param.in === 'path') this.pathParamValues[param.name] = '';
      if (param.in === 'query') this.queryParamValues[param.name] = '';
    });

    const schema = endpoint.operation.requestBody?.content?.['application/json']?.schema as
      | { properties?: Record<string, { example?: unknown }> }
      | undefined;
    if (schema?.properties) {
      const example: Record<string, unknown> = {};
      Object.entries(schema.properties).forEach(([key, value]) => {
        example[key] = value.example ?? '';
      });
      this.bodyText = JSON.stringify(example, null, 2);
    } else {
      this.bodyText = '';
    }
  }

  get pathParamNames(): string[] {
    return Object.keys(this.pathParamValues);
  }

  get queryParamNames(): string[] {
    return Object.keys(this.queryParamValues);
  }

  get hasRequestBody(): boolean {
    if (!this.selectedEndpoint) return false;
    return ['post', 'put', 'patch'].includes(this.selectedEndpoint.method);
  }

  buildResolvedPath(): string {
    if (!this.selectedEndpoint) return '';
    let path = this.selectedEndpoint.path;
    Object.entries(this.pathParamValues).forEach(([name, value]) => {
      path = path.replace(`{${name}}`, encodeURIComponent(value || `{${name}}`));
    });
    return path;
  }

  send(): void {
    if (!this.selectedEndpoint) return;
    this.sendError = '';
    this.bodyError = '';
    this.response = null;

    let parsedBody: unknown = undefined;
    if (this.hasRequestBody && this.bodyText.trim()) {
      try {
        parsedBody = JSON.parse(this.bodyText);
      } catch {
        this.bodyError = 'JSON inválido no corpo da requisição.';
        return;
      }
    }

    this.sending = true;
    this.apiService
      .tryApi(this.slug, {
        environment: this.environmentService.currentEnvironment(),
        path: this.buildResolvedPath(),
        method: this.selectedEndpoint.method,
        headers: this.headerValues,
        query: this.queryParamValues,
        body: parsedBody,
      })
      .subscribe({
        next: (res) => {
          this.response = res;
          this.sending = false;
        },
        error: (err) => {
          this.sendError = err?.error?.error ?? 'Falha ao chamar a API.';
          this.sending = false;
        },
      });
  }

  private defaultAuthHeader(): Record<string, string> {
    switch (this.detail?.meta.auth) {
      case 'apiKey':
        return { 'X-API-Key': 'SEU_API_KEY' };
      case 'bearer':
      case 'oauth2':
        return { Authorization: 'Bearer SEU_TOKEN' };
      default:
        return {};
    }
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
