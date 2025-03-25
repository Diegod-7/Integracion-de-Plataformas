import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';

interface WebpayResponse {
  url: string;
  token: string;
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
  `]
})
export class PaymentComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  showingTransferData: boolean = false;
  isLoggedIn: boolean = false;
  customerName: string = '';
  discount: number = 0;

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
  }

  async payWithWebpay() {
    try {
      const response = await this.http.post<WebpayResponse>('http://localhost:3000/api/webpay/create', {
        buyOrder: Date.now().toString(),
        sessionId: 'session-' + Date.now(),
        amount: this.total,
        returnUrl: 'http://localhost:4200/payment/confirmation'
      }).toPromise();

      if (response && response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error al iniciar el pago. Por favor intente nuevamente.');
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