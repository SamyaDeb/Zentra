'use client';

import { usePlatformMetrics, useNetworkHealth } from '@/src/hooks/useStellar';
import { CONTRACT_CONFIG, CURRENT_NETWORK, stroopsToXlm } from '../../config/stellarConfig';

function getStatusColor(status: 'healthy' | 'down') {
  return status === 'healthy' ? 'bg-green-500' : 'bg-red-500';
}

export default function MonitoringDashboard() {
  const { metrics, isLoading, error } = usePlatformMetrics();
  const health = useNetworkHealth();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Monitoring Dashboard</h1>
        <p className="text-gray-400 mb-8">Live on-chain platform metrics and network health</p>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Soroban RPC</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.rpc)}`}></div>
            </div>
            <p className="text-lg font-semibold capitalize">{health.rpc}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Horizon API</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.horizon)}`}></div>
            </div>
            <p className="text-lg font-semibold capitalize">{health.horizon}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Latest Ledger</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.rpc)}`}></div>
            </div>
            <p className="text-lg font-semibold">{health.latestLedger ?? '—'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">
            Failed to load platform metrics: {error}
          </div>
        )}

        {/* Platform Metrics */}
        <h2 className="text-xl font-semibold mb-4">Platform Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
            <p className="text-blue-400 text-sm mb-1">Users in Circles</p>
            <p className="text-3xl font-bold">{isLoading ? '…' : metrics?.usersInCircles ?? 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
            <p className="text-purple-400 text-sm mb-1">Active Circles</p>
            <p className="text-3xl font-bold">
              {isLoading ? '…' : `${metrics?.activeCircles ?? 0} / ${metrics?.totalCircles ?? 0}`}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-700/50">
            <p className="text-green-400 text-sm mb-1">Total Loans</p>
            <p className="text-3xl font-bold">{isLoading ? '…' : metrics?.totalLoans ?? 0}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
            <p className="text-yellow-400 text-sm mb-1">TVL (XLM)</p>
            <p className="text-3xl font-bold">
              {isLoading ? '…' : stroopsToXlm(metrics?.contractBalance ?? BigInt(0)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Active Loans</p>
            <p className="text-2xl font-bold text-cyan-400">{isLoading ? '…' : metrics?.activeLoans ?? 0}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Loans Repaid</p>
            <p className="text-2xl font-bold text-green-400">{isLoading ? '…' : metrics?.repaidLoans ?? 0}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Avg Circle Trust Score</p>
            <p className="text-2xl font-bold text-purple-400">
              {isLoading ? '…' : metrics?.avgCircleTrustScore ?? 0}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Default Rate</p>
            <p className="text-2xl font-bold text-red-400">
              {isLoading ? '…' : `${metrics?.defaultRatePercent ?? 0}%`}
            </p>
          </div>
        </div>

        {/* Recent Activity — no indexer yet (see DATA_INDEXING.md), so this
            links out to a real source instead of showing fabricated rows. */}
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Per-transaction history isn&apos;t indexed by this app yet (see{' '}
            <code className="text-gray-300">DATA_INDEXING.md</code>).
          </p>
          <a
            href={`https://stellar.expert/explorer/${CURRENT_NETWORK === 'mainnet' ? 'public' : 'testnet'}/contract/${CONTRACT_CONFIG.contractId}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline text-sm"
          >
            View live contract activity on Stellar Expert →
          </a>
        </div>

        {/* Contract Info */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Contract Address</p>
              <p className="font-mono text-cyan-400 break-all">{CONTRACT_CONFIG.contractId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Network</p>
                <p className="text-white">{CURRENT_NETWORK === 'mainnet' ? 'Stellar Mainnet (Soroban)' : 'Stellar Testnet (Soroban)'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Token Contract (XLM SAC)</p>
              <p className="font-mono text-cyan-400 break-all">{CONTRACT_CONFIG.nativeTokenId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Explorer</p>
              <a
                href={`https://stellar.expert/explorer/${CURRENT_NETWORK === 'mainnet' ? 'public' : 'testnet'}/contract/${CONTRACT_CONFIG.contractId}`}
                target="_blank"
                className="text-cyan-400 hover:underline"
              >
                View on Stellar Expert →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
