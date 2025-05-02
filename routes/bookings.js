var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET list of bookings */
router.get('/', async function(req, res, next) {
  const data = await prisma.booking.findMany();
  res.json(data);
});

module.exports = router;
