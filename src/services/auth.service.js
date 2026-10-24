const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

async function login({ email, password }) {
  if (!process.env.JWT_SECRET) {
    const err = new Error('JWT secret is not configured');
    err.statusCode = 500;
    throw err;
  }

  const customer = await Customer.findOne({ email }).select('+password');
  const valid = customer && customer.password && (await bcrypt.compare(password, customer.password));

  if (!valid) {
    const err = new Error('invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
});
return token;
}

module.exports = { login };