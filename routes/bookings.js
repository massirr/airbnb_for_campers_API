var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET list of bookings */
router.get('/', async function(req, res, next) {
  const bookings = await prisma.bookings.findMany();
  res.json(bookings);
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

module.exports = router;