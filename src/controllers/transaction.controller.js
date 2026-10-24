const Account = require('../models/account.model');
const transactionService = require('../services/transaction.service');

async function transfer(req, res, next) {
  try {
    const { toAccountNumber, bankCode, amount } = req.body;
    const fromAccount = await Account.findOne({ customer: req.customer.id });
    if (!fromAccount) {
      const err = new Error('You do not have an account');
      err.statusCode = 404;
      throw err;
    }
    const result = await transactionService.sendTransfer({
      fromAccountId: fromAccount._id,
      toAccountNumber,
      bankCode,
      amount,
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function status(req, res, next) {
  try {
    const { reference } = req.params;
    const transaction = await transactionService.getTransactionStatus(reference, req.customer.id);
    res.json({ success: true, transaction });
  } catch (err) {
    next(err);
  }
}
async function history(req, res, next) {
  try {
    const transactions = await transactionService.getHistory(req.customer.id);
    res.json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
}




module.exports = { transfer, status, history };

