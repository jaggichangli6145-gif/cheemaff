import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaCrosshairs, FaCoins, FaFire } from 'react-icons/fa';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { sampleLeaderboard } from '../utils/seedData';

const Leaderboard = () => {
  const [activePeriod, setActivePeriod] = useState('global'); // 'global' | 'weekly' | 'monthly'
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('kills', 'desc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((doc, idx) => ({
            id: doc.id,
            rank: idx + 1,
            ...doc.data()
          }));
          setPlayers(list);
        } else {
          setPlayers(sampleLeaderboard);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Leaderboard notice:', err.message);
        setPlayers(sampleLeaderboard);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setPlayers(sampleLeaderboard);
      setLoading(false);
    }
  }, []);

  const top3 = players.slice(0, 3);
  const remaining = players.slice(3);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaTrophy className="text-accent text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider glow-text-gold">
              LEADERBOARD OF LEGENDS
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Top Fraggers, Tournament Kings & Highest Earners
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10">
          {[
            { id: 'global', label: 'ALL TIME' },
            { id: 'monthly', label: 'MONTHLY' },
            { id: 'weekly', label: 'THIS WEEK' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePeriod(tab.id)}
              className={`px-3 py-1.5 text-xs font-heading font-bold rounded-lg transition-all ${
                activePeriod === tab.id
                  ? 'bg-primary text-white shadow-neon-red'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Display */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4 max-w-2xl mx-auto">
          {/* #2 Silver Podium */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={top3[1]?.avatar}
                alt={top3[1]?.username}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-gray-300 object-cover p-1 bg-black/60 shadow-[0_0_15px_rgba(209,213,219,0.3)]"
              />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-heading font-bold bg-gray-300 text-black shadow">
                #2
              </span>
            </div>
            <span className="font-heading font-bold text-xs sm:text-sm text-white truncate max-w-[100px] sm:max-w-none text-center">
              {top3[1]?.username}
            </span>
            <span className="text-[11px] font-mono text-accent">₹{top3[1]?.earnings?.toLocaleString()}</span>

            {/* Pillar */}
            <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-gray-800 to-gray-700/60 rounded-t-xl mt-3 flex flex-col items-center justify-center border-t-2 border-gray-300">
              <FaMedal className="text-gray-300 text-2xl" />
              <span className="text-[10px] font-mono text-gray-300 mt-1">{top3[1]?.kills} Kills</span>
            </div>
          </div>

          {/* #1 Gold Podium (Tallest) */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <FaCrown className="text-accent text-2xl drop-shadow-[0_0_10px_#ffd700] animate-bounce" />
              </div>
              <img
                src={top3[0]?.avatar}
                alt={top3[0]?.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-accent object-cover p-1 bg-black/60 shadow-[0_0_20px_rgba(255,215,0,0.5)] scale-105"
              />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-heading font-black bg-accent text-black shadow">
                #1
              </span>
            </div>
            <span className="font-heading font-black text-sm sm:text-base text-white truncate max-w-[110px] sm:max-w-none text-center glow-text-gold">
              {top3[0]?.username}
            </span>
            <span className="text-xs font-mono text-accent font-bold">₹{top3[0]?.earnings?.toLocaleString()}</span>

            {/* Pillar */}
            <div className="w-full h-32 sm:h-44 bg-gradient-to-t from-yellow-950/80 via-yellow-900/60 to-accent/30 rounded-t-xl mt-3 flex flex-col items-center justify-center border-t-2 border-accent shadow-[0_0_25px_rgba(255,215,0,0.2)]">
              <FaTrophy className="text-accent text-3xl animate-pulse" />
              <span className="text-xs font-mono text-accent font-bold mt-1">{top3[0]?.kills} KILLS</span>
              <span className="text-[10px] font-mono text-gray-300">{top3[0]?.wins} WINS</span>
            </div>
          </div>

          {/* #3 Bronze Podium */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={top3[2]?.avatar}
                alt={top3[2]?.username}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-700 object-cover p-1 bg-black/60 shadow-[0_0_15px_rgba(180,83,9,0.3)]"
              />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-heading font-bold bg-amber-700 text-white shadow">
                #3
              </span>
            </div>
            <span className="font-heading font-bold text-xs sm:text-sm text-white truncate max-w-[100px] sm:max-w-none text-center">
              {top3[2]?.username}
            </span>
            <span className="text-[11px] font-mono text-accent">₹{top3[2]?.earnings?.toLocaleString()}</span>

            {/* Pillar */}
            <div className="w-full h-20 sm:h-28 bg-gradient-to-t from-amber-950 to-amber-900/40 rounded-t-xl mt-3 flex flex-col items-center justify-center border-t-2 border-amber-700">
              <FaMedal className="text-amber-600 text-2xl" />
              <span className="text-[10px] font-mono text-gray-300 mt-1">{top3[2]?.kills} Kills</span>
            </div>
          </div>
        </div>
      )}

      {/* Remaining Leaderboard Table */}
      <div className="gaming-card rounded-2xl overflow-hidden border border-white/10">
        <div className="p-4 bg-black/80 border-b border-white/10 flex items-center justify-between text-xs font-heading uppercase text-gray-400">
          <span>RANK & WARRIOR</span>
          <div className="flex items-center gap-6 sm:gap-12">
            <span>KILLS</span>
            <span>WINS</span>
            <span>PRIZE EARNED</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {remaining.map((player) => (
            <div
              key={player.id}
              className="p-3 sm:p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-heading font-black text-xs sm:text-sm text-gray-400 w-6">
                  #{player.rank}
                </span>
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-9 h-9 rounded-xl border border-white/10 object-cover"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">{player.username}</h4>
                  <span className="text-[10px] font-mono text-gray-400">Pro Verified</span>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:gap-12 font-mono text-xs sm:text-sm">
                <span className="text-white w-8 text-right">{player.kills}</span>
                <span className="text-secondary w-8 text-right">{player.wins}</span>
                <span className="text-accent font-bold w-16 text-right">
                  ₹{player.earnings?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
