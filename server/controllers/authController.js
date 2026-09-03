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
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

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

// @desc    Admin creates Officer account (Authority, Fire Officer, Pollution Officer)
// @route   POST /api/auth/create-officer (or /api/auth/create-authority)
// @access  Private/Admin
export const createOfficerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

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

    const validRoles = ['authority', 'fire_officer', 'pollution_officer'];
    const assignedRole = role && validRoles.includes(role) ? role : 'authority';

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists.' 
      });
    }

    const officerUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phoneNumber: phoneNumber ? phoneNumber.trim() : 'N/A',
      role: assignedRole,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: `${assignedRole.toUpperCase().replace('_', ' ')} account created successfully.`,
      user: {
        _id: officerUser._id,
        fullName: officerUser.fullName,
        email: officerUser.email,
        phoneNumber: officerUser.phoneNumber,
        role: officerUser.role,
        createdAt: officerUser.createdAt
      }
    });
  } catch (error) {
    console.error(`CreateOfficer Error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error creating officer account' 
    });
  }
};

// @desc    Get list of Officers (by role or all)
// @route   GET /api/auth/officers
// @access  Private/Authority/Admin
export const getOfficers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = { role: { $in: ['authority', 'fire_officer', 'pollution_officer'] } };

    if (role && ['authority', 'fire_officer', 'pollution_officer'].includes(role)) {
      query.role = role;
    }

    const officers = await User.find(query)
      .select('-password')
      .sort({ role: 1, fullName: 1 });

    res.status(200).json({
      success: true,
      count: officers.length,
      users: officers
    });
  } catch (error) {
    console.error(`GetOfficers Error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving officers' 
    });
  }
};
