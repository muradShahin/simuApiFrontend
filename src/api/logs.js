import client from './client';

export const getAllLogs        = (page = 0, size = 50) =>
  client.get(`/api/logs?page=${page}&size=${size}`);

export const getLogsByEndpoint = (endpointId) =>
  client.get(`/api/logs/endpoint/${endpointId}`);
