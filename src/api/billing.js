import client from './client';

export const createCheckoutSession = () =>
  client.post('/api/paddle/checkout');

let paddleInitialized = false;

function ensurePaddleInitialized() {
  if (paddleInitialized || !window.Paddle) return;
  window.Paddle.Initialize({ seller: 310725 });
  paddleInitialized = true;
}

export async function openPaddleCheckout() {
  ensurePaddleInitialized();
  const res = await createCheckoutSession();
  const transactionId = res.data.transactionId;
  return new Promise((resolve, reject) => {
    window.Paddle.Checkout.open({
      transactionId,
      settings: {
        successUrl: 'https://simuapi-frontend.onrender.com/dashboard?upgrade=success',
      },
      checkout: {
        completed: () => resolve(),
        closed: () => reject(new Error('Checkout closed')),
        error: (err) => reject(err),
      },
    });
  });
}
