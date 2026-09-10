import { SalonService, Stylist, Appointment, SalonReview, AdminMessage, KerastaseProduct, BlogPost, WebContent } from './types';

export const SALON_SERVICES: SalonService[] = [
  // 1. SAÇ GRUBU
  {
    id: 'srv-sac-1',
    name: 'Fön Yıkama - Kırık Fön Yıkama',
    category: 'sac-kesim',
    price: 800,
    priceType: 'range',
    customPriceText: '800 ₺ - 1.000 ₺',
    showPrice: true,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    description: 'Doğal bitkisel şampuanla arındırıcı yıkama, saç maskesi desteği ve profesyonel hacimli düz veya kırık fön uygulaması.',
    features: ['Arındırıcı Yıkama', 'Besleyici Bakım', 'Kırık / Düz Fön Seçeneği']
  },
  {
    id: 'srv-sac-2',
    name: 'Tasarım Saç Kesimi',
    category: 'sac-kesim',
    price: 2500,
    priceType: 'fixed',
    customPriceText: '2.500 ₺',
    showPrice: true,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=600&auto=format&fit=crop',
    description: 'Yüz hatlarına ve saçın yapısına özel analiz edilerek uygulanan profesyonel makas ve ustura kesimi.',
    features: ['Yüz Şekli Analizi', 'Yıkama Dahil', 'Stil Fönü']
  },
  {
    id: 'srv-sac-3',
    name: 'Kesim Fantazi Şekil Verme',
    category: 'sac-kesim',
    price: 4000,
    priceType: 'fixed',
    customPriceText: '4.000 ₺',
    showPrice: true,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    description: 'İleri düzey artistik saç kesimi, katlı ve dokulu formlandırma ve özel saç tasarımı.',
    features: ['Haute Couture Kesim', 'Özel Doku Kazandırma', 'Yoğun Bakım Maskesi']
  },
  {
    id: 'srv-sac-4',
    name: 'Gelin Başı - Makyaj',
    category: 'makyaj-gelin',
    price: 0,
    priceType: 'free',
    customPriceText: 'SERBEST / Fiyat Alınız',
    showPrice: true,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop',
    description: 'Düğün, nişan ve özel geceler için taç, duvak ve aksesuarlarla uyumlu gelin başı tasarımı ve prova seansı.',
    features: ['Ön Prova Hizmeti', 'Duvak & Aksesuar Sabitleme', 'Tüm Gün Kalıcı Sabitleyici']
  },
  {
    id: 'srv-sac-5',
    name: 'Postişin Saça Takılması & Şekillendirme',
    category: 'sac-kesim',
    price: 1600,
    priceType: 'fixed',
    customPriceText: '1.600 ₺',
    showPrice: true,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
    description: 'Postiş ve yarımay saçların saçla bütünleştirilerek profesyonelce yerleştirilmesi ve şekillendirilmesi.',
    features: ['Güvenli Klips/Montaj', 'Doğal Saçla Uyum', 'Maşa & Şekillendirme']
  },
  {
    id: 'srv-sac-6',
    name: 'Özel Gece & Davet Topuzu',
    category: 'sac-kesim',
    price: 2500,
    priceType: 'fixed',
    customPriceText: '2.500 ₺',
    showPrice: true,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop',
    description: 'Modern dağınık topuz, ense topuzu veya şık klasik İtalyan topuz modelleriyle göz alıcı görünüm.',
    features: ['Kişiye Özel Model Seçimi', 'Ultra Kalıcı Sprey', 'Aksesuar Montajı']
  },
  {
    id: 'srv-sac-7',
    name: 'Maşa ile Şekil Verme',
    category: 'sac-kesim',
    price: 1200,
    priceType: 'fixed',
    customPriceText: '1.200 ₺',
    showPrice: true,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop',
    description: 'Geniş Hollywood dalgaları, su dalgası veya doğal plaj dalgası formunda profesyonel maşa uygulaması.',
    features: ['Isı Koruyucu Serum', 'Doğal Esnek Dalgalar', 'Parlaklık Cilası']
  },
  {
    id: 'srv-sac-8',
    name: 'Saç Kaynak Uygulaması',
    category: 'sac-kesim',
    price: 0,
    priceType: 'free',
    customPriceText: 'SERBEST / Fiyat Alınız',
    showPrice: true,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    description: '%100 gerçek insan saçı kullanılarak yapılan mikro kaynak, nano kapsül kaynak ve görünmez bant kaynak montajı.',
    features: ['%100 Gerçek Doğal Saç', 'Hissedilmeyen Mikro Kapsül', 'Kesim & Uyum Fönü']
  },

  // 2. BOYA GRUBU
  {
    id: 'srv-boya-1',
    name: 'Boya (Dip) - (Bütün)',
    category: 'boyama',
    price: 1500,
    priceType: 'range',
    customPriceText: '1.500 ₺ - SERBEST',
    showPrice: true,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=600&auto=format&fit=crop',
    description: 'Beyazları %100 kapatan, saça parlaklık ve yoğun renk doyumunu kazandıran profesyonel boya seansı.',
    features: ['Amonyaksız Formül', 'Maksimum Beyaz Kapama', 'Renk Koruyucu Maske']
  },
  {
    id: 'srv-boya-2',
    name: 'Açma Boyama (Dip) - (Bütün)',
    category: 'boyama',
    price: 0,
    priceType: 'free',
    customPriceText: 'SERBEST / Fiyat Alınız',
    showPrice: true,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop',
    description: 'Koyu renk saçlardan açık tonlara geçiş sağlayan, bağ koruyucu plex teknolojili hassas saç açma ve tonlama.',
    features: ['Plex Bağ Koruyucu', 'Küllü/Sıcak Özel Tonlama', 'Arındırıcı Cila']
  },
  {
    id: 'srv-boya-3',
    name: 'Balyaj (Ombre) (Dip) - (Bütün)',
    category: 'boyama',
    price: 12000,
    priceType: 'range',
    customPriceText: '12.000 ₺ - SERBEST',
    showPrice: true,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    description: 'Doğal geçişli sarılar, baby blonde, brushlight ve sombre ışıltıları kazandıran salonumuzun ödüllü tekniği.',
    features: ['Kişiye Özel Renk Tasarımı', 'Olaplex Bağ Desteği', 'Dip Geçiş Cilası']
  },
  {
    id: 'srv-boya-4',
    name: 'Röfle (Dip) - (Bütün)',
    category: 'boyama',
    price: 9000,
    priceType: 'range',
    customPriceText: '9.000 ₺ - SERBEST',
    showPrice: true,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    description: 'Klasik veya mikro paketleme ile saçın tamamına dengeli ve ışıltılı sarı tonlar kazandıran röfle işlemi.',
    features: ['Mikro Paketleme Tekniği', 'Göz Alıcı Parlaklık', 'Nötralize Edici Cila']
  },
  {
    id: 'srv-boya-5',
    name: 'Bitkisel Boya (Dip) - (Bütün)',
    category: 'boyama',
    price: 3000,
    priceType: 'range',
    customPriceText: '3.000 ₺ - SERBEST',
    showPrice: true,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1519415510236-8a5ad7453b77?q=80&w=600&auto=format&fit=crop',
    description: 'Hassas saç derisine sahip danışanlar için organik yağlar ve bitki özleri içeren amonyaksız koruyucu renklendirme.',
    features: ['%100 Bitkisel İçerik', 'Hassas Saç Derisine Uygun', 'Doğal Işıltı']
  },

  // 3. PERMA GRUBU
  {
    id: 'srv-perma-1',
    name: 'Perma (Kısa) - (Uzun)',
    category: 'perma-duzlestirme',
    price: 11000,
    priceType: 'range',
    customPriceText: '11.000 ₺ - SERBEST',
    showPrice: true,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
    description: 'Doğal kıvırcık bukleler ve hacimli su dalgaları kazandıran, saçı yıpratmayan yeni nesil perma losyonu.',
    features: ['Yeni Nesil Asitsiz Formül', '6 Ay Kalıcı Bukleler', 'Nemlendirici Kürü']
  },
  {
    id: 'srv-perma-2',
    name: 'Keratin Düzleştirme (Defrize) (Kısa) - (Uzun)',
    category: 'perma-duzlestirme',
    price: 12000,
    priceType: 'range',
    customPriceText: '12.000 ₺ - SERBEST',
    showPrice: true,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    description: 'Kabaran, elektriklenen ve şekil almayan saçları 4-6 ay boyunca ipeksi düzlüğe kavuşturan yoğun keratin terapisi.',
    features: ['Sıfır Formaldehit', 'İpeksi Pürüzsüzlük', '4-6 Ay Kalıcı Düzlük']
  },

  // 4. MANİKÜR - PEDİKÜR GRUBU
  {
    id: 'srv-mani-1',
    name: 'Manikür - Pedikür - Batık Alma',
    category: 'el-ayak',
    price: 900,
    priceType: 'range',
    customPriceText: '900 ₺ - 1.200 ₺ - 1.900 ₺',
    showPrice: true,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop',
    description: 'Steril cihaz ve pensler eşliğinde el-ayak tırnak eti bakımı, tırnak şekillendirme ve medikal batık giderme.',
    features: ['Tek Kullanımlık Steril Uçlar', 'Besleyici Kütikül Yağı', 'El-Ayak Peelingi']
  },
  {
    id: 'srv-mani-2',
    name: 'Oje - Kalıcı Oje',
    category: 'el-ayak',
    price: 250,
    priceType: 'range',
    customPriceText: '250 ₺ - 1.100 ₺',
    showPrice: true,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=600&auto=format&fit=crop',
    description: 'Geniş renk skalası, tırnağı soymayan baz ve 3-4 hafta ilk günkü gibi parlayan UV kalıcı oje uygulaması.',
    features: ['3 Hafta Kalıcılık', 'Soyulma Karşıtı Baz', 'Zengin Renk Kartelası']
  },
  {
    id: 'srv-mani-3',
    name: 'Protez Tırnak',
    category: 'el-ayak',
    price: 0,
    priceType: 'free',
    customPriceText: 'SERBEST / Fiyat Alınız',
    showPrice: true,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop',
    description: 'Şablon veya tip tekniğiyle tırnak uzatma, badem/balerin formlandırma ve serbest el sanatsal nail art çizimleri.',
    features: ['Doğal Tırnak Formu', 'Kırılma Karşıtı Dayanıklılık', 'Özel Nail Art Desenleri']
  },
  {
    id: 'srv-mani-4',
    name: 'Kaş Alma - Yüz Alma',
    category: 'el-ayak',
    price: 500,
    priceType: 'range',
    customPriceText: '500 ₺ - 900 ₺',
    showPrice: true,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    description: 'Altın oran kaş alımı, yüz anatomisine uygun şekillendirme ve hassas ciltler için organik ip/cımbız yöntemi.',
    features: ['Altın Oran Ölçümü', 'Hassas Cilt Yağı', 'Pürüzsüz Sonuç']
  },
  {
    id: 'srv-mani-5',
    name: 'Kuru Manikür - Kuru Pedikür',
    category: 'el-ayak',
    price: 1200,
    priceType: 'range',
    customPriceText: '1.200 ₺ - 1.450 ₺',
    showPrice: true,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1519415510236-8a5ad7453b77?q=80&w=600&auto=format&fit=crop',
    description: 'Su kullanmadan özel elmas freze uçlarıyla yapılan Rus usulü medikal derin temizlik ve tırnak sertleştirme.',
    features: ['Freze Cihazı ile Derin Temizlik', 'Sıfır Kesik Riski', 'Kütikül Geciktirici']
  },

  // 5. AĞDA GRUBU
  {
    id: 'srv-agda-1',
    name: 'Komple Ağda',
    category: 'agda',
    price: 0,
    priceType: 'free',
    customPriceText: 'SERBEST / Fiyat Alınız',
    showPrice: true,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    description: 'Tüm vücut için hijyenik tek kullanımlık spatula ve organik sir ağda ile acısız pürüzsüzleştirme seansı.',
    features: ['Tek Kullanımlık Spatula', 'Hassas Cilt Formülü', 'Yatıştırıcı Losyon']
  },
  {
    id: 'srv-agda-2',
    name: 'Yarım Bacak - Tam Bacak',
    category: 'agda',
    price: 900,
    priceType: 'range',
    customPriceText: '900 ₺ - 1.450 ₺',
    showPrice: true,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1519415510236-8a5ad7453b77?q=80&w=600&auto=format&fit=crop',
    description: 'Bacak bölgesindeki istenmeyen tüylerin kökten arındırılması ve batıkları önleyici bakım uygulaması.',
    features: ['Kökten Alma', 'Batık Önleyici Sprey', 'Pürüzsüz İpeksi Ten']
  },
  {
    id: 'srv-agda-3',
    name: 'Yarım Kol - Tam Kol',
    category: 'agda',
    price: 950,
    priceType: 'range',
    customPriceText: '950 ₺ - 1.250 ₺',
    showPrice: true,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop',
    description: 'Kollar için hassas cilt dostu roll-on ve sir ağda uygulaması.',
    features: ['Hızlı Uygulama', 'Kızarıklık Önleyici Krem']
  },
  {
    id: 'srv-agda-4',
    name: 'Dekolte - Göbek - Sırt',
    category: 'agda',
    price: 700,
    priceType: 'range',
    customPriceText: '700 ₺ - 1.300 ₺',
    showPrice: true,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    description: 'Dekolte, sırt veya göbek bölgeleri için özel titanyum içerikli hassas sir ağda seansı.',
    features: ['Titanyum Pudralı Ağda', 'Tahriş Etmeyen Formül']
  },
  {
    id: 'srv-agda-5',
    name: 'Koltuk Altı Ağda',
    category: 'agda',
    price: 850,
    priceType: 'fixed',
    customPriceText: '850 ₺',
    showPrice: true,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop',
    description: 'Koltuk altı bölgesi için hassas boncuk ağda ile acısız, batıksız ve kararma karşıtı uygulama.',
    features: ['Boncuk Soyulabilir Ağda', 'Kararma Karşıtı Losyon', '15 Dakikada Tamamlanır']
  },

  // 6. BAKIM ÜRÜN GRUBU
  {
    id: 'srv-bakim-1',
    name: 'Saç Bakımı',
    category: 'bakim',
    price: 0,
    priceType: 'free',
    customPriceText: 'SERBEST / Fiyat Alınız',
    showPrice: true,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    description: 'Saçın ihtiyaç analizine göre belirlenen nem, protein veya lipit yükleme ritüeli ve buhar terapisi.',
    features: ['Ozon Buhar Terapisi', 'Saç Derisi Masajı', 'Derinlemesine Onarım']
  },
  {
    id: 'srv-bakim-2',
    name: 'Marka Bakım Ürünü',
    category: 'bakim',
    price: 3200,
    priceType: 'fixed',
    customPriceText: '3.200 ₺',
    showPrice: true,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    description: 'Dünyaca ünlü Kérastase ve Olaplex profesyonel salon serileriyle saç tellerini içten dışa onaran yoğun kür.',
    features: ['Orijinal Kérastase / Olaplex', 'Kırıkları %90 Onarma', 'Yoğun Parlaklık']
  },
  {
    id: 'srv-bakim-3',
    name: 'Keratin Bakımı (Kısa) - (Uzun)',
    category: 'bakim',
    price: 8000,
    priceType: 'range',
    customPriceText: '8.000 ₺ - 9.500 ₺',
    showPrice: true,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=600&auto=format&fit=crop',
    description: 'Yıpranmış saçları yeniden yapılandıran bitkisel sıvı keratin enjeksiyonu ve mühürleme kürü.',
    features: ['Sıvı Keratin Mühürleme', 'Matlığı Giderici Işıltı', '3 Ay Etkili']
  },

  // 7. ÖZEL İŞLEMLER & SOLARYUM & K-SCAN
  {
    id: 'srv-ozel-1',
    name: 'Profesyonel Turbo Solaryum Seansı',
    category: 'ozel-islemler',
    price: 50,
    priceType: 'custom',
    customPriceText: '50 ₺ / Dakika',
    showPrice: true,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    description: 'Yeni nesil yüksek verimli UV lambalara sahip ayakta ve yatarak turbo solaryum seansları. Eşit, altın tonlu ve kalıcı bronzluk.',
    features: ['50 ₺ / Dakika Ücretlendirme', 'Hijyenik Dezenfekte Kabin', 'Hızlandırıcı Bronzluk Kremleri']
  },
  {
    id: 'srv-ozel-2',
    name: 'K-SCAN Yapay Zekâ Destekli Saç & Saç Derisi Analizi',
    category: 'ozel-islemler',
    price: 0,
    priceType: 'free',
    customPriceText: 'Hizmet Öncesi Ücretsiz / Salonda',
    showPrice: true,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
    description: 'Yalnızca yetkili Kérastase salonlarında bulunan akıllı mikroskobik kamera ve yapay zeka algoritması ile 100x büyütmeli saç analizi.',
    features: ['100x Büyütmeli AI Kamera', 'Kişiselleştirilmiş Bakım Reçetesi', 'Saç Yoğunluğu & Nem Ölçümü']
  }
];

