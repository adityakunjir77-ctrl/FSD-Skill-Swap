import React from 'react';
import { ArrowRightLeft, Heart, Github, Code, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">SkillSwap</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A peer-to-peer non-monetary knowledge exchange platform. Share what you master, learn what you desire, and build a trusted collaborative learning community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/discover" className="hover:text-white transition-colors">Skill Directory</a></li>
              <li><a href="/matches" className="hover:text-white transition-colors">Compatibility Engine</a></li>
              <li><a href="/sessions" className="hover:text-white transition-colors">Exchange Scheduler</a></li>
            </ul>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Academic Project</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Full-Stack MERN Architecture with Socket.io real-time communication & custom skill matching algorithm.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-indigo-300 border border-slate-700">
              <Code className="w-3.5 h-3.5" /> 4-Developer Capstone
            </span>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillSwap Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered for peer-to-peer knowledge sharing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
