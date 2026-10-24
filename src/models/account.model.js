const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
  accountNumber: { type: String, required: true, unique: true },
  balance: { type: Number, default: 15000 },
  isNibssRegistered: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);