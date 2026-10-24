const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  counterpartyAccountNumber: String,
  counterpartyName: String,
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  reference: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);