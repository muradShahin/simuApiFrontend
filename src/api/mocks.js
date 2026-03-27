import client from './client';

export const getAllMocks  = ()           => client.get('/api/mocks');
export const getMockById = (id)          => client.get(`/api/mocks/${id}`);
export const createMock  = (data)        => client.post('/api/mocks', data);
export const updateMock  = (id, data)    => client.put(`/api/mocks/${id}`, data);
export const deleteMock  = (id)          => client.delete(`/api/mocks/${id}`);
