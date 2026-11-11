const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 12;

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests,
  };
}

exports.register = async (req, res) => {
  const { name, email, password, role, interests } = req.body;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    password.length < 8
  ) {
    return res.status(400).json({
      message: 'Name, email, and a password of at least 8 characters are required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.exists({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role && ['user', 'admin'].includes(role) ? role : 'user',
    interests: Array.isArray(interests) ? interests : [],
  });

  return res.status(201).json({
    token: createToken(user),
    user: publicUser(user),
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    token: createToken(user),
    user: publicUser(user),
  });
};