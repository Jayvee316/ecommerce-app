import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductFilters } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductListItem, Category, SearchResult } from '../../models';

@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ProductCardComponent],
  template: `
    <main class="products-page">
      <div class="container">
        <div class="page-header">
          <h1>Products</h1>
          <span class="count">{{ totalProducts() }} products found</span>
        </div>

        <div class="content-grid">
          <!-- Filters Sidebar -->
          <aside class="filters">
            <div class="filter-section">
              <h3>Search</h3>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                placeholder="Search products..."
                aria-label="Search products"
              />
            </div>

            <div class="filter-section">
              <h3>Category</h3>
              <select [(ngModel)]="selectedCategory" (change)="applyFilters()" aria-label="Select category">
                <option [ngValue]="null">All Categories</option>
                @for (category of categories(); track category.id) {
                  <option [ngValue]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>

            <div class="filter-section">
              <h3>Price Range</h3>
              <div class="price-inputs">
                <input
                  type="number"
                  [(ngModel)]="minPrice"
                  (change)="applyFilters()"
                  placeholder="Min"
                  aria-label="Minimum price"
                />
                <span>-</span>
                <input
                  type="number"
                  [(ngModel)]="maxPrice"
                  (change)="applyFilters()"
                  placeholder="Max"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div class="filter-section">
              <h3>Rating</h3>
              <select [(ngModel)]="minRating" (change)="applyFilters()" aria-label="Minimum rating">
                <option [ngValue]="null">Any Rating</option>
                <option [ngValue]="4">4+ Stars</option>
                <option [ngValue]="3">3+ Stars</option>
                <option [ngValue]="2">2+ Stars</option>
              </select>
            </div>

            <div class="filter-section">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inStockOnly" (change)="applyFilters()" />
                <span>In Stock Only</span>
              </label>
            </div>

            <button class="btn btn-outline" (click)="clearFilters()">Clear Filters</button>
          </aside>

          <!-- Products Grid -->
          <div class="products-section">
            <div class="sort-bar">
              <label>Sort by:</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()" aria-label="Sort products">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            @if (isLoading()) {
              <div class="loading">Loading products...</div>
            } @else if (products().length > 0) {
              <div class="product-grid">
                @for (product of products(); track product.id) {
                  <app-product-card [product]="product" />
                }
              </div>

              @if (totalPages() > 1) {
                <nav class="pagination" aria-label="Pagination">
                  <button
                    class="btn btn-outline"
                    [disabled]="currentPage() <= 1"
                    (click)="goToPage(currentPage() - 1)"
                  >
                    Previous
                  </button>
                  <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
                  <button
                    class="btn btn-outline"
                    [disabled]="currentPage() >= totalPages()"
                    (click)="goToPage(currentPage() + 1)"
                  >
                    Next
                  </button>
                </nav>
              }
            } @else {
              <div class="empty">
                <p>No products found matching your criteria.</p>
                <button class="btn btn-primary" (click)="clearFilters()">Clear Filters</button>
              </div>
            }
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .products-page {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
    }

    .count {
      color: #666;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 2rem;
    }

    .filters {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      height: fit-content;
      position: sticky;
      top: 80px;
    }

    .filter-section {
      margin-bottom: 1.5rem;
    }

    .filter-section h3 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 0.75rem;
    }

    .filter-section input[type="text"],
    .filter-section input[type="number"],
    .filter-section select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .price-inputs input {
      flex: 1;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
    }

    .sort-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      background: #fff;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }

    .sort-bar label {
      color: #666;
      font-size: 0.875rem;
    }

    .sort-bar select {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1rem;
    }

    .page-info {
      color: #666;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-outline {
      background: white;
      border: 1px solid #ddd;
      color: #333;
    }

    .btn-outline:hover:not(:disabled) {
      border-color: #2563eb;
      color: #2563eb;
    }

    .btn-outline:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .loading,
    .empty {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty p {
      margin-bottom: 1rem;
    }

    @media (max-width: 900px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        position: static;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .filter-section {
        margin-bottom: 0;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly searchService = inject(SearchService);

  products = signal<ProductListItem[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  totalProducts = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);

  // Filter state
  searchQuery = '';
  selectedCategory: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minRating: number | null = null;
  inStockOnly = false;
  sortBy = 'relevance';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // Load categories
    this.productService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories.filter(c => c.isActive))
    });

    // Check for query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = Number(params['category']);
      }
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      this.loadProducts();
    });
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = null;
    this.inStockOnly = false;
    this.sortBy = 'relevance';
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadProducts(): void {
    this.isLoading.set(true);

    // Use Node.js search API for advanced search with ratings
    this.searchService.search({
      query: this.searchQuery || undefined,
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      minRating: this.minRating || undefined,
      inStock: this.inStockOnly || undefined,
      sortBy: this.sortBy as 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest',
      page: this.currentPage(),
      limit: 12
    }).subscribe({
      next: (response) => {
        // Convert SearchResult to ProductListItem
        const products: ProductListItem[] = response.results.map(r => ({
          id: r.id,
          name: r.name,
          price: r.price,
          salePrice: r.salePrice,
          imageUrl: r.imageUrl,
          stockQuantity: r.inStock ? 1 : 0,
          isActive: true,
          isFeatured: r.isFeatured,
          categoryName: r.categoryName
        }));
        this.products.set(products);
        this.totalProducts.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
