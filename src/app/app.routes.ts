import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/auth.service';

const signedIn = async () => {
  const auth = inject(AuthService);
  if (auth.authenticated()) return true;
  await auth.login(location.href);
  return false;
};

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'shop', redirectTo: '' },
  { path: 'shop/:id', redirectTo: '' },
  { path: 'cart', loadComponent: () => import('./pages/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', loadComponent: () => import('./pages/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'account', canActivate: [signedIn], loadComponent: () => import('./pages/account.component').then(m => m.AccountComponent) },
  { path: 'app', loadComponent: () => import('./pages/app-delivery.component').then(m => m.AppDeliveryComponent) },
  { path: 'impressum', loadComponent: () => import('./pages/legal-impressum.component').then(m => m.LegalImpressumComponent) },
  { path: 'datenschutz', loadComponent: () => import('./pages/legal-privacy.component').then(m => m.LegalPrivacyComponent) },
  { path: 'widerruf', loadComponent: () => import('./pages/legal-withdrawal.component').then(m => m.LegalWithdrawalComponent) },
  { path: 'produktsicherheit', loadComponent: () => import('./pages/legal-safety.component').then(m => m.LegalSafetyComponent) },
  { path: '**', redirectTo: '' },
];
