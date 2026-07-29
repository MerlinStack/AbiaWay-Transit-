import React, { useEffect, useRef, useState } from 'react';
import { Bus, Wallet, Clock, Shield, ArrowRight, MapPin, Smartphone, Users, Star, ChevronRight, Menu, X } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [counts, setCounts] = useState({ users: 0, buses: 0, trips: 0, rating: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Refs for animation
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const statsRef = useRef(null);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animation when stats section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Animate counters
          const targets = { users: 10000, buses: 50, trips: 100000, rating: 48 };
          const duration = 2000;
          const stepTime = 20;
          const steps = duration / stepTime;
          
          let currentStep = 0;
          const interval = setInterval(() => {
            currentStep++;
            if (currentStep <= steps) {
              const progress = currentStep / steps;
              setCounts({
                users: Math.floor(progress * targets.users),
                buses: Math.floor(progress * targets.buses),
                trips: Math.floor(progress * targets.trips),
                rating: Math.floor(progress * targets.rating) / 10,
              });
            } else {
              clearInterval(interval);
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    const elements = [featuresRef.current, stepsRef.current];
    elements.forEach(el => el && observer.observe(el));

    return () => elements.forEach(el => el && observer.unobserve(el));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
      {/* Floating Animated Background Elements - Fixed z-index */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Navigation - Fixed z-index */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <Bus className="w-6 h-6 text-white animate-bounce-slow" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                Abia Way
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition relative group">
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#stats" className="text-gray-300 hover:text-white transition relative group">
                Stats
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-600/30"
              >
                Launch App
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-slideDown">
              <a href="#features" className="block py-2 text-gray-300 hover:text-white transition">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-300 hover:text-white transition">How It Works</a>
              <a href="#stats" className="block py-2 text-gray-300 hover:text-white transition">Stats</a>
              <button 
                onClick={onGetStarted}
                className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-500 px-6 py-2 rounded-lg font-semibold"
              >
                Launch App
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Parallax - Added position relative and z-index */}
      <section 
        ref={heroRef}
        className="container mx-auto px-4 pt-32 pb-16 relative"
        style={{ transform: `translateY(${scrollY * 0.5}px)`, position: 'relative', zIndex: 1 }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeInLeft">
            <div className="inline-block px-4 py-2 bg-green-600/20 rounded-full text-green-400 text-sm mb-6 animate-pulse">
              🚀 Smart Transit System
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Smart Transit for{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Abia State
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 animate-fadeInUp delay-200">
              Real-time bus tracking, digital payments, and seamless journey planning for modern public transportation.
            </p>
            <div className="flex flex-wrap gap-4 animate-fadeInUp delay-400">
              <button 
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-600/40"
              >
                Get Started 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20">
                Learn More
              </button>
            </div>

            {/* Floating Stats */}
            <div className="flex gap-6 mt-12 animate-fadeInUp delay-600">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">10K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-300">4.8 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-300">50+ Buses</span>
              </div>
            </div>
          </div>

          {/* Animated Hero Image */}
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-blue-600/30 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-white/10 p-2 backdrop-blur-sm">
              <div className="absolute top-4 left-4 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              <div className="absolute top-4 left-10 w-20 h-2 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce-slow"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-slow delay-100"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce-slow delay-200"></div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Bus" 
                className="rounded-2xl w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
              
              {/* Floating Cards - Fixed positioning to prevent overlap */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center animate-float delay-300 shadow-2xl">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center animate-float delay-700 shadow-2xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="container mx-auto px-4 py-24 opacity-0 translate-y-10 transition-all duration-1000 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Why Choose Abia Way?
          </span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: MapPin, title: 'Live Tracking', desc: 'Track buses in real-time on an interactive map with accurate ETAs', color: 'green', delay: 0 },
            { icon: Wallet, title: 'Digital Wallet', desc: 'Cashless payments with instant top-up and transaction history', color: 'blue', delay: 200 },
            { icon: Clock, title: 'Real-time ETA', desc: 'Know exactly when your bus will arrive with accurate predictions', color: 'yellow', delay: 400 },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative glass-card p-8 text-center hover:scale-105 transition-all duration-500 animate-fadeInUp"
              style={{ animationDelay: `${feature.delay}ms`, position: 'relative', zIndex: 2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.color === 'green' ? 'bg-green-600/20' : feature.color === 'blue' ? 'bg-blue-600/20' : 'bg-yellow-600/20'}`}>
                <feature.icon className={`w-8 h-8 group-hover:rotate-12 transition-transform duration-300 ${feature.color === 'green' ? 'text-green-400' : feature.color === 'blue' ? 'text-blue-400' : 'text-yellow-400'}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-colors">{feature.title}</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
              
              {/* Animated border */}
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-green-500 group-hover:w-1/2 transition-all duration-300"></div>
              <div className="absolute bottom-0 right-1/2 w-0 h-0.5 bg-green-500 group-hover:w-1/2 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={stepsRef} className="container mx-auto px-4 py-24 opacity-0 translate-y-10 transition-all duration-1000 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { number: '1', title: 'Sign Up', desc: 'Create your free account', icon: Users },
            { number: '2', title: 'Load Wallet', desc: 'Add funds to your digital wallet', icon: Wallet },
            { number: '3', title: 'Plan Trip', desc: 'Search and book your route', icon: MapPin },
            { number: '4', title: 'Travel', desc: 'Track and pay as you go', icon: Bus },
          ].map((step, index) => (
            <div
              key={index}
              className="text-center group animate-fadeInUp"
              style={{ animationDelay: `${index * 200}ms`, position: 'relative', zIndex: 2 }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center text-2xl font-bold transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-green-600/30">
                  {step.number}
                </div>
                <div className="absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-green-600/50 to-transparent hidden md:block"></div>
              </div>
              <step.icon className="w-8 h-8 mx-auto mb-3 text-green-400 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold mb-2 group-hover:text-green-400 transition-colors">{step.title}</h4>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section with Counter Animation */}
      <section id="stats" ref={statsRef} className="container mx-auto px-4 py-24 relative z-10">
        <div className="glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 animate-gradient"></div>
          <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
            {/* Active Users */}
            <div className="group">
              <Users className="w-10 h-10 mx-auto mb-4 text-green-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-green-400 mb-2 tabular-nums">
                {counts.users.toLocaleString()}+
              </div>
              <div className="text-gray-400">Active Users</div>
              <div className="w-0 h-1 bg-green-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>

            {/* Buses Tracked */}
            <div className="group">
              <Bus className="w-10 h-10 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-blue-400 mb-2 tabular-nums">
                {counts.buses}+
              </div>
              <div className="text-gray-400">Buses Tracked</div>
              <div className="w-0 h-1 bg-blue-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>

            {/* Trips Completed */}
            <div className="group">
              <Clock className="w-10 h-10 mx-auto mb-4 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-yellow-400 mb-2 tabular-nums">
                {counts.trips.toLocaleString()}+
              </div>
              <div className="text-gray-400">Trips Completed</div>
              <div className="w-0 h-1 bg-yellow-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>

            {/* User Rating */}
            <div className="group">
              <Star className="w-10 h-10 mx-auto mb-4 text-purple-400 fill-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-purple-400 mb-2 tabular-nums">
                {counts.rating.toFixed(1)}★
              </div>
              <div className="text-gray-400">User Rating</div>
              <div className="w-0 h-1 bg-purple-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="glass-card p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 animate-pulse"></div>
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users and experience the future of public transportation.
            </p>
            <button 
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 px-12 py-5 rounded-xl font-semibold text-lg inline-flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-600/40"
            >
              Launch App Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 group">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg">Abia Way</span>
              </div>
              <p className="text-sm text-gray-400">Smart transit system for Abia State. Making travel easier, safer, and more efficient.</p>
            </div>
            {[
              { title: 'Quick Links', links: ['About Us', 'Contact', 'FAQs', 'Support'] },
              { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy'] },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-green-400 transition flex items-center gap-1 group">
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="font-semibold mb-4">Download App</h4>
              <div className="space-y-2">
                <button className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 group">
                  <i data-lucide="apple" className="w-4 h-4 group-hover:scale-110 transition"></i>
                  App Store
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 group">
                  <i data-lucide="chrome" className="w-4 h-4 group-hover:scale-110 transition"></i>
                  Google Play
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-xs text-gray-500 border-t border-white/10">
            © {new Date().getFullYear()} Abia Way Transit System. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 1s ease-out forwards;
        }
        
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default LandingPage;