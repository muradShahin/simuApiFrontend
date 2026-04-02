export default function Demo() {
  return (
    <section id="demo" className="py-20 md:py-28 bg-surface-0">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-light uppercase tracking-wider mb-3">Demo</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            See it in action
          </h2>
          <p className="mt-4 text-text-muted text-lg max-w-2xl mx-auto">
            The Try It console lets you test mocks without leaving the browser.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 shadow-2xl overflow-hidden max-w-4xl mx-auto">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green/60" />
            <span className="ml-3 text-xs text-text-dim font-mono">MockCraft — Try It Console</span>
          </div>

          <div className="grid md:grid-cols-2 divide-x divide-border">
            {/* Request panel */}
            <div className="p-5">
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-4">Request</h4>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-xs font-bold font-mono bg-yellow-500/15 text-yellow-400 rounded">POST</span>
                <span className="font-mono text-sm text-text-secondary">/api/v1/auth/token</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-text-dim font-semibold uppercase tracking-wider">Headers</p>
                <div className="font-mono text-xs text-text-muted bg-surface-2 rounded-lg p-3">
                  <div>Content-Type: <span className="text-brand-light">application/json</span></div>
                  <div>X-Client-Id: <span className="text-brand-light">demo-app</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-text-dim font-semibold uppercase tracking-wider">Body</p>
                <pre className="font-mono text-xs text-text-muted bg-surface-2 rounded-lg p-3 leading-relaxed">
{`{
  "grant_type": "client_credentials",
  "scope": "read write"
}`}
                </pre>
              </div>
            </div>

            {/* Response panel */}
            <div className="p-5">
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-4">Response</h4>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-xs font-bold font-mono bg-green/15 text-green rounded">200 OK</span>
                <span className="text-xs text-text-dim">8ms • 247 bytes</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-text-dim font-semibold uppercase tracking-wider">Headers</p>
                <div className="font-mono text-xs text-text-muted bg-surface-2 rounded-lg p-3">
                  <div>Content-Type: <span className="text-green">application/json</span></div>
                  <div>X-MockCraft: <span className="text-green">true</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-text-dim font-semibold uppercase tracking-wider">Body</p>
                <pre className="font-mono text-xs text-text-muted bg-surface-2 rounded-lg p-3 leading-relaxed">
{`{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Scenario indicator */}
          <div className="px-5 py-3 bg-surface-2 border-t border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="text-xs text-text-muted font-mono">
              Matched scenario: <span className="text-brand-light">OAuth2 Client Credentials</span> • Mock ID: <span className="text-text-dim">mc_auth_001</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
