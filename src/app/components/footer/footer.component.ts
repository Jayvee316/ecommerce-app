import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-section">
            <h3>ShopHub</h3>
            <p>Your one-stop shop for amazing products at great prices.</p>
          </div>

          <div class="footer-section">
            <h4>Quick Links</h4>
            <nav aria-label="Footer navigation">
              <a routerLink="/">Home</a>
              <a routerLink="/products">Products</a>
              <a routerLink="/categories">Categories</a>
              <a routerLink="/about">About Us</a>
            </nav>
          </div>

          <div class="footer-section">
            <h4>Customer Service</h4>
            <nav aria-label="Customer service links">
              <a routerLink="/contact">Contact Us</a>
              <a routerLink="/faq">FAQ</a>
              <a routerLink="/shipping">Shipping Info</a>
              <a routerLink="/returns">Returns Policy</a>
            </nav>
          </div>

          <div class="footer-section">
            <h4>Connect With Us</h4>
            <div class="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="YouTube">📺</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2024 ShopHub. All rights reserved.</p>
          <nav aria-label="Legal links">
            <a routerLink="/privacy">Privacy Policy</a>
            <a routerLink="/terms">Terms of Service</a>
          </nav>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #1a1a2e;
      color: #a0a0a0;
      padding: 3rem 0 1.5rem;
      margin-top: auto;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h3 {
      color: #fff;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .footer-section h4 {
      color: #fff;
      font-size: 1rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .footer-section p {
      line-height: 1.6;
    }

    .footer-section nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-section nav a {
      color: #a0a0a0;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-section nav a:hover {
      color: #fff;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    .social-links a {
      font-size: 1.5rem;
      transition: transform 0.2s;
    }

    .social-links a:hover {
      transform: scale(1.1);
    }

    .footer-bottom {
      border-top: 1px solid #333;
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-bottom p {
      margin: 0;
    }

    .footer-bottom nav {
      display: flex;
      gap: 1.5rem;
    }

    .footer-bottom nav a {
      color: #a0a0a0;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .footer-bottom nav a:hover {
      color: #fff;
    }

    @media (max-width: 768px) {
      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
