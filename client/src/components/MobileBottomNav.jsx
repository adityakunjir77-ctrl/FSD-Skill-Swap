import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  MessageSquare,
  User,
} from 'lucide-react';

export default function MobileBottomNav({ unreadMessages = 0 }) {
  const tabs = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Matches', path: '/matches', icon: Sparkles },
    {
      name: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    { name: 'Me', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-canvas/95 backdrop-blur-sm border-t border-ink-primary z-40 px-2 pt-1 safe-area-bottom" aria-label="Primary">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 text-xs font-heading font-semibold transition-colors relative min-w-[56px] border-t-2 -mt-[5px] ${
                  isActive
                    ? 'text-ink-primary border-brand-teal'
                    : 'text-ink-muted border-transparent hover:text-ink-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.75} />
                    {tab.badge && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-teal ring-2 ring-canvas" />
                    )}
                  </div>
                  <span className="mt-1 leading-none">{tab.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

