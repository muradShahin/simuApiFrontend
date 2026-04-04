import { useState } from 'react';
import client from '../api/client';

export default function VerificationBanner() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await client.post('/auth/resend-verification');
      setSent(true);
    } catch {
      // silent — user can retry
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg, #fef3c7, #fde68a)',
      borderRadius: 10,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 18 }}>📧</span>
      <span style={{ color: '#92400e', fontSize: 14, fontWeight: 500, flex: 1 }}>
        Please verify your email to unlock sharing, teams, and PRO features.
      </span>
      {sent ? (
        <span style={{ color: '#15803d', fontSize: 13, fontWeight: 600 }}>✓ Email sent!</span>
      ) : (
        <button
          onClick={handleResend}
          disabled={sending}
          style={{
            background: '#f59e0b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: sending ? 'not-allowed' : 'pointer',
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? 'Sending…' : 'Resend Email'}
        </button>
      )}
    </div>
  );
}
