import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { HomeComponent } from './features/home/home.component';
import { ApiContratosComponent } from './features/api-contratos/api-contratos.component';
import { ApiAuthComponent } from './features/api-auth/api-auth.component';
import { ApiAmbientesComponent } from './features/api-ambientes/api-ambientes.component';
import { ApiExemplosComponent } from './features/api-exemplos/api-exemplos.component';
import { ApiTestarComponent } from './features/api-testar/api-testar.component';
import { ApiSdksComponent } from './features/api-sdks/api-sdks.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'apis/:slug/contratos', component: ApiContratosComponent },
      { path: 'apis/:slug/autenticacao', component: ApiAuthComponent },
      { path: 'apis/:slug/ambientes', component: ApiAmbientesComponent },
      { path: 'apis/:slug/exemplos', component: ApiExemplosComponent },
      { path: 'apis/:slug/testar', component: ApiTestarComponent },
      { path: 'apis/:slug/sdks', component: ApiSdksComponent },
      { path: 'apis/:slug', redirectTo: 'apis/:slug/contratos', pathMatch: 'full' },
      { path: '**', redirectTo: '' },
    ],
  },
];
