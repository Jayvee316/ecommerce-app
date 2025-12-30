import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductListItem, Category } from '../models';

export interface ProductFilters {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  // Products
  getProducts(filters?: ProductFilters): Observable<PaginatedResponse<ProductListItem>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.featured !== undefined) params = params.set('featured', filters.featured.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http.get<PaginatedResponse<ProductListItem>>(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getFeaturedProducts(): Observable<ProductListItem[]> {
    return this.http.get<ProductListItem[]>(`${this.apiUrl}/products/featured`);
  }

  getProductsByCategory(categoryId: number): Observable<ProductListItem[]> {
    return this.http.get<ProductListItem[]>(`${this.apiUrl}/products/category/${categoryId}`);
  }
}
