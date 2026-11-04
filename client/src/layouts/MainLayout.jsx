import React, { useState } from 'react';
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
        <Navbar onToggleSidebar={() => setMobileDrawerOpen(!mobileDrawerOpen)} />

        {/* Centered Main Content Area (Max 1200px) */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Clean subtle footer inside authenticated layout */}
        <Footer />
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomNav />
    </div>
  );
}
