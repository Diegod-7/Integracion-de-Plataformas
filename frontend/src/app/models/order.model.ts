export interface OrderDetail {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  details: OrderDetail[];
} 