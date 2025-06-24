import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyService } from '../../services/currency.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Order, OrderDetail } from '../../models/order.model';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface WebpayResult {
  buyOrder: string;
  sessionId: string;
  cardDetails: {
    cardNumber: string;
    cardExpirationDate: string;
  };
  transactionDate: string;
  vci: string;
  urlRedirection: string;
  amount: number;
  status: string;
  [key: string]: any;
}

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-confirmation.component.html',
  styles: [`
    .card {
      max-width: 600px;
      margin: 0 auto;
    }
    .text-start {
      text-align: left;
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .text-start p {
      margin-bottom: 0.5rem;
    }
    ul {
      margin-bottom: 0;
      padding-left: 20px;
    }
  `]
})
export class PaymentConfirmationComponent implements OnInit, OnDestroy {
  paymentResult: WebpayResult | null = null;
  loading: boolean = true;
  error: string | null = null;
  orderSuccess: boolean = false;
  private queryParamsSub: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private currencyService: CurrencyService,
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    // Obtener los parámetros de la URL
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      const token_ws = params['token_ws'];
      
      if (!token_ws) {
        this.error = 'No se recibió un token de transacción válido.';
        this.loading = false;
        return;
      }
      
      // Confirmar la transacción con el backend
      this.http.post<WebpayResult>('http://localhost:3000/api/webpay/confirm', { token_ws })
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            console.log('Resultado del pago:', result);
            this.paymentResult = result;
            
            // Verificar si el pago fue exitoso
            if (result.status === 'AUTHORIZED') {
              // Simulamos que se guardó la orden correctamente
              this.simulateSaveOrder(result);
            } else {
              this.loading = false;
            }
          },
          error: (error: Error) => {
            console.error('Error al confirmar el pago:', error);
            this.error = 'Ocurrió un error al procesar el pago. Por favor, contacte con soporte.';
            this.loading = false;
          }
        });
    });
  }

  ngOnDestroy() {
    // Cancelar todas las suscripciones pendientes
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
  }

  // Reemplazamos el método saveOrder con una simulación
  simulateSaveOrder(paymentResult: WebpayResult): void {
    try {
      // Generar un ID único para la orden basado en la fecha y un valor aleatorio
      const orderId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Obtener los productos del carrito de manera sincrónica
      const cartItems = this.cartService.getItemsSync();
      
      // Crear los detalles de la orden desde los items del carrito
      const orderDetails: OrderDetail[] = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      // Crear la orden con ID único
      const order: Order = {
        id: orderId,
        orderNumber: paymentResult.buyOrder,
        total: paymentResult.amount,
        status: 'Pagado',
        paymentMethod: 'Webpay',
        createdAt: new Date(),
        details: orderDetails
      };
      
      // Guardar la orden usando el servicio
      this.orderService.createOrder(order)
        .pipe(take(1))
        .subscribe({
          next: (savedOrder) => {
            console.log('Orden guardada:', savedOrder);
            
            // Vaciar el carrito después de guardar la orden
            this.cartService.clearCart();
            
            this.orderSuccess = true;
            this.loading = false;
          },
          error: (error: Error) => {
            console.error('Error al guardar la orden:', error);
            this.error = 'El pago fue procesado correctamente, pero hubo un error al registrar la orden.';
            this.loading = false;
          }
        });
    } catch (err) {
      console.error('Error al procesar la orden:', err);
      this.error = 'Ocurrió un error al procesar la orden.';
      this.loading = false;
    }
  }

  formatPrice(price: number): string {
    return this.currencyService.formatCLP(price);
  }

  goToHome() {
    this.router.navigate(['/products']);
  }
} 