import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

/* ----------------------------------------------------------------
   Sidebar sections
   ---------------------------------------------------------------- */
const sections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'creating-mocks', label: 'Creating Your First Mock' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'auth-simulation', label: 'Authentication Simulation' },
  { id: 'collections', label: 'Collections' },
  { id: 'sharing', label: 'Sharing Mocks' },
  { id: 'import-export', label: 'Import & Export' },
  { id: 'rate-limiting', label: 'Rate Limiting' },
  { id: 'teams', label: 'Teams & Collaboration' },
  { id: 'api-docs', label: 'API Docs & Try It' },
  { id: 'faq', label: 'FAQ' },
];

/* ----------------------------------------------------------------
   Small reusable components
   ---------------------------------------------------------------- */
function CodeBlock({ children, title }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border">
      {title && (
        <div className="px-4 py-2 bg-surface-3 border-b border-border text-xs font-mono text-text-muted">
          {title}
        </div>
      )}
      <pre className="px-4 py-3 bg-surface-2 overflow-x-auto text-sm leading-relaxed font-mono text-text-secondary">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Step({ number, children }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand/15 text-brand font-bold text-sm flex items-center justify-center mt-0.5">
        {number}
      </span>
      <div className="text-text-secondary text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Tip({ children }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-text-secondary">
      <span className="text-brand text-lg leading-none mt-0.5">💡</span>
      <div>{children}</div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Main component
   ---------------------------------------------------------------- */
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  /* Track scroll position to highlight active sidebar link */
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary font-sans antialiased">
      {/* ---- Top navbar ---- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-0/80 backdrop-blur-lg border-b border-border h-14 flex items-center px-6">
        <div className="flex items-center gap-4 w-full max-w-[1400px] mx-auto">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-surface-3 text-text-muted"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <Link to="/landing" className="flex items-center">
            <img src="/logo.png" alt="MockCraft" style={{ width: '140px', height: '38px', objectFit: 'cover', objectPosition: 'center' }} />
          </Link>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-2 mt-0.5 hidden sm:block">Docs</span>
          <div className="flex-1" />
          <ThemeToggle />
          <Link to="/dashboard" className="text-sm text-text-muted hover:text-text-primary transition-colors hidden sm:block">Dashboard</Link>
          <Link to="/register" className="px-3 py-1.5 text-sm bg-brand hover:bg-brand-light text-white font-semibold rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="pt-14 flex max-w-[1400px] mx-auto">
        {/* ---- Sidebar ---- */}
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`
          fixed top-14 bottom-0 w-64 z-40 bg-surface-0 border-r border-border overflow-y-auto
          transition-transform duration-200 ease-in-out
          lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:z-10
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="py-6 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-4 px-2">Documentation</p>
            <ul className="space-y-0.5">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                      ${activeSection === id
                        ? 'bg-brand/10 text-brand-light font-medium'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-2'}
                    `}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* ---- Main content ---- */}
        <main ref={contentRef} className="flex-1 min-w-0 overflow-y-auto px-6 md:px-12 lg:px-16 py-10 lg:py-14">
          <div className="max-w-3xl">

            {/* ================================================
                1. GETTING STARTED
                ================================================ */}
            <section id="getting-started" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Getting Started</h2>
              <p className="text-text-muted text-lg mb-6">
                MockCraft lets you create, test, and share mock APIs in seconds — no backend required.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">What is MockCraft?</h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                MockCraft is a mock API platform for developers, QA engineers, and frontend teams. Define endpoints, set responses,
                simulate auth flows, and share public links — all from a single interface.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Quick Start</h3>
              <div className="space-y-4">
                <Step number="1">
                  <strong>Create a mock</strong> — go to your Dashboard and click <code className="text-xs bg-surface-3 px-1.5 py-0.5 rounded">+ New Mock</code>. Give it a name, method, and path.
                </Step>
                <Step number="2">
                  <strong>Define the response</strong> — set a status code, response body (JSON), and optional headers.
                </Step>
                <Step number="3">
                  <strong>Test it</strong> — open the mock detail page and use the <em>Try It</em> console to send a request and inspect the response.
                </Step>
              </div>
              <Tip>
                No account needed to try it out — guest users can create up to 3 in-memory mocks immediately.
              </Tip>
            </section>

            {/* ================================================
                2. CREATING YOUR FIRST MOCK
                ================================================ */}
            <section id="creating-mocks" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Creating Your First Mock</h2>
              <p className="text-text-muted mb-6">Define an endpoint and have it live in seconds.</p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Setting Up the Endpoint</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li><strong>Name</strong> — a friendly label, e.g. "Get Users"</li>
                <li><strong>Method</strong> — one of GET, POST, PUT, PATCH, DELETE</li>
                <li><strong>Path</strong> — the URL path, e.g. <code className="text-xs bg-surface-3 px-1.5 py-0.5 rounded">/api/users</code></li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Defining the Response</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li><strong>Status Code</strong> — 200, 201, 404, 500, etc.</li>
                <li><strong>Response Body</strong> — paste or type JSON</li>
                <li><strong>Headers</strong> — optional custom response headers</li>
                <li><strong>Delay</strong> — simulate network latency in milliseconds</li>
                <li><strong>Timeout Simulation</strong> — make the mock hang to test client timeouts</li>
              </ul>

              <CodeBlock title="Example response body">
{`{
  "users": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" },
    { "id": 2, "name": "Bob",   "email": "bob@example.com" }
  ]
}`}
              </CodeBlock>

              <p className="text-text-secondary text-sm">
                Once saved, your mock is immediately live at:
              </p>
              <CodeBlock>
{`GET  https://simuapi.onrender.com/mock/{your-slug}/api/users`}
              </CodeBlock>
            </section>

            {/* ================================================
                3. SCENARIOS
                ================================================ */}
            <section id="scenarios" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Scenarios</h2>
              <p className="text-text-muted mb-6">Return different responses based on request conditions.</p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">What Are Scenarios?</h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                Scenarios let you define <strong>condition → response</strong> rules on a single mock.
                When an incoming request matches a condition, the scenario's response is returned instead of the default.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Condition Types</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li><strong>Header</strong> — match on a specific header value</li>
                <li><strong>Query Parameter</strong> — match on query string params</li>
                <li><strong>Body (JSON path)</strong> — match on request body content</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Example</h3>
              <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm font-mono space-y-1 mb-4">
                <p className="text-text-muted">// Scenario: Return 404 when user ID doesn't exist</p>
                <p><span className="text-brand-light">IF</span> <span className="text-green">query param</span> <code>id</code> = <code>999</code></p>
                <p><span className="text-brand-light">THEN</span> respond with <span className="text-yellow-400">404</span></p>
                <p className="text-text-muted mt-2">{`{ "error": "User not found" }`}</p>
              </div>

              <Tip>
                Scenarios are evaluated in priority order (highest first). The first match wins. If nothing matches, the default response is used.
              </Tip>
            </section>

            {/* ================================================
                4. AUTHENTICATION SIMULATION
                ================================================ */}
            <section id="auth-simulation" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Authentication Simulation</h2>
              <p className="text-text-muted mb-6">Simulate real auth flows without a real auth server.</p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Supported Auth Types</h3>

              <div className="space-y-6 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">Basic Auth</h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Configure a username and password. Requests without a valid <code className="text-xs bg-surface-3 px-1.5 py-0.5 rounded">Authorization: Basic ...</code> header receive a 401.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">JWT Validation</h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    MockCraft validates the <code className="text-xs bg-surface-3 px-1.5 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> header.
                    The token must be a valid JWT signed with the mock's secret. Invalid or expired tokens return 401.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">OAuth2 Flow</h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Enable the OAuth2 token endpoint on your mock. Clients obtain a token via:
                  </p>
                  <CodeBlock title="Token request">
{`POST /mock/{mockId}/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=your-client-id
&client_secret=your-client-secret`}
                  </CodeBlock>
                  <p className="text-text-secondary text-sm">
                    The returned access token can then be used to authenticate requests to the mock.
                  </p>
                </div>
              </div>
            </section>

            {/* ================================================
                5. COLLECTIONS
                ================================================ */}
            <section id="collections" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Collections</h2>
              <p className="text-text-muted mb-6">Organize your mocks into logical groups.</p>

              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li><strong>Create a collection</strong> from the sidebar on the Dashboard.</li>
                <li><strong>Move mocks</strong> between collections using the "Move" button on any mock row.</li>
                <li><strong>Filter</strong> by collection — click a collection in the sidebar to view only its mocks.</li>
                <li><strong>Share with teams</strong> — assign a collection to a team to give all members access.</li>
              </ul>

              <Tip>
                Collections are a great way to mirror your real project structure: one collection per service or customer.
              </Tip>
            </section>

            {/* ================================================
                6. SHARING MOCKS
                ================================================ */}
            <section id="sharing" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Sharing Mocks</h2>
              <p className="text-text-muted mb-6">Generate a public link and share it with anyone.</p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">How It Works</h3>
              <div className="space-y-4 mb-4">
                <Step number="1">Open a mock and click <strong>🔗 Share</strong> (or use the Share button on the Dashboard).</Step>
                <Step number="2">Click <strong>Generate Public Link</strong>. A unique URL is created.</Step>
                <Step number="3">Share the link. Recipients can view docs, test the endpoint, and export — without signing up.</Step>
              </div>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">What the Public Page Includes</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li>Endpoint overview & scenarios</li>
                <li>Auto-generated API documentation (OpenAPI)</li>
                <li>Code snippets in multiple languages</li>
                <li>Live Try It console</li>
                <li>Export as Postman / OpenAPI</li>
                <li>OAuth token endpoint (if configured)</li>
              </ul>

              <Tip>
                You can revoke public access at any time by clicking <strong>Unshare</strong>.
              </Tip>
            </section>

            {/* ================================================
                7. IMPORT & EXPORT
                ================================================ */}
            <section id="import-export" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Import & Export</h2>
              <p className="text-text-muted mb-6">Bring in existing APIs or take your mocks elsewhere.</p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Import</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li><strong>Postman Collection</strong> — drop a <code className="text-xs bg-surface-3 px-1.5 py-0.5 rounded">.json</code> Postman export and mocks are auto-generated.</li>
                <li><strong>OpenAPI / Swagger</strong> — import a spec (JSON or YAML) to create mocks from defined endpoints.</li>
                <li><strong>WSDL (SOAP)</strong> — upload a WSDL file to simulate SOAP services with XML request/response handling.</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Export</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li><strong>Postman Collection</strong> — download your mocks as a ready-to-import Postman collection.</li>
                <li><strong>OpenAPI 3.0</strong> — export a standards-compliant OpenAPI spec.</li>
              </ul>

              <p className="text-text-secondary text-sm">
                Exports are available from the mock detail page, the Dashboard, and public shared pages.
              </p>
            </section>

            {/* ================================================
                8. RATE LIMITING
                ================================================ */}
            <section id="rate-limiting" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Rate Limiting</h2>
              <p className="text-text-muted mb-6">Fair usage limits keep the platform fast for everyone.</p>

              <div className="rounded-lg border border-border overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-surface-3">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-text-primary">Plan</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-text-primary">Mocks</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-text-primary">Scenarios / Mock</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-text-primary">Req / Min / Mock</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr className="border-t border-border">
                      <td className="px-4 py-2.5">Guest</td>
                      <td className="px-4 py-2.5">3</td>
                      <td className="px-4 py-2.5">1</td>
                      <td className="px-4 py-2.5">10</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2.5">Free</td>
                      <td className="px-4 py-2.5">6</td>
                      <td className="px-4 py-2.5">2</td>
                      <td className="px-4 py-2.5">30</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2.5 font-semibold text-brand-light">Pro</td>
                      <td className="px-4 py-2.5">Unlimited</td>
                      <td className="px-4 py-2.5">Unlimited</td>
                      <td className="px-4 py-2.5">200</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-text-secondary text-sm mb-2">
                When you exceed the requests-per-minute limit, the mock returns <code className="text-xs bg-surface-3 px-1.5 py-0.5 rounded">429 Too Many Requests</code>.
                Rate limit headers are included in every response:
              </p>
              <CodeBlock>
{`X-RateLimit-Limit: 30
X-RateLimit-Remaining: 12
X-RateLimit-Reset: 1712345678`}
              </CodeBlock>
            </section>

            {/* ================================================
                9. TEAMS & COLLABORATION
                ================================================ */}
            <section id="teams" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">Teams & Collaboration</h2>
              <p className="text-text-muted mb-6">Work together on shared mock APIs.</p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Creating a Team</h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                Go to the <strong>Teams</strong> page and click <strong>Create Team</strong>. Give it a name and you're the owner.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Inviting Members</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li>Invite by email — the user receives an invitation on their Dashboard.</li>
                <li>They can accept or decline the invite.</li>
                <li>Team members gain access to all collections assigned to the team.</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Sharing Collections</h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                When creating or editing a collection, assign it to a team. All team members will see the collection and its mocks in their sidebar.
              </p>
            </section>

            {/* ================================================
                10. API DOCS & TRY IT
                ================================================ */}
            <section id="api-docs" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-2">API Docs & Try It</h2>
              <p className="text-text-muted mb-6">Auto-generated documentation and an in-browser test console.</p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">API Documentation</h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                Every mock automatically generates an <strong>OpenAPI 3.0</strong> spec. The API Docs tab on the mock detail page shows
                endpoint info, expected parameters, response schema, and authentication requirements — all derived from your mock configuration.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Try It Console</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-4">
                <li>Send real HTTP requests to your mock directly from the browser.</li>
                <li>Add custom headers, query parameters, or request bodies.</li>
                <li>View the full response: status, headers, body, and timing.</li>
                <li>Available on both the private mock detail page and the public shared page.</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-text-primary">Code Snippets</h3>
              <p className="text-text-secondary text-sm mb-2 leading-relaxed">
                The Code Snippets tab provides ready-to-use examples in multiple languages:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['cURL', 'JavaScript', 'Python', 'Java', 'Go', 'PHP', 'Ruby'].map(lang => (
                  <span key={lang} className="px-2.5 py-1 text-xs font-mono bg-surface-3 rounded-md text-text-muted border border-border">
                    {lang}
                  </span>
                ))}
              </div>
            </section>

            {/* ================================================
                11. FAQ
                ================================================ */}
            <section id="faq" className="scroll-mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <FaqItem q="Do I need a backend to use MockCraft?">
                  No. MockCraft hosts and serves your mocks. You just define the endpoints and responses — there's nothing to deploy or maintain.
                </FaqItem>
                <FaqItem q="Can I simulate OAuth2 or JWT authentication?">
                  Yes. MockCraft supports Basic Auth, JWT validation, and a full OAuth2 client-credentials flow. You can configure auth per mock in the settings tab.
                </FaqItem>
                <FaqItem q="Can I share my mocks with others?">
                  Absolutely. Generate a public link from any mock. The recipient can view docs, test the API, and export — without creating an account.
                </FaqItem>
                <FaqItem q="What happens when I hit the rate limit?">
                  Your mock returns <code className="text-xs bg-surface-3 px-1.5 py-0.5 rounded">429 Too Many Requests</code>. Wait a moment and requests will succeed again.
                  Upgrade to Pro for higher limits (200 req/min per mock).
                </FaqItem>
                <FaqItem q="Can I import my existing Postman collections?">
                  Yes. Go to the Import page, drop your Postman JSON export, and mocks are created automatically. OpenAPI and WSDL imports are also supported.
                </FaqItem>
                <FaqItem q="Is my data persistent?">
                  Registered users have persistent data backed by PostgreSQL. Guest (anonymous) mocks are stored in memory and cleared on server restart.
                </FaqItem>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-8 pb-12 text-sm text-text-dim text-center">
              <p>Need help? Reach out at <a href="mailto:support@mockcraft.dev" className="text-brand hover:underline">support@mockcraft.dev</a></p>
              <div className="flex justify-center gap-4 mt-3">
                <Link to="/landing" className="hover:text-text-primary transition-colors">Home</Link>
                <Link to="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
                <Link to="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
                <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---- FAQ accordion item ---- */
function FaqItem({ q, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors"
      >
        {q}
        <svg
          className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed border-t border-border pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
