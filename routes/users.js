var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const data = await prisma.users.findMany();
  res.json(data);
});

router.get('/:userID', async function (req, res, next) {
  const userId = parseInt(req.params.userID); // Extract the user ID from the route parameter
  
  const user = await prisma.users.findUnique({
    where: { userID: userId }, // Use the userID to find the user
  });
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// POST create a new user (sign up)
router.post('/', async function(req, res, next) {
  const { username, email, password, isAdmin } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword, // Store the hashed password
        isAdmin: isAdmin || 'false', // Default to non-admin
        createDate: new Date(),
      }
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// PUT update a user
router.put('/:userID', async function(req, res, next) {
  const userID = parseInt(req.params.userID);
  const { username, email, password, isAdmin } = req.body;
  
  try {
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin.toString();
    
    const updatedUser = await prisma.users.update({
      where: { userID },
      data: updateData
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// DELETE a user
router.delete('/:userID', async function(req, res, next) {
  const userID = parseInt(req.params.userID);
  
  try {
    // Delete user's bookings first
    await prisma.bookings.deleteMany({
      where: { userID }
    });
    
    // Then delete the user
    await prisma.users.delete({
      where: { userID }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;