export const SALON_STYLISTS: Stylist[] = [
  {
    id: 'st-1',
    name: 'Selin Yılmaz',
    role: 'Baş Stilist & Renklendirme Direktörü',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=150&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 148,
    specialities: ['Balyaj & Ombre', 'Kérastase Ritüelleri', 'Tasarım Saç Kesimi', 'Sarı Saç Uzmanlığı'],
    availableSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    isVisible: true
  },
  {
    id: 'st-2',
    name: 'Derya Kaya',
    role: 'Uzman Estetisyen & Nail Artist',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    rating: 4.8,
    reviewsCount: 96,
    specialities: ['Kalıcı Oje', 'Medikal Kuru Manikür', 'Protez Tırnak & Nail Art', 'Solaryum Danışmanı'],
    availableSlots: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
    isVisible: true
  },
  {
    id: 'st-3',
    name: 'Büşra Çetin',
    role: 'Makyaj Tasarımcısı & Profesyonel Vizajist',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=150&auto=format&fit=crop',
    rating: 4.95,
    reviewsCount: 220,
    specialities: ['Gelin Başı & Makyajı', 'Porselen Gece Makyajı', 'Kaş Laminasyonu', 'Özel Davet Topuzu'],
    availableSlots: ['09:00', '11:00', '13:00', '15:00', '16:30', '18:00'],
    isVisible: true
  },
  {
    id: 'st-4',
    name: 'Ebru Yıldız',
    role: 'Saç Kaynak & Keratin Terapi Uzmanı',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    rating: 4.75,
    reviewsCount: 84,
    specialities: ['Keratin Bakım', 'Mikro Kaynak', 'Brezilya Fönü', 'K-Scan AI Analiz'],
    availableSlots: ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'],
    isVisible: true
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'BK-2094-M8',
    trackingCode: 'BK-2094-M8',
    customerName: 'Melis Şen',
    services: [SALON_SERVICES[0], SALON_SERVICES[8]],
    stylist: SALON_STYLISTS[0],
    date: '2026-05-24',
    timeSlot: '11:00',
    totalPrice: 2300,
    priceNote: 'Özel indirim uygulandı',
    status: 'approved',
    notes: 'Küllü sarı balyaj cilası ve saç ucu kırıkları için Kérastase maske talebim var.',
    createdAt: '2026-05-22 10:15'
  },
  {
    id: 'BK-8812-C3',
    trackingCode: 'BK-8812-C3',
    customerName: 'Ceren Demirci',
    customerEmail: 'ceren.dmr@yahoo.com',
    services: [SALON_SERVICES[10]],
    stylist: SALON_STYLISTS[0],
    date: '2026-05-23',
    timeSlot: '13:00',
    totalPrice: 12000,
    priceNote: 'Balyaj (Ombre)',
    status: 'pending',
    notes: 'Saçım orta uzunlukta ve koyu kestane rengindedir.',
    createdAt: '2026-05-22 12:44'
  },
  {
    id: 'BK-4195-A7',
    trackingCode: 'BK-4195-A7',
    customerName: 'Aylin Çelik',
    services: [SALON_SERVICES[3]],
    stylist: SALON_STYLISTS[2],
    date: '2026-05-23',
    timeSlot: '15:00',
    totalPrice: 0,
    priceNote: 'Gelin Başı Özel Paket (Serbest Fiyat)',
    status: 'approved',
    notes: 'Açık hava düğünü için prova ve gelin başı tasarımı.',
    createdAt: '2026-05-21 16:20'
  },
  {
    id: 'BK-1021-G4',
    trackingCode: 'BK-1021-G4',
    customerName: 'Gülçin Kaya',
    services: [SALON_SERVICES[15], SALON_SERVICES[25]],
    stylist: SALON_STYLISTS[1],
    date: '2026-05-21',
    timeSlot: '14:30',
    totalPrice: 1750,
    priceNote: 'Medikal Manikür + 15 dk Solaryum',
    status: 'completed',
    notes: 'Kalıcı oje için soft nude tonlar tercih edeceğim.',
    createdAt: '2026-05-20 09:12'
  }
];

