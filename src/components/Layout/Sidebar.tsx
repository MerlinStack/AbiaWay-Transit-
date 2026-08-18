import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer } from '@mui/material';
import Logo from './Logo';
import SidebarContextPanel from './SidebarContextPanel';
import useAuthStore from '../../stores/authStore';
import StatusPill from '../ui/StatusPill';
import { allowedNavItems, getRole, SECTION_LABELS } from '../../config/navConfig';
import type { NavItem } from '../../config/navConfig';

function NavButton({ tab, currentPath, onNavigate }: { tab: NavItem; currentPath: string; onNavigate: (path: string) => void }) {
  const Icon = tab.icon;
  const active = currentPath === tab.path || currentPath.startsWith(tab.path + '/');
  return (
    <button
      onClick={() => onNavigate(tab.path)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all text-left ${
        active
          ? 'bg-green-600/30 text-green-400 font-bold'
          : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
      }`}
    >
      <span className={active ? 'text-green-400' : 'text-gray-400'}>
        <Icon size={20} />
      </span>
      <span className="flex-1 truncate">{tab.label}</span>
      {tab.badge && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full shrink-0">{tab.badge}</span>}
    </button>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const user = useAuthStore((s) => s.user);
  const role = getRole(user);
  const navItems = allowedNavItems(role);

  const sections = (['passenger', 'operations', 'administration'] as const)
    .map((section) => ({ section, items: navItems.filter((item) => item.section === section) }))
    .filter((group) => group.items.length > 0);

  return (
    <Drawer
      variant="permanent"
      open
      className="hidden lg:block"
      style={{ width: 280, flexShrink: 0 }}
      PaperProps={{
        style: {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          padding: '32px 24px',
          backdropFilter: 'blur(20px)',
          position: 'fixed',
          height: '100%',
        },
      }}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="overflow-y-auto custom-scrollbar pr-1 min-h-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 grid place-items-center">
              <Logo size={48} />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AbiaWay</p>
              <p className="text-xs text-gray-400">AW Transit v1.0</p>
            </div>
          </div>

          {sections.map(({ section, items }) => (
            <div key={section}>
              <div className="mt-5 mb-2 px-4 py-1">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  {SECTION_LABELS[section]}
                  {section === 'passenger' && !user ? ' · Guest' : ''}
                </p>
              </div>
              <nav>
                {items.map((tab) => (
                  <NavButton key={tab.path} tab={tab} currentPath={currentPath} onNavigate={navigate} />
                ))}
              </nav>
            </div>
          ))}
        </div>

        <SidebarContextPanel pathname={currentPath} />

        <div className="mt-4 bg-[rgba(255,255,255,0.05)] p-3 rounded-2xl border border-[rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-primary font-bold flex items-center justify-center text-white shrink-0">
              {user?.avatar || user?.name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}${user.tier ? ` · ${user.tier}` : ''}` : 'Not signed in'}</p>
            </div>
          </div>
          <hr className="my-2 border-[rgba(148,163,184,0.12)]" />
          <StatusPill dot dotClass="bg-green-500 animate-pulse" className="bg-green-500/10 border-green-500/30 text-green-400">
            Connected
          </StatusPill>
        </div>
      </div>
    </Drawer>
  );
}

export default Sidebar;