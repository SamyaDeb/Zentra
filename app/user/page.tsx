'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  useFreighterWallet,
  useUserStats,
  useCircleDetails,
  useUserLoansData,
  useCreateCircle,
  useJoinCircle,
  useRequestLoan,
  useRepayLoan,
  useAllCircles,
} from '@/src/hooks/useStellar';
import { formatXlm, stroopsToXlm, ledgersToTime } from '@/config/stellarConfig';
import type { Loan } from '@/src/lib/stellar';

export default function UserPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isConnected, publicKey } = useFreighterWallet();
  
  // Fetch user stats
  const { stats, refetch: refetchStats } = useUserStats(publicKey);
  const { loans: userLoans, refetch: refetchLoans } = useUserLoansData(publicKey);
  const { circles } = useAllCircles(publicKey);
  
  // Get circle details if user is in a circle
  const userCircleId = stats?.circleId || 0;
  const { circle: circleDetails, refetch: refetchCircle } = useCircleDetails(publicKey, userCircleId > 0 ? userCircleId : null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchLoans();
      if (userCircleId > 0) {
        refetchCircle();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchLoans, refetchCircle, userCircleId]);

  if (!isConnected) {
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
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
          {/* Orange Glows */}
          <div className="absolute -top-32 -left-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
          <div className="absolute -top-32 -right-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
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
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20 max-w-md" style={{ zIndex: 10 }}>
            <h1 className="text-3xl font-bold text-white mb-4">User Dashboard</h1>
            <p className="text-white/80 mb-6">Connect your Freighter wallet to access your loans</p>
          </div>
        </div>
      </>
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
          
          {/* Trust Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <ScoreCard 
              title="Individual Score" 
              score={stats?.individualScore || 50} 
              color="blue"
              description="Your personal credit score"
            />
            <ScoreCard 
              title="Circle Score" 
              score={circleDetails?.averageScore || 50} 
              color="purple"
              description="Your circle's average"
            />
            <ScoreCard 
              title="Final Trust Score" 
              score={stats?.finalTrustScore || 50} 
              color="orange"
              description="Individual×60% + Circle×40%"
            />
          </div>

          {/* Circle Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CircleManagement 
              stats={stats}
              circleDetails={circleDetails}
              circleCount={circles.length}
              publicKey={publicKey!}
              onSuccess={() => {
                refetchStats();
                refetchCircle();
              }}
            />
            
            <LoanEligibility stats={stats} />
          </div>

          {/* Loan Request */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RequestLoanForm
              stats={stats}
              publicKey={publicKey!}
              onSuccess={() => {
                refetchStats();
                refetchLoans();
              }}
            />
            
            <ActiveLoan 
              loans={userLoans}
              publicKey={publicKey!}
              onRepaySuccess={() => {
                refetchStats();
                refetchLoans();
              }}
            />
          </div>

          {/* Loan History */}
          <div className="mb-[100px]">
            <LoanHistory loans={userLoans} />
          </div>

        </main>
      </div>
    </>
  );
}

