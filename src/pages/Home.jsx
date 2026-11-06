import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFire, 
  FaTrophy, 
  FaUsers, 
  FaCoins, 
  FaGamepad, 
  FaMedal, 
  FaBolt, 
  FaChevronRight, 
  FaChevronLeft,
  FaShieldAlt,
  FaSync
} from 'react-icons/fa';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import TournamentCard from '../components/TournamentCard';
import { sampleTournaments, sampleLeaderboard, seedInitialDataIfEmpty } from '../utils/seedData';
import toast from 'react-hot-toast';

const FEATURED_SLIDES = [
  {
    id: 1,
    title: "FREE FIRE GRAND WINTER ROYALE",
    subtitle: "Total Prize Pool: ₹50,000 | Daily Custom Rooms",
    tag: "MAJOR CHAMPIONSHIP",
    buttonText: "EXPLORE SCIRMS",
    link: "/tournaments",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "PURGATORY HEADSHOT MASTERS",
    subtitle: "₹50 Entry | ₹25 Per Kill Guaranteed",
    tag: "SOLO CLASH",
    buttonText: "JOIN NOW",
    link: "/tournaments",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "NEW PLAYER WELCOME CUP",
    subtitle: "100% Free Entry | Win Real Cash to Wallet",
    tag: "ZERO ENTRY FEE",
    buttonText: "PLAY FREE",
    link: "/tournaments",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80"
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: '14,250+',
    totalPrize: '₹2,50,000+',
    liveMatches: 3,
    completed: 480
  });

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real tournaments from Firestore
  useEffect(() => {
    // Attempt auto seed if empty
    seedInitialDataIfEmpty();

    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTournaments(list);
        const liveCount = list.filter(t => t.status === 'live').length;
        setStats(prev => ({ ...prev, liveMatches: liveCount || 2 }));
      } else {
        // Fallback to sample data if Firestore is fresh
        setTournaments(sampleTournaments);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore tournaments listener notice:", error.message);
      setTournaments(sampleTournaments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleManualSeed = async () => {
    try {
      await seedInitialDataIfEmpty();
      toast.success('Tournaments refreshed!');
    } catch (err) {
      toast.error('Check Firebase connection');
    }
  };

  const liveOrUpcoming = tournaments.filter(t => t.status !== 'completed').slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Carousel */}
      <div className="relative rounded-2xl overflow-hidden gaming-card min-h-[220px] sm:min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-64 sm:h-80 w-full"
          >
            <img
              src={FEATURED_SLIDES[currentSlide].image}
              alt={FEATURED_SLIDES[currentSlide].title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/60 to-black/30" />

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
              <span className="inline-block px-3 py-1 rounded text-[10px] font-heading font-black tracking-widest bg-primary text-white border border-primary/40 shadow-[0_0_10px_#ff2d2d] mb-2 w-max">
                {FEATURED_SLIDES[currentSlide].tag}
              </span>
              <h2 className="font-heading font-black text-xl sm:text-3xl md:text-4xl text-white tracking-wide max-w-xl glow-text-red">
                {FEATURED_SLIDES[currentSlide].title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-mono mt-1 max-w-md">
                {FEATURED_SLIDES[currentSlide].subtitle}
              </p>

              <div className="mt-4">
                <Link
                  to={FEATURED_SLIDES[currentSlide].link}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm btn-primary"
                >
                  <span>{FEATURED_SLIDES[currentSlide].buttonText}</span>
                  <FaChevronRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
          {FEATURED_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index ? 'w-6 bg-primary shadow-[0_0_8px_#ff2d2d]' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/tournaments?mode=Solo"
          className="gaming-card p-3.5 rounded-xl flex items-center gap-3 hover:border-primary transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,45,45,0.3)]">
            <FaFire className="text-lg" />
          </div>
          <div>
            <span className="font-heading font-bold text-xs text-white block">SOLO CLASH</span>
            <span className="text-[10px] text-gray-400 font-mono">Headshot Royale</span>
          </div>
        </Link>

        <Link
          to="/tournaments?mode=Squad"
          className="gaming-card p-3.5 rounded-xl flex items-center gap-3 hover:border-secondary transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-950/60 border border-secondary/40 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,106,0,0.3)]">
            <FaGamepad className="text-lg" />
          </div>
          <div>
            <span className="font-heading font-bold text-xs text-white block">SQUAD SCRIMS</span>
            <span className="text-[10px] text-gray-400 font-mono">4v4 & 48 Battle</span>
          </div>
        </Link>

        <Link
          to="/tournaments?type=Free"
          className="gaming-card p-3.5 rounded-xl flex items-center gap-3 hover:border-accent transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-yellow-950/60 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,215,0,0.3)]">
            <FaTrophy className="text-lg" />
          </div>
          <div>
            <span className="font-heading font-bold text-xs text-white block">FREE TOURNAMENTS</span>
            <span className="text-[10px] text-gray-400 font-mono">₹0 Entry • Cash Prizes</span>
          </div>
        </Link>

        <Link
          to="/leaderboard"
          className="gaming-card p-3.5 rounded-xl flex items-center gap-3 hover:border-purple-500 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <FaMedal className="text-lg" />
          </div>
          <div>
            <span className="font-heading font-bold text-xs text-white block">HALL OF FAME</span>
            <span className="text-[10px] text-gray-400 font-mono">Top Killers & Wins</span>
          </div>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 border border-primary/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center justify-center gap-1">
            <FaUsers className="text-primary text-xs" /> ACTIVE PLAYERS
          </span>
          <p className="font-heading font-black text-xl text-white mt-1">{stats.totalPlayers}</p>
        </div>
        <div className="border-l border-white/5">
          <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center justify-center gap-1">
            <FaCoins className="text-accent text-xs" /> TOTAL PRIZE POOL
          </span>
          <p className="font-heading font-black text-xl text-accent glow-text-gold mt-1">{stats.totalPrize}</p>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-white/5">
          <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center justify-center gap-1">
            <FaFire className="text-primary text-xs" /> LIVE MATCHES
          </span>
          <p className="font-heading font-black text-xl text-primary animate-pulse mt-1">{stats.liveMatches} ROOMS</p>
        </div>
        <div className="border-t sm:border-t-0 border-l border-white/5">
          <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center justify-center gap-1">
            <FaBolt className="text-secondary text-xs" /> SCRIMS COMPLETED
          </span>
          <p className="font-heading font-black text-xl text-secondary mt-1">{stats.completed}+</p>
        </div>
      </div>

      {/* Featured Tournaments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-primary rounded-full shadow-[0_0_8px_#ff2d2d]" />
            <h2 className="font-heading font-black text-xl text-white tracking-wider">
              FEATURED TOURNAMENTS
            </h2>
          </div>
          <Link
            to="/tournaments"
            className="text-xs font-heading font-bold text-primary hover:text-orange-400 flex items-center gap-1 transition-colors"
          >
            <span>VIEW ALL</span>
            <FaChevronRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 rounded-xl bg-dark-700/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveOrUpcoming.map((item) => (
              <TournamentCard key={item.id} tournament={item} />
            ))}
          </div>
        )}
      </div>

      {/* Latest Winners Marquee / Highlights */}
      <div className="gaming-card p-4 rounded-xl border border-accent/20">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <FaTrophy className="text-accent text-sm animate-pulse" />
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              RECENT TOURNAMENT CHAMPIONS
            </span>
          </div>
          <Link to="/leaderboard" className="text-[11px] font-mono text-accent hover:underline">
            View Rankings →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleLeaderboard.slice(0, 3).map((champion, idx) => (
            <div key={champion.id} className="flex items-center gap-3 p-2 bg-black/50 rounded-lg border border-white/5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-bold text-xs ${
                idx === 0 ? 'bg-accent text-black font-black' : idx === 1 ? 'bg-gray-300 text-black' : 'bg-amber-700 text-white'
              }`}>
                #{idx + 1}
              </span>
              <img src={champion.avatar} alt={champion.username} className="w-8 h-8 rounded-lg border border-white/10" />
              <div className="overflow-hidden">
                <span className="font-heading font-bold text-xs text-white truncate block">{champion.username}</span>
                <span className="text-[10px] font-mono text-accent">₹{champion.earnings.toLocaleString()} Won</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
