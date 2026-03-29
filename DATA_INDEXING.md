# Zentra Data Indexing Approach

## Overview

This document describes how Zentra indexes and queries blockchain data for efficient retrieval and display in the frontend application.

---

## Data Sources

### Primary: Soroban Smart Contract

All core data is stored on-chain in the TrustCircles smart contract:

| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| Trust Scores | `user:{address}:score` | Individual trust scores |
| Circles | `circle:{id}` | Circle details and members |
| Loans | `loan:{id}` | Loan records |
| User Circles | `user:{address}:circle` | User's circle membership |
| Pool Balance | `pool:balance` | Available lending liquidity |

### Secondary: Stellar Horizon

Transaction history and account data from Horizon API:
- Account balances
- Transaction history
- Operation details

---

## Indexing Strategy

### 1. On-Demand Fetching (Current Implementation)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  Soroban RPC │────▶│  Smart Contract │
│   (React)   │◀────│   Server     │◀────│    Storage      │
└─────────────┘     └──────────────┘     └─────────────────┘
```

**How it works:**
1. User navigates to dashboard
2. Frontend calls contract read functions
3. Soroban RPC queries contract storage
4. Data returned and displayed

**Pros:**
- Always fresh data
- No sync issues
- Simple implementation

**Cons:**
- Slower for large datasets
- Multiple RPC calls per page load

### 2. Client-Side Caching (React Query)

```typescript
// /src/hooks/useStellar.ts
import { useQuery } from '@tanstack/react-query';

export function useTrustScore(address: string) {
  return useQuery({
    queryKey: ['trustScore', address],
    queryFn: () => contractClient.get_trust_score({ user: address }),
    staleTime: 30000,  // 30 seconds
    cacheTime: 300000, // 5 minutes
  });
}
```

**Cache Configuration:**
| Data Type | Stale Time | Cache Time | Refetch On |
|-----------|------------|------------|------------|
| Trust Score | 30s | 5min | Window focus |
| Circle Details | 1min | 10min | Manual |
| Loan Status | 10s | 2min | Window focus |
| Pool Balance | 30s | 5min | Manual |

---

## Query Endpoints

### Contract Read Functions

| Endpoint | Description | Response Time |
|----------|-------------|---------------|
| `get_trust_score(user)` | Get user's trust score | ~500ms |
| `get_circle_details(id)` | Get circle info | ~500ms |
| `get_active_loans(user)` | Get user's loans | ~800ms |
| `get_max_loan_amount(user)` | Get borrowing limit | ~500ms |
| `get_interest_rate(user)` | Get interest rate | ~500ms |

### Horizon API Endpoints

| Endpoint | Description | Use Case |
|----------|-------------|----------|
| `/accounts/{address}` | Account details | Balance display |
| `/accounts/{address}/transactions` | Tx history | Activity log |
| `/accounts/{address}/operations` | Operations | Loan tracking |

---

## Data Flow Diagrams

### User Dashboard Load

```
User opens Dashboard
        │
        ▼
┌───────────────────────────────────────────────────┐
│  Parallel Queries (Promise.all)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Trust Score │ │   Circle    │ │Active Loans │ │
│  │   Query     │ │   Query     │ │   Query     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└───────────────────────────────────────────────────┘
        │
        ▼
    Aggregate Results
        │
        ▼
    Render Dashboard
```

### Transaction Confirmation

```
User submits transaction
        │
        ▼
    Submit to RPC
        │
        ▼
┌───────────────────────────────────────┐
│  Polling Loop (1s interval)           │
│  ┌─────────────────────────────────┐  │
│  │ getTransaction(hash)            │  │
│  │   - PENDING → continue polling  │  │
│  │   - SUCCESS → return result     │  │
│  │   - FAILED → throw error        │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
        │
        ▼
    Invalidate cache
        │
        ▼
    Refetch updated data
```

---

## Indexer Service (Future Enhancement)

For production scale, we plan to implement a dedicated indexer:

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Indexer Service                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Event       │  │   Database   │  │    API       │     │
│  │  Listener    │──▶│  (Postgres) │──▶│   Server     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│  Stellar Horizon │                  │     Frontend     │
│  (Event Stream)  │                  │    Application   │
└──────────────────┘                  └──────────────────┘
```

