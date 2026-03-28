import StatusBadge from '../StatusBadge';
import JsonViewer from '../JsonViewer';

const CONDITION_TYPE_LABELS = {
  QUERY_PARAM: 'Query',
  BODY: 'Body',
  HEADER: 'Header',
};

const OPERATOR_LABELS = {
  EQUALS: '=',
  NOT_EQUALS: '≠',
  CONTAINS: 'contains',
  GREATER_THAN: '>',
  LESS_THAN: '<',
};

export default function ScenariosTab({ mock, scenarios }) {
  if (scenarios.length === 0) {
    return (
      <div className="empty-state">
        <strong>No scenarios configured</strong>
        <p>Scenarios let you return different responses based on request conditions.</p>
      </div>
    );
  }

  return (
    <div className="scenarios-tab">
      <p className="scenarios-intro">
        Scenarios are evaluated in <strong>priority order</strong> (highest first).
        The first scenario whose conditions all match will be used. If no scenario matches,
        the default response is returned.
      </p>

      <div className="scenario-list">
        {scenarios.map((s, idx) => (
          <div className="scenario-card card" key={s.id}>
            <div className="scenario-card-header">
              <div className="scenario-card-title">
                <span className="scenario-index">#{idx + 1}</span>
                <strong>{s.name}</strong>
                <span className="scenario-priority">Priority: {s.priority}</span>
              </div>
              <StatusBadge code={s.statusCode} />
            </div>

            {/* IF/THEN Block */}
            {s.conditions && s.conditions.length > 0 ? (
              <div className="scenario-rule">
                <div className="scenario-rule-if">
                  <span className="scenario-rule-keyword scenario-rule-keyword-if">IF</span>
                  <div className="scenario-rule-conditions">
                    {s.conditions.map((c, ci) => (
                      <div key={ci}>
                        {ci > 0 && <span className="scenario-rule-keyword scenario-rule-keyword-and" style={{ display: 'inline-block', marginBottom: 4 }}>AND</span>}
                        <div className="scenario-rule-condition">
                          <span className="scenario-rule-condition-type">{CONDITION_TYPE_LABELS[c.type] || c.type}</span>
                          <span className="scenario-rule-condition-field">{c.field}</span>
                          <span className="scenario-rule-condition-op">{OPERATOR_LABELS[c.operator] || c.operator}</span>
                          <span className="scenario-rule-condition-value">"{c.value}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="scenario-rule-then">
                  <span className="scenario-rule-keyword scenario-rule-keyword-then">THEN</span>
                  <span className="scenario-rule-arrow">→</span>
                  <StatusBadge code={s.statusCode} />
                  {s.delayMs > 0 && <span style={{ fontSize: 12, color: 'var(--text-2)' }}>+{s.delayMs}ms delay</span>}
                </div>
              </div>
            ) : (
              <div className="scenario-rule">
                <div className="scenario-rule-if">
                  <span className="scenario-rule-keyword scenario-rule-keyword-if">IF</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>Any request (no conditions)</span>
                </div>
                <div className="scenario-rule-then">
                  <span className="scenario-rule-keyword scenario-rule-keyword-then">THEN</span>
                  <span className="scenario-rule-arrow">→</span>
                  <StatusBadge code={s.statusCode} />
                </div>
              </div>
            )}

            {/* Response Headers */}
            {s.responseHeaders && (() => {
              try {
                const headers = typeof s.responseHeaders === 'string' ? JSON.parse(s.responseHeaders) : s.responseHeaders;
                if (Object.keys(headers).length > 0) {
                  return (
                    <div className="scenario-headers">
                      <span className="scenario-section-label">Response Headers:</span>
                      <div className="headers-list">
                        {Object.entries(headers).map(([key, value]) => (
                          <div className="header-row" key={key}>
                            <code className="header-key">{key}</code>
                            <code className="header-value">{value}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch { /* ignore */ }
              return null;
            })()}

            {/* Response Body */}
            <div className="scenario-response">
              <span className="scenario-section-label">Response Body:</span>
              <JsonViewer data={s.responseBody} label={`Scenario: ${s.name}`} maxHeight={200} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
