import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaTrophy, FaFire } from 'react-icons/fa';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import TournamentCard from '../components/TournamentCard';
import { sampleTournaments } from '../utils/seedData';

const Tournaments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState(searchParams.get('mode') || 'All');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');

  // Sync state with URL params
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const typeParam = searchParams.get('type');
    const statusParam = searchParams.get('status');
    if (modeParam) setSelectedMode(modeParam);
    if (typeParam) setSelectedType(typeParam);
    if (statusParam) setSelectedStatus(statusParam);
  }, [searchParams]);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTournaments(list);
      } else {
        setTournaments(sampleTournaments);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore tournaments error:", error.message);
      setTournaments(sampleTournaments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter logic
  const filteredTournaments = tournaments.filter(t => {
    // Search matching
    const matchesSearch = 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.map?.toLowerCase().includes(searchQuery.toLowerCase());

    // Mode matching
    const matchesMode = selectedMode === 'All' || t.mode?.toLowerCase() === selectedMode.toLowerCase();

    // Type matching (Free vs Paid)
    const matchesType = 
      selectedType === 'All' || 
      (selectedType === 'Free' && (Number(t.entryFee) === 0 || t.type?.toLowerCase() === 'free')) ||
      (selectedType === 'Paid' && (Number(t.entryFee) > 0 || t.type?.toLowerCase() === 'paid'));

    // Status matching
    const matchesStatus = selectedStatus === 'All' || t.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesMode && matchesType && matchesStatus;
  });

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setSearchParams(prev => {
      if (mode === 'All') prev.delete('mode');
      else prev.set('mode', mode);
      return prev;
    });
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSearchParams(prev => {
      if (type === 'All') prev.delete('type');
      else prev.set('type', type);
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaTrophy className="text-primary text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">
              TOURNAMENT ARENA
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Official Free Fire Scrims, Customs & Tournaments
          </p>
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tournament or map..."
            className="w-full pl-10 pr-4 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        {/* Game Mode Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-heading text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
            MODE:
          </span>
          {['All', 'Solo', 'Duo', 'Squad'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-4 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                selectedMode.toLowerCase() === mode.toLowerCase()
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(255,45,45,0.6)]'
                  : 'bg-dark-700/80 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {mode}
            </button>
          ))}

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Type Filter (All, Free, Paid) */}
          {['All', 'Paid', 'Free'].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                selectedType.toLowerCase() === type.toLowerCase()
                  ? 'bg-secondary text-white shadow-[0_0_12px_rgba(255,106,0,0.6)]'
                  : 'bg-dark-700/80 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {type === 'Free' ? '🎁 Free Entry' : type}
            </button>
          ))}
        </div>

        {/* Status Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-heading text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
            STATUS:
          </span>
          {['All', 'Upcoming', 'Live', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded text-[11px] font-heading font-semibold uppercase tracking-wider transition-all ${
                selectedStatus.toLowerCase() === status.toLowerCase()
                  ? 'bg-white/20 text-white border border-white/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-dark-700/40 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 gaming-card rounded-2xl border-dashed border-white/10">
          <FaFire className="text-gray-600 text-4xl mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-white">No Tournaments Match Your Filter</h3>
          <p className="text-xs font-mono text-gray-400 mt-1 max-w-sm mx-auto">
            Try resetting your filters or search term to discover available scrims and championships.
          </p>
          <button
            onClick={() => {
              setSelectedMode('All');
              setSelectedType('All');
              setSelectedStatus('All');
              setSearchQuery('');
              setSearchParams({});
            }}
            className="mt-4 px-4 py-2 rounded-lg font-heading text-xs font-bold btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
