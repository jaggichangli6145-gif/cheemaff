import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTrophy, 
  FaCoins, 
  FaUsers, 
  FaCalendarAlt, 
  FaClock, 
  FaLock, 
  FaUnlock, 
  FaCopy, 
  FaShareAlt, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaArrowLeft,
  FaCrosshairs,
  FaGamepad
} from 'react-icons/fa';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import CountdownTimer from '../components/CountdownTimer';
import toast from 'react-hot-toast';
import { sampleTournaments } from '../utils/seedData';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, updateBalance } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [joining, setJoining] = useState(false);

  // Fetch Tournament details
  useEffect(() => {
    let unsubscribeTourney = null;
    let unsubscribeRegs = null;

    try {
      const tourneyRef = doc(db, 'tournaments', id);
      unsubscribeTourney = onSnapshot(tourneyRef, (snapshot) => {
        if (snapshot.exists()) {
          setTournament({ id: snapshot.id, ...snapshot.data() });
        } else {
          // Check fallback sample
          const sample = sampleTournaments.find(t => t.id === id) || sampleTournaments[0];
          setTournament({ id, ...sample });
        }
        setLoading(false);
      }, (error) => {
        console.warn('Tournament detail listener fallback:', error.message);
        const sample = sampleTournaments[0];
        setTournament({ id, ...sample });
        setLoading(false);
      });

      // Listen to registered players for this tournament
      const regsQuery = query(collection(db, 'registrations'), where('tournamentId', '==', id));
      unsubscribeRegs = onSnapshot(regsQuery, (snapshot) => {
        const regs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRegistrations(regs);

        if (currentUser) {
          const registered = regs.some(r => r.userId === currentUser.uid);
          setIsRegistered(registered);
        }
      }, (error) => {
        console.warn('Registrations query notice:', error.message);
      });

    } catch (err) {
      console.error(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribeTourney) unsubscribeTourney();
      if (unsubscribeRegs) unsubscribeRegs();
    };
  }, [id, currentUser]);

  // Handle Join Tournament
  const handleJoinTournament = async () => {
    if (!currentUser) {
      toast.error('Please login to register for this tournament!');
      navigate('/login', { state: { from: { pathname: `/tournaments/${id}` } } });
      return;
    }

    if (!userData?.freeFireUid) {
      toast.error('Please add your Free Fire UID in Profile before joining!');
      navigate('/profile');
      return;
    }

    if (isRegistered) {
      toast('You are already registered for this battle!', { icon: '🛡️' });
      return;
    }

    const fee = Number(tournament?.entryFee) || 0;
    const userBalance = Number(userData?.balance) || 0;

    if (fee > 0 && userBalance < fee) {
      toast.error(`Insufficient balance (₹${userBalance}). Need ₹${fee} to join!`);
      navigate('/wallet');
      return;
    }

    if ((tournament?.currentPlayers || 0) >= (tournament?.maxPlayers || 48)) {
      toast.error('This tournament is completely full!');
      return;
    }

    setJoining(true);

    try {
      // 1. Add registration record
      await addDoc(collection(db, 'registrations'), {
        tournamentId: id,
        tournamentTitle: tournament.title,
        userId: currentUser.uid,
        username: userData.username || currentUser.displayName || 'Warrior',
        freeFireUid: userData.freeFireUid,
        userAvatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
        registeredAt: serverTimestamp(),
        entryFee: fee,
        status: 'confirmed'
      });

      // 2. Increment player count in tournament
      try {
        const tourneyRef = doc(db, 'tournaments', id);
        await updateDoc(tourneyRef, {
          currentPlayers: increment(1)
        });
      } catch (err) {
        console.warn('Increment count note:', err.message);
      }

      // 3. Deduct fee and log transaction if fee > 0
      if (fee > 0) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          balance: increment(-fee)
        });

        await addDoc(collection(db, 'transactions'), {
          userId: currentUser.uid,
          type: 'tournament_fee',
          amount: fee,
          direction: 'debit',
          description: `Entry fee: ${tournament.title}`,
          tournamentId: id,
          status: 'completed',
          createdAt: serverTimestamp()
        });
      }

      // 4. Send in-app notification
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        title: 'Registration Confirmed! 🎮',
        message: `You have successfully joined "${tournament.title}". Room ID & Password are now unlocked below.`,
        type: 'tournament',
        read: false,
        createdAt: serverTimestamp()
      });

      setIsRegistered(true);
      toast.success('Registration successful! Room credentials unlocked.');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tournament?.title || 'FF ESPORTS Tournament',
          text: `Join the battle for ₹${tournament?.prizePool} on FF ESPORTS!`,
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      copyToClipboard(window.location.href, 'Tournament link');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-heading text-xs uppercase tracking-widest text-gray-400">Loading Tournament Briefing...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-heading text-white">Tournament Not Found</h2>
        <Link to="/tournaments" className="mt-4 inline-block btn-primary px-4 py-2 rounded-lg text-xs">
          Back to Tournaments
        </Link>
      </div>
    );
  }

  const matchDateTime = `${tournament.date}T${tournament.time || '00:00'}`;
  const slotsLeft = Math.max(0, (tournament.maxPlayers || 48) - (tournament.currentPlayers || registrations.length || 0));

  return (
    <div className="space-y-6 pb-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-heading font-bold text-gray-400 hover:text-white transition-colors"
        >
          <FaArrowLeft className="text-primary" />
          <span>BACK TO LOBBY</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary text-xs font-heading text-gray-300 hover:text-white transition-all"
        >
          <FaShareAlt className="text-primary" />
          <span>SHARE MATCH</span>
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden gaming-card">
        <div className="h-56 sm:h-72 w-full relative">
          <img
            src={tournament.banner || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"}
            alt={tournament.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/60 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded text-xs font-heading font-bold uppercase tracking-wider bg-black/80 text-primary border border-primary/50 shadow-[0_0_8px_rgba(255,45,45,0.4)]">
              {tournament.mode} MATCH
            </span>
            <span className="px-3 py-1 rounded text-xs font-heading font-bold uppercase tracking-wider bg-black/80 text-accent border border-accent/50 shadow-[0_0_8px_rgba(255,215,0,0.3)]">
              {tournament.map || 'Bermuda'}
            </span>
          </div>

          {/* Title & Info on Banner */}
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="font-heading font-black text-xl sm:text-3xl text-white glow-text-red">
              {tournament.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-300 mt-2">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-secondary" />
                {tournament.date}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="text-primary" />
                {tournament.time}
              </span>
              <span className="flex items-center gap-1.5">
                <FaUsers className="text-accent" />
                {slotsLeft} Slots Remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer Card */}
      <div className="p-4 rounded-xl gaming-card border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-gray-400 block">TIME UNTIL BATTLE COMMENCES</span>
          <h3 className="font-heading font-bold text-sm text-white">MATCH COUNTDOWN</h3>
        </div>
        <CountdownTimer targetDate={matchDateTime} />
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="gaming-card p-3 rounded-xl text-center">
          <span className="text-[10px] font-mono text-gray-400 block">TOTAL PRIZE POOL</span>
          <p className="font-heading font-black text-lg text-accent glow-text-gold mt-1">₹{tournament.prizePool}</p>
        </div>
        <div className="gaming-card p-3 rounded-xl text-center">
          <span className="text-[10px] font-mono text-gray-400 block">ENTRY FEE</span>
          <p className="font-heading font-black text-lg text-primary mt-1">
            {Number(tournament.entryFee) === 0 ? 'FREE' : `₹${tournament.entryFee}`}
          </p>
        </div>
        <div className="gaming-card p-3 rounded-xl text-center">
          <span className="text-[10px] font-mono text-gray-400 block">PER KILL PRIZE</span>
          <p className="font-heading font-black text-lg text-secondary mt-1">
            ₹{tournament.perKillPrize || Math.round(Number(tournament.entryFee) * 0.4) || 10}
          </p>
        </div>
        <div className="gaming-card p-3 rounded-xl text-center">
          <span className="text-[10px] font-mono text-gray-400 block">MAX CAPACITY</span>
          <p className="font-heading font-black text-lg text-white mt-1">
            {tournament.maxPlayers || 48} Players
          </p>
        </div>
      </div>

      {/* MATCH ID & PASSWORD (Registered Only Gate) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isRegistered 
          ? 'bg-gradient-to-r from-red-950/40 via-dark-700 to-black border-primary shadow-[0_0_20px_rgba(255,45,45,0.25)]' 
          : 'bg-black/60 border-white/10'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isRegistered ? (
              <FaUnlock className="text-accent text-lg" />
            ) : (
              <FaLock className="text-gray-400 text-lg" />
            )}
            <h3 className="font-heading font-bold text-base text-white uppercase tracking-wider">
              CUSTOM ROOM CREDENTIALS
            </h3>
          </div>

          {isRegistered ? (
            <span className="px-2.5 py-0.5 rounded text-[10px] font-heading font-bold bg-green-950/70 text-green-400 border border-green-500/40">
              UNLOCKED FOR YOU
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded text-[10px] font-heading font-bold bg-dark-600 text-gray-400">
              LOCKED
            </span>
          )}
        </div>

        {isRegistered ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-black/80 rounded-xl border border-primary/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 block">ROOM ID</span>
                <span className="font-heading font-black text-base text-white tracking-widest">
                  {tournament.matchId || 'ROOM-PENDING'}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(tournament.matchId || 'ROOM-PENDING', 'Room ID')}
                className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                title="Copy Room ID"
              >
                <FaCopy size={14} />
              </button>
            </div>

            <div className="p-3 bg-black/80 rounded-xl border border-primary/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 block">ROOM PASSWORD</span>
                <span className="font-heading font-black text-base text-accent tracking-widest">
                  {tournament.matchPassword || 'PASS-PENDING'}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(tournament.matchPassword || 'PASS-PENDING', 'Password')}
                className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                title="Copy Password"
              >
                <FaCopy size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs font-mono text-gray-400 max-w-md mx-auto">
              Custom Room ID and Password will automatically be revealed here immediately once you register for this tournament.
            </p>
          </div>
        )}
      </div>

      {/* Rules & Instructions */}
      <div className="gaming-card p-5 rounded-2xl">
        <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <FaShieldAlt className="text-secondary" />
          ARENA RULES & REGULATIONS
        </h3>
        <div className="text-xs text-gray-300 font-mono space-y-2 whitespace-pre-line leading-relaxed">
          {tournament.rules || `1. Mobile players only (Emulators and Tablets are strictly prohibited).
2. Teaming up with opponents, using hacks, scripts or bugs leads to permanent ban.
3. Players must join the Custom Room with the exact Free Fire UID submitted.
4. Room ID and Password will be displayed 15 minutes before match start time.
5. Screenshot / screen recording is required in case of dispute.`}
        </div>
      </div>

      {/* Registered Players List */}
      <div className="gaming-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <FaUsers className="text-accent" />
            REGISTERED WARRIORS ({registrations.length} / {tournament.maxPlayers || 48})
          </h3>
        </div>

        {registrations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
            {registrations.map((reg, index) => (
              <div
                key={reg.id || index}
                className="flex items-center gap-2.5 p-2 bg-black/60 rounded-lg border border-white/5"
              >
                <span className="font-mono text-xs text-gray-500 w-5">#{index + 1}</span>
                <img
                  src={reg.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${reg.userId}`}
                  alt={reg.username}
                  className="w-7 h-7 rounded-md border border-white/10"
                />
                <div className="overflow-hidden">
                  <span className="font-heading font-bold text-xs text-white truncate block">
                    {reg.username}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">UID: {reg.freeFireUid}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-mono text-gray-500 text-center py-4">
            No players registered yet. Be the first warrior to register!
          </p>
        )}
      </div>

      {/* Floating / Sticky Join Bar at bottom */}
      <div className="sticky bottom-16 sm:bottom-4 z-30 p-4 rounded-2xl bg-black/95 backdrop-blur-md border border-primary/40 shadow-neon-red flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-gray-400 block">ENTRY REQUIREMENT</span>
          <div className="font-heading font-black text-lg text-white">
            {Number(tournament.entryFee) === 0 ? (
              <span className="text-accent">FREE ENTRY</span>
            ) : (
              <span>₹{tournament.entryFee} <span className="text-xs text-gray-400 font-normal">/ slot</span></span>
            )}
          </div>
        </div>

        {isRegistered ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-950/80 border border-green-500 text-green-400 font-heading font-bold text-xs uppercase tracking-wider">
            <FaCheckCircle className="text-base" />
            <span>ALREADY JOINED</span>
          </div>
        ) : (
          <button
            onClick={handleJoinTournament}
            disabled={joining || slotsLeft <= 0}
            className="px-8 py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red"
          >
            {joining ? 'CONFIRMING...' : slotsLeft <= 0 ? 'SLOTS FULL' : 'JOIN TOURNAMENT NOW'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TournamentDetail;
