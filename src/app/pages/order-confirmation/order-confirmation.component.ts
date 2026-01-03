import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';

@Component({
  selector: 'app-order-confirmation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <main class="confirmation-page">
      <div class="container">
        @if (isLoading()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading order details...</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <div class="error-icon">!</div>
            <h1>Order Not Found</h1>
            <p>{{ error() }}</p>
            <a routerLink="/orders" class="btn btn-primary">View All Orders</a>
          </div>
        } @else if (order()) {
          <div class="success-header">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1>Order Confirmed!</h1>
            <p class="order-number">Order #{{ order()!.orderNumber }}</p>
            <p class="thank-you">Thank you for your purchase. We've received your order and will begin processing it soon.</p>
          </div>

          <div class="order-details">
            <section class="detail-section">
              <h2>Order Summary</h2>
              <div class="items-list">
                @for (item of order()!.items; track item.id) {
                  <div class="order-item">
                    <div class="item-image">
                      @if (item.productImageUrl) {
                        <img [src]="item.productImageUrl" [alt]="item.productName" />
                      } @else {
                        <div class="placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21,15 16,10 5,21"/>
                          </svg>
                        </div>
                      }
                    </div>
                    <div class="item-details">
                      <h4>{{ item.productName }}</h4>
                      <p class="item-meta">Qty: {{ item.quantity }} x {{ item.unitPrice | currency }}</p>
                    </div>
                    <div class="item-total">
                      {{ item.totalPrice | currency }}
                    </div>
                  </div>
                }
              </div>

              <div class="price-breakdown">
                <div class="price-row">
                  <span>Subtotal</span>
                  <span>{{ order()!.subTotal | currency }}</span>
                </div>
                <div class="price-row">
                  <span>Tax</span>
                  <span>{{ order()!.tax | currency }}</span>
                </div>
                <div class="price-row">
                  <span>Shipping</span>
                  <span>{{ order()!.shippingCost | currency }}</span>
                </div>
                <div class="price-row total">
                  <span>Total</span>
                  <span>{{ order()!.totalAmount | currency }}</span>
                </div>
              </div>
            </section>

            <div class="info-sections">
              <section class="detail-section">
                <h2>Shipping Address</h2>
                <address>
                  <p><strong>{{ order()!.shippingInfo.name }}</strong></p>
                  <p>{{ order()!.shippingInfo.address }}</p>
                  <p>{{ order()!.shippingInfo.city }}, {{ order()!.shippingInfo.state }} {{ order()!.shippingInfo.zipCode }}</p>
                  <p>{{ order()!.shippingInfo.country }}</p>
                  @if (order()!.shippingInfo.phone) {
                    <p>{{ order()!.shippingInfo.phone }}</p>
                  }
                </address>
              </section>

              <section class="detail-section">
                <h2>Payment Information</h2>
                <div class="payment-info">
                  <div class="info-row">
                    <span class="label">Method</span>
                    <span class="value">{{ formatPaymentMethod(order()!.paymentMethod) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Status</span>
                    <span class="badge paid">{{ order()!.paymentStatus }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Date</span>
                    <span class="value">{{ order()!.createdAt | date:'medium' }}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div class="actions">
            <a routerLink="/orders" class="btn btn-outline">View All Orders</a>
            <a routerLink="/products" class="btn btn-primary">Continue Shopping</a>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .confirmation-page {
      padding: 2rem 0 4rem;
      min-height: calc(100vh - 200px);
      background: #f8f9fa;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .loading {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid #e5e7eb;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
    }

    .error-icon {
      width: 64px;
      height: 64px;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      margin: 0 auto 1.5rem;
    }

    .success-header {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: #d1fae5;
      color: #059669;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .success-icon svg {
      width: 48px;
      height: 48px;
    }

    .success-header h1 {
      color: #059669;
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
    }

    .order-number {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 1rem;
    }

    .thank-you {
      color: #6b7280;
      margin: 0;
      max-width: 400px;
      margin: 0 auto;
    }

    .order-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .detail-section h2 {
      font-size: 1.125rem;
      margin: 0 0 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .order-item {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .item-image {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      overflow: hidden;
      background: #f3f4f6;
      flex-shrink: 0;
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
      color: #9ca3af;
    }

    .placeholder svg {
      width: 32px;
      height: 32px;
    }

    .item-details {
      flex: 1;
    }

    .item-details h4 {
      margin: 0 0 0.25rem;
      font-size: 0.9375rem;
    }

    .item-meta {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .item-total {
      font-weight: 600;
      font-size: 0.9375rem;
    }

    .price-breakdown {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #6b7280;
    }

    .price-row.total {
      border-top: 1px solid #e5e7eb;
      margin-top: 0.5rem;
      padding-top: 1rem;
      font-size: 1.125rem;
      font-weight: 700;
      color: #111827;
    }

    .info-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    address {
      font-style: normal;
      line-height: 1.6;
    }

    address p {
      margin: 0;
      color: #4b5563;
    }

    address p:first-child {
      color: #111827;
    }

    .payment-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-row .label {
      color: #6b7280;
    }

    .info-row .value {
      color: #111827;
      text-transform: capitalize;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .badge.paid {
      background: #d1fae5;
      color: #065f46;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
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
      border: 1px solid #d1d5db;
      color: #374151;
    }

    .btn-outline:hover {
      border-color: #2563eb;
      color: #2563eb;
    }

    @media (max-width: 640px) {
      .info-sections {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
      }

      .btn {
        text-align: center;
      }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  order = signal<Order | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId || isNaN(Number(orderId))) {
      this.error.set('Invalid order ID');
      this.isLoading.set(false);
      return;
    }

    this.orderService.getOrder(Number(orderId)).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Could not load order details. Please check your orders page.');
        this.isLoading.set(false);
      }
    });
  }

  formatPaymentMethod(method?: string): string {
    if (!method) return 'N/A';
    switch (method.toLowerCase()) {
      case 'stripe':
        return 'Credit/Debit Card';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  }
}
