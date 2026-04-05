# 🎵 VibeHub

**VibeHub**, kullanıcıların ruh hallerine göre Spotify playlistlerini keşfetmelerini sağlayan modern ve dinamik bir web uygulamasıdır. Kullanıcılar sadece mood’larını seçerek kendilerine en uygun müzikleri bulabilir, playlist detaylarını görebilir ve 30 saniyelik şarkı önizlemelerini dinleyebilir.

---

## 🚀 Proje Özeti

VibeHub, müziğin ruh halimizle olan bağını keşfetmeye odaklanır.
Kullanıcılar, Spotify hesaplarıyla giriş yaparak:

* Mood’a göre playlist keşfi yapabilir 🎧
* Playlistlerdeki şarkıların sürelerini ve albüm kapaklarını görebilir
* Şarkı önizlemelerini dinleyebilir (30 saniye)
* Kaydedilme oranına göre playlist önerileri alabilir (`Save Rate` algoritması)

---

## 💡 Özellikler

* **Mood Tabanlı Arama:** Ruh halinizi seçin, size en uygun playlistler anında gelsin.
* **Save Rate Algoritması:** Popüler ve sık kaydedilen playlistler öne çıkar.
* **Dinamik Şarkı Tabloları:** Şarkı listeleri, süreler ve albüm kapakları ile kullanıcı dostu tablolar.
* **Preview Player:** 30 saniyelik hızlı şarkı önizlemesi ile mood’unuzu test edin.

---

## 🛠 Teknolojiler

* **Backend:** Node.js, Express.js
* **Frontend:** EJS şablon motoru, Tailwind CSS
* **Kimlik Doğrulama:** Passport.js + Spotify OAuth 2.0
* **Veri Kaynağı:** Spotify Web API (Axios ile entegrasyon)

---

## 📁 Dosya Yapısı

```
VibeHub/
│
├─ services/       # Spotify API istekleri ve yardımcı fonksiyonlar
├─ routes/         # Uygulama yönlendirmeleri
├─ views/          # EJS şablonları
├─ public/         # CSS, JS ve görseller
├─ app.js          # Ana uygulama dosyası
├─ package.json
└─ .env            # Gizli anahtarlar (asla paylaşmayın!)
```

---

## ⚡ Kurulum

1. Repo’yu klonlayın:

```bash
git clone https://github.com/SandvicDev/VibeHub.git
cd VibeHub
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. `.env` dosyasını oluşturun ve aşağıdaki bilgileri ekleyin:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://localhost:3000/callback
SESSION_SECRET=your_session_secret
PORT=3000
```

4. Uygulamayı başlatın:

```bash
npm start
```

---

## ⚠️ Bilinen Hatalar ve Geliştirme Notları

* Bazı playlistlerde **"Invalid base62 id"** hatası alınabiliyor.
* Arama sonuçlarında şarkı sayısı bazen **undefined** görünebiliyor.
* Proje halen **Work in Progress** (Geliştirme aşamasında).

---

## 🔐 Güvenlik

* `.env` dosyasındaki hassas bilgileri **asla** paylaşmayın.
* Spotify API anahtarları ve secret’lar gizli tutulmalıdır.

---

## 💬 Katkıda Bulunma

Bu proje hâlâ gelişmekte!
Katkıda bulunmak için fork’layabilir ve pull request gönderebilirsiniz. Yeni fikirler ve düzeltmeler için Issues sekmesini kullanabilirsiniz.

---

## 🌈 Lisans

MIT License © 2026