// Score Card Component
function ScoreCard({ title, score, color, description }: { title: string; score: number; color: string; description: string }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-md rounded-lg p-6 border`}>
      <h3 className="text-white/70 text-base mb-2">{title}</h3>
      <p className="text-4xl font-bold text-white mb-1">{score}</p>
      <p className="text-white/50 text-xs">{description}</p>
    </div>
  );
}

// Circle Management Component
function CircleManagement({ stats, circleDetails, circleCount, publicKey, onSuccess }: {
  stats: any;
  circleDetails: any;
  circleCount: number;
  publicKey: string;
  onSuccess: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleIdToJoin, setCircleIdToJoin] = useState('');
  
  const { createCircle, isPending: isCreating, isSuccess: createSuccess, error: createError } = useCreateCircle();
  const { joinCircle, isPending: isJoining, isSuccess: joinSuccess, error: joinError } = useJoinCircle();

  useEffect(() => {
    if (createSuccess || joinSuccess) {
      onSuccess();
      setShowCreate(false);
      setShowJoin(false);
      setCircleName('');
      setCircleIdToJoin('');
      alert(createSuccess ? 'Circle created!' : 'Joined circle!');
    }
  }, [createSuccess, joinSuccess, onSuccess]);

  useEffect(() => {
    if (createError || joinError) {
      alert(createError || joinError);
    }
  }, [createError, joinError]);

  const handleCreate = () => {
    if (!circleName.trim()) {
      alert('Please enter a circle name');
      return;
    }
    createCircle(publicKey, circleName);
  };

  const handleJoin = () => {
    if (!circleIdToJoin || Number(circleIdToJoin) <= 0) {
      alert('Please enter a valid circle ID');
      return;
    }
    joinCircle(publicKey, Number(circleIdToJoin));
  };

  const hasCircle = stats?.circleId > 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 h-[220px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-3">Trust Circle</h3>
      
      {hasCircle ? (
        <div className="bg-white/5 p-3 rounded-lg flex-1 grid grid-cols-2 gap-3">
          <div>
            <p className="text-white/60 text-sm mb-1">Circle ID</p>
            <p className="text-white text-xl font-bold">{stats.circleId}</p>
          </div>
          
          {circleDetails && (
            <>
              <div>
                <p className="text-white/60 text-sm mb-1">Circle Score</p>
                <p className="text-white text-xl font-bold">{circleDetails.averageScore}</p>
              </div>
              
              <div>
                <p className="text-white/60 text-sm mb-1">Name</p>
                <p className="text-white text-base truncate">{circleDetails.name}</p>
              </div>
              
              <div>
                <p className="text-white/60 text-sm mb-1">Members</p>
                <p className="text-white text-base">{circleDetails.memberCount} / 3+</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="text-white/60 text-sm mb-3">Join or create a Trust Circle to unlock loans (10 XLM stake)</p>
          
          {!showCreate && !showJoin && (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <button
                onClick={() => setShowCreate(true)}
                className="w-full bg-white/90 hover:bg-white text-black py-2 text-sm rounded-lg font-semibold transition"
              >
                Create Circle (10 XLM)
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2 text-sm rounded-lg font-semibold transition border border-white/20"
              >
                Join Existing Circle
              </button>
              <p className="text-xs text-white/40 text-center mt-1">Total Circles: {circleCount}</p>
            </div>
          )}

          {showCreate && (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <input
                type="text"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
                placeholder="Enter circle name"
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 bg-white/90 hover:bg-white text-black py-2 text-sm rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 text-sm rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showJoin && (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <input
                type="number"
                value={circleIdToJoin}
                onChange={(e) => setCircleIdToJoin(e.target.value)}
                placeholder="Enter circle ID"
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="flex-1 bg-white/90 hover:bg-white text-black py-2 text-sm rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
                <button
                  onClick={() => setShowJoin(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 text-sm rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Loan Eligibility Component
function LoanEligibility({ stats }: { stats: any }) {
  const hasCircle = stats?.circleId > 0;
  
  const maxLoan = stats?.maxLoanAmount ? stroopsToXlm(stats.maxLoanAmount) : 0;
  const interestRate = stats?.interestRate || 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 h-[220px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-3">Loan Eligibility</h3>
      
      {hasCircle ? (
        <div className="bg-white/5 p-3 rounded-lg flex-1 grid grid-cols-3 gap-3">
          <div>
            <p className="text-white/60 text-sm mb-1">Max Loan</p>
            <p className="text-white text-xl font-bold">{maxLoan} XLM</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm mb-1">Interest</p>
            <p className="text-white text-xl font-bold">{interestRate}%</p>
          </div>

          <div>
            <p className="text-white/60 text-sm mb-1">Duration</p>
            <p className="text-white text-base">7 days</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/60 text-sm text-center">Join a Trust Circle to see your eligibility</p>
        </div>
      )}
    </div>
  );
}

// Request Loan Form
function RequestLoanForm({ stats, publicKey, onSuccess }: { stats: any; publicKey: string; onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const { requestLoan, isPending, isSuccess, error } = useRequestLoan();

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      setPurpose('');
      onSuccess();
      alert('Loan request submitted!');
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
    if (!purpose.trim()) {
      alert('Please provide a loan purpose');
      return;
    }
    requestLoan(publicKey, parseFloat(amount), purpose);
  };

  const hasCircle = stats?.circleId > 0;
  const hasActiveLoan = stats?.hasActiveLoan;
  const maxLoan = stats?.maxLoanAmount ? stroopsToXlm(stats.maxLoanAmount) : 100;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Request Loan</h3>
      
      {!hasCircle ? (
        <p className="text-white/60 text-center py-8">Join a Trust Circle first</p>
      ) : hasActiveLoan ? (
        <p className="text-white/60 text-center py-8">Repay active loan before requesting new one</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Amount (XLM)</label>
            <input
              type="number"
              step="1"
              min="10"
              max={maxLoan}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount (10-${maxLoan})`}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-2 block">Purpose</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Why do you need this loan?"
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white/90 hover:bg-white text-black py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Request Loan'}
          </button>
        </form>
      )}
    </div>
  );
}

