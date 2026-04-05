const express = require('express');
const router = express.Router();
const spotify = require('../services/spotify');

router.get('/', async (req, res) => {
  if (!req.session.user || !req.session.accessToken) {
    return res.redirect('/auth/login');
  }

  try {
    const playlists = await spotify.getUserPlaylists(req.session.accessToken, 50);
    res.render('myplaylists', {
      title: 'Playlistlerim | VibeHub',
      playlists,
    });
  } catch (err) {
    // Tam hata detayını logla
    console.error('My playlists hatası:', err.message);
    if (err.response) {
      console.error('Spotify yanıtı:', JSON.stringify(err.response.data));
      console.error('Status:', err.response.status);
    }
    console.error('Kullanılan token:', req.session.accessToken);

    res.render('myplaylists', {
      title: 'Playlistlerim | VibeHub',
      playlists: [],
      error: `Hata: ${err.response?.data?.error?.message || err.message}`,
    });
  }
});

module.exports = router;