import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(`GetMe Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error fetching user details' });
  }
};

// @desc    Admin creates Authority user account
// @route   POST /api/auth/create-authority
// @access  Private/Admin
export const createAuthorityUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide full name, email, and password.' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists.' 
      });
    }

    // Explicitly enforce role as 'authority' on the backend (do not trust client)
    const authorityUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phoneNumber: phoneNumber ? phoneNumber.trim() : 'N/A',
      role: 'authority',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Authority account created successfully.',
      user: {
        _id: authorityUser._id,
        fullName: authorityUser.fullName,
        email: authorityUser.email,
        phoneNumber: authorityUser.phoneNumber,
        role: authorityUser.role,
        createdAt: authorityUser.createdAt
      }
    });
  } catch (error) {
    console.error(`CreateAuthority Error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error creating authority user' 
    });
  }
};

// @desc    Admin gets list of Authority users
// @route   GET /api/auth/authority-users
// @access  Private/Admin
export const getAuthorityUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'authority' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(`GetAuthorityUsers Error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving authority users' 
    });
  }
};
