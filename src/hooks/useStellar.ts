/**
 * React Hooks for Stellar/Freighter Wallet Integration
 * 
 * Provides hooks for connecting to Freighter wallet and interacting
 * with the TrustCircles Soroban contract on Stellar.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  isConnected as checkFreighterConnected,
  isAllowed,
  requestAccess,
  signTransaction,
  getNetwork,
  getPublicKey,
} from "@stellar/freighter-api";
import {
  rpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  Contract,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import {
  networkConfig,
  CONTRACT_CONFIG,
  CURRENT_NETWORK,
  xlmToStroops,
} from "../../config/stellarConfig";
import {
  getSorobanServer,
  getNetworkPassphrase,
  getContract,
  getUserStats,
  getCircleDetails,
  getLoanDetails,
  getUserLoans,
  getContractBalance,
  getLoanCount,
  getCircleCount,
  type UserStats,
  type CircleDetails,
  type Loan,
} from "../lib/stellar";

// ============ WALLET HOOKS ============

export interface WalletState {
  isConnected: boolean;
  isFreighterInstalled: boolean;
  publicKey: string | null;
  network: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
}

/**
 * Hook for managing Freighter wallet connection
 */
export function useFreighterWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isFreighterInstalled: false,
    publicKey: null,
    network: null,
    isLoading: true,
    isConnecting: false,
    error: null,
  });
  
  const watcherRef = useRef<NodeJS.Timeout | null>(null);

  // Check initial connection state
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if Freighter is installed
        const connectedResult = await checkFreighterConnected();
        // Handle both old (boolean) and new (object) API responses
        const installed = connectedResult && 
          (typeof connectedResult === 'boolean' 
            ? connectedResult 
            : (connectedResult as { isConnected?: boolean }).isConnected);
        
        if (!installed) {
          setState(prev => ({
            ...prev,
            isFreighterInstalled: false,
            isLoading: false,
          }));
          return;
        }

        // Check if already allowed
        const allowedResult = await isAllowed();
        const allowed = allowedResult && 
          (typeof allowedResult === 'boolean'
            ? allowedResult
            : (allowedResult as { isAllowed?: boolean }).isAllowed);
        
        if (allowed) {
          // Get current address
          const publicKey = await getPublicKey();
          
          // Get current network
          const networkResult = await getNetwork();
          const network = typeof networkResult === 'string' 
            ? networkResult 
            : (networkResult as { network?: string })?.network;
          
          if (publicKey) {
            setState({
              isConnected: true,
              isFreighterInstalled: true,
              publicKey,
              network: network || null,
              isLoading: false,
              isConnecting: false,
              error: null,
            });
          } else {
            setState(prev => ({
              ...prev,
              isFreighterInstalled: true,
              isLoading: false,
            }));
          }
        } else {
          setState(prev => ({
            ...prev,
            isFreighterInstalled: true,
            isLoading: false,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Connection check failed",
        }));
      }
    };

    checkConnection();
    
    // Cleanup watcher on unmount
    return () => {
      if (watcherRef.current) {
        clearInterval(watcherRef.current);
      }
    };
  }, []);

  // Watch for account/network changes when connected
  useEffect(() => {
    if (!state.isConnected || !state.publicKey) {
      if (watcherRef.current) {
        clearInterval(watcherRef.current);
        watcherRef.current = null;
      }
      return;
    }

    // Poll for changes every 2 seconds
    watcherRef.current = setInterval(async () => {
      try {
        const currentAddress = await getPublicKey();
        
        const networkResult = await getNetwork();
        const currentNetwork = typeof networkResult === 'string'
          ? networkResult
          : (networkResult as { network?: string })?.network;

        // Check if address changed
        if (currentAddress && currentAddress !== state.publicKey) {
          setState(prev => ({
            ...prev,
            publicKey: currentAddress,
            network: currentNetwork || null,
          }));
        }
        
        // Check if network changed
        if (currentNetwork && currentNetwork !== state.network) {
          setState(prev => ({
            ...prev,
            network: currentNetwork,
          }));
        }
        
        // Check if disconnected from Freighter
        if (!currentAddress) {
          setState(prev => ({
            ...prev,
            isConnected: false,
            publicKey: null,
            network: null,
          }));
        }
      } catch (error) {
        // Silently handle polling errors
        console.warn('Wallet watch error:', error);
      }
    }, 2000);

    return () => {
      if (watcherRef.current) {
        clearInterval(watcherRef.current);
        watcherRef.current = null;
      }
    };
  }, [state.isConnected, state.publicKey, state.network]);

  // Connect to wallet - triggers Freighter popup
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Check if Freighter is installed
      const connectedResult = await checkFreighterConnected();
      const installed = connectedResult && 
        (typeof connectedResult === 'boolean'
          ? connectedResult
          : (connectedResult as { isConnected?: boolean }).isConnected);
      
      if (!installed) {
        throw new Error("Freighter wallet extension not detected");
      }

      // Request access - this opens the Freighter popup
      const accessResult = await requestAccess();
      
      // Handle the response - can be string (address) or object with address/error
      let publicKey: string | undefined;
      
      if (typeof accessResult === 'string') {
        publicKey = accessResult;
      } else if (accessResult && typeof accessResult === 'object') {
        const result = accessResult as { address?: string; error?: string };
        if (result.error) {
          throw new Error(result.error);
        }
        publicKey = result.address;
      }

      if (!publicKey) {
        throw new Error("Connection was rejected or no address returned");
      }

      // Get network info
      const networkResult = await getNetwork();
      const network = typeof networkResult === 'string'
        ? networkResult
        : (networkResult as { network?: string })?.network;

      // Verify correct network
      const expectedNetwork = CURRENT_NETWORK === "mainnet" ? "PUBLIC" : "TESTNET";
      if (network && network !== expectedNetwork) {
        throw new Error(`Please switch Freighter to ${CURRENT_NETWORK === "mainnet" ? "Public" : "Testnet"} network`);
      }

      setState({
        isConnected: true,
        isFreighterInstalled: true,
        publicKey,
        network: network || null,
        isLoading: false,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect";
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      throw error; // Re-throw so modal can handle it
    }
  }, []);

  // Disconnect (clear local state - Freighter doesn't have a true disconnect)
  const disconnect = useCallback(() => {
    if (watcherRef.current) {
      clearInterval(watcherRef.current);
      watcherRef.current = null;
    }
    setState({
      isConnected: false,
      isFreighterInstalled: true,
      publicKey: null,
      network: null,
      isLoading: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    clearError,
    isAdmin: state.publicKey === CONTRACT_CONFIG.adminAddress,
  };
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
function safeGetTransactionError(response: any): string {
  try {
    // Only try to access resultXdr if it exists and transaction failed
    if (response?.resultXdr) {
      // If it's already a string, return it
      if (typeof response.resultXdr === 'string') {
        return `Transaction failed: ${response.resultXdr.substring(0, 100)}`;
      }
      // Otherwise, don't try to parse - just return generic message
      return "Transaction failed on chain";
    }
    return "Transaction failed on chain";
  } catch (error) {
    // If any error occurs during parsing, just return generic message
    console.warn("Could not parse transaction error details:", error);
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
      console.error("XDR parsing error:", xdrError);
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
        console.log(`Transaction confirmed: ${result.hash}`);
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
        console.warn("XDR parsing error during confirmation, but transaction was submitted:", confirmError);
        // Return the hash since transaction was submitted successfully
        // User can verify on block explorer
        return result.hash;
      }
      // Re-throw other errors
      throw confirmError;
    }
    
  } catch (error) {
    // Enhanced error logging
    console.error("Contract transaction error:", {
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
    purpose: string
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
      const allLoans: Loan[] = [];
      
      for (let i = 1; i <= totalLoans; i++) {
        const loan = await getLoanDetails(publicKey, i);
        // Only include pending (not approved) loans
        if (!loan.approved) {
          allLoans.push(loan);
        }
      }
      
      setLoans(allLoans);
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
      const allCircles: CircleDetails[] = [];
      
      for (let i = 1; i <= totalCircles; i++) {
        const circle = await getCircleDetails(publicKey, i);
        allCircles.push(circle);
      }
      
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
