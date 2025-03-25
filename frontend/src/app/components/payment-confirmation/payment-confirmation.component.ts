import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface WebpayConfirmationResponse {
  status: string;
  buy_order: string;
}

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-body text-center">
          <div *ngIf="loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Procesando tu pago...</p>
          </div>

          <div *ngIf="!loading && success">
            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
            <h3 class="mt-3">¡Pago exitoso!</h3>
            <p>Tu compra ha sido procesada correctamente.</p>
            <p>Número de orden: {{orderNumber}}</p>
            <button class="btn btn-primary mt-3" routerLink="/products">
              Volver a la tienda
            </button>
          </div>

          <div *ngIf="!loading && !success">
            <i class="fas fa-times-circle text-danger" style="font-size: 4rem;"></i>
            <h3 class="mt-3">Error en el pago</h3>
            <p>{{errorMessage}}</p>
            <button class="btn btn-primary mt-3" routerLink="/cart">
              Volver al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      max-width: 500px;
      margin: 0 auto;
    }
  `]
})
export class PaymentConfirmationComponent implements OnInit {
  loading: boolean = true;
  success: boolean = false;
  orderNumber: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token_ws');
    
    if (token) {
      this.confirmPayment(token);
    } else {
      this.loading = false;
      this.success = false;
      this.errorMessage = 'No se encontró el token de la transacción';
    }
  }

  async confirmPayment(token: string) {
    try {
      const response = await this.http.post<WebpayConfirmationResponse>(
        `http://localhost:3000/api/webpay/confirm/${token}`, 
        {}
      ).toPromise();
      
      this.loading = false;
      if (response && response.status === 'AUTHORIZED') {
        this.success = true;
        this.orderNumber = response.buy_order;
      } else {
        this.success = false;
        this.errorMessage = 'La transacción no fue autorizada';
      }
    } catch (error) {
      this.loading = false;
      this.success = false;
      this.errorMessage = 'Error al confirmar el pago';
      console.error('Error confirming payment:', error);
    }
  }
} 