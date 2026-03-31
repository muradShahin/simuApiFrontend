import client from './client';

export const exportMockPostman = (mockId) =>
  client.get(`/api/export/mock/${mockId}/postman`);

export const exportMockOpenApi = (mockId) =>
  client.get(`/api/export/mock/${mockId}/openapi`);

export const exportCollectionPostman = (collectionId) =>
  client.get(`/api/export/collection/${collectionId}/postman`);

export const exportCollectionOpenApi = (collectionId) =>
  client.get(`/api/export/collection/${collectionId}/openapi`);
