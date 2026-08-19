import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Wallet, Clock, Shield, ArrowRight, MapPin, Users, Star, ChevronRight, Menu, X, WifiOff, CheckCircle2, BatteryCharging, Apple, Chrome } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import LoginModal from '../Auth/LoginModal';
import { getRole, HOME_ROUTE } from '../../config/navConfig';

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'register' | 'role'>('role');
  const [counts, setCounts] = useState({ users: 0, buses: 0, trips: 0, rating: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [abssinInput, setAbssinInput] = useState('');
  const [checkStatus, setCheckStatus] = useState<'IDLE' | 'PENDING' | 'VALID' | 'INVALID'>('IDLE');

  const handleLaunch = () => {
    if (user) {
      navigate(HOME_ROUTE[getRole(user)]);
    } else {
      setAuthTab('role');
      setShowAuth(true);
    }
  };

  const handleCreateAccount = () => {
    setAuthTab('register');
    setShowAuth(true);
  };

  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const statsRef = useRef(null);

  // Counter animation when stats section is visible (rAF + easeOutExpo, single pass)
  useEffect(() => {
    let rafId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const targets = { users: 10000, buses: 50, trips: 100000, rating: 48 };
          const duration = 2000;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(2, -10 * progress);
            setCounts({
              users: Math.floor(eased * targets.users),
              buses: Math.floor(eased * targets.buses),
              trips: Math.floor(eased * targets.trips),
              rating: Math.floor(eased * targets.rating) / 10,
            });
            if (progress < 1) rafId = requestAnimationFrame(tick);
          };
          rafId = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hasAnimated]);

  // IntersectionObserver for fade-in animations
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
    [featuresRef.current, stepsRef.current].forEach(el => el && observer.observe(el));
    return () => [featuresRef.current, stepsRef.current].forEach(el => el && observer.unobserve(el));
  }, []);

  const handleAbssinVerification = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (abssinInput.length !== 12 || !/^\d+$/.test(abssinInput)) {
      setCheckStatus('INVALID');
      return;
    }
    setCheckStatus('PENDING');
    setTimeout(() => { setCheckStatus('VALID'); }, 900);
  }, [abssinInput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
      {/* Floating Animated Background Elements — static (cheap) so no per-frame repaint */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
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

            <div className="hidden md:flex items-center gap-6">
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
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-green-400 transition text-sm font-medium"
              >
                Staff Portal
              </button>
              <button
                onClick={handleCreateAccount}
                className="border border-white/20 hover:border-green-500/50 text-gray-200 hover:text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Create Account
              </button>
              <button
                onClick={handleLaunch}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Launch App
              </button>
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-slideDown space-y-2">
              <a href="#features" className="block py-2 text-gray-300 hover:text-white transition">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-300 hover:text-white transition">How It Works</a>
              <a href="#stats" className="block py-2 text-gray-300 hover:text-white transition">Stats</a>
              <button onClick={handleCreateAccount} className="w-full border border-white/20 px-6 py-2 rounded-lg font-semibold text-gray-200">Create Account</button>
              <button onClick={handleLaunch} className="w-full bg-gradient-to-r from-green-600 to-green-500 px-6 py-2 rounded-lg font-semibold">Launch App</button>
              <button onClick={() => navigate('/login')} className="w-full text-gray-300 py-2 text-sm font-medium">Staff Portal</button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section — scrolls normally, no parallax (parallax caused section overlap + heavy GPU layers) */}
      <section className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeInLeft">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-full text-green-400 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Official Abia State Green Shuttle OS
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              The Smarter Way to Move Between{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Aba &amp; Umuahia</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 animate-fadeInUp delay-200">
              Abia State&rsquo;s official green fleet is here. Tap your Abia Connect Card, bypass cash delays, and experience seamless, solar-powered transit across all LGAs.
            </p>
            <div className="flex flex-wrap gap-4 animate-fadeInUp delay-400">
              <button
                onClick={handleLaunch}
                className="group bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
              >
                Get Moving Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleCreateAccount}
                className="group bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-green-500/40"
              >
                Create Account
              </button>
            </div>

            {/* Floating Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-12 animate-fadeInUp delay-600">
              <div className="flex items-center gap-2"><Users className="w-5 h-5 text-green-400" /><span className="text-sm text-gray-300">10K+ Users</span></div>
              <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /><span className="text-sm text-gray-300">4.8 Rating</span></div>
              <div className="flex items-center gap-2"><Bus className="w-5 h-5 text-blue-400" /><span className="text-sm text-gray-300">50+ Buses</span></div>
            </div>
          </div>

          {/* Abia Connect Card visual */}
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-blue-600/30 rounded-3xl blur-3xl"></div>
            <div className="relative max-w-[400px] mx-auto h-[420px] rounded-3xl bg-gradient-to-br from-green-900 to-gray-900 p-6 flex flex-col justify-between shadow-2xl border border-white/10 overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>

              <div className="flex justify-between items-start z-10">
                <div>
                  <h4 className="font-black text-xl tracking-tight">Abia Connect Card</h4>
                  <p className="text-xs text-green-300/80 mt-0.5">Cashless Smart Boarding Token</p>
                </div>
                <Shield className="w-8 h-8 text-green-400" />
              </div>

              {/* Live telemetry widget overlay */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 z-10">
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="opacity-80 font-medium">Active Loop: Aba &ndash; Umuahia</span>
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                    Live (WS)
                  </span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-3">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] opacity-90 font-mono">
                  <span className="flex items-center gap-1"><BatteryCharging className="w-3 h-3" /> ABS-040</span>
                  <span>SoC 84% (Optimal)</span>
                </div>
              </div>

              {/* Offline badge */}
              <div className="flex items-center gap-2 text-[11px] text-gray-400 z-10">
                <WifiOff className="w-3.5 h-3.5 text-yellow-400" />
                Offline-ready · LeakyBucket sync
              </div>

              <div className="flex justify-between items-end z-10">
                <div className="font-mono text-sm tracking-widest opacity-80">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 2026</div>
                <div className="text-right">
                  <span className="text-[10px] uppercase block tracking-wider opacity-60">System Role</span>
                  <span className="text-xs font-bold bg-green-400/20 text-green-300 border border-green-400/30 px-2 py-0.5 rounded-md">Verified Resident</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="container mx-auto px-4 py-24 opacity-0 translate-y-10 transition-all duration-1000 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Engineered for Fleet Operational Resilience
          </span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: MapPin, title: 'Adaptive Map Telemetry', desc: 'Track exact bus locations and real-time battery charge profiles. See which eco-buses are fully charged and ready to board.', color: 'green', delay: 0 },
            { icon: Shield, title: 'ABSSIN Digital Identity', desc: 'Every transaction secured by your Abia State ID. Rolling 30-second encrypted QR codes prevent ticket duplication and fraud.', color: 'blue', delay: 200 },
            { icon: WifiOff, title: 'Offline-First Validation', desc: 'Conductors validate ticket scans in low-coverage remote corridors. LeakyBucket sync engine rehydrates when network returns.', color: 'yellow', delay: 400 },
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
            { number: '1', title: 'Get ABSSIN', desc: 'Register your Abia State ID at any terminal', icon: Shield },
            { number: '2', title: 'Fund Wallet', desc: 'Load cash or link your ABSIN card', icon: Wallet },
            { number: '3', title: 'Plan Trip', desc: 'Search routes & see live bus availability', icon: MapPin },
            { number: '4', title: 'Tap & Travel', desc: 'Board with a tap — offline or online', icon: Bus },
          ].map((step, index) => (
            <div
              key={index}
              className="text-center group animate-fadeInUp"
              style={{ animationDelay: `${index * 200}ms`, position: 'relative', zIndex: 2 }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center text-2xl font-bold transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
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

      {/* Stats Section */}
      <section id="stats" ref={statsRef} className="container mx-auto px-4 py-24 relative z-10">
        <div className="glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
          <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
            <div className="group">
              <Users className="w-10 h-10 mx-auto mb-4 text-green-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-green-400 mb-2 tabular-nums">{counts.users.toLocaleString()}+</div>
              <div className="text-gray-400">Active Users</div>
              <div className="w-0 h-1 bg-green-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>
            <div className="group">
              <Bus className="w-10 h-10 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-blue-400 mb-2 tabular-nums">{counts.buses}+</div>
              <div className="text-gray-400">Buses Tracked</div>
              <div className="w-0 h-1 bg-blue-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>
            <div className="group">
              <Clock className="w-10 h-10 mx-auto mb-4 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-yellow-400 mb-2 tabular-nums">{counts.trips.toLocaleString()}+</div>
              <div className="text-gray-400">Trips Completed</div>
              <div className="w-0 h-1 bg-yellow-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>
            <div className="group">
              <Star className="w-10 h-10 mx-auto mb-4 text-purple-400 fill-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-5xl font-bold text-purple-400 mb-2 tabular-nums">{counts.rating.toFixed(1)}★</div>
              <div className="text-gray-400">User Rating</div>
              <div className="w-0 h-1 bg-purple-500 mx-auto group-hover:w-16 transition-all duration-500 mt-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Serving Every Corner of Abia State
          </span>
        </h2>
        <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
          The green fleet connects all 17 LGAs &mdash; from Umuahia's capital corridors to the Aba commercial axis and the rural routes in between.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {['Umuahia North', 'Umuahia South', 'Aba North', 'Aba South', 'Ohafia', 'Bende', 'Isuikwuato', 'Arochukwu', 'Ikwuano', 'Osisioma', 'Ukwa East'].map((lga) => (
            <span key={lga} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:border-green-500/50 hover:text-green-300 transition">
              {lga}
            </span>
          ))}
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-500">+6 more</span>
        </div>
      </section>

      {/* ABSSIN Card Check — secondary section for existing cardholders */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="glass-card max-w-3xl mx-auto p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                Already have an ABSSIN?
              </span>
              <h3 className="text-2xl font-bold mb-2">Check your Abia Connect Card</h3>
              <p className="text-sm text-gray-400">
                Verify your card status in seconds before your next trip. Active cards board instantly
                &mdash; no cash, no queue.
              </p>
            </div>
            <form onSubmit={handleAbssinVerification} className="flex-1 flex gap-2">
              <input
                type="text"
                maxLength={12}
                placeholder="12-digit ABSSIN number"
                value={abssinInput}
                onChange={(e) => setAbssinInput(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
              />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition pressable whitespace-nowrap">
                Verify
              </button>
            </form>
          </div>
          {checkStatus === 'INVALID' && <p className="text-xs text-red-400 font-semibold mt-3">ABSSIN must be exactly 12 numeric digits.</p>}
          {checkStatus === 'PENDING' && <p className="text-xs text-gray-400 font-semibold mt-3 animate-pulse">Querying state transit identity ledger...</p>}
          {checkStatus === 'VALID' && (
            <p className="text-xs text-green-400 font-bold mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Card active. Proceed to launch app to fund your digital wallet.
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="glass-card p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of verified users and experience the future of public transportation across Abia State.</p>
            <button onClick={handleLaunch} className="group bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 px-12 py-5 rounded-xl font-semibold text-lg inline-flex items-center gap-3 transition-all duration-300 transform hover:scale-105">
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
                  <Apple className="w-4 h-4 group-hover:scale-110 transition" /> App Store
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 group">
                  <Chrome className="w-4 h-4 group-hover:scale-110 transition" /> Google Play
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-xs text-gray-500 border-t border-white/10">
            &copy; {new Date().getFullYear()} Abia Way Transit System. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes fadeInLeft { from { opacity:0; transform:translateX(-50px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(50px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fadeInLeft { animation: fadeInLeft 1s ease-out forwards; }
        .animate-fadeInUp { opacity:0; animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        .delay-100 { animation-delay:0.1s; } .delay-200 { animation-delay:0.2s; } .delay-300 { animation-delay:0.3s; }
        .delay-400 { animation-delay:0.4s; } .delay-500 { animation-delay:0.5s; } .delay-600 { animation-delay:0.6s; }
        .delay-700 { animation-delay:0.7s; } .delay-1000 { animation-delay:1s; }
      `}</style>

      <LoginModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialTab={authTab} />
    </div>
  );
};

export default LandingPage;
