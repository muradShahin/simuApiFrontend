import { useEffect } from 'react';

const sections = [
  {
    id: 'service',
    title: '1. Description of Service',
    content: (
      <>
        <p>MockCraft is a developer platform that allows you to create, configure, and expose mock API endpoints publicly. The service enables simulation of API behavior including custom responses, authentication flows, rate limiting, and scenario-based routing.</p>
        <p>MockCraft is provided "as-is" for development, testing, and integration purposes. Mock endpoints created on the platform are publicly accessible via unique URLs.</p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: '2. Accounts',
    content: (
      <>
        <p>To access certain features, you must create an account. You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and current information</li>
        </ul>
        <p>You may use MockCraft as an anonymous guest with limited functionality. Anonymous mocks are stored in memory and may be cleared at any time.</p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: '3. Acceptable Use',
    content: (
      <>
        <p>You agree not to use MockCraft to:</p>
        <ul>
          <li>Distribute malware, phishing pages, or malicious content</li>
          <li>Impersonate real APIs to deceive or defraud third parties</li>
          <li>Store or transmit sensitive personal data (PII, PHI, financial data)</li>
          <li>Conduct denial-of-service attacks against MockCraft or other systems</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
      </>
    ),
  },
  {
    id: 'rate-limiting',
    title: '4. Rate Limiting and Usage Limits',
    content: (
      <>
        <p>To protect platform stability, MockCraft enforces rate limits on all mock API requests:</p>
        <ul>
          <li><strong>Free plan:</strong> 30 requests/minute per mock, 100 requests/minute per user</li>
          <li><strong>Pro plan:</strong> 200 requests/minute per mock, 1,000 requests/minute per user</li>
        </ul>
        <p>Requests exceeding these limits will receive an HTTP 429 (Too Many Requests) response. Additional resource limits (mock count, scenarios, imports) vary by plan.</p>
      </>
    ),
  },
  {
    id: 'payments',
    title: '5. Subscription and Payments',
    content: (
      <>
        <p>MockCraft offers a free tier and a paid Pro subscription. Payment is processed securely through Stripe.</p>
        <ul>
          <li>Pro subscriptions are billed monthly</li>
          <li>You may cancel at any time; access continues until the end of the billing period</li>
          <li>No refunds are provided for partial billing periods</li>
          <li>Failed payments may result in downgrade to the Free plan</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ip',
    title: '6. Intellectual Property',
    content: (
      <>
        <p>You retain ownership of all mock configurations and response data you create on MockCraft. We do not claim any intellectual property rights over your content.</p>
        <p>The MockCraft platform, including its design, code, branding, and documentation, is the property of MockCraft and is protected by applicable intellectual property laws.</p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: '7. Public Sharing',
    content: (
      <>
        <p>Mock endpoints you create are accessible via public URLs. You are solely responsible for the content served by your mock endpoints.</p>
        <ul>
          <li>Do not expose confidential or proprietary data through mock responses</li>
          <li>Mock URLs may be shared with third parties for integration testing</li>
          <li>Team collaboration features allow shared access within your organization</li>
        </ul>
      </>
    ),
  },
  {
    id: 'warranties',
    title: '8. Disclaimer of Warranties',
    content: (
      <p>MockCraft is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted, error-free, or free of harmful components. Mock endpoints may experience downtime during maintenance or scaling operations.</p>
    ),
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: (
      <p>To the maximum extent permitted by law, MockCraft and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or business opportunities, arising from your use of or inability to use the service.</p>
    ),
  },
  {
    id: 'termination',
    title: '10. Termination',
    content: (
      <>
        <p>We may suspend or terminate your access to MockCraft at any time, with or without cause, including but not limited to:</p>
        <ul>
          <li>Violation of these Terms of Service</li>
          <li>Abusive or excessive usage patterns</li>
          <li>Non-payment of subscription fees</li>
        </ul>
        <p>You may delete your account at any time. Upon termination, your mock endpoints and associated data will be permanently deleted.</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '11. Changes to Terms',
    content: (
      <p>We reserve the right to modify these Terms of Service at any time. When we make material changes, we will update the "Last updated" date at the top of this page. Continued use of MockCraft after changes constitutes acceptance of the revised terms.</p>
    ),
  },
  {
    id: 'contact',
    title: '12. Contact',
    content: (
      <>
        <p>If you have questions about these Terms of Service, please contact us:</p>
        <ul>
          <li>Email: <a href="mailto:support@mockcraft.dev">support@mockcraft.dev</a></li>
        </ul>
      </>
    ),
  },
];

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <header className="terms-header">
        <h1 className="terms-title">Terms of Service</h1>
        <p className="terms-updated">Last updated: April 3, 2026</p>
      </header>

      <div className="terms-body">
        <p className="terms-intro">
          Welcome to MockCraft. By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully.
        </p>

        {sections.map((s) => (
          <section key={s.id} id={s.id} className="terms-section">
            <h2 className="terms-section-title">{s.title}</h2>
            <div className="terms-section-body">{s.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
