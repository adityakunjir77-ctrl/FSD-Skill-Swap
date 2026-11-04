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
      <div className="bg-ink-primary text-white pt-8 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 mt-1 rounded-button text-brand-teal-tint flex items-center justify-center border border-white/25" aria-hidden="true">
              <Shield className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="font-display font-medium text-display-sm sm:text-display-md text-white tracking-[-0.02em]">
                  Administrative Portal
                </h1>
                <span className="px-2 py-0.5 rounded-button text-xs font-heading font-semibold border border-white/40 text-white">
                  Admin Access
                </span>
              </div>
              <p className="text-sm text-white/70 mt-1.5 max-w-xl">
                Platform metrics, user moderation, catalog administration & exchange audits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-heading font-semibold border border-white/40 hover:bg-white hover:text-ink-primary text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to User App
            </Link>
          </div>
        </div>

        {/* Admin Navigation Tabs Strip */}
        <nav aria-label="Admin sections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7 border-t border-white/15 flex items-center gap-6 overflow-x-auto">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 py-3 text-sm font-heading font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? 'text-white border-brand-teal-tint'
                      : 'text-white/65 border-transparent hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{tab.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
