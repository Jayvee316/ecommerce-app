import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="login-page">
      <div class="login-container">
        <div class="login-card">
          <div class="logo">
            <span>🛒</span>
            <h1>ShopHub</h1>
          </div>

          <h2>Welcome Back</h2>
          <p class="subtitle">Sign in to continue shopping</p>

          @if (error()) {
            <div class="error-message" role="alert">
              {{ error() }}
            </div>
          }

          <form (submit)="onSubmit($event)">
            <div class="form-group">
              <label for="username">Username</label>
              <input
                id="username"
                type="text"
                [(ngModel)]="credentials.username"
                name="username"
                placeholder="Enter your username"
                required
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="credentials.password"
                name="password"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading()">
              @if (isLoading()) {
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="divider">
            <span>or</span>
          </div>

          <p class="register-link">
            Don't have an account?
            <a routerLink="/register">Create one</a>
          </p>

          <div class="demo-credentials">
            <p><strong>Demo Account:</strong></p>
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .login-container {
      width: 100%;
      max-width: 420px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .logo {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo span {
      font-size: 3rem;
    }

    .logo h1 {
      margin: 0.5rem 0 0;
      font-size: 1.5rem;
    }

    h2 {
      margin: 0;
      text-align: center;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin: 0.5rem 0 2rem;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .btn {
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
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

    .btn-block {
      display: block;
      width: 100%;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #eee;
    }

    .divider span {
      padding: 0 1rem;
      color: #999;
      font-size: 0.875rem;
    }

    .register-link {
      text-align: center;
      color: #666;
      margin: 0;
    }

    .register-link a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .demo-credentials {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .demo-credentials p {
      margin: 0;
      color: #666;
    }

    .demo-credentials p + p {
      margin-top: 0.25rem;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  credentials = {
    username: '',
    password: ''
  };

  isLoading = signal(false);
  error = signal<string | null>(null);

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.credentials.username || !this.credentials.password) {
      this.error.set('Please enter username and password');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Load user data
        this.cartService.loadCart().subscribe();
        this.wishlistService.loadWishlist().subscribe();
        this.notificationService.loadNotifications().subscribe();

        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Invalid username or password');
      }
    });
  }
}
