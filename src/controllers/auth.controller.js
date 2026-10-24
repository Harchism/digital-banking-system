const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const token = await authService.login(req.body);
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };