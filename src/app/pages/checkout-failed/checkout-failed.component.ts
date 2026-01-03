import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-failed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="failed-page">
      <div class="container">
        <div class="failed-card">
          <div class="failed-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>

          <h1>Payment Failed</h1>

          <p class="message">
            {{ errorMessage() }}
          </p>

          <div class="details">
            <h2>What happened?</h2>
            <ul>
              @switch (errorType()) {
                @case ('card_declined') {
                  <li>Your card was declined by the bank</li>
                  <li>This could be due to insufficient funds or card restrictions</li>
                }
                @case ('expired_card') {
                  <li>Your card has expired</li>
                  <li>Please use a different card or update your card details</li>
                }
                @case ('processing_error') {
                  <li>There was an error processing your payment</li>
                  <li>This is usually temporary - please try again</li>
                }
                @default {
                  <li>We couldn't complete your payment</li>
                  <li>Please check your payment details and try again</li>
                }
              }
            </ul>
          </div>

          <div class="suggestions">
            <h2>What you can do</h2>
            <ul>
              <li>Check that your card details are correct</li>
              <li>Make sure your card has sufficient funds</li>
              <li>Try a different payment method</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>

          <div class="actions">
            <a routerLink="/checkout" class="btn btn-primary">
              Try Again
            </a>
            <a routerLink="/cart" class="btn btn-outline">
              Back to Cart
            </a>
          </div>

          <p class="support">
            Need help? <a href="mailto:support@example.com">Contact Support</a>
          </p>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .failed-page {
      padding: 2rem 0 4rem;
      min-height: calc(100vh - 200px);
      background: #f8f9fa;
      display: flex;
      align-items: center;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0 1rem;
      width: 100%;
    }

    .failed-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .failed-icon {
      width: 80px;
      height: 80px;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .failed-icon svg {
      width: 48px;
      height: 48px;
    }

    h1 {
      color: #dc2626;
      margin: 0 0 1rem;
      font-size: 1.75rem;
    }

    .message {
      color: #6b7280;
      font-size: 1.0625rem;
      margin: 0 0 2rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .details,
    .suggestions {
      text-align: left;
      background: #f9fafb;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .details h2,
    .suggestions h2 {
      font-size: 0.9375rem;
      margin: 0 0 0.75rem;
      color: #374151;
    }

    .details ul,
    .suggestions ul {
      margin: 0;
      padding-left: 1.25rem;
      color: #6b7280;
      font-size: 0.9375rem;
      line-height: 1.7;
    }

    .details {
      background: #fef2f2;
    }

    .details ul {
      color: #991b1b;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .btn {
      padding: 0.875rem 1.75rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-size: 1rem;
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
      border-color: #9ca3af;
    }

    .support {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .support a {
      color: #2563eb;
      text-decoration: none;
    }

    .support a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .failed-card {
        padding: 1.5rem;
      }

      .actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class CheckoutFailedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  errorMessage = signal('We were unable to process your payment. Please try again or use a different payment method.');
  errorType = signal('generic');

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    const message = this.route.snapshot.queryParamMap.get('message');

    if (reason) {
      this.errorType.set(reason);
    }

    if (message) {
      this.errorMessage.set(decodeURIComponent(message));
    }
  }
}
