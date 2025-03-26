import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CartService } from './services/cart.service';
import { ProductService } from './services/product.service';
import { CurrencyService } from './services/currency.service';
import { CartPriceService } from './services/cart-price.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    CartService,
    ProductService,
    CurrencyService,
    CartPriceService
  ]
}; 