import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🛒</span>
          <span class="logo-text">ShopHub</span>
        </a>

        <nav class="nav" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/products" routerLinkActive="active">Products</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
        </nav>

        <div class="actions">
          @if (authService.isAuthenticated()) {
            <a routerLink="/wishlist" class="icon-btn" aria-label="Wishlist">
              <span class="icon">♡</span>
              @if (wishlistService.wishlistCount() > 0) {
                <span class="badge">{{ wishlistService.wishlistCount() }}</span>
              }
            </a>

            <a routerLink="/cart" class="icon-btn" aria-label="Shopping cart">
              <span class="icon">🛒</span>
              @if (cartService.cartItemCount() > 0) {
                <span class="badge">{{ cartService.cartItemCount() }}</span>
              }
            </a>

            <div class="user-menu">
              <button class="user-btn" aria-label="User menu">
                <span class="avatar">{{ getUserInitial() }}</span>
              </button>
              <div class="dropdown">
                <a routerLink="/orders">My Orders</a>
                <a routerLink="/profile">Profile</a>
                @if (authService.isAdmin()) {
                  <a routerLink="/admin">Admin Dashboard</a>
                }
                <hr />
                <button (click)="authService.logout()">Logout</button>
              </div>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-outline">Login</a>
            <a routerLink="/register" class="btn btn-primary">Register</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #1a1a1a;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .nav {
      display: flex;
      gap: 2rem;
    }

    .nav a {
      text-decoration: none;
      color: #666;
      font-weight: 500;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .nav a:hover,
    .nav a.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-btn {
      position: relative;
      padding: 0.5rem;
      text-decoration: none;
      color: #666;
      font-size: 1.25rem;
      transition: color 0.2s;
    }

    .icon-btn:hover {
      color: #2563eb;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 0.5rem 0;
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(8px);
      transition: all 0.2s;
    }

    .user-menu:hover .dropdown,
    .user-menu:focus-within .dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown a,
    .dropdown button {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #333;
      font-size: 0.875rem;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }

    .dropdown a:hover,
    .dropdown button:hover {
      background: #f5f5f5;
    }

    .dropdown hr {
      margin: 0.5rem 0;
      border: none;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-outline {
      border: 1px solid #ddd;
      color: #333;
    }

    .btn-outline:hover {
      border-color: #2563eb;
      color: #2563eb;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
      border: 1px solid #2563eb;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    @media (max-width: 768px) {
      .nav {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
  protected readonly wishlistService = inject(WishlistService);
  protected readonly notificationService = inject(NotificationService);

  getUserInitial(): string {
    const user = this.authService.currentUser();
    return user?.name?.charAt(0).toUpperCase() || 'U';
  }
}
