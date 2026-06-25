'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  useFreighterWallet,
  useContractBalanceData,
  useAllPendingLoans,
  useAllCircles,
  useDepositLiquidity,
  useApproveLoan,
  useSetDemoMode,
  useWithdraw,
  usePenalizeDefault,
  useUnfreezeAccount,
  useSetDemoLoanDuration,
} from '@/src/hooks/useStellar';
import { formatXlm, stroopsToXlm, CONTRACT_CONFIG } from '@/config/stellarConfig';
import type { Loan } from '@/src/lib/stellar';

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isConnected, publicKey, isAdmin } = useFreighterWallet();
  
  const { balance: contractBalance, refetch: refetchBalance } = useContractBalanceData(publicKey);
  const { loans: pendingLoans, refetch: refetchLoans } = useAllPendingLoans(publicKey);
  const { circles } = useAllCircles(publicKey);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchBalance();
      refetchLoans();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchBalance, refetchLoans]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at top left, rgba(255,100,40,0.3) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(255,100,40,0.3) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <Navbar />
        <div className="flex items-center justify-center relative z-10" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20 max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">Admin Panel</h1>
            <p className="text-white/80 mb-6">Connect your Freighter wallet to access the admin dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at top left, rgba(255,100,40,0.3) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(255,100,40,0.3) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <Navbar />
        <div className="flex items-center justify-center relative z-10" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20 max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-white/80 mb-6">You are not authorized to access this page.</p>
            <p className="text-sm text-white/60 mb-2">Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</p>
            <p className="text-sm text-white/40">Required: {CONTRACT_CONFIG.adminAddress.slice(0, 8)}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes floatDots {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
            50% { transform: translate(var(--random-x-50), var(--random-y-50)) rotate(180deg); opacity: 0.45; }
            100% { transform: translate(var(--random-x-100), var(--random-y-100)) rotate(360deg); opacity: 0.3; }
          }
          .floating-dot {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.45);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
            pointer-events: none;
          }
        `}
      </style>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Orange Glows */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
        <div className="absolute top-[40%] right-[10%] w-[550px] h-[550px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.28) 0%, transparent 60%)', filter: 'blur(70px)', zIndex: 1 }} />
        <div className="absolute bottom-[15%] left-[45%] w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.25) 0%, transparent 60%)', filter: 'blur(68px)', zIndex: 1 }} />

        {/* Floating Dots */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
          {isMounted && Array.from({ length: 30 }).map((_, i) => {
            const size = Math.random() * 3 + 2.5;
            const radius = Math.random() * 200 + 100;
            return (
              <div key={i} className="floating-dot" style={{
                width: `${size}px`, height: `${size}px`,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                '--random-x-50': `${Math.random() * radius - radius/2}px`,
                '--random-y-50': `${Math.random() * radius - radius/2}px`,
                '--random-x-100': `${Math.random() * radius - radius/2}px`,
                '--random-y-100': `${Math.random() * radius - radius/2}px`,
                animation: `floatDots ${Math.random() * 25 + 20}s linear infinite`,
                animationDelay: `${-Math.random() * 45}s`
              } as React.CSSProperties} />
            );
          })}
        </div>

        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ paddingTop: '180px', zIndex: 10 }}>
          
          {/* Contract Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard 
              title="Contract Balance" 
              value={`${formatXlm(contractBalance)} XLM`}
              description="Available liquidity"
            />
            <StatCard 
              title="Pending Loans" 
              value={pendingLoans.length.toString()}
              description="Awaiting approval"
            />
            <StatCard 
              title="Trust Circles" 
              value={circles.length.toString()}
              description="Active circles"
            />
          </div>

          {/* Liquidity & Demo Mode */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DepositLiquidityForm
              publicKey={publicKey!}
              onSuccess={() => refetchBalance()}
            />
            <DemoModeToggle publicKey={publicKey!} />
          </div>

          {/* Withdraw & Penalize Default */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <WithdrawForm
              publicKey={publicKey!}
              onSuccess={() => refetchBalance()}
            />
            <PenalizeDefaultForm publicKey={publicKey!} />
          </div>

          {/* Unfreeze Account & Demo Loan Duration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <UnfreezeAccountForm publicKey={publicKey!} />
            <SetDemoLoanDurationForm publicKey={publicKey!} />
          </div>

          {/* Pending Loan Approvals */}
          <div className="mb-6">
            <PendingApprovals
              loans={pendingLoans}
              publicKey={publicKey!}
              onSuccess={() => {
                refetchLoans();
                refetchBalance();
              }}
            />
          </div>

          {/* All Circles */}
          <div className="mb-[100px]">
            <AllCircles circles={circles} />
          </div>

        </main>
      </div>
    </>
  );
}

// Stat Card Component
function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-white/70 text-base mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/50 text-xs">{description}</p>
    </div>
  );
}

// Deposit Liquidity Form
function DepositLiquidityForm({ publicKey, onSuccess }: { publicKey: string; onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const { depositLiquidity, isPending, isSuccess, error } = useDepositLiquidity();

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      onSuccess();
      alert('Liquidity deposited successfully!');
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    depositLiquidity(publicKey, parseFloat(amount));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Deposit Liquidity</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-white/60 mb-2 block">Amount (XLM)</label>
          <input
            type="number"
            step="1"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in XLM"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-500/90 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {isPending ? 'Depositing...' : 'Deposit'}
        </button>
      </form>
    </div>
  );
}

// Demo Mode Toggle
function DemoModeToggle({ publicKey }: { publicKey: string }) {
  const [demoEnabled, setDemoEnabled] = useState(false);
  const { setDemoMode, isPending, isSuccess, error } = useSetDemoMode();

  useEffect(() => {
    if (isSuccess) {
      alert(`Demo mode ${demoEnabled ? 'enabled' : 'disabled'}!`);
    }
  }, [isSuccess, demoEnabled]);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleToggle = () => {
    const newState = !demoEnabled;
    setDemoEnabled(newState);
    setDemoMode(publicKey, newState);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Demo Mode</h3>
      <p className="text-white/60 text-sm mb-4">
        When enabled, loans have a 10-minute duration instead of 7 days for testing.
      </p>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 ${
          demoEnabled 
            ? 'bg-red-500/90 hover:bg-red-500 text-white' 
            : 'bg-yellow-500/90 hover:bg-yellow-500 text-black'
        }`}
      >
        {isPending ? 'Updating...' : demoEnabled ? 'Disable Demo Mode' : 'Enable Demo Mode'}
      </button>
    </div>
  );
}

