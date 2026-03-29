# Zentra - Decentralized Trust-Based Lending Protocol

<img width="1280" height="704" alt="image" src="https://github.com/user-attachments/assets/cbff7a8a-429d-4f4d-9067-4a218fb41604" />


**Enabling Under-Collateralized Lending in Web3 through Community-Driven Trust Scores**

![Zentra Badge](https://img.shields.io/badge/Track-Web3%20Credit-blue)
![Status](https://img.shields.io/badge/Status-Live%20MVP-green)
![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-brightgreen)

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
- **Under-Collateralized Loans** - Borrow without 100% collateral based on trust score
- **Dynamic Credit Limits** - Borrowing capacity increases with positive repayment behavior
- **Collective Accountability** - If one member defaults, entire circle loses 20 points each
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

---

## Technical Stack

**Smart Contracts & Blockchain:**
- Rust + Soroban SDK 22.0
- Stellar Testnet (Soroban smart contracts)
- Contract Address: `CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27`

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

## Smart Contract Functions

### Core Lending Functions
- `request_loan(borrower, amount, purpose)` - Submit loan request
- `approve_loan(loan_id)` - Admin approval and disbursement
- `repay_loan(borrower, loan_id)` - On-chain loan repayment
- `get_max_loan_amount(user)` - Get max borrowable amount
- `get_interest_rate(user)` - Get interest rate based on score

### Trust Circle Functions
- `create_circle(creator, name)` - Create a new trust circle (requires 10 XLM stake)
- `join_circle(member, circle_id)` - Join existing circle (requires 10 XLM stake)
- `get_circle_details(circle_id)` - Get circle members & info
- `get_circle_average_score(circle_id)` - Get circle's average trust score
- `get_trust_score(user)` - Get user's final trust score

### Admin Functions
- `deposit_liquidity(amount)` - Add funds to lending pool
- `withdraw(to, amount)` - Withdraw available funds
- `penalize_default(loan_id)` - Penalize defaulted loans
- `unfreeze_account(user)` - Unfreeze accounts after penalty
- `set_demo_mode(enabled)` - Toggle demo mode for testing

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
NEXT_PUBLIC_CONTRACT_ID=CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27
NEXT_PUBLIC_NATIVE_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

4. **Run development server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Contract Development

1. **Build the Soroban contract**
```bash
cd contracts
stellar contract build
```

2. **Run contract tests**
```bash
cargo test
```

3. **Deploy to Stellar Testnet**
```bash
# Generate deployer identity
stellar keys generate zentra-deployer --network testnet

# Deploy contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/trust_circles.wasm \
  --source zentra-deployer \
  --network testnet

# Initialize contract
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source zentra-deployer \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS> \
  --token_id <XLM_SAC_ADDRESS>
```

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

## Security & Privacy

- **Privacy-Preserving:** Trust scores based purely on on-chain loan data
- **Non-Custodial:** Users maintain full control of assets
- **Transparent:** All loan data recorded on-chain
- **Community Protection:** Circle members share accountability

---

## Project Structure

```
Zentra/
├── app/
│   ├── admin/                  # Admin dashboard
│   ├── user/                   # User dashboard
│   ├── providers.tsx           # React providers
│   ├── layout.tsx              # App layout
│   └── page.tsx                # Home page
├── components/                 # React components
│   ├── ConnectButton.tsx       # Freighter wallet connect
│   └── Navbar.tsx              # Navigation bar
├── contracts/                  # Soroban smart contracts
│   └── trust_circles/
│       └── src/
│           ├── lib.rs          # Main contract logic
│           ├── storage.rs      # Storage helpers
│           └── test.rs         # Unit tests
├── src/
│   ├── lib/
│   │   └── stellar.ts          # Contract client
│   └── hooks/
│       └── useStellar.ts       # React hooks
├── config/                     # Configuration
│   └── stellarConfig.ts        # Stellar network config
└── scripts/                    # Deployment scripts
    └── deploy.sh
```

---

## Live Demo

- **Smart Contract:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27)
- **Network:** Stellar Testnet

---

## Future Roadmap

- [ ] Flexible loan durations (30/60/90 days)
- [ ] Vendor business profiles
- [ ] Revenue-based credit limits
- [ ] Circle-based insurance pools
- [ ] Revolving credit lines
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

## Useful Links

- [Stellar Documentation](https://developers.stellar.org)
- [Soroban Docs](https://soroban.stellar.org)
- [Freighter Wallet](https://freighter.app)

---

**Built with love for Small Vendors**
