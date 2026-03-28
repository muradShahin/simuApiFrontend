import { useState } from 'react';

export default function ApiDocsTab({ spec }) {
  const [copied, setCopied] = useState(false);

  if (!spec) {
    return (
      <div className="empty-state">
        <strong>No API specification available</strong>
      </div>
    );
  }

  const specJson = JSON.stringify(spec, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(specJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([specJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi-spec.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render basic info from the spec
  const info = spec.info || {};
  const paths = spec.paths || {};
  const pathEntries = Object.entries(paths);

  return (
    <div className="api-docs-tab">
      {/* Info header */}
      <div className="card api-docs-info">
        <div className="api-docs-info-header">
          <div>
            <h3>{info.title || 'API Documentation'}</h3>
            {info.description && <p className="text-muted">{info.description}</p>}
          </div>
          <div className="api-docs-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy JSON'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleDownload}>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      {pathEntries.map(([path, methods]) => (
        <div key={path} className="card api-docs-endpoint">
          {Object.entries(methods).map(([method, details]) => (
            <div key={method}>
              <div className="api-docs-endpoint-header">
                <span className={`badge badge-${method.toLowerCase()}`}>{method.toUpperCase()}</span>
                <code>{path}</code>
              </div>
              {details.summary && <p className="api-docs-summary">{details.summary}</p>}

              {/* Parameters */}
              {details.parameters && details.parameters.length > 0 && (
                <div className="api-docs-section">
                  <h4>Parameters</h4>
                  <table className="api-docs-params-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>In</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.parameters.map((p, i) => (
                        <tr key={i}>
                          <td><code>{p.name}</code></td>
                          <td>{p.in}</td>
                          <td>{p.schema?.type || '—'}</td>
                          <td className="text-muted">{p.description || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Request Body */}
              {details.requestBody && (
                <div className="api-docs-section">
                  <h4>Request Body</h4>
                  {(() => {
                    const content = details.requestBody.content?.['application/json'];
                    if (content?.schema?.example) {
                      return <pre className="code-block code-block-sm">{JSON.stringify(content.schema.example, null, 2)}</pre>;
                    }
                    return <p className="text-muted">JSON body expected</p>;
                  })()}
                </div>
              )}

              {/* Responses */}
              {details.responses && (
                <div className="api-docs-section">
                  <h4>Responses</h4>
                  {Object.entries(details.responses).map(([code, resp]) => (
                    <div key={code} className="api-docs-response">
                      <div className="api-docs-response-header">
                        <span className={`badge badge-${code.charAt(0)}xx`}>{code}</span>
                        <span className="text-muted">{resp.description || ''}</span>
                      </div>
                      {(() => {
                        const content = resp.content?.['application/json'];
                        if (content?.schema?.example) {
                          return <pre className="code-block code-block-sm">{JSON.stringify(content.schema.example, null, 2)}</pre>;
                        }
                        return null;
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Raw spec */}
      <div className="card api-docs-raw">
        <h4>Raw OpenAPI Specification</h4>
        <pre className="code-block">{specJson}</pre>
      </div>
    </div>
  );
}
