import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Productos</h2>
        <button class="btn btn-primary" (click)="showAddForm()">
          <i class="fas fa-plus"></i> Nuevo Producto
        </button>
      </div>

      <!-- Formulario de producto -->
      <div class="card mb-4" *ngIf="showForm">
        <div class="card-body">
          <h3>{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h3>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-control" formControlName="name">
                <div class="text-danger" *ngIf="productForm.get('name')?.errors?.['required'] && 
                     productForm.get('name')?.touched">
                  El nombre es requerido
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Categoría</label>
                <input type="text" class="form-control" formControlName="category">
                <div class="text-danger" *ngIf="productForm.get('category')?.errors?.['required'] && 
                     productForm.get('category')?.touched">
                  La categoría es requerida
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Precio</label>
                <input type="number" class="form-control" formControlName="price">
                <div class="text-danger" *ngIf="productForm.get('price')?.errors?.['required'] && 
                     productForm.get('price')?.touched">
                  El precio es requerido
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Stock</label>
                <input type="number" class="form-control" formControlName="stock">
                <div class="text-danger" *ngIf="productForm.get('stock')?.errors?.['required'] && 
                     productForm.get('stock')?.touched">
                  El stock es requerido
                </div>
              </div>

              <div class="col-12">
                <label class="form-label">URL de la imagen</label>
                <input type="text" class="form-control" formControlName="imageUrl">
              </div>

              <div class="col-12">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="3" formControlName="description"></textarea>
                <div class="text-danger" *ngIf="productForm.get('description')?.errors?.['required'] && 
                     productForm.get('description')?.touched">
                  La descripción es requerida
                </div>
              </div>

              <div class="col-12">
                <button type="submit" class="btn btn-primary me-2" [disabled]="!productForm.valid">
                  {{ editingProduct ? 'Actualizar' : 'Crear' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products">
              <td>{{product.id}}</td>
              <td>
                <img [src]="product.imageUrl || 'assets/placeholder.jpg'" 
                     [alt]="product.name"
                     style="height: 50px; width: 50px; object-fit: cover;">
              </td>
              <td>{{product.name}}</td>
              <td>{{product.category}}</td>
              <td>{{product.price | currency}}</td>
              <td>{{product.stock}}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" 
                        (click)="editProduct(product)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger"
                        (click)="deleteProduct(product.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table img {
      border-radius: 4px;
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  showForm: boolean = false;
  editingProduct: Product | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: [''],
      stock: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  showAddForm() {
    this.editingProduct = null;
    this.productForm.reset();
    this.showForm = true;
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  onSubmit() {
    if (this.productForm.valid) {
      if (this.editingProduct) {
        this.productService.updateProduct(this.editingProduct.id, this.productForm.value).subscribe(
          () => {
            this.loadProducts();
            this.cancelEdit();
          },
          error => console.error('Error updating product:', error)
        );
      } else {
        this.productService.createProduct(this.productForm.value).subscribe(
          () => {
            this.loadProducts();
            this.cancelEdit();
          },
          error => console.error('Error creating product:', error)
        );
      }
    }
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.loadProducts();
        },
        error => console.error('Error deleting product:', error)
      );
    }
  }
} 