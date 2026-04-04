import client from './client';

export const loginUser             = (data) => client.post('/auth/login', data);
export const registerUser          = (data) => client.post('/auth/register', data);
export const getProfile            = ()     => client.get('/auth/me');
export const verifyEmail           = (token) => client.get(`/auth/verify?token=${encodeURIComponent(token)}`);
export const resendVerification    = ()     => client.post('/auth/resend-verification');
