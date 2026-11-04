import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import {
  Search,
  LogOut,
  User,
  ShieldAlert,
  Menu,
  X,
  Compass,
  ArrowRightLeft,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  // If user is NOT authenticated (Public Topbar)
  if (!isAuthenticated) {
    return (
      <header className="bg-canvas-card border-b border-canvas-border sticky top-0 z-40 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-9 h-9 rounded-button bg-brand-teal flex items-center justify-center text-white shadow-soft group-hover:bg-brand-teal-hover transition-colors">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 8h13m0 0l-4-4m4 4l-4 4" />
                  <path d="M20 16H7m0 0l4-4m-4 4l4 4" />
                </svg>
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-ink-primary">
                Skill<span className="text-brand-teal">Swap</span>
              </span>
            </Link>

            {/* Public Links */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                to="/discover"
                className="text-sm font-heading font-medium text-ink-secondary hover:text-brand-teal transition-colors"
              >
                Browse Skills
              </Link>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-heading font-medium text-ink-secondary hover:text-ink-primary px-3 py-2 rounded-button hover:bg-canvas-subtle transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="coral" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Authenticated Top Bar
  return (
    <header className="bg-canvas-card border-b border-canvas-border sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 justify-between">
      {/* Left: Mobile sidebar toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-button text-ink-secondary hover:bg-canvas-subtle focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills, users, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-canvas-subtle/70 border border-canvas-border rounded-button text-ink-primary placeholder-ink-muted focus-ring transition-colors"
          />
        </form>
      </div>

      {/* Right Controls: Notifications & User Avatar Dropdown */}
      <div className="flex items-center gap-3 ml-4">
        {/* Real-Time Notification Bell */}
        <NotificationDropdown />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-canvas-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
            aria-label="User menu"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name}
              id={user?._id}
              size="sm"
            />
            <span className="hidden lg:block text-xs font-heading font-semibold text-ink-primary max-w-[120px] truncate">
              {user?.name || 'My Account'}
            </span>
          </button>

          {/* User Menu Dropdown */}
          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-canvas-card rounded-card shadow-elevated border border-canvas-border z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-canvas-border bg-canvas-subtle/50">
                <div className="font-heading font-bold text-xs text-ink-primary truncate">
                  {user?.name}
                </div>
                <div className="text-[11px] text-ink-muted truncate">
                  {user?.email}
                </div>
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-heading font-medium text-ink-primary hover:bg-canvas-subtle transition-colors"
              >
                <User className="w-4 h-4 text-ink-secondary" />
                <span>My Profile & Skills</span>
              </Link>

              <Link
                to="/discover"
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-heading font-medium text-ink-primary hover:bg-canvas-subtle transition-colors"
              >
                <Compass className="w-4 h-4 text-ink-secondary" />
                <span>Explore Directory</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-heading font-medium text-brand-coral hover:bg-brand-coral-tint/60 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Administrative Portal</span>
                </Link>
              )}

              <div className="border-t border-canvas-border my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-heading font-medium text-status-danger hover:bg-status-danger-bg/40 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
