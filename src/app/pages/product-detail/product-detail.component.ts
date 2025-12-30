import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService, CreateReviewRequest } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Product, Review, ReviewStats } from '../../models';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <main class="product-detail">
      @if (isLoading()) {
        <div class="container">
          <div class="loading">Loading product...</div>
        </div>
      } @else if (product()) {
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a routerLink="/">Home</a>
            <span>/</span>
            <a routerLink="/products">Products</a>
            <span>/</span>
            <span>{{ product()!.name }}</span>
          </nav>

          <div class="product-grid">
            <!-- Image Gallery -->
            <div class="gallery">
              <div class="main-image">
                @if (selectedImage()) {
                  <img [src]="selectedImage()" [alt]="product()!.name" />
                } @else if (product()!.imageUrl) {
                  <img [src]="product()!.imageUrl" [alt]="product()!.name" />
                } @else {
                  <div class="placeholder">📦</div>
                }
              </div>
              @if (product()!.images && product()!.images.length > 0) {
                <div class="thumbnails">
                  @for (image of product()!.images; track image) {
                    <button
                      class="thumbnail"
                      [class.active]="selectedImage() === image"
                      (click)="selectedImage.set(image)"
                    >
                      <img [src]="image" alt="Product thumbnail" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <div class="badges">
                @if (product()!.isFeatured) {
                  <span class="badge featured">Featured</span>
                }
                @if (product()!.salePrice) {
                  <span class="badge sale">Sale</span>
                }
              </div>

              <h1>{{ product()!.name }}</h1>

              <a [routerLink]="['/products']" [queryParams]="{category: product()!.categoryId}" class="category">
                {{ product()!.categoryName }}
              </a>

              <!-- Rating Summary -->
              @if (reviewStats()) {
                <div class="rating-summary">
                  <div class="stars">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <span [class.filled]="star <= Math.round(reviewStats()!.averageRating)">★</span>
                    }
                  </div>
                  <span class="rating-value">{{ reviewStats()!.averageRating.toFixed(1) }}</span>
                  <span class="review-count">({{ reviewStats()!.totalReviews }} reviews)</span>
                </div>
              }

              <div class="price">
                @if (product()!.salePrice) {
                  <span class="sale-price">{{ product()!.salePrice | currency }}</span>
                  <span class="original-price">{{ product()!.price | currency }}</span>
                  <span class="discount">{{ getDiscount() }}% OFF</span>
                } @else {
                  <span class="current-price">{{ product()!.price | currency }}</span>
                }
              </div>

              <div class="stock" [class.in-stock]="product()!.stockQuantity > 0">
                @if (product()!.stockQuantity > 0) {
                  <span>✓ In Stock ({{ product()!.stockQuantity }} available)</span>
                } @else {
                  <span>✗ Out of Stock</span>
                }
              </div>

              <p class="description">{{ product()!.description }}</p>

              @if (product()!.sku) {
                <p class="sku">SKU: {{ product()!.sku }}</p>
              }

              <!-- Add to Cart -->
              <div class="actions">
                <div class="quantity-selector">
                  <button (click)="decreaseQuantity()" [disabled]="quantity() <= 1">−</button>
                  <input
                    type="number"
                    [ngModel]="quantity()"
                    (ngModelChange)="quantity.set($event)"
                    min="1"
                    [max]="product()!.stockQuantity"
                    aria-label="Quantity"
                  />
                  <button (click)="increaseQuantity()" [disabled]="quantity() >= product()!.stockQuantity">+</button>
                </div>

                <button
                  class="btn btn-primary btn-lg"
                  (click)="addToCart()"
                  [disabled]="product()!.stockQuantity === 0 || isAddingToCart()"
                >
                  @if (isAddingToCart()) {
                    Adding...
                  } @else {
                    Add to Cart
                  }
                </button>

                @if (authService.isAuthenticated()) {
                  <button
                    class="btn btn-icon"
                    (click)="toggleWishlist()"
                    [class.in-wishlist]="isInWishlist()"
                  >
                    {{ isInWishlist() ? '❤️' : '🤍' }}
                  </button>
                }
              </div>

              @if (addedToCart()) {
                <div class="success-message">
                  ✓ Added to cart!
                  <a routerLink="/cart">View Cart</a>
                </div>
              }
            </div>
          </div>

          <!-- Reviews Section -->
          <section class="reviews-section">
            <h2>Customer Reviews</h2>

            @if (authService.isAuthenticated() && !hasUserReviewed()) {
              <div class="write-review">
                <h3>Write a Review</h3>
                <form (submit)="submitReview($event)">
                  <div class="form-group">
                    <label>Rating</label>
                    <div class="star-rating">
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <button
                          type="button"
                          class="star-btn"
                          [class.filled]="star <= newReview.rating"
                          (click)="newReview.rating = star"
                        >
                          ★
                        </button>
                      }
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="review-title">Title</label>
                    <input
                      id="review-title"
                      type="text"
                      [(ngModel)]="newReview.title"
                      name="title"
                      placeholder="Summarize your review"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="review-comment">Comment</label>
                    <textarea
                      id="review-comment"
                      [(ngModel)]="newReview.comment"
                      name="comment"
                      rows="4"
                      placeholder="Tell others what you think"
                      required
                    ></textarea>
                  </div>

                  <button type="submit" class="btn btn-primary" [disabled]="isSubmittingReview()">
                    {{ isSubmittingReview() ? 'Submitting...' : 'Submit Review' }}
                  </button>
                </form>
              </div>
            }

            @if (reviews().length > 0) {
              <div class="reviews-list">
                @for (review of reviews(); track review.id) {
                  <article class="review-card">
                    <div class="review-header">
                      <div class="reviewer">
                        <span class="avatar">{{ review.userName.charAt(0) }}</span>
                        <div>
                          <strong>{{ review.userName }}</strong>
                          <time>{{ review.createdAt | date:'mediumDate' }}</time>
                        </div>
                      </div>
                      <div class="review-rating">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <span [class.filled]="star <= review.rating">★</span>
                        }
                      </div>
                    </div>
                    <h4>{{ review.title }}</h4>
                    <p>{{ review.comment }}</p>
                  </article>
                }
              </div>
            } @else {
              <p class="no-reviews">No reviews yet. Be the first to review this product!</p>
            }
          </section>
        </div>
      } @else {
        <div class="container">
          <div class="not-found">
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <a routerLink="/products" class="btn btn-primary">Browse Products</a>
          </div>
        </div>
      }
    </main>
  `,
  styles: [`
    .product-detail {
      padding: 2rem 0;
      min-height: calc(100vh - 200px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.875rem;
    }

    .breadcrumb a {
      color: #666;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      color: #2563eb;
    }

    .breadcrumb span:last-child {
      color: #1a1a1a;
      font-weight: 500;
    }

    .product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-bottom: 4rem;
    }

    .gallery {
      position: sticky;
      top: 80px;
      height: fit-content;
    }

    .main-image {
      aspect-ratio: 1;
      background: #f5f5f5;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .main-image img {
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
      font-size: 6rem;
    }

    .thumbnails {
      display: flex;
      gap: 0.75rem;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      background: none;
    }

    .thumbnail.active {
      border-color: #2563eb;
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge.featured {
      background: #2563eb;
      color: white;
    }

    .badge.sale {
      background: #ef4444;
      color: white;
    }

    h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem;
    }

    .category {
      color: #666;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .category:hover {
      color: #2563eb;
    }

    .rating-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .stars span,
    .star-btn,
    .review-rating span {
      color: #ddd;
      font-size: 1.25rem;
    }

    .stars span.filled,
    .star-btn.filled,
    .review-rating span.filled {
      color: #fbbf24;
    }

    .rating-value {
      font-weight: 600;
    }

    .review-count {
      color: #666;
    }

    .price {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1.5rem 0;
    }

    .current-price,
    .sale-price {
      font-size: 2rem;
      font-weight: 700;
    }

    .sale-price {
      color: #ef4444;
    }

    .original-price {
      font-size: 1.25rem;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      background: #fef2f2;
      color: #ef4444;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .stock {
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .stock.in-stock {
      color: #22c55e;
    }

    .stock:not(.in-stock) {
      color: #ef4444;
    }

    .description {
      color: #666;
      line-height: 1.7;
      margin-bottom: 1rem;
    }

    .sku {
      font-size: 0.875rem;
      color: #999;
      margin-bottom: 1.5rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .quantity-selector button {
      width: 44px;
      height: 44px;
      border: none;
      background: #f5f5f5;
      font-size: 1.25rem;
      cursor: pointer;
    }

    .quantity-selector button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-selector input {
      width: 60px;
      height: 44px;
      border: none;
      text-align: center;
      font-size: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
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
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1rem;
    }

    .btn-icon {
      width: 52px;
      height: 52px;
      padding: 0;
      background: #f5f5f5;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon.in-wishlist {
      background: #fef2f2;
    }

    .success-message {
      background: #ecfdf5;
      color: #065f46;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .success-message a {
      color: #2563eb;
      margin-left: auto;
    }

    /* Reviews */
    .reviews-section {
      border-top: 1px solid #eee;
      padding-top: 3rem;
    }

    .reviews-section h2 {
      margin-bottom: 2rem;
    }

    .write-review {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .write-review h3 {
      margin: 0 0 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }

    .star-rating {
      display: flex;
      gap: 0.25rem;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 0;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-card {
      background: #fff;
      border: 1px solid #eee;
      padding: 1.5rem;
      border-radius: 12px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .reviewer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .reviewer time {
      display: block;
      font-size: 0.875rem;
      color: #666;
    }

    .review-card h4 {
      margin: 0 0 0.5rem;
    }

    .review-card p {
      color: #666;
      margin: 0;
    }

    .no-reviews {
      text-align: center;
      color: #666;
      padding: 2rem;
    }

    .loading,
    .not-found {
      text-align: center;
      padding: 4rem 2rem;
    }

    @media (max-width: 900px) {
      .product-grid {
        grid-template-columns: 1fr;
      }

      .gallery {
        position: static;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  protected readonly Math = Math;
  protected readonly authService = inject(AuthService);

  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly reviewService = inject(ReviewService);

  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  reviewStats = signal<ReviewStats | null>(null);
  isLoading = signal(true);
  selectedImage = signal<string | null>(null);
  quantity = signal(1);
  isAddingToCart = signal(false);
  addedToCart = signal(false);
  isSubmittingReview = signal(false);

  newReview: CreateReviewRequest = {
    rating: 5,
    title: '',
    comment: ''
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = Number(params['id']);
      if (productId) {
        this.loadProduct(productId);
        this.loadReviews(productId);
      }
    });
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
        if (product.images?.length > 0) {
          this.selectedImage.set(product.images[0]);
        }
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  private loadReviews(productId: number): void {
    this.reviewService.getProductReviews(productId).subscribe({
      next: (response) => {
        this.reviews.set(response.reviews);
        this.reviewStats.set(response.stats);
      }
    });
  }

  increaseQuantity(): void {
    const max = this.product()?.stockQuantity ?? 1;
    if (this.quantity() < max) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    const product = this.product();
    if (!product || this.isAddingToCart()) return;

    this.isAddingToCart.set(true);
    this.cartService.addToCart(product.id, this.quantity()).subscribe({
      next: () => {
        this.isAddingToCart.set(false);
        this.addedToCart.set(true);
        setTimeout(() => this.addedToCart.set(false), 3000);
      },
      error: () => {
        this.isAddingToCart.set(false);
      }
    });
  }

  toggleWishlist(): void {
    const product = this.product();
    if (!product) return;

    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(product.id).subscribe();
    } else {
      this.wishlistService.addToWishlist(product.id).subscribe();
    }
  }

  isInWishlist(): boolean {
    const product = this.product();
    return product ? this.wishlistService.isInWishlist(product.id) : false;
  }

  getDiscount(): number {
    const product = this.product();
    if (!product?.salePrice) return 0;
    return Math.round((1 - product.salePrice / product.price) * 100);
  }

  hasUserReviewed(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return this.reviews().some(r => r.userId === user.id);
  }

  submitReview(event: Event): void {
    event.preventDefault();
    const product = this.product();
    if (!product || this.isSubmittingReview()) return;

    this.isSubmittingReview.set(true);
    this.reviewService.createReview(product.id, this.newReview).subscribe({
      next: (review) => {
        this.reviews.update(reviews => [review, ...reviews]);
        this.loadReviews(product.id); // Refresh stats
        this.newReview = { rating: 5, title: '', comment: '' };
        this.isSubmittingReview.set(false);
      },
      error: () => {
        this.isSubmittingReview.set(false);
      }
    });
  }
}
