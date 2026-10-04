const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LoginSession = require('../models/LoginSession');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, password, role, branch, year, mobileNumber } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    
    // Only allow Admin creation if it's the specific admin email
    if (role === 'Admin' && email !== 'admin@codeforge.com') {
      return res.status(403).json({ message: 'Not authorized to create Admin accounts' });
    }

    // Enforce college domain for members
    if ((role === 'Member' || !role) && !email.endsWith('@mbu.asia')) {
      return res.status(400).json({ message: 'Must use a valid @mbu.asia college email address' });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let rollNumber = null;
    if (email && email.includes('@')) {
      rollNumber = email.split('@')[0].toUpperCase();
    }

    const user = await User.create({
      name,
      email,
      rollNumber,
      password: hashedPassword,
      role: role || 'Member',
      branch: branch || null,
      year: year || null,
      mobileNumber: mobileNumber || null,
      accountStatus: role === 'Admin' ? 'APPROVED' : 'PENDING'
    });

    if (user) {
      if (user.role === 'Admin') {
        res.status(201).json({
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id),
        });
      } else {
        res.status(201).json({ message: 'Registration successful. Waiting for admin approval.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password: support bcrypt hash or legacy plain text (auto-upgrade)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch && user.password === password) {
      // Auto-upgrade legacy plain text password to bcrypt
      isMatch = true;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    if (isMatch) {
      // Only check account status for Members
      if (user.role !== 'Admin') {
        if (user.accountStatus === 'PENDING') {
          return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for an administrator to approve your account.' });
        }
        if (user.accountStatus === 'REJECTED') {
          return res.status(403).json({ message: 'Your account registration was rejected by an administrator.' });
        }
        if (user.isBlocked) {
          return res.status(403).json({ message: 'Your account has been temporarily suspended by an administrator.' });
        }
      }
      
      // Create Login Session safely
      let sessionId = null;
      try {
        const session = await LoginSession.create({
          userId: user.id,
          ipAddress: req.ip || '',
          browser: (req.headers['user-agent'] || '').substring(0, 255)
        });
        sessionId = session.id;
      } catch (sessionErr) {
        console.warn('Login session record warning:', sessionErr.message);
      }
      
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sessionId,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      const session = await LoginSession.findByPk(sessionId);
      if (session && session.userId === req.user.id) {
        session.logoutTime = new Date();
        session.durationSeconds = Math.round((session.logoutTime - session.loginTime) / 1000);
        await session.save();
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @route POST /api/auth/forgot-password
// @desc Generate OTP and send to mobile number
router.post('/forgot-password', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const user = await User.findOne({ where: { mobileNumber } });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this mobile number.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.resetOtp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // In a production app, integrate with Twilio/SMS Gateway here.
    // For development, we log it to the console and return it for easy testing.
    console.log(`[SMS SIMULATION] OTP for ${mobileNumber} is ${otp}`);

    res.json({ message: 'OTP sent successfully', simulatedOtp: otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/reset-password
// @desc Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { mobileNumber, otp, newPassword } = req.body;
    
    const user = await User.findOne({ where: { mobileNumber } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.otpExpiry = null;
    
    // As requested: requires Admin approval again after password reset
    if (user.role !== 'Admin') {
      user.accountStatus = 'PENDING';
    }

    await user.save();

    res.json({ message: 'Password reset successfully. Please wait for Admin approval to login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
