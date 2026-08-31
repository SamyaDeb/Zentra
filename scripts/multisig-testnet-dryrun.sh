#!/bin/bash
# ==========================================
# Zentra - Admin Multi-Sig Testnet Dry Run
# ==========================================
#
# Proves out the account-level multi-sig approach for the TrustCircles
# admin address BEFORE it is ever applied to the live mainnet admin
# account (GBALWWEQCFTHQ6FXSBRSB7X7WX5VVYBOVGT3GB34VABGY4MTB2F52FGX).
#
# Soroban's `admin.require_auth()` for a classic G-address defers to
# that account's native Stellar multi-signature configuration — so
# turning the admin account into an M-of-N multisig needs zero changes
# to contracts/. This script proves that end-to-end on disposable
# testnet identities:
#   1. Generate 3 fresh testnet identities (mimics: original admin key
#      + 2 new co-signers) and fund the "admin" one via friendbot.
#   2. Raise the account's thresholds to require 2 signatures.
#   3. Attempt a payment signed by only 1 key -> expect rejection.
#   4. Attempt the same payment co-signed by 2 of the 3 keys -> expect
#      success.
#
# Nothing here touches mainnet. Safe to re-run; each run uses fresh
# disposable identities (suffixed with the current epoch time) so it
# never collides with a previous run's identities.
#
# Prerequisites: Stellar CLI (`cargo install stellar-cli`).
#
# Usage: ./scripts/multisig-testnet-dryrun.sh
# ==========================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! command -v stellar &> /dev/null; then
  echo -e "${RED}Error: Stellar CLI not found. Install with: cargo install stellar-cli${NC}"
  exit 1
fi

SUFFIX="msig-dryrun-$(date +%s)"
ADMIN="${SUFFIX}-admin"
SIGNER_B="${SUFFIX}-signer-b"
SIGNER_C="${SUFFIX}-signer-c"
DEST="${SUFFIX}-dest"

echo -e "${GREEN}== 1. Generating disposable testnet identities ==${NC}"
stellar keys generate "$ADMIN" --network testnet --fund
stellar keys generate "$SIGNER_B" --network testnet
stellar keys generate "$SIGNER_C" --network testnet
stellar keys generate "$DEST" --network testnet --fund

ADMIN_PK=$(stellar keys address "$ADMIN")
SIGNER_B_PK=$(stellar keys address "$SIGNER_B")
SIGNER_C_PK=$(stellar keys address "$SIGNER_C")
DEST_PK=$(stellar keys address "$DEST")

echo "   Admin (original key):   $ADMIN_PK"
echo "   New co-signer B:        $SIGNER_B_PK"
echo "   New co-signer C:        $SIGNER_C_PK"
echo "   Payment destination:    $DEST_PK"

echo ""
echo -e "${GREEN}== 2. Raising admin account to 2-of-3 multisig ==${NC}"
# Order matters: add every new signer FIRST while thresholds are still
# at their default (0, i.e. any single signature clears them), and
# only raise low/med/high thresholds in the LAST step. Doing it the
# other way around (raising thresholds before all signers are in
# place) can lock the account out — a SetOptions raising the
# threshold to 2 requires 2 signatures worth of weight to itself
# clear once it takes effect, and the sole admin key has weight 1.
stellar tx new set-options \
  --network testnet \
  --source-account "$ADMIN" \
  --signer "$SIGNER_B_PK" --signer-weight 1 \
  --build-only > /tmp/${SUFFIX}-set-options-1.xdr
XDR1=$(stellar tx sign --network testnet --sign-with-key "$ADMIN" /tmp/${SUFFIX}-set-options-1.xdr)
stellar tx send --network testnet "$XDR1" > /dev/null
echo "   Added signer B (thresholds still default)."

stellar tx new set-options \
  --network testnet \
  --source-account "$ADMIN" \
  --signer "$SIGNER_C_PK" --signer-weight 1 \
  --build-only > /tmp/${SUFFIX}-set-options-2.xdr
XDR2=$(stellar tx sign --network testnet --sign-with-key "$ADMIN" /tmp/${SUFFIX}-set-options-2.xdr)
stellar tx send --network testnet "$XDR2" > /dev/null
echo "   Added signer C (thresholds still default)."

stellar tx new set-options \
  --network testnet \
  --source-account "$ADMIN" \
  --master-weight 1 \
  --low-threshold 2 --med-threshold 2 --high-threshold 2 \
  --build-only > /tmp/${SUFFIX}-set-options-3.xdr
XDR3=$(stellar tx sign --network testnet --sign-with-key "$ADMIN" /tmp/${SUFFIX}-set-options-3.xdr)
stellar tx send --network testnet "$XDR3" > /dev/null
echo -e "${GREEN}   Account now has 3 signers (orig admin + B + C), thresholds=2.${NC}"

echo ""
echo -e "${YELLOW}== 3. Attempting a payment with only 1 signature (expect failure) ==${NC}"
stellar tx new payment \
  --network testnet \
  --source-account "$ADMIN" \
  --destination "$DEST_PK" \
  --amount 10000000 \
  --build-only > /tmp/${SUFFIX}-payment.xdr
XDR_1SIG=$(stellar tx sign --network testnet --sign-with-key "$ADMIN" /tmp/${SUFFIX}-payment.xdr)
if stellar tx send --network testnet "$XDR_1SIG" 2>/tmp/${SUFFIX}-1sig-error.log; then
  echo -e "${RED}   UNEXPECTED: single-signature payment succeeded — multisig threshold is not enforced!${NC}"
  exit 1
else
  echo -e "${GREEN}   Confirmed: single-signature payment was rejected (insufficient weight):${NC}"
  grep -i "bad_auth\|tx_bad_auth\|not enough" /tmp/${SUFFIX}-1sig-error.log || cat /tmp/${SUFFIX}-1sig-error.log
fi

echo ""
echo -e "${YELLOW}== 4. Co-signing the same payment with 2 of 3 keys (expect success) ==${NC}"
XDR_2SIG=$(stellar tx sign --network testnet --sign-with-key "$SIGNER_B" "$XDR_1SIG")
stellar tx send --network testnet "$XDR_2SIG" > /tmp/${SUFFIX}-2sig-result.log
if grep -qi "success" /tmp/${SUFFIX}-2sig-result.log; then
  echo -e "${GREEN}   Confirmed: 2-of-3 co-signed payment succeeded.${NC}"
else
  echo -e "${RED}   UNEXPECTED: 2-of-3 co-signed payment did not report success:${NC}"
  cat /tmp/${SUFFIX}-2sig-result.log
  exit 1
fi

echo ""
echo -e "${GREEN}== Dry run complete: 2-of-3 multisig behaves as expected on testnet. ==${NC}"
echo "Disposable identities used (safe to ignore/discard): $ADMIN, $SIGNER_B, $SIGNER_C, $DEST"
echo "Next step: docs/multisig-admin-runbook.md for the reviewed mainnet cutover."
