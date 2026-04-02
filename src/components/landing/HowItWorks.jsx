const steps = [
  {
    number: '01',
    title: 'Import your API',
    description: 'Upload a Swagger/OpenAPI spec or Postman collection. MockCraft parses it and generates endpoints.',
    visual: (
      <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border font-mono text-xs text-text-muted">
        <span className="text-brand-light">$</span> Upload openapi.yaml<br />
        <span className="text-green">✓</span> Parsed 24 endpoints<br />
        <span className="text-green">✓</span> Generated mock responses
      </div>
    ),
  },
  {
    number: '02',
    title: 'Customize mocks & scenarios',
    description: 'Set response bodies, status codes, delays. Add scenarios to return different data based on conditions.',
    visual: (
      <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border font-mono text-xs text-text-muted">
        <span className="text-text-dim">if</span> <span className="text-brand-light">header</span>.Authorization == <span className="text-green">"expired"</span><br />
        &nbsp;&nbsp;<span className="text-text-dim">→</span> return <span className="text-red-400">401</span> Unauthorized<br />
        <span className="text-text-dim">else</span><br />
        &nbsp;&nbsp;<span className="text-text-dim">→</span> return <span className="text-green">200</span> OK
      </div>
    ),
  },
  {
    number: '03',
    title: 'Test instantly',
    description: 'Use the built-in Try It console or point your app at the mock URL. Inspect logs in real time.',
    visual: (
      <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border font-mono text-xs text-text-muted">
        <span className="text-green">GET</span> /api/v1/users → <span className="text-green">200</span> 12ms<br />
        <span className="text-yellow-400">POST</span> /api/v1/auth → <span className="text-green">200</span> 8ms<br />
        <span className="text-red-400">DELETE</span> /api/v1/users/5 → <span className="text-red-400">403</span> 3ms
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-surface-1">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-cyan uppercase tracking-wider mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            Three steps to working mocks
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <span className="text-5xl font-bold text-brand/20 font-mono">{step.number}</span>
              <h3 className="mt-2 text-lg font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-text-muted text-sm leading-relaxed">{step.description}</p>
              {step.visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
