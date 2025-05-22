var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET list of bookings */
router.get('/', async function(req, res, next) {
  const bookings = await prisma.bookings.findMany();
  res.json(bookings);
});

/* GET active bookings for user (not canceled) with spot names */
router.get('/:userID', async function (req, res, next) {
  const userId = parseInt(req.params.userID); // Extract the user ID from the route parameter
  
  try {
    const bookings = await prisma.bookings.findMany({
      where: { 
        userID: userId,
        isCanceled: "false" // Only fetch bookings that are not canceled
      },
      include: {
        campingSpot_bookings: {
          include: {
            campingSpot: {
              select: {
                name: true, // Include the camping spot name
                country: true,
                city: true,
                price: true
              }
            }
          }
        }
      }
    });
    
    if (bookings.length > 0) {
      res.json(bookings);
    } else {
      res.status(404).json({ error: 'No active bookings found for this user' });
    }
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});

/* POST create a new booking and link it to a camping spot */
router.post('/', async function(req, res, next) {
  const { userID, spotID, startDate, endDate, price } = req.body;
  
  // Validate required fields
  if (!userID || !spotID || !startDate || !endDate || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Use a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Create the booking entry
      const booking = await prisma.bookings.create({
        data: {
          userID: parseInt(userID),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          price: parseInt(price)
        }
      });

      // Create the campingSpot_bookings entry to link the booking with the spot
      const campingSpotBooking = await prisma.campingSpot_bookings.create({
        data: {
          spotID: parseInt(spotID),
          bookingID: booking.bookingID // Use the ID from the newly created booking
        }
      });

      return { booking, campingSpotBooking };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

// POST to update
router.post('/:bookingID', async function (req, res, next) {
  const bookingID = parseInt(req.params.bookingID); 
  const { isCanceled } = req.body;

  // Validate that bookable is a string ("true" or "false")
  if (isCanceled !== 'true' && isCanceled !== 'false') {
    return res.status(400).json({ error: 'Invalid bookable status. It must be "true" or "false" as a string.' });
  }else{
    // Update the isCanceled status in the database
    const updatedBooking = await prisma.bookings.update({
      where: { bookingID: bookingID },
      data: { isCanceled: isCanceled }, // Update 
    });

    res.json(updatedBooking);  
    }
});

module.exports = router;