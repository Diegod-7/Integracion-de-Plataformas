import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface WebpayConfirmationResponse {
  vci: string;
  amount: number;
  status: string;
  buy_order: string;
  session_id: string;
  card_detail: {
    card_number: string;
  };
  accounting_date: string;
  transaction_date: string;
  authorization_code: string;
  payment_type_code: string;
  response_code: number;
  installments_number: number;
}

interface WebpayError {
  error: string;
  details?: string;
  message?: string;
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
export class PaymentConfirmationComponent implements OnInit {
  loading: boolean = true;
  success: boolean = false;
  orderNumber: string = '';
  errorMessage: string = '';
  amount: number = 0;
  authorizationCode: string = '';
  cardNumber: string = '';
  transactionDate: string = '';
  responseCode: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Obtener todos los parámetros de la URL
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token_ws');
    const tbkToken = params.get('TBK_TOKEN');
    const tbkOrdenCompra = params.get('TBK_ORDEN_COMPRA');
    const tbkIdSesion = params.get('TBK_ID_SESION');

    console.log('URL Parameters:', { token, tbkToken, tbkOrdenCompra, tbkIdSesion });
    
    if (token) {
      this.confirmPayment(token);
    } else if (tbkToken || tbkOrdenCompra || tbkIdSesion) {
      this.loading = false;
      this.success = false;
      this.errorMessage = 'La transacción fue cancelada o expiró';
    } else {
      this.loading = false;
      this.success = false;
      this.errorMessage = 'No se encontraron parámetros de la transacción';
    }
  }

  async confirmPayment(token: string) {
    try {
      const response = await this.http.post<WebpayConfirmationResponse>(
        'http://localhost:3000/api/webpay/confirm',
        { token_ws: token }
      ).toPromise();
      
      console.log('Confirmation Response:', response);

      this.loading = false;
      if (response && response.status === 'AUTHORIZED') {
        this.success = true;
        this.orderNumber = response.buy_order;
        this.amount = response.amount;
        this.authorizationCode = response.authorization_code;
        this.cardNumber = response.card_detail.card_number;
        this.transactionDate = response.transaction_date;
      } else {
        this.success = false;
        this.responseCode = response?.response_code || null;
        this.errorMessage = 'La transacción no fue autorizada';
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      this.loading = false;
      this.success = false;
      
      if (error instanceof HttpErrorResponse) {
        const webpayError = error.error as WebpayError;
        this.errorMessage = webpayError.message || webpayError.details || 'Error al confirmar el pago';
      } else {
        this.errorMessage = 'Error al confirmar el pago';
      }
    }
  }
} 