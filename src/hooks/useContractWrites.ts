/**
 * React Hooks for TrustCircles Contract Write Transactions
 *
 * Builds, simulates, signs (via Freighter), and submits every write call on
 * the TrustCircles Soroban contract, and exposes each as a small state hook.
 *
 * CONTRACT FUNCTION → HOOK MAPPING (lib.rs → useContractWrites.ts):
 * ──────────────────────────────────────────────────────────────────
 * Contract Function          React Hook
 * ──────────────────────────────────────────────────────────────────
 * Circle Management:
 *   create_circle()        → useCreateCircle()   → calls "create_circle" on-chain
 *   join_circle()          → useJoinCircle()     → calls "join_circle" on-chain
 *   leave_circle()         → useLeaveCircle()    → calls "leave_circle" on-chain
 *
 * Loan Management:
 *   request_loan()         → useRequestLoan()    → calls "request_loan" on-chain
 *   approve_loan()         → useApproveLoan()    → calls "approve_loan" on-chain
 *   repay_loan()           → useRepayLoan()      → calls "repay_loan" on-chain
 *   penalize_default()     → usePenalizeDefault() → calls "penalize_default" on-chain
 *
 * Admin:
 *   deposit_liquidity()    → useDepositLiquidity() → calls "deposit_liquidity" on-chain
 *   withdraw()             → useWithdraw()          → calls "withdraw" on-chain
 *   set_demo_mode()        → useSetDemoMode()        → calls "set_demo_mode" on-chain
 *   set_demo_loan_duration() → useSetDemoLoanDuration() → calls "set_demo_loan_duration"
 *   unfreeze_account()     → useUnfreezeAccount()    → calls "unfreeze_account" on-chain
 */

"use client";

import { useState, useCallback } from "react";
import { signTransaction } from "@stellar/freighter-api";
import {
  rpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { xlmToStroops } from "../../config/stellarConfig";
import {
  getSorobanServer,
  getNetworkPassphrase,
  getContract,
} from "../lib/stellar";

/** Only fires outside production builds, so diagnostics stay in dev without shipping console noise. */
function debugWarn(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") console.warn(...args);
}
function debugError(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") console.error(...args);
}

// ============ CONTRACT TRANSACTION HOOKS ============

interface TransactionState {
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  txHash: string | null;
}

/**
 * Safely extract error information from transaction result
 * Avoids "Bad union switch" errors by not parsing XDR unnecessarily
 */
function safeGetTransactionError(
  response: Awaited<ReturnType<InstanceType<typeof rpc.Server>["getTransaction"]>>
): string {
  try {
    // Only try to access resultXdr if it exists and transaction failed
    const resultXdr = (response as { resultXdr?: unknown }).resultXdr;
    if (resultXdr) {
      // If it's already a string, return it
      if (typeof resultXdr === 'string') {
        return `Transaction failed: ${resultXdr.substring(0, 100)}`;
      }
      // Otherwise, don't try to parse - just return generic message
      return "Transaction failed on chain";
    }
    return "Transaction failed on chain";
  } catch (error) {
    // If any error occurs during parsing, just return generic message
    debugWarn("Could not parse transaction error details:", error);
    return "Transaction failed on chain";
  }
}

/**
 * Build, sign, and submit a contract transaction
 */
async function submitContractTransaction(
  publicKey: string,
  method: string,
  args: xdr.ScVal[]
): Promise<string> {
  const server = getSorobanServer();
  const contract = getContract();

  try {
    // Get account
    const account = await server.getAccount(publicKey);

    // Build transaction
    let tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(300)
      .build();

    // Simulate to get the prepared transaction
    const simulation = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    // Prepare the transaction (adds resource footprint, etc.)
    tx = rpc.assembleTransaction(tx, simulation).build();

    // Convert to XDR string for Freighter
    const txXdr = tx.toXDR();

    // Sign with Freighter
    const signedXdr = await signTransaction(txXdr, {
      networkPassphrase: getNetworkPassphrase(),
    });

    // Parse the signed transaction from XDR
    // Important: Use Transaction type directly instead of TransactionBuilder
    let signedTx;
    try {
      // Try parsing as Transaction first
      signedTx = TransactionBuilder.fromXDR(
        signedXdr,
        getNetworkPassphrase()
      );
    } catch (xdrError) {
      debugError("XDR parsing error:", xdrError);
      throw new Error(`Failed to parse signed transaction: ${xdrError instanceof Error ? xdrError.message : 'Unknown error'}`);
    }

    // Submit transaction
    const result = await server.sendTransaction(signedTx);

    if (result.status === "ERROR") {
      throw new Error(`Transaction submission failed: ${result.errorResult?.toXDR('base64') || 'Unknown error'}`);
    }

    // Wait for confirmation with timeout
    const maxAttempts = 60; // 60 seconds max wait
    let attempts = 0;

    try {
      let getResponse = await server.getTransaction(result.hash);

      while (getResponse.status === "NOT_FOUND" && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        getResponse = await server.getTransaction(result.hash);
        attempts++;
      }

      if (getResponse.status === "NOT_FOUND") {
        throw new Error("Transaction confirmation timeout - please check transaction status manually");
      }

      if (getResponse.status === "FAILED") {
        // Use safe error extraction to avoid XDR parsing issues
        throw new Error(safeGetTransactionError(getResponse));
      }

      // SUCCESS - return hash immediately without accessing any XDR data
      // This avoids "Bad union switch" errors from parsing metadata
      if (getResponse.status === "SUCCESS") {
        return result.hash;
      }

      // Fallback: if status is neither SUCCESS, FAILED, nor NOT_FOUND
      return result.hash;

    } catch (confirmError) {
      // If we get an XDR parsing error during confirmation check
      // but the transaction was submitted, it may have still succeeded
      if (confirmError instanceof Error &&
          (confirmError.message.includes("Bad union switch") ||
           confirmError.message.includes("XDR"))) {
        debugWarn("XDR parsing error during confirmation, but transaction was submitted:", confirmError);
        // Return the hash since transaction was submitted successfully
        // User can verify on block explorer
        return result.hash;
      }
      // Re-throw other errors
      throw confirmError;
    }

  } catch (error) {
    // Enhanced error logging
    debugError("Contract transaction error:", {
      method,
      error: error instanceof Error ? error.message : String(error),
      publicKey,
    });
    throw error;
  }
}

/**
 * Hook for creating a new circle
 */
export function useCreateCircle() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const createCircle = useCallback(async (publicKey: string, name: string) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "create_circle",
        [
          new Address(publicKey).toScVal(),
          nativeToScVal(name, { type: "string" }),
        ]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, createCircle };
}