// Pending Loan Approvals
function PendingApprovals({ loans, publicKey, onSuccess }: { 
  loans: Loan[]; 
  publicKey: string;
  onSuccess: () => void;
}) {
  const { approveLoan, isPending, isSuccess, error } = useApproveLoan();
  const [approvingId, setApprovingId] = useState<number | null>(null);

  useEffect(() => {
    if (isSuccess) {
      setApprovingId(null);
      onSuccess();
      alert('Loan approved and disbursed!');
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (error) {
      setApprovingId(null);
      alert(error);
    }
  }, [error]);

  const handleApprove = (loanId: number) => {
    setApprovingId(loanId);
    approveLoan(publicKey, loanId);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Pending Loan Approvals</h3>
      
      {loans.length === 0 ? (
        <p className="text-white/60 text-center py-8">No pending loans</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 pb-3 text-sm">ID</th>
                <th className="text-left text-white/60 pb-3 text-sm">Borrower</th>
                <th className="text-left text-white/60 pb-3 text-sm">Amount</th>
                <th className="text-left text-white/60 pb-3 text-sm">Purpose</th>
                <th className="text-right text-white/60 pb-3 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id} className="border-b border-white/10">
                  <td className="py-4 text-white">{loan.id}</td>
                  <td className="py-4 text-white/80 text-sm font-mono">
                    {loan.borrower.slice(0, 6)}...{loan.borrower.slice(-6)}
                  </td>
                  <td className="py-4 text-white">{formatXlm(loan.amount)} XLM</td>
                  <td className="py-4 text-white/80 text-sm truncate max-w-[200px]">{loan.purpose}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleApprove(loan.id)}
                      disabled={isPending && approvingId === loan.id}
                      className="bg-green-500/90 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                    >
                      {isPending && approvingId === loan.id ? 'Approving...' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Withdraw Form — calls contract "withdraw"
function WithdrawForm({ publicKey, onSuccess }: { publicKey: string; onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const { withdraw, isPending, isSuccess, error } = useWithdraw();

  useEffect(() => {
    if (isSuccess) { setAmount(''); onSuccess(); alert('Withdrawal successful!'); }
  }, [isSuccess, onSuccess]);

  useEffect(() => { if (error) alert(error); }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { alert('Enter a valid amount'); return; }
    withdraw(publicKey, parseFloat(amount));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Withdraw Funds</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-white/60 mb-2 block">Amount (XLM)</label>
          <input type="number" step="1" min="1" value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount in XLM"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500/90 hover:bg-orange-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">
          {isPending ? 'Withdrawing...' : 'Withdraw'}
        </button>
      </form>
    </div>
  );
}

// Penalize Default Form — calls contract "penalize_default"
function PenalizeDefaultForm({ publicKey }: { publicKey: string }) {
  const [loanId, setLoanId] = useState('');
  const { penalizeDefault, isPending, isSuccess, error } = usePenalizeDefault();

  useEffect(() => {
    if (isSuccess) { setLoanId(''); alert('Default penalty applied!'); }
  }, [isSuccess]);

  useEffect(() => { if (error) alert(error); }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId || parseInt(loanId) <= 0) { alert('Enter a valid loan ID'); return; }
    penalizeDefault(publicKey, parseInt(loanId));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Penalize Default</h3>
      <p className="text-white/60 text-sm mb-4">Reduce trust score for an overdue loan borrower.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-white/60 mb-2 block">Loan ID</label>
          <input type="number" min="1" value={loanId}
            onChange={(e) => setLoanId(e.target.value)} placeholder="Enter loan ID"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full bg-red-500/90 hover:bg-red-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">
          {isPending ? 'Applying...' : 'Penalize Default'}
        </button>
      </form>
    </div>
  );
}

// Unfreeze Account Form — calls contract "unfreeze_account"
function UnfreezeAccountForm({ publicKey }: { publicKey: string }) {
  const [userAddress, setUserAddress] = useState('');
  const { unfreezeAccount, isPending, isSuccess, error } = useUnfreezeAccount();

  useEffect(() => {
    if (isSuccess) { setUserAddress(''); alert('Account unfrozen!'); }
  }, [isSuccess]);

  useEffect(() => { if (error) alert(error); }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress.trim()) { alert('Enter a valid Stellar address'); return; }
    unfreezeAccount(publicKey, userAddress.trim());
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Unfreeze Account</h3>
      <p className="text-white/60 text-sm mb-4">Re-enable a previously penalized account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-white/60 mb-2 block">User Address</label>
          <input type="text" value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)} placeholder="G..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 font-mono text-sm" />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full bg-blue-500/90 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">
          {isPending ? 'Unfreezing...' : 'Unfreeze Account'}
        </button>
      </form>
    </div>
  );
}

// Set Demo Loan Duration Form — calls contract "set_demo_loan_duration"
function SetDemoLoanDurationForm({ publicKey }: { publicKey: string }) {
  const [duration, setDuration] = useState('');
  const { setDemoLoanDuration, isPending, isSuccess, error } = useSetDemoLoanDuration();

  useEffect(() => {
    if (isSuccess) { setDuration(''); alert('Demo loan duration updated!'); }
  }, [isSuccess]);

  useEffect(() => { if (error) alert(error); }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || parseInt(duration) <= 0) { alert('Enter a valid ledger count'); return; }
    setDemoLoanDuration(publicKey, parseInt(duration));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Demo Loan Duration</h3>
      <p className="text-white/60 text-sm mb-4">Set loan duration in ledgers for demo mode (~5 sec/ledger).</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-white/60 mb-2 block">Duration (ledgers)</label>
          <input type="number" min="1" value={duration}
            onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 120 (~10 min)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full bg-purple-500/90 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">
          {isPending ? 'Updating...' : 'Set Duration'}
        </button>
      </form>
    </div>
  );
}

// All Circles Display
function AllCircles({ circles }: { circles: any[] }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">All Trust Circles</h3>
      
      {circles.length === 0 ? (
        <p className="text-white/60 text-center py-8">No circles created yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {circles.map((circle, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-semibold truncate">{circle.name}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  circle.isActive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {circle.isActive ? 'Active' : 'Pending'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-white/60">Members</p>
                  <p className="text-white">{circle.memberCount}</p>
                </div>
                <div>
                  <p className="text-white/60">Avg Score</p>
                  <p className="text-white">{circle.averageScore}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white/60">Total Stake</p>
                  <p className="text-white">{formatXlm(circle.totalStake)} XLM</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
