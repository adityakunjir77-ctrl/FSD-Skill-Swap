import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Users, Layers, Repeat, BarChart3, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const adminTabs = [
    { name: 'Overview', path: '/admin', icon: BarChart3, end: true },
    { name: 'User Moderation', path: '/admin/users', icon: Users },
    { name: 'Skill Catalog', path: '/admin/skills', icon: Layers },
    { name: 'Exchanges Audit', path: '/admin/exchanges', icon: Repeat },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-primary">
      <Navbar />

      {/* Admin Top Header Banner in Deep Dark Teal */}
      <div className="bg-brand-teal-dark text-white border-b border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-button bg-white/10 text-white flex items-center justify-center border border-white/15">
              <Shield className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-lg text-white">
                  Administrative Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-bold bg-brand-coral text-white">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-brand-teal-tint/80 mt-0.5">
                Platform metrics, user moderation, catalog administration & exchange audits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-heading font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to User App
            </Link>
          </div>
        </div>

        {/* Admin Navigation Tabs Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-button text-xs font-heading font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-brand-teal-dark shadow-soft'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{tab.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
