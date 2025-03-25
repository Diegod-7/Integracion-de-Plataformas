import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  template: `
    <div class="container mt-4">
      <h2 class="text-center mb-4">Carrito de Compras</h2>
      
      <div class="row" *ngIf="cartItems.length > 0; else emptyCart">
        <div class="col-md-8">
          <div class="card mb-3" *ngFor="let item of cartItems">
            <div class="row g-0">
              <div class="col-md-2">
                <img [src]="item.imageUrl || 'assets/placeholder.jpg'" 
                     class="img-fluid rounded-start" 
                     [alt]="item.name"
                     style="height: 100px; object-fit: cover;">
              </div>
              <div class="col-md-10">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title">{{item.name}}</h5>
                    <button class="btn btn-danger btn-sm" 
                            (click)="removeItem(item.id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <p class="card-text">
                    <small class="text-muted">Precio: {{item.price | currency}}</small>
                  </p>
                  <div class="d-flex align-items-center">
                    <div class="input-group" style="width: 130px;">
                      <button class="btn btn-outline-secondary" 
                              (click)="updateQuantity(item.id, item.quantity - 1)">-</button>
                      <input type="number" class="form-control text-center" 
                             [value]="item.quantity"
                             (change)="updateQuantity(item.id, $event.target.value)">
                      <button class="btn btn-outline-secondary" 
                              (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
                    </div>
                    <p class="ms-3 mb-0">
                      Total: {{item.price * item.quantity | currency}}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Resumen del pedido</h5>
              <hr>
              <div class="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <span>{{total | currency}}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>{{total | currency}}</strong>
              </div>
              <button class="btn btn-primary w-100" 
                      (click)="goToCheckout()"
                      [disabled]="cartItems.length === 0">
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #emptyCart>
        <div class="text-center">
          <img src="assets/empty-cart.png" alt="Carrito vacío" 
               style="max-width: 200px; margin-bottom: 20px;">
          <h3>Tu carrito está vacío</h3>
          <p>¡Agrega algunos productos para comenzar!</p>
          <button class="btn btn-primary" routerLink="/products">
            Ir a la tienda
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .input-group input {
      text-align: center;
    }
    .input-group input::-webkit-outer-spin-button,
    .input-group input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .input-group input[type=number] {
      -moz-appearance: textfield;
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getItems().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  updateQuantity(productId: number, quantity: number) {
    this.cartService.updateQuantity(productId, Number(quantity));
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
} 