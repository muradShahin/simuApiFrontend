import client from './client';

export const shareCollection       = (data)               => client.post('/api/collections/shares', data);
export const getSharesForCollection = (collectionId)      => client.get(`/api/collections/shares/collection/${collectionId}`);
export const getSharedWithMe       = ()                    => client.get('/api/collections/shares/shared-with-me');
export const removeShare           = (shareId)             => client.delete(`/api/collections/shares/${shareId}`);
