import { useEffect } from 'react';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: (
      <p>
        MockCraft ("we", "us", or "our") respects your privacy and is committed to protecting the personal data you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights regarding that data. By using MockCraft, you agree to the practices described in this policy.
      </p>
    ),
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    content: (
      <>
        <p>We collect the following types of information:</p>
        <ul>
          <li><strong>Account Information:</strong> When you register, we collect your email address and a hashed version of your password.</li>
          <li><strong>Usage Data:</strong> We collect information about how you use the service, including mock endpoints created, API requests made, and feature usage patterns.</li>
          <li><strong>Payment Information:</strong> Payment details are processed and stored securely by our payment provider (Paddle). We do not store your full credit card number or payment credentials on our servers.</li>
          <li><strong>Technical Data:</strong> We may collect your IP address, browser type, operating system, and device information for security and analytics purposes.</li>
          <li><strong>Mock Content:</strong> Response bodies, headers, and configurations you define for your mock endpoints are stored to provide the service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the MockCraft service</li>
          <li>Process transactions and manage your subscription</li>
          <li>Enforce rate limits and usage quotas</li>
          <li>Send important service-related communications (e.g., billing confirmations, security alerts)</li>
          <li>Monitor and prevent abuse, fraud, and security threats</li>
          <li>Analyze usage trends to improve user experience</li>
        </ul>
        <p>We do not sell your personal data to third parties.</p>
      </>
    ),
  },
  {
    id: 'data-sharing',
    title: '4. Data Sharing and Third Parties',
    content: (
      <>
        <p>We may share your information only in the following circumstances:</p>
        <ul>
          <li><strong>Payment Processing:</strong> We use Paddle as our merchant of record. Paddle processes payments and may collect billing information in accordance with their own privacy policy.</li>
          <li><strong>Infrastructure Providers:</strong> We use third-party hosting services (e.g., Render) to operate the platform. These providers may process data on our behalf under strict confidentiality obligations.</li>
          <li><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process.</li>
          <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-security',
    title: '5. Data Security',
    content: (
      <>
        <p>We implement reasonable technical and organizational measures to protect your data, including:</p>
        <ul>
          <li>Encryption of data in transit (HTTPS/TLS)</li>
          <li>Hashed password storage using industry-standard algorithms</li>
          <li>Access controls limiting data access to authorized personnel</li>
          <li>Regular security reviews of our infrastructure</li>
        </ul>
        <p>No method of transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '6. Cookies and Local Storage',
    content: (
      <>
        <p>MockCraft uses browser local storage to maintain your session (authentication tokens) and user preferences (e.g., theme selection). We do not use third-party tracking cookies.</p>
        <p>You can clear local storage through your browser settings at any time, though this will log you out of the service.</p>
      </>
    ),
  },
  {
    id: 'user-rights',
    title: '7. Your Rights',
    content: (
      <>
        <p>Depending on your jurisdiction, you may have the following rights:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
          <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
          <li><strong>Portability:</strong> Request your data in a portable format</li>
          <li><strong>Objection:</strong> Object to processing of your personal data for certain purposes</li>
        </ul>
        <p>To exercise any of these rights, please contact us using the information below.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: '8. Data Retention',
    content: (
      <p>We retain your account data for as long as your account is active. If you delete your account, your personal data and mock configurations will be permanently removed within 30 days. Anonymized usage data may be retained for analytics purposes.</p>
    ),
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    content: (
      <p>MockCraft is not intended for use by individuals under the age of 16. We do not knowingly collect personal data from children. If we learn that we have collected data from a child under 16, we will take steps to delete that information promptly.</p>
    ),
  },
  {
    id: 'changes',
    title: '10. Changes to This Policy',
    content: (
      <p>We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last updated" date at the top of this page. Continued use of MockCraft after changes constitutes acceptance of the revised policy.</p>
    ),
  },
  {
    id: 'contact',
    title: '11. Contact Us',
    content: (
      <>
        <p>If you have questions or concerns about this Privacy Policy or your personal data, please contact us:</p>
        <ul>
          <li>Email: <a href="mailto:shahinmurad43@gmail.com">shahinmurad43@gmail.com</a></li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <header className="terms-header">
        <h1 className="terms-title">Privacy Policy</h1>
        <p className="terms-updated">Last updated: April 3, 2026</p>
      </header>

      <div className="terms-body">
        <p className="terms-intro">
          This Privacy Policy describes how MockCraft collects, uses, and protects your information when you use our service.
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
