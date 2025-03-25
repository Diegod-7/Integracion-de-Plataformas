import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Productos</h2>
        <div class="d-flex align-items-center">
          <select class="form-select me-2" 
                  [(ngModel)]="selectedCategory" 
                  (change)="filterProducts()">
            <option value="">Todas las categorías</option>
            <option *ngFor="let category of categories" [value]="category">
              {{category}}
            </option>
          </select>
          <button class="btn btn-outline-primary" routerLink="/cart">
            <i class="fas fa-shopping-cart"></i>
            <span class="badge bg-danger ms-1">{{cartItemCount}}</span>
          </button>
        </div>
      </div>

      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col" *ngFor="let product of filteredProducts">
          <div class="card h-100">
            <img [src]="product.imageUrl || 'assets/placeholder.jpg'" 
                 class="card-img-top" 
                 [alt]="product.name"
                 style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{product.name}}</h5>
              <p class="card-text text-muted">{{product.category}}</p>
              <p class="card-text">{{product.description}}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="h5 mb-0">{{product.price | currency}}</span>
                <span class="badge" 
                      [ngClass]="{'bg-success': product.stock > 5,
                                'bg-warning': product.stock <= 5 && product.stock > 0,
                                'bg-danger': product.stock === 0}">
                  {{product.stock > 0 ? product.stock + ' disponibles' : 'Sin stock'}}
                </span>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <div class="d-grid gap-2">
                <a [routerLink]="['/products', product.id]" 
                   class="btn btn-outline-primary">
                  Ver detalles
                </a>
                <button class="btn btn-primary"
                        (click)="addToCart(product)"
                        [disabled]="product.stock === 0">
                  <i class="fas fa-shopping-cart me-2"></i>Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .card-img-top {
      border-top-left-radius: calc(0.25rem - 1px);
      border-top-right-radius: calc(0.25rem - 1px);
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  cartItemCount: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.updateCartCount();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
        this.filteredProducts = data;
        this.categories = [...new Set(data.map(p => p.category))];
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  filterProducts() {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(
        p => p.category === this.selectedCategory
      );
    } else {
      this.filteredProducts = this.products;
    }
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, 1);
    this.updateCartCount();
  }

  updateCartCount() {
    this.cartItemCount = this.cartService.getItemsSync().length;
  }
} 