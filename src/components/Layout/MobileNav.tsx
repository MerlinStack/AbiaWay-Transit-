import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Wallet, Ticket, Bus, User } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const tabs = [
  { path: '/map', icon: Map, label: 'Live' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/booking', icon: Ticket, label: 'Book' },
  { path: '/fleet', icon: Bus, label: 'Fleet' },
];

function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const currentPath = location.pathname;
  const isProfileActive = !tabs.some((t) => currentPath === t.path || currentPath.startsWith(t.path + '/')) || currentPath === '/register';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 surface-3 border-x-0 border-b-0 rounded-t-2xl rounded-b-none pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {tabs.map(({ path, icon: Icon, label }) => {
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
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </button>
          );
        })}
        <button
          onClick={() => navigate('/register')}
          className={`flex flex-col items-center gap-1 py-2.5 transition-all duration-200 ${
            isProfileActive ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
          }`}
          aria-current={isProfileActive ? 'page' : undefined}
        >
          <span className={`p-1.5 rounded-xl transition-all duration-200 ${isProfileActive ? 'bg-green-500/15' : ''}`}>
            <User size={20} strokeWidth={isProfileActive ? 2.5 : 2} />
          </span>
          <span className="text-[10px] font-medium tracking-wide">{user ? user.name?.split(' ')[0] : 'Profile'}</span>
        </button>
      </div>
    </nav>
  );
}

export default MobileNav;
