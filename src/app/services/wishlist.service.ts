import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { WishlistItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly nodeApiUrl = environment.nodeApiUrl;
  private readonly http = inject(HttpClient);

  private wishlistSignal = signal<WishlistItem[]>([]);

  readonly wishlist = this.wishlistSignal.asReadonly();
  readonly wishlistCount = computed(() => this.wishlistSignal().length);
  readonly isEmpty = computed(() => this.wishlistSignal().length === 0);

  loadWishlist(): Observable<WishlistItem[]> {
    return this.http.get<{ items: WishlistItem[] }>(`${this.nodeApiUrl}/wishlist`).pipe(
      map(response => response.items),
      tap(items => this.wishlistSignal.set(items))
    );
  }

  addToWishlist(productId: number): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${this.nodeApiUrl}/wishlist`, { productId }).pipe(
      tap(item => this.wishlistSignal.update(items => [...items, item]))
    );
  }

  removeFromWishlist(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.nodeApiUrl}/wishlist/${productId}`).pipe(
      tap(() => this.wishlistSignal.update(items => items.filter(i => i.productId !== productId)))
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSignal().some(item => item.productId === productId);
  }

  clearWishlist(): void {
    this.wishlistSignal.set([]);
  }
}