/**
 * Hook for joining a circle
 */
export function useJoinCircle() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const joinCircle = useCallback(async (publicKey: string, circleId: number) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "join_circle",
        [
          new Address(publicKey).toScVal(),
          nativeToScVal(circleId, { type: "u32" }),
        ]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, joinCircle };
}

/**
 * Hook for requesting a loan
 */
export function useRequestLoan() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const requestLoan = useCallback(async (
    publicKey: string,
    amountXlm: number,
    purpose: string,
    durationDays: number = 7
  ) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const amountStroops = xlmToStroops(amountXlm);

      const txHash = await submitContractTransaction(
        publicKey,
        "request_loan",
        [
          new Address(publicKey).toScVal(),
          nativeToScVal(amountStroops, { type: "i128" }),
          nativeToScVal(purpose, { type: "string" }),
          nativeToScVal(durationDays, { type: "u32" }),
        ]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, requestLoan };
}

/**
 * Hook for leaving a circle and reclaiming the staked amount
 */
export function useLeaveCircle() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const leaveCircle = useCallback(async (publicKey: string) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "leave_circle",
        [new Address(publicKey).toScVal()]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, leaveCircle };
}

/**
 * Hook for repaying a loan
 */
export function useRepayLoan() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const repayLoan = useCallback(async (publicKey: string, loanId: number) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "repay_loan",
        [
          new Address(publicKey).toScVal(),
          nativeToScVal(loanId, { type: "u32" }),
        ]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, repayLoan };
}

// ============ ADMIN HOOKS ============

/**
 * Hook for depositing liquidity (admin only)
 */
export function useDepositLiquidity() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const depositLiquidity = useCallback(async (publicKey: string, amountXlm: number) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const amountStroops = xlmToStroops(amountXlm);

      const txHash = await submitContractTransaction(
        publicKey,
        "deposit_liquidity",
        [nativeToScVal(amountStroops, { type: "i128" })]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, depositLiquidity };
}

/**
 * Hook for approving loans (admin only)
 */
export function useApproveLoan() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const approveLoan = useCallback(async (publicKey: string, loanId: number) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "approve_loan",
        [nativeToScVal(loanId, { type: "u32" })]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, approveLoan };
}

/**
 * Hook for withdrawing funds (admin only) — calls contract "withdraw"
 */
export function useWithdraw() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const withdraw = useCallback(async (publicKey: string, amountXlm: number) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const amountStroops = xlmToStroops(amountXlm);

      const txHash = await submitContractTransaction(
        publicKey,
        "withdraw",
        [nativeToScVal(amountStroops, { type: "i128" })]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, withdraw };
}

/**
 * Hook for penalizing loan defaults (admin only) — calls contract "penalize_default"
 */
export function usePenalizeDefault() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const penalizeDefault = useCallback(async (publicKey: string, loanId: number) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "penalize_default",
        [nativeToScVal(loanId, { type: "u32" })]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, penalizeDefault };
}

/**
 * Hook for unfreezing accounts (admin only) — calls contract "unfreeze_account"
 */
export function useUnfreezeAccount() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const unfreezeAccount = useCallback(async (publicKey: string, userAddress: string) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "unfreeze_account",
        [new Address(userAddress).toScVal()]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, unfreezeAccount };
}

/**
 * Hook for setting demo loan duration (admin only) — calls contract "set_demo_loan_duration"
 */
export function useSetDemoLoanDuration() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const setDemoLoanDuration = useCallback(async (publicKey: string, durationLedgers: number) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "set_demo_loan_duration",
        [nativeToScVal(durationLedgers, { type: "u32" })]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, setDemoLoanDuration };
}

/**
 * Hook for toggling demo mode (admin only)
 */
export function useSetDemoMode() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    error: null,
    txHash: null,
  });

  const setDemoMode = useCallback(async (publicKey: string, enabled: boolean) => {
    setState({ isPending: true, isSuccess: false, error: null, txHash: null });

    try {
      const txHash = await submitContractTransaction(
        publicKey,
        "set_demo_mode",
        [nativeToScVal(enabled, { type: "bool" })]
      );

      setState({ isPending: false, isSuccess: true, error: null, txHash });
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
    }
  }, []);

  return { ...state, setDemoMode };
}
