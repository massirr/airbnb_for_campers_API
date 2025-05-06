const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  const location = 'Poupehan, Belgium'; // This could also come from req.query.location, don't forget to use it in the frontend

  if (!location?.trim()) {
    return res.status(400).json({ error: 'Missing location' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'airbnbCamping' }
    });

    const [result] = await response.json();
    if (!result) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ lat: result.lat, lon: result.lon });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
