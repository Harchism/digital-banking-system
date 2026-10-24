const Account = require('../models/account.model');
const Customer = require('../models/customer.model');
const nibssService = require('./nibss.service');

async function createAccount(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }
  if (customer.onboardingStatus !== 'onboarded') {
    const err = new Error('Customer must be onboarded before account creation');
    err.statusCode = 400;
    throw err;
  }
  const existing = await Account.findOne({ customer: customerId });
  if (existing) {
    const err = new Error('Customer already has an account');
    err.statusCode = 400;
    throw err;
  }

  const nibssResult = await nibssService.createAccount({
    bvn: customer.bvn,
    dateOfBirth: customer.dateOfBirth,
  });

  const account = await Account.create({
    customer: customerId,
    accountNumber: nibssResult.account.accountNumber,
    balance: 15000,
    isNibssRegistered: true,
  });

  return account;
}

async function getMyAccount(customerId) {
  const account = await Account.findOne({ customer: customerId });
  if (!account) {
    const err = new Error('No account found for this customer');
    err.statusCode = 404;
    throw err;
  }
  return account;
}

async function nameEnquiry(accountNumber) {
  // 1. Our own customers: check the local database first
  const local = await Account.findOne({ accountNumber }).populate('customer');
  if (local) {
    return {
      source: 'local',
      accountNumber: local.accountNumber,
      accountName:`${local.customer.firstName} ${local.customer.lastName}`,
    };
  }

  // 2. Other banks: ask NIBSS
  try {
    const result = await nibssService.nameEnquiry(accountNumber);
    return { source: 'nibss', accountNumber, ...result };
  } catch (err) {
    if (err.response?.status === 404) {
      const notFound = new Error('Account not found');
      notFound.statusCode = 404;
      throw notFound;
    }
    // Any other error (e.g. expired NIBSS token) is passed through so it isn't hidden
    throw err;
  }
}

module.exports = { createAccount, getMyAccount, nameEnquiry };