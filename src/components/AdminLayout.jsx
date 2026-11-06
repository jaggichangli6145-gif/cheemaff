import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaPlusCircle, 
  FaGamepad, 
  FaUsers, 
  FaMoneyCheckAlt, 
  FaSignOutAlt, 
  FaArrowLeft,
  FaBars,
  FaTimes,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
  const { logout, userData } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: FaTachometerAlt, end: true },
    { name: 'Create Tournament', path: '/admin/create-tournament', icon: FaPlusCircle },
    { name: 'Manage Tournaments', path: '/admin/tournaments', icon: FaGamepad },
    { name: 'Manage Users', path: '/admin/users', icon: FaUsers },
    { name: 'Manage Payments', path: '/admin/payments', icon: FaMoneyCheckAlt },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black/90 border-b border-primary/30 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-accent text-xl" />
          <span className="font-heading font-black text-primary text-lg">FF ADMIN</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-black/95 border-r border-primary/20 p-5 md:min-h-screen fixed md:sticky top-0 z-40 transition-all`}
      >
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-accent to-secondary p-0.5 shadow-[0_0_15px_rgba(255,215,0,0.4)]">
            <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
              <FaShieldAlt className="text-accent text-xl" />
            </div>
          </div>
          <div>
            <h2 className="font-heading font-black text-sm tracking-widest text-white">ADMIN HQ</h2>
            <p className="text-[10px] font-mono text-accent">ESPORTS MANAGEMENT</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-heading text-xs uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/30 to-secondary/10 border-l-4 border-primary text-white font-bold shadow-[0_0_12px_rgba(255,45,45,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="text-base text-secondary" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/10 space-y-2 mt-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-heading text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <FaArrowLeft className="text-primary" />
            <span>Switch to Player View</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-heading text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
          >
            <FaSignOutAlt />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
