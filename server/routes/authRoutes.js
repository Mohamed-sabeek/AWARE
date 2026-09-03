import express from 'express';
import { 
  loginUser, 
  getMe, 
  createOfficerUser, 
  getOfficers 
} from '../controllers/authController.js';
import { protect, admin, authorityOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public login
router.post('/login', loginUser);

// Private profile
router.get('/me', protect, getMe);

// Admin-only Officer user creation (Authority, Fire Officer, Pollution Officer)
router.post('/create-officer', protect, admin, createOfficerUser);
router.post('/create-authority', protect, admin, createOfficerUser);

// Officer directory (Admin and Authority for assignment dropdowns)
router.get('/officers', protect, authorityOrAdmin, getOfficers);
router.get('/authority-users', protect, authorityOrAdmin, getOfficers);

// Public registration is explicitly disabled
router.post('/register', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Public registration is disabled. Accounts must be provisioned by an Administrator.'
  });
});

export default router;
