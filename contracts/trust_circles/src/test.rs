//! Unit tests for TrustCircles contract

#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, token::StellarAssetClient, Address, Env, String};

// ============ TEST HELPERS ============

fn setup_env() -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    // Create a real token contract for testing
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();

    let contract_id = env.register(TrustCirclesContract, ());

    (env, admin, token_id, contract_id)
}

fn initialize_contract(env: &Env, contract_id: &Address, admin: &Address, token_id: &Address) {
    let client = TrustCirclesContractClient::new(env, contract_id);
    client.initialize(admin, token_id);
}

fn create_test_users(env: &Env, count: u32) -> std::vec::Vec<Address> {
    let mut users = std::vec::Vec::new();
    for _ in 0..count {
        users.push(Address::generate(env));
    }
    users
}

fn mint_tokens(env: &Env, token_id: &Address, to: &Address, amount: i128) {
    let token_client = StellarAssetClient::new(env, token_id);
    token_client.mint(to, &amount);
}

// ============ INITIALIZATION TESTS ============

#[test]
fn test_initialize() {
    let (env, admin, token_id, contract_id) = setup_env();
    let client = TrustCirclesContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_circle_count(), 0);
    assert_eq!(client.get_loan_count(), 0);
    assert_eq!(client.get_contract_balance(), 0);
    assert_eq!(client.is_demo_mode(), false);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_initialize_twice_fails() {
    let (env, admin, token_id, contract_id) = setup_env();
    let client = TrustCirclesContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.initialize(&admin, &token_id); // Should panic
}

// ============ CIRCLE TESTS ============

#[test]
fn test_create_circle() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let creator = Address::generate(&env);
    let name = String::from_str(&env, "Test Circle");

    // Mint tokens to the creator for the stake
    mint_tokens(&env, &token_id, &creator, MIN_STAKE);

    let circle_id = client.create_circle(&creator, &name);

    assert_eq!(circle_id, 1);
    assert_eq!(client.get_circle_count(), 1);

    let details = client.get_circle_details(&circle_id);
    assert_eq!(details.name, name);
    assert_eq!(details.member_count, 1);
    assert_eq!(details.is_active, false); // Not active until 3 members
}

#[test]
fn test_join_circle() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let users = create_test_users(&env, 3);
    let name = String::from_str(&env, "Active Circle");

    // Mint tokens to all users
    for user in &users {
        mint_tokens(&env, &token_id, user, MIN_STAKE);
    }

    // Create circle
    let circle_id = client.create_circle(&users[0], &name);

    // Join with 2 more members
    client.join_circle(&users[1], &circle_id);
    client.join_circle(&users[2], &circle_id);

    let details = client.get_circle_details(&circle_id);
    assert_eq!(details.member_count, 3);
    assert_eq!(details.is_active, true); // Now active with 3 members
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_join_circle_already_member() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    let name = String::from_str(&env, "Test Circle");

    // Mint tokens (enough for 2 stakes in case it tries)
    mint_tokens(&env, &token_id, &user, MIN_STAKE * 2);

    let circle_id = client.create_circle(&user, &name);
    client.join_circle(&user, &circle_id); // Should panic - already in circle
}

// ============ SCORING TESTS ============

#[test]
fn test_initial_trust_score() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    // User not in any circle should have starting score
    let score = client.get_trust_score(&user);
    assert_eq!(score, 50);
}

#[test]
fn test_trust_score_in_circle() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let users = create_test_users(&env, 3);
    let name = String::from_str(&env, "Score Circle");

    // Mint tokens to all users
    for user in &users {
        mint_tokens(&env, &token_id, user, MIN_STAKE);
    }

    // Create active circle
    let circle_id = client.create_circle(&users[0], &name);
    client.join_circle(&users[1], &circle_id);
    client.join_circle(&users[2], &circle_id);

    // All members start at 50, so score should be 50
    // Formula: (Individual × 60%) + (Circle × 40%) = (50 × 0.6) + (50 × 0.4) = 50
    let score = client.get_trust_score(&users[0]);
    assert_eq!(score, 50);
}

