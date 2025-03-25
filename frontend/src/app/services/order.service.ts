import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Order, OrderDetail } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';
  
  // Almacenamiento local para órdenes mientras no haya backend
  private orders: Order[] = [
    // Orden de ejemplo 1
    {
      id: 1,
      orderNumber: 'ORD-20240315001',
      total: 45750,
      status: 'Entregado',
      paymentMethod: 'Webpay',
      createdAt: new Date('2024-03-15T10:30:00'),
      details: [
        {
          productId: 1,
          productName: 'Martillo Profesional',
          quantity: 1,
          price: 12750
        },
        {
          productId: 4,
          productName: 'Alicate Universal',
          quantity: 2,
          price: 8500
        },
        {
          productId: 7,
          productName: 'Destornilladores Precisión (6 piezas)',
          quantity: 1,
          price: 16000
        }
      ]
    },
    // Orden de ejemplo 2
    {
      id: 2,
      orderNumber: 'ORD-20240320002',
      total: 76500,
      status: 'Pagado',
      paymentMethod: 'Transferencia',
      createdAt: new Date('2024-03-20T14:45:00'),
      details: [
        {
          productId: 5,
          productName: 'Taladro Inalámbrico 20V',
          quantity: 1,
          price: 76500
        }
      ]
    },
    // Orden de ejemplo 3
    {
      id: 3,
      orderNumber: 'ORD-20240401003',
      total: 110500,
      status: 'En proceso',
      paymentMethod: 'Webpay',
      createdAt: new Date('2024-04-01T09:15:00'),
      details: [
        {
          productId: 6,
          productName: 'Sierra Circular 1200W',
          quantity: 1,
          price: 110500
        }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    // Simular una respuesta del servidor devolviendo las órdenes locales
    return of(this.orders);
  }

  getOrderById(id: number): Observable<Order | undefined> {
    // Simular una búsqueda por ID
    const order = this.orders.find(o => o.id === id);
    return of(order);
  }

  getOrderByNumber(orderNumber: string): Observable<Order | undefined> {
    // Simular una búsqueda por número de orden
    const order = this.orders.find(o => o.orderNumber === orderNumber);
    return of(order);
  }

  createOrder(order: Order): Observable<Order> {
    // Verificar si ya existe una orden con el mismo ID
    const existingOrderIndex = this.orders.findIndex(o => o.id === order.id);
    
    if (existingOrderIndex !== -1) {
      // Actualizar la orden existente en lugar de crear una nueva
      this.orders[existingOrderIndex] = { ...order };
      return of(this.orders[existingOrderIndex]);
    }
    
    // Asignar un ID único a la orden si no tiene uno
    const newOrder = {
      ...order,
      id: order.id || Date.now()
    };
    
    // Guardar la orden en el almacenamiento local
    this.orders.push(newOrder);
    
    // Simular una respuesta exitosa del servidor
    return of(newOrder);
  }

  updateOrder(id: number, order: Order): Observable<Order | undefined> {
    // Encontrar y actualizar la orden
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index] = { ...order, id };
      return of(this.orders[index]);
    }
    return of(undefined);
  }

  deleteOrder(id: number): Observable<boolean> {
    // Eliminar la orden del almacenamiento local
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(o => o.id !== id);
    
    // Simular una respuesta exitosa si se eliminó la orden
    return of(this.orders.length < initialLength);
  }
} 