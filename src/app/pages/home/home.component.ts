import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductListItem, Category } from '../../models';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <main class="home">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1>Welcome to ShopHub</h1>
            <p>Discover amazing products at unbeatable prices</p>
            <a routerLink="/products" class="btn btn-primary btn-lg">Shop Now</a>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>Featured Products</h2>
            <a routerLink="/products" class="view-all">View All →</a>
          </div>

          @if (isLoading()) {
            <div class="loading">Loading products...</div>
          } @else if (featuredProducts().length > 0) {
            <div class="product-grid">
              @for (product of featuredProducts(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>
          } @else {
            <p class="empty">No featured products available.</p>
          }
        </div>
      </section>

      <!-- Categories -->
      <section class="section section-alt">
        <div class="container">
          <div class="section-header">
            <h2>Shop by Category</h2>
            <a routerLink="/categories" class="view-all">View All →</a>
          </div>

          @if (categories().length > 0) {
            <div class="category-grid">
              @for (category of categories(); track category.id) {
                <a [routerLink]="['/products']" [queryParams]="{category: category.id}" class="category-card">
                  <div class="category-icon">
                    @switch (category.name.toLowerCase()) {
                      @case ('electronics') { 📱 }
                      @case ('clothing') { 👕 }
                      @case ('home') { 🏠 }
                      @case ('books') { 📚 }
                      @case ('sports') { ⚽ }
                      @default { 📦 }
                    }
                  </div>
                  <h3>{{ category.name }}</h3>
                  <span class="count">{{ category.productCount }} products</span>
                </a>
              }
            </div>
          }
        </div>
      </section>

      <!-- Trending Section -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>Trending Now</h2>
          </div>

          @if (trendingProducts().length > 0) {
            <div class="trending-grid">
              @for (product of trendingProducts(); track product.id) {
                <a [routerLink]="['/products', product.id]" class="trending-card">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.name" />
                  } @else {
                    <div class="placeholder">📦</div>
                  }
                  <div class="trending-info">
                    <h4>{{ product.name }}</h4>
                    <div class="rating">⭐ {{ product.rating.toFixed(1) }}</div>
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </section>

      <!-- Newsletter -->
      <section class="section section-newsletter">
        <div class="container">
          <div class="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for exclusive deals and updates</p>
            <form class="newsletter-form" (submit)="$event.preventDefault()">
              <input type="email" placeholder="Enter your email" aria-label="Email address" />
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6rem 0;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .hero-content p {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .section {
      padding: 4rem 0;
    }

    .section-alt {
      background: #f8f9fa;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-header h2 {
      font-size: 1.75rem;
      margin: 0;
    }

    .view-all {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.5rem;
    }

    .category-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .category-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .category-card h3 {
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
    }

    .category-card .count {
      color: #666;
      font-size: 0.875rem;
    }

    .trending-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .trending-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      border-radius: 12px;
      padding: 1rem;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s;
    }

    .trending-card:hover {
      transform: translateX(4px);
    }

    .trending-card img,
    .trending-card .placeholder {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .trending-info h4 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
    }

    .rating {
      color: #666;
      font-size: 0.875rem;
    }

    .section-newsletter {
      background: #1a1a2e;
      color: white;
      text-align: center;
    }

    .newsletter-content h2 {
      margin-bottom: 0.5rem;
    }

    .newsletter-content p {
      opacity: 0.8;
      margin-bottom: 1.5rem;
    }

    .newsletter-form {
      display: flex;
      gap: 0.5rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .newsletter-form input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }

    .loading,
    .empty {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .newsletter-form {
        flex-direction: column;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly searchService = inject(SearchService);

  featuredProducts = signal<ProductListItem[]>([]);
  categories = signal<Category[]>([]);
  trendingProducts = signal<{ id: number; name: string; imageUrl: string; rating: number }[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts.set(products.slice(0, 8));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    this.productService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories.filter(c => c.isActive))
    });

    this.searchService.getTrending().subscribe({
      next: (response) => this.trendingProducts.set(response.trending)
    });
  }
}
