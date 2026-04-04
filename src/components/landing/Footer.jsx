import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-10 bg-surface-0 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MockCraft" style={{ width: '160px', height: '44px', objectFit: 'cover', objectPosition: 'center' }} />
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/pricing" className="text-text-muted hover:text-text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/terms" className="text-text-muted hover:text-text-primary transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-text-muted hover:text-text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/login" className="text-text-muted hover:text-text-primary transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-text-muted hover:text-text-primary transition-colors">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-text-dim">
          © {new Date().getFullYear()} MockCraft. Built for developers.
        </div>
      </div>
    </footer>
  );
}
