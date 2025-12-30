import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-container">
      <app-header />
      <router-outlet />
      <app-footer />
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    // Load user data if authenticated
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe();
      this.wishlistService.loadWishlist().subscribe();
      this.notificationService.loadNotifications().subscribe();
    }
  }
}
