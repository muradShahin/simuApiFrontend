import client from './client';

export const parseWsdlFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post('/api/wsdl/parse/file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const parseWsdlText = (text) =>
  client.post('/api/wsdl/parse/text', text, {
    headers: { 'Content-Type': 'text/plain' },
  });

export const confirmWsdlImport = (data) =>
  client.post('/api/wsdl/confirm', data);