### Database Schema (Planned)

```sql
-- Users table
CREATE TABLE users (
  address VARCHAR(56) PRIMARY KEY,
  trust_score INTEGER DEFAULT 50,
  circle_id INTEGER,
  is_frozen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Circles table
CREATE TABLE circles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(32),
  created_at TIMESTAMP
);

-- Circle members
CREATE TABLE circle_members (
  circle_id INTEGER REFERENCES circles(id),
  user_address VARCHAR(56) REFERENCES users(address),
  joined_at TIMESTAMP,
  PRIMARY KEY (circle_id, user_address)
);

-- Loans table
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  borrower VARCHAR(56) REFERENCES users(address),
  amount BIGINT,
  interest BIGINT,
  status VARCHAR(20),
  purpose TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP,
  repaid_at TIMESTAMP
);

-- Transactions log
CREATE TABLE transactions (
  hash VARCHAR(64) PRIMARY KEY,
  type VARCHAR(20),
  user_address VARCHAR(56),
  details JSONB,
  created_at TIMESTAMP
);
```

### API Endpoints (Planned)

```
GET  /api/users/:address          - User profile + score
GET  /api/users/:address/loans    - User's loan history
GET  /api/circles                 - List all circles
GET  /api/circles/:id             - Circle details
GET  /api/circles/:id/members     - Circle members
GET  /api/stats                   - Platform statistics
GET  /api/transactions            - Recent transactions
```

---

## Current Implementation

### Code Location

```
src/
├── lib/
│   └── stellar.ts       # RPC client and contract calls
├── hooks/
│   └── useStellar.ts    # React hooks with caching
└── config/
    └── stellarConfig.ts # Network configuration
```

### Example: Fetching Trust Score

```typescript
// Direct contract call
const score = await contractClient.get_trust_score({
  user: userAddress
});

// With React Query caching
const { data: score, isLoading } = useQuery({
  queryKey: ['trustScore', userAddress],
  queryFn: async () => {
    const result = await contractClient.get_trust_score({
      user: userAddress
    });
    return Number(result);
  }
});
```

### Example: Fetching Loan History

```typescript
// Get active loans from contract
const loans = await contractClient.get_active_loans({
  user: userAddress
});

// Get transaction history from Horizon
const response = await fetch(
  `https://horizon-testnet.stellar.org/accounts/${userAddress}/transactions?limit=20`
);
const txHistory = await response.json();
```

---

## Performance Metrics

### Current Benchmarks

| Operation | Avg Response | P95 Response |
|-----------|--------------|--------------|
| Trust Score Query | 450ms | 800ms |
| Circle Details | 500ms | 900ms |
| Loan List | 600ms | 1100ms |
| Full Dashboard Load | 1200ms | 2000ms |

### Optimization Strategies

1. **Parallel Queries:** Fetch independent data simultaneously
2. **Caching:** React Query with appropriate stale times
3. **Pagination:** Limit loan history to 20 items
4. **Lazy Loading:** Load non-critical data after initial render

---

## Monitoring Dashboard

### Metrics Tracked

- RPC query latency
- Cache hit rate
- Error rate by endpoint
- Active users (unique addresses)

### Dashboard URL

*(To be implemented in monitoring dashboard page)*

**Planned Location:** `/admin/monitoring`

---

## Future Improvements

### Phase 1: Enhanced Caching
- Implement Redis for server-side caching
- Add cache invalidation on contract events

### Phase 2: Dedicated Indexer
- Deploy PostgreSQL database
- Implement event listener service
- Create REST API layer

### Phase 3: Real-time Updates
- WebSocket connections for live updates
- Push notifications for loan status changes

---

## References

- [Soroban RPC Documentation](https://soroban.stellar.org/docs/reference/rpc)
- [Horizon API Reference](https://developers.stellar.org/api/horizon)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Last Updated:** March 29, 2026  
**Author:** SamyaDeb
