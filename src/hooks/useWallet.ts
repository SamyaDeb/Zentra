/**
 * React Hook for Freighter Wallet Integration
 *
 * Provides the hook for connecting to and tracking the Freighter wallet
 * (installed/allowed state, connected address, network, connect/disconnect).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  isConnected as checkFreighterConnected,
  isAllowed,
  requestAccess,
  getNetwork,
  getPublicKey,
} from "@stellar/freighter-api";
import { CURRENT_NETWORK } from "../../config/stellarConfig";
import { fetchAdminAccountInfo, deriveIsAuthorizedSigner } from "../lib/horizon";

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

  // Whether the connected wallet is a registered signer on the admin
  // account (see src/lib/horizon.ts) — true for the sole admin key today,
  // and for every co-signer once the account becomes a multisig.
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  // Number of registered signers on the admin account (>1 once it's a
  // multisig) — lets the UI warn that single-click admin actions will fail
  // alone and point to the co-sign console instead.
  const [adminSignerCount, setAdminSignerCount] = useState<number | null>(null);

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

  // Check admin-signer status whenever the connected address changes
  useEffect(() => {
    if (!state.isConnected || !state.publicKey) {
      setIsAdmin(false);
      setAdminSignerCount(null);
      return;
    }

    let cancelled = false;
    setIsAdminLoading(true);

    fetchAdminAccountInfo().then((info) => {
      if (!cancelled) {
        setIsAdmin(deriveIsAuthorizedSigner(info, state.publicKey!));
        setAdminSignerCount(info?.signers.filter((s) => s.weight > 0).length ?? null);
        setIsAdminLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state.isConnected, state.publicKey]);

  return {
    ...state,
    connect,
    disconnect,
    clearError,
    isAdmin,
    isAdminLoading,
    adminSignerCount,
  };
}
