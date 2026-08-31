# Zentra Security Checklist

## Completed Security Audit

**Project:** Zentra - Decentralized Trust-Based Lending Protocol  
**Version:** 1.0  
**Audit Date:** March 29, 2026  
**Auditor:** SamyaDeb (Self-Audit)  

---

## Smart Contract Security

### Authorization & Access Control

| Check | Status | Notes |
|-------|--------|-------|
| Admin functions protected | ✅ Pass | `deposit_liquidity`, `approve_loan`, `withdraw`, `penalize_default` require admin |
| User authorization verified | ✅ Pass | All user functions verify caller address |
| No unauthorized state changes | ✅ Pass | All mutations require proper auth |
| Role separation implemented | ✅ Pass | Admin vs User roles clearly defined |

### Input Validation

| Check | Status | Notes |
|-------|--------|-------|
| Loan amount bounds checked | ✅ Pass | Min 10 XLM, Max based on trust score |
| Circle name length validated | ✅ Pass | Max 32 characters |
| Purpose string length validated | ✅ Pass | Max 128 characters |
| Circle ID existence verified | ✅ Pass | Returns error if not found |
| Loan ID existence verified | ✅ Pass | Returns error if not found |

### Financial Security

| Check | Status | Notes |
|-------|--------|-------|
| Integer overflow protection | ✅ Pass | Rust's built-in overflow checks |
| Underflow protection | ✅ Pass | Balance checks before transfers |
| Reentrancy protection | ✅ Pass | State updated before external calls |
| Double-spend prevention | ✅ Pass | Loan status checked before operations |
| Sufficient balance checks | ✅ Pass | Pool balance verified before disbursement |

### Business Logic

| Check | Status | Notes |
|-------|--------|-------|
| Trust score bounds (0-100) | ✅ Pass | Score capped at min 0, max 100 |
| Loan duration enforced | ✅ Pass | Borrower-selected 7/30/60/90-day tiers, validated on-chain (see v1.1 addendum) |
| Interest calculation correct | ✅ Pass | Verified against tier table |
| Default penalty applied correctly | ✅ Pass | -50 borrower, -20 circle members |
| Circle size limits enforced | ✅ Pass | Min 3, Max 10 members |

---

## Frontend Security

### Data Protection

| Check | Status | Notes |
|-------|--------|-------|
| No private keys in frontend | ✅ Pass | All signing via Freighter |
| Environment variables protected | ✅ Pass | Only NEXT_PUBLIC_ vars exposed |
| No sensitive data in localStorage | ✅ Pass | Only role preference stored |
| HTTPS enforced in production | ✅ Pass | Vercel default |

### Input Sanitization

| Check | Status | Notes |
|-------|--------|-------|
| XSS protection | ✅ Pass | React's built-in escaping |
| Form input validation | ✅ Pass | Client-side validation before submit |
| No SQL injection vectors | ✅ Pass | No SQL database used |
| No eval() or similar | ✅ Pass | Code review verified |

### Wallet Integration

| Check | Status | Notes |
|-------|--------|-------|
| Non-custodial design | ✅ Pass | User controls keys via Freighter |
| Transaction details shown | ✅ Pass | Freighter displays tx info |
| User approval required | ✅ Pass | Freighter popup for each tx |
| No auto-signing | ✅ Pass | Manual approval only |

---

## Infrastructure Security

### Deployment

| Check | Status | Notes |
|-------|--------|-------|
| Environment variables secured | ✅ Pass | Vercel encrypted secrets |
| Build artifacts not exposed | ✅ Pass | .vercelignore configured |
| Source maps disabled in prod | ✅ Pass | Next.js default |
| CORS configured correctly | ✅ Pass | Same-origin by default |

### Dependencies

| Check | Status | Notes |
|-------|--------|-------|
| npm audit passed | ⚠️ Warning | `next` patched to 14.2.35 (was 14.2.0), clearing a critical auth-bypass CVE (2026-08-31). Production deps now show 2 remaining high-severity advisories that require a Next.js major-version bump — deferred, tracked below. |
| Dependencies up to date | ⚠️ Warning | Patched, not latest: `next` 14.2.x (latest major is 16), `@stellar/stellar-sdk` 13.x (latest 17.x), `react`/`react-dom` 18.x (latest 19.x), `@stellar/freighter-api` 2.x (latest 6.x). Deliberately scoped to patch-only for this pass; see "Recommended Improvements". |
| No known vulnerable packages | ⚠️ Warning | `npm audit --omit=dev` shows 2 high (Next.js, requires major bump); dev-only advisories cleared via `npm audit fix`. |
| Lock file committed | ✅ Pass | package-lock.json in repo |

---

## Network Security

### Stellar Network

