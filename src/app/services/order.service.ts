import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderListItem, ShippingInfo } from '../models';

export interface CreateOrderRequest {
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  customerNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getOrders(): Observable<OrderListItem[]> {
    return this.http.get<OrderListItem[]>(`${this.apiUrl}/orders`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, request);
  }

  cancelOrder(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/orders/${id}/cancel`, {});
  }
}
