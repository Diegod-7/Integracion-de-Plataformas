import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
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
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        product: product,
        quantity: quantity
      });
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
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  private saveItems() {
    localStorage.setItem('cartItems', JSON.stringify(this.items));
  }
}