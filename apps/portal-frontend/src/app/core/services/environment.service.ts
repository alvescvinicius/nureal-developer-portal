import { Injectable, signal } from '@angular/core';
import { EnvironmentName } from '../models/api.models';

const STORAGE_KEY = 'nureal-portal-environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  readonly environments: EnvironmentName[] = ['DEV', 'HML', 'PRD'];

  private readonly currentEnvironmentSignal = signal<EnvironmentName>(this.readInitialValue());

  readonly currentEnvironment = this.currentEnvironmentSignal.asReadonly();

  setEnvironment(env: EnvironmentName): void {
    this.currentEnvironmentSignal.set(env);
    try {
      localStorage.setItem(STORAGE_KEY, env);
    } catch {
      // localStorage indisponível - ignora silenciosamente
    }
  }

  private readInitialValue(): EnvironmentName {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'DEV' || stored === 'HML' || stored === 'PRD') {
        return stored;
      }
    } catch {
      // ignora
    }
    return 'DEV';
  }
}
