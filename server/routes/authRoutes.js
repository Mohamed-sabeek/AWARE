import express from 'express';
import { 
  loginUser, 
  getMe, 
  createAuthorityUser, 
  getAuthorityUsers 
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public login
router.post('/login', loginUser);

// Private profile
router.get('/me', protect, getMe);

// Admin-only Authority user creation & listing
router.post('/create-authority', protect, admin, createAuthorityUser);
router.get('/authority-users', protect, admin, getAuthorityUsers);

// Public registration is explicitly disabled
router.post('/register', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Public registration is disabled. Authority accounts must be created by an Admin.'
  });
});

export default router;
