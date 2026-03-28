import { useState } from 'react';

const LANGUAGE_LABELS = {
  javascript_fetch: 'JavaScript (Fetch)',
  javascript_axios: 'JavaScript (Axios)',
  python: 'Python (requests)',
  java: 'Java (RestTemplate)',
  csharp: 'C# (HttpClient)',
  curl: 'cURL',
};

const LANGUAGE_ORDER = ['curl', 'javascript_fetch', 'javascript_axios', 'python', 'java', 'csharp'];

export default function CodeSnippetsTab({ snippets }) {
  const [activeLang, setActiveLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  if (!snippets || Object.keys(snippets).length === 0) {
    return (
      <div className="empty-state">
        <strong>No code snippets available</strong>
      </div>
    );
  }

  const langs = LANGUAGE_ORDER.filter((l) => snippets[l]);
  if (!langs.includes(activeLang) && langs.length > 0) {
    setActiveLang(langs[0]);
  }

  const code = snippets[activeLang] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="snippets-tab">
      <p className="snippets-intro">
        Copy-paste these snippets to quickly integrate with this mock endpoint.
      </p>

      <div className="snippets-lang-bar">
        {langs.map((lang) => (
          <button
            key={lang}
            className={`snippets-lang-btn ${activeLang === lang ? 'snippets-lang-active' : ''}`}
            onClick={() => { setActiveLang(lang); setCopied(false); }}
          >
            {LANGUAGE_LABELS[lang] || lang}
          </button>
        ))}
      </div>

      <div className="snippets-code-wrapper">
        <div className="snippets-code-header">
          <span>{LANGUAGE_LABELS[activeLang] || activeLang}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="code-block snippets-code snippet-code-numbered">{code.split('\n').map((line, i) => (
          <span className="snippet-line" key={i}>{line}{'\n'}</span>
        ))}</pre>
      </div>
    </div>
  );
}
