import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart, CartItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private cartSignal = signal<Cart>({ items: [], subTotal: 0, totalItems: 0 });

  readonly cart = this.cartSignal.asReadonly();
  readonly cartItems = computed(() => this.cartSignal().items);
  readonly cartTotal = computed(() => this.cartSignal().subTotal);
  readonly cartItemCount = computed(() => this.cartSignal().totalItems);
  readonly isEmpty = computed(() => this.cartSignal().items.length === 0);

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/cart`).pipe(
      tap(cart => this.cartSignal.set(cart))
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/cart/items`, { productId, quantity }).pipe(
      tap(cart => this.cartSignal.set(cart))
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/cart/items/${itemId}`, { quantity }).pipe(
      tap(cart => this.cartSignal.set(cart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/cart/items/${itemId}`).pipe(
      tap(cart => this.cartSignal.set(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart`).pipe(
      tap(() => this.cartSignal.set({ items: [], subTotal: 0, totalItems: 0 }))
    );
  }

  getItemByProductId(productId: number): CartItem | undefined {
    return this.cartSignal().items.find(item => item.productId === productId);
  }
}
