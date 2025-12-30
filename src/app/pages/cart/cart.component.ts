import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  template: `
    <main class="cart-page">
      <div class="container">
        <h1>Shopping Cart</h1>

        @if (cartService.isEmpty()) {
          <div class="empty-cart">
            <span class="icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
          </div>
        } @else {
          <div class="cart-grid">
            <div class="cart-items">
              @for (item of cartService.cartItems(); track item.id) {
                <article class="cart-item">
                  <div class="item-image">
                    @if (item.productImageUrl) {
                      <img [src]="item.productImageUrl" [alt]="item.productName" />
                    } @else {
                      <div class="placeholder">📦</div>
                    }
                  </div>

                  <div class="item-details">
                    <a [routerLink]="['/products', item.productId]" class="item-name">
                      {{ item.productName }}
                    </a>
                    <div class="item-price">
                      @if (item.salePrice) {
                        <span class="sale-price">{{ item.salePrice | currency }}</span>
                        <span class="original-price">{{ item.unitPrice | currency }}</span>
                      } @else {
                        <span>{{ item.unitPrice | currency }}</span>
                      }
                    </div>
                    @if (item.stockQuantity < 5 && item.stockQuantity > 0) {
                      <span class="low-stock">Only {{ item.stockQuantity }} left</span>
                    }
                  </div>

                  <div class="item-quantity">
                    <div class="quantity-selector">
                      <button
                        (click)="updateQuantity(item, item.quantity - 1)"
                        [disabled]="item.quantity <= 1 || updatingItems().has(item.id)"
                      >
                        −
                      </button>
                      <span>{{ item.quantity }}</span>
                      <button
                        (click)="updateQuantity(item, item.quantity + 1)"
                        [disabled]="item.quantity >= item.stockQuantity || updatingItems().has(item.id)"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div class="item-total">
                    {{ item.totalPrice | currency }}
                  </div>

                  <button
                    class="remove-btn"
                    (click)="removeItem(item)"
                    [disabled]="updatingItems().has(item.id)"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </article>
              }

              <div class="cart-actions">
                <button class="btn btn-outline" (click)="clearCart()">Clear Cart</button>
                <a routerLink="/products" class="btn btn-outline">Continue Shopping</a>
              </div>
            </div>

            <aside class="cart-summary">
              <h2>Order Summary</h2>

              <div class="summary-row">
                <span>Subtotal ({{ cartService.cartItemCount() }} items)</span>
                <span>{{ cartService.cartTotal() | currency }}</span>
              </div>

              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ shippingCost | currency }}</span>
              </div>

              <div class="summary-row">
                <span>Tax (estimated)</span>
                <span>{{ estimatedTax() | currency }}</span>
              </div>

              <hr />

              <div class="summary-row total">
                <span>Total</span>
                <span>{{ orderTotal() | currency }}</span>
              </div>

              <a routerLink="/checkout" class="btn btn-primary btn-lg btn-block">
                Proceed to Checkout
              </a>

              <div class="security-info">
                <span>🔒 Secure Checkout</span>
              </div>
            </aside>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .cart-page {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    h1 {
      margin-bottom: 2rem;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-cart .icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .empty-cart h2 {
      margin-bottom: 0.5rem;
    }

    .empty-cart p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .cart-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 1.5rem;
      align-items: center;
      background: #fff;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .item-image {
      width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .item-name {
      font-weight: 600;
      color: #1a1a1a;
      text-decoration: none;
      display: block;
      margin-bottom: 0.5rem;
    }

    .item-name:hover {
      color: #2563eb;
    }

    .item-price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sale-price {
      color: #ef4444;
      font-weight: 600;
    }

    .original-price {
      color: #999;
      text-decoration: line-through;
      font-size: 0.875rem;
    }

    .low-stock {
      color: #f59e0b;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .quantity-selector button {
      width: 36px;
      height: 36px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 1rem;
    }

    .quantity-selector button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-selector span {
      width: 40px;
      text-align: center;
      font-weight: 500;
    }

    .item-total {
      font-weight: 600;
      font-size: 1.125rem;
      min-width: 80px;
      text-align: right;
    }

    .remove-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: #f5f5f5;
      border-radius: 8px;
      cursor: pointer;
      color: #666;
      transition: all 0.2s;
    }

    .remove-btn:hover:not(:disabled) {
      background: #fee2e2;
      color: #ef4444;
    }

    .remove-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .cart-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
    }

    .cart-summary {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 80px;
    }

    .cart-summary h2 {
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      color: #666;
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 1rem 0;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      text-align: center;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-outline {
      background: white;
      border: 1px solid #ddd;
      color: #333;
    }

    .btn-outline:hover {
      border-color: #2563eb;
      color: #2563eb;
    }

    .btn-lg {
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }

    .btn-block {
      display: block;
      width: 100%;
      margin-top: 1.5rem;
    }

    .security-info {
      text-align: center;
      margin-top: 1rem;
      color: #666;
      font-size: 0.875rem;
    }

    @media (max-width: 900px) {
      .cart-grid {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 1rem;
      }

      .item-quantity,
      .item-total,
      .remove-btn {
        grid-column: 2;
      }

      .cart-summary {
        position: static;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  protected readonly cartService = inject(CartService);

  updatingItems = signal<Set<number>>(new Set());
  shippingCost = 0;

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }

  estimatedTax(): number {
    return this.cartService.cartTotal() * 0.08; // 8% tax
  }

  orderTotal(): number {
    return this.cartService.cartTotal() + this.shippingCost + this.estimatedTax();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.stockQuantity) return;

    this.updatingItems.update(set => {
      const newSet = new Set(set);
      newSet.add(item.id);
      return newSet;
    });

    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => this.clearUpdating(item.id),
      error: () => this.clearUpdating(item.id)
    });
  }

  removeItem(item: CartItem): void {
    this.updatingItems.update(set => {
      const newSet = new Set(set);
      newSet.add(item.id);
      return newSet;
    });

    this.cartService.removeItem(item.id).subscribe({
      next: () => this.clearUpdating(item.id),
      error: () => this.clearUpdating(item.id)
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe();
    }
  }

  private clearUpdating(itemId: number): void {
    this.updatingItems.update(set => {
      const newSet = new Set(set);
      newSet.delete(itemId);
      return newSet;
    });
  }
}
