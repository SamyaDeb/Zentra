'use client';

import { useState } from 'react';
import { useAdminCoSign } from '@/src/hooks/useAdminCoSign';
import { ADMIN_MULTISIG_METHODS, type AdminMultisigMethod } from '@/src/lib/adminMultisig';
import {
  approveLoanCall,
  penalizeDefaultCall,
  depositLiquidityCall,
  withdrawCall,
  setDemoModeCall,
  setDemoLoanDurationCall,
  unfreezeAccountCall,
} from '@/src/lib/stellar';
import { xlmToStroops } from '@/config/stellarConfig';

const METHOD_LABELS: Record<AdminMultisigMethod, string> = {
  approve_loan: 'Approve Loan',
  penalize_default: 'Penalize Default',
  deposit_liquidity: 'Deposit Liquidity',
  withdraw: 'Withdraw',
  set_demo_mode: 'Set Demo Mode',
  set_demo_loan_duration: 'Set Demo Loan Duration',
  unfreeze_account: 'Unfreeze Account',
};

// Co-sign console for once the admin account requires >1 signature. See
// docs/multisig-admin-runbook.md for the ordering/verification steps that
// precede this being needed at all.
export default function AdminCoSignConsole() {
  const [method, setMethod] = useState<AdminMultisigMethod>('approve_loan');
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [durationLedgers, setDurationLedgers] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [pastedXdr, setPastedXdr] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    xdr,
    signatureCount,
    isPending,
    isSubmitted,
    txHash,
    error,
    startAction,
    loadXdr,
    addSignature,
    submit,
    reset,
  } = useAdminCoSign();

  const handleBuildAndSign = async () => {
    switch (method) {
      case 'approve_loan':
        return startAction(method, await approveLoanCall(parseInt(loanId)));
      case 'penalize_default':
        return startAction(method, await penalizeDefaultCall(parseInt(loanId)));
      case 'deposit_liquidity':
        return startAction(method, await depositLiquidityCall(xlmToStroops(parseFloat(amount))));
      case 'withdraw':
        return startAction(method, await withdrawCall(xlmToStroops(parseFloat(amount))));
      case 'set_demo_mode':
        return startAction(method, await setDemoModeCall(demoEnabled));
      case 'set_demo_loan_duration':
        return startAction(method, await setDemoLoanDurationCall(parseInt(durationLedgers)));
      case 'unfreeze_account':
        return startAction(method, await unfreezeAccountCall(userAddress.trim()));
    }
  };

  const handleCopy = async () => {
    if (!xdr) return;
    await navigator.clipboard.writeText(xdr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-2">Multi-Sig Co-Sign Console</h3>
      <p className="text-white/60 text-sm mb-4">
        Once the admin account requires more than 1 signature, no single click here can submit an
        admin transaction on its own — build it, sign it, hand the XDR to another admin to add
        their signature, then submit. See{' '}
        <code className="text-white/80">docs/multisig-admin-runbook.md</code>.
      </p>

      {!xdr ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Action</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as AdminMultisigMethod)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {ADMIN_MULTISIG_METHODS.map((m) => (
                <option key={m} value={m} className="bg-black">
                  {METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          {(method === 'approve_loan' || method === 'penalize_default') && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">Loan ID</label>
              <input
                type="number"
                min="1"
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          )}

          {(method === 'deposit_liquidity' || method === 'withdraw') && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">Amount (XLM)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          )}

          {method === 'set_demo_mode' && (
            <label className="flex items-center gap-2 text-white/80 text-sm">
              <input
                type="checkbox"
                checked={demoEnabled}
                onChange={(e) => setDemoEnabled(e.target.checked)}
              />
              Enable demo mode
            </label>
          )}

          {method === 'set_demo_loan_duration' && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">Duration (ledgers)</label>
              <input
                type="number"
                min="1"
                value={durationLedgers}
                onChange={(e) => setDurationLedgers(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          )}

          {method === 'unfreeze_account' && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">User Address</label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="G..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>
          )}

          <button
            onClick={handleBuildAndSign}
            disabled={isPending}
            className="w-full bg-purple-500/90 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isPending ? 'Building & Signing...' : 'Build & Sign (Step 1)'}
          </button>

          <div className="border-t border-white/10 pt-4">
            <label className="text-sm text-white/60 mb-2 block">
              — or — load a transaction another admin already signed
            </label>
            <textarea
              value={pastedXdr}
              onChange={(e) => setPastedXdr(e.target.value)}
              rows={4}
              placeholder="Paste transaction XDR here"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 font-mono text-xs"
            />
            <button
              onClick={() => loadXdr(pastedXdr.trim())}
              disabled={!pastedXdr.trim()}
              className="mt-2 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm transition disabled:opacity-50"
            >
              Load XDR
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-2">
              {signatureCount} signature{signatureCount === 1 ? '' : 's'} attached
            </p>
            <textarea
              readOnly
              value={xdr}
              rows={5}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white/70 font-mono text-xs"
            />
            <button
              onClick={handleCopy}
              className="mt-2 text-sm text-cyan-300 hover:text-cyan-200"
            >
              {copied ? 'Copied!' : 'Copy XDR to hand to the next co-signer'}
            </button>
          </div>

          {isSubmitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 font-semibold mb-1">Submitted</p>
              <p className="text-white/60 text-xs break-all">{txHash}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addSignature}
                disabled={isPending}
                className="bg-blue-500/90 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {isPending ? 'Signing...' : 'Add My Signature'}
              </button>
              <button
                onClick={submit}
                disabled={isPending}
                className="bg-green-500/90 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {isPending ? 'Submitting...' : 'Submit to Network'}
              </button>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full text-white/50 hover:text-white text-sm py-2"
          >
            Start over
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  );
}
