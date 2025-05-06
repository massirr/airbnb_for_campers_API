var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* Get the camps and their info, images included */
router.get('/', async function(req, res, next) {
  try {
    const camps = await prisma.campingSpots.findMany({
      include: {
        campingSpot_images: true, // Fetch related images
      },
    });

    res.json(camps);
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
