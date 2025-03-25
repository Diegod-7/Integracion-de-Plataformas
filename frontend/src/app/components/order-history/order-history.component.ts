import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Historial de Pedidos</h2>
      
      <div *ngIf="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3">Cargando historial de pedidos...</p>
      </div>
      
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div *ngIf="!loading && !error">
        <div *ngIf="orders.length === 0" class="alert alert-info">
          No tienes pedidos realizados aún. <a routerLink="/products" class="alert-link">Comienza a comprar</a>
        </div>
        
        <div *ngFor="let order of uniqueOrders; let i = index" class="card mb-4" style="box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Pedido #{{ order.orderNumber }}</h5>
              <span class="badge" 
                    [ngClass]="{
                      'bg-success': order.status === 'Pagado' || order.status === 'Entregado',
                      'bg-warning': order.status === 'En proceso' || order.status === 'Enviado',
                      'bg-danger': order.status === 'Cancelado'
                    }">
                {{ order.status }}
              </span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="mb-3">
              <p class="text-muted mb-1">Fecha: {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="text-muted mb-1">Método de pago: {{ order.paymentMethod }}</p>
              <p class="mb-0"><strong>Total: {{ formatPrice(order.total) }}</strong></p>
            </div>
            
            <div *ngIf="order.details && order.details.length > 0">
              <h6 class="border-bottom pb-2">Productos:</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cantidad</th>
                      <th class="text-end">Precio</th>
                      <th class="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of order.details">
                      <td>{{ item.productName }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">{{ formatPrice(item.price) }}</td>
                      <td class="text-end">{{ formatPrice(item.price * item.quantity) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="card-footer text-end bg-white">
            <a href="#" class="btn btn-sm btn-outline-primary" (click)="$event.preventDefault()">Ver detalles</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.8rem;
      padding: 0.35em 0.65em;
    }
    .card {
      border: none;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .card-header {
      border-top-left-radius: 8px !important;
      border-top-right-radius: 8px !important;
    }
    .table th, .table td {
      padding: 0.5rem;
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  uniqueOrders: Order[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        
        // Eliminar posibles duplicados basados en el ID
        const orderMap = new Map<number | undefined, Order>();
        orders.forEach(order => {
          if (order.id) {
            orderMap.set(order.id, order);
          }
        });
        
        // Convertir el mapa a un array y ordenar por fecha (más reciente primero)
        this.uniqueOrders = Array.from(orderMap.values()).sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar los pedidos:', err);
        this.error = 'Error al cargar el historial de pedidos. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return this.currencyService.formatCLP(price);
  }
} 