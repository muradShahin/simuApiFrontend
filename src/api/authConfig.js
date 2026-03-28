import client from './client';

export const getAuthConfig  = (mockId)       => client.get(`/api/mocks/${mockId}/auth`);
export const saveAuthConfig = (mockId, data) => client.put(`/api/mocks/${mockId}/auth`, data);
