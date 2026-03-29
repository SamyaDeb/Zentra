/**
 * Stellar Contract Client for Zentra TrustCircles
 * 
 * This module provides functions to interact with the TrustCircles
 * Soroban smart contract on Stellar.
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
