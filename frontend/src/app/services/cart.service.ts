import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product';
import { CurrencyService } from './currency.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);

  constructor(private currencyService: CurrencyService) {
    // Cargar items del localStorage al iniciar
    const savedItems = localStorage.getItem('cartItems');
    if (savedItems) {
      this.items = JSON.parse(savedItems);
      this.itemsSubject.next(this.items);
    }
  }

  getItems(): Observable<CartItem[]> {
    return this.itemsSubject.asObservable();
  }

  getItemsSync(): CartItem[] {
    return this.items;
  }

  addItem(product: Product, quantity: number = 1) {
    console.log('Agregando producto al carrito:', product);
    console.log('Precio del producto:', product.price);
    
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      console.log('Producto ya existente en carrito, actualizando cantidad:', existingItem);
    } else {
      // Asegurar que el producto tenga el precio en CLP
      this.items.push({
        id: product.id,
        product: {
          ...product,
          // El precio ya debe venir convertido a CLP desde los componentes
          price: product.price,
          imageUrl: product.imageUrl || ''
        },
        quantity: quantity
      });
      console.log('Nuevo producto agregado al carrito con precio:', product.price);
    }
    
    this.saveItems();
    this.itemsSubject.next(this.items);
  }

  updateQuantity(id: number, quantity: number) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
      this.saveItems();
      this.itemsSubject.next(this.items);
    }
  }

  removeItem(id: number) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveItems();
    this.itemsSubject.next(this.items);
  }

  clearCart() {
    this.items = [];
    this.saveItems();
    this.itemsSubject.next(this.items);
  }

  getTotal(): number {
    return this.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
  }

  private saveItems() {
    localStorage.setItem('cartItems', JSON.stringify(this.items));
  }
}