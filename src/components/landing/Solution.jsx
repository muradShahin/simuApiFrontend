const solutions = [
  {
    icon: '⚡',
    title: 'Mock APIs instantly',
    description: 'Define endpoints, set response bodies, status codes, and headers. Your mock is live in seconds.',
  },
  {
    icon: '🎭',
    title: 'Control responses with scenarios',
    description: 'Match requests by headers, query params, or body content — return different responses for each.',
  },
  {
    icon: '🔐',
    title: 'Simulate authentication',
    description: 'OAuth2, JWT, and Basic Auth built in. Test token validation, expiry, and scope enforcement.',
  },
  {
    icon: '🧪',
    title: 'Test everything locally',
    description: 'No external dependencies. Hit your mock endpoints from any HTTP client and verify behavior.',
  },
];

export default function Solution() {
  return (
    <section className="py-20 md:py-28 bg-surface-1">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-green uppercase tracking-wider mb-3">The solution</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            MockCraft gives you full control
          </h2>
          <p className="mt-4 text-text-muted text-lg max-w-2xl mx-auto">
            Build, configure, and test mock APIs with a developer-first workflow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {solutions.map((s) => (
            <div
              key={s.title}
              className="flex gap-4 p-6 rounded-xl bg-surface-2 border border-border hover:border-green/30 transition-colors"
            >
              <span className="text-2xl shrink-0">{s.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{s.title}</h3>
                <p className="mt-2 text-text-muted text-sm leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
