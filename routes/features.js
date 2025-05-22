var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET features of each spot */
router.get('/', async function(req, res, next) {
  const features = await prisma.campingSpot_features.findMany({
    include: { // like a join
      features: true,
      campingSpot: {
        select: {
          name: true, // Only fetch the name of the camping spot
        },
      },
    }
  });
  res.json(features);
});

module.exports = router;
