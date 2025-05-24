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
  const { username, email, password } = req.body;

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
        createDate: new Date(),
      }
    });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

module.exports = router;
