import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductListItem } from '../../models';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="product-card">
      @if (product().isFeatured) {
        <span class="badge featured">Featured</span>
      }
      @if (product().salePrice) {
        <span class="badge sale">Sale</span>
      }

      <a [routerLink]="['/products', product().id]" class="image-container">
        @if (product().imageUrl) {
          <img [src]="product().imageUrl" [alt]="product().name" loading="lazy" />
        } @else {
          <div class="placeholder-image">
            <span>📦</span>
          </div>
        }
      </a>

      <div class="content">
        <span class="category">{{ product().categoryName }}</span>
        <h3>
          <a [routerLink]="['/products', product().id]">{{ product().name }}</a>
        </h3>

        <div class="price">
          @if (product().salePrice) {
            <span class="sale-price">{{ product().salePrice | currency }}</span>
            <span class="original-price">{{ product().price | currency }}</span>
          } @else {
            <span class="current-price">{{ product().price | currency }}</span>
          }
        </div>

        <div class="stock" [class.out-of-stock]="product().stockQuantity === 0">
          @if (product().stockQuantity > 0) {
            <span>✓ In Stock</span>
          } @else {
            <span>✗ Out of Stock</span>
          }
        </div>

        <div class="actions">
          <button
            class="btn btn-primary"
            (click)="addToCart()"
            [disabled]="product().stockQuantity === 0 || isAddingToCart"
            aria-label="Add to cart"
          >
            @if (isAddingToCart) {
              Adding...
            } @else {
              Add to Cart
            }
          </button>

          @if (authService.isAuthenticated()) {
            <button
              class="btn btn-icon"
              (click)="toggleWishlist()"
              [class.in-wishlist]="isInWishlist()"
              [attr.aria-label]="isInWishlist() ? 'Remove from wishlist' : 'Add to wishlist'"
            >
              {{ isInWishlist() ? '❤️' : '🤍' }}
            </button>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .badge {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      z-index: 1;
    }

    .badge.featured {
      background: #2563eb;
      color: white;
    }

    .badge.sale {
      background: #ef4444;
      color: white;
      left: auto;
      right: 12px;
    }

    .image-container {
      display: block;
      aspect-ratio: 1;
      overflow: hidden;
      background: #f5f5f5;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .product-card:hover .image-container img {
      transform: scale(1.05);
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      background: #f0f0f0;
    }

    .content {
      padding: 1rem;
    }

    .category {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h3 {
      margin: 0.5rem 0;
      font-size: 1rem;
      line-height: 1.4;
    }

    h3 a {
      color: #1a1a1a;
      text-decoration: none;
    }

    h3 a:hover {
      color: #2563eb;
    }

    .price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .current-price,
    .sale-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .sale-price {
      color: #ef4444;
    }

    .original-price {
      font-size: 0.875rem;
      color: #999;
      text-decoration: line-through;
    }

    .stock {
      font-size: 0.875rem;
      color: #22c55e;
      margin-bottom: 1rem;
    }

    .stock.out-of-stock {
      color: #ef4444;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      flex: 1;
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-icon {
      width: 44px;
      height: 44px;
      padding: 0;
      background: #f5f5f5;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: #eee;
    }

    .btn-icon.in-wishlist {
      background: #fef2f2;
    }
  `]
})
export class ProductCardComponent {
  product = input.required<ProductListItem>();
  addedToCart = output<number>();

  protected readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  isAddingToCart = false;

  addToCart(): void {
    if (this.isAddingToCart || this.product().stockQuantity === 0) return;

    this.isAddingToCart = true;
    this.cartService.addToCart(this.product().id, 1).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.addedToCart.emit(this.product().id);
      },
      error: () => {
        this.isAddingToCart = false;
      }
    });
  }

  toggleWishlist(): void {
    const productId = this.product().id;
    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(productId).subscribe();
    } else {
      this.wishlistService.addToWishlist(productId).subscribe();
    }
  }

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product().id);
  }
}
