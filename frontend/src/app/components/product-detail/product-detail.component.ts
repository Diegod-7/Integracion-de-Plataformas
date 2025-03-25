import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { Product } from '../../models/product';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div *ngIf="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3">Cargando producto...</p>
      </div>
      
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div *ngIf="product && !loading" class="row">
        <div class="col-md-6">
          <img [src]="product.imageUrl" [alt]="product.name" 
               class="img-fluid rounded shadow" style="max-height: 400px; width: 100%; object-fit: cover;">
        </div>
        <div class="col-md-6">
          <h1 class="mb-2">{{ product.name }}</h1>
          <p class="text-muted">{{ product.category }}</p>
          <h2 class="text-primary mb-3">{{ formatPrice(product.price) }}</h2>
          
          <div class="mb-4">
            <h5>Descripción:</h5>
            <p>{{ product.description }}</p>
          </div>
          
          <div class="mb-3">
            <span class="badge" 
                  [ngClass]="{'bg-success': product.stock > 5,
                            'bg-warning': product.stock <= 5 && product.stock > 0,
                            'bg-danger': product.stock === 0}">
              {{product.stock > 0 ? product.stock + ' disponibles' : 'Sin stock'}}
            </span>
          </div>
          
          <div class="d-flex align-items-center mb-3" *ngIf="product.stock > 0">
            <div class="input-group" style="width: 150px;">
              <button class="btn btn-outline-secondary" 
                      (click)="updateQuantity(-1)" 
                      [disabled]="quantity <= 1">-</button>
              <input type="number" class="form-control text-center" 
                     [(ngModel)]="quantity" 
                     min="1" [max]="product.stock">
              <button class="btn btn-outline-secondary" 
                      (click)="updateQuantity(1)" 
                      [disabled]="quantity >= product.stock">+</button>
            </div>
          </div>
          
          <button class="btn btn-primary btn-lg me-2" 
                  (click)="addToCart()" 
                  [disabled]="product.stock === 0">
            <i class="fas fa-shopping-cart me-2"></i>Agregar al carrito
          </button>
          <button class="btn btn-outline-secondary btn-lg" 
                  routerLink="/products">
            Volver
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 0.5em 0.8em;
      font-size: 0.9rem;
    }
    h2.text-primary {
      font-size: 2rem;
      font-weight: 600;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.error = 'ID de producto no proporcionado';
      this.loading = false;
    }
  }

  async loadProduct(id: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Obtener el producto y la tasa de cambio en paralelo
      const productPromise = firstValueFrom(this.productService.getProductById(Number(id)));
      const exchangeRatePromise = firstValueFrom(this.currencyService.getExchangeRate());

      const [product, exchangeRate] = await Promise.all([
        productPromise,
        exchangeRatePromise
      ]);
      
      if (product) {
        // Convertir el precio a CLP
        this.product = {
          ...product,
          price: Math.round(product.price * exchangeRate)
        };
        this.loading = false;
      } else {
        this.error = 'Producto no encontrado';
        this.loading = false;
      }
    } catch (error) {
      console.error('Error al cargar el producto:', error);
      this.error = 'Error al cargar el producto. Por favor, intenta nuevamente.';
      this.loading = false;
    }
  }

  updateQuantity(change: number) {
    const newQuantity = this.quantity + change;
    if (this.product && newQuantity >= 1 && newQuantity <= this.product.stock) {
      this.quantity = newQuantity;
    }
  }

  addToCart() {
    if (this.product) {
      // Asegurarse de que el producto tiene todas las propiedades requeridas
      const safeProduct: Product = {
        ...this.product,
        imageUrl: this.product.imageUrl || '' // Garantizar que imageUrl nunca sea undefined
      };
      
      this.cartService.addItem(safeProduct, this.quantity);
      this.router.navigate(['/cart']);
    }
  }

  formatPrice(price: number): string {
    return this.currencyService.formatCLP(price);
  }
} 