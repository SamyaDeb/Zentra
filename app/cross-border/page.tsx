'use client';

import { useState } from 'react';

export default function CrossBorderPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'send'>('deposit');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  ];

  const handleDeposit = async () => {
    setLoading(true);
    // Simulate SEP-24 deposit flow
    setTimeout(() => {
      alert(`Initiating deposit of ${amount} ${currency} via SEP-24 anchor...`);
      setLoading(false);
    }, 1000);
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setTimeout(() => {
      alert(`Initiating withdrawal of ${amount} XLM to ${currency} via SEP-24 anchor...`);
      setLoading(false);
    }, 1000);
  };

  const handleSend = async () => {
    setLoading(true);
    setTimeout(() => {
      alert(`Initiating cross-border payment of ${amount} ${currency} to ${recipient} via SEP-31...`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Cross-Border Flows</h1>
        <p className="text-gray-400 mb-8">SEP-24 & SEP-31 Anchor Integration for fiat on/off ramps</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['deposit', 'withdraw', 'send'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'deposit' && 'Deposit (Fiat → Crypto)'}
              {tab === 'withdraw' && 'Withdraw (Crypto → Fiat)'}
              {tab === 'send' && 'Send (Cross-Border)'}
            </button>
          ))}
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Deposit Fiat to XLM</h2>
            <p className="text-gray-400 mb-6">Convert your fiat currency to XLM using SEP-24 interactive deposit</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You pay</span>
                  <span>{amount || '0'} {currency}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Fee (0.5%)</span>
                  <span>{(parseFloat(amount || '0') * 0.005).toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-700">
                  <span>You receive (approx)</span>
                  <span className="text-cyan-400">{(parseFloat(amount || '0') * 0.995 * 10).toFixed(2)} XLM</span>
                </div>
              </div>

              <button
                onClick={handleDeposit}
                disabled={loading || !amount}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                {loading ? 'Processing...' : 'Deposit via Anchor'}
              </button>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Withdraw XLM to Fiat</h2>
            <p className="text-gray-400 mb-6">Convert your XLM to fiat currency using SEP-24 interactive withdrawal</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (XLM)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter XLM amount"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Receive Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You send</span>
                  <span>{amount || '0'} XLM</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Fee (0.5%)</span>
                  <span>{(parseFloat(amount || '0') * 0.005).toFixed(2)} XLM</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-700">
                  <span>You receive (approx)</span>
                  <span className="text-green-400">{(parseFloat(amount || '0') * 0.995 * 0.1).toFixed(2)} {currency}</span>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={loading || !amount}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                {loading ? 'Processing...' : 'Withdraw via Anchor'}
              </button>
            </div>
          </div>
        )}

        {/* Send Tab (SEP-31) */}
        {activeTab === 'send' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Cross-Border Payment</h2>
            <p className="text-gray-400 mb-6">Send money internationally using SEP-31 direct payment</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Recipient Email/ID</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="recipient@email.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span>{amount || '0'} {currency}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Transfer fee</span>
                  <span>0.50 {currency}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Exchange rate</span>
                  <span>1 {currency} = 10.5 XLM</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-700">
                  <span>Recipient gets</span>
                  <span className="text-purple-400">{((parseFloat(amount || '0') - 0.5) * 0.98).toFixed(2)} {currency}</span>
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={loading || !amount || !recipient}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                {loading ? 'Processing...' : 'Send via SEP-31'}
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About Stellar Anchors</h3>
          <p className="text-sm text-gray-400">
            <strong>SEP-24:</strong> Interactive deposit/withdrawal protocol for fiat ↔ crypto conversion.<br/>
            <strong>SEP-31:</strong> Direct payment protocol for cross-border remittances.<br/><br/>
            This integration uses Stellar's test anchor for demonstration. In production, 
            licensed anchor services provide real fiat rails.
          </p>
        </div>
      </div>
    </div>
  );
}
