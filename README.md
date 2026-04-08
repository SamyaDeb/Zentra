# Zentra - Decentralized Trust-Based Lending Protocol

<img width="1470" height="814" alt="Screenshot 2026-03-30 at 2 18 35 PM" src="https://github.com/user-attachments/assets/d568f3f1-c097-4a7d-9abf-f6c3916f50b7" />

**Enabling Under-Collateralized Lending in Web3 through Community-Driven Trust Scores**

![Zentra Badge](https://img.shields.io/badge/Track-Web3%20Credit-blue)
![Status](https://img.shields.io/badge/Status-Live%20MVP-green)
![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-brightgreen)
![CI/CD](https://github.com/SamyaDeb/Zentra/actions/workflows/ci.yml/badge.svg)
---

## Quick Links

| Resource | Link |
|----------|------|
| **Live Demo** | [https://zentra-flame.vercel.app](https://zentra-flame.vercel.app) |
| **Demo Video** | [Watch on YouTube](https://youtu.be/wu8JSs2Qkpc?si=3HYdR1cBmW340v8s) |
| **Smart Contract** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27) |
| **Monitoring Dashboard** | [/monitoring](https://zentra-flame.vercel.app/monitoring) |
| **Users Data & Review** |[Users Excel Sheet ](https://1drv.ms/x/c/9f264c155550732d/IQDv6drh97jETYdn9E1coIINAdDjcHDkIybLHCs_1tp4OFQ?e=2jMWP6) |
---

## Level 5 Hackathon Submission Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **Live Demo Deployed** | ✅ Complete | [https://zentra-flame.vercel.app](https://zentra-flame.vercel.app) |
| **CI/CD Pipeline** | ✅ Complete | https://github.com/SamyaDeb/Zentra/actions/runs/23719242981 |
| **Smart Contract Deployed** | ✅ Complete | `CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27` |
| **Mobile Responsive** | ✅ Complete | See screenshots below |
| **5 Loan Tiers Implemented** | ✅ Complete | Trust score ranges: 0-59, 60-69, 70-79, 80-89, 90-100 |
| **Documentation** | ✅ Complete | ARCHITECTURE.md, TECHNICAL_DOCS.md, USER_GUIDE.md |
| **Security Audit** | ✅ Complete | SECURITY_CHECKLIST.md |
| **Registered Users** | ✅ Complete | [35+ verified users Excel Sheet Data](https://1drv.ms/x/c/9f264c155550732d/IQDv6drh97jETYdn9E1coIINAdDjcHDkIybLHCs_1tp4OFQ?e=jjMH5q) |

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
| **Contract Address** | `CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27` |
| **Token Contract (XLM SAC)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Network** | Stellar Testnet (Soroban) |
| **Sample Transaction Hash** | [`View on Stellar Expert`](https://stellar.expert/explorer/testnet/contract/CCZ5A5UPHSPCHQTN6QDASZINGZ2PVQBWQJ2UTWDIR3MGDE2JVYGS6Q27) |

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
└── REGISTERED_USERS.csv        # Beta tester wallet addresses
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
