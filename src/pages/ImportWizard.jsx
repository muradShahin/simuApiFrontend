import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseImportFile, parseImportText, confirmImport } from '../api/import';
import { getCollections, createCollection } from '../api/collections';
import { useAuth } from '../context/AuthContext';
import MethodBadge from '../components/MethodBadge';
import StatusBadge from '../components/StatusBadge';

const STEPS = ['Upload', 'Preview', 'Edit & Assign', 'Confirm'];

export default function ImportWizard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  // Wizard step (0-indexed)
  const [step, setStep] = useState(0);

  // Step 1 state — Upload
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'paste'
  const [file, setFile] = useState(null);
  const [pasteContent, setPasteContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Step 2 state — Preview
  const [parseResult, setParseResult] = useState(null);
  const [selected, setSelected] = useState(new Set());

  // Step 3 state — Edit
  const [editedEndpoints, setEditedEndpoints] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionId, setCollectionId] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Step 4 state — Confirm
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);

  // ---- Step 1: Parse ----
  async function handleParse() {
    setParsing(true);
    setParseError(null);
    try {
      let res;
      if (inputMode === 'file') {
        if (!file) { setParseError('Please select a file'); setParsing(false); return; }
        res = await parseImportFile(file);
      } else {
        if (!pasteContent.trim()) { setParseError('Please paste API content'); setParsing(false); return; }
        res = await parseImportText(pasteContent);
      }
      const data = res.data;
      if (!data.endpoints || data.endpoints.length === 0) {
        setParseError('No endpoints found in the imported file');
        setParsing(false);
        return;
      }
      setParseResult(data);
      // Select all by default
      setSelected(new Set(data.endpoints.map((_, i) => i)));
      setStep(1);
    } catch (err) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  }

  // ---- Step 2 → Step 3 transition ----
  async function goToEdit() {
    if (selected.size === 0) return;

    const selectedEndpoints = parseResult.endpoints
      .filter((_, i) => selected.has(i))
      .map(ep => ({ ...ep }));
    setEditedEndpoints(selectedEndpoints);
    setEditingIndex(null);

    // Fetch collections if authenticated
    if (isAuthenticated) {
      try {
        const res = await getCollections();
        setCollections(res.data || []);
      } catch { /* ignore */ }
    }
    setStep(2);
  }

  // ---- Step 3: Create new collection inline ----
  async function handleCreateCollection() {
    const name = newCollectionName.trim();
    if (!name) return;
    setCreatingCollection(true);
    try {
      const res = await createCollection({ name });
      const created = res.data;
      setCollections(prev => [...prev, created]);
      setCollectionId(created.id);
      setNewCollectionName('');
    } catch (err) {
      setImportError('Failed to create collection: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreatingCollection(false);
    }
  }

  // ---- Step 3: Inline edit ----
  function updateEndpoint(index, field, value) {
    setEditedEndpoints(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  // ---- Step 4: Confirm import ----
  async function handleConfirmImport() {
    setImporting(true);
    setImportError(null);
    try {
      const res = await confirmImport({
        endpoints: editedEndpoints,
        collectionId: collectionId || null,
      });
      setImportResult(res.data);
      setStep(3);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setParseError(null);
  }

  function handleFileDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  function toggleSelect(index) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleAll() {
    if (!parseResult) return;
    if (selected.size === parseResult.endpoints.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(parseResult.endpoints.map((_, i) => i)));
    }
  }

  // ---- Render ----
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Import API Definition</h1>
      </div>

      {/* Wizard Steps Indicator */}
      <div className="wizard-steps">
        {STEPS.map((label, i) => (
          <div
            key={i}
            className={`wizard-step ${i === step ? 'wizard-step-active' : ''} ${i < step ? 'wizard-step-done' : ''}`}
          >
            <span className="wizard-step-number">{i < step ? '✓' : i + 1}</span>
            <span className="wizard-step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ---- STEP 0: Upload ---- */}
      {step === 0 && (
        <div className="import-step">
          <h2 className="import-step-title">Upload or Paste API Definition</h2>
          <p className="import-step-desc">
            Supports <strong>Postman Collection v2.1</strong> and <strong>OpenAPI 3.0</strong> (JSON or YAML).
          </p>

          <div className="import-mode-toggle">
            <button
              className={`btn btn-sm ${inputMode === 'file' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setInputMode('file')}
            >
              Upload File
            </button>
            <button
              className={`btn btn-sm ${inputMode === 'paste' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setInputMode('paste')}
            >
              Paste JSON/YAML
            </button>
          </div>

          {inputMode === 'file' ? (
            <div
              className="import-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {file ? (
                <div className="import-dropzone-file">
                  <span className="import-dropzone-icon">📄</span>
                  <strong>{file.name}</strong>
                  <span className="text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="import-dropzone-empty">
                  <span className="import-dropzone-icon">📁</span>
                  <p>Drag &amp; drop a file here, or <strong>click to browse</strong></p>
                  <span className="text-muted">.json, .yaml, .yml</span>
                </div>
              )}
            </div>
          ) : (
            <textarea
              className="import-paste-area"
              placeholder={'Paste your Postman Collection or OpenAPI spec here...\n\n{\n  "openapi": "3.0.0",\n  ...\n}'}
              rows={14}
              value={pasteContent}
              onChange={(e) => { setPasteContent(e.target.value); setParseError(null); }}
            />
          )}

          {parseError && <div className="alert alert-error">{parseError}</div>}

          <div className="import-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleParse} disabled={parsing}>
              {parsing ? 'Parsing…' : 'Parse & Preview'}
            </button>
          </div>
        </div>
      )}

      {/* ---- STEP 1: Preview ---- */}
      {step === 1 && parseResult && (
        <div className="import-step">
          <h2 className="import-step-title">Preview Endpoints</h2>
          <p className="import-step-desc">
            Found <strong>{parseResult.totalEndpoints}</strong> endpoints
            from <strong>{parseResult.title}</strong> ({parseResult.sourceType}).
            Select the ones you want to import.
          </p>

          {parseResult.warnings && parseResult.warnings.length > 0 && (
            <div className="alert alert-warning">
              <strong>{parseResult.warnings.length} warning(s):</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {parseResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <div className="import-select-bar">
            <label className="import-select-all">
              <input
                type="checkbox"
                checked={selected.size === parseResult.endpoints.length}
                onChange={toggleAll}
              />
              <span>Select All ({selected.size}/{parseResult.endpoints.length})</span>
            </label>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {parseResult.endpoints.map((ep, i) => (
                  <tr key={i} className={selected.has(i) ? 'import-row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggleSelect(i)}
                      />
                    </td>
                    <td><MethodBadge method={ep.method} /></td>
                    <td><code>{ep.path}</code></td>
                    <td>{ep.name}</td>
                    <td><StatusBadge code={ep.statusCode} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="import-actions">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary" onClick={goToEdit} disabled={selected.size === 0}>
              Continue with {selected.size} endpoint{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* ---- STEP 2: Edit & Assign ---- */}
      {step === 2 && (
        <div className="import-step">
          <h2 className="import-step-title">Edit & Assign Collection</h2>
          <p className="import-step-desc">
            Review and edit endpoints before importing. Click an endpoint to expand and edit.
          </p>

          {isAuthenticated && (
            <div className="import-collection-assign">
              <label>Assign to Collection:</label>
              <div className="import-collection-picker">
                <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                  <option value="">— None —</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <span className="import-collection-or">or</span>
                <div className="import-collection-create">
                  <input
                    type="text"
                    placeholder="New collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateCollection}
                    disabled={creatingCollection || !newCollectionName.trim()}
                  >
                    {creatingCollection ? '…' : '+ Create'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="import-edit-list">
            {editedEndpoints.map((ep, i) => (
              <div className="import-edit-card card" key={i}>
                <div
                  className="import-edit-card-header"
                  onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                >
                  <div className="import-edit-card-summary">
                    <MethodBadge method={ep.method} />
                    <code>{ep.path}</code>
                    <span className="text-muted">— {ep.name}</span>
                  </div>
                  <div className="import-edit-card-meta">
                    <StatusBadge code={ep.statusCode} />
                    <span className="import-edit-toggle">{editingIndex === i ? '▼' : '▶'}</span>
                  </div>
                </div>

                {editingIndex === i && (
                  <div className="import-edit-card-body">
                    <div className="import-edit-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Name</label>
                        <input
                          value={ep.name}
                          onChange={(e) => updateEndpoint(i, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ width: 100 }}>
                        <label>Status</label>
                        <input
                          type="number"
                          min={100}
                          max={599}
                          value={ep.statusCode}
                          onChange={(e) => updateEndpoint(i, 'statusCode', parseInt(e.target.value, 10) || 200)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Path</label>
                      <input
                        value={ep.path}
                        onChange={(e) => updateEndpoint(i, 'path', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Response Headers (JSON)</label>
                      <textarea
                        rows={3}
                        value={ep.responseHeaders || ''}
                        onChange={(e) => updateEndpoint(i, 'responseHeaders', e.target.value)}
                        placeholder='{"Content-Type": "application/json"}'
                      />
                    </div>
                    <div className="form-group">
                      <label>Response Body</label>
                      <textarea
                        rows={8}
                        value={ep.responseBody || ''}
                        onChange={(e) => updateEndpoint(i, 'responseBody', e.target.value)}
                        placeholder='{"message": "OK"}'
                        className="import-body-editor"
                      />
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setEditedEndpoints(prev => prev.filter((_, idx) => idx !== i));
                        setEditingIndex(null);
                      }}
                    >
                      Remove Endpoint
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {importError && <div className="alert alert-error">{importError}</div>}

          <div className="import-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmImport}
              disabled={importing || editedEndpoints.length === 0}
            >
              {importing ? 'Importing…' : `Import ${editedEndpoints.length} Mock${editedEndpoints.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* ---- STEP 3: Confirm / Result ---- */}
      {step === 3 && importResult && (
        <div className="import-step">
          <h2 className="import-step-title">Import Complete</h2>

          <div className="import-result-summary">
            <div className="stat-card">
              <span className="stat-card-label">Created</span>
              <span className="stat-card-value">{importResult.created}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Skipped</span>
              <span className="stat-card-value">{importResult.skipped}</span>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="alert alert-warning" style={{ marginTop: 12 }}>
              <strong>Issues:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {importResult.mocks && importResult.mocks.length > 0 && (
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.mocks.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td><MethodBadge method={m.method} /></td>
                      <td><code>{m.path}</code></td>
                      <td><StatusBadge code={m.statusCode} /></td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/mocks/${m.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="import-actions">
            <button className="btn btn-ghost" onClick={() => {
              setStep(0);
              setFile(null);
              setPasteContent('');
              setParseResult(null);
              setSelected(new Set());
              setEditedEndpoints([]);
              setImportResult(null);
              setImportError(null);
            }}>
              Import More
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
