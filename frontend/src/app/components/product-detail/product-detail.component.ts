import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-6">
          <img [src]="product?.imageUrl || 'assets/placeholder.jpg'"
               [alt]="product?.name || 'Producto'"
               class="img-fluid rounded">
        </div>
        <div class="col-md-6">
          <h2>{{product?.name || 'Cargando...'}}</h2>
          <p class="text-muted">Categoría: {{product?.category || 'Sin categoría'}}</p>
          <p class="h3 text-primary mb-4">{{product?.price | currency}}</p>
          
          <div class="mb-4">
            <h5>Descripción</h5>
            <p>{{product?.description || 'Sin descripción'}}</p>
          </div>

          <div class="mb-4">
            <p [ngClass]="{'text-success': (product?.stock || 0) > 5,
                          'text-warning': (product?.stock || 0) <= 5 && (product?.stock || 0) > 0,
                          'text-danger': (product?.stock || 0) === 0}">
              {{(product?.stock || 0) > 0 ? (product?.stock || 0) + ' unidades disponibles' : 'Sin stock'}}
            </p>
          </div>

          <div class="d-flex align-items-center mb-4">
            <div class="input-group" style="width: 150px;">
              <button class="btn btn-outline-secondary" 
                      type="button"
                      (click)="decrementQuantity()"
                      [disabled]="quantity <= 1">-</button>
              <input type="number" 
                     class="form-control text-center"
                     [(ngModel)]="quantity"
                     min="1"
                     [max]="product?.stock || 0">
              <button class="btn btn-outline-secondary" 
                      type="button"
                      (click)="incrementQuantity()"
                      [disabled]="quantity >= (product?.stock || 0)">+</button>
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-100"
                  (click)="addToCart()"
                  [disabled]="!product || product.stock === 0">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .input-group {
      max-width: 150px;
    }
    .input-group input {
      text-align: center;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(Number(id)).subscribe({
        next: (product) => {
          this.product = product;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.router.navigate(['/products']);
        }
      });
    }
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addItem(this.product, this.quantity);
      this.router.navigate(['/cart']);
    }
  }
} 