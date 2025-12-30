import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly nodeApiUrl = environment.nodeApiUrl;
  private readonly http = inject(HttpClient);

  private notificationsSignal = signal<Notification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() =>
    this.notificationsSignal().filter(n => !n.isRead).length
  );
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  loadNotifications(): Observable<Notification[]> {
    return this.http.get<{ notifications: Notification[] }>(`${this.nodeApiUrl}/notifications`).pipe(
      map(response => response.notifications),
      tap(notifications => this.notificationsSignal.set(notifications))
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.nodeApiUrl}/notifications/${notificationId}/read`, {}).pipe(
      tap(() => {
        this.notificationsSignal.update(notifications =>
          notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.nodeApiUrl}/notifications/read-all`, {}).pipe(
      tap(() => {
        this.notificationsSignal.update(notifications =>
          notifications.map(n => ({ ...n, isRead: true }))
        );
      })
    );
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.nodeApiUrl}/notifications/${notificationId}`).pipe(
      tap(() => {
        this.notificationsSignal.update(notifications =>
          notifications.filter(n => n.id !== notificationId)
        );
      })
    );
  }

  addNotification(notification: Notification): void {
    this.notificationsSignal.update(notifications => [notification, ...notifications]);
  }

  clearAll(): void {
    this.notificationsSignal.set([]);
  }
}
