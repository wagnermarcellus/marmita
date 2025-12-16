export enum UserRole {
  CLIENTE = 'cliente',
  COZINHEIRO = 'cozinheiro'
}

export enum OrderStatus {
  PENDENTE = 'pendente',
  CONFIRMADO = 'confirmado',
  PREPARANDO = 'preparando',
  ENTREGA = 'entrega',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado'
}

export interface PaymentMethod {
  id: number;
  type: 'credit_card' | 'pix' | 'cash';
  last4?: string;
  brand?: string; // visa, mastercard
  label: string;
}

export interface WalletTransaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  status: 'completed' | 'pending';
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // In real app, never store plain text
  role: UserRole;
  avatarUrl?: string;
  address?: string;
  balance?: number; // For cooks
  paymentMethods?: PaymentMethod[]; // For clients
}

export interface Meal {
  id: number;
  cookId: number;
  cookName: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface OrderItem {
  id: number;
  mealId: number;
  mealTitle: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  clientId: number;
  clientName: string;
  cookId: number;
  cookName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
  paymentMethodLabel?: string;
}

export interface Message {
  id: number;
  orderId: number;
  senderId: number;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Review {
  id: number;
  cookId: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Notification {
  id: number;
  userId: number;
  text: string;
  read: boolean;
  date: string;
  link?: string;
}