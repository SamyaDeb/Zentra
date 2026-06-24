'use client';

import { useState, useEffect } from 'react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  isFreighterInstalled: boolean;
  error: string | null;
}

export default function WalletModal({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  isFreighterInstalled,
  error,
}: WalletModalProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isConnecting) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isConnecting, onClose]);

  if (!isOpen) return null;

  const handleFreighterClick = async () => {
    setShowError(false);
    await onConnect();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isConnecting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
            {!isConnecting && (
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {showError && error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                  </svg>
                  <div>
                    <p className="text-red-400 text-sm font-medium">Connection Failed</p>
                    <p className="text-red-400/70 text-xs mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Connecting State */}
            {isConnecting ? (
              <div className="py-8 text-center">
                {/* Spinner */}
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
                <h3 className="text-white font-medium text-lg mb-2">Connecting...</h3>
                <p className="text-white/60 text-sm">
                  Approve the connection request in your<br />
                  <span className="text-white/80 font-medium">Freighter wallet extension</span>
                </p>
                
                {/* Pulsing indicator */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-white/50 text-xs">Waiting for approval</span>
                </div>
              </div>
            ) : (
              <>
                {/* Wallet Options */}
                <div className="space-y-3">
                  {/* Freighter Option */}
                  <button
                    onClick={handleFreighterClick}
                    disabled={!isFreighterInstalled}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group ${
                      isFreighterInstalled 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer' 
                        : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {/* Freighter Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Freighter</span>
                        {isFreighterInstalled && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                            Detected
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm mt-0.5">
                        {isFreighterInstalled 
                          ? 'Connect with Freighter wallet' 
                          : 'Freighter not installed'
                        }
                      </p>
                    </div>

                    {/* Arrow */}
                    {isFreighterInstalled && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white/60 group-hover:translate-x-1 transition-all">
                        <path d="m9 18 6-6-6-6"></path>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-white/40 text-xs font-medium">STELLAR NETWORK</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Info / Install Section */}
                {!isFreighterInstalled ? (
                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" x2="12" y1="15" y2="3"></line>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">Install Freighter Wallet</h4>
                        <p className="text-white/50 text-xs mt-1 mb-3">
                          Freighter is the recommended wallet for Stellar. Install it to connect to Zentra.
                        </p>
                        <a
                          href="https://freighter.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          Install Freighter
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" x2="21" y1="14" y2="3"></line>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white/40 text-xs">
                      By connecting, you agree to the{' '}
                      <a href="#" className="text-white/60 hover:text-white underline">Terms of Service</a>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Network Badge */}
          <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/40 text-xs">Stellar Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
