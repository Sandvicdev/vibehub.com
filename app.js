require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const playlistRoutes = require('./routes/playlist');
const myPlaylistsRoute = require('./routes/myplaylists');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'vibehub-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 gün
}));

// Her EJS şablonuna kullanıcı bilgisini aktar
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/playlist', playlistRoutes);
app.use('/my-playlists', myPlaylistsRoute);

// Ana sayfa
app.get('/', (req, res) => {
  res.render('index', { title: 'VibeHub - Ruhuna Göre Müzik' });
});

// Keşfet sayfası
app.get('/explore', async (req, res) => {
  const spotifyService = require('./services/spotify');
  const { q = 'chill', mood = '', limit = 20 } = req.query;
  
  try {
    const token = req.session.accessToken || null;
    const searchQuery = mood || q;
    const safeLimit = parseInt(limit) || 20;
    
    console.log(`🔍 /explore çağrıldı - Arama: "${searchQuery}", Limit: ${safeLimit}`);
    
    const playlists = await spotifyService.searchPlaylists(searchQuery, safeLimit, token);
    
    if (playlists.length === 0) {
      console.log('⚠️ Hiç playlist bulunamadı veya hepsi boş');
    } else {
      console.log(`✅ ${playlists.length} playlist bulundu ve gönderiliyor`);
    }
    
    res.render('explore', { 
      title: 'Playlist Keşfet | VibeHub', 
      playlists: playlists || [], 
      query: searchQuery, 
      mood,
      error: null
    });
    
  } catch (err) {
    console.error('❌ Explore hatası:', err.message);
    
    res.render('explore', { 
      title: 'Playlist Keşfet | VibeHub', 
      playlists: [], 
      query: q, 
      mood,
      error: 'Playlistler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    });
  }
});

app.get('/debug-token', (req, res) => {
  if (req.session.accessToken) {
    res.send(`
      <h2>Token Bilgilerin</h2>
      <p><strong>Token:</strong> ${req.session.accessToken}</p>
      <p><strong>Kullanıcı:</strong> ${req.session.user?.name}</p>
      <p><strong>Süre:</strong> ${new Date(req.session.tokenExpiry).toLocaleString()}</p>
      <button onclick="navigator.clipboard.writeText('${req.session.accessToken}')">Token'ı Kopyala</button>
    `);
  } else {
    res.send('<h2>Giriş yapmamışsın! <a href="/auth/login">Giriş Yap</a></h2>');
  }
});

app.get('/my-token', (req, res) => {
  if (req.session.accessToken) {
    res.send(`
      <h2>Token Bilgilerin</h2>
      <p><strong>Kullanıcı:</strong> ${req.session.user?.name}</p>
      <p><strong>Token:</strong> <code style="word-break: break-all;">${req.session.accessToken}</code></p>
      <button onclick="navigator.clipboard.writeText('${req.session.accessToken}')">Kopyala</button>
    `);
  } else {
    res.send('<h2>Giriş yapmamışsın! <a href="/auth/login">Giriş Yap</a></h2>');
  }
});

// API endpoint - farklı kategoriler için
app.get('/api/search', async (req, res) => {
  const spotifyService = require('./services/spotify');
  const { q, limit = 20 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Arama terimi gerekli' });
  }
  
  try {
    const token = req.session.accessToken || null;
    const playlists = await spotifyService.searchPlaylists(q, parseInt(limit), token);
    res.json({ success: true, data: playlists });
  } catch (err) {
    console.error('API arama hatası:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});



// Ana sayfa için trending playlistler API'si
app.get('/api/trending', async (req, res) => {
  const spotifyService = require('./services/spotify');
  try {
    const playlists = await spotifyService.searchPlaylists('chill', 12);
    res.json({ success: true, data: playlists });
  } catch (error) {
    console.error('Trending API hatası:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ VibeHub çalışıyor → http://localhost:${PORT}`);
});