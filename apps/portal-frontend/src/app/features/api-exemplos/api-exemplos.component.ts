import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

import { ApiService } from '../../core/services/api.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { ApiDetail, EndpointSummary } from '../../core/models/api.models';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

@Component({
  selector: 'app-api-exemplos',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatProgressSpinnerModule, MatListModule],
  templateUrl: './api-exemplos.component.html',
  styleUrl: './api-exemplos.component.scss',
})
export class ApiExemplosComponent implements OnInit {
  detail: ApiDetail | null = null;
  endpoints: EndpointSummary[] = [];
  docsContent = new Map<string, string>();
  loading = true;
  loadError = false;

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
        this.endpoints = this.buildEndpointList(detail);
        this.loading = false;
        detail.docs.forEach((doc) => {
          this.apiService.getDocContent(slug, doc.fileName).subscribe((content) => {
            this.docsContent.set(doc.fileName, content);
          });
        });
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  curlExample(endpoint: EndpointSummary): string {
    if (!this.detail) return '';
    const env = this.environmentService.currentEnvironment();
    const baseUrl = this.detail.environments[env] ?? '';
    const authHeader = this.authHeaderFor(this.detail.meta.auth);
    const hasBody = ['post', 'put', 'patch'].includes(endpoint.method);
    const bodyExample = hasBody ? this.exampleBodyFromSchema(endpoint) : null;

    const lines = [
      `curl -X ${endpoint.method.toUpperCase()} "${baseUrl}${endpoint.path}" \\`,
      `  -H "${authHeader}" \\`,
      `  -H "Content-Type: application/json"${bodyExample ? ' \\' : ''}`,
    ];
    if (bodyExample) {
      lines.push(`  -d '${JSON.stringify(bodyExample, null, 2)}'`);
    }
    return lines.join('\n');
  }

  private authHeaderFor(auth: string): string {
    switch (auth) {
      case 'apiKey':
        return 'X-API-Key: SEU_API_KEY';
      case 'bearer':
        return 'Authorization: Bearer SEU_TOKEN';
      case 'oauth2':
        return 'Authorization: Bearer SEU_ACCESS_TOKEN';
      default:
        return 'Authorization: SEU_TOKEN';
    }
  }

  private exampleBodyFromSchema(endpoint: EndpointSummary): Record<string, unknown> | null {
    const schema = endpoint.operation.requestBody?.content?.['application/json']?.schema as
      | { properties?: Record<string, { example?: unknown }> }
      | undefined;
    if (!schema?.properties) return null;
    const body: Record<string, unknown> = {};
    Object.entries(schema.properties).forEach(([key, value]) => {
      body[key] = value.example ?? '';
    });
    return body;
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
