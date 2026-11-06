import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaClock, FaCalendarAlt, FaCoins, FaCrosshairs } from 'react-icons/fa';
import CountdownTimer from './CountdownTimer';

const TournamentCard = ({ tournament }) => {
  const {
    id,
    title = 'Free Fire Scrims Tournament',
    mode = 'Squad',
    type = 'Paid',
    entryFee = 50,
    prizePool = 1000,
    perKillPrize = 0,
    maxPlayers = 48,
    currentPlayers = 0,
    date = '2026-11-10',
    time = '19:00',
    status = 'upcoming',
    banner = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    map = 'Bermuda'
  } = tournament;

  // Status Badge Styling
  const getStatusBadge = () => {
    switch (status?.toLowerCase()) {
      case 'live':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-heading font-bold uppercase tracking-wider bg-red-950/80 text-primary border border-primary animate-pulse">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            LIVE NOW
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-heading font-bold uppercase tracking-wider bg-gray-900 text-gray-400 border border-gray-700">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-heading font-bold uppercase tracking-wider bg-blue-950/70 text-blue-400 border border-blue-500/50">
            UPCOMING
          </span>
        );
    }
  };

  // Mode Badge Styling
  const getModeBadge = () => {
    switch (mode?.toLowerCase()) {
      case 'solo':
        return <span className="px-2 py-0.5 text-xs font-heading font-bold rounded bg-red-950/70 text-red-400 border border-red-500/40">SOLO</span>;
      case 'duo':
        return <span className="px-2 py-0.5 text-xs font-heading font-bold rounded bg-purple-950/70 text-purple-400 border border-purple-500/40">DUO</span>;
      case 'squad':
      default:
        return <span className="px-2 py-0.5 text-xs font-heading font-bold rounded bg-amber-950/70 text-orange-400 border border-orange-500/40">SQUAD</span>;
    }
  };

  const progressPercent = Math.min(100, Math.round(((currentPlayers || 0) / (maxPlayers || 48)) * 100));
  const isFilled = currentPlayers >= maxPlayers;

  // Construct target date for countdown if upcoming
  const matchDateTime = `${date}T${time || '00:00'}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="gaming-card rounded-xl overflow-hidden flex flex-col group"
    >
      {/* Banner & Floating Badges */}
      <div className="relative h-40 w-full overflow-hidden bg-black/60">
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {getModeBadge()}
          </div>
          <span className="px-2.5 py-0.5 rounded text-xs font-heading font-bold bg-black/80 backdrop-blur-md text-accent border border-accent/40 shadow-[0_0_8px_rgba(255,215,0,0.3)]">
            {map}
          </span>
        </div>

        {/* Countdown Overlay (if upcoming) */}
        {status === 'upcoming' && (
          <div className="absolute bottom-2 right-3 bg-black/85 backdrop-blur px-2.5 py-1 rounded border border-primary/30">
            <CountdownTimer targetDate={matchDateTime} compact={true} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-heading font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-secondary" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock className="text-primary" />
              <span>{time}</span>
            </div>
          </div>

          {/* Stats Bar (Prizepool, Entry, Per Kill) */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-black/60 rounded-lg border border-white/5">
            <div className="text-center">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">PRIZE POOL</span>
              <div className="font-heading font-bold text-sm text-accent glow-text-gold flex items-center justify-center gap-1">
                <FaTrophy className="text-xs text-accent" />
                <span>₹{prizePool}</span>
              </div>
            </div>

            <div className="text-center border-x border-white/10">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">ENTRY FEE</span>
              <div className="font-heading font-bold text-sm text-primary flex items-center justify-center gap-1">
                <FaCoins className="text-xs text-primary" />
                <span>{Number(entryFee) === 0 ? 'FREE' : `₹${entryFee}`}</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">PER KILL</span>
              <div className="font-heading font-bold text-sm text-secondary flex items-center justify-center gap-1">
                <FaCrosshairs className="text-xs text-secondary" />
                <span>₹{perKillPrize || Math.round(Number(entryFee) * 0.4) || 10}</span>
              </div>
            </div>
          </div>

          {/* Slot Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
              <span className="flex items-center gap-1">
                <FaUsers className="text-gray-400" />
                Slots Filled
              </span>
              <span className={isFilled ? 'text-primary font-bold' : 'text-gray-200'}>
                {currentPlayers || 0} / {maxPlayers}
              </span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 ${
                  isFilled ? 'bg-primary shadow-[0_0_8px_#ff2d2d]' : 'bg-gradient-to-r from-primary to-secondary'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-2">
          <Link
            to={`/tournaments/${id}`}
            className="block w-full py-2.5 px-4 rounded-lg text-center font-heading font-bold text-sm btn-primary"
          >
            {status === 'completed'
              ? 'VIEW RESULTS'
              : isFilled
              ? 'VIEW TOURNAMENT (FULL)'
              : 'JOIN TOURNAMENT'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;
