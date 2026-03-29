# Zentra Architecture Documentation

## System Overview

Zentra is a decentralized trust-based lending protocol built on Stellar blockchain with Soroban smart contracts. The platform enables under-collateralized loans through community-driven Trust Circles.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Landing Page │  │User Dashboard│  │Admin Dashboard│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ useStellar   │  │ useWallet    │  │ useRedirect  │          │
│  │ React Hooks  │  │ Integration  │  │ Role-based   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Blockchain Integration Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Stellar SDK  │  │ Freighter    │  │ Soroban RPC  │          │
│  │ Client       │  │ Wallet API   │  │ Connection   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Stellar Blockchain                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            TrustCircles Smart Contract (Rust)             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │Trust Circles │  │ Loan Manager │  │Trust Scoring │   │   │
│  │  │   Storage    │  │   Storage    │  │   Engine     │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Frontend Layer (Next.js 14)

**Technology Stack:**
- Framework: Next.js 14.2.0 (App Router)
- UI: React 18.3, TailwindCSS
- State Management: React Query (@tanstack/react-query)
- TypeScript for type safety

**Key Components:**

#### Pages
- `/` - Landing page with hero section and feature showcase
- `/user` - User dashboard for loan management and circle participation
- `/admin` - Admin dashboard for loan approvals and liquidity management

#### Components
- `Navbar.tsx` - Navigation with wallet connection
- `ConnectButton.tsx` - Freighter wallet integration button
- `WalletModal.tsx` - Wallet selection interface
- `CustomCursor.tsx` - Custom UI cursor

#### Hooks
- `useStellar.ts` - Stellar/Soroban transaction management
- `useRoleRedirect.ts` - Role-based routing logic

---

### 2. Blockchain Integration Layer

**Stellar SDK Integration (`/src/lib/stellar.ts`):**

```typescript
Key Functions:
├── getPublicClient()      // Get Soroban RPC client
├── getContractClient()    // Initialize contract client
├── simulateTransaction()  // Simulate before submission
├── signTransaction()      // Sign with Freighter
└── submitTransaction()    // Submit to network
```

**Wallet Integration:**
- Freighter API v2.0.0 for wallet connection
- Direct popup integration (no modal)
- Transaction signing and approval flow

**Transaction Flow:**
```
1. Build Transaction → 2. Simulate → 3. Assemble with auth
                                              ↓
6. Wait for confirmation ← 5. Submit ← 4. Sign (Freighter)
```

**Error Handling:**
- XDR parsing error protection (`safeGetTransactionError`)
- Transaction timeout handling
- Network error recovery

---

### 3. Smart Contract Layer (Soroban/Rust)

**Contract Address:** `CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27`

**Core Modules:**

#### Trust Circle Module
```rust
Functions:
├── create_circle()         // Create new trust circle
├── join_circle()          // Join existing circle
├── get_circle_details()   // Fetch circle info
├── get_circle_avg_score() // Calculate circle trust score
└── leave_circle()         // Exit circle (future)
```

#### Loan Management Module
```rust
Functions:
├── request_loan()         // Submit loan request
├── approve_loan()         // Admin approval + disburse
├── repay_loan()          // Repay loan + update score
├── get_active_loans()    // Fetch user loans
└── penalize_default()    // Handle default penalties
```

#### Trust Scoring Engine
```rust
Calculation:
Final Score = (Individual Score × 0.6) + (Circle Avg Score × 0.4)

Score Adjustments:
├── Early repayment:    +15 points
├── On-time repayment:  +10 points
├── Late (3-7 days):    -5 points
├── Very late (7-14):   -30 points
├── Default (14+ days): -50 points + freeze
└── Circle default:     -20 points (all members)
```

#### Liquidity Pool Module
```rust
Functions:
├── deposit_liquidity()   // Admin adds funds
├── withdraw()           // Admin withdraws
└── get_pool_balance()   // Check available funds
```

---

### 4. Data Flow Diagrams

#### User Loan Request Flow
```
User Dashboard → Request Loan Button → useStellar Hook
                                            ↓
                            Build Transaction (request_loan)
                                            ↓
                            Simulate on Soroban RPC
                                            ↓
                            Freighter Popup (Sign)
                                            ↓
                            Submit to Stellar Network
                                            ↓
                            Wait for Confirmation
                                            ↓
                    Update UI (Success/Error Alert)
```

