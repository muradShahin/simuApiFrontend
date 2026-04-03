import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { openPaddleCheckout } from '../api/billing';

/* ─── Check icon ─── */
const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const Cross = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Feature row in pricing card ─── */
function Feature({ children }) {
  return (
    <li className="pricing-feature">
      <Check />
      <span>{children}</span>
    </li>
  );
}

/* ─── Pricing card ─── */
function PricingCard({ plan, price, period, features, cta, onCta, highlighted, badge, disabled }) {
  return (
    <div className={`pricing-card${highlighted ? ' pricing-card--pro' : ''}`}>
      {badge && <span className="pricing-badge">{badge}</span>}
      <div className="pricing-card-header">
        <h3 className="pricing-plan-name">{plan}</h3>
        <div className="pricing-price-row">
          <span className="pricing-price">{price}</span>
          {period && <span className="pricing-period">/{period}</span>}
        </div>
      </div>
      <ul className="pricing-features">
        {features.map((f, i) => <Feature key={i}>{f}</Feature>)}
      </ul>
      <button
        className={`btn ${highlighted ? 'btn-upgrade' : 'btn-secondary'} pricing-cta`}
        onClick={onCta}
        disabled={disabled}
      >
        {cta}
      </button>
    </div>
  );
}

/* ─── Comparison row ─── */
const rows = [
  { label: 'Mock endpoints',    free: 'Up to 6',        pro: 'Unlimited' },
  { label: 'Scenarios per mock', free: 'Up to 2',       pro: 'Unlimited' },
  { label: 'Auth simulation',   free: 'Basic + JWT',    pro: 'Basic + JWT + OAuth2' },
  { label: 'Rate limit (mock)',  free: '30 req/min',    pro: '200 req/min' },
  { label: 'Rate limit (user)',  free: '100 req/min',   pro: '1,000 req/min' },
  { label: 'API import',        free: '3/month',        pro: 'Unlimited' },
  { label: 'API export',        free: true,             pro: true },
  { label: 'Team collaboration', free: false,           pro: true },
  { label: 'Priority performance', free: false,         pro: true },
];

function ComparisonTable() {
  return (
    <div className="pricing-table-wrapper">
      <table className="pricing-table">
        <thead>
          <tr>
            <th className="pricing-table-feature">Feature</th>
            <th className="pricing-table-plan">Free</th>
            <th className="pricing-table-plan pricing-table-plan--pro">Pro</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, free, pro }) => (
            <tr key={label}>
              <td className="pricing-table-feature">{label}</td>
              <td className="pricing-table-plan">{renderCell(free)}</td>
              <td className="pricing-table-plan pricing-table-plan--pro">{renderCell(pro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(val) {
  if (val === true) return <Check />;
  if (val === false) return <Cross />;
  return <span>{val}</span>;
}

/* ─── FAQ ─── */
const faqs = [
  {
    q: 'What happens when I hit my limits?',
    a: 'You\'ll receive an HTTP 429 response with a Retry-After header. Your existing mocks keep working — you just can\'t create new ones beyond your plan limit.',
  },
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Yes. Upgrade instantly and get access to Pro features immediately. If you cancel, you keep Pro until the end of your billing period.',
  },
  {
    q: 'Do I need a credit card for the free plan?',
    a: 'No. The free plan is completely free — no credit card required. Just sign up and start building mocks.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'You can pay with any major credit or debit card.',
  },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <div className="pricing-faq-list">
      {faqs.map(({ q, a }, i) => (
        <button
          key={i}
          className={`pricing-faq-item${open === i ? ' pricing-faq-item--open' : ''}`}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="pricing-faq-q">
            <span>{q}</span>
            <svg
              className="pricing-faq-chevron"
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {open === i && <p className="pricing-faq-a">{a}</p>}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isPro } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

  async function handleUpgrade() {
    if (!isAuthenticated) { navigate('/register'); return; }
    setUpgrading(true);
    try {
      await openPaddleCheckout();
    } catch {
      setUpgrading(false);
    }
  }

  function handleGetStarted() {
    if (isAuthenticated) { navigate('/dashboard'); return; }
    navigate('/register');
  }

  return (
    <div className="pricing-page">
      {/* ── Header ── */}
      <section className="pricing-hero">
        <h1 className="pricing-title">Simple, Transparent Pricing</h1>
        <p className="pricing-subtitle">
          Start for free. Upgrade when you need more power.
        </p>
      </section>

      {/* ── Cards ── */}
      <section className="pricing-cards">
        <PricingCard
          plan="Free"
          price="$0"
          period="forever"
          features={[
            'Up to 6 mock APIs',
            'Up to 2 scenarios per mock',
            'Basic + JWT authentication',
            '3 API imports per month',
            '30 req/min per mock',
          ]}
          cta={isAuthenticated ? 'Current Plan' : 'Get Started'}
          onCta={handleGetStarted}
          disabled={isAuthenticated && !isPro}
        />
        <PricingCard
          plan="Pro"
          price="$12"
          period="month"
          highlighted
          badge="Most Popular"
          features={[
            'Unlimited mock APIs',
            'Unlimited scenarios',
            'OAuth2 authentication simulation',
            'Team collaboration',
            '200 req/min per mock',
            'Unlimited API import & export',
            'Priority performance',
          ]}
          cta={isPro ? 'Current Plan' : upgrading ? 'Redirecting…' : 'Upgrade to Pro'}
          onCta={handleUpgrade}
          disabled={isPro || upgrading}
        />
      </section>

      {/* ── Comparison ── */}
      <section className="pricing-section">
        <h2 className="pricing-section-title">Compare Plans</h2>
        <ComparisonTable />
      </section>

      {/* ── FAQ ── */}
      <section className="pricing-section">
        <h2 className="pricing-section-title">Frequently Asked Questions</h2>
        <FaqSection />
      </section>

      {/* ── Bottom CTA ── */}
      <section className="pricing-bottom-cta">
        <h2 className="pricing-bottom-title">Start building mocks in seconds</h2>
        <p className="pricing-bottom-sub">No credit card required. Free forever.</p>
        <button className="btn btn-primary pricing-bottom-btn" onClick={handleGetStarted}>
          Get Started Free
        </button>
      </section>
    </div>
  );
}
