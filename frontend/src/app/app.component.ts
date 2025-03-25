import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    
    <router-outlet></router-outlet>

    <footer class="bg-dark text-light py-4 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h5>FerreMax</h5>
            <p>Tu ferretería de confianza para todos tus proyectos.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <h5>Contacto</h5>
            <p>
              <i class="fas fa-envelope me-2"></i>contacto&#64;ferremax.cl<br>
              <i class="fas fa-phone me-2"></i>(+56) 2 2123 4567
            </p>
          </div>
        </div>
        <hr class="my-4">
        <div class="text-center">
          <p class="mb-0">&copy; 2024 FerreMax. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    footer {
      margin-top: auto;
    }
  `]
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
  }
} 