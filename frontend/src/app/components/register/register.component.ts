import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="text-center mb-4">Crear Cuenta</h2>
              
              <div *ngIf="error" class="alert alert-danger">
                {{error}}
              </div>

              <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
                <div class="mb-3">
                  <label for="name" class="form-label">Nombre completo</label>
                  <input type="text" 
                         class="form-control" 
                         id="name" 
                         name="name"
                         [(ngModel)]="userData.name" 
                         required>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" 
                         class="form-control" 
                         id="email" 
                         name="email"
                         [(ngModel)]="userData.email" 
                         required>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Contraseña</label>
                  <input type="password" 
                         class="form-control" 
                         id="password" 
                         name="password"
                         [(ngModel)]="userData.password" 
                         required
                         minlength="6">
                  <small class="form-text text-muted">
                    La contraseña debe tener al menos 6 caracteres
                  </small>
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" 
                          class="btn btn-primary"
                          [disabled]="!registerForm.form.valid || loading">
                    {{loading ? 'Cargando...' : 'Crear cuenta'}}
                  </button>
                  <button type="button" 
                          class="btn btn-outline-primary"
                          routerLink="/login">
                    Ya tengo una cuenta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent implements OnInit {
  userData = {
    name: '',
    email: '',
    password: ''
  };
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Si ya está autenticado, redirigir al inicio
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    this.error = '';

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        if (error.status === 400 && error.error?.message) {
          this.error = error.error.message;
        } else {
          this.error = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
        }
        console.error('Error de registro:', error);
        this.loading = false;
      }
    });
  }
} 