export const REVIEWS: SalonReview[] = [
  {
    id: 'rev-1',
    customerName: 'Merve Altun',
    rating: 5,
    comment: 'Selin Hanım balayaj ve Kérastase Fusio-Dose bakımında gerçekten bir numara! Saçlarımda gram yıpranma olmadan harika bir ışıltı çıkardı. Salon çok ferah ve çalışanlar çok ilgili.',
    date: '2026-05-18',
    serviceCategory: 'Renklendirme & Balyaj'
  },
  {
    id: 'rev-2',
    customerName: 'Zeynep Ak',
    rating: 5,
    comment: 'Kalıcı oje ve medikal kuru manikür için Derya Hanım kesinlikle profesyonel. Tırnak etlerim hiç acımadı ve renk 4 haftadır parlıyor. Solaryum kabini de çok temiz.',
    date: '2026-05-15',
    serviceCategory: 'El & Ayak & Solaryum'
  },
  {
    id: 'rev-3',
    customerName: 'Fatma Başaran',
    rating: 5,
    comment: 'Gelin saçı ve porselen makyajım için Büşra Hanım ile hazırlandık. Gece sonuna kadar ne saçım bozuldu ne makyajım aktı. Herkes hayran kaldı.',
    date: '2026-05-10',
    serviceCategory: 'Gelin Başı & Makyaj'
  },
  {
    id: 'rev-4',
    customerName: 'Deniz Gökçe',
    rating: 5,
    comment: 'K-SCAN saç analizi yaptırdık ve saç derime uygun Kérastase Première serisi uygulandı. Ağırlaşmadan inanılmaz yumuşaklık ve parlaklık kazandı saçlarım.',
    date: '2026-05-04',
    serviceCategory: 'Kérastase Ritüeli'
  }
];

export const INITIAL_MESSAGES: AdminMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Sema Kurtoğlu',
    senderPhone: '+90 531 888 77 66',
    subject: 'Gelin Paketi & Fiyat Bilgisi Alımı',
    message: 'Merhaba, Temmuz ayındaki düğünüm için ben ve nedimelerim dahil olmak üzere gelin saçı, porselen makyaj ve Kérastase bakım hizmeti almak istiyoruz. Randevu ve fiyat detaylarını öğrenebilir miyim?',
    date: '2026-05-22 13:40',
    read: false
  },
  {
    id: 'msg-2',
    senderName: 'Melike Ersoy',
    senderPhone: '+90 507 999 88 11',
    subject: 'Solaryum ve Keratin Bakım Seansı',
    message: 'İyi günler, solaryum seansları için önceden randevu almamız gerekiyor mu ve dakika başı ücretlendirme nasıl işliyor? Teşekkürler.',
    date: '2026-05-21 11:15',
    read: true,
    replied: true,
    replyText: 'Merhaba Melike Hanım, solaryum seanslarımız dakikası 50 TL olarak ücretlendirilmekte olup dilediğiniz gün ve saat için online rezervasyon oluşturabilirsiniz.'
  }
];