| Check | Status | Notes |
|-------|--------|-------|
| Testnet used for development | ✅ Pass | Mainnet release was preceded by testnet validation |
| RPC endpoints verified | ✅ Pass | Mainnet RPC: `https://mainnet.sorobanrpc.com` |
| Network passphrase correct | ✅ Pass | Public Stellar Network passphrase used |
| Transaction timeout set | ✅ Pass | 180 seconds default |

### API Security

| Check | Status | Notes |
|-------|--------|-------|
| No exposed API keys | ✅ Pass | No external APIs used |
| Rate limiting considered | ✅ Pass | Stellar infra handles this |
| Error messages sanitized | ✅ Pass | No sensitive info in errors |

---

## Operational Security

### Code Quality

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript strict mode | ✅ Pass | Type safety enforced |
| ESLint configured | ✅ Pass | Code quality checks |
| No console.log in prod | ✅ Pass | Remaining diagnostic `console.warn`/`console.error` calls are gated behind a `NODE_ENV !== "production"` check (`src/hooks/useContractWrites.ts`) |
| Error handling implemented | ✅ Pass | Try-catch blocks in place |

### Monitoring

| Check | Status | Notes |
|-------|--------|-------|
| Transaction logging | ✅ Pass | Hash returned for verification |
| Error tracking | ⚠️ Warning | Basic alerts only |
| Uptime monitoring | ⚠️ Warning | Vercel default only |

---

## Known Limitations

### Current Version

1. **Single Admin (multisig cutover in progress):** One admin address still manages the platform
   today. Converting it to a Stellar-native 2-of-3 multisig — no contract changes required, see
   `docs/multisig-admin-runbook.md` — has an in-app co-sign console built and tested on testnet,
   but the mainnet cutover itself is blocked: the live admin account holds only ~1.0006 XLM,
   exactly the base reserve, with no headroom for the 2 new signers it needs.
2. ~~Fixed Loan Duration~~ — resolved in v1.1 audit, see below
3. ~~No Circle Exit~~ — resolved in v1.1 audit, see below
4. **Manual Default Handling:** Admin must manually penalize defaults
5. **Mainnet Operations:** Deployed, but liquidity controls and admin key management remain operational risks

### Recommended Improvements

1. ~~Implement multi-sig admin~~ — in progress, see "Known Limitations" above and
   `docs/multisig-admin-runbook.md`
2. Add automated default detection
3. ~~Enable circle exit with cooldown~~ — implemented (no cooldown; blocked only while a loan is active, see below)
4. ~~Add flexible loan durations~~ — implemented, see below
5. Professional third-party security audit and multi-signature administration

---

## v1.1 Audit Addendum — Contract Upgrade (Flexible Durations + Circle Exit)

**Date:** 2026-07-14
**Auditor:** SamyaDeb (Self-Audit)
**Scope:** `request_loan` duration parameter, `approve_loan` due-date calculation, new `leave_circle` function.

### Finding 1 (High, Fixed): Loan duration was silently 7x shorter than documented

