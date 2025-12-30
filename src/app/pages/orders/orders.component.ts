import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { OrderListItem } from '../../models';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <main class="orders-page">
      <div class="container">
        <h1>My Orders</h1>

        @if (isLoading()) {
          <div class="loading">Loading orders...</div>
        } @else if (orders().length === 0) {
          <div class="empty">
            <span class="icon">📦</span>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here.</p>
            <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
          </div>
        } @else {
          <div class="orders-list">
            @for (order of orders(); track order.id) {
              <article class="order-card">
                <div class="order-header">
                  <div class="order-info">
                    <h3>Order #{{ order.orderNumber }}</h3>
                    <time>{{ order.createdAt | date:'medium' }}</time>
                  </div>
                  <div class="order-badges">
                    <span class="badge" [class]="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                    <span class="badge" [class]="getPaymentStatusClass(order.paymentStatus)">
                      {{ order.paymentStatus }}
                    </span>
                  </div>
                </div>

                <div class="order-details">
                  <div class="detail">
                    <span class="label">Items</span>
                    <span class="value">{{ order.itemCount }}</span>
                  </div>
                  <div class="detail">
                    <span class="label">Total</span>
                    <span class="value">{{ order.totalAmount | currency }}</span>
                  </div>
                </div>

                <div class="order-actions">
                  <a [routerLink]="['/orders', order.id]" class="btn btn-outline">
                    View Details
                  </a>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .orders-page {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    h1 {
      margin-bottom: 2rem;
    }

    .loading,
    .empty {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty .icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .empty h2 {
      margin-bottom: 0.5rem;
    }

    .empty p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .order-info h3 {
      margin: 0;
      font-size: 1.125rem;
    }

    .order-info time {
      color: #666;
      font-size: 0.875rem;
    }

    .order-badges {
      display: flex;
      gap: 0.5rem;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .badge.processing {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge.shipped {
      background: #e0e7ff;
      color: #3730a3;
    }

    .badge.delivered {
      background: #d1fae5;
      color: #065f46;
    }

    .badge.cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge.paid {
      background: #d1fae5;
      color: #065f46;
    }

    .badge.unpaid {
      background: #fef3c7;
      color: #92400e;
    }

    .badge.refunded {
      background: #e0e7ff;
      color: #3730a3;
    }

    .order-details {
      display: flex;
      gap: 2rem;
      padding: 1rem 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
      margin-bottom: 1rem;
    }

    .detail {
      display: flex;
      flex-direction: column;
    }

    .detail .label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail .value {
      font-size: 1.125rem;
      font-weight: 600;
    }

    .order-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 500;
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
      border: 1px solid #ddd;
      color: #333;
    }

    .btn-outline:hover {
      border-color: #2563eb;
      color: #2563eb;
    }
  `]
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  orders = signal<OrderListItem[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getPaymentStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
