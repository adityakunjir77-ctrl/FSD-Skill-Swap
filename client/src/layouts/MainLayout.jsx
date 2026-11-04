import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';

export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  // Mobile navigation drawer: close on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Mobile navigation drawer: Escape closes it, and the page behind does not scroll while open
  useEffect(() => {
    if (!mobileDrawerOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // For unauthenticated users or landing page: classic clean header/body/footer
  if (!isAuthenticated || isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-ink-primary">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  // Authenticated application layout:
  // Desktop: Slim Left Sidebar + Top Bar + Centered Content (max 1200px)
  // Tablet: Collapsible / icon sidebar
  // Mobile: Top Bar + Centered Content + Mobile Bottom Tab Bar
  return (
    <div className="min-h-screen flex bg-canvas text-ink-primary">
      {/* Desktop / Tablet Left Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <Navbar
          onToggleSidebar={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          isDrawerOpen={mobileDrawerOpen}
        />

        {/* Centered Main Content Area (Max 1200px) */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Clean subtle footer inside authenticated layout */}
        <Footer />
      </div>

      {/* Mobile Navigation Drawer (opened from the top bar menu button) */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div
            className="absolute inset-0 bg-ink-primary/50 animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <Sidebar variant="drawer" onClose={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomNav />
    </div>
  );
}
