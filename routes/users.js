var express = require('express');
var router = express.Router();

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

module.exports = router;
