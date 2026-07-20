#!/bin/bash
# ==========================================
# Zentra TrustCircles - Stellar Deployment Script
# ==========================================
# 
# Prerequisites:
# 1. Rust toolchain: rustup target add wasm32-unknown-unknown
# 2. Stellar CLI: cargo install stellar-cli
# 3. Funded Stellar account configured as STELLAR_SOURCE_ACCOUNT
#
# Usage:
#   ./scripts/deploy.sh [network]
#   
#   network: testnet (default) or mainnet
#
# ==========================================

set -e

# Configuration
NETWORK=${1:-testnet}
CONTRACT_NAME="trust_circles"
ADMIN_ADDRESS="${STELLAR_ADMIN_ADDRESS:-GBALWWEQCFTHQ6FXSBRSB7X7WX5VVYBOVGT3GB34VABGY4MTB2F52FGX}"
SOURCE_ACCOUNT="${STELLAR_SOURCE_ACCOUNT:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ "$NETWORK" = "mainnet" ] && [ "${CONFIRM_MAINNET:-}" != "YES" ]; then
    echo -e "${RED}Refusing mainnet deployment without CONFIRM_MAINNET=YES${NC}"
    exit 1
fi

if [ -z "$SOURCE_ACCOUNT" ]; then
    echo -e "${RED}Set STELLAR_SOURCE_ACCOUNT to a configured identity or signing key${NC}"
    exit 1
fi

echo -e "${GREEN}=========================================="
echo "Zentra TrustCircles - Deployment"
echo -e "==========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v stellar &> /dev/null; then
    echo -e "${RED}Error: Stellar CLI not found. Install with: cargo install stellar-cli${NC}"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Error: Cargo not found. Install Rust from https://rustup.rs${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Build the contract
echo -e "${YELLOW}Building contract...${NC}"
cd "$(dirname "$0")/../contracts"

# Build for wasm32
cargo build --target wasm32-unknown-unknown --release -p trust-circles

# Optimize the wasm (if stellar contract optimize is available)
WASM_PATH="target/wasm32-unknown-unknown/release/${CONTRACT_NAME}.wasm"

if [ ! -f "$WASM_PATH" ]; then
    # Try with underscores replaced
    WASM_PATH="target/wasm32-unknown-unknown/release/trust_circles.wasm"
fi

if [ ! -f "$WASM_PATH" ]; then
    echo -e "${RED}Error: WASM file not found at $WASM_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Contract built successfully${NC}"
echo ""

# Network configuration
if [ "$NETWORK" = "mainnet" ]; then
    NETWORK_FLAG="--network mainnet"
    RPC_URL="${SOROBAN_RPC_URL:-https://mainnet.sorobanrpc.com}"
    NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
else
    NETWORK_FLAG="--network testnet"
    RPC_URL="https://soroban-testnet.stellar.org"
    NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
fi

echo -e "${YELLOW}Deploying to ${NETWORK}...${NC}"
echo "RPC URL: $RPC_URL"
echo ""

# Deploy the contract
echo -e "${YELLOW}Uploading contract WASM...${NC}"
CONTRACT_ID=$(stellar contract deploy \
    --wasm "$WASM_PATH" \
    $NETWORK_FLAG \
    --source-account "$SOURCE_ACCOUNT" \
    2>&1)

if [[ $CONTRACT_ID == C* ]]; then
    echo -e "${GREEN}✓ Contract deployed successfully!${NC}"
    echo ""
    echo "=========================================="
    echo -e "Contract ID: ${GREEN}$CONTRACT_ID${NC}"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Add to .env.local:"
    echo "   NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
    echo ""
    echo "2. Initialize the contract:"
    echo "   stellar contract invoke \\"
    echo "     --id $CONTRACT_ID \\"
    echo "     $NETWORK_FLAG \\"
    echo "     --source-account $ADMIN_ADDRESS \\"
    echo "     -- initialize \\"
    echo "     --admin $ADMIN_ADDRESS \\"
    echo "     --token_id <XLM_SAC_ADDRESS>"
    echo ""
    echo "3. Get the native XLM SAC address for your network"
    echo "   Mainnet XLM SAC: CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
    echo ""
else
    echo -e "${RED}Deployment failed:${NC}"
    echo "$CONTRACT_ID"
    exit 1
fi
