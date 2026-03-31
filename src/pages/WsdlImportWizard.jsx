import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseWsdlFile, parseWsdlText, confirmWsdlImport } from '../api/wsdl';
import { getCollections, createCollection } from '../api/collections';
import { useAuth } from '../context/AuthContext';
import XmlEditor from '../components/XmlEditor';

const STEPS = ['Upload WSDL', 'Select Operations', 'Edit & Assign', 'Confirm'];

export default function WsdlImportWizard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);

  // Step 1 — Upload
  const [inputMode, setInputMode] = useState('file');
  const [file, setFile] = useState(null);
  const [pasteContent, setPasteContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Step 2 — Preview operations
  const [parseResult, setParseResult] = useState(null);
  const [selected, setSelected] = useState(new Set());

  // Step 3 — Edit
  const [editedOps, setEditedOps] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionId, setCollectionId] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Step 4 — Confirm
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);

  // ── Step 1: Parse WSDL ──
  async function handleParse() {
    setParsing(true);
    setParseError(null);
    try {
      let res;
      if (inputMode === 'file') {
        if (!file) { setParseError('Please select a WSDL file'); setParsing(false); return; }
        res = await parseWsdlFile(file);
      } else {
        if (!pasteContent.trim()) { setParseError('Please paste WSDL content'); setParsing(false); return; }
        res = await parseWsdlText(pasteContent);
      }
      const data = res.data;
      setParseResult(data);
      setSelected(new Set(data.operations.map((_, i) => i)));
      setStep(1);
    } catch (err) {
      setParseError(err.message || 'Failed to parse WSDL');
    } finally {
      setParsing(false);
    }
  }

  // ── Step 2 → 3: Move to edit ──
  function handleMoveToEdit() {
    const ops = parseResult.operations.filter((_, i) => selected.has(i));
    setEditedOps(ops.map((op) => ({ ...op })));
    if (isAuthenticated) {
      getCollections().then((r) => setCollections(r.data)).catch(() => {});
    }
    setStep(2);
  }

  function toggleSelect(i) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === parseResult.operations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(parseResult.operations.map((_, i) => i)));
    }
  }

  // ── Step 3: inline edit helpers ──
  function updateOp(index, field, val) {
    setEditedOps((prev) => prev.map((op, i) => i === index ? { ...op, [field]: val } : op));
  }

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);
    try {
      const res = await createCollection({ name: newCollectionName.trim() });
      setCollections((prev) => [...prev, res.data]);
      setCollectionId(res.data.id);
      setNewCollectionName('');
    } catch (err) {
      setParseError(err.message);
    } finally {
      setCreatingCollection(false);
    }
  }

  // ── Step 4: Confirm import ──
  async function handleConfirm() {
    setImporting(true);
    setImportError(null);
    try {
      const res = await confirmWsdlImport({
        operations: editedOps,
        collectionId: collectionId || null,
      });
      setImportResult(res.data);
      setStep(3);
    } catch (err) {
      setImportError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  // ── Render ──
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Import WSDL (SOAP)</h1>
        <span className="text-muted" style={{ fontSize: 12 }}>Generate mock endpoints from WSDL definitions</span>
      </div>

      {/* Stepper */}
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

      {/* ── Step 1: Upload ── */}
      {step === 0 && (
        <div className="card">
          <div className="import-mode-toggle">
            <button
              className={`btn btn-sm ${inputMode === 'file' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setInputMode('file')}
            >📄 Upload File</button>
            <button
              className={`btn btn-sm ${inputMode === 'paste' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setInputMode('paste')}
            >📋 Paste XML</button>
          </div>

          {inputMode === 'file' ? (
            <div
              className="import-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".wsdl,.xml,.txt"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              {file ? (
                <div className="import-dropzone-file">
                  <span className="import-dropzone-icon">📄</span>
                  <span>{file.name}</span>
                  <span className="text-muted" style={{ fontSize: 11 }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="import-dropzone-empty">
                  <span className="import-dropzone-icon">📂</span>
                  <p>Click to choose a <strong>.wsdl</strong> or <strong>.xml</strong> file</p>
                  <span className="text-muted" style={{ fontSize: 11 }}>Supports WSDL 1.1 with SOAP bindings</span>
                </div>
              )}
            </div>
          ) : (
            <textarea
              className="import-paste-area"
              rows={14}
              placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"\n  …\n</definitions>'}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
            />
          )}

          {parseError && <div className="alert alert-error" style={{ marginTop: 12 }}>{parseError}</div>}

          <div className="import-actions">
            <button className="btn btn-primary" onClick={handleParse} disabled={parsing}>
              {parsing ? 'Parsing…' : '🔍 Parse WSDL'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Select Operations ── */}
      {step === 1 && parseResult && (
        <div className="card">
          <div className="wsdl-service-header">
            <div className="wsdl-service-info">
              <div className="wsdl-service-name">
                <span className="wsdl-service-icon">🌐</span>
                {parseResult.serviceName}
              </div>
              {parseResult.targetNamespace && (
                <div className="wsdl-service-ns">
                  <span className="wsdl-ns-label">Namespace</span>
                  <code>{parseResult.targetNamespace}</code>
                </div>
              )}
            </div>
            <div className="wsdl-service-stat">
              <span className="wsdl-service-stat-num">{parseResult.totalOperations}</span>
              <span className="wsdl-service-stat-label">operation{parseResult.totalOperations !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {parseResult.warnings?.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: 12 }}>
              {parseResult.warnings.map((w, i) => <div key={i}>{w}</div>)}
            </div>
          )}

          <div className="import-select-all">
            <label>
              <input
                type="checkbox"
                checked={selected.size === parseResult.operations.length && parseResult.operations.length > 0}
                onChange={toggleAll}
              />
              Select all ({selected.size}/{parseResult.operations.length})
            </label>
          </div>

          <div className="wsdl-ops-list">
            {parseResult.operations.map((op, i) => (
              <div key={i} className={`wsdl-op-card ${selected.has(i) ? 'selected' : ''}`} onClick={() => toggleSelect(i)}>
                <label className="wsdl-op-check" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} />
                </label>
                <div className="wsdl-op-info">
                  <div className="wsdl-op-name">
                    <span className="wsdl-soap-badge">SOAP</span>
                    <span className="method-badge method-post">POST</span>
                    {op.operationName}
                  </div>
                  {op.soapAction && (
                    <div className="wsdl-op-detail">
                      <span className="wsdl-op-detail-label">SOAPAction</span>
                      <code>{op.soapAction}</code>
                    </div>
                  )}
                  <div className="wsdl-op-io">
                    <span className="wsdl-io-tag wsdl-io-in">IN</span> {op.inputElement}
                    <span className="wsdl-io-arrow">→</span>
                    <span className="wsdl-io-tag wsdl-io-out">OUT</span> {op.outputElement}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="import-actions">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary" onClick={handleMoveToEdit} disabled={selected.size === 0}>
              Next — Edit ({selected.size}) →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Edit & Assign ── */}
      {step === 2 && (
        <div className="card">
          <div className="wsdl-edit-header">
            <h3>Edit Operations & Assign Collection</h3>
            <span className="text-muted" style={{ fontSize: 12 }}>{editedOps.length} operation{editedOps.length !== 1 ? 's' : ''} selected</span>
          </div>

          {/* Collection picker */}
          {isAuthenticated && (
            <div className="import-collection-assign">
              <label>Assign to collection</label>
              <div className="import-collection-picker">
                <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                  <option value="">None</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="import-collection-or">or</div>
              <div className="import-collection-create">
                <input
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleCreateCollection}
                  disabled={creatingCollection || !newCollectionName.trim()}
                >
                  {creatingCollection ? '…' : '+ Create'}
                </button>
              </div>
            </div>
          )}

          <div className="wsdl-edit-list">
            {editedOps.map((op, i) => (
              <div key={i} className={`wsdl-edit-card ${editingIndex === i ? 'expanded' : ''}`}>
                <div className="wsdl-edit-card-header" onClick={() => setEditingIndex(editingIndex === i ? null : i)}>
                  <div className="wsdl-edit-card-title">
                    <span className="wsdl-soap-badge">SOAP</span>
                    <input
                      value={op.operationName}
                      onChange={(e) => { e.stopPropagation(); updateOp(i, 'operationName', e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className="wsdl-edit-name-input"
                    />
                  </div>
                  <div className="wsdl-edit-card-meta">
                    <code className="wsdl-edit-path">/mock/wsdl/{op.operationName}</code>
                    <span className="wsdl-edit-toggle">{editingIndex === i ? '▾' : '▸'}</span>
                  </div>
                </div>
                {editingIndex === i && (
                  <div className="wsdl-edit-card-body">
                    <div className="wsdl-xml-section">
                      <h4>📥 Sample Request</h4>
                      <XmlEditor
                        value={op.sampleRequest}
                        onChange={(val) => updateOp(i, 'sampleRequest', val)}
                        rows={8}
                        placeholder="<Request>…</Request>"
                      />
                    </div>
                    <div className="wsdl-xml-section">
                      <h4>📤 Sample Response (returned by mock)</h4>
                      <XmlEditor
                        value={op.sampleResponse}
                        onChange={(val) => updateOp(i, 'sampleResponse', val)}
                        rows={8}
                        placeholder="<Response>…</Response>"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {parseError && <div className="alert alert-error" style={{ marginTop: 12 }}>{parseError}</div>}

          <div className="import-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={importing || editedOps.length === 0}>
              {importing ? 'Importing…' : `🚀 Import ${editedOps.length} Operation(s)`}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Result ── */}
      {step === 3 && (
        <div className="card">
          {importError && <div className="alert alert-error">{importError}</div>}

          {importResult && (
            <div className="import-result">
              <div className="import-result-summary">
                <div className="import-stat import-stat-ok">
                  <span className="import-stat-num">{importResult.created}</span>
                  <span className="import-stat-label">Created</span>
                </div>
                <div className="import-stat import-stat-skip">
                  <span className="import-stat-num">{importResult.skipped}</span>
                  <span className="import-stat-label">Skipped</span>
                </div>
              </div>

              {importResult.errors?.length > 0 && (
                <div className="import-result-errors">
                  <strong>Notes:</strong>
                  <ul>{importResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
              )}

              {importResult.mocks?.length > 0 && (
                <div className="wsdl-result-mocks">
                  <h4>Created SOAP Mocks</h4>
                  <div className="wsdl-result-list">
                    {importResult.mocks.map((m) => (
                      <div key={m.id} className="wsdl-result-item" onClick={() => navigate(`/mocks/${m.id}`)}>
                        <div className="wsdl-result-item-left">
                          <span className="wsdl-soap-badge">SOAP</span>
                          <span className="method-badge method-post">POST</span>
                          <strong>{m.name}</strong>
                        </div>
                        <code className="wsdl-result-item-path">/mock{m.path}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="import-actions">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
            <button className="btn btn-ghost" onClick={() => { setStep(0); setParseResult(null); setImportResult(null); setImportError(null); }}>
              Import Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
