import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review, ReviewStats } from '../models';

export interface CreateReviewRequest {
  rating: number;
  title: string;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly nodeApiUrl = environment.nodeApiUrl;
  private readonly http = inject(HttpClient);

  getProductReviews(productId: number): Observable<{ reviews: Review[]; stats: ReviewStats }> {
    return this.http.get<{ reviews: Review[]; stats: ReviewStats }>(
      `${this.nodeApiUrl}/reviews/product/${productId}`
    );
  }

  createReview(productId: number, review: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.nodeApiUrl}/reviews/product/${productId}`, review);
  }

  updateReview(reviewId: number, review: CreateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.nodeApiUrl}/reviews/${reviewId}`, review);
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.nodeApiUrl}/reviews/${reviewId}`);
  }

  getUserReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.nodeApiUrl}/reviews/user`);
  }
}
