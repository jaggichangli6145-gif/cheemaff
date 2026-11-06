import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaHistory, 
  FaArrowDown,
  FaArrowUp,
  FaFilter
} from 'react-icons/fa';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const ManagePayments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('pending'); // 'pending' | 'all' | 'deposits' | 'withdrawals'
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(list);
      setLoading(false);
    }, (err) => {
      console.warn('Transactions listener notice:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Approve Withdrawal
  const handleApproveWithdrawal = async (tx) => {
    setProcessingId(tx.id);
    try {
      // 1. Mark transaction completed
      await updateDoc(doc(db, 'transactions', tx.id), {
        status: 'completed',
        approvedAt: serverTimestamp()
      });

      // 2. Notify player
      await addDoc(collection(db, 'notifications'), {
        userId: tx.userId,
        title: 'Payout Processed! 💸',
        message: `Your withdrawal of ₹${tx.amount} to UPI (${tx.upiId}) has been successfully approved and dispatched.`,
        type: 'payment',
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success(`Withdrawal of ₹${tx.amount} marked as APPROVED!`);
    } catch (err) {
      toast.error('Failed to approve transaction.');
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Withdrawal (Refunds back to user balance)
  const handleRejectWithdrawal = async (tx) => {
    if (!window.confirm(`Reject withdrawal and refund ₹${tx.amount} to ${tx.username || 'user'}?`)) return;

    setProcessingId(tx.id);
    try {
      // 1. Mark transaction rejected
      await updateDoc(doc(db, 'transactions', tx.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });

      // 2. Refund balance back to user
      await updateDoc(doc(db, 'users', tx.userId), {
        balance: increment(tx.amount)
      });

      // 3. Notify player
      await addDoc(collection(db, 'notifications'), {
        userId: tx.userId,
        title: 'Withdrawal Request Declined ⚠️',
        message: `Your withdrawal request of ₹${tx.amount} was rejected. Funds have been refunded to your wallet. Reason: Invalid UPI or verification issue.`,
        type: 'payment',
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success(`Withdrawal rejected & ₹${tx.amount} refunded to player wallet.`);
    } catch (err) {
      toast.error('Failed to reject transaction.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  const filteredList = transactions.filter(t => {
    if (filterType === 'pending') return t.type === 'withdrawal' && t.status === 'pending';
    if (filterType === 'withdrawals') return t.type === 'withdrawal';
    if (filterType === 'deposits') return t.type === 'deposit';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-accent text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider glow-text-gold">
              PAYMENTS & WITHDRAWAL QUEUE
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Review UPI Payout Requests & Financial Audit Trail
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10">
          {[
            { id: 'pending', label: `Pending (${pendingWithdrawals.length})` },
            { id: 'withdrawals', label: 'All Withdrawals' },
            { id: 'deposits', label: 'Deposits' },
            { id: 'all', label: 'All Logs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-heading font-bold rounded-lg transition-all ${
                filterType === tab.id
                  ? 'bg-accent text-black font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-dark-700/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredList.length > 0 ? (
        <div className="space-y-3">
          {filteredList.map((tx) => {
            const isPendingWithdrawal = tx.type === 'withdrawal' && tx.status === 'pending';

            return (
              <div
                key={tx.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isPendingWithdrawal
                    ? 'bg-yellow-950/20 border-accent/50 shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                    : 'bg-black/60 border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
                    tx.type === 'deposit'
                      ? 'bg-green-950 text-green-400 border border-green-500/40'
                      : 'bg-red-950 text-red-400 border border-red-500/40'
                  }`}>
                    {tx.type === 'deposit' ? <FaArrowUp /> : <FaArrowDown />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-sm text-white">
                        {tx.type === 'withdrawal' ? 'Withdrawal Request' : 'Deposit Added'}
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        tx.status === 'completed'
                          ? 'bg-green-950 text-green-400'
                          : tx.status === 'rejected'
                          ? 'bg-red-950 text-red-400'
                          : 'bg-yellow-950 text-accent animate-pulse border border-accent/40'
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-gray-300 mt-0.5">
                      {tx.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-400 mt-1">
                      {tx.upiId && (
                        <span>UPI: <strong className="text-accent">{tx.upiId}</strong></span>
                      )}
                      <span>Time: {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString('en-IN') : 'Just now'}</span>
                      {tx.userId && <span>User ID: {tx.userId.slice(0, 8)}...</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                  <span className={`font-heading font-black text-xl ${
                    tx.type === 'deposit' ? 'text-green-400' : 'text-primary'
                  }`}>
                    ₹{tx.amount}
                  </span>

                  {isPendingWithdrawal && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveWithdrawal(tx)}
                        disabled={processingId === tx.id}
                        className="px-3.5 py-2 rounded-lg bg-green-950/80 border border-green-500 text-green-400 hover:bg-green-600 hover:text-black font-heading text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <FaCheckCircle />
                        <span>APPROVE</span>
                      </button>

                      <button
                        onClick={() => handleRejectWithdrawal(tx)}
                        disabled={processingId === tx.id}
                        className="px-3.5 py-2 rounded-lg bg-red-950/80 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white font-heading text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <FaTimesCircle />
                        <span>REJECT</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 gaming-card rounded-2xl border-dashed border-white/10">
          <FaCheckCircle className="text-accent text-4xl mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-white">No Pending Payments in Queue</h3>
          <p className="text-xs font-mono text-gray-400 mt-1">
            All user payouts have been reviewed and processed.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;