export const KERASTASE_PRODUCTS: KerastaseProduct[] = [
  // 1. GLOSS ABSOLU & GLOSS ABSOLU CRÈME
  {
    id: 'kp-gloss-1',
    name: 'Bain Crème Hydra-Glaze Saç Banyosu',
    series: 'Gloss Absolu Crème',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Kalın telli ve elektriklenmeye eğilimli saçlar için geliştirilen kremsi şampuan; saçı derinlemesine besler, nazikçe temizler ve dolgun, esnek, parlak bir görünüm kazandırır.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Elektriklenme Karşıtı', 'Yoğun Nemlendirme', 'Ayna Parlaklığı'],
    isFeatured: true
  },
  {
    id: 'kp-gloss-2',
    name: 'Masque Crème Hydra-Glaze Maske',
    series: 'Gloss Absolu Crème',
    stepType: '2-durulanan',
    stepLabel: '2. Durulanan Bakım',
    description: 'Kalın telli ve elektriklenmeye eğilimli saçlar için geliştirilen krem maske; saçı nemlendirir, pürüzsüzleştirir ve dolgun, parlak bir görünüm kazandırır.',
    size: '200 ml',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    benefits: ['Pürüzsüzleştirici Etki', 'Derinlemesine Besleme', 'Kolay Tarama']
  },
  {
    id: 'kp-gloss-3',
    name: 'Frizz Glaze Cream Bakım Kremi',
    series: 'Gloss Absolu Crème',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Kalın telli ve elektriklenmeye eğilimli saçlar için anti-frizz şekillendirici krem. Yüksek nem ve sıcaklıkta bile 4 güne kadar elektriklenme karşıtı etki ve parlaklık sağlar.',
    size: '150 ml',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop',
    benefits: ['4 Güne Kadar Anti-Frizz', 'Isı Koruması', 'Işıltılı Doku']
  },
  {
    id: 'kp-gloss-4',
    name: 'Bain Hydra-Glaze Saç Banyosu',
    series: 'Gloss Absolu',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Elektriklenmeye eğilimli saçlar için nem ve parlaklık veren şampuan. Saç derisini ve saç yüzeyini temizleyerek göz alıcı bir parlaklık ortaya çıkarır.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Işıltı & Parlaklık', 'Hafif Arındırma']
  },
  {
    id: 'kp-gloss-5',
    name: 'Insta Glaze Saç Bakım Kremi',
    series: 'Gloss Absolu',
    stepType: '2-durulanan',
    stepLabel: '2. Durulanan Bakım',
    description: 'Elektriklenmeye eğilimli saçlar için parlaklık veren saç bakım kremi. Saçı nemle doldurur ve saçı dolgunlaştırır, kolayca taranmasını sağlar.',
    size: '200 ml',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    benefits: ['Anında Çözülen Düğümler', 'İpeksi Dokunuş']
  },
  {
    id: 'kp-gloss-6',
    name: 'Glaze Drops Saç Bakım Yağı',
    series: 'Gloss Absolu',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Elektriklenmeye eğilimli saçlar için mükemmel parlaklık sağlayan hafif yapıda saç bakım yağı.',
    size: '75 ml',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Ağırlık Yapmayan Yağ', 'Cam Gibi Parlaklık']
  },

  // 2. PREMIÈRE
  {
    id: 'kp-prem-1',
    name: 'Concentré Décalcifiant Ultra-Réparateur Şampuan Öncesi Bakım',
    series: 'Première',
    stepType: 'on-bakim',
    stepLabel: 'Ön Bakım',
    description: 'Yapısındaki saf asitler sayesinde tüm hasarlı saç tipleri için saçta aşırı dozda biriken kalsiyumu arındıran jel yapıda ön banyo. Saçtaki kalıcı hasarı ortadan kaldırır ve keratin bağlarını yeniden oluşturur.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop',
    benefits: ['Kalsiyum Arındırma', 'Keratin Bağlarını Onarma', '%99 Orijinal Güç'],
    isFeatured: true
  },
  {
    id: 'kp-prem-2',
    name: 'Bain Décalcifiant Réparateur Saç Banyosu',
    series: 'Première',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Kalın telli ve elektriklenmeye eğilimli saçlar için nemlendirici kremsi şampuan. Saçı derinlemesine besler; yoğun köpüren formülü saç derisini nazikçe temizler ve parlaklık kazandırır.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Kalsiyum Karşıtı Şampuan', 'Güçlendirici Köpük']
  },
  {
    id: 'kp-prem-3',
    name: 'Masque Filler Réparateur Saç Maskesi',
    series: 'Première',
    stepType: '2-durulanan',
    stepLabel: '2. Durulanan Bakım',
    description: 'İşlem görmüş hasarlı saç tellerini içten onaran, kırılmalara karşı koruyan ve parlak görünüm katan saç maskesi.',
    size: '200 ml',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    benefits: ['Derin Doku Dolgusu', 'Kırılmaları Engelleme']
  },
  {
    id: 'kp-prem-4',
    name: 'Huile Gloss Réparatrice Saç Yağı',
    series: 'Première',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Hasarlı saçlardaki kalıcı matlığı gideren, uçlardaki kırıkları onaran ve yoğun parlaklık veren onarıcı lüks yağ.',
    size: '75 ml',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Kırık Uç Onarımı', '230°C Isı Koruması', 'Elmas Işıltısı']
  },

  // 3. ELIXIR ULTIME
  {
    id: 'kp-elixir-1',
    name: 'Le Bain Saç Banyosu',
    series: 'Elixir Ultime',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Normal ve kalın telli saçlar için yağ içerikli, temizleyici saç banyosu. Saç tellerini derinlemesine temizler, parlaklığını artırır, canlandırır.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Değerli Yağ Formülü', 'Yumuşak ve Canlı Saçlar'],
    isFeatured: true
  },
  {
    id: 'kp-elixir-2',
    name: 'L’Huile Originale Saç Bakım Yağı (Refillable)',
    series: 'Elixir Ultime',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Tüm saç tiplerinde gelişmiş elektriklenme önleyici performansa sahip, güzelleştirici, hafif formüllü ve çok yönlü durulanmayan ikonik saç yağı. Yeniden doldurulabilir cam şişede.',
    size: '75 ml / 30 ml',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Yaban Kamelyası Özü', '96 Saat Elektriklenme Kontrolü', 'İkonik Fransız Parfümü'],
    isFeatured: true
  },

  // 4. CHRONOLOGISTE
  {
    id: 'kp-chrono-1',
    name: 'Régénérant Saç Banyosu',
    series: 'Chronologiste',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Tüm saç tipleri için geliştirilen, saçı derinlemesine temizleyen ve saç ile saç derisi görünümünü yenilemeye yardımcı olan lüks saç banyosu. Hyalüronik asit ve Abyssine içerir.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Saç Derisi Gençleştirme', 'Hyalüronik Asit & Abyssine'],
    isFeatured: true
  },
  {
    id: 'kp-chrono-2',
    name: 'Régénérant Saç Maskesi',
    series: 'Chronologiste',
    stepType: '2-durulanan',
    stepLabel: '2. Durulanan Bakım',
    description: 'Saç ve saç derisi görünümünü yenileyen, yoğun nemlendiren ve yaşlanma belirtilerine karşı parlaklık kazandıran saç maskesi.',
    size: '200 ml',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    benefits: ['Havyar Kürecikleri', '%87 Daha Fazla Nem', 'Canlandırıcı Etki']
  },
  {
    id: 'kp-chrono-3',
    name: 'L’huile de Parfum Saç Bakım Yağı',
    series: 'Chronologiste',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Mür özü ile zenginleştirilmiş saç bakım yağı; çay gülü, hafif odunsu ve misk notalarıyla saçta gün boyu lüks bir parfüm etkisi bırakır.',
    size: '100 ml',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Lüks İmza Parfüm', 'Işıltılı Koruma']
  },
  {
    id: 'kp-chrono-4',
    name: 'Chronologiste Rituel Noir Régénérant',
    series: 'Chronologiste',
    stepType: 'salon-bakim',
    stepLabel: 'Salon Özel Ritüeli',
    description: 'Saç ve saç derisini yenilemeyi hedefleyen en lüks bakım ritüelimiz; gelişmiş havyar teknolojisi ve akupresür masajıyla salonda eşsiz bir deneyim sunar.',
    size: 'Salonda Özel Seans',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    benefits: ['Salon Özel Havyar Ritüeli', 'Dönüştürücü Saç Terapisi']
  },

  // 5. BLOND ABSOLU
  {
    id: 'kp-blond-1',
    name: 'Bain Ultra-Violet Saç Banyosu',
    series: 'Blond Absolu',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Açma işlemi görmüş sarı ve gri saçlar için istenmeyen turuncu ve sarı yansımaları gideren mor pigmentli saç banyosu.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop',
    benefits: ['Turunculaşma Karşıtı Mor Pigment', 'Hyalüronik Asit & Edelweiss'],
    isFeatured: true
  },
  {
    id: 'kp-blond-2',
    name: 'Bain Lumière Saç Banyosu',
    series: 'Blond Absolu',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Açma işlemi görmüş sarı saçlara nem kazandıran, diplerden uçlara kadar pürüzsüz bir dokunuş ve parlaklık sağlayan şampuan.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Işıltı Artırıcı', 'Hafif Arındırma']
  },
  {
    id: 'kp-blond-3',
    name: 'Cicanuit Gece Serumu',
    series: 'Blond Absolu',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Açma işlemi görmüş hassas sarı saçları, gece boyunca yoğun bir şekilde onaran ve kırılmaları engelleyen hafif beyaz krem serum.',
    size: '90 ml',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop',
    benefits: ['Gece Boyu Onarım', 'Sabah İpeksi Sarılar']
  },
  {
    id: 'kp-blond-4',
    name: '%2 Saf Hyalüronik Asit Serum',
    series: 'Blond Absolu',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Nemlendirici, onarıcı saç ve saç derisi serumu. Açık renkli jel serumun hafif dokusu, saç derisi bariyerini korur ve rahatlık hissi bırakır.',
    size: '50 ml',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Saf Hyalüronik Asit', 'Derin Nem Bariyeri']
  },

  // 6. GENESIS & GENESIS HOMME
  {
    id: 'kp-gen-1',
    name: 'Bain Hydra-Fortifiant Saç Banyosu',
    series: 'Genesis',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Zayıf ve kırılmaya bağlı saç dökülmesine eğilimli ince telli saçlar için özel olarak geliştirilmiş güçlendirici saç banyosu.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    benefits: ['Zencefil Kökü Özü', 'Edelweiss Hücreleri', '%84 Daha Az Dökülme'],
    isFeatured: true
  },
  {
    id: 'kp-gen-2',
    name: 'Sérum Anti-Chute Fortifiant Saç Serumu',
    series: 'Genesis',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Günlük saç dökülmesine karşı geliştirilen saç serumu. Saç telini ve kökünü güçlendirerek saçın doğal güzelliğini ortaya çıkarmaya yardımcı olur.',
    size: '90 ml',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop',
    benefits: ['Aminexil %1.5', 'Saç Kökü Güçlendirme']
  },
  {
    id: 'kp-genh-1',
    name: 'Bain De Masse Épaississant Saç Banyosu',
    series: 'Genesis Homme',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Erkekler için zayıflamış, incelmeye meyilli saç tellerini anında kalınlaştıran ve hacim kazandıran saç banyosu.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=600&auto=format&fit=crop',
    benefits: ['Kreatin & Zencefil Kökü', 'Anında Saç Teli Kalınlığı']
  },
  {
    id: 'kp-genh-2',
    name: 'Cire D’épaisseur Texturisante Saç Waxı',
    series: 'Genesis Homme',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Zayıflamış, incelmeye meyilli saçlar için anında saç teli kalınlığını artıran, mat bitişli şekillendirici wax.',
    size: '75 ml',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    benefits: ['Mat Bitiş', 'Güçlü Tutuş & Hacim']
  },

  // 7. NUTRITIVE
  {
    id: 'kp-nutri-1',
    name: 'Bain Satin Riche Saç Banyosu',
    series: 'Nutritive',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Çok kuru saçlar için yoğun besleyici, nem veren, derinlemesine temizleyen ve saça elastikiyet katan saç banyosu.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop',
    benefits: ['Bitkisel Proteinler', 'Niasinamid', 'Kuru Saç Terapisi'],
    isFeatured: true
  },
  {
    id: 'kp-nutri-2',
    name: 'Masquintense Riche Saç Maskesi',
    series: 'Nutritive',
    stepType: '2-durulanan',
    stepLabel: '2. Durulanan Bakım',
    description: 'Çok kuru, orta ve kalın telli saçlar için derinlemesine besleyici, ultra konsantre, zengin saç maskesi.',
    size: '200 ml',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=600&auto=format&fit=crop',
    benefits: ['Ultra Konsantre Besleme', 'Kaşmir Yumuşaklığı']
  },
  {
    id: 'kp-nutri-3',
    name: '8H Magic Gece Serumu',
    series: 'Nutritive',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Kuru saçları güzellik uykusuna yatıran, gece boyunca emilerek saçı ağırlaştırmadan besleyen sihirli gece serumu.',
    size: '90 ml',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['8 Saat Kesintisiz Bakım', 'Yastık İzi Bırakmaz', 'Kolay Taranan İpeksi Saçlar'],
    isFeatured: true
  },

  // 8. SYMBIOSE
  {
    id: 'kp-sym-1',
    name: 'Micro-Peeling Cellulaire Saç Peelingi',
    series: 'Symbiose',
    stepType: 'on-bakim',
    stepLabel: 'Ön Bakım',
    description: 'Kepeğe eğilimli hassas saç derisi için geliştirilen hücresel mikro-peeling bakımı. Ölü hücreleri ve kepeği nazikçe arındırır.',
    size: '200 ml',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    benefits: ['Salisilik Asit %1.9', 'Hücresel Arınma'],
    isFeatured: true
  },
  {
    id: 'kp-sym-2',
    name: 'Bain Crème Anti-Pelliculaire Saç Banyosu',
    series: 'Symbiose',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Kepeğe eğilimli kuru saç derisi için geliştirilen, saç derisini nemlendiren ve kepeğin görünür seviyede azalmasına yardımcı olan hücresel saç banyosu.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Piroctone Olamine', '7 Haftaya Kadar Kepek Önleyici']
  },

  // 9. RÉSISTANCE
  {
    id: 'kp-res-1',
    name: 'Résistance Force Architecte Saç Banyosu',
    series: 'Résistance',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Yıpranmış ve esnekliğini kaybetmiş saçlar için saç telini onarıcı ve yeniden yapılandırıcı saç banyosu.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Pro-Keratin Kompleksi', 'Kırılma Karşıtı Kalkan'],
    isFeatured: true
  },
  {
    id: 'kp-res-2',
    name: 'Extentioniste Serum',
    series: 'Résistance',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Sağlıklı saç uzaması için geliştirilen, saç derisini aktive eden ve saç kökü çevresini koruyan konsantre serum.',
    size: '50 ml',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['4 cm\'e Kadar Sağlıklı Uzama', 'Güçlü Saç Boyları']
  },

  // 10. CHROMA ABSOLU
  {
    id: 'kp-chroma-1',
    name: 'Bain Riche Chroma Respect Saç Banyosu',
    series: 'Chroma Absolu',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Orta ve kalın telli boyalı saçlar için renk solmasını önleyen, besleyici ve saç telini koruyucu şampuan.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop',
    benefits: ['Laktik Asit & Centella Asiatica', '6 Hafta Renk Parlaklığı'],
    isFeatured: true
  },

  // 11. DISCIPLINE
  {
    id: 'kp-disc-1',
    name: 'Bain Fluidéaliste Sulfate Free Saç Banyosu',
    series: 'Discipline',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Asi saçlarla uyumlu, hareket ve pürüzsüzlük sağlayan sülfatsız saç banyosu. Tüm saç tipleri için uygundur.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop',
    benefits: ['Sülfatsız Nazik Temizlik', 'Morpho-Kératine Kompleksi']
  },

  // 12. CURL MANIFESTO
  {
    id: 'kp-curl-1',
    name: 'Gelée Curl Contour Jel Krem',
    series: 'Curl Manifesto',
    stepType: '3-durulanmayan',
    stepLabel: '3. Durulanmayan Bakım',
    description: 'Dalgalı, kıvırcık ve çok kıvırcık saçlar için bukleleri belirginleştiren, 24 saat nemlendiren Manuka ballı jel krem.',
    size: '150 ml',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop',
    benefits: ['Manuka Balı & Seramid', 'Esnek ve Belirgin Bukleler']
  },

  // 13. SOLEIL
  {
    id: 'kp-sol-1',
    name: 'Bain Après-Soleil Saç Banyosu',
    series: 'Soleil',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Güneşe, tuza ve klora maruz kalan saçları nazikçe arındıran, UV filtresi ve Hindistan cevizi suyu içerikli şampuan.',
    size: '250 ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    benefits: ['UV Filtresi', 'Klor ve Tuz Arındırma']
  },

  // 14. SPÉCIFIQUE & DENSIFIQUE
  {
    id: 'kp-spec-1',
    name: 'Bain Divalent Saç Banyosu',
    series: 'Spécifique',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Yağlı saç köklerini arındırırken kuru saç uçlarını besleyen çift etkili saç banyosu.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    benefits: ['Sebum Dengeleme', 'Kuru Uçları Besleme']
  },
  {
    id: 'kp-dens-1',
    name: 'Densifique Yoğunluk Kazandıran Saç Banyosu',
    series: 'Densifique',
    stepType: '1-banyo',
    stepLabel: '1. Saç Banyosu',
    description: 'Yoğunluğunu ve dolgunluğunu kaybetmiş saçlar için Stemoxydine ve Hyalüronik asit içeren yoğunlaştırıcı saç banyosu.',
    size: '250 ml / 500 ml',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Stemoxydine & Hyaluronik Asit', 'Gözle Görülür Dolgunluk']
  },

  // 15. FUSIO-DOSE
  {
    id: 'kp-fusio-1',
    name: 'Fusio-Dose Konsantre & Booster İkili Terapi',
    series: 'Fusio-Dose',
    stepType: 'salon-bakim',
    stepLabel: 'Salon Özel Ritüeli',
    description: 'Saçınızın birincil ve ikincil ihtiyaçlarına göre anında hazırlanan kişiye özel salon karışımı.',
    size: 'Salonda Özel Uygulama',
    image: 'https://images.unsplash.com/photo-1608248597359-25fef0790b4d?q=80&w=600&auto=format&fit=crop',
    benefits: ['Anında Gözle Görülür Dönüşüm', '30 Farklı Kombinasyon Seçeneği'],
    isFeatured: true
  },

  // 16. K-SCAN
  {
    id: 'kp-kscan-1',
    name: 'K-SCAN Yapay Zekâ Destekli Saç & Saç Derisi Analiz Kamerası',
    series: 'K-Scan',
    stepType: 'cihaz',
    stepLabel: 'Yapay Zeka Teknolojisi',
    description: 'Yalnızca yetkili Kérastase salonlarında bulunan yenilikçi bir akıllı kameradır. Gelişmiş yapay zekâ teknolojisiyle saç derisini mikroskobik düzeyde analiz eder.',
    size: 'Salon Teşhis Cihazı',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
    benefits: ['Yapay Zeka Destekli Hassas Ölçüm', 'Mikroskopik Kök & Tel Görüntüleme', 'Size Özel Bakım Reçetesi'],
    isFeatured: true
  },

  // PDF brand book additions
  {
    id: 'kp-prem-5', name: 'Fondant Fluidité Réparateur Saç Bakım Kremi', series: 'Première',
    stepType: '2-durulanan', stepLabel: '2. Durulanan Bakım', size: '200 ml',
    description: 'Hasarlı saçlara nem ve yumuşaklığını geri kazandıran, esnek ve parlak bir görünüm sağlayan jel krem.',
    benefits: ['Nem ve Yumuşaklık', 'Esneklik', 'Parlaklık']
  },
  {
    id: 'kp-prem-6', name: 'Concentré Liquide Resurfaçant Salon Bakım Ürünü', series: 'Première',
    stepType: 'salon-bakim', stepLabel: 'Salon Özel Ritüeli', size: 'Salonda Özel Uygulama',
    description: 'Saçta biriken kalsiyumu gidererek saç yüzeyini yoğun biçimde temizleyen sıvı konsantre.',
    benefits: ['Kalsiyum Arındırma', 'Saç Yüzeyi Yenileme']
  },
  {
    id: 'kp-prem-7', name: 'Sérum Filler Fondamental Saç Serumu', series: 'Première',
    stepType: '3-durulanmayan', stepLabel: '3. Durulanmayan Bakım', size: '90 ml',
    description: 'Saçları derinden besleyerek daha yumuşak ve pürüzsüz bir görünüm kazandıran, elektriklenmeyi önlemeye yardımcı serum.',
    benefits: ['Pürüzsüzlük', 'Elektriklenme Karşıtı']
  },
  {
    id: 'kp-nutri-0', name: 'Bain Satin Saç Banyosu', series: 'Nutritive',
    stepType: '1-banyo', stepLabel: '1. Saç Banyosu', size: '250 ml / 500 ml',
    description: 'Kuru saçlar için nemlendirici saç banyosu. Saçı besler, esneklik ve parlaklık sağlar.',
    benefits: ['Nemlendirme', 'Besleyici Bakım', 'Esneklik']
  },
  {
    id: 'kp-gen-0', name: 'Bain Nutri-Fortifiant Saç Banyosu', series: 'Genesis',
    stepType: '1-banyo', stepLabel: '1. Saç Banyosu', size: '250 ml / 500 ml',
    description: 'Normalden yağlıya eğilimli, zayıflamış ve fırçalama kaynaklı kırılmaya meyilli saçlar için güçlendirici saç banyosu.',
    benefits: ['Güçlendirme', 'Kırılma Karşıtı']
  },
  {
    id: 'kp-gen-3', name: 'Masque Reconstituant Saç Maskesi', series: 'Genesis',
    stepType: '2-durulanan', stepLabel: '2. Durulanan Bakım', size: '200 ml',
    description: 'Güçsüz ve taramadan kaynaklı dökülmeye müsait saçlar için güçlendirici saç bakım maskesi.',
    benefits: ['Güçlendirme', 'Dökülme Karşıtı Bakım']
  },
  {
    id: 'kp-gen-3b', name: 'Défense Thermique Saç Spreyi', series: 'Genesis',
    stepType: '3-durulanmayan', stepLabel: '3. Durulanmayan Bakım', size: '150 ml',
    description: 'Zayıflamış ve kırılmaya meyilli saçları güçlendiren, 230°C’ye kadar ısı koruması sağlayan saç spreyi.',
    benefits: ['230°C Isı Koruması', 'Kırılma Karşıtı']
  },
  {
    id: 'kp-blond-5', name: 'Ultra-Violet Saç Maskesi', series: 'Blond Absolu',
    stepType: '2-durulanan', stepLabel: '2. Durulanan Bakım', size: '200 ml',
    description: 'Açma işlemi görmüş sarı saçlarda ideal tonu koruyan ve saç telini güçlendiren mor pigmentli maske.',
    benefits: ['Mor Pigment', 'Sarı Ton Koruma', 'Güçlendirme']
  },
  {
    id: 'kp-blond-6', name: 'Cicaplasme Serum', series: 'Blond Absolu',
    stepType: '3-durulanmayan', stepLabel: '3. Durulanmayan Bakım', size: '150 ml',
    description: 'Açma işlemi sonrasında hassaslaşan saçları onarmaya, ısıya ve kırılmalara karşı korumaya yardımcı serum.',
    benefits: ['Isı Koruması', 'Kırılma Karşıtı', 'Onarıcı Bakım']
  },
  {
    id: 'kp-blond-7', name: 'L’huile Cicagloss Saç Bakım Yağı', series: 'Blond Absolu',
    stepType: '3-durulanmayan', stepLabel: '3. Durulanmayan Bakım', size: '75 ml',
    description: 'Saçı nemlendiren, güçlendiren, açma işlemlerinden kaynaklanan hasarları onarmaya yardımcı olan bakım yağı.',
    benefits: ['Nemlendirme', 'Parlaklık', 'Onarıcı Bakım']
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: '2026 Balyaj ve Ombre Saç Trendleri: Doğal ve Işıltılı Tonlar',
    slug: '2026-balyaj-ve-ombre-sac-trendleri',
    excerpt: '2026 yılında saç trendlerinde doğallık, yumuşak geçişler ve sıcak tonlar ön plana çıkıyor. Honey blonde, hazelnut ombre ve baby blonde hakkında her şey.',
    content: `
# 2026 Balyaj ve Ombre Saç Trendleri: Doğallık ve Zarafetin Zirvesi

Saç renklendirme dünyasında 2026 yılı, keskin çizgilerin yerini tamamen **yumuşak, doğal ve güneşten açılmış hissi veren** geçişlere bıraktığı bir dönem oluyor. Salonumuzda en çok tercih edilen uygulamalar ve bu yılın trendleri:

### 1. Honey Blonde & Warm Caramel Balyaj
Soğuk platin sarıların yerini artık daha sıcak, ışıltılı bal sarıları ve karamel tonları alıyor. Bu tonlar özellikle buğday ve esmer tenli kadınların yüz hatlarını yumuşatırken cilde taze bir ışıltı katıyor.

### 2. Brushlight ve Baby Blonde Dokunuşlar
Saçın tamamını açmak yerine sadece yüzü çerçeveleyen tutamlara ve saç uçlarına uygulanan mikro ışıltılar sayesinde saç minimum işlemle maksimum parlaklığa kavuşuyor.

### 3. Olaplex ve Bağ Koruyucu Kürlerin Önemi
Açma işlemi sırasında saç telindeki disülfit bağlarının korunması esastır. Salonumuzda tüm açma seanslarında orijinal bağ koruyucular kullanılarak saç yıpranmadan sarışınlık elde edilir.
    `,
    category: 'Renklendirme & Balyaj',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop',
    author: 'Selin Yılmaz (Baş Stilist)',
    date: '2026-05-15',
    readTime: '4 dk',
    tags: ['Balyaj', 'Ombre', '2026 Saç Modası', 'Olaplex', 'Sarı Saç']
  },
  {
    id: 'blog-2',
    title: 'Kérastase Saç Bakım Ritüelleri: Saç Tipinize En Uygun Seri Hangisi?',
    slug: 'kerastase-sac-bakim-rituelleri-rehberi',
    excerpt: 'Kérastase\'ın efsanevi Première, Chronologiste, Blond Absolu ve Genesis serilerini keşfedin. Hangi saç tipi hangi ürünü kullanmalı?',
    content: `
# Kérastase ile Kusursuz Saç Bakımının Sırları

1964 yılından bu yana profesyonel lüks saç bakımının öncüsü olan **Kérastase Paris**, saçın her ihtiyacına yönelik bilimsel ve hedefe yönelik çözümler sunar.

### Hangi Seri Sizin İçin Uygun?
- **Aşırı Yıpranmış ve İşlem Görmüş Saçlar:** Kérastase Première serisi, saçta biriken kalsiyumu arındırarak keratin bağlarını yeniden oluşturur.
- **Olgun ve Canlılığını Yitirmiş Saçlar:** Chronologiste Havyar terapisi saç derisi ve tellerinde yaşlanma belirtileriyle savaşır.
- **Sarı ve Açma İşlemi Görmüş Saçlar:** Blond Absolu mor şampuan ve hyalüronik asit serisi turunculaşmayı önler ve saçı derinlemesine besler.
- **Dökülme ve İncelme Sorunu:** Genesis serisi zencefil kökü ve Aminexil içeriğiyle saç dökülmesini %84'e kadar azaltır.

Salonumuzda uzman stilistlerimiz eşliğinde K-SCAN analizi yaptırarak saçınıza en uygun seriyi belirleyebilirsiniz.
    `,
    category: 'Kérastase & Bakım',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?q=80&w=800&auto=format&fit=crop',
    author: 'Ebru Yıldız (Bakım Uzmanı)',
    date: '2026-05-10',
    readTime: '5 dk',
    tags: ['Kérastase', 'Première', 'Chronologiste', 'Saç Bakımı', 'Fusio-Dose']
  },
  {
    id: 'blog-3',
    title: 'Yapay Zeka Destekli Saç Analizi (K-SCAN) Nedir ve Nasıl Yapılır?',
    slug: 'yapay-zeka-destekli-sac-analizi-k-scan',
    excerpt: 'Gelişmiş AI kamerası K-SCAN ile saç derisi sağlığınız, gözenek açıklığınız ve saç teli kalınlığınız dakikalar içinde analiz ediliyor.',
    content: `
# Salonumuzda Yeni Çağ: Yapay Zeka Destekli K-SCAN Saç Analizi

Kérastase'ın son teknoloji akıllı teşhis kamerası **K-SCAN**, saç ve saç derisi analizini mikroskobik boyutlara taşıyor.

### K-SCAN Nasıl Çalışır?
1. Akıllı lens saç derisine nazikçe temas ettirilerek 100 kat büyütmeli fotoğraflar çekilir.
2. Yapay zeka algoritması; saç derisi sebum dengesi, kepek durumu, saç kökü yoğunluğu ve tel çapını anında analiz eder.
3. Size özel hazırlanmış dijital teşhis raporu ve kişiselleştirilmiş Fusio-Dose kokteyl reçetesi oluşturulur.

Salonumuzda randevunuz öncesinde ücretsiz K-SCAN analizi talep edebilirsiniz!
    `,
    category: 'Yapay Zeka & Teknoloji',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop',
    author: 'BK Kuaför Ar-Ge Ekibi',
    date: '2026-05-02',
    readTime: '3 dk',
    tags: ['K-Scan', 'Yapay Zeka', 'Saç Teşhisi', 'Akıllı Teknoloji']
  },
  {
    id: 'blog-4',
    title: 'Solaryum ile Sağlıklı ve Kalıcı Bronzluk Rehberi: Nelere Dikkat Edilmeli?',
    slug: 'solaryum-ile-saglikli-ve-kalici-bronzluk-rehberi',
    excerpt: 'Solaryum seansları nasıl planlanmalı? Cilt tipine göre seans süreleri, koruyucu bronzlaştırıcı kremler ve kalıcı bronzluk tüyoları.',
    content: `
# Altın Tonlu Işıltılı Ten: Solaryumda Doğru Seans Planlaması

Doğru ve kontrollü solaryum kullanımı, cilde eşit dağılmış, parlak ve kalıcı bir bronzluk kazandırır.

### İpuçları ve Öneriler:
- **Cilt Tipinize Göre Başlayın:** Açık tenliyseniz ilk seanslar 5-8 dakika ile başlamalı, kademeli olarak artırılmalıdır.
- **Özel Solaryum Losyonları:** Güneş kremleri yerine özel solaryum hızlandırıcı losyonlar melanin üretimini tetikleyerek daha hızlı ve homojen bronzluk sağlar.
- **Seans Sonrası Nemlendirme:** Seans sonrasında hyalüronik asit veya aloe vera içerikli vücut losyonları ile cildin nem dengesini korumak bronzluğun ömrünü uzatır.

Salonumuzda dakika başı 50 TL avantajlı solaryum kabinlerimiz her seans sonrası medikal dezenfeksiyon standartlarında temizlenmektedir.
    `,
    category: 'Solaryum & Bronzluk',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    author: 'Derya Kaya (Estetisyen)',
    date: '2026-04-28',
    readTime: '4 dk',
    tags: ['Solaryum', 'Bronzluk', 'Cilt Bakımı', 'Güzellik']
  },
  {
    id: 'blog-5',
    title: '2026 Gelin Başı ve Porselen Makyaj Trendleri',
    slug: '2026-gelin-basi-ve-porselen-makyaj-trendleri',
    excerpt: 'Düğün gününüzde kusursuz görünmenin sırları. Doğal dalgalı açık gelin saçları, soft glam porselen makyaj ve prova süreci.',
    content: `
# Rüyalarınızdaki Gelin Görünümü: 2026 Trendleri

2026 gelinlerinde sadelik, zarafet ve tenin doğal ışıltısını ön plana çıkaran soft porselen makyajlar zirvede.

### Gelin Saçı Trendleri:
- **Zarif Dağınık Ense Topuzları:** Çiçek veya inci detaylı ince tokalarla tamamlanan romantik modeller.
- **Hollywood Dalgaları:** Duvakla mükemmel uyum sağlayan hacimli ve parlak açık saç modelleri.

### Suya Dayanıklı Porselen Makyaj:
Ağlamaya, dans etmeye ve sıcak havaya karşı 18 saat dayanıklı Kryolan ve MAC profesyonel sabitleme teknikleri ile teniniz gün boyu pürüzsüz kalır.
    `,
    category: 'Gelin & Makyaj',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
    author: 'Büşra Çetin (Vizajist)',
    date: '2026-04-20',
    readTime: '4 dk',
    tags: ['Gelin Başı', 'Porselen Makyaj', 'Düğün Saçı', '2026 Trendleri']
  },
  {
    id: 'blog-6',
    title: 'Medikal Kuru Manikür ve Kalıcı Oje ile Sağlıklı Tırnaklar',
    slug: 'medikal-kuru-manikur-ve-kalici-oje',
    excerpt: 'Freze cihazı ile yapılan kuru manikürün klasik maniküre göre avantajları ve kalıcı ojenin tırnak sağlığına etkileri.',
    content: `
# Tırnak Sanatında Yeni Standart: Freze Cihazı ile Medikal Kuru Manikür

Su kullanmadan özel elmas freze başlıkları ile uygulanan kuru manikür tekniği, tırnak etlerini yıpratmadan pürüzsüzleştirir ve kalıcı ojenin ömrünü 4 haftaya kadar uzatır.
    `,
    category: 'El & Ayak Bakımı',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop',
    author: 'Derya Kaya (Nail Artist)',
    date: '2026-04-12',
    readTime: '3 dk',
    tags: ['Manikür', 'Kalıcı Oje', 'Nail Art', 'Medikal Bakım']
  }
];

