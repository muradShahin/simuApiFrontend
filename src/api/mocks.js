import client from './client';

export const getAllMocks  = ()           => client.get('/api/mocks');
export const getMockById = (id)          => client.get(`/api/mocks/${id}`);
export const createMock  = (data)        => client.post('/api/mocks', data);
export const updateMock  = (id, data)    => client.put(`/api/mocks/${id}`, data);
export const deleteMock  = (id)          => client.delete(`/api/mocks/${id}`);

export const shareMock   = (id)          => client.post(`/api/mocks/${id}/share`);
export const unshareMock = (id)          => client.post(`/api/mocks/${id}/unshare`);
export const getPublicMock = (publicId)  => client.get(`/api/public/mock/${publicId}`);
export const getPublicOpenApiSpec  = (publicId) => client.get(`/api/public/mock/${publicId}/docs/openapi`);
export const getPublicCodeSnippets = (publicId) => client.get(`/api/public/mock/${publicId}/docs/snippets`);
export const exportPublicPostman   = (publicId) => client.get(`/api/public/mock/${publicId}/export/postman`);
export const exportPublicOpenApi   = (publicId) => client.get(`/api/public/mock/${publicId}/export/openapi`);
