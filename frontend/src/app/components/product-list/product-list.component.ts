import { Component, OnInit } from '@angular/core';
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
  selector: 'app-product-list',
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Productos</h2>
        <button class="btn btn-outline-primary" routerLink="/cart">
          <i class="fas fa-shopping-cart"></i> Ver Carrito
          <span class="badge bg-primary ms-2">{{cartItemCount}}</span>
        </button>
      </div>
      
      <!-- Filtros -->
      <div class="row mb-4">
        <div class="col-md-4">
          <select class="form-select" [(ngModel)]="selectedCategory" (change)="filterProducts()">
            <option value="">Todas las categorías</option>
            <option *ngFor="let category of categories" [value]="category">
              {{category}}
            </option>
          </select>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div class="col" *ngFor="let product of filteredProducts">
          <div class="card h-100">
            <a [routerLink]="['/products', product.id]" class="text-decoration-none">
              <img [src]="product.imageUrl || 'assets/placeholder.jpg'" 
                   class="card-img-top" 
                   [alt]="product.name"
                   style="height: 200px; object-fit: cover;">
              <div class="card-body">
                <h5 class="card-title text-dark">{{product.name}}</h5>
                <p class="card-text text-muted">{{product.description}}</p>
                <p class="card-text">
                  <small class="text-muted">Categoría: {{product.category}}</small>
                </p>
                <p class="card-text fw-bold text-primary">
                  {{product.price | currency}}
                </p>
              </div>
            </a>
            <div class="card-footer bg-white border-0 p-3">
              <button class="btn btn-primary w-100" 
                      [disabled]="product.stock === 0"
                      (click)="addToCart(product)">
                {{product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .text-primary {
      color: var(--primary-color) !important;
    }
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .btn-primary:hover {
      background-color: darken(#4CAF50, 10%);
      border-color: darken(#4CAF50, 10%);
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
    this.cartService.getItems().subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
        this.filteredProducts = data;
        this.categories = [...new Set(data.map(product => product.category))];
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  filterProducts() {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(
        product => product.category === this.selectedCategory
      );
    } else {
      this.filteredProducts = this.products;
    }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
} 