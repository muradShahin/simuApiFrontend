import client from './client';

export const createCheckoutSession = () =>
  client.post('/api/billing/create-checkout-session');

export const verifyCheckoutSession = (sessionId) =>
  client.post('/api/billing/verify-session', { sessionId });
