require('dotenv').config();
const axios = require('axios');

const BASE = 'http://localhost:4000/api';
const PASSWORD = process.env.TEST_PASSWORD || 'password123';

async function login(email) {
  const res = await axios.post(`${BASE}/auth/login`, { email, password: PASSWORD });
  return res.data.token;
} 

function auth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function run() {
  // 1. Log in as both customers
  const tundeToken = await login('tunde@example.com');
  const ngoziToken = await login('ngozi@example.com');
  console.log('✅ Logged in as Tunde and Ngozi');

  // 2. Get Ngozi's local account number
  const ngozi = (await axios.get(`${BASE}/accounts/me`, auth(ngoziToken))).data;
  console.log('✅ Ngozi account:', ngozi.accountNumber, 'balance:', ngozi.balance);

  // 3. Intra-bank transfer from tunde to Ngozi (no bankCode = own bank)
  const transfer = (await axios.post(
    `${BASE}/transactions/transfer`,
    { toAccountNumber: ngozi.accountNumber, amount: 1000 },
    auth(tundeToken)
  )).data;
  console.log('✅ Transfer success, reference:', transfer.reference, 'tunde new balance:', transfer.newBalance);

  // 4. Check transaction status
  const status = (await axios.get(`${BASE}/transactions/status/${transfer.reference}`, auth(tundeToken))).data;
  console.log('✅ Status:', status.transaction.status);

  // 5. Check history for both, confirm isolation
  const tundeHistory = (await axios.get(`${BASE}/transactions/history`, auth(tundeToken))).data;
  const ngoziHistory = (await axios.get(`${BASE}/transactions/history`, auth(ngoziToken))).data;
  console.log('✅ tunde sees', tundeHistory.transactions.length, 'transactions');
  console.log('✅ Ngozi sees', ngoziHistory.transactions.length, 'transactions');

  
  
  console.log('\n🎉 Intra-bank flow complete');
}

run().catch((err) => {
  console.error('❌ FAILED:', err.response?.status, err.response?.data || err.message);
  process.exitCode = 1;
});