const onboardingService = require('../services/onboarding.service');
const bcrypt = require('bcrypt');

async function onboard(req, res, next) {
  try {
    const { firstName, lastName, email, phoneNumber, bvn, dateOfBirth, gender, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await onboardingService.onboardCustomer({
      firstName, lastName, email, phoneNumber, bvn, dateOfBirth, gender, password: hashedPassword
    });
    res.status(201).json({ success: true, customer });
  } catch (err) {
    next(err);
  }
}

module.exports = { onboard };