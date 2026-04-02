import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-dim border border-brand/20 text-brand-light text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Developer-first API mocking
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              Craft Real API{' '}
              <span className="text-brand-light">Simulations</span>
            </h1>

            <p className="mt-5 text-lg md:text-xl text-text-muted leading-relaxed max-w-xl">
              Import APIs, simulate OAuth, and test integrations — without waiting for real systems.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-brand hover:bg-brand-light text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
              <button
                onClick={() => {
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-surface-3 hover:bg-surface-4 text-text-secondary font-semibold rounded-lg border border-border transition-colors cursor-pointer"
              >
                View Demo
              </button>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-text-dim">
              <span>✓ Free tier available</span>
              <span>✓ No credit card</span>
              <span>✓ Setup in 30 seconds</span>
            </div>
          </div>

          {/* Right — Mock UI Panel */}
          <div className="relative">
            <div className="rounded-xl border border-border bg-surface-1 shadow-2xl overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green/60" />
                <span className="ml-3 text-xs text-text-dim font-mono">MockCraft — Try It Console</span>
              </div>

              {/* Request */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 text-xs font-bold font-mono bg-green/15 text-green rounded">GET</span>
                  <span className="font-mono text-sm text-text-secondary">/api/v1/users</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-mono bg-brand-dim text-brand-light rounded">Authorization: Bearer eyJhbG...</span>
                </div>
              </div>

              {/* Response */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 text-xs font-bold bg-green/15 text-green rounded font-mono">200 OK</span>
                  <span className="text-xs text-text-dim">12ms</span>
                </div>
                <pre className="text-sm font-mono text-text-muted leading-relaxed">
{`{
  "users": [
    {
      "id": 1,
      "name": "Jane Doe",
      "role": "admin"
    }
  ],
  "total": 42
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
