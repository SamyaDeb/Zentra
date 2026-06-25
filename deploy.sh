#!/bin/bash
set -e

# Zentra TrustCircles Deployment Script
# Deploys the Soroban smart contract and the Next.js frontend

NETWORK="${NETWORK:-testnet}"
RPC_URL="${SOROBAN_RPC_URL:-https://soroban-testnet.stellar.org}"
NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Test SDF Network ; September 2015}"

echo "=== Zentra Deployment Script ==="
echo "Network: $NETWORK"

# ── Step 1: Build the smart contract ────────────────────────────────────────
echo ""
echo ">> Building Soroban contract..."
cd contracts
cargo build --target wasm32-unknown-unknown --release
WASM_FILE=$(find target/wasm32-unknown-unknown/release -name "*.wasm" | head -1)
echo "   Built: $WASM_FILE"

# ── Step 2: Run contract tests ───────────────────────────────────────────────
echo ""
echo ">> Running contract tests..."
cargo test

# ── Step 3: Deploy contract (requires STELLAR_SECRET_KEY) ───────────────────
if [ -n "$STELLAR_SECRET_KEY" ]; then
  echo ""
  echo ">> Deploying contract to $NETWORK..."

  # Install Stellar CLI if not present
  if ! command -v stellar &> /dev/null; then
    cargo install stellar-cli --features opt
  fi

  CONTRACT_ID=$(stellar contract deploy \
    --wasm "$WASM_FILE" \
    --source "$STELLAR_SECRET_KEY" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$NETWORK_PASSPHRASE")

  echo "   Contract deployed: $CONTRACT_ID"
  export NEXT_PUBLIC_CONTRACT_ID="$CONTRACT_ID"
else
  echo "   STELLAR_SECRET_KEY not set — skipping on-chain deployment"
  echo "   Using existing NEXT_PUBLIC_CONTRACT_ID=${NEXT_PUBLIC_CONTRACT_ID:-not set}"
fi

cd ..

# ── Step 4: Build the Next.js frontend ──────────────────────────────────────
echo ""
echo ">> Building Next.js frontend..."
npm ci --legacy-peer-deps
npm run build

# ── Step 5: Deploy frontend to Vercel ───────────────────────────────────────
if [ -n "$VERCEL_TOKEN" ]; then
  echo ""
  echo ">> Deploying frontend to Vercel..."
  npx vercel --token "$VERCEL_TOKEN" --prod --yes
else
  echo "   VERCEL_TOKEN not set — skipping Vercel deployment"
fi

echo ""
echo "=== Deployment complete ==="
