import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aware_jwt_secret_key_123');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error(`Auth Middleware Error: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

export const authority = (req, res, next) => {
  if (req.user && (req.user.role === 'authority' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an authority officer' });
  }
};

export const authorityOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'authority')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized for incident management' });
  }
};

export const fieldOfficer = (req, res, next) => {
  if (req.user && (req.user.role === 'fire_officer' || req.user.role === 'pollution_officer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as a field response officer' });
  }
};

export const anyOfficerOrAdmin = (req, res, next) => {
  if (req.user && ['admin', 'authority', 'fire_officer', 'pollution_officer'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized for incident records' });
  }
};
