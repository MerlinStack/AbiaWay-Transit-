import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { allowedNavItems, getRole } from '../../config/navConfig';

function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const role = getRole(user);
  const tabs = allowedNavItems(role);

  const currentPath = location.pathname;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 surface-3 border-x-0 border-b-0 rounded-t-2xl rounded-b-none pb-[env(safe-area-inset-bottom)]">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map(({ path, icon: Icon, shortLabel }) => {
          const active = currentPath === path || currentPath.startsWith(path + '/');
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 py-2.5 transition-all duration-200 ${
                active ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-green-500/15' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className="text-[10px] font-medium tracking-wide">{shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;