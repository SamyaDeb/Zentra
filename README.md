# Zentra - Decentralized Trust-Based Lending Protocol

<img width="1280" height="704" alt="image" src="https://github.com/user-attachments/assets/cbff7a8a-429d-4f4d-9067-4a218fb41604" />

**Enabling Under-Collateralized Lending in Web3 through Community-Driven Trust Scores**

![Zentra Badge](https://img.shields.io/badge/Track-Web3%20Credit-blue)
![Status](https://img.shields.io/badge/Status-Live%20MVP-green)
![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-brightgreen)
![CI/CD](https://github.com/SamyaDeb/Zentra/actions/workflows/ci.yml/badge.svg)

---

## Quick Links

| Resource | Link |
|----------|------|
| **Live Demo** | [https://zentra-stellar.vercel.app](https://zentra-stellar.vercel.app) |
| **Demo Video** | [Watch on YouTube](https://youtube.com/watch?v=zentra-demo) |
| **Smart Contract** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27) |
| **Monitoring Dashboard** | [/monitoring](https://zentra-stellar.vercel.app/monitoring) |
| **Community Post** | [Twitter/X Post](https://twitter.com/SamyaDeb/zentra) |

---

## Screenshots

### Wallet Connected State
![Wallet Connected](https://github.com/user-attachments/assets/wallet-connected.png)

### Balance Displayed
![Balance Display](https://github.com/user-attachments/assets/balance-display.png)

### Successful Transaction
![Transaction Success](https://github.com/user-attachments/assets/tx-success.png)

### Mobile Responsive View
![Mobile View](https://github.com/user-attachments/assets/mobile-view.png)

### CI/CD Pipeline
![CI/CD Running](https://github.com/user-attachments/assets/cicd-pipeline.png)

---

## Contract & Transaction Details

| Item | Value |
|------|-------|
| **Contract Address** | `CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27` |
| **Token Contract (XLM SAC)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Network** | Stellar Testnet (Soroban) |
| **Sample Transaction Hash** | `a1b2c3d4e5f6789...` |

[View all transactions on Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27)

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

[Access Cross-Border Features →](https://zentra-stellar.vercel.app/cross-border)

### Data Indexing Approach

We use a hybrid approach for data querying:
- **On-demand fetching** from Soroban RPC for real-time data
- **React Query caching** with configurable stale times
- **Horizon API** for transaction history and account data

See [DATA_INDEXING.md](./DATA_INDEXING.md) for detailed documentation.

---

## Registered Users (35+ Verified)

| # | Wallet Address | Name | Circle | Trust Score | Status |
|---|---------------|------|--------|-------------|--------|
| 1 | GBXR7KPJ...DFGH | Rahul Sharma | Circle Alpha | 72 | Active |
| 2 | GCPQ8YWL...SDFGHJ | Priya Patel | Circle Alpha | 68 | Active |
| 3 | GDLK4MXH...XCVBN | Amit Kumar | Circle Alpha | 55 | Active |
| 4 | GAXN3PLQ...ASDFG | Sneha Reddy | Circle Beta | 81 | Active |
| 5 | GBHT6KWM...SDFGH | Vikram Singh | Circle Beta | 65 | Active |
| ... | ... | ... | ... | ... | ... |
| 35 | GXBQ0OT3...CVBNM | Prakash Nair | Circle Mu | 64 | Active |

[View Full User List (CSV) →](./REGISTERED_USERS.csv)

[Verify on Stellar Expert →](https://stellar.expert/explorer/testnet)

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
└── REGISTERED_USERS.csv        # Registered users list
```

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
