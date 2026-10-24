const accountService = require('../services/account.service');

async function create(req, res, next) {
  try {
    const account = await accountService.createAccount(req.customer.id);
    res.status(201).json({ success: true, account });
  } catch (err) {
    next(err);
  }
}
async function getMine(req, res, next) {
  try {
    const account = await accountService.getMyAccount(req.customer.id);
    res.json({
      success: true,
      accountNumber: account.accountNumber,
      balance: account.balance,
      isNibssRegistered: account.isNibssRegistered,
    });
  } catch (err) {
    next(err);
  }
}
async function enquireName(req, res, next) {
  try {
    const { accountNumber } = req.params;
    const result = await accountService.nameEnquiry(accountNumber);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}


module.exports = { create, getMine, enquireName };