const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Controller
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10); // ✅ HASHING HERE ONLY

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
// Login Controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email, password); // 🔍 Step 1: Log input

    const user = await User.findOne({ email });
    console.log("User found:", user); // 🔍 Step 2: Log fetched user

    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch); // 🔍 Step 3: Log password match result

    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};

module.exports = { registerUser, loginUser };