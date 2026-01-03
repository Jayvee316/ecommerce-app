import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';

declare const Stripe: any;

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

export interface StripeConfig {
  publishableKey: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  shippingCost?: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
}

export interface OrderConfirmation {
  orderId: number;
  orderNumber: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;

  isStripeLoaded = signal(false);
  stripeError = signal<string | null>(null);

  /**
   * Load Stripe.js and initialize
   */
  async loadStripe(): Promise<void> {
    if (this.stripe) {
      this.isStripeLoaded.set(true);
      return;
    }

    try {
      // Get publishable key from backend
      const config = await this.http.get<StripeConfig>(`${this.apiUrl}/payment/config`).toPromise();

      if (!config?.publishableKey) {
        throw new Error('Stripe publishable key not configured');
      }

      // Load Stripe.js if not already loaded
      if (!(window as any).Stripe) {
        await this.loadStripeScript();
      }

      this.stripe = (window as any).Stripe(config.publishableKey);
      this.isStripeLoaded.set(true);
    } catch (error: any) {
      this.stripeError.set(error.message || 'Failed to load Stripe');
      throw error;
    }
  }

  private loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Create card element and mount to DOM
   */
  createCardElement(elementId: string): void {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a1a',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': {
            color: '#9ca3af'
          }
        },
        invalid: {
          color: '#dc2626',
          iconColor: '#dc2626'
        }
      }
    });

    this.cardElement.mount(`#${elementId}`);
  }

  /**
   * Destroy card element
   */
  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  /**
   * Create payment intent
   */
  createPaymentIntent(shippingCost?: number): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.apiUrl}/payment/create-payment-intent`, {
      shippingCost
    });
  }

  /**
   * Confirm card payment with Stripe
   */
  async confirmCardPayment(clientSecret: string, billingDetails: any): Promise<any> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe not initialized');
    }

    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
        billing_details: billingDetails
      }
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  }

  /**
   * Confirm payment and create order
   */
  confirmPayment(request: ConfirmPaymentRequest): Observable<OrderConfirmation> {
    return this.http.post<OrderConfirmation>(`${this.apiUrl}/payment/confirm-payment`, request);
  }

  /**
   * Get card element for validation
   */
  getCardElement(): any {
    return this.cardElement;
  }
}
