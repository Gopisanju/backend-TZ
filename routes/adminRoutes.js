const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Your Mongoose User model
const router = express.Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find admin user
    const user = await User.findOne({ email, isAdmin: true });
    console.log(user)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password using instance method or bcrypt
    const isMatch = await user.comparePassword(password);
    console.log(isMatch,password,'password')
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, message: "Login successful" });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
