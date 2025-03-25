import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <div class="card">
            <div class="card-body">
              <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
              <h2 class="mt-3">¡Pedido Realizado con Éxito!</h2>
              <p class="lead">Gracias por tu compra. Tu pedido ha sido procesado correctamente.</p>
              <p class="text-muted">Te enviaremos un correo electrónico con los detalles de tu pedido.</p>
              <button class="btn btn-primary mt-4" (click)="continueShopping()">
                <i class="fas fa-shopping-bag me-2"></i>Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .text-success {
      color: var(--primary-color) !important;
    }
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .btn-primary:hover {
      background-color: darken(#4CAF50, 10%);
      border-color: darken(#4CAF50, 10%);
    }
  `]
})
export class OrderSuccessComponent {
  constructor(private router: Router) {}

  continueShopping() {
    this.router.navigate(['/products']);
  }
} 