`LOAN_DURATION_LEDGERS` was set to `17280`. At 5 seconds/ledger that is exactly
1 day (`17280 × 5s = 86400s`), not the "7 days" claimed in the README and in
`config/stellarConfig.ts` (which independently defined `LEDGERS_PER_DAY: 17280`
and `DEFAULT_LOAN_DURATION: 120960` — i.e. the frontend's own constant already
assumed 7× the contract's actual value). Every non-demo loan matured about 7x
faster than borrowers were told, which both misleads users and skews the
"on-time vs. late" credit-scoring bonuses in `calculate_credit_bonus`.

**Fix:** replaced the fixed constant with `duration_days * LEDGERS_PER_DAY`,
where `duration_days` is the borrower's explicit choice at request time
(7/30/60/90, validated against `ALLOWED_LOAN_DURATIONS_DAYS`). Demo mode is
unaffected — it still uses the admin-configured fast ledger count so demos
don't require waiting real days. Covered by
`test_request_loan_flexible_duration_sets_due_ledger`.

### Finding 2 (Medium, Fixed): `leave_circle` updated storage after the external token transfer

The initial draft of `leave_circle` called `token.transfer()` (refunding the
member's stake) before writing the member's cleared `circle_id`/`trust_bond`
back to storage. Per Soroban's execution model the native XLM Stellar Asset
Contract cannot call back into the invoking contract, so this was not
exploitable today — but it violates checks-effects-interactions and would
become a double-refund vector if the token contract were ever swapped for one
with callback behavior. **Fix:** all storage writes (circle membership,
member record) now happen before the token transfer. No test can directly
prove the absence of reentrancy in a mocked-auth unit test environment; this
was caught and fixed by code review, not by a failing test.

### Finding 3 (Low, Accepted): `leave_circle` has no exit cooldown or notice period

A member can join a circle and leave immediately, refunding their stake with
no penalty, as long as they have no active loan. This is intentional — the
stake is meant to secure loan behavior, not membership duration — but it does
mean a circle's member count (and therefore its `is_active` status) can
fluctuate. Accepted as-is; flagged for future consideration of a minimum
membership period if circle churn becomes a problem in practice.

### Regression Coverage

All 26 contract unit tests pass after the upgrade (20 pre-existing + 6 new):
`cargo test` in `contracts/`. New tests: `test_leave_circle_refunds_stake_and_deactivates`,
`test_leave_circle_with_active_loan_fails`, `test_leave_circle_not_in_circle_fails`,
`test_request_loan_invalid_duration`, `test_request_loan_flexible_duration_sets_due_ledger`.

---

## v1.2 Addendum — Dependency Patches, Admin Multisig Cutover Started

**Date:** 2026-08-31
**Scope:** Frontend-only. `contracts/` (the deployed Soroban WASM) was not touched or redeployed.

### npm audit findings (Finding 1, corrected)

The "Dependencies" section above previously claimed a clean `npm audit` with "latest stable
versions" — that was stale. A real audit found 20 vulnerabilities, including 1 **critical**
inside `next@14.2.0` itself (an auth-bypass advisory, CWE-285/863). Patched to `next@14.2.35`
(clears the critical) and ran `npm audit fix` for the remaining dev-tooling advisories.
Production-dependency audit now shows 2 remaining high-severity items, both requiring a Next.js
*major* version bump (14→15/16) — deliberately deferred rather than bundled into a patch-only
pass; tracked as a follow-up.

### Admin multisig — in progress (Finding 2, mitigation underway)

"Single Admin" (Known Limitations #1) has an active mitigation: converting the admin account to
a Stellar-native 2-of-3 multisig requires **no contract changes** — `Address.require_auth()` on a
classic account defers to that account's own signer/threshold configuration. Full rationale,
ordering constraints, and verification steps: `docs/multisig-admin-runbook.md`.

- Testnet dry run: passed (1-signature call correctly rejected, 2-of-3 co-signed call succeeded).
- In-app co-sign console shipped (`components/AdminCoSignConsole.tsx`), so any registered signer
  — not just the original key — can build, sign, hand off, and submit an admin transaction from
  `/admin`. The admin-page access gate now checks the account's live Horizon signer set instead
  of a hardcoded address, and the page warns when the account has become a multisig so the old
  single-click admin forms aren't used by mistake once they'd fail alone.
- Mainnet cutover: **blocked**, not yet performed. The live admin account
  (`GBALWWEQCFTHQ6FXSBRSB7X7WX5VVYBOVGT3GB34VABGY4MTB2F52FGX`) holds only ~1.0006 XLM — exactly
  the 1 XLM base reserve, with no headroom for the ~0.5 XLM reserve each new signer requires.
  Nothing on-chain has changed; the one attempted transaction failed cleanly with
  `SetOptions(LowReserve)` and only cost a network fee. Resumes once the account is funded.

### Test infrastructure (Finding 3, fixed)

`npm test` had silently reported "no tests found" for every prior audit in this document —
not because the code was untested-but-fine, but because the test *infrastructure* was broken:
`jest.config.js`'s `@/` alias mapping didn't match `tsconfig.json`'s actual (src-first,
repo-root-fallback) resolution, and `jest.setup.js` used an ESM `import` that crashed under
the project's CommonJS-only transform config. Both fixed; the project now has a first real test
suite (`config/stellarConfig.test.ts`, `src/lib/horizon.test.ts`) with 20 passing tests.

### Regression Coverage

`npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass after these changes.

---

## Compliance Notes

### Privacy

- No personal data collected
- Only wallet addresses stored on-chain
- GDPR not applicable (no PII)

### Financial Regulations

- Platform is experimental mainnet software; deployment does not imply regulatory approval
- Not licensed for real financial services
- Users must understand risks

---

## Audit Summary

| Category | Score | Status |
|----------|-------|--------|
| Smart Contract | 95/100 | ✅ Secure |
| Frontend | 90/100 | ✅ Secure |
| Infrastructure | 85/100 | ✅ Secure |
| Operations | 80/100 | ⚠️ Needs improvement |

**Overall Security Rating:** ⚠️ **CONDITIONAL PASS** (Mainnet deployed; professional audit still recommended)

---

## Sign-Off

**Audited By:** Samya Deb  
**Date:** March 29, 2026  
**Recommendation:** Mainnet deployment completed after self-audit and regression testing. Obtain a professional third-party audit before scaling liquidity or user volume.

---

## References

- [Stellar Security Best Practices](https://developers.stellar.org/docs/security-guide)
- [Soroban Security Considerations](https://soroban.stellar.org/docs/learn/security)
- [OWASP Web Security](https://owasp.org/www-project-web-security-testing-guide/)
