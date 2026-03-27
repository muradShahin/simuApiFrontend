import client from './client';

export const loginUser    = (data) => client.post('/auth/login', data);
export const registerUser = (data) => client.post('/auth/register', data);
export const getProfile   = ()     => client.get('/auth/me');
