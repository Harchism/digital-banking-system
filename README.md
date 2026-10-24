# Digital Banking System — Backend

A backend for a digital bank, built for a Backend Engineering assignment. It covers customer onboarding, account management and core banking operations, integrated with the NibssByPhoenix API for BVN verification, account creation, name enquiry and transfers.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt for password hashing
- Axios for NIBSS API integration

## Setup

1. Clone the repo and install dependencies:
     npm install
   
2. Copy .env.example to .env in the project root and fill in your values. Never commit .env.
     PORT=4000
   DATABASE_URL=mongodb://localhost:27017/banking_system
   JWT_SECRET=<a long random string>
   JWT_EXPIRES_IN=1h
   NIBSS_API_KEY=<from NibssByPhoenix onboarding email>
   NIBSS_API_SECRET=<from NibssByPhoenix onboarding email>
   NIBSS_TOKEN=<generated via POST /api/auth/token on NIBSS Swagger>
   BANKCODE=<your assigned bank code>
   BANKNAME=<your assigned bank name>
   
3. Start the server:
     npm run dev
      The server runs on http://localhost:4000.

## ⚠️ Important: NIBSS Token Expiry
NIBSS_TOKEN expires periodically. If any NIBSS-dependent endpoint (account creation, name enquiry for other banks, inter-bank transfer) returns a 500 with "Invalid or expired token", generate a fresh token via POST /api/auth/token on the [NIBSS Swagger docs](https://nibssbyphoenix.onrender.com/api/docs/#/), replace the NIBSS_TOKEN line in .env (no quotes), and restart the server.

Also note: NIBSS's /api/account/create expects kycType as lowercase (`"bvn"`). The Swagger example value is uppercase, which fails.

## API Endpoints

### Onboarding
- POST /api/onboarding/onboard — Onboard a customer. Verifies the BVN through NIBSS, hashes the password and saves the customer. Status is set to onboarded on success.

### Auth
- POST /api/auth/login — Log in with email and password. Returns a JWT.

### Accounts (require Bearer token)
- POST /api/accounts — Create the logged-in customer's account through NIBSS, pre-funded with ₦15,000. Blocked unless the customer is onboarded. One account per customer.
- GET /api/accounts/me — Get the logged-in customer's account number and balance.
- GET /api/accounts/name-enquiry/:accountNumber — Look up an account holder's name. Checks local accounts first, then NIBSS for other banks. Returns source: "local" or source: "nibss".

### Transactions (require Bearer token)
- POST /api/transactions/transfer — Transfer funds.
  - Intra-bank: omit bankCode, or set it to your own bank code. Handled locally.
  - Inter-bank: set bankCode to a different bank's code. Sent through NIBSS.
  - Body: { "toAccountNumber": "...", "bankCode": "...", "amount": 1000 }
- GET /api/transactions/status/:reference — Check a transaction's status. Only returns transactions belonging to the logged-in customer.
- GET /api/transactions/history — The logged-in customer's own transaction history, newest first.

## Data Privacy
Every account and transaction endpoint takes the customer's identity from the JWT (`req.customer.id`), never from a client-supplied ID. A customer cannot read another customer's account, balance or transactions.

## Testing

With the server running in one terminal, run the end-to-end flow in another:node src/test-flow.js
This logs in as two customers, runs an intra-bank transfer, checks its status and confirms each customer's history.

Manual checks performed:
- Name enquiry for a local account, a NIBSS account, and an unknown account (404)
- A second account creation for the same customer (rejected)
- A request without a token (401)
- A transaction status requested by a different customer (404)
- A transfer above the balance (400)
- Intra-bank and inter-bank transfers, with status checks

No real BVN or NIN was used in testing. Transfers were made between accounts created through this system or NIBSS, as the assignment allows.

## Design Notes
- No database transactions for transfers: MongoDB multi-document transactions require a replica set.

Local transfers update balances and then write the transaction records without a session, so a failure between those steps could leave a record missing. A production system would run a replica set and wrap both steps in one transaction.
- Two records per intra-bank transfer: the debit uses the transfer reference, and the credit uses the same reference with a -CR suffix, because reference is unique in the schema.
- Inter-bank balance: the local balance is reduced only after NIBSS accepts the transfer.

## Project Structuresrc/
├── config/        # DB and NIBSS client setup
├── models/        # Mongoose schemas
├── services/      # Business logic, including NIBSS integration
├── controllers/   # Request handlers
├── routes/        # Express routers
├── middleware/    # Auth middleware, error handler
├── test-flow.js   # End-to-end test script
└── server.js      # Entry point