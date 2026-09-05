const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { signToken } = require('../utils/jwt');

// No admin registration endpoint on purpose — admins are created via
// `npm run seed` (seed/seedInventory.js also creates the first admin).
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    const genericError = 'Incorrect email or password.';
    if (!admin) return res.status(401).json({ message: genericError });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: genericError });

    const token = signToken({ id: admin._id, role: 'admin' });
    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};
