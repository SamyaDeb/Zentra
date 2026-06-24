/**
 * Stellar Network Configuration for Zentra
 * 
 * Configures connection to Stellar Testnet for the TrustCircles contract.
 */

// Network configurations
export const STELLAR_NETWORKS = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
    sorobanRpcUrl: "https://soroban-testnet.stellar.org",
    friendbotUrl: "https://friendbot.stellar.org",
  },
  mainnet: {
    networkPassphrase: "Public Global Stellar Network ; September 2015",
    horizonUrl: "https://horizon.stellar.org",
    sorobanRpcUrl: "https://soroban.stellar.org",
    friendbotUrl: null,
  },
} as const;

// Current network (change to 'mainnet' for production)
export const CURRENT_NETWORK: keyof typeof STELLAR_NETWORKS = "testnet";

// Get current network config
export const networkConfig = STELLAR_NETWORKS[CURRENT_NETWORK];

// Contract configuration
export const CONTRACT_CONFIG = {
  // Contract ID - will be set after deployment
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || "",
  
  // Admin address (from instructions)
  adminAddress: "GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT",
  
  // Native XLM token (SAC - Stellar Asset Contract for native XLM)
  nativeTokenId: process.env.NEXT_PUBLIC_NATIVE_TOKEN_ID || "",
};

// XLM Constants (7 decimals)
export const XLM_DECIMALS = 7;
export const STROOPS_PER_XLM = 10_000_000; // 10^7

// Convert XLM to stroops (raw units)
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * STROOPS_PER_XLM));
}

// Convert stroops to XLM
export function stroopsToXlm(stroops: bigint | number): number {
  return Number(stroops) / STROOPS_PER_XLM;
}

// Format XLM for display
export function formatXlm(stroops: bigint | number, decimals: number = 2): string {
  const xlm = stroopsToXlm(stroops);
  return xlm.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Contract constants (matching Rust contract)
export const CONTRACT_CONSTANTS = {
  MIN_STAKE: xlmToStroops(10),        // 10 XLM minimum stake
  MIN_CIRCLE_MEMBERS: 3,               // Minimum members to activate circle
  MAX_CIRCLE_MEMBERS: 10,              // Maximum members per circle
  STARTING_SCORE: 50,                  // Default trust score
  MAX_SCORE: 100,                      // Maximum trust score
};

// Loan tier configuration (based on trust score)
export const LOAN_TIERS = [
  { minScore: 0, maxScore: 59, maxLoan: 100, interestRate: 6 },
  { minScore: 60, maxScore: 69, maxLoan: 200, interestRate: 4 },
  { minScore: 70, maxScore: 79, maxLoan: 500, interestRate: 4 },
  { minScore: 80, maxScore: 89, maxLoan: 1000, interestRate: 2 },
  { minScore: 90, maxScore: 100, maxLoan: 2000, interestRate: 2 },
] as const;

// Get loan tier for a given score
export function getLoanTier(score: number) {
  return LOAN_TIERS.find(tier => score >= tier.minScore && score <= tier.maxScore) || LOAN_TIERS[0];
}

// Ledger timing constants
export const LEDGER_CONSTANTS = {
  SECONDS_PER_LEDGER: 5,               // ~5 seconds per ledger
  LEDGERS_PER_DAY: 17_280,             // 86400 / 5
  LEDGERS_PER_WEEK: 120_960,           // 7 * 17280
  DEFAULT_LOAN_DURATION: 120_960,      // 7 days in ledgers
  DEMO_LOAN_DURATION: 120,             // ~10 minutes in ledgers
};

// Convert ledgers to human-readable time
export function ledgersToTime(ledgers: number): string {
  const seconds = ledgers * LEDGER_CONSTANTS.SECONDS_PER_LEDGER;
  
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  return `${Math.round(seconds / 86400)} days`;
}
