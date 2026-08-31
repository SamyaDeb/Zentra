/**
 * Admin multi-sig transaction building for the co-sign console.
 *
 * All 7 admin-gated contract calls (see contracts/trust_circles/src/lib.rs)
 * must be sourced from the admin account itself, NOT the connected wallet's
 * own account — that's what lets Soroban's implicit source-account
 * authorization accept the classic Stellar multisig signatures collected on
 * the admin account (see docs/multisig-admin-runbook.md for why).
 */

import { TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { CONTRACT_CONFIG } from "../../config/stellarConfig";
import { getNetworkPassphrase } from "./stellar";
import { buildUnsignedTransaction } from "../hooks/useContractWrites";

export const ADMIN_MULTISIG_METHODS = [
  "approve_loan",
  "penalize_default",
  "deposit_liquidity",
  "withdraw",
  "set_demo_mode",
  "set_demo_loan_duration",
  "unfreeze_account",
] as const;

export type AdminMultisigMethod = (typeof ADMIN_MULTISIG_METHODS)[number];

/**
 * Build and simulate an admin contract call sourced from the admin account,
 * returning unsigned transaction XDR ready for the first co-signer.
 */
export async function buildAdminActionXdr(
  method: AdminMultisigMethod,
  args: xdr.ScVal[]
): Promise<string> {
  return buildUnsignedTransaction(CONTRACT_CONFIG.adminAddress, method, args);
}

/** Number of signatures currently attached to a transaction envelope XDR. */
export function countSignatures(xdrBase64: string): number {
  const tx = TransactionBuilder.fromXDR(xdrBase64, getNetworkPassphrase());
  return tx.signatures.length;
}
