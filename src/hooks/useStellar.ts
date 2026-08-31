/**
 * React Hooks for Stellar/Freighter Wallet Integration
 *
 * Barrel re-export so existing `import { ... } from '@/src/hooks/useStellar'`
 * call sites keep working. The implementation is split across:
 *   - useWallet.ts         (Freighter wallet connection state)
 *   - useContractWrites.ts (contract write/transaction hooks)
 *   - useContractReads.ts  (contract read/data-fetching hooks)
 */

export * from "./useWallet";
export * from "./useContractWrites";
export * from "./useContractReads";
