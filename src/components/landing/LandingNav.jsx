import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-0/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="MockCraft" style={{ width: '160px', height: '44px', objectFit: 'cover', objectPosition: 'center' }} />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          <a href="#features" className="hover:text-text-primary transition-colors"
             onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Features
          </a>
          <a href="#demo" className="hover:text-text-primary transition-colors"
             onClick={(e) => { e.preventDefault(); document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Demo
          </a>
          <a href="#how-it-works" className="hover:text-text-primary transition-colors"
             onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>
            How It Works
          </a>
          <Link to="/docs" className="hover:text-text-primary transition-colors">
            Docs
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm bg-brand hover:bg-brand-light text-white font-semibold rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
