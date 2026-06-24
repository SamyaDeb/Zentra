//! TrustCircles - Community-Based Micro-Lending Platform on Stellar
//!
//! This contract enables peer-to-peer lending with trust circles and credit scoring.
//! Small vendors can form circles, build trust scores, and access under-collateralized loans.

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token::TokenClient, Address,
    Env, String, Vec,
};

mod storage;
mod test;

// ============ CONSTANTS ============

const MIN_CIRCLE_MEMBERS: u32 = 3;
const MAX_CIRCLE_MEMBERS: u32 = 10;
const STARTING_SCORE: u32 = 50;
const MAX_SCORE: u32 = 100;
const MIN_STAKE: i128 = 10_0000000; // 10 XLM (7 decimals)
const LOAN_DURATION_LEDGERS: u32 = 17280; // ~1 day in ledgers (5 sec/ledger) * 7 days
const INDIVIDUAL_WEIGHT: u32 = 60;
const CIRCLE_WEIGHT: u32 = 40;

// Score adjustments
const ON_TIME_BONUS: u32 = 10;
const EARLY_BONUS: u32 = 15;
const DEFAULT_PENALTY: u32 = 50;
const CIRCLE_DEFAULT_PENALTY: u32 = 20;

// ============ DATA TYPES ============

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Circle {
    pub id: u32,
    pub name: String,
    pub members: Vec<Address>,
    pub total_stake: i128,
    pub created_at: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct MemberData {
    pub circle_id: u32,
    pub individual_score: u32,
    pub trust_bond: i128,
    pub total_borrowed: i128,
    pub total_repaid: i128,
    pub loans_completed: u32,
    pub is_active: bool,
    pub has_active_loan: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Loan {
    pub id: u32,
    pub borrower: Address,
    pub amount: i128,
    pub interest_amount: i128,
    pub total_repayment: i128,
    pub request_ledger: u32,
    pub approval_ledger: u32,
    pub due_ledger: u32,
    pub repayment_ledger: u32,
    pub approved: bool,
    pub disbursed: bool,
    pub repaid: bool,
    pub purpose: String,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct UserStats {
    pub circle_id: u32,
    pub individual_score: u32,
    pub final_trust_score: u32,
    pub max_loan_amount: i128,
    pub interest_rate: u32,
    pub total_borrowed: i128,
    pub total_repaid: i128,
    pub loans_completed: u32,
    pub has_active_loan: bool,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct CircleDetails {
    pub name: String,
    pub members: Vec<Address>,
    pub member_count: u32,
    pub average_score: u32,
    pub total_stake: i128,
    pub is_active: bool,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    Admin,
    TokenId,
    CircleCount,
    LoanCount,
    ContractBalance,
    IsDemoMode,
    DemoLoanDuration,
    Circle(u32),
    CircleExists(u32),
    Member(Address),
    Loan(u32),
    UserLoans(Address),
}

// ============ ERRORS ============

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InsufficientStake = 4,
    AlreadyInCircle = 5,
    CircleNotFound = 6,
    CircleFull = 7,
    CircleNotActive = 8,
    NotInCircle = 9,
    AlreadyHasActiveLoan = 10,
    AmountExceedsLimit = 11,
    LoanNotFound = 12,
    LoanAlreadyApproved = 13,
    LoanNotApproved = 14,
    LoanAlreadyDisbursed = 15,
    LoanNotDisbursed = 16,
    LoanAlreadyRepaid = 17,
    NotBorrower = 18,
    InsufficientBalance = 19,
    AccountFrozen = 20,
    InvalidAmount = 21,
    InvalidPurpose = 22,
    InvalidName = 23,
    LoanNotOverdue = 24,
}

// ============ CONTRACT ============

#[contract]
pub struct TrustCirclesContract;

#[contractimpl]
impl TrustCirclesContract {
    // ============ INITIALIZATION ============

    /// Initialize the contract with admin address and XLM token
    pub fn initialize(env: Env, admin: Address, token_id: Address) -> Result<(), Error> {
        if storage::has_admin(&env) {
            return Err(Error::AlreadyInitialized);
        }

        storage::set_admin(&env, &admin);
        storage::set_token_id(&env, &token_id);
        storage::set_circle_count(&env, 0);
        storage::set_loan_count(&env, 0);
        storage::set_contract_balance(&env, 0);
        storage::set_demo_mode(&env, false);
        storage::set_demo_loan_duration(&env, 120); // 10 minutes in ledgers

        Ok(())
    }

    // ============ CIRCLE MANAGEMENT ============

    /// Create a new Trust Circle (requires 10 XLM stake)
    pub fn create_circle(env: Env, creator: Address, name: String) -> Result<u32, Error> {
        creator.require_auth();

        if name.len() == 0 {
            return Err(Error::InvalidName);
        }

        // Check if already in a circle
        if let Some(member) = storage::get_member(&env, &creator) {
            if member.circle_id > 0 {
                return Err(Error::AlreadyInCircle);
            }
        }

        // Transfer stake from creator to contract
        let token_id = storage::get_token_id(&env)?;
        let token = TokenClient::new(&env, &token_id);
        token.transfer(&creator, &env.current_contract_address(), &MIN_STAKE);

        // Create circle
        let circle_count = storage::get_circle_count(&env) + 1;
        storage::set_circle_count(&env, circle_count);

        let mut members = Vec::new(&env);
        members.push_back(creator.clone());

        let circle = Circle {
            id: circle_count,
            name: name.clone(),
            members,
            total_stake: MIN_STAKE,
            created_at: env.ledger().timestamp(),
            is_active: false, // Needs 3 members to activate
        };

        storage::set_circle(&env, circle_count, &circle);
        storage::set_circle_exists(&env, circle_count, true);

        // Create member data
        let member_data = MemberData {
            circle_id: circle_count,
            individual_score: STARTING_SCORE,
            trust_bond: MIN_STAKE,
            total_borrowed: 0,
            total_repaid: 0,
            loans_completed: 0,
            is_active: true,
            has_active_loan: false,
        };

        storage::set_member(&env, &creator, &member_data);

        // Emit event
        env.events().publish(
            (symbol_short!("circle"), symbol_short!("created")),
            (circle_count, name, creator),
        );

        Ok(circle_count)
    }

    /// Join an existing Trust Circle (requires 10 XLM stake)
    pub fn join_circle(env: Env, member: Address, circle_id: u32) -> Result<(), Error> {
        member.require_auth();

        // Check circle exists
        if !storage::get_circle_exists(&env, circle_id) {
            return Err(Error::CircleNotFound);
        }

        // Check if already in a circle
        if let Some(existing_member) = storage::get_member(&env, &member) {
            if existing_member.circle_id > 0 {
                return Err(Error::AlreadyInCircle);
            }
        }

        let mut circle = storage::get_circle(&env, circle_id)?;

        // Check circle not full
        if circle.members.len() >= MAX_CIRCLE_MEMBERS {
            return Err(Error::CircleFull);
        }

        // Transfer stake
        let token_id = storage::get_token_id(&env)?;
        let token = TokenClient::new(&env, &token_id);
        token.transfer(&member, &env.current_contract_address(), &MIN_STAKE);

        // Add member to circle
        circle.members.push_back(member.clone());
        circle.total_stake += MIN_STAKE;

        // Activate circle if minimum members reached
        if circle.members.len() >= MIN_CIRCLE_MEMBERS && !circle.is_active {
            circle.is_active = true;

            env.events().publish(
                (symbol_short!("circle"), symbol_short!("active")),
                circle_id,
            );
        }

        storage::set_circle(&env, circle_id, &circle);

        // Create member data
        let member_data = MemberData {
            circle_id,
            individual_score: STARTING_SCORE,
            trust_bond: MIN_STAKE,
            total_borrowed: 0,
            total_repaid: 0,
            loans_completed: 0,
            is_active: true,
            has_active_loan: false,
        };

        storage::set_member(&env, &member, &member_data);

        // Emit event
        env.events().publish(
            (symbol_short!("member"), symbol_short!("joined")),
            (circle_id, member, circle.members.len()),
        );

        Ok(())
    }

    // ============ SCORING ============

    /// Get circle's average score
    pub fn get_circle_average_score(env: Env, circle_id: u32) -> Result<u32, Error> {
        let circle = storage::get_circle(&env, circle_id)?;

        if circle.members.is_empty() {
            return Ok(STARTING_SCORE);
        }

        let mut total_score: u32 = 0;
        for member_addr in circle.members.iter() {
            if let Some(member) = storage::get_member(&env, &member_addr) {
                let score = if member.individual_score > 0 {
                    member.individual_score
                } else {
                    STARTING_SCORE
                };
                total_score += score;
            } else {
                total_score += STARTING_SCORE;
            }
        }

        Ok(total_score / circle.members.len())
    }

    /// Get user's final trust score
    pub fn get_trust_score(env: Env, user: Address) -> u32 {
        let member = match storage::get_member(&env, &user) {
            Some(m) => m,
            None => return STARTING_SCORE,
        };

        let individual_score = if member.individual_score > 0 {
            member.individual_score
        } else {
            STARTING_SCORE
        };

        if member.circle_id == 0 {
            return individual_score;
        }

        let circle = match storage::get_circle(&env, member.circle_id) {
            Ok(c) => c,
            Err(_) => return individual_score,
        };

        if !circle.is_active {
            return individual_score;
        }

        let circle_average =
            Self::get_circle_average_score(env.clone(), member.circle_id).unwrap_or(STARTING_SCORE);

        // Final = (Individual × 60%) + (Circle × 40%)
        (individual_score * INDIVIDUAL_WEIGHT + circle_average * CIRCLE_WEIGHT) / 100
    }

    /// Get maximum loan amount based on trust score
    pub fn get_max_loan_amount(env: Env, user: Address) -> i128 {
        let score = Self::get_trust_score(env, user);

        // Amounts in XLM (7 decimals)
        if score < 60 {
            100_0000000 // 100 XLM
        } else if score < 70 {
            200_0000000 // 200 XLM
        } else if score < 80 {
            500_0000000 // 500 XLM
        } else if score < 90 {
            1000_0000000 // 1000 XLM
        } else {
            2000_0000000 // 2000 XLM
        }
    }

    /// Get interest rate based on trust score (percentage)
    pub fn get_interest_rate(env: Env, user: Address) -> u32 {
        let score = Self::get_trust_score(env, user);

        if score < 60 {
            6 // 6%
        } else if score < 70 {
            4 // 4%
        } else if score < 80 {
            4 // 4%
        } else if score < 90 {
            2 // 2%
        } else {
            2 // 2%
        }
    }

    // ============ LOAN MANAGEMENT ============

    /// Request a new loan
    pub fn request_loan(
        env: Env,
        borrower: Address,
        amount: i128,
        purpose: String,
    ) -> Result<u32, Error> {
        borrower.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        if purpose.len() == 0 {
            return Err(Error::InvalidPurpose);
        }

        // Get member data
        let member = storage::get_member(&env, &borrower).ok_or(Error::NotInCircle)?;

        if !member.is_active {
            return Err(Error::AccountFrozen);
        }

        if member.circle_id == 0 {
            return Err(Error::NotInCircle);
        }

        // Check circle is active
        let circle = storage::get_circle(&env, member.circle_id)?;
        if !circle.is_active {
            return Err(Error::CircleNotActive);
        }

        if member.has_active_loan {
            return Err(Error::AlreadyHasActiveLoan);
        }

        // Check amount within limit
        let max_amount = Self::get_max_loan_amount(env.clone(), borrower.clone());
        if amount > max_amount {
            return Err(Error::AmountExceedsLimit);
        }

        // Calculate interest
        let interest_rate = Self::get_interest_rate(env.clone(), borrower.clone());
        let interest_amount = (amount * interest_rate as i128) / 100;
        let total_repayment = amount + interest_amount;

        // Create loan
        let loan_count = storage::get_loan_count(&env) + 1;
        storage::set_loan_count(&env, loan_count);

        let loan = Loan {
            id: loan_count,
            borrower: borrower.clone(),
            amount,
            interest_amount,
            total_repayment,
            request_ledger: env.ledger().sequence(),
            approval_ledger: 0,
            due_ledger: 0,
            repayment_ledger: 0,
            approved: false,
            disbursed: false,
            repaid: false,
            purpose: purpose.clone(),
        };

        storage::set_loan(&env, loan_count, &loan);

        // Update member - has active loan
        let mut updated_member = member;
        updated_member.has_active_loan = true;
        storage::set_member(&env, &borrower, &updated_member);

        // Add to user's loans
        let mut user_loans = storage::get_user_loans(&env, &borrower);
        user_loans.push_back(loan_count);
        storage::set_user_loans(&env, &borrower, &user_loans);

        // Emit event
        env.events().publish(
            (symbol_short!("loan"), symbol_short!("request")),
            (loan_count, borrower, amount, purpose),
        );

        Ok(loan_count)
    }

    /// Approve and disburse loan (admin only)
    pub fn approve_loan(env: Env, loan_id: u32) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        let mut loan = storage::get_loan(&env, loan_id)?;

        if loan.approved {
            return Err(Error::LoanAlreadyApproved);
        }

        // Check contract has sufficient balance
        let contract_balance = storage::get_contract_balance(&env);
        if contract_balance < loan.amount {
            return Err(Error::InsufficientBalance);
        }

        // Approve
        loan.approved = true;
        loan.approval_ledger = env.ledger().sequence();

        // Disburse immediately
        loan.disbursed = true;

        // Set due date
        let loan_duration = if storage::get_demo_mode(&env) {
            storage::get_demo_loan_duration(&env)
        } else {
            LOAN_DURATION_LEDGERS
        };
        loan.due_ledger = env.ledger().sequence() + loan_duration;

        // Update member stats
        if let Some(mut member) = storage::get_member(&env, &loan.borrower) {
            member.total_borrowed += loan.amount;
            storage::set_member(&env, &loan.borrower, &member);
        }

        // Transfer funds to borrower
        let token_id = storage::get_token_id(&env)?;
        let token = TokenClient::new(&env, &token_id);
        token.transfer(
            &env.current_contract_address(),
            &loan.borrower,
            &loan.amount,
        );

        // Update contract balance
        storage::set_contract_balance(&env, contract_balance - loan.amount);

        storage::set_loan(&env, loan_id, &loan);

        // Emit events
        env.events().publish(
            (symbol_short!("loan"), symbol_short!("approved")),
            (loan_id, loan.borrower.clone()),
        );

        env.events().publish(
            (symbol_short!("loan"), symbol_short!("disbursed")),
            (loan_id, loan.borrower, loan.amount),
        );

        Ok(())
    }

    /// Repay a loan
    pub fn repay_loan(env: Env, borrower: Address, loan_id: u32) -> Result<(), Error> {
        borrower.require_auth();

        let mut loan = storage::get_loan(&env, loan_id)?;

        if loan.borrower != borrower {
            return Err(Error::NotBorrower);
        }

        if !loan.disbursed {
            return Err(Error::LoanNotDisbursed);
        }

        if loan.repaid {
            return Err(Error::LoanAlreadyRepaid);
        }

        // Transfer repayment amount from borrower to contract
        let token_id = storage::get_token_id(&env)?;
        let token = TokenClient::new(&env, &token_id);
        token.transfer(
            &borrower,
            &env.current_contract_address(),
            &loan.total_repayment,
        );

        // Update loan
        loan.repaid = true;
        loan.repayment_ledger = env.ledger().sequence();
        storage::set_loan(&env, loan_id, &loan);

        // Update contract balance
        let contract_balance = storage::get_contract_balance(&env);
        storage::set_contract_balance(&env, contract_balance + loan.total_repayment);

        // Update member stats
        if let Some(mut member) = storage::get_member(&env, &borrower) {
            member.total_repaid += loan.total_repayment;
            member.loans_completed += 1;
            member.has_active_loan = false;

            // Calculate and apply credit bonus
            let credit_bonus =
                Self::calculate_credit_bonus(loan.due_ledger, env.ledger().sequence());

            if credit_bonus > 0 {
                let new_score = member.individual_score + credit_bonus;
                member.individual_score = if new_score > MAX_SCORE {
                    MAX_SCORE
                } else {
                    new_score
                };

                env.events().publish(
                    (symbol_short!("score"), symbol_short!("updated")),
                    (
                        borrower.clone(),
                        member.individual_score,
                        symbol_short!("repaid"),
                    ),
                );
            }

            storage::set_member(&env, &borrower, &member);
        }

        // Emit event
        env.events().publish(
            (symbol_short!("loan"), symbol_short!("repaid")),
            (loan_id, borrower),
        );

        Ok(())
    }

    /// Calculate credit bonus based on repayment timing
    fn calculate_credit_bonus(due_ledger: u32, repayment_ledger: u32) -> u32 {
        if repayment_ledger < due_ledger {
            EARLY_BONUS
        } else if repayment_ledger <= due_ledger + 8640 {
            // ~12 hours grace
            ON_TIME_BONUS
        } else if repayment_ledger <= due_ledger + 17280 {
            // ~1 day late
            0 // No bonus, but no penalty either
        } else {
            0 // Very late - handled separately
        }
    }

    /// Penalize user for loan default (admin only)
    pub fn penalize_default(env: Env, loan_id: u32) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        let loan = storage::get_loan(&env, loan_id)?;

        if !loan.disbursed {
            return Err(Error::LoanNotDisbursed);
        }

        if loan.repaid {
            return Err(Error::LoanAlreadyRepaid);
        }

        // Check if sufficiently overdue (14 days = 241920 ledgers)
        if env.ledger().sequence() <= loan.due_ledger + 241920 {
            return Err(Error::LoanNotOverdue);
        }

        let borrower = loan.borrower.clone();

        if let Some(mut member) = storage::get_member(&env, &borrower) {
            // Slash individual score
            if member.individual_score >= DEFAULT_PENALTY {
                member.individual_score -= DEFAULT_PENALTY;
            } else {
                member.individual_score = 0;
            }

            // Freeze account
            member.is_active = false;

            env.events().publish(
                (symbol_short!("score"), symbol_short!("updated")),
                (
                    borrower.clone(),
                    member.individual_score,
                    symbol_short!("default"),
                ),
            );

            env.events().publish(
                (symbol_short!("account"), symbol_short!("frozen")),
                (borrower.clone(), symbol_short!("default")),
            );

            // Penalize circle members
            if member.circle_id > 0 {
                Self::penalize_circle(&env, member.circle_id, &borrower)?;
            }

            storage::set_member(&env, &borrower, &member);
        }

        Ok(())
    }

    /// Penalize entire circle for member default
    fn penalize_circle(env: &Env, circle_id: u32, defaulter: &Address) -> Result<(), Error> {
        let circle = storage::get_circle(env, circle_id)?;

        for member_addr in circle.members.iter() {
            if &member_addr != defaulter {
                if let Some(mut member) = storage::get_member(env, &member_addr) {
                    if member.individual_score >= CIRCLE_DEFAULT_PENALTY {
                        member.individual_score -= CIRCLE_DEFAULT_PENALTY;
                    } else {
                        member.individual_score = 0;
                    }

                    env.events().publish(
                        (symbol_short!("score"), symbol_short!("updated")),
                        (
                            member_addr.clone(),
                            member.individual_score,
                            symbol_short!("circle"),
                        ),
                    );

                    storage::set_member(env, &member_addr, &member);
                }
            }
        }

        Ok(())
    }

    // ============ ADMIN FUNCTIONS ============

    /// Deposit liquidity for lending (admin only)
    pub fn deposit_liquidity(env: Env, amount: i128) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Transfer from admin to contract
        let token_id = storage::get_token_id(&env)?;
        let token = TokenClient::new(&env, &token_id);
        token.transfer(&admin, &env.current_contract_address(), &amount);

        // Update balance
        let current_balance = storage::get_contract_balance(&env);
        let new_balance = current_balance + amount;
        storage::set_contract_balance(&env, new_balance);

        env.events().publish(
            (symbol_short!("liquidity"), symbol_short!("deposit")),
            (admin, amount, new_balance),
        );

        Ok(())
    }

    /// Withdraw funds (admin only)
    pub fn withdraw(env: Env, amount: i128) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let current_balance = storage::get_contract_balance(&env);
        if current_balance < amount {
            return Err(Error::InsufficientBalance);
        }

        // Transfer from contract to admin
        let token_id = storage::get_token_id(&env)?;
        let token = TokenClient::new(&env, &token_id);
        token.transfer(&env.current_contract_address(), &admin, &amount);

        // Update balance
        let new_balance = current_balance - amount;
        storage::set_contract_balance(&env, new_balance);

        env.events().publish(
            (symbol_short!("funds"), symbol_short!("withdraw")),
            (admin, amount, new_balance),
        );

        Ok(())
    }

    /// Toggle demo mode (admin only)
    pub fn set_demo_mode(env: Env, enabled: bool) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        storage::set_demo_mode(&env, enabled);

        env.events()
            .publish((symbol_short!("demo"), symbol_short!("toggled")), enabled);

        Ok(())
    }

    /// Set demo loan duration (admin only)
    pub fn set_demo_loan_duration(env: Env, duration_ledgers: u32) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        storage::set_demo_loan_duration(&env, duration_ledgers);

        Ok(())
    }

    /// Unfreeze account (admin only)
    pub fn unfreeze_account(env: Env, user: Address) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        if let Some(mut member) = storage::get_member(&env, &user) {
            member.is_active = true;
            storage::set_member(&env, &user, &member);

            env.events()
                .publish((symbol_short!("account"), symbol_short!("unfreeze")), user);
        }

        Ok(())
    }

    // ============ VIEW FUNCTIONS ============

    /// Get user's complete stats
    pub fn get_user_stats(env: Env, user: Address) -> UserStats {
        let member = storage::get_member(&env, &user);

        match member {
            Some(m) => {
                let trust_score = Self::get_trust_score(env.clone(), user.clone());
                let max_loan = Self::get_max_loan_amount(env.clone(), user.clone());
                let interest = Self::get_interest_rate(env, user);

                UserStats {
                    circle_id: m.circle_id,
                    individual_score: m.individual_score,
                    final_trust_score: trust_score,
                    max_loan_amount: max_loan,
                    interest_rate: interest,
                    total_borrowed: m.total_borrowed,
                    total_repaid: m.total_repaid,
                    loans_completed: m.loans_completed,
                    has_active_loan: m.has_active_loan,
                    is_active: m.is_active,
                }
            }
            None => UserStats {
                circle_id: 0,
                individual_score: STARTING_SCORE,
                final_trust_score: STARTING_SCORE,
                max_loan_amount: 100_0000000,
                interest_rate: 6,
                total_borrowed: 0,
                total_repaid: 0,
                loans_completed: 0,
                has_active_loan: false,
                is_active: true,
            },
        }
    }

    /// Get circle details
    pub fn get_circle_details(env: Env, circle_id: u32) -> Result<CircleDetails, Error> {
        let circle = storage::get_circle(&env, circle_id)?;
        let avg_score = Self::get_circle_average_score(env, circle_id)?;

        Ok(CircleDetails {
            name: circle.name,
            members: circle.members.clone(),
            member_count: circle.members.len(),
            average_score: avg_score,
            total_stake: circle.total_stake,
            is_active: circle.is_active,
        })
    }

    /// Get loan details
    pub fn get_loan_details(env: Env, loan_id: u32) -> Result<Loan, Error> {
        storage::get_loan(&env, loan_id)
    }

    /// Get user's loan IDs
    pub fn get_user_loans(env: Env, user: Address) -> Vec<u32> {
        storage::get_user_loans(&env, &user)
    }

    /// Check if loan is overdue
    pub fn is_loan_overdue(env: Env, loan_id: u32) -> Result<bool, Error> {
        let loan = storage::get_loan(&env, loan_id)?;

        Ok(loan.disbursed && !loan.repaid && env.ledger().sequence() > loan.due_ledger)
    }

    /// Get contract balance
    pub fn get_contract_balance(env: Env) -> i128 {
        storage::get_contract_balance(&env)
    }

    /// Get admin address
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        storage::get_admin(&env)
    }

    /// Get circle count
    pub fn get_circle_count(env: Env) -> u32 {
        storage::get_circle_count(&env)
    }

    /// Get loan count
    pub fn get_loan_count(env: Env) -> u32 {
        storage::get_loan_count(&env)
    }

    /// Check if demo mode is enabled
    pub fn is_demo_mode(env: Env) -> bool {
        storage::get_demo_mode(&env)
    }
}
