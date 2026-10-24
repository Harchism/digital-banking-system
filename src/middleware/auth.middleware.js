const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'JWT secret is not configured' });
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Use Bearer <token>' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = { id: payload.id };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = auth;