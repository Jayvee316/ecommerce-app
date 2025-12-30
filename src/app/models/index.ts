// ==========================================
// USER & AUTH
// ==========================================
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ==========================================
// PRODUCTS & CATEGORIES
// ==========================================
export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  images: string[];
  sku?: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: Date;
}

export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryName: string;
}

// ==========================================
// CART
// ==========================================
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  salePrice?: number;
  quantity: number;
  totalPrice: number;
  stockQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subTotal: number;
  totalItems: number;
}

// ==========================================
// ORDERS
// ==========================================
export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  subTotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingInfo: ShippingInfo;
  customerNotes?: string;
  items: OrderItem[];
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: Date;
}

// ==========================================
// REVIEWS (Node.js API)
// ==========================================
export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

// ==========================================
// WISHLIST (Node.js API)
// ==========================================
export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  salePrice?: number;
  productImageUrl?: string;
  stockQuantity: number;
  isAvailable: boolean;
  addedAt: Date;
}

// ==========================================
// NOTIFICATIONS (Node.js API)
// ==========================================
export interface Notification {
  id: number;
  type: 'order_status' | 'price_drop' | 'back_in_stock' | 'review_reply' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// ==========================================
// SEARCH (Node.js API)
// ==========================================
export interface SearchResult {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
}

export interface SearchFilters {
  query?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
