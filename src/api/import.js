import client from './client';

/**
 * Parse an uploaded file (Postman/OpenAPI).
 * @param {File} file
 */
export const parseImportFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post('/api/import/parse/file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Parse raw JSON/YAML text (Postman/OpenAPI).
 * @param {string} text
 */
export const parseImportText = (text) =>
  client.post('/api/import/parse/text', text, {
    headers: { 'Content-Type': 'text/plain' },
  });

/**
 * Confirm import — create mock endpoints for selected endpoints.
 * @param {{ endpoints: Array, collectionId?: string }} data
 */
export const confirmImport = (data) =>
  client.post('/api/import/confirm', data);
