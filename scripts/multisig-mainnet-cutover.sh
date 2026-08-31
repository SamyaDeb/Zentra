#!/bin/bash
# ==========================================
# Zentra - Admin Multi-Sig Mainnet Cutover
# ==========================================
#
# Builds (but does NOT sign or submit) the 3 SetOptions transactions
# needed to turn the live mainnet TrustCircles admin account into a
# 2-of-3 multisig. Run ONLY after scripts/multisig-testnet-dryrun.sh
# has passed and the two new co-signers' keys are generated and
# secured by their holders.
#
# This script never touches a mainnet secret key — it builds unsigned
# XDR from public keys only (--build-only). The operator holding the
# current sole admin key reviews and signs each XDR themselves (e.g.
# via `stellar tx sign --sign-with-key <identity>` or a hardware
# wallet / Freighter), then submits with `stellar tx send`, BEFORE
# generating the next XDR — the order below is not optional: raising
# thresholds before every signer is added can lock the account out
# (see scripts/multisig-testnet-dryrun.sh for why).
#
# Usage:
#   ADMIN_ADDRESS=G...         # current sole admin (defaults to the deployed contract's admin)
#   SIGNER_B_ADDRESS=G...      # new co-signer #1 public key
#   SIGNER_C_ADDRESS=G...      # new co-signer #2 public key
#   CONFIRM_MAINNET=YES ./scripts/multisig-mainnet-cutover.sh
# ==========================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ADMIN_ADDRESS="${ADMIN_ADDRESS:-GBALWWEQCFTHQ6FXSBRSB7X7WX5VVYBOVGT3GB34VABGY4MTB2F52FGX}"
SIGNER_B_ADDRESS="${SIGNER_B_ADDRESS:-}"
SIGNER_C_ADDRESS="${SIGNER_C_ADDRESS:-}"

if [ "${CONFIRM_MAINNET:-}" != "YES" ]; then
  echo -e "${RED}Refusing to build mainnet transactions without CONFIRM_MAINNET=YES${NC}"
  exit 1
fi

if [ -z "$SIGNER_B_ADDRESS" ] || [ -z "$SIGNER_C_ADDRESS" ]; then
  echo -e "${RED}Set SIGNER_B_ADDRESS and SIGNER_C_ADDRESS to the two new co-signers' public keys${NC}"
  exit 1
fi

if ! command -v stellar &> /dev/null; then
  echo -e "${RED}Error: Stellar CLI not found. Install with: cargo install stellar-cli${NC}"
  exit 1
fi

echo -e "${YELLOW}=========================================="
echo "Zentra Admin Multisig Cutover — MAINNET"
echo -e "==========================================${NC}"
echo "Admin (current sole signer): $ADMIN_ADDRESS"
echo "New co-signer B:             $SIGNER_B_ADDRESS"
echo "New co-signer C:             $SIGNER_C_ADDRESS"
echo ""
echo -e "${RED}Have you already run scripts/multisig-testnet-dryrun.sh successfully and confirmed the${NC}"
echo -e "${RED}two new signers hold their own keys securely? This script assumes yes.${NC}"
echo ""

mkdir -p /tmp/zentra-multisig-cutover
OUT=/tmp/zentra-multisig-cutover

echo -e "${GREEN}Step 1/3 — add co-signer B (thresholds stay at their current value)${NC}"
stellar tx new set-options \
  --network mainnet \
  --source-account "$ADMIN_ADDRESS" \
  --signer "$SIGNER_B_ADDRESS" --signer-weight 1 \
  --build-only > "$OUT/step1-add-signer-b.xdr"
echo "  Unsigned XDR written to $OUT/step1-add-signer-b.xdr"
echo "  Sign with the CURRENT sole admin key and submit before continuing:"
echo "    stellar tx sign --network mainnet --sign-with-key <admin-identity> $OUT/step1-add-signer-b.xdr | stellar tx send --network mainnet"
echo ""

echo -e "${GREEN}Step 2/3 — add co-signer C (thresholds stay at their current value)${NC}"
echo -e "${YELLOW}  Do NOT run this until step 1 has been signed and submitted successfully.${NC}"
stellar tx new set-options \
  --network mainnet \
  --source-account "$ADMIN_ADDRESS" \
  --signer "$SIGNER_C_ADDRESS" --signer-weight 1 \
  --build-only > "$OUT/step2-add-signer-c.xdr"
echo "  Unsigned XDR written to $OUT/step2-add-signer-c.xdr"
echo "  Sign with the CURRENT sole admin key and submit before continuing:"
echo "    stellar tx sign --network mainnet --sign-with-key <admin-identity> $OUT/step2-add-signer-c.xdr | stellar tx send --network mainnet"
echo ""

echo -e "${GREEN}Step 3/3 — raise thresholds to require 2 signatures (LAST, after both signers exist)${NC}"
echo -e "${YELLOW}  Do NOT run this until step 2 has been signed and submitted successfully.${NC}"
stellar tx new set-options \
  --network mainnet \
  --source-account "$ADMIN_ADDRESS" \
  --master-weight 1 \
  --low-threshold 2 --med-threshold 2 --high-threshold 2 \
  --build-only > "$OUT/step3-raise-thresholds.xdr"
echo "  Unsigned XDR written to $OUT/step3-raise-thresholds.xdr"
echo "  Sign with the CURRENT sole admin key and submit:"
echo "    stellar tx sign --network mainnet --sign-with-key <admin-identity> $OUT/step3-raise-thresholds.xdr | stellar tx send --network mainnet"
echo ""

echo -e "${RED}IMPORTANT: this script only wrote unsigned XDR files — nothing has been submitted.${NC}"
echo "After step 3 is confirmed on-chain, verify via Horizon before relying on it operationally:"
echo "  curl -s https://horizon.stellar.org/accounts/$ADMIN_ADDRESS | jq '.signers, .thresholds'"
echo ""
echo "Then rehearse with a zero-financial-impact admin call (e.g. set_demo_mode) co-signed by"
echo "2 of the 3 keys before trusting this setup for withdraw/approve_loan. See"
echo "docs/multisig-admin-runbook.md for the ongoing co-signing process."
