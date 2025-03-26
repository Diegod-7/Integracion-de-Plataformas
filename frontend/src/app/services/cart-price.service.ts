import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { CartService } from './cart.service';
import { CurrencyService } from './currency.service';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product';

// Tipo extendido para producto con flag de conversión
interface ConvertedProduct extends Product {
  priceConverted?: boolean;
}

// Tipo extendido para item del carrito
interface ConvertedCartItem extends CartItem {
  product: ConvertedProduct;
}

@Injectable({
  providedIn: 'root'
})
export class CartPriceService {
  private convertedItems = new BehaviorSubject<ConvertedCartItem[]>([]);
  private exchangeRate: number = 850; // Valor predeterminado

  constructor(
    private cartService: CartService,
    private currencyService: CurrencyService
  ) {
    // Obtener tasa de cambio y actualizarla
    this.updateExchangeRate();
    
    // Suscribirse a los cambios en el carrito
    this.cartService.getItems().subscribe(items => {
      this.updateCartPrices(items);
    });
  }

  /**
   * Actualiza la tasa de cambio
   */
  private async updateExchangeRate() {
    try {
      this.exchangeRate = await firstValueFrom(this.currencyService.getExchangeRate());
      console.log(`CartPriceService: Tasa actualizada a ${this.exchangeRate} CLP por USD`);
      
      // Actualizar precios del carrito con la nueva tasa
      const items = await firstValueFrom(this.cartService.getItems());
      this.updateCartPrices(items);
    } catch (error) {
      console.error('Error al actualizar tasa de cambio:', error);
    }
  }

  /**
   * Actualiza los precios de los items en el carrito
   */
  private updateCartPrices(items: CartItem[]) {
    // Crear copias con precios actualizados
    const convertedItems: ConvertedCartItem[] = items.map(item => {
      // Convertir el producto primero
      const convertedProduct = item.product as ConvertedProduct;
      
      // Verificar si el precio es en USD (generalmente por debajo de 1000)
      // Esta es una heurística simple, en un caso real deberíamos tener una marca clara
      const needsConversion = convertedProduct.price < 1000 && !convertedProduct.priceConverted;
      
      const updatedProduct: ConvertedProduct = {
        ...convertedProduct,
        // Si es necesario convertir, multiplicar por la tasa, sino mantener el precio
        price: needsConversion ? Math.round(convertedProduct.price * this.exchangeRate) : convertedProduct.price,
        // Marcar que ya se convirtió
        priceConverted: true
      };
      
      return {
        ...item,
        product: updatedProduct
      } as ConvertedCartItem;
    });
    
    this.convertedItems.next(convertedItems);
  }

  /**
   * Obtiene los items del carrito con precios convertidos a CLP
   */
  getConvertedItems(): Observable<ConvertedCartItem[]> {
    return this.convertedItems.asObservable();
  }
} 