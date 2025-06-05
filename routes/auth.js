// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/signin', async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be username or email

  // Find user by username OR email
  const user = await prisma.users.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });

  if (!user) return res.status(401).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

  const token = jwt.sign(
    { userId: user.userID, email: user.email, isAdmin: user.isAdmin === 'true' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ 
    token, 
    user: { 
      id: user.userID, 
      email: user.email, 
      username: user.username, 
      isAdmin: user.isAdmin === 'true' 
    } 
  });
});

// Get current authenticated user
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await prisma.users.findUnique({
      where: { userID: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return user without password
    res.json({
      id: user.userID,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin === 'true',
      createDate: user.createDate
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

module.exports = router;
