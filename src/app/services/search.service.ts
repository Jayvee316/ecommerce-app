import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchResult, SearchFilters } from '../models';

export interface SearchResponse {
  results: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SearchFilters;
}

export interface TrendingProduct {
  id: number;
  name: string;
  imageUrl: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly nodeApiUrl = environment.nodeApiUrl;
  private readonly http = inject(HttpClient);

  search(filters: SearchFilters & { page?: number; limit?: number }): Observable<SearchResponse> {
    let params = new HttpParams();

    if (filters.query) params = params.set('query', filters.query);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params = params.set('minRating', filters.minRating.toString());
    if (filters.inStock !== undefined) params = params.set('inStock', filters.inStock.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<SearchResponse>(`${this.nodeApiUrl}/search`, { params });
  }

  getSuggestions(query: string): Observable<{ suggestions: string[] }> {
    return this.http.get<{ suggestions: string[] }>(
      `${this.nodeApiUrl}/search/suggestions`,
      { params: { query } }
    );
  }

  getTrending(): Observable<{ trending: TrendingProduct[] }> {
    return this.http.get<{ trending: TrendingProduct[] }>(`${this.nodeApiUrl}/search/trending`);
  }
}
