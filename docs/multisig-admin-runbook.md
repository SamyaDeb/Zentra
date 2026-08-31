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
- [x] **In-app co-sign console** — `components/AdminCoSignConsole.tsx`
  (`src/hooks/useAdminCoSign.ts`, `src/lib/adminMultisig.ts`) lets an admin
  build+sign an admin action, hand the XDR to another admin who loads it,
  adds their signature, and submits — all from the `/admin` dashboard. The
  admin-page access gate (`useFreighterWallet().isAdmin`,
  `src/hooks/useWallet.ts`) now checks Horizon for "is this wallet a
  registered signer on the admin account" (`src/lib/horizon.ts`) instead of
  a hardcoded address equality check, so every co-signer — not just the
  original key — can reach the dashboard once the cutover below happens.
- [ ] **Mainnet cutover** — attempted, blocked on step 1. Running
  `scripts/multisig-mainnet-cutover.sh`-equivalent commands against the real
  admin account (`GBALWWEQ...FGX`) failed with `SetOptions(LowReserve)`: the
  account holds only ~1.0006 XLM, exactly the 1 XLM base reserve with zero
  headroom. Adding 2 signers needs ~2 XLM of reserve (0.5 XLM each) plus fees
  — **the account needs additional XLM before any signer can be added.**
  Nothing on-chain has changed; the failed transaction only cost the network
  fee. Two new co-signer identities are ready locally
  (`zentra-mainnet-candidate`, `zentra-mainnet-signer-c` in the Stellar CLI
  keystore) — resume with step 1 of `scripts/multisig-mainnet-cutover.sh`
  once the account is funded.

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

The original one-click admin forms on `/admin` (Deposit Liquidity, Withdraw,
Approve, Penalize Default, Unfreeze, Set Demo Mode/Duration) still call
`submitContractTransaction` (`src/hooks/useContractWrites.ts`), which builds,
signs with a single Freighter popup, and submits immediately, sourced from
the connected wallet's own account. That flow only works standalone when the
connected wallet's own signature weight alone meets the threshold — once the
account requires 2-of-3, it will correctly fail with an auth/weight error for
everyone, admin included. Use the **Multi-Sig Co-Sign Console** on `/admin`
instead:

1. Admin #1 opens the console, picks the action, fills in its parameters, and
   clicks "Build & Sign (Step 1)" — this builds the transaction sourced from
   the admin account itself, signs it with Admin #1's connected wallet, and
   shows the resulting XDR with a copy button.
2. Admin #1 hands that XDR to Admin #2 out-of-band (do not paste XDR into an
   unencrypted or public channel — treat it like a partially executed
   authorization).
3. Admin #2 opens the console, pastes the XDR into "Load XDR", clicks "Add My
   Signature" (prompts their own Freighter), reviews the signature count, then
   clicks "Submit to Network".
4. The console shows the resulting transaction hash on success.

The CLI equivalent (`stellar tx sign --sign-with-key <identity> <xdr>` /
`stellar tx send`) still works too, e.g. for scripted or non-Freighter
signers.

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

## Next step

Fund the admin account with enough XLM to cover the multisig reserve (~2+ XLM
beyond its current ~1.0006 XLM), then resume the mainnet cutover from step 1.
