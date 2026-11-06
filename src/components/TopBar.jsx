import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFire, FaBell, FaWallet, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const TopBar = () => {
  const { currentUser, userData, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Real-time unread notifications count
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.size);
      }, (error) => {
        // Quiet fallback if index is being built or collection empty
        console.warn('Notifications snapshot note:', error.message);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up notifications listener:', err);
    }
  }, [currentUser]);

  const balance = userData?.balance ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary p-0.5 shadow-[0_0_12px_rgba(255,45,45,0.6)]">
            <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
              <FaFire className="text-primary text-xl group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-heading font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              FF ESPORTS
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/40">
              PRO ARENA
            </span>
          </div>
        </Link>

        {/* Right Nav Items: Wallet, Notifications, Admin badge, Profile */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Admin Link if admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-950/40 border border-accent/40 text-accent text-xs font-heading font-bold hover:bg-yellow-900/40 transition-colors shadow-[0_0_8px_rgba(255,215,0,0.2)]"
                >
                  <FaUserShield className="text-sm" />
                  <span>ADMIN PANEL</span>
                </Link>
              )}

              {/* Wallet Pill */}
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700/80 border border-primary/30 hover:border-primary transition-colors group shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <FaWallet className="text-xs" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] uppercase font-mono text-gray-400">WALLET</span>
                  <span className="font-heading font-bold text-sm text-accent glow-text-gold">
                    ₹{balance.toLocaleString('en-IN')}
                  </span>
                </div>
              </Link>

              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg bg-dark-700/60 border border-white/10 hover:border-primary/50 text-gray-300 hover:text-white transition-colors"
                title="Notifications"
              >
                <FaBell className="text-base" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-heading font-bold flex items-center justify-center animate-pulse shadow-[0_0_8px_#ff2d2d]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Avatar */}
              <Link to="/profile" className="flex items-center">
                <img
                  src={userData?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                  alt={userData?.username || 'User'}
                  className="w-9 h-9 rounded-lg border border-primary/40 object-cover hover:border-primary transition-all hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=fallback`;
                  }}
                />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 rounded-lg font-heading text-xs font-bold btn-secondary"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-3.5 py-1.5 rounded-lg font-heading text-xs font-bold btn-primary"
              >
                JOIN FREE
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
