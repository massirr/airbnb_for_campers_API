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
        },
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

// GET a spot or spots that are bookable
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

// Create a new camping spot
router.post('/', async function (req, res, next) {
  try {
    const { 
      name, 
      description, 
      price, 
      latitude, 
      longitude, 
      country, 
      city, 
      capacity, 
      features 
    } = req.body;

    // Create the camping spot
    const newSpot = await prisma.campingSpots.create({
      data: {
        name,
        description,
        price: parseInt(price),
        latitude,
        longitude,
        country,
        city,
        capacity: parseInt(capacity),
        bookable: 'true'
      }
    });

    // If features are provided, create the associations
    if (features && Array.isArray(features) && features.length > 0) {
      const featureAssociations = features.map(featureID => ({
        spotID: newSpot.spotID,
        featureID: parseInt(featureID)
      }));

      await prisma.campingSpot_features.createMany({
        data: featureAssociations
      });
    }

    res.status(201).json(newSpot);
  } catch (error) {
    console.error('Error creating camping spot:', error);
    res.status(500).json({ error: 'Failed to create camping spot', details: error.message });
  }
});

// Update a camping spot
router.put('/:spotID', async function (req, res, next) {
  try {
    const spotID = parseInt(req.params.spotID);
    const { 
      name, 
      description, 
      price, 
      latitude, 
      longitude, 
      country, 
      city, 
      capacity, 
      bookable,
      features 
    } = req.body;

    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (bookable !== undefined) updateData.bookable = bookable;

    // Update the camping spot
    const updatedSpot = await prisma.campingSpots.update({
      where: { spotID },
      data: updateData
    });

    // If features are provided, update the associations
    if (features && Array.isArray(features)) {
      // Delete existing feature associations
      await prisma.campingSpot_features.deleteMany({
        where: { spotID }
      });

      // Create new feature associations
      if (features.length > 0) {
        const featureAssociations = features.map(featureID => ({
          spotID,
          featureID: parseInt(featureID)
        }));

        await prisma.campingSpot_features.createMany({
          data: featureAssociations
        });
      }
    }

    res.json(updatedSpot);
  } catch (error) {
    console.error('Error updating camping spot:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Camping spot not found' });
    }
    res.status(500).json({ error: 'Failed to update camping spot', details: error.message });
  }
});

// Delete a camping spot
router.delete('/:spotID', async function (req, res, next) {
  try {
    const spotID = parseInt(req.params.spotID);

    // Delete associated features first
    await prisma.campingSpot_features.deleteMany({
      where: { spotID }
    });

    // Delete associated images
    await prisma.campingSpot_images.deleteMany({
      where: { spotID }
    });

    // Delete associated bookings through the junction table
    await prisma.campingSpot_bookings.deleteMany({
      where: { spotID }
    });

    // Delete the camping spot
    await prisma.campingSpots.delete({
      where: { spotID }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting camping spot:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Camping spot not found' });
    }
    res.status(500).json({ error: 'Failed to delete camping spot', details: error.message });
  }
});

// Add images to a camping spot
router.post('/:spotID/images', async function (req, res, next) {
  try {
    const spotID = parseInt(req.params.spotID);
    const { imageURLs } = req.body;

    if (!Array.isArray(imageURLs) || imageURLs.length === 0) {
      return res.status(400).json({ error: 'imageURLs must be a non-empty array' });
    }

    // Create image entries
    const imageData = imageURLs.map(url => ({
      spotID,
      imageURL: url
    }));

    await prisma.campingSpot_images.createMany({
      data: imageData
    });

    res.status(201).json({ message: `Added ${imageData.length} images to camping spot` });
  } catch (error) {
    console.error('Error adding images:', error);
    res.status(500).json({ error: 'Failed to add images', details: error.message });
  }
});

module.exports = router;
