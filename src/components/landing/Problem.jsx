const problems = [
  {
    icon: '⏳',
    title: 'APIs not ready yet',
    description: 'Backend teams haven\'t finished the endpoint, but you need to build and test your feature now.',
  },
  {
    icon: '🔐',
    title: 'OAuth is painful to test',
    description: 'Setting up real OAuth flows for testing burns hours. Token expiry, scopes, refresh — all need simulation.',
  },
  {
    icon: '🌐',
    title: 'External systems unavailable',
    description: 'Third-party APIs go down, have rate limits, or cost money per call. You can\'t depend on them in dev.',
  },
  {
    icon: '🏦',
    title: 'SOAP/WSDL is a nightmare',
    description: 'Legacy integrations still need testing. Generating SOAP stubs and mocking WSDL services is tedious.',
  },
];

export default function Problem() {
  return (
    <section className="py-20 md:py-28 bg-surface-0">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-light uppercase tracking-wider mb-3">The problem</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            You shouldn't be blocked by APIs you don't control
          </h2>
          <p className="mt-4 text-text-muted text-lg max-w-2xl mx-auto">
            Every developer has hit these walls. MockCraft removes them.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {problems.map((p) => (
            <div
              key={p.title}
              className="p-6 rounded-xl bg-surface-1 border border-border hover:border-brand/30 transition-colors"
            >
              <span className="text-2xl">{p.icon}</span>
              <h3 className="mt-3 text-lg font-semibold text-text-primary">{p.title}</h3>
              <p className="mt-2 text-text-muted text-sm leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
