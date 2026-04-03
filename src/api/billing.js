import client from './client';

export const createCheckoutSession = () =>
  client.post('/api/paddle/checkout');
