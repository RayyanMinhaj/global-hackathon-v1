import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 text-gray-900 relative overflow-hidden">
      {/* Frosted Glass Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            MiddlWare.
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-purple-600 transition-colors">Features</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Solutions</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Resources</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hidden sm:inline-block px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-semibold hover:shadow-md">Generate Docs</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section min-h-screen flex items-center justify-center px-6 pt-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-white/30 bg-white/20 backdrop-blur-lg text-purple-800 text-sm font-medium shadow-lg">
            MiddlWare.
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            No Project Managers. No Business Analysts.
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              No Bullsh*t.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6 max-w-3xl mx-auto font-light">
              Stop burning money on people who just make slides. MiddlWare takes raw input from you (ideas, notes, brain dumps) and instantly spits out SRS docs, SDS diagrams, and mockups that your devs can actually use.
          </p>
          <p className="text-md text-gray-600 mb-12 max-w-3xl mx-auto font-light">
            Startups love us because they can’t afford corporate hierarchies. Big companies use us because cutting middlemen saves six figures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/dashboard" className="group px-8 py-4 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-lg text-purple-700 font-semibold hover:bg-white/30 hover:border-white/50 transition-all duration-300 flex items-center gap-2 shadow-lg">
              Try MiddlWare.
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-lg">
              Learn how we replace PMs
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section py-20 px-6 bg-white/10 backdrop-blur-xl relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent"> succeed</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Say goodbye to endless approval chains.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100/50 backdrop-blur-lg rounded-xl flex items-center justify-center mb-6 border border-white/20">
                <span className="text-purple-600 text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Cut the Fluff</h3>
              <p className="text-gray-700">
                MiddlWare cuts the fluff so your product actually ships.
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-pink-100/50 backdrop-blur-lg rounded-xl flex items-center justify-center mb-6 border border-white/20">
                <span className="text-pink-500 text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Save the Dollars</h3>
              <p className="text-gray-700">
                Stop paying for roles that exist just to talk. Start paying for results.
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100/50 backdrop-blur-lg rounded-xl flex items-center justify-center mb-6 border border-white/20">
                <span className="text-orange-500 text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Get Sh*t Done.</h3>
              <p className="text-gray-700">
                Stop paying humans to think when AI can do it better, faster, cheaper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-gray-700 mb-12">
            Join thousands of teams already using MiddlWare to achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Get Started Free
            </button>
            <button className="px-8 py-4 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-lg text-gray-700 font-semibold hover:bg-white/30 hover:border-white/50 transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}