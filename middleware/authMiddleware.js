const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  const authorization = req.get('authorization');
  const [scheme, token, ...extra] = authorization ? authorization.split(' ') : [];
  if (scheme !== 'Bearer' || !token || extra.length > 0) {
    return res.status(401).json({ message: 'A bearer token is required.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error('JWT_SECRET is not configured'));
  }

  let payload;
  try {
    payload = jwt.verify(token, secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    return next(error);
  }

  if (
    typeof payload !== 'object' ||
    typeof payload.sub !== 'string'
  ) {
    return res.status(401).json({ message: 'Invalid token payload.' });
  }

  const user = await User.findById(payload.sub).select('name email role');
  if (!user) {
    return res.status(401).json({ message: 'User account no longer exists.' });
  }
  req.user = user;
  return next();
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to access this resource.' });
  }
  return next();
};
