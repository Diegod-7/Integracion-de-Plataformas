import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  template: `
    <div class="container mt-4">
      <h2 class="text-center mb-4">Checkout</h2>

      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-body">
              <h4 class="mb-3">Información de envío</h4>
              <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="firstName" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="firstName" 
                           formControlName="firstName">
                    <div class="text-danger" *ngIf="checkoutForm.get('firstName')?.errors?.['required'] && 
                         checkoutForm.get('firstName')?.touched">
                      El nombre es requerido
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="lastName" class="form-label">Apellido</label>
                    <input type="text" class="form-control" id="lastName" 
                           formControlName="lastName">
                    <div class="text-danger" *ngIf="checkoutForm.get('lastName')?.errors?.['required'] && 
                         checkoutForm.get('lastName')?.touched">
                      El apellido es requerido
                    </div>
                  </div>

                  <div class="col-12">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" 
                           formControlName="email">
                    <div class="text-danger" *ngIf="checkoutForm.get('email')?.errors?.['required'] && 
                         checkoutForm.get('email')?.touched">
                      El email es requerido
                    </div>
                    <div class="text-danger" *ngIf="checkoutForm.get('email')?.errors?.['email'] && 
                         checkoutForm.get('email')?.touched">
                      Email inválido
                    </div>
                  </div>

                  <div class="col-12">
                    <label for="address" class="form-label">Dirección</label>
                    <input type="text" class="form-control" id="address" 
                           formControlName="address">
                    <div class="text-danger" *ngIf="checkoutForm.get('address')?.errors?.['required'] && 
                         checkoutForm.get('address')?.touched">
                      La dirección es requerida
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="city" class="form-label">Ciudad</label>
                    <input type="text" class="form-control" id="city" 
                           formControlName="city">
                    <div class="text-danger" *ngIf="checkoutForm.get('city')?.errors?.['required'] && 
                         checkoutForm.get('city')?.touched">
                      La ciudad es requerida
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="phone" class="form-label">Teléfono</label>
                    <input type="tel" class="form-control" id="phone" 
                           formControlName="phone">
                    <div class="text-danger" *ngIf="checkoutForm.get('phone')?.errors?.['required'] && 
                         checkoutForm.get('phone')?.touched">
                      El teléfono es requerido
                    </div>
                  </div>
                </div>

                <hr class="my-4">

                <h4 class="mb-3">Método de pago</h4>
                <div class="form-check mb-2">
                  <input type="radio" class="form-check-input" id="credit" 
                         formControlName="paymentMethod" value="credit">
                  <label class="form-check-label" for="credit">
                    Tarjeta de crédito
                  </label>
                </div>
                <div class="form-check mb-2">
                  <input type="radio" class="form-check-input" id="debit" 
                         formControlName="paymentMethod" value="debit">
                  <label class="form-check-label" for="debit">
                    Tarjeta de débito
                  </label>
                </div>
                <div class="form-check mb-2">
                  <input type="radio" class="form-check-input" id="cash" 
                         formControlName="paymentMethod" value="cash">
                  <label class="form-check-label" for="cash">
                    Efectivo
                  </label>
                </div>

                <button class="btn btn-primary w-100 mt-4" 
                        type="submit" 
                        [disabled]="!checkoutForm.valid">
                  Confirmar pedido
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h4 class="mb-3">Resumen del pedido</h4>
              <div class="d-flex justify-content-between mb-2" 
                   *ngFor="let item of cartItems">
                <span>{{item.name}} x {{item.quantity}}</span>
                <span>{{item.price * item.quantity | currency}}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{{total | currency}}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>{{total | currency}}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  total: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private router: Router
  ) {
    this.checkoutForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', Validators.required],
      paymentMethod: ['credit', Validators.required]
    });
  }

  ngOnInit() {
    this.cartService.getItems().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      // TODO: Implementar el proceso de pago
      console.log('Formulario enviado:', this.checkoutForm.value);
      this.cartService.clearCart();
      this.router.navigate(['/order-success']);
    }
  }
} 