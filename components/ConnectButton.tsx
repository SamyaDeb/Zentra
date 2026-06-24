'use client';

import { useFreighterWallet } from '../src/hooks/useStellar';

export function ConnectButton() {
  const { 
    isConnected, 
    isFreighterInstalled, 
    publicKey, 
    isLoading, 
    error,
    connect, 
    disconnect,
    isAdmin,
  } = useFreighterWallet();

  // Loading state
  if (isLoading) {
    return (
      <button
        disabled
        className="bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  // Not installed
  if (!isFreighterInstalled) {
    return (
      <a
        href="https://freighter.app"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition inline-block"
      >
        Install Freighter
      </a>
    );
  }

  // Connected
  if (isConnected && publicKey) {
    const shortAddress = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
    
    return (
      <div className="flex items-center gap-3">
        {isAdmin && (
          <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
            ADMIN
          </span>
        )}
        <span className="text-white/80 text-sm font-mono">
          {shortAddress}
        </span>
        <button
          onClick={disconnect}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Not connected
  return (
    <button
      onClick={connect}
      className="bg-white hover:bg-white/90 text-gray-900 font-semibold px-6 py-2 rounded-lg transition"
    >
      Connect Freighter
    </button>
  );
}
