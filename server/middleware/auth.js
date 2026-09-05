const { verifyToken } = require('../utils/jwt');

function getTokenFromHeader(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

/** Requires a valid user token. Attaches { id, role: 'user' } to req.auth */
function requireUser(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'user') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    req.auth = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/** Requires a valid admin token. Attaches { id, role: 'admin' } to req.auth */
function requireAdmin(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    req.auth = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = { requireUser, requireAdmin };
