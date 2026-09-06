const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { signToken } = require('../utils/jwt');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = makeToken();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24h
    });

    const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Verify your email — Pizza App',
      html: `<p>Hi ${user.name},</p>
             <p>Please verify your email to activate your account:</p>
             <p><a href="${verifyUrl}">${verifyUrl}</a></p>
             <p>This link expires in 24 hours.</p>`
    });

    if (!emailSent) {
      // Account was created, but be honest that the email didn't go out —
      // silently claiming success here is what makes broken email config
      // invisible. Check the server logs for the underlying nodemailer error.
      return res.status(201).json({
        message:
          'Account created, but the verification email could not be sent. Please contact support or try registering again once email delivery is fixed.'
      });
    }

    res.status(201).json({
      message: 'Registered. Please check your email to verify your account.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Missing verification token.' });

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const genericError = 'Incorrect email or password.';

    if (!user) return res.status(401).json({ message: genericError });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: genericError });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = signToken({ id: user._id, role: 'user' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });

    // Always respond the same way, whether or not the account exists —
    // avoids leaking which emails are registered.
    const genericMessage = 'If that email is registered, a reset link has been sent.';
    if (!user) return res.json({ message: genericMessage });

    const resetToken = makeToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your password — Pizza App',
      html: `<p>You requested a password reset.</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
    });

    res.json({ message: genericMessage });
  } catch (err) {
    res.status(500).json({ message: 'Could not process request.', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link.' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed.', error: err.message });
  }
};