#[test]
fn test_max_loan_amount_by_score() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    // User with score 50 should get max 100 XLM
    let max_loan = client.get_max_loan_amount(&user);
    assert_eq!(max_loan, 100_0000000);
}

#[test]
fn test_interest_rate_by_score() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    // User with score 50 should get 6% interest
    let rate = client.get_interest_rate(&user);
    assert_eq!(rate, 6);
}

// ============ USER STATS TESTS ============

#[test]
fn test_get_user_stats_new_user() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    let stats = client.get_user_stats(&user);
    assert_eq!(stats.circle_id, 0);
    assert_eq!(stats.individual_score, 50);
    assert_eq!(stats.final_trust_score, 50);
    assert_eq!(stats.max_loan_amount, 100_0000000);
    assert_eq!(stats.interest_rate, 6);
    assert_eq!(stats.total_borrowed, 0);
    assert_eq!(stats.total_repaid, 0);
    assert_eq!(stats.loans_completed, 0);
    assert_eq!(stats.has_active_loan, false);
    assert_eq!(stats.is_active, true);
}

#[test]
fn test_get_user_stats_circle_member() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    let name = String::from_str(&env, "Test Circle");

    // Mint tokens for stake
    mint_tokens(&env, &token_id, &user, MIN_STAKE);

    let circle_id = client.create_circle(&user, &name);

    let stats = client.get_user_stats(&user);
    assert_eq!(stats.circle_id, circle_id);
    assert_eq!(stats.individual_score, 50);
    assert_eq!(stats.is_active, true);
}

// ============ ADMIN TESTS ============

#[test]
fn test_demo_mode() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);

    assert_eq!(client.is_demo_mode(), false);

    client.set_demo_mode(&true);
    assert_eq!(client.is_demo_mode(), true);

    client.set_demo_mode(&false);
    assert_eq!(client.is_demo_mode(), false);
}

#[test]
fn test_demo_loan_duration() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);

    // Set demo loan duration to 60 ledgers (~5 minutes)
    client.set_demo_loan_duration(&60);

    // Enable demo mode to use the custom duration
    client.set_demo_mode(&true);

    // The duration is stored and used internally when creating loans
    // We verify through the demo mode setting
    assert_eq!(client.is_demo_mode(), true);
}

// ============ CIRCLE DETAILS TESTS ============

#[test]
fn test_get_circle_details() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let users = create_test_users(&env, 3);
    let name = String::from_str(&env, "Detail Circle");

    // Mint tokens to all users
    for user in &users {
        mint_tokens(&env, &token_id, user, MIN_STAKE);
    }

    let circle_id = client.create_circle(&users[0], &name);
    client.join_circle(&users[1], &circle_id);
    client.join_circle(&users[2], &circle_id);

    let details = client.get_circle_details(&circle_id);
    assert_eq!(details.name, name);
    assert_eq!(details.member_count, 3);
    assert_eq!(details.average_score, 50);
    assert_eq!(details.total_stake, 30_0000000); // 3 × 10 XLM
    assert_eq!(details.is_active, true);
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_get_circle_details_not_found() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    client.get_circle_details(&999); // Should panic - circle doesn't exist
}

// ============ CIRCLE AVERAGE SCORE TESTS ============

#[test]
fn test_circle_average_score() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let users = create_test_users(&env, 3);
    let name = String::from_str(&env, "Average Circle");

    // Mint tokens to all users
    for user in &users {
        mint_tokens(&env, &token_id, user, MIN_STAKE);
    }

    let circle_id = client.create_circle(&users[0], &name);
    client.join_circle(&users[1], &circle_id);
    client.join_circle(&users[2], &circle_id);

    // All start at 50, average should be 50
    let avg = client.get_circle_average_score(&circle_id);
    assert_eq!(avg, 50);
}

