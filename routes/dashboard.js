const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adminAuth = require('../middleware/adminAuth');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

/* GET dashboard statistics */
router.get('/', async function(req, res, next) {
  try {
    // Count total users
    const userCount = await prisma.users.count();
    
    // Count total camping spots
    const spotCount = await prisma.campingSpots.count();
    
    // Count total bookings
    const bookingCount = await prisma.bookings.count();
    
    // Count bookings by status
    const activeBookings = await prisma.bookings.count({
      where: { isCanceled: 'false' }
    });
    
    const cancelledBookings = await prisma.bookings.count({
      where: { isCanceled: 'true' }
    });
    
    // Get bookable vs non-bookable spots
    const bookableSpots = await prisma.campingSpots.count({
      where: { bookable: 'true' }
    });
    
    const nonBookableSpots = spotCount - bookableSpots;
    
    // Count features
    const featureCount = await prisma.features.count();
    
    res.json({
      users: {
        total: userCount
      },
      campingSpots: {
        total: spotCount,
        bookable: bookableSpots,
        nonBookable: nonBookableSpots
      },
      bookings: {
        total: bookingCount,
        active: activeBookings,
        cancelled: cancelledBookings
      },
      features: {
        total: featureCount,
      },
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({ error: 'Failed to generate dashboard statistics' });
  }
});

module.exports = router;
