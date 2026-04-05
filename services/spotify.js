const axios = require('axios');

let appToken = null;
let appTokenExpiry = 0;

async function getAppToken() {
  if (appToken && Date.now() < appTokenExpiry) {
    return appToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ HATA: Spotify credentials eksik!');
    throw new Error('Spotify credentials eksik');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    appToken = res.data.access_token;
    appTokenExpiry = Date.now() + (res.data.expires_in * 1000) - 60000;
    console.log('✅ App token alındı');
    return appToken;
  } catch (err) {
    console.error('❌ Token alınamadı:', err.response?.data || err.message);
    throw err;
  }
}

async function resolveToken(userToken = null) {
  return userToken || (await getAppToken());
}

async function searchPlaylists(query, limit = 20, userToken = null) {
  try {
    const token = await resolveToken(userToken);
    
    console.log(`🔍 Spotify araması: "${query}"`);
    
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: { 
        q: query,
        type: 'playlist'
      },
      timeout: 15000
    });

    // GEÇİCİ: Filtrelemeyi kaldır - tüm playlistleri göster
    const items = response.data.playlists.items.filter(item => item !== null);
    
    const limitedItems = items.slice(0, limit);
    const formatted = limitedItems.map(formatPlaylist);
    
    console.log(`✅ ${formatted.length} playlist bulundu (filtre yok)`);
    
    // Debug için ilk playlist'in track sayısını göster
    if (formatted.length > 0) {
      console.log(`📊 Örnek - "${formatted[0].name}": ${formatted[0].track_count} şarkı`);
    }
    
    return formatted;
    
  } catch (err) {
    console.error('❌ Spotify arama hatası:', err.response?.data?.error?.message || err.message);
    throw err;
  }
}

async function getTrendingPlaylists(limit = 20) {
  try {
    const token = await getAppToken();
    
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: {
        q: 'chill',
        type: 'playlist'
      },
      timeout: 15000
    });
    
    const items = response.data.playlists.items.filter(item => item !== null);
    return items.slice(0, limit).map(formatPlaylist);
    
  } catch (err) {
    console.error('❌ Trending playlist hatası:', err.message);
    return [];
  }
}

async function getUserPlaylists(userToken, limit = 50) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { 
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'application/json'
      },
      params: { limit }
    });
    return response.data.items.filter(Boolean).map(formatPlaylist);
  } catch (err) {
    console.error('❌ Kullanıcı playlistleri alınamadı:', err.message);
    return [];
  }
}

async function getPlaylistById(id, userToken = null) {
  try {
    const token = await resolveToken(userToken);
    
    // DÜZELTİLEN YER: Tırnak işaretlerini (`) ve ${id} kullanımını kontrol et
    const playlistRes = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const p = playlistRes.data;
    
    if (!p) throw new Error('Playlist verisi alınamadı');

    // Şarkıları formatlıyoruz
    let allTracks = [];
    if (p.tracks && p.tracks.items) {
      allTracks = p.tracks.items
        .filter(item => item && item.track) // Boş gelen trackleri eliyoruz
        .map(item => ({
          id: item.track.id,
          name: item.track.name || 'İsimsiz Şarkı',
          artists: item.track.artists?.map(a => a.name).join(', ') || 'Bilinmiyor',
          album: item.track.album?.name || '',
          duration: msToMin(item.track.duration_ms || 0),
          preview_url: item.track.preview_url || null,
          image: item.track.album?.images?.[0]?.url || null,
          spotify_url: item.track.external_urls?.spotify || '#'
        }));
    }

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      owner: p.owner?.display_name || 'Bilinmiyor',
      image: p.images?.[0]?.url || null,
      followers: p.followers?.total || 0,
      track_count: p.tracks?.total || 0,
      tracks: allTracks // EJS'ye giden liste bu
    };

  } catch (err) {
    console.error('❌ Playlist hatası:', err.response?.data || err.message);
    return null;
  }
}

function formatPlaylist(p) {
  // Debug için
  console.log(`📝 Formatlanıyor: "${p.name}" - Track count: ${p.tracks?.total}`);
  
  return {
    id: p.id,
    name: p.name || 'İsimsiz Playlist',
    owner: p.owner?.display_name || p.owner?.id || 'Bilinmiyor',
    image: p.images?.[0]?.url || null,
    track_count: p.tracks?.total || 0,  // Bu değer API'den geliyor
    spotify_url: p.external_urls?.spotify || '#',
    followers: p.followers?.total || 0,
    save_rate: calculateSaveRate(p.followers?.total || 0, p.tracks?.total || 0),
  };
}

function calculateSaveRate(followers, tracks) {
  if (!followers || !tracks) return 0;
  return Math.min(99, Math.round((followers / (followers + tracks * 10)) * 100 + 30));
}

function msToMin(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

module.exports = { 
  searchPlaylists, 
  getPlaylistById, 
  getUserPlaylists, 
  getTrendingPlaylists,
  getAppToken
};