// ============ EDGE CASES ============

#[test]
#[should_panic(expected = "Error(Contract, #23)")]
fn test_create_circle_empty_name() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    let empty_name = String::from_str(&env, "");

    // Mint tokens for stake
    mint_tokens(&env, &token_id, &user, MIN_STAKE);

    client.create_circle(&user, &empty_name); // Should panic
}

#[test]
fn test_user_loans_empty() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    let loans = client.get_user_loans(&user);
    assert_eq!(loans.len(), 0);
}

// ============ DEPOSIT & LOAN TESTS ============

#[test]
fn test_deposit_liquidity() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let deposit_amount: i128 = 1000_0000000; // 1000 XLM

    // Mint tokens to admin
    mint_tokens(&env, &token_id, &admin, deposit_amount);

    // Deposit liquidity
    client.deposit_liquidity(&deposit_amount);

    assert_eq!(client.get_contract_balance(), deposit_amount);
}

#[test]
fn test_request_loan() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let users = create_test_users(&env, 3);
    let circle_name = String::from_str(&env, "Loan Circle");

    // Mint tokens for stakes
    for user in &users {
        mint_tokens(&env, &token_id, user, MIN_STAKE);
    }

    // Create active circle
    let circle_id = client.create_circle(&users[0], &circle_name);
    client.join_circle(&users[1], &circle_id);
    client.join_circle(&users[2], &circle_id);

    // Request loan
    let loan_amount: i128 = 50_0000000; // 50 XLM
    let purpose = String::from_str(&env, "Business inventory");

    let loan_id = client.request_loan(&users[0], &loan_amount, &purpose);

    assert_eq!(loan_id, 1);
    assert_eq!(client.get_loan_count(), 1);

    // Check user stats
    let stats = client.get_user_stats(&users[0]);
    assert_eq!(stats.has_active_loan, true);
}

#[test]
fn test_full_loan_cycle() {
    let (env, admin, token_id, contract_id) = setup_env();
    initialize_contract(&env, &contract_id, &admin, &token_id);

    let client = TrustCirclesContractClient::new(&env, &contract_id);
    let users = create_test_users(&env, 3);
    let circle_name = String::from_str(&env, "Full Cycle Circle");

    // Mint tokens for stakes
    for user in &users {
        mint_tokens(&env, &token_id, user, MIN_STAKE);
    }

    // Admin deposits liquidity
    let deposit_amount: i128 = 1000_0000000;
    mint_tokens(&env, &token_id, &admin, deposit_amount);
    client.deposit_liquidity(&deposit_amount);

    // Create active circle
    let circle_id = client.create_circle(&users[0], &circle_name);
    client.join_circle(&users[1], &circle_id);
    client.join_circle(&users[2], &circle_id);

    // Request loan
    let loan_amount: i128 = 50_0000000; // 50 XLM
    let purpose = String::from_str(&env, "Equipment purchase");
    let loan_id = client.request_loan(&users[0], &loan_amount, &purpose);

    // Approve loan
    client.approve_loan(&loan_id);

    // Get loan details
    let loan = client.get_loan_details(&loan_id);
    assert_eq!(loan.approved, true);
    assert_eq!(loan.disbursed, true);
    assert_eq!(loan.amount, loan_amount);

    // Mint repayment tokens to borrower (principal + interest)
    mint_tokens(&env, &token_id, &users[0], loan.total_repayment);

    // Repay loan
    client.repay_loan(&users[0], &loan_id);

    // Verify loan is repaid
    let loan_after = client.get_loan_details(&loan_id);
    assert_eq!(loan_after.repaid, true);

    // Verify user stats updated
    let stats = client.get_user_stats(&users[0]);
    assert_eq!(stats.has_active_loan, false);
    assert_eq!(stats.loans_completed, 1);
    assert!(stats.individual_score > 50); // Score increased due to on-time repayment
}
