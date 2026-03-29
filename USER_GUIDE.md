# Zentra User Guide

Welcome to Zentra - Your decentralized trust-based lending platform on Stellar blockchain!

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Setting Up Your Wallet](#setting-up-your-wallet)
3. [Understanding Trust Scores](#understanding-trust-scores)
4. [Creating a Trust Circle](#creating-a-trust-circle)
5. [Joining a Trust Circle](#joining-a-trust-circle)
6. [Requesting a Loan](#requesting-a-loan)
7. [Repaying a Loan](#repaying-a-loan)
8. [Admin Functions](#admin-functions)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Getting Started

### Prerequisites

Before using Zentra, you'll need:

1. **Freighter Wallet** - Browser extension for Stellar
2. **Test XLM** - For transactions on Stellar Testnet
3. **Modern Web Browser** - Chrome, Firefox, or Edge

### Installation Steps

#### 1. Install Freighter Wallet

1. Go to [https://freighter.app](https://freighter.app)
2. Click "Install" for your browser
3. Follow the extension installation prompts
4. Create a new wallet or import existing one
5. **Save your secret key safely** - Never share it!

#### 2. Switch to Testnet

1. Open Freighter extension
2. Click the settings icon (gear)
3. Select "Network"
4. Choose "Testnet"

#### 3. Fund Your Testnet Account

1. Copy your wallet address from Freighter
2. Go to [https://laboratory.stellar.org/#account-creator?network=test](https://laboratory.stellar.org/#account-creator?network=test)
3. Paste your address and click "Get test network lumens"
4. Wait a few seconds for 10,000 XLM to arrive

---

## Setting Up Your Wallet

### Connecting to Zentra

1. Visit the Zentra homepage
2. Click **"Connect Wallet"** in the top-right corner
3. Freighter popup will appear asking for permission
4. Click **"Approve"** to connect
5. Button changes to **"Disconnect"** with green indicator

### Disconnecting Your Wallet

1. Click the **"Disconnect"** button
2. Your wallet is disconnected immediately
3. You'll be redirected to the homepage

---

## Understanding Trust Scores

### What is a Trust Score?

Your trust score (0-100) determines:
- Maximum loan amount you can borrow
- Interest rate on your loans
- Your reputation in the community

### How is it Calculated?

```
Final Score = (Your Individual Score × 60%) + (Circle Average × 40%)
```

**Starting Score:** Everyone starts at 50 points

### Score Adjustments

| Action | Points Change |
|--------|---------------|
| Early repayment (before due date) | +15 points |
| On-time repayment (on due date) | +10 points |
| Late payment (3-7 days) | -5 points |
| Very late (7-14 days) | -30 points |
| Default (14+ days) | -50 points + account freeze |
| Circle member defaults | -20 points (all members) |

### Loan Tiers

| Trust Score | Max Loan | Interest Rate |
|-------------|----------|---------------|
| Below 60 | 100 XLM | 6% |
| 60-69 | 200 XLM | 4% |
| 70-79 | 500 XLM | 4% |
| 80-89 | 1,000 XLM | 2% |
| 90-100 | 2,000 XLM | 2% |

---

## Creating a Trust Circle

### What is a Trust Circle?

A group of 3-10 people who vouch for each other financially. Members share accountability - if one defaults, everyone loses points.

### Steps to Create

1. **Navigate to User Dashboard**
   - After connecting wallet, click your role or go to `/user`

2. **Find "Trust Circles" Section**
   - Located in the main dashboard area

3. **Click "Create Circle" Button**

4. **Enter Circle Details**
   - Circle Name (e.g., "Small Vendors Circle")
   - Minimum 3 characters

5. **Stake 10 XLM**
   - Required entry fee
   - Click "Create Circle"
   - Freighter popup appears

6. **Confirm Transaction**
   - Review the transaction details
   - Click "Approve" in Freighter
   - Wait for confirmation (5-10 seconds)

7. **Success!**
   - Your circle is created
   - You're the first member
   - Share Circle ID with friends

### Circle Requirements

- **Minimum members:** 3 (to activate)
- **Maximum members:** 10
- **Entry stake:** 10 XLM per member
- **Circle becomes active** when 3+ members join

---

## Joining a Trust Circle

### Steps to Join

1. **Get Circle ID**
   - Ask a circle member for the Circle ID
   - Format: Number (e.g., 1, 2, 3...)

2. **Navigate to User Dashboard**

3. **Find "Join Circle" Section**

4. **Enter Circle ID**
   - Type the Circle ID number
   - Click "Join Circle"

5. **Stake 10 XLM**
   - Required entry fee
   - Freighter popup appears

6. **Confirm Transaction**
   - Review details
   - Click "Approve" in Freighter
   - Wait for confirmation

7. **You're In!**
   - Your trust score now includes circle average
   - You can request loans once circle has 3+ members

### Choosing the Right Circle

**Good Circles Have:**
- Members with high trust scores
- Active repayment history
- 5+ members for stability

**Avoid Circles With:**
- Many defaults
- Low average scores
- Inactive members

---

## Requesting a Loan

### Prerequisites

- ✅ Wallet connected
- ✅ Member of active circle (3+ members)
- ✅ No outstanding loans
- ✅ Account not frozen

### Steps to Request

1. **Check Your Eligibility**
   - View your trust score in dashboard
   - See max loan amount available
   - Note your interest rate

2. **Go to "Request Loan" Section**

3. **Enter Loan Details**
   - **Amount:** Between 10 XLM and your max limit
   - **Purpose:** Brief description (e.g., "Inventory purchase")

4. **Review Terms**
   - Duration: 7 days
   - Interest rate: Based on your score
   - Total repayment: Loan amount + interest

5. **Click "Request Loan"**
   - Freighter popup appears
   - Confirm the transaction

6. **Wait for Admin Approval**
   - Loan appears as "Pending"
   - Admin reviews your trust score
   - Usually approved within 24 hours

7. **Receive Funds**
   - Once approved, XLM arrives in your wallet automatically
   - Loan status changes to "Active"
   - Due date is 7 days from approval

### Loan Example

```
Trust Score: 75
Max Loan: 500 XLM
Interest Rate: 4%

Request: 300 XLM
Interest: 300 × 4% = 12 XLM
Total Repayment: 312 XLM
Due Date: 7 days from approval
```

---

## Repaying a Loan

### When to Repay

- **Before due date:** +15 points (early repayment bonus)
- **On due date:** +10 points (on-time)
- **1-3 days late:** -5 points
- **3-7 days late:** -30 points
- **7+ days late:** -50 points + account freeze

### Steps to Repay

1. **Check Repayment Amount**
   - View in "Active Loans" section
   - Amount = Loan + Interest

2. **Ensure Wallet Has Sufficient XLM**
   - Check your Freighter balance
   - Must have enough for repayment + small fee

3. **Click "Repay" Button**
   - Next to your active loan

4. **Confirm Transaction**
   - Freighter popup shows repayment amount
   - Click "Approve"

5. **Wait for Confirmation**
   - Usually 5-10 seconds
   - Success message appears

6. **Trust Score Updated**
   - Your score increases based on timing
   - Circle average recalculated
   - Loan status changes to "Repaid"

---

## Admin Functions

### For Liquidity Providers / Admins

If you're an admin, you can:

#### 1. Deposit Liquidity

1. Navigate to Admin Dashboard (`/admin`)
2. Find "Deposit Liquidity" section
3. Enter amount to deposit
4. Confirm transaction
5. Funds available for loans

#### 2. Review Pending Loans

1. See all pending loan requests
2. View borrower details:
   - Wallet address
   - Trust score
   - Loan amount requested
   - Circle information

#### 3. Approve Loans

1. Review trust score (should be 50+)
2. Click "Approve" button
3. Confirm transaction
4. XLM automatically disbursed to borrower

#### 4. Handle Defaults

1. View overdue loans
2. Click "Penalize Default"
3. Borrower loses 50 points
4. Circle members lose 20 points each
5. Account frozen until admin unfreezes

#### 5. Withdraw Funds

1. Check available balance
2. Enter withdrawal amount
3. Confirm transaction
4. XLM sent to your wallet

---

## Troubleshooting

### Wallet Won't Connect

**Problem:** Clicking "Connect Wallet" does nothing

**Solutions:**
1. Ensure Freighter extension is installed
2. Check if Freighter is unlocked
3. Verify you're on Testnet (in Freighter settings)
4. Try refreshing the page
5. Clear browser cache

### Transaction Fails

**Problem:** "Transaction failed" error appears

**Solutions:**
1. **Insufficient funds:** Check XLM balance for fees
2. **Network congestion:** Wait 30 seconds and retry
3. **Wrong network:** Ensure Freighter is on Testnet
4. **Contract error:** Check if you meet requirements (e.g., circle has 3+ members)

### Can't Request Loan

**Possible Reasons:**
- Not in an active circle (needs 3+ members)
- Already have an outstanding loan
- Account is frozen due to default
- Amount exceeds your max limit

### Transaction Shows Error But Succeeded

**Problem:** Alert says "error" but transaction went through

**Explanation:** This is a known XDR parsing issue. Check Stellar Explorer to verify:
1. Go to [https://stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
2. Search your wallet address
3. View recent transactions
4. If transaction shows "Success", ignore the alert

### Trust Score Not Updating

**Solutions:**
1. Refresh the page
2. Disconnect and reconnect wallet
3. Wait 30 seconds for blockchain confirmation
4. Check Stellar Explorer for transaction status

---

## FAQ

### How much does it cost to use Zentra?

- **Transaction fees:** ~0.0001 XLM per transaction (Stellar network fee)
- **Circle entry:** 10 XLM stake (one-time)
- **Loan interest:** 2-6% depending on trust score

### Can I join multiple circles?

Currently, users can only be in **one circle at a time**. This may change in future updates.

### What happens if I default?

- You lose **50 points** from your trust score
- Your account is **frozen** (can't request new loans)
- All circle members lose **20 points**
- Admin must manually unfreeze your account

### Can I leave a circle?

Not currently supported. Choose your circle carefully!

### How long does loan approval take?

Typically **within 24 hours**, depending on admin availability. On testnet demos, it can be instant.

### Can I request multiple loans?

No, you can only have **one active loan** at a time. Repay your current loan to request another.

### What if my circle member defaults?

You lose **20 points** from your trust score. This creates accountability - choose trustworthy circle members!

### Can I get more than 2,000 XLM?

Not currently. The maximum loan is **2,000 XLM** (for scores 90-100). This may increase in future versions.

### Is my data private?

All loan transactions are **publicly visible on Stellar blockchain**. However, no personal information is stored - only wallet addresses and loan amounts.

### What if I repay early?

Great! You get a **+15 point bonus** for early repayment, vs +10 for on-time.

### Can I extend my loan duration?

No, all loans have a fixed **7-day duration**. Plan your repayment accordingly.

### What if Freighter popup doesn't appear?

1. Check if popup blockers are enabled
2. Look for a Freighter icon in browser toolbar (may need manual click)
3. Ensure Freighter extension is active

---

## Need More Help?

- **GitHub Issues:** [Report bugs](https://github.com/SamyaDeb/Zentra/issues)
- **Email Support:** sammodeb28@gmail.com
- **Check Transactions:** [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│              ZENTRA QUICK REFERENCE                     │
├─────────────────────────────────────────────────────────┤
│ Circle Entry Stake:        10 XLM                       │
│ Min Circle Members:        3                            │
│ Max Circle Members:        10                           │
│ Loan Duration:             7 days                       │
│ Starting Trust Score:      50 points                    │
│ Early Repayment Bonus:     +15 points                   │
│ On-Time Repayment:         +10 points                   │
│ Default Penalty:           -50 points + freeze          │
│ Circle Default Penalty:    -20 points (all members)     │
│ Interest Rates:            2% - 6%                      │
│ Max Loan Amount:           2,000 XLM (score 90-100)     │
│ Network Fees:              ~0.0001 XLM per transaction  │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated:** March 29, 2026  
**Version:** 1.0  
**Network:** Stellar Testnet