export const INITIAL_WEB_CONTENT: WebContent = {
  heroTagline: 'Zarafet, Lüks & Ümraniye / Çekmeköy Sağlam Saç Bakımı',
  heroTitle: 'BK Kuaför & Beauty | Ümraniye & Çekmeköy Kuaför ve Kérastase Salonu',
  heroDescription: 'BK Kuaför & Beauty; Ümraniye ve Çekmeköy bölgelerinde yetkili Kérastase Paris bakım ritüelleri, güvenli ombre ve balayaj, saç kaynağı, makyaj ve özel bakım hizmetleriyle doğal, zarif ve uzun ömürlü sonuçlar sunar.',
  heroButtonPrimary: 'ONLINE RANDEVU AL',
  heroButtonSecondary: 'KÉRASTASE ÜRÜNLERİ',
  heroImgLabelTop: 'Lüks Salon & Kérastase Portalı',
  heroImgLabelBottom: 'BK Kuaför & Beauty Lounge',
  heroImgUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
  
  features: [
    { title: 'Kérastase Yetkili Salonu', desc: 'Fransız lüks saç ritüelleri ve yapay zeka destekli K-SCAN saç analizi.' },
    { title: 'KVKK Uyumlu Güvenli Randevu', desc: 'Telefon numarası gerekmeden benzersiz takip kodu ile anında online rezervasyon.' },
    { title: '2026 Resmi Fiyat Güvencesi', desc: 'İstanbul Kadın Kuaförleri Odası tarifesine uygun şeffaf ve esnek fiyatlandırma.' }
  ],
  
  showcaseSubtitle: '2026 Menü Seçkisi',
  showcaseTitle: 'Öne Çıkan Hizmet ve Bakımlarımız',
  
  stylistsSubtitle: 'Sanatçılarımız',
  stylistsTitle: 'Kusursuz Makası Kullanan Usta Eller',
  stylistsDesc: 'Uluslararası akademilerden ödüllü uzman vizajist, renklendirme direktörü ve baş stilistlerimizle tanışın.',
  
  reviewsSubtitle: 'Misafir Deneyimi',
  reviewsTitle: 'Danışanlarımız BK Kuaför Hakkında Ne Dedi?',
  
  faqSubtitle: 'Sıkça Sorulanlar | Ümraniye & Çekmeköy',
  faqTitle: 'Kuaför, Saç Bakımı ve Kérastase Hakkında Sıkça Sorulanlar',
  faqs: [
    {
      q: 'Ümraniye ve Çekmeköy’de ombre ve açma boyama güvenli şekilde yapılır mı?',
      a: 'Evet. BK Kuaför & Beauty’de saç yapısı, mevcut ton seviyesi ve önceki renk işlemleri dikkate alınarak ombre ve açma boyama uygulamaları planlanır. Saçın doğal görünümünü koruyan teknikler ve bakım ürünleriyle daha sağlıklı ve estetik sonuçlar elde edilir.'
    },
    {
      q: 'Ümraniye ve Çekmeköy’de doğal saç kaynağı yaptırabilir miyim?',
      a: 'Kesinlikle. Saç kaynağı işlemleri yüz hatlarına ve saç yoğunluğuna göre kişiye özel tasarlanır. Doğal, pürüzsüz ve estetik bir geçiş elde etmek için saç yapısına uygun teknik ve renk dengesi belirlenir.'
    },
    {
      q: 'Kérastase bakım hizmeti alabilir miyim?',
      a: 'Evet. Kérastase bakım hizmetleri saç analizi sonrası uygun ürün ve teknik kombinasyonu ile uygulamaya alınır. Yıpranmış, renklendirilmiş veya cansız saçlar için etkili bir bakım çözümüdür.'
    },
    {
      q: 'Gelin saç ve makyaj için randevu alabilir miyim?',
      a: 'Evet. Özel etkinlikler için gelin saç ve makyaj hizmetleri önceden planlanır. Stil, yüz yapısı ve etkinlik konsepti doğrultusunda kişiye özel bir uygulama süreci oluşturulur.'
    },
    {
      q: 'Solaryum ve özel bakım hizmetleri fiyatları nasıl belirleniyor?',
      a: 'Fiyatlar uygulama süresi, kullanılan ürünler ve kişisel bakım ihtiyaçlarına göre belirlenir. BK Kuaför & Beauty’de şeffaf fiyatlandırma ve kişiye özel seçenekler sunulmaktadır.'
    }
  ],
  
  gallerySubtitle: 'Çalışmalarımız & Değişimler | Ümraniye / Çekmeköy',
  galleryTitle: 'BK Kuaför Sanat Galerisi & Salon Portföyü',
  experienceYears: 20,
  topStripExperienceText: '20 Yıllık Tecrübe',
  topStripLocationText: 'Ümraniye & Çekmeköy',
  bookingSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  galleryItems: [
    {
      title: 'Küllü Sarı Balyaj & Cila',
      src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop',
      mediaType: 'image'
    },
    {
      title: 'Tasarım Bob Kesim',
      src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=900&auto=format&fit=crop',
      mediaType: 'image'
    },
    {
      title: 'Porselen Gelin Makyajı',
      src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=900&auto=format&fit=crop',
      mediaType: 'image'
    },
    {
      title: 'Salon Medya Hikâyesi',
      src: 'https://images.unsplash.com/photo-1521590832167-7b5f1df8f0e6?q=80&w=900&auto=format&fit=crop',
      mediaType: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    },
    {
      title: 'Medikal Kuru Manikür & Jel Oje',
      src: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=900&auto=format&fit=crop',
      mediaType: 'image'
    },
    {
      title: 'Bakım Ritim Edit',
      src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop',
      mediaType: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ],
  
  footerPhone: '0(212) 243 20 20',
  footerWorkingHours: 'Pazartesi İzinli, Salı - Pazar: 09:00 - 19:30',
  footerCopyrightAndAddress: '© 2026 BK Kuaför & Beauty Lounge • İstanbul Kadın Kuaförleri Odası Üyesi.',
  
  // Brand & Location Customization with new Logo
  salonName: 'BK KUAFÖR & BEAUTY',
  salonSubtitle: 'Bayan Kuaförü & Kérastase Salonu',
  salonLogoUrl: '/bk-logo.jpg',
  salonDistrictCity: 'Beyoğlu, İstanbul',

  // Social Media Links
  socialLinks: {
    instagram: 'https://instagram.com/kerastase_official',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
    whatsapp: '+905334567890',
    xTwitter: 'https://x.com',
    pinterest: 'https://pinterest.com'
  },

  // WhatsApp and Google Maps
  whatsappNumber: '+905334567890',
  whatsappMessage: 'Merhaba BK Kuaför, randevu ve Kérastase bakımları hakkında bilgi almak istiyorum.',
  googleMapsIframeUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.684483758296!2d28.98687787654519!3d41.03698051759607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab765057f920f%3A0xbc4b5a371c6d66e7!2zR8O8bcxZ9zdXl1LCBCZXlvxJxsdS_EsHN0YW5idWw!5e0!3m2!1str!2str!4v1717900000000!5m2!1str!2str',
  googleMapsDirectionsUrl: 'https://maps.google.com/?q=Gümüşsuyu,Beyoğlu,İstanbul',
  salonAddressText: 'Gümüşsuyu Mahallesi, Sıraselviler Caddesi No:42, Beyoğlu, İstanbul'
};
