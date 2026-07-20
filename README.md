# Zentra - Decentralized Trust-Based Lending Protocol

<img width="1470" height="814" alt="Screenshot 2026-03-30 at 2 18 35 PM" src="https://github.com/user-attachments/assets/d568f3f1-c097-4a7d-9abf-f6c3916f50b7" />

**Enabling Under-Collateralized Lending in Web3 through Community-Driven Trust Scores**

![Zentra Badge](https://img.shields.io/badge/Track-Web3%20Credit-blue)
![Status](https://img.shields.io/badge/Status-Live%20MVP-green)
![Network](https://img.shields.io/badge/Network-Stellar%20Mainnet-brightgreen)
![CI/CD](https://github.com/SamyaDeb/Zentra/actions/workflows/ci.yml/badge.svg)
---

## Quick Links

| Resource | Link |
|----------|------|
| **Live Demo** | [https://zentra-flame.vercel.app](https://zentra-flame.vercel.app) |
| **Demo Video** | [Watch on YouTube](https://youtu.be/wu8JSs2Qkpc?si=3HYdR1cBmW340v8s) |
| **Smart Contract** | [View on Stellar Expert](https://stellar.expert/explorer/public/contract/CATTV5OCFI6TZQF26ZROIEP2RCY7M3G3OYZTS4IZGPWWXREN337O5K4Q) |
| **Monitoring Dashboard** | [/monitoring](https://zentra-flame.vercel.app/monitoring) |
| **Users Data & Review** |[Users Excel Sheet ](https://1drv.ms/x/c/9f264c155550732d/IQDv6drh97jETYdn9E1coIINAdDjcHDkIybLHCs_1tp4OFQ?e=2jMWP6) |
---

## Level 5 Hackathon Submission Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **Live Demo Deployed** | ✅ Complete | [https://zentra-flame.vercel.app](https://zentra-flame.vercel.app) |
| **CI/CD Pipeline** | ✅ Complete | https://github.com/SamyaDeb/Zentra/actions/runs/23719242981 |
| **Smart Contract Deployed** | ✅ Complete | Mainnet `CATTV5OCFI6TZQF26ZROIEP2RCY7M3G3OYZTS4IZGPWWXREN337O5K4Q` |
| **Mobile Responsive** | ✅ Complete | See screenshots below |
| **5 Loan Tiers Implemented** | ✅ Complete | Trust score ranges: 0-59, 60-69, 70-79, 80-89, 90-100 |
| **Documentation** | ✅ Complete | ARCHITECTURE.md, TECHNICAL_DOCS.md, USER_GUIDE.md |
| **Security Audit** | ✅ Complete | SECURITY_CHECKLIST.md |
| **Registered Users** | ✅ Complete | [35+ verified users Excel Sheet Data](https://1drv.ms/x/c/9f264c155550732d/IQDv6drh97jETYdn9E1coIINAdDjcHDkIybLHCs_1tp4OFQ?e=jjMH5q) |

---

## Level 5 Upgrade (v1.1) — Product & Technical Improvements

Following the feedback round in [FEEDBACK.md](./FEEDBACK.md), this upgrade closes out the top two requested features, a real contract bug, and Level 5's product/technical bar:

| Requirement | What changed |
|---|---|
| **Product improvement from feedback** | `leave_circle` (14 requests) and flexible 7/30/60/90-day loan durations (18 requests) — the two most-requested features — are now implemented on-chain, not just tracked in FEEDBACK.md |
| **UX/UI & stability** | Fixed mobile navbar overlap around the wallet connect button (BUG-003); fixed a contract bug where loans matured in ~1 day instead of the documented 7 (see [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md#v11-audit-addendum--contract-upgrade-flexible-durations--circle-exit)) |
| **Onboarding optimization** | New dismissible 4-step "Getting Started" guide on the user dashboard (connect → join/create circle → request loan → repay on time) |
| **Contract audit / upgrade** | New `leave_circle` function and `request_loan` duration parameter, both unit-tested (26/26 tests passing); self-audit documented in SECURITY_CHECKLIST.md, including a reentrancy-ordering fix |
| **Technical standard: 20+ commits** | This upgrade alone shipped as a series of scoped commits (contract, frontend wiring, UI, mobile fix, onboarding, audit, docs) — see `git log` |
| **Updated documentation** | README, SECURITY_CHECKLIST.md, and FEEDBACK.md all updated to reflect the new functions and resolved action items |

> The v1.1 contract was validated end-to-end on testnet before the production release. The production deployment below is a separate mainnet instance using the hardened WASM.

---

## Screenshots

### Mobile Responsive View
<img width="385" height="650" alt="Screenshot 2026-03-30 at 2 48 25 AM" src="https://github.com/user-attachments/assets/f8c383f3-189d-447e-a6fd-fdd6b51de6ce" />


### CI/CD Pipeline
<img width="1470" height="706" alt="Screenshot 2026-03-30 at 2 39 49 AM" src="https://github.com/user-attachments/assets/57d788dc-afd4-4643-97a1-ee1bc3150a38" />

---

## Contract & Transaction Details

| Item | Value |
|------|-------|
| **Contract Address** | `CATTV5OCFI6TZQF26ZROIEP2RCY7M3G3OYZTS4IZGPWWXREN337O5K4Q` |
| **Admin Address** | `GBALWWEQCFTHQ6FXSBRSB7X7WX5VVYBOVGT3GB34VABGY4MTB2F52FGX` |
| **Token Contract (XLM SAC)** | `CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA` |
| **Network** | Stellar Mainnet (Soroban) |
| **Deployed** | 2026-07-20 |

[View the production contract on Stellar Expert →](https://stellar.expert/explorer/public/contract/CATTV5OCFI6TZQF26ZROIEP2RCY7M3G3OYZTS4IZGPWWXREN337O5K4Q)

### Mainnet Deployment Transactions

| Action | Transaction |
|---|---|
| Upload optimized WASM | [4f73abe1…fed7aae](https://stellar.expert/explorer/public/tx/4f73abe16c49ad3c8fe232e7e8861f0e9f7fff96dbdfd86bfbad081f0fed7aae) |
| Deploy contract instance | [8552855e…309d57](https://stellar.expert/explorer/public/tx/8552855e132a02e00166b810e099a2def0f5a2d894d304630a9d298baf309d57) |
| Initialize admin and XLM SAC | [d8ddb01c…b68b7f](https://stellar.expert/explorer/public/tx/d8ddb01c2c5cb29dd61ef1c786bfcb1a548c2b7e81602ed23eb91bfcb4b68b7f) |

### v1.1 Mainnet Redeployment — Real Transaction Log

Every row below is a real, independently verifiable testnet transaction exercising the upgraded contract (not a unit test):

| # | Action | Tx Hash |
|---|--------|---------|
| 1 | Upload WASM | [`073d4c63be...c5824a5`](https://stellar.expert/explorer/testnet/tx/073d4c63be785148364be020064357b137e02da9feae9332216f2bea98b471bd) |
| 2 | Deploy contract | [`59882222c8...f8a0a8`](https://stellar.expert/explorer/testnet/tx/59882222c84e07723895c8ffbda038ebda854d033bde6a726661e260bfb8a0a8) |
| 3 | `initialize(admin, token_id)` | [`5f600a9e83...392a55a`](https://stellar.expert/explorer/testnet/tx/5f600a9e834cb7ce1380f91f0199638d7ba3ffe9dd84ca220af2cc031392a55a) |
| 4 | `create_circle` ("Vendors Guild") | [`15bc233613...2ae90`](https://stellar.expert/explorer/testnet/tx/15bc2336135b5bd6954d4ab3aa334125f21bf5e41233db75cb9ff29cad52ae90) |
| 5 | `join_circle` (member 2) | [`28cb89eccb...1d6e19`](https://stellar.expert/explorer/testnet/tx/28cb89eccb8b59886bb8d8e89a568f13e8e27a3896eb05c12e88650d481d6e19) |
| 6 | `join_circle` (member 3 — circle activates) | [`f8900667d6...daa0bbe`](https://stellar.expert/explorer/testnet/tx/f8900667d638aa5d0e6b592b1cad98ef760f03170d9568a3be63faf27daa0bbe) |
| 7 | `deposit_liquidity` (1,000 XLM) | [`ef1065ffbc...19edce8`](https://stellar.expert/explorer/testnet/tx/ef1065ffbc57a9f6f69192bab60b6adadfd86b7fc286ed455f0c0d4ae19edce8) |
| 8 | `request_loan` (50 XLM, **30-day** tier) | [`3f0248cec1...aeb0ed0`](https://stellar.expert/explorer/testnet/tx/3f0248cec17d93c6acca3fcb032c065fe5592b05312d46e7d98dd9580aeb0ed0) |
| 9 | `approve_loan` (disburses funds) | [`47c57356f4...f32aa8843`](https://stellar.expert/explorer/testnet/tx/47c57356f4abf46682c0e0b3d555017aad5e45e9da3e21f7f13a591f32aa8843) |
| 10 | `repay_loan` (early — trust score 50 → 65) | [`28cf6b6683...0bf07be43`](https://stellar.expert/explorer/testnet/tx/28cf6b6683a64b7f59b17627839e068195a1b00f4ed8ecf5ae80f600bf07be43) |
| 11 | `leave_circle` (stake refunded, circle deactivates) | [`cd261c2135...d155f3e8`](https://stellar.expert/explorer/testnet/tx/cd261c21357e5ab44b3ed1ed7199bed74168e3bbcdf41ff090874828d155f3e8) |

Transaction #8's on-chain result confirms the duration-tier fix: `request_ledger: 3598960`, `due_ledger: 4117367` — a difference of exactly `518400` ledgers (`30 × 17280`), matching the borrower's chosen 30-day tier.

> Configure production builds with `NEXT_PUBLIC_STELLAR_NETWORK=mainnet`, the mainnet contract ID above, and the mainnet XLM SAC.

---

## Problem Statement

Web3 lacks a standard, privacy-preserving credit score, forcing users to over-collateralize loans and limiting access to capital. Current lending protocols require 150-200% collateralization—users must lock up more assets than they borrow. This restricts capital efficiency and excludes millions of small vendors from accessing credit based on their on-chain behavior.

**Our mission:** Enable trust-based, under-collateralized lending for small vendors using on-chain data and community validation through Trust Circles.

---

## Our Solution

Zentra introduces a **decentralized Trust Score system** that enables under-collateralized loans through:

### Trust Score System (0-100 Scale)

| Component | Weight | Description |
|-----------|--------|-------------|
| **Individual Score** | 60% | Based on repayment history and loan performance |
| **Circle Score** | 40% | Average score of Trust Circle members |
| **Starting Score** | 50 | All new members start with 50 points |

**Score Adjustments:**
- Early repayment: +15 points
- On-time repayment: +10 points
- Late payment (3-7 days): -5 points
- Very late (7-14 days): -30 points
- Default (14+ days): -50 points + account freeze

### Key Features

- **Trust Circles** - Community-based lending groups where members vouch for each other (3-10 members)
- **Circle Exit** - Leave a circle any time (with no active loan) and reclaim your staked XLM
- **Under-Collateralized Loans** - Borrow without 100% collateral based on trust score
- **Flexible Loan Durations** - Choose a 7/30/60/90-day repayment period per loan
- **Dynamic Credit Limits** - Borrowing capacity increases with positive repayment behavior
- **Collective Accountability** - If one member defaults, entire circle loses 20 points each
- **Cross-Border Flows** - SEP-24/SEP-31 anchor integration for fiat on/off ramps
- **On-Chain Tracking** - All loan history transparently recorded on Stellar blockchain
- **Low Entry Barrier** - Only 10 XLM stake required to join a circle

---

## Loan Tiers

| Trust Score | Max Loan | Interest Rate |
|-------------|----------|---------------|
| < 60 | 100 XLM | 6% |
| 60-69 | 200 XLM | 4% |
| 70-79 | 500 XLM | 4% |
| 80-89 | 1000 XLM | 2% |
| 90-100 | 2000 XLM | 2% |

### Repayment Durations

Borrowers pick a repayment tier when requesting a loan; the contract validates
the choice on-chain (`request_loan(..., duration_days)`):

| Duration | Ledgers (mainnet timing) |
|----------|--------------------------|
| 7 days | 120,960 |
| 30 days | 518,400 |
| 60 days | 1,036,800 |
| 90 days | 1,555,200 |

---

## Technical Stack

**Smart Contracts & Blockchain:**
- Rust + Soroban SDK 22.0
- Stellar Testnet (Soroban smart contracts)
- SEP-24/SEP-31 Anchor Integration

**Frontend:**
- Next.js 14.2.0
- React 18.3
- TypeScript
- TailwindCSS

**Web3 Integration:**
- @stellar/stellar-sdk (Stellar/Soroban interaction)
- @stellar/freighter-api (Freighter wallet)
- Soroban RPC

---

## Advanced Features

### SEP-24/SEP-31 Cross-Border Integration

Zentra integrates with Stellar anchors for fiat on/off ramps:

- **SEP-24 Deposit:** Convert USD/EUR/INR to XLM via interactive deposit
- **SEP-24 Withdraw:** Convert XLM back to fiat currency
- **SEP-31 Send:** Cross-border remittances via direct payment protocol

[Access Cross-Border Features →](https://zentra-flame.vercel.app/cross-border)

### Data Indexing Approach

We use a hybrid approach for data querying:
- **On-demand fetching** from Soroban RPC for real-time data
- **React Query caching** with configurable stale times
- **Horizon API** for transaction history and account data

See [DATA_INDEXING.md](./DATA_INDEXING.md) for detailed documentation.

---

## Registered Users (Beta Testers)

| # | Wallet Address | Status | Verified |
|---|----------------|--------|----------|
| 1 | `GDDEMSPPQN72KNJJNCCOTIINYCSFZV6SGI5UCOFMBBXK3UMUQ5E23REJ` | Active | [View on Stellar Expert](https://stellar.expert/explorer/testnet/account/GDDEMSPPQN72KNJJNCCOTIINYCSFZV6SGI5UCOFMBBXK3UMUQ5E23REJ) |
| 2 | `GBC6CGPG3JVSHEGO3TVMSHJ6UAVL4OA4H4TZSH4P7TRTF2V3RRFVOVHJ` | Active | [View on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBC6CGPG3JVSHEGO3TVMSHJ6UAVL4OA4H4TZSH4P7TRTF2V3RRFVOVHJ) |
| 3 | `GA3QEKYH3AJUF37L5CW66QNAIGCMRUBRHPLTM74HDHA4BHCE2TYI5ZNC` | Active | [View on Stellar Expert](https://stellar.expert/explorer/testnet/account/GA3QEKYH3AJUF37L5CW66QNAIGCMRUBRHPLTM74HDHA4BHCE2TYI5ZNC) |
| 4 | `GAID6F2HZ57QELA3SEJOVRA4VJU5BTJJKJZU6LQ4EJJLZAHF7P6S5XZO` | Active | [View on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAID6F2HZ57QELA3SEJOVRA4VJU5BTJJKJZU6LQ4EJJLZAHF7P6S5XZO) |
| 5 | `GCVDMNBJNKZFW5RVCARGIUAAAL364ODLPYDYM4UKGUJTS6NZG55H3M2J` | Active | [View on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCVDMNBJNKZFW5RVCARGIUAAAL364ODLPYDYM4UKGUJTS6NZG55H3M2J) |

---

## Getting Started

### Prerequisites
```bash
Node.js 18+
npm or yarn
Rust + cargo (for contract development)
Stellar CLI (stellar)
Freighter Wallet Extension
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SamyaDeb/Zentra.git
cd Zentra/Zentra
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Fill in the following:
```
NEXT_PUBLIC_CONTRACT_ID=CATTV5OCFI6TZQF26ZROIEP2RCY7M3G3OYZTS4IZGPWWXREN337O5K4Q
NEXT_PUBLIC_NATIVE_TOKEN_ID=CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA
NEXT_PUBLIC_STELLAR_NETWORK=mainnet
```

4. **Run development server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and design |
| [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md) | API reference and developer guide |
| [USER_GUIDE.md](./USER_GUIDE.md) | End-user documentation |
| [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) | Security audit checklist |
| [DATA_INDEXING.md](./DATA_INDEXING.md) | Data indexing approach |
| [FEEDBACK.md](./FEEDBACK.md) | User feedback documentation |

---

## User Flows

### Borrower Flow
1. **Connect Wallet** → Freighter wallet
2. **Create/Join Trust Circle** → Stake 10 XLM minimum
3. **Wait for Circle Activation** → Need 3 members minimum
4. **View Trust Score** → Individual + Circle average
5. **Request Loan** → Enter amount & purpose
6. **Get Approval** → Admin reviews and approves
7. **Receive Funds** → Automatic disbursement in XLM
8. **Repay on Schedule** → 7-day loan duration

### Admin Flow
1. **Deposit Liquidity** → Add XLM to lending pool
2. **Review Pending Loans** → Check borrower trust scores
3. **Approve Loans** → One-click approval + disbursement
4. **Monitor Repayments** → Track on-chain activity
5. **Handle Defaults** → Penalize overdue loans
6. **Withdraw Funds** → Access available balance

---

## Project Structure

```
Zentra/
├── app/
│   ├── admin/                  # Admin dashboard
│   ├── user/                   # User dashboard
│   ├── monitoring/             # System monitoring dashboard
│   ├── cross-border/           # SEP-24/SEP-31 integration
│   ├── providers.tsx           # React providers
│   ├── layout.tsx              # App layout
│   └── page.tsx                # Home page
├── components/                 # React components
├── contracts/                  # Soroban smart contracts
├── src/
│   ├── lib/
│   │   ├── stellar.ts          # Contract client
│   │   └── sep-integration.ts  # SEP-24/SEP-31 client
│   └── hooks/
│       ├── useStellar.ts       # Stellar hooks
│       └── useSepIntegration.ts # SEP hooks
├── .github/workflows/          # CI/CD pipeline
├── ARCHITECTURE.md             # Architecture documentation
├── TECHNICAL_DOCS.md           # Technical documentation
├── USER_GUIDE.md               # User guide
├── SECURITY_CHECKLIST.md       # Security checklist
├── DATA_INDEXING.md            # Data indexing approach
├── FEEDBACK.md                 # User feedback
└── REGISTERED_USERS.csv        # Beta tester wallet addresses
```

---

## Frontend ↔ Contract Integration

The frontend integrates directly with the deployed mainnet TrustCircles Soroban contract (`CATTV5OCFI6TZQF26ZROIEP2RCY7M3G3OYZTS4IZGPWWXREN337O5K4Q`) via `@stellar/stellar-sdk` and `@stellar/freighter-api`.

### Integration Files

| File | Purpose |
|---|---|
| `src/lib/stellar.ts` | Low-level contract client — builds `contract.call(fnName, ...args)`, simulates via `server.simulateTransaction()`, and submits signed transactions |
| `src/hooks/useStellar.ts` | React hooks wrapping every `lib.rs` function with Freighter wallet signing |
| `app/user/page.tsx` | Imports and calls `useCreateCircle`, `useJoinCircle`, `useLeaveCircle`, `useRequestLoan`, `useRepayLoan` |
| `app/admin/page.tsx` | Imports and calls `useDepositLiquidity`, `useApproveLoan`, `useWithdraw`, `usePenalizeDefault`, `useUnfreezeAccount`, `useSetDemoMode`, `useSetDemoLoanDuration` |

### How the Contract Is Called (src/lib/stellar.ts)

Every write and read operation goes through `@stellar/stellar-sdk`'s `Contract.call()`:

```typescript
import { Contract, TransactionBuilder, BASE_FEE, Networks,
         rpc, nativeToScVal, Address } from "@stellar/stellar-sdk";

const CONTRACT_ID = "CATTV5OCFI6TZQF26ZROIEP2RCY7M3G3OYZTS4IZGPWWXREN337O5K4Q";
const contract = new Contract(CONTRACT_ID);
const server   = new rpc.Server("https://mainnet.sorobanrpc.com");

// Read — simulate only (no signature required)
const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(contract.call("get_user_stats", new Address(userAddress).toScVal()))
  .setTimeout(30).build();
const simulation = await server.simulateTransaction(tx);
const result = scValToNative(simulation.result.retval);

// Write — simulate → assemble footprint → sign with Freighter → submit
const writeTx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(contract.call("create_circle",
      new Address(publicKey).toScVal(),
      nativeToScVal(name, { type: "string" })))
  .setTimeout(300).build();
const sim      = await server.simulateTransaction(writeTx);
const prepared = rpc.assembleTransaction(writeTx, sim).build();
const signedXdr = await signTransaction(prepared.toXDR(), { networkPassphrase: Networks.TESTNET });
const submitted = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET));
```

### React Hooks (src/hooks/useStellar.ts) — each calls the matching lib.rs function

```typescript
// useCreateCircle → contract "create_circle"
export function useCreateCircle() {
  const createCircle = useCallback(async (publicKey: string, name: string) => {
    await submitContractTransaction(publicKey, "create_circle", [
      new Address(publicKey).toScVal(),
      nativeToScVal(name, { type: "string" }),
    ]);
  }, []);
  return { createCircle, isPending, isSuccess, error, txHash };
}

// useLeaveCircle → contract "leave_circle"
export function useLeaveCircle() {
  const leaveCircle = useCallback(async (publicKey: string) => {
    await submitContractTransaction(publicKey, "leave_circle", [
      new Address(publicKey).toScVal(),
    ]);
  }, []);
  return { leaveCircle, isPending, isSuccess, error, txHash };
}

// useRequestLoan → contract "request_loan" (duration_days: 7 | 30 | 60 | 90)
export function useRequestLoan() {
  const requestLoan = useCallback(async (publicKey: string, amountXlm: number, purpose: string, durationDays: number) => {
    await submitContractTransaction(publicKey, "request_loan", [
      new Address(publicKey).toScVal(),
      nativeToScVal(xlmToStroops(amountXlm), { type: "i128" }),
      nativeToScVal(purpose, { type: "string" }),
      nativeToScVal(durationDays, { type: "u32" }),
    ]);
  }, []);
  return { requestLoan, isPending, isSuccess, error, txHash };
}

// useWithdraw → contract "withdraw"
export function useWithdraw() {
  const withdraw = useCallback(async (publicKey: string, amountXlm: number) => {
    await submitContractTransaction(publicKey, "withdraw", [
      nativeToScVal(xlmToStroops(amountXlm), { type: "i128" }),
    ]);
  }, []);
  return { withdraw, isPending, isSuccess, error, txHash };
}

// usePenalizeDefault → contract "penalize_default"
export function usePenalizeDefault() {
  const penalizeDefault = useCallback(async (publicKey: string, loanId: number) => {
    await submitContractTransaction(publicKey, "penalize_default", [
      nativeToScVal(loanId, { type: "u32" }),
    ]);
  }, []);
  return { penalizeDefault, isPending, isSuccess, error, txHash };
}

// useUnfreezeAccount → contract "unfreeze_account"
export function useUnfreezeAccount() {
  const unfreezeAccount = useCallback(async (publicKey: string, userAddress: string) => {
    await submitContractTransaction(publicKey, "unfreeze_account", [
      new Address(userAddress).toScVal(),
    ]);
  }, []);
  return { unfreezeAccount, isPending, isSuccess, error, txHash };
}
```

### UI Pages Import and Invoke These Hooks Directly

```typescript
// app/user/page.tsx
import { useCreateCircle, useJoinCircle, useRequestLoan, useRepayLoan } from '@/src/hooks/useStellar';
const { createCircle } = useCreateCircle();   // triggers lib.rs create_circle()
const { joinCircle }   = useJoinCircle();     // triggers lib.rs join_circle()
const { requestLoan }  = useRequestLoan();    // triggers lib.rs request_loan()
const { repayLoan }    = useRepayLoan();      // triggers lib.rs repay_loan()

// app/admin/page.tsx
import { useDepositLiquidity, useApproveLoan, useWithdraw,
         usePenalizeDefault, useUnfreezeAccount,
         useSetDemoMode, useSetDemoLoanDuration } from '@/src/hooks/useStellar';
const { depositLiquidity }    = useDepositLiquidity();    // triggers lib.rs deposit_liquidity()
const { approveLoan }         = useApproveLoan();         // triggers lib.rs approve_loan()
const { withdraw }            = useWithdraw();            // triggers lib.rs withdraw()
const { penalizeDefault }     = usePenalizeDefault();     // triggers lib.rs penalize_default()
const { unfreezeAccount }     = useUnfreezeAccount();     // triggers lib.rs unfreeze_account()
const { setDemoMode }         = useSetDemoMode();         // triggers lib.rs set_demo_mode()
const { setDemoLoanDuration } = useSetDemoLoanDuration(); // triggers lib.rs set_demo_loan_duration()
```

### Complete Function Mapping (lib.rs → stellar.ts → useStellar.ts → UI)

| `lib.rs` Function | `stellar.ts` (contract.call) | `useStellar.ts` Hook | UI Page |
|---|---|---|---|
| `create_circle(creator, name)` | `"create_circle"` | `useCreateCircle()` | `app/user/page.tsx` |
| `join_circle(member, circle_id)` | `"join_circle"` | `useJoinCircle()` | `app/user/page.tsx` |
| `leave_circle(member)` | `"leave_circle"` | `useLeaveCircle()` | `app/user/page.tsx` |
| `request_loan(borrower, amount, purpose, duration_days)` | `"request_loan"` | `useRequestLoan()` | `app/user/page.tsx` |
| `repay_loan(borrower, loan_id)` | `"repay_loan"` | `useRepayLoan()` | `app/user/page.tsx` |
| `approve_loan(loan_id)` | `"approve_loan"` | `useApproveLoan()` | `app/admin/page.tsx` |
| `deposit_liquidity(amount)` | `"deposit_liquidity"` | `useDepositLiquidity()` | `app/admin/page.tsx` |
| `withdraw(amount)` | `"withdraw"` | `useWithdraw()` | `app/admin/page.tsx` |
| `penalize_default(loan_id)` | `"penalize_default"` | `usePenalizeDefault()` | `app/admin/page.tsx` |
| `unfreeze_account(user)` | `"unfreeze_account"` | `useUnfreezeAccount()` | `app/admin/page.tsx` |
| `set_demo_mode(enabled)` | `"set_demo_mode"` | `useSetDemoMode()` | `app/admin/page.tsx` |
| `set_demo_loan_duration(ledgers)` | `"set_demo_loan_duration"` | `useSetDemoLoanDuration()` | `app/admin/page.tsx` |
| `get_user_stats(user)` | `"get_user_stats"` | `useUserStats()` | `app/user/page.tsx` |
| `get_circle_details(id)` | `"get_circle_details"` | `useCircleDetails()` | `app/user/page.tsx` |
| `get_loan_details(id)` | `"get_loan_details"` | `useUserLoansData()` | `app/user/page.tsx` |
| `get_user_loans(user)` | `"get_user_loans"` | `useUserLoansData()` | `app/user/page.tsx` |
| `get_trust_score(user)` | `"get_trust_score"` | via `useUserStats()` | `app/user/page.tsx` |
| `get_max_loan_amount(user)` | `"get_max_loan_amount"` | via `useUserStats()` | `app/user/page.tsx` |
| `get_interest_rate(user)` | `"get_interest_rate"` | via `useUserStats()` | `app/user/page.tsx` |
| `get_contract_balance()` | `"get_contract_balance"` | `useContractBalanceData()` | `app/admin/page.tsx` |
| `get_circle_count()` | `"get_circle_count"` | `useAllCircles()` | Both pages |
| `get_loan_count()` | `"get_loan_count"` | `useAllPendingLoans()` | `app/admin/page.tsx` |
| `is_loan_overdue(id)` | `"is_loan_overdue"` | loan detail views | `app/user/page.tsx` |
| `is_demo_mode()` | `"is_demo_mode"` | admin state read | `app/admin/page.tsx` |
| `get_admin()` | `"get_admin"` | auth check | `app/admin/page.tsx` |

---

## Security

See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for the complete security audit.

**Summary:**
- Smart Contract Security: ✅ Pass (95/100)
- Frontend Security: ✅ Pass (90/100)
- Infrastructure Security: ✅ Pass (85/100)

---

## Future Roadmap

- [ ] Flexible loan durations (30/60/90 days)
- [ ] Vendor business profiles
- [ ] Revenue-based credit limits
- [ ] Circle-based insurance pools
- [ ] Mobile app
- [ ] Mainnet deployment

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Team

**Project Lead:** Samya Deb  
**GitHub:** [SamyaDeb](https://github.com/SamyaDeb)  
**Email:** sammodeb28@gmail.com

---

## Acknowledgments

- **Stellar Development Foundation** - Blockchain infrastructure
- **Soroban** - Smart contract platform
- **Freighter** - Stellar wallet

---

## Support

For questions, issues, or partnerships:
- **GitHub Issues:** [Report bugs](https://github.com/SamyaDeb/Zentra/issues)
- **Email:** sammodeb28@gmail.com

---

**Built with love for Small Vendors**
