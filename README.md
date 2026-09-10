<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Kuaför randevu uygulaması

React/Vite arayüzü ve MySQL kullanan Express API içerir. Randevu verileri artık tarayıcıda veya JSON dosyasında değil, Hostinger MySQL veritabanında tutulur. WhatsApp, salon yöneticisine bildirim/iletişim akışı olarak korunur.

View your app in AI Studio: https://ai.studio/apps/18b88739-b986-4897-adfc-668b051a6e33

## Yerel çalıştırma

**Gereksinim:** Node.js 18+

1. `npm install`
2. `.env.example` dosyasını `.env` olarak kopyalayıp MySQL ve admin değişkenlerini doldurun.
3. Geliştirme için iki terminalde `npm run dev:server` ve `npm run dev` çalıştırın.

## Randevu akışı

- Kullanıcı randevu formunu doldurur.
- Form gönderildiğinde `/api/appointments` güvenlik kontrollerinden geçirip MySQL'e kaydeder, ardından WhatsApp deep link açılır.
- Engellenen telefon numaraları MySQL'deki `blocked_phones` tablosunda tutulur; yönetici panelindeki liste yalnızca yetkili `/api/admin/blocked-phones` uçları üzerinden güncellenir ve herkese açık randevu oluşturma isteği sunucu tarafında da engellenir.
- Müşteri bilgileri, tarih, saat, hizmet ve uzman otomatik olarak kısa mesaj içerisine eklenir.
- Salon yöneticisi WhatsApp üzerinden talebi onaylar veya reddeder.
- `/my-appointments` takip kodu ile API'den sorgular; admin paneli randevuları yetkili API oturumu ile yönetir.

## Hostinger Unlimited / hPanel kurulumu

Unlimited paketinizde **Node.js App** ve **MySQL** etkin olmalıdır; yalnızca `dist` klasörünü statik yüklemek API'yi çalıştırmaz.

1. hPanel'de MySQL veritabanı/kullanıcısı oluşturun ve `.env.example` içindeki `DB_*` değerlerini doldurun.
2. `npm ci && npm run build` çalıştırın. `dist/` frontend, `build/server/index.js` API çıktısıdır.
3. Node.js uygulamasının application root'unu proje kökü, startup file'ını `build/server/index.js`, Node sürümünü 20+ yapın. Express production'da `dist/` klasörünü de sunar.
4. hPanel Environment Variables bölümüne `.env.example` içindeki değerleri ekleyin. `ADMIN_PASSWORD` yalnızca ilk kurulumda gerekir; sunucu parolayı hashleyerek MySQL'e yazar.
5. Domain'i Node.js uygulamasına bağlayın. Vite proxy yalnızca yerel geliştirmede kullanılır; production'da frontend ve `/api` aynı domain üzerinden Express'e gider.
6. Uygulamayı yeniden başlatın ve `/api/health` adresinde `{"ok":true,"database":"mysql"}` yanıtını kontrol edin.

`ADMIN_PASSWORD`, DB parolası ve gerçek ortam dosyası Git'e eklenmemelidir.

## WhatsApp numarası

`webContent.whatsappNumber` veya `socialLinks.whatsapp` alanı kullanılır. Bu değer admin panelinden güncellenebilir.
