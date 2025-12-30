import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { WishlistItem } from '../../models';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wishlist-page">
      <div class="container">
        <h1>My Wishlist</h1>

        @if (loading()) {
          <div class="loading">
            <p>Loading wishlist...</p>
          </div>
        } @else if (error()) {
          <div class="error">
            <p>{{ error() }}</p>
            <button (click)="loadWishlist()">Try Again</button>
          </div>
        } @else if (wishlistService.isEmpty()) {
          <div class="empty-wishlist">
            <div class="empty-icon">&#10084;</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love by clicking the heart icon on products</p>
            <a routerLink="/products" class="btn-primary">Browse Products</a>
          </div>
        } @else {
          <div class="wishlist-header">
            <p>{{ wishlistService.wishlistCount() }} item(s) in your wishlist</p>
            <button class="btn-clear" (click)="clearWishlist()">Clear All</button>
          </div>

          <div class="wishlist-grid">
            @for (item of wishlistService.wishlist(); track item.id) {
              <div class="wishlist-card" [class.unavailable]="!item.isAvailable">
                <button
                  class="remove-btn"
                  (click)="removeItem(item.productId)"
                  aria-label="Remove from wishlist">
                  &times;
                </button>

                <a [routerLink]="['/products', item.productId]" class="product-image">
                  @if (item.productImageUrl) {
                    <img [src]="item.productImageUrl" [alt]="item.productName">
                  } @else {
                    <div class="placeholder-image">No Image</div>
                  }
                </a>

                <div class="product-info">
                  <a [routerLink]="['/products', item.productId]" class="product-name">
                    {{ item.productName }}
                  </a>

                  <div class="price">
                    @if (item.salePrice) {
                      <span class="sale-price">\${{ item.salePrice.toFixed(2) }}</span>
                      <span class="original-price">\${{ item.productPrice.toFixed(2) }}</span>
                    } @else {
                      <span class="regular-price">\${{ item.productPrice.toFixed(2) }}</span>
                    }
                  </div>

                  <div class="availability" [class.in-stock]="item.isAvailable">
                    {{ item.isAvailable ? 'In Stock' : 'Out of Stock' }}
                  </div>

                  <button
                    class="btn-add-cart"
                    [disabled]="!item.isAvailable"
                    (click)="addToCart(item)">
                    {{ item.isAvailable ? 'Add to Cart' : 'Unavailable' }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding: 2rem 1rem;
      min-height: calc(100vh - 200px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #333;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
    }

    .error {
      color: #dc3545;
    }

    .error button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .empty-wishlist {
      text-align: center;
      padding: 4rem 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .empty-icon {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 1rem;
    }

    .empty-wishlist h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .empty-wishlist p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .btn-primary {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .wishlist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .btn-clear {
      padding: 0.5rem 1rem;
      background: none;
      color: #dc3545;
      border: 1px solid #dc3545;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      background: #dc3545;
      color: white;
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .wishlist-card {
      position: relative;
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .wishlist-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .wishlist-card.unavailable {
      opacity: 0.7;
    }

    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 28px;
      height: 28px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      font-size: 1.2rem;
      color: #666;
      cursor: pointer;
      z-index: 1;
      transition: all 0.2s;
    }

    .remove-btn:hover {
      background: #dc3545;
      color: white;
    }

    .product-image {
      display: block;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }

    .product-image:hover img {
      transform: scale(1.05);
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      color: #999;
    }

    .product-info {
      padding: 1rem;
    }

    .product-name {
      display: block;
      font-weight: 500;
      color: #333;
      text-decoration: none;
      margin-bottom: 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-name:hover {
      color: #007bff;
    }

    .price {
      margin-bottom: 0.5rem;
    }

    .sale-price {
      font-weight: 600;
      color: #dc3545;
      margin-right: 0.5rem;
    }

    .original-price {
      text-decoration: line-through;
      color: #999;
      font-size: 0.9rem;
    }

    .regular-price {
      font-weight: 600;
      color: #333;
    }

    .availability {
      font-size: 0.85rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }

    .availability.in-stock {
      color: #28a745;
    }

    .btn-add-cart {
      width: 100%;
      padding: 0.75rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-add-cart:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-add-cart:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .wishlist-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
    }

    @media (max-width: 480px) {
      .wishlist-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading.set(true);
    this.error.set(null);

    this.wishlistService.loadWishlist().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load wishlist. Please try again.');
        this.loading.set(false);
        console.error('Wishlist error:', err);
      }
    });
  }

  removeItem(productId: number): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      error: (err: Error) => {
        console.error('Remove error:', err);
      }
    });
  }

  clearWishlist(): void {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      this.wishlistService.clearWishlist();
    }
  }

  addToCart(item: WishlistItem): void {
    this.cartService.addToCart(item.productId, 1).subscribe({
      next: () => {
        alert(`${item.productName} added to cart!`);
      },
      error: (err: Error) => {
        console.error('Add to cart error:', err);
        alert('Failed to add to cart');
      }
    });
  }
}
