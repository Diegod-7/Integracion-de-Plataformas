import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { CartPriceService } from '../../services/cart-price.service';
import { CartItem } from '../../models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Carrito de Compras</h2>
      
      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-body">
              <div *ngIf="cartItems.length === 0" class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted">Tu carrito está vacío</p>
                <button class="btn btn-primary" routerLink="/products">
                  Continuar comprando
                </button>
              </div>

              <div *ngIf="cartItems.length > 0">
                <div class="list-group">
                  <div *ngFor="let item of cartItems" class="list-group-item">
                    <div class="d-flex align-items-center">
                      <img [src]="item.product.imageUrl || 'assets/placeholder.jpg'" 
                           [alt]="item.product.name"
                           class="rounded me-3"
                           style="width: 80px; height: 80px; object-fit: cover;">
                      <div class="flex-grow-1">
                        <h5 class="mb-1">{{item.product.name}}</h5>
                        <small class="text-muted">Precio: {{formatPrice(item.product.price)}}</small>
                      </div>
                      <div class="d-flex align-items-center">
                        <select class="form-select form-select-sm me-2" 
                                style="width: 80px;"
                                [ngModel]="item.quantity"
                                (change)="updateQuantity(item.id, $event)">
                          <option *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]" [value]="i">
                            {{i}}
                          </option>
                        </select>
                        <button class="btn btn-outline-danger btn-sm"
                                (click)="removeItem(item.id)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="mt-2 text-end">
                      <small class="text-muted">
                        Total: {{formatPrice(item.product.price * item.quantity)}}     
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Resumen del Pedido</h5>
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{{formatPrice(total)}}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong>{{formatPrice(total)}}</strong>
              </div>
              <button class="btn btn-primary w-100"
                      [disabled]="cartItems.length === 0"
                      (click)="goToCheckout()">
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-group-item {
      border-left: none;
      border-right: none;
    }
    .list-group-item:first-child {
      border-top: none;
    }
    .list-group-item:last-child {
      border-bottom: none;
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  exchangeRate: number = 850; // Valor predeterminado

  constructor(
    private cartService: CartService,
    private cartPriceService: CartPriceService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener tasa de cambio actual
    this.currencyService.getExchangeRate().subscribe(rate => {
      this.exchangeRate = rate;
      console.log('Carrito: Tasa de cambio actualizada:', rate);
    });
    
    // Usar el servicio cartPriceService para obtener items con precios convertidos
    this.cartPriceService.getConvertedItems().subscribe(items => {
      console.log('Carrito: Items con precios convertidos recibidos:', items);
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  updateQuantity(id: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const quantity = parseInt(select.value);
    
    this.cartService.updateQuantity(id, quantity);
  }

  removeItem(id: number) {
    this.cartService.removeItem(id);
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
  }

  formatPrice(price: number): string {
    return this.currencyService.formatCLP(price);
  }

  goToCheckout() {
    this.router.navigate(['/payment']);
  }
} 