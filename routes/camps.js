var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* Get the camps and their info, images included */
router.get('/', async function(req, res, next) {
  try {
    const camps = await prisma.campingSpots.findMany({
      include: {
        campingSpot_images: {// Fetch related images
          select: {
            imageURL: true, // Only fetch the imageURLs of the camping spot
          },  
        }
      },
    });

    res.json(camps);
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

/* Get the camps and their features*/
router.get('/features', async function(req, res, next) {
  try {
    const camps = await prisma.campingSpots.findMany({
      select: {
        spotID: true,
        name: true,
        campingSpot_features: {
          select: {
            featureID: true,
            features: { 
              select: {
                featureName: true
              }
            }
          }
        }
      }
    });

    res.json(camps);
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET a spot of spots or spots that are bookable
router.get('/spots', async function (req, res, next) {
  const { spotID, bookable } = req.query;

  if (spotID) {
    const spot = await prisma.campingSpots.findUnique({
      where: { spotID: parseInt(spotID) },
    });
    if (spot) {
      return res.json(spot);
    } else {
      return res.status(404).json({ error: 'Spot not found' });
    }
  }

  if (bookable) {
    const spots = await prisma.campingSpots.findMany({
      where: { bookable: bookable },
    });
    if (spots.length > 0) {
      return res.json(spots);
    } else {
      return res.status(404).json({ error: 'No spots found with the given bookable status' });
    }
  }

  res.status(400).json({ error: 'Please provide a valid query parameter (spotID or bookable)' });
});

// POST to update the bookable status of a camping spot
router.post('/spots/:spotID', async function (req, res, next) {
  const spotID = parseInt(req.params.spotID); // Extract the spotID from the route parameter
  const { bookable } = req.body; // Extract the bookable status from the request body

  // Validate that bookable is a string ("true" or "false")
  if (bookable !== 'true' && bookable !== 'false') {
    return res.status(400).json({ error: 'Invalid bookable status. It must be "true" or "false" as a string.' });
  }else{
    // Update the bookable status in the database
    const updatedSpot = await prisma.campingSpots.update({
      where: { spotID: spotID },
      data: { bookable: bookable }, // Update the bookable status
    });

    res.json(updatedSpot); // Return the updated camping spot  
    }
});

module.exports = router;
