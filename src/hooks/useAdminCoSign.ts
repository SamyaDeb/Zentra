/**
 * Hook backing the admin "co-sign console" (components/AdminCoSignConsole.tsx).
 *
 * Once the admin account requires more than one signature (see
 * docs/multisig-admin-runbook.md), no single Freighter popup can produce a
 * submittable transaction on its own. This hook builds a transaction sourced
 * from the admin account, lets the connected wallet add one signature to it,
 * and lets a second admin load that XDR, add their own signature, and
 * submit — reusing buildUnsignedTransaction/submitSignedTransaction from
 * useContractWrites.ts and signTransaction from Freighter, same as every
 * other write hook in this codebase.
 */

"use client";

import { useState, useCallback } from "react";
import { xdr } from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { getNetworkPassphrase } from "../lib/stellar";
import {
  buildAdminActionXdr,
  countSignatures,
  type AdminMultisigMethod,
} from "../lib/adminMultisig";
import { submitSignedTransaction } from "./useContractWrites";

interface CoSignState {
  xdr: string | null;
  signatureCount: number;
  isPending: boolean;
  isSubmitted: boolean;
  txHash: string | null;
  error: string | null;
}

const initialState: CoSignState = {
  xdr: null,
  signatureCount: 0,
  isPending: false,
  isSubmitted: false,
  txHash: null,
  error: null,
};

export function useAdminCoSign() {
  const [state, setState] = useState<CoSignState>(initialState);

  /** Build a fresh admin action and add the connected wallet's signature. */
  const startAction = useCallback(async (method: AdminMultisigMethod, args: xdr.ScVal[]) => {
    setState({ ...initialState, isPending: true });
    try {
      const unsigned = await buildAdminActionXdr(method, args);
      const signed = await signTransaction(unsigned, {
        networkPassphrase: getNetworkPassphrase(),
      });
      setState({ ...initialState, xdr: signed, signatureCount: countSignatures(signed) });
    } catch (error) {
      setState({
        ...initialState,
        error: error instanceof Error ? error.message : "Failed to build transaction",
      });
    }
  }, []);

  /** Load an XDR another co-signer already partially signed. */
  const loadXdr = useCallback((pastedXdr: string) => {
    try {
      const signatureCount = countSignatures(pastedXdr);
      setState({ ...initialState, xdr: pastedXdr, signatureCount });
    } catch {
      setState({ ...initialState, error: "That doesn't look like valid transaction XDR" });
    }
  }, []);

  /** Add the connected wallet's signature to the currently loaded XDR. */
  const addSignature = useCallback(async () => {
    if (!state.xdr) {
      setState((s) => ({ ...s, error: "Build or load a transaction first" }));
      return;
    }
    setState((s) => ({ ...s, isPending: true, error: null }));

    try {
      const signed = await signTransaction(state.xdr, {
        networkPassphrase: getNetworkPassphrase(),
      });
      setState((s) => ({ ...s, xdr: signed, signatureCount: countSignatures(signed), isPending: false }));
    } catch (error) {
      setState((s) => ({
        ...s,
        isPending: false,
        error: error instanceof Error ? error.message : "Failed to add signature",
      }));
    }
  }, [state.xdr]);

  /** Submit the currently loaded XDR (assumes enough signatures are attached). */
  const submit = useCallback(async () => {
    if (!state.xdr) {
      setState((s) => ({ ...s, error: "Nothing to submit yet" }));
      return;
    }
    setState((s) => ({ ...s, isPending: true, error: null }));

    try {
      const txHash = await submitSignedTransaction(state.xdr);
      setState((s) => ({ ...s, isPending: false, isSubmitted: true, txHash }));
    } catch (error) {
      setState((s) => ({
        ...s,
        isPending: false,
        error: error instanceof Error ? error.message : "Submission failed",
      }));
    }
  }, [state.xdr]);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, startAction, loadXdr, addSignature, submit, reset };
}
