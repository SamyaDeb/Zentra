# Admin Multi-Sig Runbook

## Why

The TrustCircles contract gates 7 functions (`approve_loan`, `penalize_default`,
`deposit_liquidity`, `withdraw`, `set_demo_mode`, `set_demo_loan_duration`,
`unfreeze_account`) behind a single admin `Address.require_auth()`
(`contracts/trust_circles/src/lib.rs`). That address is currently one EOA
(`GBALWWEQCFTHQ6FXSBRSB7X7WX5VVYBOVGT3GB34VABGY4MTB2F52FGX`), so one compromised
key can unilaterally approve fraudulent loans or drain pooled liquidity — a real
risk now that the contract holds live mainnet funds.

The deployed contract has **no admin-rotation or upgrade function** (`initialize`
sets the admin once, permanently, and there is no `update_current_contract_wasm`
call anywhere in `lib.rs`), so the contract's Rust/WASM cannot be changed or
migrated to a multi-admin design without a full redeploy — out of scope here.

## The approach: account-level multisig, zero contract changes

Soroban's `require_auth()` on a classic Stellar `G...` address defers to that
account's **native multi-signature configuration** — signers and weighted
thresholds set via a `SetOptions` operation. This is a Stellar protocol feature,
not something the contract implements, so turning the *existing* admin account
into an M-of-N multisig requires no changes to `contracts/` and no contract
redeploy.

## Status

- [x] **Testnet dry run** — `scripts/multisig-testnet-dryrun.sh` generates 3
  disposable testnet identities, raises the account to 2-of-3, proves a
  1-signature payment is rejected (`TxBadAuth`) and a 2-signature payment
  succeeds. Run and passing as of this writing.
- [ ] **Mainnet cutover** — not yet performed. `scripts/multisig-mainnet-cutover.sh`
  builds (but does not sign or submit) the 3 required `SetOptions` transactions
  against the real mainnet admin account. Requires the current admin key holder
  to review, sign, and submit each step manually, in order.

## Ordering constraint (found during the dry run)

Add every new signer **before** raising the thresholds. Raising the threshold
to 2 in the same step as (or before) adding the second signer briefly leaves
the account needing 2 signature-weight to authorize further `SetOptions` calls
while only 1 weight of signer exists yet — it locks the account out. The
scripts already encode the correct order:

1. Add co-signer B (thresholds untouched).
2. Add co-signer C (thresholds untouched).
3. Raise `low/med/high_threshold` to 2 and set `master_weight` to 1 — last.

## Ongoing process once mainnet is cut over (2-of-3)

The frontend's `submitContractTransaction` (`src/hooks/useContractWrites.ts`)
builds, simulates, and signs a transaction with a single Freighter popup, then
submits immediately — that flow no longer completes single-handedly for admin
calls once thresholds require 2 signatures. Until an in-app co-sign UI exists
(see below), the process is:

1. Admin #1 initiates the action in the admin dashboard as before, but signs
   and exports the transaction XDR instead of it auto-submitting (or builds it
   directly via `stellar tx new ...` / Stellar Laboratory).
2. Admin #1 hands the once-signed XDR to Admin #2 out-of-band (do not paste
   XDR into an unencrypted or public channel — treat it like a partially
   executed authorization).
3. Admin #2 reviews the operation and amount, signs with their own key
   (`stellar tx sign --sign-with-key <identity> <xdr>` or Freighter's XDR
   import, if supported), and submits.
4. Verify the result on Stellar Expert / Horizon.

**Verify the account before relying on it operationally:**
```
curl -s https://horizon.stellar.org/accounts/GBALWWEQCFTHQ6FXSBRSB7X7WX5VVYBOVGT3GB34VABGY4MTB2F52FGX \
  | jq '.signers, .thresholds'
```
Expect 3 signer entries and `med_threshold: 2` (and `high_threshold: 2`, since
`withdraw`/`approve_loan`/etc. are high-threshold payment/invoke operations).

**Rehearse before trusting it for money-moving calls.** Do a 2-of-3 co-signed
`set_demo_mode` toggle first (zero financial impact) before relying on the
setup for `withdraw` or `approve_loan`.

## Fast-follow (not built yet)

An in-app "co-sign" screen in the admin dashboard — paste/generate the XDR,
collect the second Freighter signature, submit — would remove the manual XDR
hand-off in step 2 above. Flagged for a later iteration once the account-level
multisig is live and proven; not needed for the cutover itself.
