# 🚀 cPanel / Paylaşımlı Hosting Kurulum ve Yayınlama Rehberi

> **Önemli güvenlik uyarısı:** Randevular MySQL'de saklanır ve Express API üzerinden korunur. Sadece `dist` klasörünü statik olarak yüklemek randevu API'sini çalıştırmaz. Anti-abuse korumaları ve admin girişi için Node.js + MySQL zorunludur.

Bu proje React SPA ve küçük bir Node.js API olarak geliştirilmiştir. Hostinger Unlimited/hPanel üzerinde Node.js uygulaması ve MySQL özellikleri etkin olmalıdır.

---

## 📁 1. Projeyi Derleme (Build Alma)
Bilgisayarınızda veya terminalinizde şu komutu çalıştırarak projeyi statik web dosyalarına dönüştürün:

```bash
npm run build
```
*(Bu işlem projenizin kök dizininde `dist` adında bir klasör oluşturur.)*

---

## 🌐 2. cPanel'e Yükleme Adımları

### Node.js destekli hosting (Hostinger Unlimited / hPanel)

hPanel'de **Node.js App** (veya benzeri Node.js uygulama yöneticisi) bulunmalıdır. Uygulama kök dizini proje klasörü, başlangıç dosyası `build/server/index.js` olacak şekilde tanımlanmalıdır. Node.js desteği olmayan statik hosting bu API'yi çalıştıramaz.

API'yi çalıştırmadan yalnızca aşağıdaki statik yükleme adımlarını kullanmayın; bu durumda form randevu oluşturamaz veya güvenlik kontrolleri uygulanmaz.

1. hPanel'de MySQL veritabanı ve kullanıcı oluşturun.
2. Proje kökünde `npm ci && npm run build` çalıştırın; `build/server/index.js` dosyasının oluştuğunu kontrol edin.
3. **Yalnızca `dist` klasörünü yüklemeyin.** Node.js uygulamasının application root'una `package.json`, `package-lock.json`, `build/server/`, `dist/` ve gerekli uygulama dosyalarını birlikte yükleyin. Hostinger bağımlılıkları kurabiliyorsa `node_modules` klasörünü zip'e dahil etmeyin; `npm install`/`npm ci` dağıtım adımını kullansın.
4. `dist` içeriğini domain'in document root'una (`public_html`) yükleyin:
   - `assets/` (klasör)
   - `index.html` (dosya)
   - `.htaccess` (gizli dosya - yönlendirme ve hız optimizasyonu için)
   - Varsa diğer resim/ikon dosyaları
5. Node.js uygulamasının startup file'ı `build/server/index.js`, Node sürümü 20+, production mode olmalıdır.
6. hPanel Environment Variables alanına `.env.example` içindeki `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NODE_ENV=production`, `TRUST_PROXY=true` ve `PORT` değerlerini ekleyin.
7. Uygulamayı yeniden başlatın. `/api/health` yanıtı `database: "mysql"` içermelidir.

> ⚠️ **Önemli İpucu (Gizli Dosyalar):**
> cPanel Dosya Yöneticisi'nde sağ üstteki **Ayarlar (Settings)** butonuna tıklayıp **"Gizli Dosyaları Göster (.dotfiles)"** seçeneğini işaretleyin. Böylece yüklediğiniz `.htaccess` dosyasını görebilirsiniz.

---

## ⚙️ 3. `.htaccess` Neden Önemlidir?
Projenin `public/` klasörüne eklediğimiz `.htaccess` dosyası derleme sırasında otomatik olarak `dist/` içine aktarılır.
Bu dosya sayesinde:
- Ziyaretçiler veya siz `/admin`, `/booking`, `/services` gibi alt sayfalara doğrudan girdiğinizde veya sayfayı F5 ile yenilediğinizde **404 Hatası almazsınız**.
- Tarayıcı önbellekleme ve GZIP sıkıştırma otomatik devreye girerek web sitenizin açılış hızını maksimuma çıkarır.

---

## 💡 Yönetim Paneline Erişim
Sitenizi kurduktan sonra yönetim paneline erişmek için:
- **URL:** `https://siteniz.com/admin` (veya `https://siteniz.com/#admin`)
- **Kullanıcı Adı:** `ADMIN_USERNAME` ortam değişkenindeki değer
- **Şifre:** İlk kurulumda `ADMIN_PASSWORD` ortam değişkenindeki değer. Sunucu parolayı hashleyerek saklar; daha sonra admin panelinden değiştirebilirsiniz.

`ADMIN_PASSWORD` ve MySQL parolalarını dosyaya, frontend bundle'ına veya Git'e yazmayın. `npm run build` hem statik frontend'i hem de production API JavaScript çıktısını üretir.
