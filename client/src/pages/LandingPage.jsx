import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Users, RefreshCw, Star, CheckCircle, Code, Palette, Languages, Camera } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Empowering Reciprocal Learning Without Money
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Learn. Teach. Exchange. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              No Money Required.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Share what you master. Learn what you desire. SkillSwap intelligently matches complementary skills to pair you with community mentors for direct peer-to-peer exchanges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              Start Skill Exchange Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/discover"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700 flex items-center justify-center transition-all"
            >
              Explore Skill Directory
            </Link>
          </div>

          {/* Key Metrics Pill */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-slate-800 text-left">
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400">Non-Monetary Trade</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Algorithmic</div>
              <div className="text-xs text-slate-400">Match Compatibility</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Real-Time</div>
              <div className="text-xs text-slate-400">Socket.io Messaging</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Verified</div>
              <div className="text-xs text-slate-400">Peer Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-slate-950 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How SkillSwap Works</h2>
            <p className="text-slate-400 text-base">A transparent, step-by-step workflow designed for peer collaboration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Build Profile',
                desc: 'List skills you master (e.g. React, UI Design) and skills you wish to learn.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Get Matched',
                desc: 'Our compatibility engine automatically calculates reciprocal skill alignment scores.',
                icon: RefreshCw,
              },
              {
                step: '03',
                title: 'Exchange & Chat',
                desc: 'Initiate exchange requests, schedule live sessions, and talk via real-time WebSocket chat.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Rate & Review',
                desc: 'Conclude sessions and build your trusted peer reputation score.',
                icon: Star,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative group hover:border-indigo-500/50 transition-all">
                  <div className="text-xs font-mono font-bold text-indigo-400 mb-4">{item.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DISCOVER CATEGORIES PREVIEW */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Skill Categories</h2>
              <p className="text-slate-400 text-sm">Explore diverse knowledge disciplines offered by peers worldwide.</p>
            </div>
            <Link to="/discover" className="mt-4 md:mt-0 text-indigo-400 font-semibold hover:text-indigo-300 text-sm flex items-center gap-1">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Web Development', icon: Code, count: 'React, Node, Java' },
              { name: 'UI/UX Design', icon: Palette, count: 'Figma, Photoshop' },
              { name: 'Languages', icon: Languages, count: 'Spanish, German, Japanese' },
              { name: 'Media & Editing', icon: Camera, count: 'Video Editing, Photography' },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition-colors">
                  <Icon className="w-8 h-8 text-indigo-400 mb-3" />
                  <h4 className="font-bold text-white text-base">{cat.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{cat.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
