import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <i class="fas fa-store me-2"></i>Mi Tienda
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">
                <i class="fas fa-box me-1"></i>Productos
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/cart" routerLinkActive="active">
                <i class="fas fa-shopping-cart me-1"></i>Carrito
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>

    <footer class="bg-dark text-light py-4 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h5>Mi Tienda</h5>
            <p>Tu tienda de confianza para todos tus productos favoritos.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <h5>Contacto</h5>
            <p>
              <i class="fas fa-envelope me-2"></i>contacto&#64;mitienda.com<br>
              <i class="fas fa-phone me-2"></i>(123) 456-7890
            </p>
          </div>
        </div>
        <hr class="my-4">
        <div class="text-center">
          <p class="mb-0">&copy; 2024 Mi Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .navbar {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .navbar-brand {
      font-weight: bold;
    }
    .nav-link {
      font-weight: 500;
    }
    .nav-link.active {
      color: var(--primary-color) !important;
    }
    footer {
      margin-top: auto;
    }
  `]
})
export class AppComponent {
  title = 'Mi Tienda';
} 