import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';
import { Order } from '../models';

export interface OrderEmailData {
  to_email: string;  // Required by EmailJS for recipient
  customer_name: string;
  customer_email: string;
  order_number: string;
  order_date: string;
  order_items: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  payment_method: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly serviceId = environment.emailjs.serviceId;
  private readonly orderTemplateId = environment.emailjs.orderTemplateId;
  private readonly publicKey = environment.emailjs.publicKey;

  constructor() {
    emailjs.init(this.publicKey);
  }

  async sendOrderConfirmation(order: Order, customerEmail: string): Promise<void> {
    if (!customerEmail) {
      console.warn('Cannot send order confirmation: no customer email provided');
      return;
    }

    console.log('Sending order confirmation to:', customerEmail);
    const emailData = this.formatOrderEmailData(order, customerEmail);

    try {
      await emailjs.send(
        this.serviceId,
        this.orderTemplateId,
        emailData as unknown as Record<string, unknown>
      );
      console.log('Order confirmation email sent successfully to:', customerEmail);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't throw - email failure shouldn't break the checkout flow
    }
  }

  private formatOrderEmailData(order: Order, customerEmail: string): OrderEmailData {
    // Format order items as readable text
    const orderItems = order.items
      .map(item => `${item.productName} (x${item.quantity}) - ${this.formatCurrency(item.totalPrice)}`)
      .join('<br>');

    // Format date
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Format payment method
    const paymentMethod = this.formatPaymentMethod(order.paymentMethod);

    return {
      to_email: customerEmail,  // EmailJS uses this to send the email
      customer_name: order.shippingInfo.name,
      customer_email: customerEmail,
      order_number: order.orderNumber,
      order_date: orderDate,
      order_items: orderItems,
      subtotal: this.formatCurrency(order.subTotal),
      tax: this.formatCurrency(order.tax),
      shipping: this.formatCurrency(order.shippingCost),
      total: this.formatCurrency(order.totalAmount),
      shipping_name: order.shippingInfo.name,
      shipping_address: order.shippingInfo.address,
      shipping_city: order.shippingInfo.city,
      shipping_state: order.shippingInfo.state,
      shipping_zip: order.shippingInfo.zipCode,
      shipping_country: order.shippingInfo.country,
      payment_method: paymentMethod
    };
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private formatPaymentMethod(method?: string): string {
    if (!method) return 'N/A';
    switch (method.toLowerCase()) {
      case 'stripe':
        return 'Credit/Debit Card';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  }
}
