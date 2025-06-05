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

/* GET all features (not linked to spots) */
router.get('/all', async function(req, res, next) {
  try {
    const features = await prisma.features.findMany();
    res.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

/* CREATE a new feature */
router.post('/', async function(req, res, next) {
  try {
    const { featureName } = req.body;
    
    if (!featureName) {
      return res.status(400).json({ error: 'Feature name is required' });
    }
    
    const newFeature = await prisma.features.create({
      data: {
        featureName
      }
    });
    
    res.status(201).json(newFeature);
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

/* UPDATE a feature */
router.put('/:featureID', async function(req, res, next) {
  try {
    const featureID = parseInt(req.params.featureID);
    const { featureName } = req.body;
    
    if (!featureName) {
      return res.status(400).json({ error: 'Feature name is required' });
    }
    
    const updatedFeature = await prisma.features.update({
      where: {
        featureID: featureID
      },
      data: {
        featureName
      }
    });
    
    res.json(updatedFeature);
  } catch (error) {
    console.error('Error updating feature:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Feature not found' });
    }
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

/* DELETE a feature */
router.delete('/:featureID', async function(req, res, next) {
  try {
    const featureID = parseInt(req.params.featureID);
    
    // First check if the feature is used by any camping spots
    const usedFeatures = await prisma.campingSpot_features.findMany({
      where: {
        featureID: featureID
      }
    });
    
    if (usedFeatures.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete feature. It is being used by one or more camping spots.' 
      });
    }
    
    await prisma.features.delete({
      where: {
        featureID: featureID
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting feature:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Feature not found' });
    }
    res.status(500).json({ error: 'Failed to delete feature' });
  }
});

module.exports = router;
