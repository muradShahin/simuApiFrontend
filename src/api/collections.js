import client from './client';

export const getCollections      = ()           => client.get('/api/collections');
export const getCollectionById   = (id)         => client.get(`/api/collections/${id}`);
export const createCollection    = (data)       => client.post('/api/collections', data);
export const updateCollection    = (id, data)   => client.put(`/api/collections/${id}`, data);
export const deleteCollection    = (id)         => client.delete(`/api/collections/${id}`);
export const moveMock            = (mockId, collectionId) =>
    client.patch(`/api/mocks/${mockId}/move?collectionId=${collectionId}`);
