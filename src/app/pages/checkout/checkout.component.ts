import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService, CreateOrderRequest } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService, PaymentIntentResponse } from '../../services/payment.service';
import { ShippingInfo } from '../../models';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  template: `
    <main class="checkout-page">
      <div class="container">
        <h1>Checkout</h1>

        @if (cartService.isEmpty()) {
          <div class="empty-cart">
            <p>Your cart is empty.</p>
            <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
          </div>
        } @else {
          <div class="checkout-grid">
            <!-- Checkout Form -->
            <div class="checkout-form">
              <section class="form-section">
                <h2>Shipping Information</h2>

                <div class="form-grid">
                  <div class="form-group full-width">
                    <label for="name">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      [(ngModel)]="shippingInfo.name"
                      name="name"
                      required
                    />
                  </div>

                  <div class="form-group full-width">
                    <label for="address">Street Address *</label>
                    <input
                      id="address"
                      type="text"
                      [(ngModel)]="shippingInfo.address"
                      name="address"
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="city">City *</label>
                    <input
                      id="city"
                      type="text"
                      [(ngModel)]="shippingInfo.city"
                      name="city"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="state">State/Province *</label>
                    <input
                      id="state"
                      type="text"
                      [(ngModel)]="shippingInfo.state"
                      name="state"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="zipCode">ZIP/Postal Code *</label>
                    <input
                      id="zipCode"
                      type="text"
                      [(ngModel)]="shippingInfo.zipCode"
                      name="zipCode"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="country">Country *</label>
                    <select
                      id="country"
                      [(ngModel)]="shippingInfo.country"
                      name="country"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="PH">Philippines</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      [(ngModel)]="shippingInfo.phone"
                      name="phone"
                    />
                  </div>
                </div>
              </section>

              <section class="form-section">
                <h2>Payment Method</h2>

                <div class="payment-options">
                  <label class="payment-option">
                    <input
                      type="radio"
                      [(ngModel)]="paymentMethod"
                      name="paymentMethod"
                      value="card"
                      (change)="onPaymentMethodChange()"
                    />
                    <span class="option-content">
                      <span class="option-icon">💳</span>
                      <span class="option-label">Credit/Debit Card (Stripe)</span>
                    </span>
                  </label>

                  <label class="payment-option">
                    <input
                      type="radio"
                      [(ngModel)]="paymentMethod"
                      name="paymentMethod"
                      value="cod"
                      (change)="onPaymentMethodChange()"
                    />
                    <span class="option-content">
                      <span class="option-icon">💵</span>
                      <span class="option-label">Cash on Delivery</span>
                    </span>
                  </label>
                </div>

                @if (paymentMethod === 'card') {
                  <div class="stripe-card-section">
                    @if (paymentService.stripeError()) {
                      <div class="stripe-error">
                        {{ paymentService.stripeError() }}
                      </div>
                    } @else {
                      <label for="card-element">Card Details</label>
                      <div class="stripe-card-wrapper">
                        @if (isStripeLoading()) {
                          <div class="stripe-loading-overlay">
                            <span class="spinner"></span>
                            Loading...
                          </div>
                        }
                        <div id="card-element" class="stripe-card-element"></div>
                      </div>
                      @if (cardError()) {
                        <div class="card-error">{{ cardError() }}</div>
                      }
                    }
                  </div>
                }
              </section>

              <section class="form-section">
                <h2>Order Notes (Optional)</h2>
                <textarea
                  [(ngModel)]="customerNotes"
                  name="notes"
                  rows="3"
                  placeholder="Special instructions for your order..."
                ></textarea>
              </section>
            </div>

            <!-- Order Summary -->
            <aside class="order-summary">
              <h2>Order Summary</h2>

              <div class="order-items">
                @for (item of cartService.cartItems(); track item.id) {
                  <div class="order-item">
                    <div class="item-image">
                      @if (item.productImageUrl) {
                        <img [src]="item.productImageUrl" [alt]="item.productName" />
                      } @else {
                        <div class="placeholder">📦</div>
                      }
                      <span class="quantity-badge">{{ item.quantity }}</span>
                    </div>
                    <div class="item-info">
                      <span class="item-name">{{ item.productName }}</span>
                      <span class="item-price">{{ item.totalPrice | currency }}</span>
                    </div>
                  </div>
                }
              </div>

              <hr />

              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ cartService.cartTotal() | currency }}</span>
              </div>

              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ shippingCost | currency }}</span>
              </div>

              <div class="summary-row">
                <span>Tax</span>
                <span>{{ estimatedTax() | currency }}</span>
              </div>

              <hr />

              <div class="summary-row total">
                <span>Total</span>
                <span>{{ orderTotal() | currency }}</span>
              </div>

              @if (error()) {
                <div class="error-message" role="alert">
                  {{ error() }}
                </div>
              }

              <button
                class="btn btn-primary btn-lg btn-block"
                (click)="placeOrder()"
                [disabled]="isSubmitting() || !isFormValid()"
              >
                @if (isSubmitting()) {
                  Processing...
                } @else {
                  Place Order
                }
              </button>

              <p class="terms">
                By placing your order, you agree to our
                <a routerLink="/terms">Terms of Service</a> and
                <a routerLink="/privacy">Privacy Policy</a>.
              </p>
            </aside>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .checkout-page {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
      background: #f8f9fa;
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
      background: white;
      border-radius: 12px;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .form-section h2 {
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select,
    .form-section textarea {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }

    .form-section textarea {
      width: 100%;
      resize: vertical;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .payment-option {
      display: block;
      cursor: pointer;
    }

    .payment-option input {
      display: none;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #ddd;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .payment-option input:checked + .option-content {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .option-icon {
      font-size: 1.5rem;
    }

    .option-label {
      font-weight: 500;
    }

    .stripe-card-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }

    .stripe-card-section label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .stripe-card-wrapper {
      position: relative;
    }

    .stripe-card-element {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      transition: border-color 0.2s;
      min-height: 44px;
    }

    .stripe-card-element:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .stripe-loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      color: #666;
      font-size: 0.875rem;
      z-index: 1;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .stripe-error {
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-size: 0.875rem;
    }

    .card-error {
      margin-top: 0.5rem;
      color: #dc2626;
      font-size: 0.875rem;
    }

    .order-summary {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      position: sticky;
      top: 80px;
    }

    .order-summary h2 {
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
    }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .order-item {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .item-image {
      position: relative;
      width: 60px;
      height: 60px;
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
    }

    .quantity-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #2563eb;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 10px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .item-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-name {
      font-size: 0.875rem;
    }

    .item-price {
      font-weight: 500;
    }

    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 1rem 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: #666;
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
      font-size: 0.875rem;
    }

    .btn {
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      text-decoration: none;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-primary:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }

    .btn-lg {
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }

    .btn-block {
      display: block;
      width: 100%;
      text-align: center;
    }

    .terms {
      margin-top: 1rem;
      font-size: 0.75rem;
      color: #666;
      text-align: center;
    }

    .terms a {
      color: #2563eb;
      text-decoration: none;
    }

    @media (max-width: 900px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
        order: -1;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full-width {
        grid-column: 1;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewChecked {
  protected readonly cartService = inject(CartService);
  protected readonly paymentService = inject(PaymentService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  shippingInfo: ShippingInfo = {
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  };

  paymentMethod = 'card';
  customerNotes = '';
  shippingCost = 5.00;

  isSubmitting = signal(false);
  isStripeLoading = signal(false);
  error = signal<string | null>(null);
  cardError = signal<string | null>(null);

  private paymentIntent: PaymentIntentResponse | null = null;
  private stripeInitialized = false;
  private cardElementMounted = false;

  ngOnInit(): void {
    // Pre-fill name from user profile
    const user = this.authService.currentUser();
    if (user) {
      this.shippingInfo.name = user.name;
    }

    // Initialize Stripe for card payments
    if (this.paymentMethod === 'card') {
      this.initializeStripe();
    }
  }

  ngAfterViewChecked(): void {
    // Mount card element once Stripe is loaded and DOM element exists
    if (this.stripeInitialized && !this.cardElementMounted && this.paymentMethod === 'card') {
      const cardContainer = document.getElementById('card-element');
      if (cardContainer) {
        this.mountCardElement();
      }
    }
  }

  ngOnDestroy(): void {
    this.paymentService.destroyCardElement();
    this.cardElementMounted = false;
  }

  async initializeStripe(): Promise<void> {
    if (this.stripeInitialized) return;

    this.isStripeLoading.set(true);
    try {
      await this.paymentService.loadStripe();
      this.stripeInitialized = true;
      // Try to mount immediately if DOM is ready
      const cardContainer = document.getElementById('card-element');
      if (cardContainer && !this.cardElementMounted) {
        this.mountCardElement();
      }
    } catch {
      this.isStripeLoading.set(false);
    }
  }

  private mountCardElement(): void {
    try {
      this.paymentService.createCardElement('card-element');
      this.cardElementMounted = true;
      this.setupCardValidation();
      this.isStripeLoading.set(false);
    } catch {
      this.isStripeLoading.set(false);
    }
  }

  private setupCardValidation(): void {
    const cardElement = this.paymentService.getCardElement();
    if (cardElement) {
      cardElement.on('change', (event: { error?: { message: string } }) => {
        this.cardError.set(event.error?.message || null);
      });
    }
  }

  onPaymentMethodChange(): void {
    if (this.paymentMethod === 'card') {
      if (!this.stripeInitialized) {
        this.initializeStripe();
      } else if (!this.cardElementMounted) {
        // Stripe loaded but card not mounted - will be handled by ngAfterViewChecked
        this.isStripeLoading.set(true);
      }
    } else {
      this.paymentService.destroyCardElement();
      this.cardElementMounted = false;
    }
  }

  estimatedTax(): number {
    return this.cartService.cartTotal() * 0.1; // 10% tax to match backend
  }

  orderTotal(): number {
    return this.cartService.cartTotal() + this.shippingCost + this.estimatedTax();
  }

  isFormValid(): boolean {
    const baseValid = !!(
      this.shippingInfo.name &&
      this.shippingInfo.address &&
      this.shippingInfo.city &&
      this.shippingInfo.state &&
      this.shippingInfo.zipCode &&
      this.shippingInfo.country &&
      this.paymentMethod
    );

    if (this.paymentMethod === 'card') {
      return baseValid && this.paymentService.isStripeLoaded() && !this.cardError();
    }

    return baseValid;
  }

  async placeOrder(): Promise<void> {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      if (this.paymentMethod === 'card') {
        await this.processStripePayment();
      } else {
        await this.processCodOrder();
      }
    } catch (err: unknown) {
      this.isSubmitting.set(false);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      this.error.set(errorMessage);
    }
  }

  private async processStripePayment(): Promise<void> {
    // Step 1: Create payment intent on backend
    this.paymentService.createPaymentIntent(this.shippingCost).subscribe({
      next: async (intent) => {
        this.paymentIntent = intent;

        try {
          // Step 2: Confirm card payment with Stripe
          const billingDetails = {
            name: this.shippingInfo.name,
            address: {
              line1: this.shippingInfo.address,
              city: this.shippingInfo.city,
              state: this.shippingInfo.state,
              postal_code: this.shippingInfo.zipCode,
              country: this.shippingInfo.country
            }
          };

          await this.paymentService.confirmCardPayment(intent.clientSecret, billingDetails);

          // Step 3: Confirm payment on backend and create order
          this.paymentService.confirmPayment({
            paymentIntentId: intent.paymentIntentId,
            shippingCost: this.shippingCost,
            shippingAddress: {
              name: this.shippingInfo.name,
              address: this.shippingInfo.address,
              city: this.shippingInfo.city,
              state: this.shippingInfo.state,
              zipCode: this.shippingInfo.zipCode,
              country: this.shippingInfo.country,
              phone: this.shippingInfo.phone
            }
          }).subscribe({
            next: (confirmation) => {
              this.cartService.clearCart().subscribe();
              this.router.navigate(['/orders', confirmation.orderId]);
            },
            error: (err) => {
              this.isSubmitting.set(false);
              const errorMessage = err.error?.error || 'Failed to complete order. Please contact support.';
              this.navigateToFailed('processing_error', errorMessage);
            }
          });
        } catch (stripeError: unknown) {
          this.isSubmitting.set(false);
          const errorMessage = stripeError instanceof Error ? stripeError.message : 'Card payment failed';
          this.navigateToFailed('card_declined', errorMessage);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMessage = err.error?.error || 'Failed to initialize payment. Please try again.';
        this.navigateToFailed('processing_error', errorMessage);
      }
    });
  }

  private navigateToFailed(reason: string, message: string): void {
    this.router.navigate(['/checkout/failed'], {
      queryParams: { reason, message: encodeURIComponent(message) }
    });
  }

  private async processCodOrder(): Promise<void> {
    const orderRequest: CreateOrderRequest = {
      shippingInfo: this.shippingInfo,
      paymentMethod: this.paymentMethod,
      customerNotes: this.customerNotes || undefined
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.cartService.clearCart().subscribe();
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMessage = err.error?.message || 'Failed to place order. Please try again.';
        this.navigateToFailed('processing_error', errorMessage);
      }
    });
  }
}
