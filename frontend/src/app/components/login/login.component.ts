import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="text-center mb-4">Iniciar Sesión</h2>
              
              <div *ngIf="error" class="alert alert-danger">
                {{error}}
              </div>

              <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" 
                         class="form-control" 
                         id="email" 
                         name="email"
                         [(ngModel)]="credentials.email" 
                         required>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Contraseña</label>
                  <input type="password" 
                         class="form-control" 
                         id="password" 
                         name="password"
                         [(ngModel)]="credentials.password" 
                         required>
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" 
                          class="btn btn-primary"
                          [disabled]="!loginForm.form.valid || loading">
                    {{loading ? 'Cargando...' : 'Iniciar Sesión'}}
                  </button>
                  <button type="button" 
                          class="btn btn-outline-primary"
                          routerLink="/register">
                    Crear cuenta
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
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };
  loading = false;
  error = '';
  returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Captura la URL de retorno de los parámetros de consulta si existe
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
    });
    
    // Si ya está autenticado, redirigir al inicio
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.error = 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
        this.loading = false;
        console.error('Error de login:', error);
      }
    });
  }
} 