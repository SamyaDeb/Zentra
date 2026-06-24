# Zentra Technical Documentation

## API Reference & Developer Guide

---

## Table of Contents

1. [Smart Contract API](#smart-contract-api)
2. [Frontend Integration](#frontend-integration)
3. [Contract Deployment](#contract-deployment)
4. [Development Setup](#development-setup)
5. [Testing Guide](#testing-guide)
6. [API Endpoints](#api-endpoints)

---

## Smart Contract API

### Contract Information

- **Contract ID:** `CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27`
- **Network:** Stellar Testnet
- **Language:** Rust (Soroban SDK 22.0)
- **Token:** Native XLM (SAC: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`)

---

### Initialization

#### `initialize`

Initializes the contract with admin and token configuration.

**Parameters:**
```rust
admin: Address       // Admin wallet address
token_id: Address    // Native XLM token contract address
```

**Example (Stellar CLI):**
```bash
stellar contract invoke \
  --id CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27 \
  --source admin-key \
  --network testnet \
  -- \
  initialize \
  --admin GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT \
  --token_id CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

**Authorization:** None (can only be called once)

---

### Trust Circle Functions

#### `create_circle`

Creates a new trust circle. Requires 10 XLM stake.

**Parameters:**
```rust
creator: Address     // Circle creator's wallet
name: String        // Circle name (max 32 chars)
```

**Returns:** `u32` - Circle ID

**Example (Frontend):**
```typescript
import { contractClient } from '@/lib/stellar';

const circleId = await contractClient.create_circle({
  creator: userAddress,
  name: 'Small Vendors Circle'
});
```

**Storage:**
```rust
Circle {
  id: u32,
  name: String,
  members: Vec<Address>,
  created_at: u64
}
```

---

#### `join_circle`

Join an existing trust circle. Requires 10 XLM stake.

**Parameters:**
```rust
member: Address      // Joiner's wallet
circle_id: u32      // Circle ID to join
```

**Returns:** `bool` - Success status

**Constraints:**
- Circle must exist
- Member not already in a circle
- Circle has < 10 members

**Example:**
```typescript
const success = await contractClient.join_circle({
  member: userAddress,
  circle_id: 1
});
```

---

#### `get_circle_details`

Fetch circle information.

**Parameters:**
```rust
circle_id: u32      // Circle ID
```

**Returns:**
```rust
Circle {
  id: u32,
  name: String,
  members: Vec<Address>,
  created_at: u64
}
```

**Example:**
```typescript
const circle = await contractClient.get_circle_details({
  circle_id: 1
});
console.log(circle.members.length); // Number of members
```

---

#### `get_circle_average_score`

Calculate circle's average trust score.

**Parameters:**
```rust
circle_id: u32      // Circle ID
```

**Returns:** `u32` - Average score (0-100)

**Calculation:**
```rust
sum_of_all_member_scores / number_of_members
```

**Example:**
```typescript
const avgScore = await contractClient.get_circle_average_score({
  circle_id: 1
});
```

---

### Loan Management Functions

#### `request_loan`

Submit a loan request.

**Parameters:**
```rust
borrower: Address    // Borrower's wallet
amount: i128        // Loan amount in stroops (1 XLM = 10^7 stroops)
purpose: String     // Loan purpose (max 128 chars)
```

**Returns:** `u32` - Loan ID

**Constraints:**
- Borrower must be in active circle (3+ members)
- No existing active loan
- Amount <= max loan for trust score
- Account not frozen

**Example:**
```typescript
const loanId = await contractClient.request_loan({
  borrower: userAddress,
  amount: BigInt(300 * 10_000_000), // 300 XLM
  purpose: 'Inventory purchase'
});
```

**Storage:**
```rust
Loan {
  id: u32,
  borrower: Address,
  amount: i128,
  interest: i128,
  total_repayment: i128,
  due_date: u64,
  status: LoanStatus,
  purpose: String,
  created_at: u64
}
```

---

#### `approve_loan`

Approve and disburse loan (Admin only).

**Parameters:**
```rust
loan_id: u32        // Loan ID to approve
```

**Returns:** `bool` - Success status

**Effects:**
- Sets due_date = current_time + 7 days
- Transfers XLM from contract to borrower
- Updates loan status to Active

**Authorization:** Admin only

**Example:**
```typescript
const success = await contractClient.approve_loan({
  loan_id: 5
});
```

---

#### `repay_loan`

Repay an active loan.

**Parameters:**
```rust
borrower: Address    // Borrower's wallet
loan_id: u32        // Loan ID to repay
```

**Returns:** `bool` - Success status

**Effects:**
- Transfers total_repayment from borrower to contract
- Updates trust score based on timing
- Updates loan status to Repaid

**Score Updates:**
```rust
if current_time < due_date:           +15 points (early)
else if current_time == due_date:     +10 points (on-time)
else if late < 3 days:                -5 points
else if late < 7 days:                -30 points
else:                                  -50 points + freeze
```

**Example:**
```typescript
const success = await contractClient.repay_loan({
  borrower: userAddress,
  loan_id: 5
});
```

---

#### `get_active_loans`

Fetch user's active loans.

**Parameters:**
```rust
user: Address       // User's wallet
```

**Returns:** `Vec<Loan>` - Array of active loans

**Example:**
```typescript
const loans = await contractClient.get_active_loans({
  user: userAddress
});
```

---

#### `penalize_default`

Penalize overdue loan (Admin only).

**Parameters:**
```rust
loan_id: u32        // Loan ID to penalize
```

**Returns:** `bool` - Success status

**Effects:**
- Borrower: -50 points + account freeze
- Circle members: -20 points each
- Loan status: Defaulted

**Authorization:** Admin only

---

### Trust Score Functions

#### `get_trust_score`

Get user's final trust score.

**Parameters:**
```rust
user: Address       // User's wallet
```

**Returns:** `u32` - Trust score (0-100)

**Calculation:**
```rust
individual_score = get_individual_score(user)
circle_id = get_user_circle(user)
circle_avg = get_circle_average_score(circle_id)

final_score = (individual_score * 60 + circle_avg * 40) / 100
```

**Example:**
```typescript
const score = await contractClient.get_trust_score({
  user: userAddress
});
```

---

#### `get_max_loan_amount`

Get maximum borrowable amount for user.

**Parameters:**
```rust
user: Address       // User's wallet
```

**Returns:** `i128` - Max loan in stroops

**Tiers:**
```rust
score < 60:   100 XLM
60-69:        200 XLM
70-79:        500 XLM
80-89:       1000 XLM
90-100:      2000 XLM
```

**Example:**
```typescript
const maxLoan = await contractClient.get_max_loan_amount({
  user: userAddress
});
const maxXLM = Number(maxLoan) / 10_000_000;
```

---

#### `get_interest_rate`

Get interest rate for user.

**Parameters:**
```rust
user: Address       // User's wallet
```

**Returns:** `u32` - Interest rate (percentage × 100)

**Rates:**
```rust
score < 60:   600 (6%)
60-79:        400 (4%)
80-100:       200 (2%)
```

**Example:**
```typescript
const rate = await contractClient.get_interest_rate({
  user: userAddress
});
const percentage = rate / 100; // Convert to actual percentage
```

---

### Admin Functions

#### `deposit_liquidity`

Deposit XLM to lending pool (Admin only).

**Parameters:**
```rust
amount: i128        // Amount in stroops
```

**Returns:** `bool` - Success status

**Authorization:** Admin only

**Example:**
```typescript
const success = await contractClient.deposit_liquidity({
  amount: BigInt(10000 * 10_000_000) // 10,000 XLM
});
```

---

#### `withdraw`

Withdraw available funds (Admin only).

**Parameters:**
```rust
to: Address         // Recipient wallet
amount: i128        // Amount in stroops
```

**Returns:** `bool` - Success status

**Authorization:** Admin only

**Example:**
```typescript
const success = await contractClient.withdraw({
  to: adminAddress,
  amount: BigInt(5000 * 10_000_000) // 5,000 XLM
});
```

---

#### `unfreeze_account`

Unfreeze a defaulted account (Admin only).

**Parameters:**
```rust
user: Address       // User to unfreeze
```

**Returns:** `bool` - Success status

**Authorization:** Admin only

---

#### `set_demo_mode`

Toggle demo mode for testing (Admin only).

**Parameters:**
```rust
enabled: bool       // true = demo mode on
```

**Returns:** `bool` - Success status

**Effects in Demo Mode:**
- Shorter loan durations
- Reduced stake requirements
- Instant approvals (optional)

**Authorization:** Admin only

---

## Frontend Integration

### Setup

#### 1. Install Dependencies

```bash
npm install @stellar/stellar-sdk @stellar/freighter-api
```

#### 2. Configure Environment

Create `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ID=CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27
NEXT_PUBLIC_NATIVE_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

#### 3. Initialize Contract Client

`/src/lib/stellar.ts`:
```typescript
import { Contract, SorobanRpc } from '@stellar/stellar-sdk';

const rpcUrl = 'https://soroban-testnet.stellar.org';
const server = new SorobanRpc.Server(rpcUrl);

export function getContractClient() {
  return new Contract(process.env.NEXT_PUBLIC_CONTRACT_ID!);
}
```

---

### Transaction Flow

#### Build → Simulate → Sign → Submit

```typescript
import { TransactionBuilder, Operation } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

async function submitContractTransaction(
  method: string,
  params: any[]
) {
  // 1. Build transaction
  const account = await server.getAccount(userAddress);
  const contract = getContractClient();
  
  const transaction = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(180)
    .build();

  // 2. Simulate
  const simulated = await server.simulateTransaction(transaction);
  const preparedTx = SorobanRpc.assembleTransaction(
    transaction,
    simulated
  );

  // 3. Sign with Freighter
  const signedXdr = await signTransaction(preparedTx.toXDR(), {
    network: 'TESTNET',
    networkPassphrase: Networks.TESTNET
  });

  // 4. Submit
  const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
  const result = await server.sendTransaction(tx);

  // 5. Wait for confirmation
  let status = await server.getTransaction(result.hash);
  while (status.status === 'PENDING' || status.status === 'NOT_FOUND') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    status = await server.getTransaction(result.hash);
  }

  return result.hash;
}
```

---

### React Hook Example

`/src/hooks/useStellar.ts`:
```typescript
import { useState } from 'react';

export function useStellar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCircle = async (name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const txHash = await submitContractTransaction('create_circle', [
        userAddress,
        name
      ]);
      return txHash;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCircle, loading, error };
}
```

---

## Contract Deployment

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add wasm target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install stellar-cli
```

### Build Contract

```bash
cd contracts
stellar contract build
```

Output: `target/wasm32-unknown-unknown/release/trust_circles.wasm`

### Deploy to Testnet

```bash
# Generate deployer identity
stellar keys generate deployer --network testnet

# Fund account (Friendbot)
stellar keys fund deployer --network testnet

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/trust_circles.wasm \
  --source deployer \
  --network testnet
```

Output: Contract ID (e.g., `CCZ5A5U...`)

### Initialize Contract

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS> \
  --token_id CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

---

## Development Setup

### Local Development

```bash
# Clone repository
git clone https://github.com/SamyaDeb/Zentra.git
cd Zentra/Zentra

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run dev server
npm run dev
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed contract address | `CCZ5A5U...` |
| `NEXT_PUBLIC_NATIVE_TOKEN_ID` | XLM SAC address | `CDLZFC3...` |

---

## Testing Guide

### Frontend Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Contract Tests

```bash
cd contracts
cargo test
```

### Test Structure

```
contracts/
└── src/
    ├── lib.rs        # Main contract logic
    ├── storage.rs    # Storage helpers
    └── test.rs       # Unit tests
```

### Example Test

```rust
#[test]
fn test_create_circle() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TrustCircles);
    let client = TrustCirclesClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let circle_id = client.create_circle(&creator, &String::from_str(&env, "Test Circle"));

    assert_eq!(circle_id, 1);
}
```

---

## API Endpoints

### Stellar Testnet

| Service | URL |
|---------|-----|
| Horizon API | `https://horizon-testnet.stellar.org` |
| Soroban RPC | `https://soroban-testnet.stellar.org` |
| Stellar Expert | `https://stellar.expert/explorer/testnet` |
| Friendbot | `https://friendbot.stellar.org` |

### Contract Queries (RPC)

```bash
# Get trust score
curl -X POST https://soroban-testnet.stellar.org \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "invokeContractFunction",
    "params": {
      "contractId": "CCZ5A5U...",
      "function": "get_trust_score",
      "args": ["GBDD6ID..."]
    }
  }'
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 100 | Not authorized | Non-admin calling admin function |
| 101 | Circle not found | Invalid circle ID |
| 102 | Already in circle | User trying to join second circle |
| 103 | Circle full | Circle has 10 members |
| 104 | Loan not found | Invalid loan ID |
| 105 | Account frozen | User has defaulted loan |
| 106 | Insufficient circle size | Circle has < 3 members |
| 107 | Existing active loan | User already has a loan |

---

## Rate Limits

- **Horizon API:** 3,600 requests/hour
- **Soroban RPC:** No official limit (use responsibly)
- **Freighter:** No limit (user-controlled)

---

## Resources

- [Stellar SDK Docs](https://stellar.github.io/js-stellar-sdk/)
- [Soroban Docs](https://soroban.stellar.org/docs)
- [Freighter API](https://docs.freighter.app/)
- [Rust Soroban SDK](https://docs.rs/soroban-sdk/latest/soroban_sdk/)

---

**Last Updated:** March 29, 2026  
**Version:** 1.0  
**Maintainer:** SamyaDeb
