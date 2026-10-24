const mongoose = require('mongoose');
const crypto = require('crypto');
const Account = require('../models/account.model');
const Transaction = require('../models/transaction.model');
const nibssService = require('./nibss.service');

async function intraBankTransfer({ fromAccountId, toAccountNumber, amount }) {
  if (amount <= 0) {
    const err = new Error('Amount must be greater than zero');
    err.statusCode = 400;
    throw err;
  }

  const fromAccount = await Account.findById(fromAccountId);
  const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

  if (!toAccount) {
    const err = new Error('Recipient account not found');
    err.statusCode = 404;
    throw err;
  }
  if (fromAccount.accountNumber === toAccount.accountNumber) {
    const err = new Error('Cannot transfer to the same account');
    err.statusCode = 400;
    throw err;
  }
  if (fromAccount.balance < amount) {
    const err = new Error('Insufficient balance');
    err.statusCode = 400;
    throw err;
  }

  const reference = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  fromAccount.balance -= amount;
  toAccount.balance += amount;
  await fromAccount.save();
  await toAccount.save();

  await Transaction.create({
    account: fromAccount._id,
    type: 'debit',
    amount,
    counterpartyAccountNumber: toAccount.accountNumber,
    reference,
  });

  await Transaction.create({
    account: toAccount._id,
    type: 'credit',
    amount,
    counterpartyAccountNumber: fromAccount.accountNumber,
    reference: `${reference}-CR`,
  });

  return { reference, newBalance: fromAccount.balance };
}

async function sendTransfer({ fromAccountId, toAccountNumber, bankCode, amount }) {
  const isOwnBank = !bankCode || bankCode === process.env.BANKCODE;

  if (isOwnBank) {
    return await intraBankTransfer({ fromAccountId, toAccountNumber, amount });
  }

  if (amount <= 0) {
    const err = new Error('Amount must be greater than zero');
    err.statusCode = 400;
    throw err;
  }

  const fromAccount = await Account.findById(fromAccountId);
  if (fromAccount.balance < amount) {
    const err = new Error('Insufficient balance');
    err.statusCode = 400;
    throw err;
  }

  const nibssResult = await nibssService.interBankTransfer({
    fromAccountNumber: fromAccount.accountNumber,
    toAccountNumber,
    amount,
  });

  const reference = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  fromAccount.balance -= amount;
  await fromAccount.save();

  await Transaction.create({
    account: fromAccount._id,
    type: 'debit',
    amount,
    counterpartyAccountNumber: toAccountNumber,
    reference,
    status: nibssResult.success === false ? 'failed' : 'success',
  });

  return { reference, newBalance: fromAccount.balance, nibssResult };
}

async function getTransactionStatus(reference, customerId) {
  const Account = require('../models/account.model');
  const account = await Account.findOne({ customer: customerId });
  const transaction = await Transaction.findOne({ reference, account: account._id });
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  return transaction;
}

async function getHistory(customerId) {
  const Account = require('../models/account.model');
  const account = await Account.findOne({ customer: customerId });
  if (!account) {
    const err = new Error('You do not have an account');
    err.statusCode = 404;
    throw err;
  }
  return await Transaction.find({ account: account._id }).sort({ createdAt: -1 });
}


module.exports = { intraBankTransfer, getTransactionStatus, getHistory, sendTransfer };