//! Storage module for TrustCircles contract
//!
//! Provides helper functions for reading and writing contract state.

use soroban_sdk::{Address, Env, Vec};

use crate::{Circle, DataKey, Error, Loan, MemberData};

// ============ ADMIN ============

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

// ============ TOKEN ============

pub fn get_token_id(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::TokenId)
        .ok_or(Error::NotInitialized)
}

pub fn set_token_id(env: &Env, token_id: &Address) {
    env.storage().instance().set(&DataKey::TokenId, token_id);
}

// ============ COUNTERS ============

pub fn get_circle_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::CircleCount)
        .unwrap_or(0)
}

pub fn set_circle_count(env: &Env, count: u32) {
    env.storage().instance().set(&DataKey::CircleCount, &count);
}

pub fn get_loan_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::LoanCount)
        .unwrap_or(0)
}

pub fn set_loan_count(env: &Env, count: u32) {
    env.storage().instance().set(&DataKey::LoanCount, &count);
}

// ============ CONTRACT BALANCE ============

pub fn get_contract_balance(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&DataKey::ContractBalance)
        .unwrap_or(0)
}

pub fn set_contract_balance(env: &Env, balance: i128) {
    env.storage()
        .instance()
        .set(&DataKey::ContractBalance, &balance);
}

// ============ DEMO MODE ============

pub fn get_demo_mode(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::IsDemoMode)
        .unwrap_or(false)
}

pub fn set_demo_mode(env: &Env, enabled: bool) {
    env.storage().instance().set(&DataKey::IsDemoMode, &enabled);
}

pub fn get_demo_loan_duration(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::DemoLoanDuration)
        .unwrap_or(120) // Default: ~10 minutes in ledgers
}

pub fn set_demo_loan_duration(env: &Env, duration: u32) {
    env.storage()
        .instance()
        .set(&DataKey::DemoLoanDuration, &duration);
}

// ============ CIRCLES ============

pub fn get_circle(env: &Env, circle_id: u32) -> Result<Circle, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Circle(circle_id))
        .ok_or(Error::CircleNotFound)
}

pub fn set_circle(env: &Env, circle_id: u32, circle: &Circle) {
    env.storage()
        .persistent()
        .set(&DataKey::Circle(circle_id), circle);
}

pub fn get_circle_exists(env: &Env, circle_id: u32) -> bool {
    env.storage()
        .persistent()
        .get(&DataKey::CircleExists(circle_id))
        .unwrap_or(false)
}

pub fn set_circle_exists(env: &Env, circle_id: u32, exists: bool) {
    env.storage()
        .persistent()
        .set(&DataKey::CircleExists(circle_id), &exists);
}

// ============ MEMBERS ============

pub fn get_member(env: &Env, address: &Address) -> Option<MemberData> {
    env.storage()
        .persistent()
        .get(&DataKey::Member(address.clone()))
}

pub fn set_member(env: &Env, address: &Address, member: &MemberData) {
    env.storage()
        .persistent()
        .set(&DataKey::Member(address.clone()), member);
}

// ============ LOANS ============

pub fn get_loan(env: &Env, loan_id: u32) -> Result<Loan, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Loan(loan_id))
        .ok_or(Error::LoanNotFound)
}

pub fn set_loan(env: &Env, loan_id: u32, loan: &Loan) {
    env.storage()
        .persistent()
        .set(&DataKey::Loan(loan_id), loan);
}

// ============ USER LOANS ============

pub fn get_user_loans(env: &Env, user: &Address) -> Vec<u32> {
    env.storage()
        .persistent()
        .get(&DataKey::UserLoans(user.clone()))
        .unwrap_or(Vec::new(env))
}

pub fn set_user_loans(env: &Env, user: &Address, loans: &Vec<u32>) {
    env.storage()
        .persistent()
        .set(&DataKey::UserLoans(user.clone()), loans);
}
