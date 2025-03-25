import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { Product } from '../../models/product';
import { firstValueFrom, forkJoin } from 'rxjs';

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

      <div *ngIf="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
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
                <span class="h5 mb-0">{{ formatPrice(product.price) }}</span>
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
  products: (Product & { originalPrice: number })[] = [];
  filteredProducts: (Product & { originalPrice: number })[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  cartItemCount: number = 0;
  loading = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadProducts();
    this.updateCartCount();
  }

  private async loadProducts() {
    try {
      this.loading = true;
      this.error = null;

      // Obtener los productos y la tasa de cambio en paralelo
      const productsPromise = firstValueFrom(this.productService.getProducts());
      const exchangeRatePromise = firstValueFrom(this.currencyService.getExchangeRate());

      const [products, exchangeRate] = await Promise.all([
        productsPromise,
        exchangeRatePromise
      ]);

      console.log(`Usando tasa de cambio: 1 USD = ${exchangeRate} CLP`);

      // Convertir los precios de USD a CLP
      this.products = products.map(product => ({
        ...product,
        // Almacenar el precio original en USD
        originalPrice: product.price,
        // Convertir y redondear el precio a CLP
        price: Math.round(product.price * exchangeRate),
      }));

      this.filteredProducts = this.products;
      this.categories = [...new Set(this.products.map(p => p.category))];
      
    } catch (err) {
      console.error('Error loading products:', err);
      this.error = 'Error al cargar los productos. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  filterProducts() {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(p => p.category === this.selectedCategory);
    } else {
      this.filteredProducts = this.products;
    }
  }

  formatPrice(price: number): string {
    return this.currencyService.formatCLP(price);
  }

  addToCart(product: Product & { originalPrice: number }) {
    // Asegurarse de usar el precio en CLP para el carrito
    const productWithCLP: Product = {
      ...product,
      price: product.price,
      imageUrl: product.imageUrl || '' // Asegurar que siempre tenga una imageUrl
    };

    this.cartService.addItem(productWithCLP, 1);
    this.updateCartCount();
    console.log('Producto agregado al carrito:', productWithCLP);
  }

  private updateCartCount() {
    this.cartService.getItems().subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }
} 