// Active Loan Component
function ActiveLoan({ loans, publicKey, onRepaySuccess }: { loans: Loan[]; publicKey: string; onRepaySuccess: () => void }) {
  const { repayLoan, isPending, isSuccess, error } = useRepayLoan();

  // Find the active loan (disbursed but not repaid)
  const activeLoan = loans.find(loan => loan.disbursed && !loan.repaid);

  useEffect(() => {
    if (isSuccess) {
      onRepaySuccess();
      alert('Loan repaid successfully!');
    }
  }, [isSuccess, onRepaySuccess]);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  if (!activeLoan) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Active Loan</h3>
        <p className="text-white/60 text-center py-8">No active loan</p>
      </div>
    );
  }

  const handleRepay = () => {
    const totalRepayment = stroopsToXlm(activeLoan.totalRepayment);
    
    if (window.confirm(`Repay ${totalRepayment.toFixed(2)} XLM?`)) {
      repayLoan(publicKey, activeLoan.id);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Active Loan #{activeLoan.id}</h3>
      
      <div className="bg-white/5 p-4 rounded-lg mb-4">
        <p className="text-white/60 text-sm mb-1">Loan Amount</p>
        <p className="text-white text-2xl font-bold mb-3">{formatXlm(activeLoan.amount)} XLM</p>
        
        <p className="text-white/60 text-sm mb-1">Total Repayment</p>
        <p className="text-white mb-3 font-bold">{formatXlm(activeLoan.totalRepayment)} XLM</p>

        <p className="text-white/60 text-sm mb-1">Purpose</p>
        <p className="text-white text-sm mb-3">{activeLoan.purpose}</p>

        <p className="text-white/60 text-sm mb-1">Status</p>
        <p className="text-white text-sm">
          {activeLoan.repaid ? '✓ Repaid' : activeLoan.disbursed ? '● Disbursed' : activeLoan.approved ? '○ Approved' : '○ Pending'}
        </p>
      </div>

      <button
        onClick={handleRepay}
        disabled={isPending}
        className="w-full bg-green-500/90 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Processing...' : 'Repay Loan'}
      </button>
    </div>
  );
}

// Loan History Component
function LoanHistory({ loans }: { loans: Loan[] }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Loan History</h3>
      
      {loans.length === 0 ? (
        <p className="text-white/60 text-center py-8">No loan history</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 pb-3">ID</th>
                <th className="text-left text-white/60 pb-3">Amount</th>
                <th className="text-left text-white/60 pb-3">Purpose</th>
                <th className="text-left text-white/60 pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id} className="border-b border-white/10">
                  <td className="py-3 text-white">{loan.id}</td>
                  <td className="py-3 text-white">{formatXlm(loan.amount)} XLM</td>
                  <td className="py-3 text-white/80 text-sm truncate max-w-[150px]">{loan.purpose}</td>
                  <td className={`py-3 text-sm font-semibold ${
                    loan.repaid ? 'text-green-400' : 
                    loan.disbursed ? 'text-yellow-400' : 
                    loan.approved ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {loan.repaid ? '✓ Paid' : loan.disbursed ? '● Active' : loan.approved ? '✓ Approved' : '○ Pending'}
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
