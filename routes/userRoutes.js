const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { email, password, isAdmin,userName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = new User({ email, password, isAdmin, userName });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Login Attempt:', { email, password }); // Log what the user is trying

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user);

    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Incorrect password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
      console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userData = {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      name: user.userName,
    };

    console.log('✅ Login successful:', userData);
    res.json({ token, user: userData, success: true });

  } catch (err) {
    console.error('💥 Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;