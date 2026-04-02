import '../landing.css';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import Problem from '../components/landing/Problem';
import Solution from '../components/landing/Solution';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Demo from '../components/landing/Demo';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary font-sans antialiased">
      <LandingNav />
      <Hero />
      <Problem />
      <Solution />
      <div id="features">
        <Features />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Demo />
      <CTA />
      <Footer />
    </div>
  );
}
