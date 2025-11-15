const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Admin = require('../models/Admin');

const getTokenFromRequest = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }

  if (req.cookies && req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME || 'sp_access_token']) {
    return req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME || 'sp_access_token'];
  }

  return null;
};

const authenticate = (allowedRoles = []) =>
  async function authenticateMiddleware(req, res, next) {
    try {
      const token = getTokenFromRequest(req);

      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token missing' });
      }

      const decoded = verifyToken(token);
      let identity;

      if (decoded.role === 'admin' || decoded.role === 'super-admin') {
        identity = await Admin.findById(decoded.id);
      } else {
        identity = await User.findById(decoded.id);
      }

      if (!identity) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = {
        id: identity._id,
        role: decoded.role || identity.role,
        canteen: decoded.canteen || identity.canteen,
      };

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden resource' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };

const authorize = (...roles) => authenticate(roles);

module.exports = {
  authenticate,
  authorize,
};
