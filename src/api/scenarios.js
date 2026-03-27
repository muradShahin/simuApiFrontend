import client from './client';

export const getScenarios    = (mockId)              => client.get(`/api/mocks/${mockId}/scenarios`);
export const createScenario  = (mockId, data)        => client.post(`/api/mocks/${mockId}/scenarios`, data);
export const updateScenario  = (mockId, id, data)    => client.put(`/api/mocks/${mockId}/scenarios/${id}`, data);
export const deleteScenario  = (mockId, id)          => client.delete(`/api/mocks/${mockId}/scenarios/${id}`);
