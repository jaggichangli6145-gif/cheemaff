import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaCalendarAlt, FaClock, FaTrophy, FaCrosshairs, FaCheckCircle, FaLockOpen } from 'react-icons/fa';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import CountdownTimer from '../components/CountdownTimer';

const MyMatches = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'live' | 'completed'
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Query registrations by this user
    const q = query(collection(db, 'registrations'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, async (regSnap) => {
      const matchPromises = regSnap.docs.map(async (regDoc) => {
        const regData = regDoc.data();
        let tourneyData = {};
        try {
          const tDoc = await getDoc(doc(db, 'tournaments', regData.tournamentId));
          if (tDoc.exists()) {
            tourneyData = tDoc.data();
          }
        } catch (e) {
          console.warn('Error fetching match tourney info:', e);
        }

        return {
          registrationId: regDoc.id,
          ...regData,
          tournament: {
            id: regData.tournamentId,
            title: regData.tournamentTitle || tourneyData.title || 'Free Fire Tournament',
            ...tourneyData
          }
        };
      });

      const fullMatches = await Promise.all(matchPromises);
      setMatches(fullMatches);
      setLoading(false);
    }, (error) => {
      console.warn("My matches query notice:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filter matches by tournament status
  const filteredMatches = matches.filter((item) => {
    const status = item.tournament?.status || 'upcoming';
    if (activeTab === 'upcoming') return status === 'upcoming';
    if (activeTab === 'live') return status === 'live';
    if (activeTab === 'completed') return status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaGamepad className="text-primary text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">
              MY MATCHES
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Your Tournament Registrations & Battle History
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/60 p-1.5 rounded-xl border border-white/10">
        {[
          { id: 'upcoming', label: 'UPCOMING MATCHES' },
          { id: 'live', label: '🔴 LIVE NOW' },
          { id: 'completed', label: 'COMPLETED / RESULTS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-heading font-bold rounded-lg transition-all text-center uppercase tracking-wider ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_12px_rgba(255,45,45,0.5)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-dark-700/40 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="space-y-4">
          {filteredMatches.map((item) => {
            const t = item.tournament;
            const matchDateTime = `${t.date}T${t.time || '00:00'}`;

            return (
              <div key={item.registrationId} className="gaming-card p-5 rounded-2xl border border-primary/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
                        {t.mode || 'Squad'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider bg-black text-accent border border-accent/40">
                        {t.map || 'Bermuda'}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white mt-1">
                      {t.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                      <FaCalendarAlt className="text-secondary" /> {t.date}
                    </span>
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                      <FaClock className="text-primary" /> {t.time}
                    </span>
                  </div>
                </div>

                {/* Match Credentials / Results Bar */}
                {activeTab === 'completed' ? (
                  <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FaTrophy className="text-accent text-lg" />
                      <div>
                        <span className="text-[10px] font-mono uppercase text-gray-400 block">FINAL POSITION</span>
                        <span className="font-heading font-black text-sm text-accent">
                          {item.position ? `#${item.position} Place` : 'Rank Pending'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-gray-400 block">KILLS SCORED</span>
                      <span className="font-heading font-bold text-sm text-white">
                        {item.kills || 0} Kills
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-gray-400 block">PRIZE EARNED</span>
                      <span className="font-heading font-bold text-sm text-green-400">
                        ₹{item.prizeEarned || 0}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-black/80 rounded-xl border border-primary/40 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FaLockOpen className="text-accent text-base" />
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[9px] font-mono text-gray-400 block">ROOM ID</span>
                          <span className="font-heading font-bold text-sm text-white tracking-widest">
                            {t.matchId || 'SHOWN 15M BEFORE'}
                          </span>
                        </div>
                        <div className="border-l border-white/20 pl-4">
                          <span className="text-[9px] font-mono text-gray-400 block">PASSWORD</span>
                          <span className="font-heading font-bold text-sm text-accent tracking-widest">
                            {t.matchPassword || '••••••••'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'upcoming' && (
                      <CountdownTimer targetDate={matchDateTime} compact={true} />
                    )}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="text-xs font-mono text-gray-400">
                    UID: <span className="text-white font-bold">{item.freeFireUid}</span>
                  </div>
                  <Link
                    to={`/tournaments/${t.id}`}
                    className="px-4 py-1.5 rounded-lg font-heading text-xs font-bold btn-primary"
                  >
                    ROOM DETAILS →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 gaming-card rounded-2xl border-dashed border-white/10">
          <FaGamepad className="text-gray-600 text-5xl mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-white">
            No {activeTab} Matches Found
          </h3>
          <p className="text-xs font-mono text-gray-400 mt-1 max-w-sm mx-auto">
            You haven't registered for any {activeTab} matches yet. Join a tournament to see it here!
          </p>
          <Link
            to="/tournaments"
            className="mt-4 inline-block btn-primary px-6 py-2.5 rounded-xl text-xs font-heading font-bold"
          >
            BROWSE TOURNAMENTS
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyMatches;
