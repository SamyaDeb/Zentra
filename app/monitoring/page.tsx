'use client';

import { useState, useEffect } from 'react';

interface MetricData {
  totalLoans: number;
  activeLoans: number;
  totalRepaid: number;
  totalCircles: number;
  totalUsers: number;
  tvl: number;
  avgTrustScore: number;
  defaultRate: number;
}

interface SystemHealth {
  rpcStatus: 'healthy' | 'degraded' | 'down';
  contractStatus: 'healthy' | 'degraded' | 'down';
  horizonStatus: 'healthy' | 'degraded' | 'down';
  lastBlockTime: string;
  uptime: string;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricData>({
    totalLoans: 156,
    activeLoans: 23,
    totalRepaid: 133,
    totalCircles: 12,
    totalUsers: 35,
    tvl: 45000,
    avgTrustScore: 72,
    defaultRate: 2.3,
  });

  const [health, setHealth] = useState<SystemHealth>({
    rpcStatus: 'healthy',
    contractStatus: 'healthy',
    horizonStatus: 'healthy',
    lastBlockTime: new Date().toISOString(),
    uptime: '99.9%',
  });

  const [recentTxs, setRecentTxs] = useState([
    { hash: 'abc123...def', type: 'Loan Request', amount: '300 XLM', time: '2 min ago', status: 'success' },
    { hash: 'ghi456...jkl', type: 'Repayment', amount: '212 XLM', time: '5 min ago', status: 'success' },
    { hash: 'mno789...pqr', type: 'Circle Join', amount: '10 XLM', time: '12 min ago', status: 'success' },
    { hash: 'stu012...vwx', type: 'Loan Approval', amount: '500 XLM', time: '18 min ago', status: 'success' },
    { hash: 'yza345...bcd', type: 'Deposit', amount: '1000 XLM', time: '25 min ago', status: 'success' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Monitoring Dashboard</h1>
        <p className="text-gray-400 mb-8">Real-time platform metrics and system health</p>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Soroban RPC</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.rpcStatus)}`}></div>
            </div>
            <p className="text-lg font-semibold capitalize">{health.rpcStatus}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Smart Contract</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.contractStatus)}`}></div>
            </div>
            <p className="text-lg font-semibold capitalize">{health.contractStatus}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Horizon API</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.horizonStatus)}`}></div>
            </div>
            <p className="text-lg font-semibold capitalize">{health.horizonStatus}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Uptime</span>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="text-lg font-semibold">{health.uptime}</p>
          </div>
        </div>

        {/* Platform Metrics */}
        <h2 className="text-xl font-semibold mb-4">Platform Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
            <p className="text-blue-400 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold">{metrics.totalUsers}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
            <p className="text-purple-400 text-sm mb-1">Active Circles</p>
            <p className="text-3xl font-bold">{metrics.totalCircles}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-700/50">
            <p className="text-green-400 text-sm mb-1">Total Loans</p>
            <p className="text-3xl font-bold">{metrics.totalLoans}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
            <p className="text-yellow-400 text-sm mb-1">TVL (XLM)</p>
            <p className="text-3xl font-bold">{metrics.tvl.toLocaleString()}</p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Active Loans</p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.activeLoans}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Loans Repaid</p>
            <p className="text-2xl font-bold text-green-400">{metrics.totalRepaid}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Avg Trust Score</p>
            <p className="text-2xl font-bold text-purple-400">{metrics.avgTrustScore}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Default Rate</p>
            <p className="text-2xl font-bold text-red-400">{metrics.defaultRate}%</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Hash</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Time</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.map((tx, i) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-sm text-cyan-400">{tx.hash}</td>
                  <td className="px-4 py-3">{tx.type}</td>
                  <td className="px-4 py-3 font-semibold">{tx.amount}</td>
                  <td className="px-4 py-3 text-gray-400">{tx.time}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-sm">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contract Info */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Contract Address</p>
              <p className="font-mono text-cyan-400 break-all">CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Network</p>
              <p className="text-white">Stellar Testnet (Soroban)</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Token Contract (XLM SAC)</p>
              <p className="font-mono text-cyan-400 break-all">CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Explorer</p>
              <a 
                href="https://stellar.expert/explorer/testnet/contract/CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27"
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
