export const environment = {
  production: false,
  // C# Backend API (products, cart, orders)
  apiUrl: 'http://localhost:5022/api',
  // Node.js Backend API (reviews, wishlist, search, notifications)
  nodeApiUrl: 'http://localhost:3000/api',
  // EmailJS configuration
  emailjs: {
    serviceId: 'service_65d3492',
    orderTemplateId: 'template_d7d8nsg',
    publicKey: 'u2CZBIFDcqA9MmbXt'
  }
};
