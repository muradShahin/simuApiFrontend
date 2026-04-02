import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-surface-1">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="relative p-12 rounded-2xl bg-gradient-to-br from-brand/10 via-surface-2 to-surface-2 border border-brand/20">
          <div className="absolute inset-0 bg-brand/5 rounded-2xl blur-xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              Start building mocks in seconds
            </h2>
            <p className="mt-4 text-text-muted text-lg max-w-xl mx-auto">
              No configuration needed. Import your spec, customize responses, and start testing.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="mt-8 px-8 py-3.5 bg-brand hover:bg-brand-light text-white font-semibold rounded-lg text-lg transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
            <p className="mt-4 text-sm text-text-dim">Free forever for individuals. No credit card required.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
