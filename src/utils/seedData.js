import { collection, getDocs, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export const sampleTournaments = [
  {
    title: "BERMUDA GRAND ROYALE - SQUAD SCIRMS",
    mode: "Squad",
    type: "Paid",
    entryFee: 100,
    prizePool: 3500,
    perKillPrize: 25,
    maxPlayers: 48,
    currentPlayers: 32,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: "20:00",
    status: "upcoming",
    map: "Bermuda",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
    rules: "1. Emulators strictly banned (mobile only).\n2. No hacking, scripts, or team-ups.\n3. Room ID & Password shared 15 mins before match.\n4. Screen recording mandatory for claims.",
    matchId: "ROOM-778912",
    matchPassword: "FIRE#PRO#WIN"
  },
  {
    title: "PURGATORY HEADSHOT MASTERS - SOLO",
    mode: "Solo",
    type: "Paid",
    entryFee: 50,
    prizePool: 1800,
    perKillPrize: 15,
    maxPlayers: 48,
    currentPlayers: 44,
    date: new Date(Date.now() + 43200000).toISOString().split('T')[0],
    time: "21:30",
    status: "upcoming",
    map: "Purgatory",
    banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80",
    rules: "1. Classic solo battle royale rules.\n2. Vehicle kills disallowed in final 2 circles.\n3. Ping above 200ms is player's responsibility.",
    matchId: "ROOM-992314",
    matchPassword: "SOLO#HEADSHOT"
  },
  {
    title: "KALAHARI DUO SURVIVAL LEAGUE",
    mode: "Duo",
    type: "Free",
    entryFee: 0,
    prizePool: 500,
    perKillPrize: 5,
    maxPlayers: 48,
    currentPlayers: 48,
    date: new Date(Date.now() + 1800000).toISOString().split('T')[0],
    time: "18:00",
    status: "live",
    map: "Kalahari",
    banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
    rules: "1. Free entry for all verified players.\n2. Winner takes top spot & cash voucher.",
    matchId: "ROOM-441209",
    matchPassword: "DUO#FIRE#NOW"
  },
  {
    title: "WEEKEND CLASH SQUAD CHAMPIONSHIP",
    mode: "Squad",
    type: "Paid",
    entryFee: 200,
    prizePool: 8000,
    perKillPrize: 50,
    maxPlayers: 48,
    currentPlayers: 48,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: "19:00",
    status: "completed",
    map: "Bermuda",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80",
    rules: "Tournament completed. Prize distributed.",
    matchId: "ROOM-110294",
    matchPassword: "MATCH#ENDED"
  }
];

export const sampleLeaderboard = [
  { id: 'lead_1', username: 'RAISTAR_OP', kills: 482, wins: 56, earnings: 42500, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=raistar', rank: 1 },
  { id: 'lead_2', username: 'TOTAL_GAMING_FAN', kills: 412, wins: 48, earnings: 36000, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ajju', rank: 2 },
  { id: 'lead_3', username: 'BADESAHAB_99', kills: 388, wins: 41, earnings: 28900, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bade', rank: 3 },
  { id: 'lead_4', username: 'VIPER_SNIPER', kills: 340, wins: 35, earnings: 21500, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=viper', rank: 4 },
  { id: 'lead_5', username: 'NIGHT_STALKER', kills: 310, wins: 31, earnings: 18400, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=stalker', rank: 5 },
  { id: 'lead_6', username: 'GOKU_ESPORTS', kills: 295, wins: 28, earnings: 16200, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=goku', rank: 6 }
];

export const seedInitialDataIfEmpty = async () => {
  try {
    const tourneySnap = await getDocs(collection(db, 'tournaments'));
    if (tourneySnap.empty) {
      console.log('Seeding initial tournaments into Firestore...');
      for (const t of sampleTournaments) {
        await addDoc(collection(db, 'tournaments'), {
          ...t,
          createdAt: serverTimestamp()
        });
      }
      for (const player of sampleLeaderboard) {
        await setDoc(doc(db, 'leaderboard', player.id), {
          ...player,
          createdAt: serverTimestamp()
        });
      }
      toast.success('Seeded tournaments & leaderboard data into Firestore!');
    }
  } catch (error) {
    console.warn('Seed data skipped or error (Firestore rules or network):', error.message);
  }
};
