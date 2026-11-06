import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTrophy, FaGamepad, FaWallet, FaUser } from 'react-icons/fa';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Tournaments', path: '/tournaments', icon: FaTrophy },
    { name: 'My Matches', path: '/my-matches', icon: FaGamepad },
    { name: 'Wallet', path: '/wallet', icon: FaWallet },
    { name: 'Profile', path: '/profile', icon: FaUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-t border-white/10 px-2 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 group relative ${
                  isActive
                    ? 'text-primary scale-105'
                    : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-primary/20 shadow-[0_0_15px_rgba(255,45,45,0.6)]' : 'group-hover:bg-white/5'
                  }`}>
                    <Icon className={`text-xl ${isActive ? 'text-primary drop-shadow-[0_0_8px_#ff2d2d]' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-heading font-semibold mt-1 tracking-wider ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_8px_#ff2d2d]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
