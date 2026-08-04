import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ApiService } from '../../core/services/api.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { ApiSummary, EnvironmentName } from '../../core/models/api.models';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  apis: ApiSummary[] = [];
  loadError = false;

  constructor(
    private readonly apiService: ApiService,
    readonly environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.apiService.listApis().subscribe({
      next: (apis) => (this.apis = apis),
      error: () => (this.loadError = true),
    });
  }

  onEnvironmentChange(env: EnvironmentName): void {
    this.environmentService.setEnvironment(env);
  }
}
