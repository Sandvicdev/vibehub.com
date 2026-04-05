const express = require('express');
const router = express.Router();
const spotify = require('../services/spotify');

router.get('/:id', async (req, res) => {
  try {
    const userToken = req.session.accessToken || null;
    
    console.log(`🎵 Playlist ID: ${req.params.id}`);
    console.log(`👤 Kullanıcı: ${req.session.user?.name || 'Misafir'}`);
    console.log(`🔑 User token var mı: ${userToken ? 'EVET ✅' : 'HAYIR ❌'}`);
    
    const playlist = await spotify.getPlaylistById(req.params.id, userToken);
    
    // Eğer playlist null veya undefined ise hata göster
    if (!playlist) {
      throw new Error('Playlist bulunamadı');
    }
    
    console.log(`📀 Playlist: ${playlist.name}`);
    console.log(`🎵 Şarkı sayısı: ${playlist.tracks?.length || 0}`);
    
    res.render('playlist', {
      title: `${playlist.name} | VibeHub`,
      playlist: playlist, // playlist'i gönder
    });
  } catch (err) {
    console.error('Playlist yükleme hatası:', err.message);
    
    // Hata durumunda boş bir playlist objesi gönder
    res.status(404).render('playlist', {
      title: 'Hata | VibeHub',
      playlist: {
        name: 'Playlist Bulunamadı',
        owner: 'Bilinmiyor',
        image: null,
        track_count: 0,
        followers: 0,
        save_rate: 0,
        description: 'Bu playlist bulunamadı veya görüntüleme izniniz yok.',
        spotify_url: '#',
        tracks: []
      },
      error: err.message
    });
  }
});

module.exports = router;