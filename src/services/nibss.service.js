const nibssClient = require('../config/nibss');

async function insertBvn({ bvn, firstName, lastName, dateOfBirth, phoneNumber }) {
  try {
    const response = await nibssClient.post('/insertBvn', {
      bvn,
      firstName,
      lastName,
      dob: dateOfBirth,
      phone: phoneNumber,
    });
    return response.data; // { success, message, data }
  } catch (err) {
    console.error('NIBSS insertBvn failed:', err.response?.status, err.response?.data);
    throw err;
  }
}
async function nameEnquiry(accountNumber) {
  const response = await nibssClient.get(`/account/name-enquiry/${accountNumber}`);
  return response.data;
}
async function createAccount({ bvn, dateOfBirth }) {
  const response = await nibssClient.post('/account/create', {
    kycType: 'bvn',
    kycID: bvn,
    dob: dateOfBirth,
  });
  return response.data; // { message, account: { accountNumber, accountName, bankCode, ... } }
}
async function interBankTransfer({ fromAccountNumber, toAccountNumber, amount }) {
  const response = await nibssClient.post('/transfer', {
    from: fromAccountNumber,
    to: toAccountNumber,
    amount,
  });
  return response.data;
}

module.exports = { insertBvn, nameEnquiry, createAccount, interBankTransfer };
