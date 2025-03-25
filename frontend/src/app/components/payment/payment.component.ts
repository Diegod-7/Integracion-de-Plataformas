import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';

interface WebpayResponse {
  url: string;
  token: string;
}

interface WebpayError {
  error: string;
  details?: string;
  message?: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment.component.html',
  styles: [`
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .btn-outline-primary {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .btn-outline-primary:hover {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .error-message {
      color: red;
      margin: 10px 0;
      padding: 10px;
      border: 1px solid red;
      border-radius: 4px;
      background-color: rgba(255, 0, 0, 0.1);
    }
  `]
})
export class PaymentComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  showingTransferData: boolean = false;
  isLoggedIn: boolean = false;
  customerName: string = '';
  discount: number = 0;
  errorMessage: string = '';
  isLoading: boolean = false;
  webpayForm: HTMLFormElement | null = null;

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.cartService.getItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    
    if (this.isLoggedIn && this.discount > 0) {
      this.total = this.total * (1 - this.discount / 100);
    }

    // Redondear al entero más cercano
    this.total = Math.round(this.total);
  }

  async payWithWebpay() {
    if (this.isLoading) return;
    if (this.total <= 0) {
      this.errorMessage = 'El monto a pagar debe ser mayor a 0';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const buyOrder = 'O-' + Date.now().toString();
    const sessionId = 'S-' + Date.now().toString();

    try {
      console.log('Iniciando pago con Webpay:', {
        buyOrder,
        sessionId,
        amount: this.total,
        returnUrl: 'http://localhost:4200/payment/confirmation'
      });

      const response = await this.http.post<WebpayResponse>('http://localhost:3000/api/webpay/create', {
        buyOrder,
        sessionId,
        amount: this.total,
        returnUrl: 'http://localhost:4200/payment/confirmation'
      }).toPromise();

      console.log('Respuesta de Webpay:', response);

      if (response && response.url && response.token) {
        // Crear un formulario dinámico para la redirección
        if (this.webpayForm) {
          document.body.removeChild(this.webpayForm);
        }

        this.webpayForm = document.createElement('form');
        this.webpayForm.method = 'POST';
        this.webpayForm.action = response.url;
        this.webpayForm.style.display = 'none';

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = response.token;

        this.webpayForm.appendChild(tokenInput);
        document.body.appendChild(this.webpayForm);

        console.log('Submitting form to Webpay...');
        this.webpayForm.submit();
      } else {
        throw new Error('No se recibió la URL o token de redirección');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      
      if (error instanceof HttpErrorResponse) {
        const webpayError = error.error as WebpayError;
        this.errorMessage = webpayError.message || webpayError.details || 'Error al iniciar el pago. Por favor intente nuevamente.';
      } else {
        this.errorMessage = 'Error al iniciar el pago. Por favor intente nuevamente.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  showTransferData() {
    this.showingTransferData = true;
  }

  showLoginForm() {
    this.isLoggedIn = true;
    this.customerName = 'Juan Pérez';
    this.discount = 10;
    this.calculateTotal();
  }
} 