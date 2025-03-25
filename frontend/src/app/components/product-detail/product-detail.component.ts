import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

@Component({
  selector: 'app-product-detail',
  template: `
    <div class="container mt-4" *ngIf="product">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/products">Productos</a></li>
          <li class="breadcrumb-item active">{{product.name}}</li>
        </ol>
      </nav>

      <div class="row">
        <div class="col-md-6">
          <img [src]="product.imageUrl || 'assets/placeholder.jpg'" 
               [alt]="product.name"
               class="img-fluid rounded shadow">
        </div>
        <div class="col-md-6">
          <h2>{{product.name}}</h2>
          <p class="text-muted">Categoría: {{product.category}}</p>
          <p class="h3 text-primary mb-4">{{product.price | currency}}</p>
          
          <div class="mb-4">
            <h4>Descripción</h4>
            <p>{{product.description}}</p>
          </div>

          <div class="mb-4">
            <h4>Stock</h4>
            <p [ngClass]="{'text-success': product.stock > 5, 
                          'text-warning': product.stock <= 5 && product.stock > 0,
                          'text-danger': product.stock === 0}">
              {{product.stock > 0 ? product.stock + ' unidades disponibles' : 'Sin stock'}}
            </p>
          </div>

          <div class="d-flex gap-3 mb-4">
            <div class="input-group" style="width: 130px;">
              <button class="btn btn-outline-secondary" 
                      (click)="decrementQuantity()"
                      [disabled]="quantity <= 1">-</button>
              <input type="number" class="form-control text-center" 
                     [(ngModel)]="quantity" min="1" 
                     [max]="product.stock">
              <button class="btn btn-outline-secondary" 
                      (click)="incrementQuantity()"
                      [disabled]="quantity >= product.stock">+</button>
            </div>
            <button class="btn btn-primary flex-grow-1"
                    [disabled]="product.stock === 0"
                    (click)="addToCart()">
              Agregar al carrito
            </button>
          </div>

          <div class="card">
            <div class="card-body">
              <h5>Características</h5>
              <ul class="list-unstyled">
                <li><i class="fas fa-check text-success me-2"></i> Garantía de 1 año</li>
                <li><i class="fas fa-check text-success me-2"></i> Envío gratis</li>
                <li><i class="fas fa-check text-success me-2"></i> Soporte técnico</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .img-fluid {
      max-height: 500px;
      width: 100%;
      object-fit: contain;
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
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: number) {
    this.productService.getProduct(id).subscribe(
      (data: Product) => {
        this.product = data;
      },
      (error) => {
        console.error('Error loading product:', error);
      }
    );
  }

  incrementQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product) {
      for (let i = 0; i < this.quantity; i++) {
        this.cartService.addToCart(this.product);
      }
    }
  }
} 