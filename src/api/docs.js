import client from './client';

export const getOpenApiSpec  = (mockId) => client.get(`/api/mocks/${mockId}/docs/openapi`);
export const getCodeSnippets = (mockId) => client.get(`/api/mocks/${mockId}/docs/snippets`);
