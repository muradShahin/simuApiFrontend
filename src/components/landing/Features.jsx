const features = [
      {
    emoji: '🛠️',
    title: 'Mocking API',
    description: 'Build your mock API with an intuitive interface. Define endpoints, set response bodies, status codes, and headers. Your mock is live in seconds.',
  },
  {
    emoji: '🎭',
    title: 'Scenario Engine',
    description: 'Define conditions based on headers, query params, or body. Return different responses per match.',
  },
  {
    emoji: '🔐',
    title: 'OAuth/JWT Simulation',
    description: 'Built-in auth simulation: OAuth2 flows, JWT validation, Basic Auth. No real auth server needed.',
  },
  {
    emoji: '📥',
    title: 'Import from Postman/OpenAPI',
    description: 'Drop your Postman collection or OpenAPI spec — mocks are auto-generated instantly.',
  },
  {
    emoji: '🏦',
    title: 'SOAP/WSDL Support',
    description: 'Import WSDL definitions and simulate SOAP services with XML request/response handling.',
  },
  {
    emoji: '🧪',
    title: 'Try It Console',
    description: 'Test your mocks directly in the browser. Send requests, inspect responses, debug scenarios.',
  },
  {
    emoji: '📤',
    title: 'Export APIs',
    description: 'Export your mock definitions as OpenAPI specs or Postman collections. Share with your team.',
  },
  {
    emoji: '🔗',
    title: 'Public Sharing',
    description: 'Share any mock endpoint publicly with a single link. Viewers can explore docs, test the API, and export — no sign-up required.',
  },
];

export default function Features() {
  return (
    <section className="py-20 md:py-28 bg-surface-0">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-light uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            Everything you need to mock APIs
          </h2>
          <p className="mt-4 text-text-muted text-lg max-w-2xl mx-auto">
            From simple stubs to complex simulations — one tool handles it all.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl bg-surface-1 border border-border hover:border-brand/30 transition-all"
            >
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="mt-4 text-lg font-semibold text-text-primary group-hover:text-brand-light transition-colors">
                {f.title}
              </h3>
              <p className="mt-2 text-text-muted text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
