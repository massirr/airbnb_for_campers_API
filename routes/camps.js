var express = require('express');
var router = express.Router();

/* GET localhost:3000/camps/geocode */
router.get('/camps', async function(req, res, next) {
  const location = 'Bocholt, Vlaanderen'; //where I will put the locations, e.g, Brussels, Belgium.
  if (!location) {
    return res.status(400).json({ error: 'Missing location query param' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`; // encodeURIComponent, It safely encodes user input into a URL
    const response = await fetch(url, {
      headers: { 'User-Agent': 'airbnbCamping' } // required by Nominatim not obligated
    });

    const data = await response.json();
    if (data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { lat, lon } = data[0];
    res.json({ lat, lon });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
