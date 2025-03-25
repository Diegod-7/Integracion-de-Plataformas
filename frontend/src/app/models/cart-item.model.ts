export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  category: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
} 