#### Trust Score Calculation Flow
```
User Account → Fetch Individual Score (contract)
                        ↓
               Fetch Circle ID
                        ↓
               Fetch Circle Avg Score
                        ↓
        Calculate: Final = (Ind × 0.6) + (Circle × 0.4)
                        ↓
               Display in Dashboard
```

#### Admin Loan Approval Flow
```
Admin Dashboard → View Pending Loans → Check Trust Score
                                            ↓
                                   Approve Button Click
                                            ↓
                            Build Transaction (approve_loan)
                                            ↓
                            Sign with Admin Wallet
                                            ↓
                        Disburse XLM to Borrower
                                            ↓
                        Update Loan Status (Active)
```

---

### 5. State Management

**Client-Side State:**
- Wallet connection status (React state)
- User role (admin/user) - stored in localStorage
- Transaction loading states
- Error messages and alerts

**Blockchain State (Source of Truth):**
- User trust scores
- Circle memberships
- Loan records (amount, status, due date)
- Liquidity pool balance

**Data Fetching Strategy:**
- On-demand fetching when user navigates
- React Query for caching and refetching
- Polling for transaction confirmations

---

### 6. Security Architecture

**Frontend Security:**
- Environment variables for sensitive config
- No private keys stored in frontend
- HTTPS only in production
- Input validation on all forms

**Smart Contract Security:**
- Admin-only functions (deposit, approve, withdraw)
- Reentrancy protection
- Integer overflow protection (Rust safety)
- Authorization checks on all mutations

**Wallet Security:**
- Non-custodial (Freighter manages keys)
- Transaction signing requires user approval
- Clear transaction details shown before signing

**Network Security:**
- Stellar Testnet for development
- Rate limiting on RPC calls (via Stellar infrastructure)
- Transaction simulation before submission

---

### 7. Deployment Architecture

**Frontend Hosting:**
- Platform: Vercel
- Region: US East (iad1)
- Build: Next.js static optimization
- CDN: Vercel Edge Network

**Smart Contract:**
- Network: Stellar Testnet (Soroban)
- Deployment: via Stellar CLI
- Contract invocation: via Soroban RPC

**Environment Configuration:**
```bash
Production:
├── NEXT_PUBLIC_CONTRACT_ID      # Deployed contract address
├── NEXT_PUBLIC_NATIVE_TOKEN_ID  # XLM SAC address
└── Stellar RPC endpoint          # Hardcoded in config
```

---

### 8. Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Blockchain | Stellar/Soroban | Low fees, fast finality, Rust contracts |
| Frontend | Next.js 14 | SSR, App Router, TypeScript support |
| Styling | TailwindCSS | Rapid UI development, utility-first |
| Wallet | Freighter | Most popular Stellar wallet |
| Smart Contract | Rust/Soroban SDK | Memory safety, performance, native support |
| Deployment | Vercel | Zero-config Next.js deployment |

---

### 9. Scalability Considerations

**Current Limitations:**
- Single admin address (centralized approval)
- Fixed loan duration (7 days)
- Manual liquidity deposits
- No automated interest calculation

**Future Improvements:**
- Multi-sig admin approval
- Automated market maker (AMM) for liquidity
- Dynamic loan durations
- Oracle integration for price feeds
- Layer 2 scaling solutions

---

### 10. Testing Strategy

**Frontend Tests:**
- Component unit tests (Jest + React Testing Library)
- Integration tests for user flows
- E2E tests with Playwright (future)

**Smart Contract Tests:**
- Rust unit tests (`cargo test`)
- Integration tests with test ledger
- Scenario-based testing (create circle → loan → repay)

**Manual Testing:**
- Testnet deployment testing
- Wallet integration testing
- Transaction flow validation

---

## Glossary

- **Trust Circle**: Group of 3-10 users who vouch for each other
- **Trust Score**: 0-100 score based on repayment history
- **XLM**: Native token of Stellar blockchain
- **Soroban**: Stellar's smart contract platform
- **SAC**: Stellar Asset Contract (wrapper for assets)
- **RPC**: Remote Procedure Call (for blockchain queries)
- **Freighter**: Browser extension wallet for Stellar

---

## References

- [Stellar Documentation](https://developers.stellar.org)
- [Soroban Docs](https://soroban.stellar.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [Freighter API](https://docs.freighter.app)
