import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { refreshUser, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token provided.');
      return;
    }

    client.get(`/auth/verify?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus('success');
        if (isAuthenticated) refreshUser();
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || err.response?.data || 'Verification failed. The link may be expired or invalid.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
      <div style={{
        background: 'var(--color-surface-elevated, #fff)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h2 style={{ color: 'var(--color-text)', margin: '0 0 8px' }}>Verifying your email…</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: 'var(--color-text)', margin: '0 0 8px' }}>Email Verified!</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Your email has been verified successfully. You now have full access to all features.
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Log In'}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: 'var(--color-text)', margin: '0 0 8px' }}>Verification Failed</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>{errorMsg}</p>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Log In'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
