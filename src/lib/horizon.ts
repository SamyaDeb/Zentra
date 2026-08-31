/**
 * Horizon lookups for the TrustCircles admin account's signer set.
 *
 * Once the admin account is converted to a Stellar-native multisig (see
 * docs/multisig-admin-runbook.md), "is this wallet the admin" is no longer
 * a simple address equality check — it's "is this wallet one of the admin
 * account's registered signers." Horizon is the source of truth for that,
 * since Soroban itself has no concept of the account's signer list.
 */

import { networkConfig, CONTRACT_CONFIG } from "../../config/stellarConfig";

export interface HorizonSigner {
  key: string;
  weight: number;
  type: string;
}

interface HorizonThresholds {
  low_threshold: number;
  med_threshold: number;
  high_threshold: number;
}

interface HorizonAccountResponse {
  signers?: HorizonSigner[];
  thresholds?: HorizonThresholds;
}

export interface AdminAccountInfo {
  signers: HorizonSigner[];
  thresholds: HorizonThresholds;
}

/**
 * Fetch the admin account's current signers and thresholds from Horizon.
 * Returns null on any network/parse failure rather than throwing, since
 * callers use this for UI gating and should fail closed (not authorized)
 * rather than crash the page.
 */
export async function fetchAdminAccountInfo(): Promise<AdminAccountInfo | null> {
  try {
    const res = await fetch(
      `${networkConfig.horizonUrl}/accounts/${CONTRACT_CONFIG.adminAddress}`
    );
    if (!res.ok) return null;

    const data: HorizonAccountResponse = await res.json();
    if (!data.signers || !data.thresholds) return null;

    return { signers: data.signers, thresholds: data.thresholds };
  } catch {
    return null;
  }
}

/**
 * Whether `publicKey` is a registered signer (weight > 0) given an
 * already-fetched AdminAccountInfo (or null, e.g. Horizon was
 * unreachable) — shared by isAuthorizedAdminSigner and by callers like
 * useFreighterWallet that also need the signer count and fetch info
 * themselves rather than paying for two separate Horizon round trips.
 */
export function deriveIsAuthorizedSigner(
  info: AdminAccountInfo | null,
  publicKey: string
): boolean {
  if (!info) return publicKey === CONTRACT_CONFIG.adminAddress; // fail open only to today's baseline behavior
  return info.signers.some((s) => s.key === publicKey && s.weight > 0);
}

/**
 * Whether `publicKey` is a registered signer (weight > 0) on the admin
 * account — true for the original sole admin key today, and for every
 * co-signer once the account is converted to a multisig.
 */
export async function isAuthorizedAdminSigner(publicKey: string): Promise<boolean> {
  const info = await fetchAdminAccountInfo();
  return deriveIsAuthorizedSigner(info, publicKey);
}
