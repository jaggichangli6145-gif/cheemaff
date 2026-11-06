import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaGamepad, 
  FaMoneyBillWave, 
  FaPlusCircle, 
  FaTrophy, 
  FaClock, 
  FaExclamationCircle,
  FaShieldAlt,
  FaSync
} from 'react-icons/fa';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { seedInitialDataIfEmpty } from '../../utils/seedData';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTournaments: 0,
    pendingWithdrawals: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to tournaments
    const unsubTourneys = onSnapshot(collection(db, 'tournaments'), (snap) => {
      setStats(prev => ({
        ...prev,
        activeTournaments: snap.docs.filter(d => d.data().status !== 'completed').length
      }));
    }, (err) => console.warn(err.message));

    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
    }, (err) => console.warn(err.message));

    // Listen to pending withdrawals
    const qPending = query(collection(db, 'transactions'), where('type', '==', 'withdrawal'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(qPending, (snap) => {
      setStats(prev => ({ ...prev, pendingWithdrawals: snap.size }));
    }, (err) => console.warn(err.message));

    // Listen to all transactions
    const unsubTx = onSnapshot(collection(db, 'transactions'), (snap) => {
      setStats(prev => ({ ...prev, totalTransactions: snap.size }));
      setLoading(false);
    }, (err) => {
      console.warn(err.message);
      setLoading(false);
    });

    return () => {
      unsubTourneys();
      unsubUsers();
      unsubPending();
      unsubTx();
    };
  }, []);

  const handleSeed = async () => {
    try {
      await seedInitialDataIfEmpty();
      toast.success('Database verified & sample matches checked.');
    } catch (e) {
      toast.error('Seed action failed: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-accent text-2xl" />
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wider glow-text-gold">
              ADMINISTRATIVE DASHBOARD
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Free Fire Esports League Management & Financial Control
          </p>
        </div>

        <button
          onClick={handleSeed}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold btn-secondary"
        >
          <FaSync />
          <span>SEED / REFRESH MOCK DATA</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gaming-card p-5 rounded-2xl border border-primary/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">REGISTERED WARRIORS</span>
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <FaUsers />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-white mt-3">
            {stats.totalUsers || 18}
          </p>
          <span className="text-[10px] font-mono text-gray-400 mt-1 block">Active Player Profiles</span>
        </div>

        <div className="gaming-card p-5 rounded-2xl border border-secondary/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">ACTIVE TOURNAMENTS</span>
            <div className="w-9 h-9 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
              <FaGamepad />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-white mt-3">
            {stats.activeTournaments || 4}
          </p>
          <span className="text-[10px] font-mono text-green-400 mt-1 block">Live / Upcoming Matches</span>
        </div>

        <div className="gaming-card p-5 rounded-2xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">PENDING PAYOUTS</span>
            <div className="w-9 h-9 rounded-xl bg-yellow-950 text-accent flex items-center justify-center">
              <FaClock />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-accent glow-text-gold mt-3">
            {stats.pendingWithdrawals}
          </p>
          <span className="text-[10px] font-mono text-yellow-400 mt-1 block">Requires Approval</span>
        </div>

        <div className="gaming-card p-5 rounded-2xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">TOTAL TRANSACTIONS</span>
            <div className="w-9 h-9 rounded-xl bg-green-950 text-green-400 flex items-center justify-center">
              <FaMoneyBillWave />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-green-400 mt-3">
            {stats.totalTransactions || 24}
          </p>
          <span className="text-[10px] font-mono text-gray-400 mt-1 block">Deposits & Entry Fees</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="font-heading font-bold text-base text-white uppercase tracking-wider mb-3">
          QUICK MANAGEMENT ACTIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/create-tournament"
            className="gaming-card p-5 rounded-2xl hover:border-primary transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(255,45,45,0.4)]">
                <FaPlusCircle />
              </div>
              <h3 className="font-heading font-bold text-sm text-white group-hover:text-primary transition-colors">
                HOST NEW TOURNAMENT
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Configure Solo/Duo/Squad scrim, entry fee & prize pool.
              </p>
            </div>
            <span className="text-xs font-mono text-primary mt-4 block">Launch Form →</span>
          </Link>

          <Link
            to="/admin/tournaments"
            className="gaming-card p-5 rounded-2xl hover:border-secondary transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(255,106,0,0.4)]">
                <FaGamepad />
              </div>
              <h3 className="font-heading font-bold text-sm text-white group-hover:text-secondary transition-colors">
                ROOM ID & CREDENTIALS
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Add Room ID, password, declare match winners & status.
              </p>
            </div>
            <span className="text-xs font-mono text-secondary mt-4 block">Manage Scrims →</span>
          </Link>

          <Link
            to="/admin/payments"
            className="gaming-card p-5 rounded-2xl hover:border-accent transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-950 text-accent flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(255,215,0,0.4)]">
                <FaMoneyBillWave />
              </div>
              <h3 className="font-heading font-bold text-sm text-white group-hover:text-accent transition-colors">
                APPROVE WITHDRAWALS
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Process player UPI payouts and view financial logs.
              </p>
            </div>
            <span className="text-xs font-mono text-accent mt-4 block">
              {stats.pendingWithdrawals > 0 ? `Review (${stats.pendingWithdrawals} Pending) →` : 'View Ledger →'}
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="gaming-card p-5 rounded-2xl hover:border-blue-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                <FaUsers />
              </div>
              <h3 className="font-heading font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                PLAYER DIRECTORY
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Search players, review UID, block or unblock rule-breakers.
              </p>
            </div>
            <span className="text-xs font-mono text-blue-400 mt-4 block">View Users →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
