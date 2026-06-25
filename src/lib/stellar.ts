/**
 * Stellar Contract Client for Zentra TrustCircles
 *
 * This module provides functions to interact with the TrustCircles
 * Soroban smart contract on Stellar (Contract ID: CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27).
 *
 * CONTRACT FUNCTION MAPPING (lib.rs → stellar.ts):
 * ─────────────────────────────────────────────────
 * Contract Function          Frontend Function
 * ─────────────────────────────────────────────────
 * initialize()               (one-time deploy step, not exposed)
 *
 * Circle Management:
 *   create_circle()        → createCircleCall()   [write]
 *   join_circle()          → joinCircleCall()     [write]
 *
 * Scoring (read-only):
 *   get_circle_average_score() → (called internally)
 *   get_trust_score()          → getTrustScore()
 *   get_max_loan_amount()      → getMaxLoanAmount()
 *   get_interest_rate()        → getInterestRate()
 *
 * Loan Management:
 *   request_loan()         → requestLoanCall()    [write]
 *   approve_loan()         → approveLoanCall()    [write, admin]
 *   repay_loan()           → repayLoanCall()      [write]
 *   penalize_default()     → penalizeDefaultCall() [write, admin]
 *
 * Admin:
 *   deposit_liquidity()    → depositLiquidityCall() [write, admin]
 *   withdraw()             → withdrawCall()          [write, admin]
 *   set_demo_mode()        → setDemoModeCall()       [write, admin]
 *   set_demo_loan_duration() → setDemoLoanDurationCall() [write, admin]
 *   unfreeze_account()     → unfreezeAccountCall()   [write, admin]
 *
 * View Functions (read-only):
 *   get_user_stats()       → getUserStats()
 *   get_circle_details()   → getCircleDetails()
 *   get_loan_details()     → getLoanDetails()
 *   get_user_loans()       → getUserLoans()
 *   is_loan_overdue()      → isLoanOverdue()
 *   get_contract_balance() → getContractBalance()
 *   get_admin()            → getAdmin()
 *   get_circle_count()     → getCircleCount()
 *   get_loan_count()       → getLoanCount()
 *   is_demo_mode()         → isDemoMode()
 */

import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  scValToNative,
  nativeToScVal,
  Address,
} from "@stellar/stellar-sdk";
import {
  networkConfig,
  CONTRACT_CONFIG,
  CURRENT_NETWORK,
} from "../../config/stellarConfig";

// ============ TYPES ============

export interface UserStats {
  circleId: number;
  individualScore: number;
  finalTrustScore: number;
  maxLoanAmount: bigint;
  interestRate: number;
  totalBorrowed: bigint;
  totalRepaid: bigint;
  loansCompleted: number;
  hasActiveLoan: boolean;
  isActive: boolean;
}

export interface CircleDetails {
  name: string;
  members: string[];
  memberCount: number;
  averageScore: number;
  totalStake: bigint;
  isActive: boolean;
}

export interface Loan {
  id: number;
  borrower: string;
  amount: bigint;
  interestAmount: bigint;
  totalRepayment: bigint;
  requestLedger: number;
  approvalLedger: number;
  dueLedger: number;
  repaymentLedger: number;
  approved: boolean;
  disbursed: boolean;
  repaid: boolean;
  purpose: string;
}

// ============ RPC CLIENT ============

export function getSorobanServer(): rpc.Server {
  return new rpc.Server(networkConfig.sorobanRpcUrl);
}

export function getNetworkPassphrase(): string {
  return CURRENT_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;
}

// ============ CONTRACT CLIENT ============

export function getContract(): Contract {
  if (!CONTRACT_CONFIG.contractId) {
    throw new Error("Contract ID not configured. Please set NEXT_PUBLIC_CONTRACT_ID");
  }
  return new Contract(CONTRACT_CONFIG.contractId);
}

// ============ HELPER FUNCTIONS ============

/**
 * Parse contract response into native JavaScript types
 */
function parseContractResponse<T>(result: xdr.ScVal): T {
  return scValToNative(result) as T;
}

/**
 * Simulate a contract call (read-only operations)
 */
