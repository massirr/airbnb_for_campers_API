const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function adminAuth(req, res, next) {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // if it's a correct token
    req.user = decoded;
    
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    next(); // it ensures that only authorized admin users can proceed to the protected routes.
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

module.exports = adminAuth; // export the function to use it in golbally in the project
