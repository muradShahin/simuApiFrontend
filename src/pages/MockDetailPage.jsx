import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMockById } from '../api/mocks';
import { getScenarios } from '../api/scenarios';
import { getOpenApiSpec, getCodeSnippets } from '../api/docs';
import { getAuthConfig } from '../api/authConfig';
import { getLogsByEndpoint } from '../api/logs';
import { useAuth } from '../context/AuthContext';
import ExportDropdown from '../components/ExportDropdown';
import ShareMockModal from '../components/ShareMockModal';
import { exportMockPostman, exportMockOpenApi } from '../api/export';
import OverviewTab from '../components/mockdetail/OverviewTab';
import ScenariosTab from '../components/mockdetail/ScenariosTab';
import ApiDocsTab from '../components/mockdetail/ApiDocsTab';
import CodeSnippetsTab from '../components/mockdetail/CodeSnippetsTab';
import TryItTab from '../components/mockdetail/TryItTab';
import MockLogsTab from '../components/mockdetail/MockLogsTab';

const TABS = [
  { key: 'overview',  label: 'Overview' },
  { key: 'scenarios', label: 'Scenarios' },
  { key: 'api-docs',  label: 'API Docs' },
  { key: 'snippets',  label: 'Code Snippets' },
  { key: 'try-it',    label: 'Try It' },
  { key: 'logs',      label: 'Logs' },
];

export default function MockDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isPro } = useAuth();

  const [mock, setMock]           = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [openApiSpec, setOpenApiSpec] = useState(null);
  const [snippets, setSnippets]   = useState(null);
  const [authConfig, setAuthConfig] = useState(null);
  const [logs, setLogs]           = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const res = await getLogsByEndpoint(id);
      setLogs(res.data);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [mockRes, scenariosRes, specRes, snippetsRes, authRes, logsRes] = await Promise.all([
          getMockById(id),
          getScenarios(id).catch(() => ({ data: [] })),
          getOpenApiSpec(id).catch(() => ({ data: null })),
          getCodeSnippets(id).catch(() => ({ data: null })),
          getAuthConfig(id).catch(() => ({ data: null })),
          getLogsByEndpoint(id).catch(() => ({ data: [] })),
        ]);
        setMock(mockRes.data);
        setScenarios(scenariosRes.data);
        setOpenApiSpec(specRes.data);
        setSnippets(snippetsRes.data);
        setAuthConfig(authRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load mock details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!mock) return <div className="page"><div className="alert alert-error">Mock not found</div></div>;

  return (
    <div className="page mock-detail-page">
      <div className="mock-detail-header">
        <div className="mock-detail-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <div className="mock-detail-title-row">
            <span className={`badge badge-${(mock.method ?? 'get').toLowerCase()}`}>{mock.method}</span>
            <h1 className="mock-detail-name">{mock.name}</h1>
          </div>
          <code className="mock-detail-path">{mock.path}</code>
        </div>
        <div className="mock-detail-header-right">
          {isAuthenticated && (
            <ExportDropdown
              onExportPostman={() => exportMockPostman(id)}
              onExportOpenApi={() => exportMockOpenApi(id)}
            />
          )}
          {isAuthenticated && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowShareModal(true)}>
              🔗 Share
            </button>
          )}
          {isAuthenticated && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/mocks/${id}/edit`)}>
              Edit Mock
            </button>
          )}
        </div>
      </div>

      <div className="mock-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`mock-tab ${activeTab === tab.key ? 'mock-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mock-tab-content">
        {activeTab === 'overview'  && <OverviewTab mock={mock} scenarios={scenarios} authConfig={authConfig} slug={user?.slug} isPro={isPro} />}
        {activeTab === 'scenarios' && <ScenariosTab mock={mock} scenarios={scenarios} />}
        {activeTab === 'api-docs'  && <ApiDocsTab spec={openApiSpec} />}
        {activeTab === 'snippets'  && <CodeSnippetsTab snippets={snippets} />}
        {activeTab === 'try-it'    && <TryItTab mock={mock} slug={user?.slug} />}
        {activeTab === 'logs'      && <MockLogsTab logs={logs} onRefresh={loadLogs} />}
      </div>

      {showShareModal && (
        <ShareMockModal
          mock={mock}
          onClose={() => setShowShareModal(false)}
          onUpdated={() => {
            getMockById(id).then(res => setMock(res.data));
          }}
        />
      )}
    </div>
  );
}
