export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role?: string;
  discountPercentage?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
} 