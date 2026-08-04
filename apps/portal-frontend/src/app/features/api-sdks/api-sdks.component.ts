import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../core/services/api.service';
import { ApiDetail } from '../../core/models/api.models';

interface SdkInfo {
  language: string;
  packageManager: string;
  installCommand: string;
  usageSnippet: string;
}

@Component({
  selector: 'app-api-sdks',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './api-sdks.component.html',
  styleUrl: './api-sdks.component.scss',
})
export class ApiSdksComponent implements OnInit {
  detail: ApiDetail | null = null;
  loading = true;
  loadError = false;
  sdks: SdkInfo[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    readonly apiService: ApiService,
  ) {}

  environmentKeys(): string[] {
    return Object.keys(this.detail?.environments ?? {});
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.apiService.getApiDetail(slug).subscribe({
      next: (detail) => {
        this.detail = detail;
        this.sdks = this.buildSdkPlaceholders(slug);
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  private buildSdkPlaceholders(slug: string): SdkInfo[] {
    const pkgName = `@nureal/${slug}-sdk`;
    const pyPkgName = `nureal-${slug}`;
    return [
      {
        language: 'JavaScript / TypeScript',
        packageManager: 'npm',
        installCommand: `npm install ${pkgName}`,
        usageSnippet: `import { ${this.pascalCase(slug)}Client } from '${pkgName}';\n\nconst client = new ${this.pascalCase(
          slug,
        )}Client({ apiKey: process.env.NUREAL_API_KEY, environment: 'PRD' });\n\nconst result = await client.list();\nconsole.log(result);`,
      },
      {
        language: 'Python',
        packageManager: 'pip',
        installCommand: `pip install ${pyPkgName}`,
        usageSnippet: `from ${pyPkgName.replace(/-/g, '_')} import Client\n\nclient = Client(api_key="SEU_API_KEY", environment="PRD")\nresult = client.list()\nprint(result)`,
      },
      {
        language: 'Java',
        packageManager: 'Maven',
        installCommand: `<dependency>\n  <groupId>br.com.nureal</groupId>\n  <artifactId>${slug}-sdk</artifactId>\n  <version>1.0.0</version>\n</dependency>`,
        usageSnippet: `${this.pascalCase(slug)}Client client = new ${this.pascalCase(
          slug,
        )}Client.Builder()\n    .apiKey("SEU_API_KEY")\n    .environment(Environment.PRD)\n    .build();\n\nvar result = client.list();`,
      },
    ];
  }

  private pascalCase(value: string): string {
    return value
      .split(/[-_]/g)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