async function simulateContractCall(
  sourceAccount: string,
  method: string,
  args: xdr.ScVal[]
): Promise<xdr.ScVal> {
  const server = getSorobanServer();
  const contract = getContract();
  
  // Get account
  const account = await server.getAccount(sourceAccount);
  
  // Build transaction
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();
  
  // Simulate
  const simulation = await server.simulateTransaction(tx);
  
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${simulation.error}`);
  }
  
  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw new Error("Simulation did not succeed");
  }
  
  // Get result
  const result = simulation.result;
  if (!result) {
    throw new Error("No result from simulation");
  }
  
  return result.retval;
}

// ============ READ FUNCTIONS ============

/**
 * Get user's complete stats
 */
export async function getUserStats(userAddress: string): Promise<UserStats> {
  const result = await simulateContractCall(
    userAddress,
    "get_user_stats",
    [new Address(userAddress).toScVal()]
  );
  
  const raw = parseContractResponse<Record<string, unknown>>(result);
  
  return {
    circleId: Number(raw.circle_id),
    individualScore: Number(raw.individual_score),
    finalTrustScore: Number(raw.final_trust_score),
    maxLoanAmount: BigInt(raw.max_loan_amount as string),
    interestRate: Number(raw.interest_rate),
    totalBorrowed: BigInt(raw.total_borrowed as string),
    totalRepaid: BigInt(raw.total_repaid as string),
    loansCompleted: Number(raw.loans_completed),
    hasActiveLoan: raw.has_active_loan as boolean,
    isActive: raw.is_active as boolean,
  };
}

/**
 * Get circle details
 */
export async function getCircleDetails(
  sourceAccount: string,
  circleId: number
): Promise<CircleDetails> {
  const result = await simulateContractCall(
    sourceAccount,
    "get_circle_details",
    [nativeToScVal(circleId, { type: "u32" })]
  );
  
  const raw = parseContractResponse<Record<string, unknown>>(result);
  
  return {
    name: raw.name as string,
    members: (raw.members as string[]) || [],
    memberCount: Number(raw.member_count),
    averageScore: Number(raw.average_score),
    totalStake: BigInt(raw.total_stake as string),
    isActive: raw.is_active as boolean,
  };
}

/**
 * Get loan details
 */
export async function getLoanDetails(
  sourceAccount: string,
  loanId: number
): Promise<Loan> {
  const result = await simulateContractCall(
    sourceAccount,
    "get_loan_details",
    [nativeToScVal(loanId, { type: "u32" })]
  );
  
  const raw = parseContractResponse<Record<string, unknown>>(result);
  
  return {
    id: Number(raw.id),
    borrower: raw.borrower as string,
    amount: BigInt(raw.amount as string),
    interestAmount: BigInt(raw.interest_amount as string),
    totalRepayment: BigInt(raw.total_repayment as string),
    requestLedger: Number(raw.request_ledger),
    approvalLedger: Number(raw.approval_ledger),
    dueLedger: Number(raw.due_ledger),
    repaymentLedger: Number(raw.repayment_ledger),
    approved: raw.approved as boolean,
    disbursed: raw.disbursed as boolean,
    repaid: raw.repaid as boolean,
    purpose: raw.purpose as string,
  };
}

/**
 * Get user's trust score
 */
export async function getTrustScore(userAddress: string): Promise<number> {
  const result = await simulateContractCall(
    userAddress,
    "get_trust_score",
    [new Address(userAddress).toScVal()]
  );
  
  return Number(parseContractResponse<bigint>(result));
}

/**
 * Get user's max loan amount
 */
export async function getMaxLoanAmount(userAddress: string): Promise<bigint> {
  const result = await simulateContractCall(
    userAddress,
    "get_max_loan_amount",
    [new Address(userAddress).toScVal()]
  );
  
  return BigInt(parseContractResponse<string>(result));
}

/**
 * Get interest rate for user
 */
export async function getInterestRate(userAddress: string): Promise<number> {
  const result = await simulateContractCall(
    userAddress,
    "get_interest_rate",
    [new Address(userAddress).toScVal()]
  );
  
  return Number(parseContractResponse<bigint>(result));
}

/**
 * Get user's loan IDs
 */
export async function getUserLoans(userAddress: string): Promise<number[]> {
  const result = await simulateContractCall(
    userAddress,
    "get_user_loans",
    [new Address(userAddress).toScVal()]
  );
  
  const ids = parseContractResponse<number[]>(result);
  return ids.map(Number);
}

/**
 * Get contract balance
 */
export async function getContractBalance(sourceAccount: string): Promise<bigint> {
  const result = await simulateContractCall(
    sourceAccount,
    "get_contract_balance",
    []
  );
  
  return BigInt(parseContractResponse<string>(result));
}

/**
 * Get total circle count
 */
export async function getCircleCount(sourceAccount: string): Promise<number> {
  const result = await simulateContractCall(
    sourceAccount,
    "get_circle_count",
    []
  );
  
  return Number(parseContractResponse<bigint>(result));
}

/**
 * Get total loan count
 */
export async function getLoanCount(sourceAccount: string): Promise<number> {
  const result = await simulateContractCall(
    sourceAccount,
    "get_loan_count",
    []
  );
  
  return Number(parseContractResponse<bigint>(result));
}

/**
 * Check if loan is overdue
 */
export async function isLoanOverdue(
  sourceAccount: string,
  loanId: number
): Promise<boolean> {
  const result = await simulateContractCall(
    sourceAccount,
    "is_loan_overdue",
    [nativeToScVal(loanId, { type: "u32" })]
  );
  
  return parseContractResponse<boolean>(result);
}

/**
 * Check if demo mode is enabled
 */
export async function isDemoMode(sourceAccount: string): Promise<boolean> {
  const result = await simulateContractCall(
    sourceAccount,
    "is_demo_mode",
    []
  );
  
  return parseContractResponse<boolean>(result);
}

/**
 * Get admin address
 */
export async function getAdmin(sourceAccount: string): Promise<string> {
  const result = await simulateContractCall(
    sourceAccount,
    "get_admin",
    []
  );

  return parseContractResponse<string>(result);
}

// ============ WRITE FUNCTION WRAPPERS ============
// These expose contract write functions as plain async helpers.
// React hooks in useStellar.ts wrap these with transaction signing.

export async function createCircleCall(
  publicKey: string,
  name: string
): Promise<xdr.ScVal[]> {
  return [new Address(publicKey).toScVal(), nativeToScVal(name, { type: "string" })];
}

export async function joinCircleCall(
  publicKey: string,
  circleId: number
): Promise<xdr.ScVal[]> {
  return [new Address(publicKey).toScVal(), nativeToScVal(circleId, { type: "u32" })];
}

export async function requestLoanCall(
  publicKey: string,
  amountStroops: bigint,
  purpose: string
): Promise<xdr.ScVal[]> {
  return [
    new Address(publicKey).toScVal(),
    nativeToScVal(amountStroops, { type: "i128" }),
    nativeToScVal(purpose, { type: "string" }),
  ];
}

export async function approveLoanCall(loanId: number): Promise<xdr.ScVal[]> {
  return [nativeToScVal(loanId, { type: "u32" })];
}

export async function repayLoanCall(
  publicKey: string,
  loanId: number
): Promise<xdr.ScVal[]> {
  return [new Address(publicKey).toScVal(), nativeToScVal(loanId, { type: "u32" })];
}

export async function penalizeDefaultCall(loanId: number): Promise<xdr.ScVal[]> {
  return [nativeToScVal(loanId, { type: "u32" })];
}

export async function depositLiquidityCall(amountStroops: bigint): Promise<xdr.ScVal[]> {
  return [nativeToScVal(amountStroops, { type: "i128" })];
}

export async function withdrawCall(amountStroops: bigint): Promise<xdr.ScVal[]> {
  return [nativeToScVal(amountStroops, { type: "i128" })];
}

export async function setDemoModeCall(enabled: boolean): Promise<xdr.ScVal[]> {
  return [nativeToScVal(enabled, { type: "bool" })];
}

export async function setDemoLoanDurationCall(durationLedgers: number): Promise<xdr.ScVal[]> {
  return [nativeToScVal(durationLedgers, { type: "u32" })];
}

export async function unfreezeAccountCall(userAddress: string): Promise<xdr.ScVal[]> {
  return [new Address(userAddress).toScVal()];
}
