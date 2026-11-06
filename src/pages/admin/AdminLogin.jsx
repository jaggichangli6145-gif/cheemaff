import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      toast.success('Admin authorized. Welcome Commander!');
      navigate('/admin');
    } catch (err) {
      // error handled in useAuth
    } finally {
      setLoading(false);
    }
  };

  // Demo Admin quick-fill helper for test reviewers
  const fillDemoAdmin = () => {
    setEmail('admin@ffesports.com');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md gaming-card rounded-2xl p-6 sm:p-8 border border-accent/40 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-secondary to-primary" />

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent/20 to-secondary/20 border border-accent/50 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <FaShieldAlt className="text-accent text-3xl" />
          </div>
          <h2 className="font-heading font-black text-2xl text-white tracking-widest glow-text-gold">
            COMMAND CENTER
          </h2>
          <p className="text-xs font-mono uppercase tracking-widest text-accent mt-1">
            AUTHORIZED ADMINISTRATORS ONLY
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ffesports.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-white/15 focus:border-accent rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaLock />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-white/15 focus:border-accent rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-heading font-bold text-sm bg-gradient-to-r from-accent to-secondary text-black hover:opacity-95 shadow-[0_0_15px_rgba(255,215,0,0.4)] mt-2"
          >
            {loading ? 'AUTHENTICATING PRIVILEGES...' : 'ACCESS COMMAND PANEL'}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-accent/80 hover:text-accent underline"
          >
            <FaKey size={10} />
            <span>Fill Demo Admin Credentials (admin@ffesports.com)</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs font-heading text-gray-400 hover:text-white">
            ← Return to Public Arena
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
