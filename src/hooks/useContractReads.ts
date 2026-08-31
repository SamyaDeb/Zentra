/**
 * React Hooks for TrustCircles Contract Read Queries
 *
 * Data Fetching (read-only, call stellar.ts → simulateContractCall):
 *   get_user_stats()       → useUserStats()
 *   get_circle_details()   → useCircleDetails()
 *   get_loan_details()     → (via useUserLoansData / useAllPendingLoans)
 *   get_user_loans()       → useUserLoansData()
 *   get_contract_balance() → useContractBalanceData()
 *   get_circle_count()     → useAllCircles()
 *   get_loan_count()       → useAllPendingLoans()
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserStats,
  getCircleDetails,
  getLoanDetails,
  getUserLoans,
  getContractBalance,
  getLoanCount,
  getCircleCount,
  getLatestLedgerSequence,
  type UserStats,
  type CircleDetails,
  type Loan,
} from "../lib/stellar";
import { fetchAdminAccountInfo } from "../lib/horizon";
import { CONTRACT_CONFIG } from "../../config/stellarConfig";

// ============ DATA FETCHING HOOKS ============

/**
 * Hook for fetching user stats
 */
export function useUserStats(publicKey: string | null) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserStats(publicKey);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}

/**
 * Hook for fetching circle details
 */
export function useCircleDetails(publicKey: string | null, circleId: number | null) {
  const [circle, setCircle] = useState<CircleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!publicKey || !circleId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCircleDetails(publicKey, circleId);
      setCircle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch circle");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, circleId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { circle, isLoading, error, refetch };
}

/**
 * Hook for fetching user's loans
 */
export function useUserLoansData(publicKey: string | null) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const loanIds = await getUserLoans(publicKey);
      const loanPromises = loanIds.map(id => getLoanDetails(publicKey, id));
      const loanData = await Promise.all(loanPromises);
      setLoans(loanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loans");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { loans, isLoading, error, refetch };
}

/**
 * Hook for fetching contract balance (admin)
 */
export function useContractBalanceData(publicKey: string | null) {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getContractBalance(publicKey);
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { balance, isLoading, error, refetch };
}

/**
 * Hook for fetching all pending loans (admin)
 */
export function useAllPendingLoans(publicKey: string | null) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const totalLoans = await getLoanCount(publicKey);
      const allLoans = await Promise.all(
        Array.from({ length: totalLoans }, (_, i) => getLoanDetails(publicKey, i + 1))
      );

      // Only include pending (not approved) loans
      setLoans(allLoans.filter(loan => !loan.approved));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loans");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { loans, isLoading, error, refetch };
}

/**
 * Hook for polling the latest ledger sequence — used to estimate time
 * remaining until an active loan's due_ledger for reminder banners.
 */
export function useLatestLedger(pollIntervalMs: number = 30000) {
  const [sequence, setSequence] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLedger = async () => {
      try {
        const seq = await getLatestLedgerSequence();
        if (!cancelled) setSequence(seq);
      } catch {
        // Non-critical for a reminder banner — silently skip this tick
      }
    };

    fetchLedger();
    const interval = setInterval(fetchLedger, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return sequence;
}

/**
 * Hook for fetching all circles
 */
export function useAllCircles(publicKey: string | null) {
  const [circles, setCircles] = useState<CircleDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const totalCircles = await getCircleCount(publicKey);
      const allCircles = await Promise.all(
        Array.from({ length: totalCircles }, (_, i) => getCircleDetails(publicKey, i + 1))
      );
      setCircles(allCircles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch circles");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { circles, isLoading, error, refetch };
}

export interface PlatformMetrics {
  totalCircles: number;
  activeCircles: number;
  totalLoans: number;
  activeLoans: number;
  repaidLoans: number;
  defaultedLoans: number;
  defaultRatePercent: number;
  contractBalance: bigint;
  /** Deduplicated across all circle memberships — the contract has no
   *  global user registry, so a user who has never joined a circle isn't
   *  counted here. */
  usersInCircles: number;
  avgCircleTrustScore: number;
}

/**
 * Hook for deriving real platform-wide stats straight from the contract's
 * circle/loan/balance reads — used by the monitoring dashboard, which
 * previously showed hardcoded mock numbers regardless of on-chain reality.
 * No wallet connection is required: reads are simulated against the given
 * (or default admin) account purely to obtain a valid source account for
 * the simulation envelope, not for authorization.
 */
export function usePlatformMetrics(sourceAccount: string = CONTRACT_CONFIG.adminAddress) {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [totalCircles, totalLoans, contractBalance] = await Promise.all([
        getCircleCount(sourceAccount),
        getLoanCount(sourceAccount),
        getContractBalance(sourceAccount),
      ]);

      const [circles, loans] = await Promise.all([
        Promise.all(
          Array.from({ length: totalCircles }, (_, i) => getCircleDetails(sourceAccount, i + 1))
        ),
        Promise.all(
          Array.from({ length: totalLoans }, (_, i) => getLoanDetails(sourceAccount, i + 1))
        ),
      ]);

      const uniqueMembers = new Set(circles.flatMap((c) => c.members));
      const avgCircleTrustScore = circles.length
        ? Math.round(circles.reduce((sum, c) => sum + c.averageScore, 0) / circles.length)
        : 0;

      const activeLoans = loans.filter((l) => l.disbursed && !l.repaid && !l.defaulted).length;
      const repaidLoans = loans.filter((l) => l.repaid).length;
      const defaultedLoans = loans.filter((l) => l.defaulted).length;
      const defaultRatePercent =
        totalLoans > 0 ? Math.round((defaultedLoans / totalLoans) * 1000) / 10 : 0;

      setMetrics({
        totalCircles,
        activeCircles: circles.filter((c) => c.isActive).length,
        totalLoans,
        activeLoans,
        repaidLoans,
        defaultedLoans,
        defaultRatePercent,
        contractBalance,
        usersInCircles: uniqueMembers.size,
        avgCircleTrustScore,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch platform metrics");
    } finally {
      setIsLoading(false);
    }
  }, [sourceAccount]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { metrics, isLoading, error, refetch };
}

export interface NetworkHealth {
  rpc: "healthy" | "down";
  horizon: "healthy" | "down";
  latestLedger: number | null;
}

/**
 * Hook for polling real Soroban RPC / Horizon reachability — used by the
 * monitoring dashboard, which previously showed a hardcoded "healthy"
 * status regardless of whether the network was actually reachable.
 */
export function useNetworkHealth(pollIntervalMs: number = 30000) {
  const [health, setHealth] = useState<NetworkHealth>({
    rpc: "down",
    horizon: "down",
    latestLedger: null,
  });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const [ledgerResult, horizonResult] = await Promise.allSettled([
        getLatestLedgerSequence(),
        fetchAdminAccountInfo(),
      ]);

      if (cancelled) return;

      setHealth({
        rpc: ledgerResult.status === "fulfilled" ? "healthy" : "down",
        horizon:
          horizonResult.status === "fulfilled" && horizonResult.value !== null
            ? "healthy"
            : "down",
        latestLedger: ledgerResult.status === "fulfilled" ? ledgerResult.value : null,
      });
    };

    check();
    const interval = setInterval(check, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return health;
}
