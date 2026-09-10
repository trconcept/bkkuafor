export interface SalonService {
  id: string;
  name: string;
  category: 'sac-kesim' | 'boyama' | 'perma-duzlestirme' | 'el-ayak' | 'agda' | 'bakim' | 'makyaj-gelin' | 'ozel-islemler';
  price: number;
  priceType?: 'fixed' | 'starting' | 'range' | 'custom' | 'free'; // 'Sabit' | 'Başlangıç' | 'Aralık' | 'Danışınız / Serbest'
  customPriceText?: string; // e.g. "50 ₺ / Dakika", "1.500 ₺ - SERBEST", "SERBEST"
  showPrice?: boolean; // Fiyat görünsün mü?
  duration: number; // in minutes
  image: string;
  description: string;
  features: string[]; // e.g., ["Bitkisel formül", "Keratin desteği", "Masaj dahil"]
}

export interface Stylist {
  id: string;
  name: string;
  role: string; // e.g., "Makyaj ve Gelin Saçı Uzmanı", "Baş Stilist"
  avatar: string;
  rating: number;
  reviewsCount: number;
  specialities: string[];
  availableSlots: string[]; // e.g., ["09:00", "10:00", "11:00", ...]
  isVisible?: boolean; // Web sayfasında gösterilsin mi?
}

export interface Appointment {
  id: string; // Unique tracking code e.g. BK-7492-K9
  trackingCode: string; // Benzersiz sorgulama kodu
  customerName: string;
  customerPhone?: string; // Public lookup responses redact this value; booking API requires it.
  customerEmail?: string;
  services: SalonService[];
  stylist: Stylist;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  totalPrice: number;
  priceNote?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface SalonReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  serviceCategory: string;
  replyText?: string;
  replied?: boolean;
  isVisible?: boolean;
}

export interface KerastaseProduct {
  id: string;
  name: string;
  series: string; // 'Chronologiste' | 'Première' | 'Elixir Ultime' | 'Nutritive' | 'Genesis' | 'Symbiose' | 'Blond Absolu' | 'Chroma Absolu' | 'Résistance' | 'Curl Manifesto' | 'Soleil' | 'Discipline' | 'Spécifique' | 'Densifique' | 'Fusio-Dose' | 'Genesis Homme' | 'K-Scan' | 'Diger';
  stepType: '1-banyo' | '2-durulanan' | '3-durulanmayan' | 'on-bakim' | 'salon-bakim' | 'cihaz' | 'diger';
  stepLabel: string; // e.g., '1. Saç Banyosu', '2. Durulanan Bakım', '3. Durulanmayan Bakım', 'Ön Bakım', 'Salon Özel Ritüeli', 'Yapay Zeka Cihazı'
  description: string;
  image?: string;
  size?: string; // e.g., '250 ml', '500 ml', '75 ml', '10*6 ml'
  benefits?: string[];
  isFeatured?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
}

export interface SocialLinks {
  instagram?: string;
  instagramVisible?: boolean;
  facebook?: string;
  facebookVisible?: boolean;
  tiktok?: string;
  tiktokVisible?: boolean;
  youtube?: string;
  youtubeVisible?: boolean;
  whatsapp?: string;
  whatsappVisible?: boolean;
  xTwitter?: string;
  xTwitterVisible?: boolean;
  pinterest?: string;
  pinterestVisible?: boolean;
  linkedin?: string;
  linkedinVisible?: boolean;
}

export type ActiveSection = 'home' | 'services' | 'kerastase' | 'blog' | 'booking' | 'my-appointments' | 'gallery' | 'faq' | 'admin';

export interface AdminMessage {
  id: string;
  senderName: string;
  senderPhone: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replied?: boolean;
  replyText?: string;
}

export interface WebFeature {
  title: string;
  desc: string;
}

export interface WebFaq {
  q: string;
  a: string;
}

export interface WebGalleryItem {
  title: string;
  src: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
}

export interface WebContent {
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  heroButtonPrimary: string;
  heroButtonSecondary: string;
  heroImgLabelTop: string;
  heroImgLabelBottom: string;
  heroImgUrl: string;
  
  features: WebFeature[];
  
  showcaseSubtitle: string;
  showcaseTitle: string;
  
  stylistsSubtitle: string;
  stylistsTitle: string;
  stylistsDesc: string;
  
  reviewsSubtitle: string;
  reviewsTitle: string;
  
  faqSubtitle: string;
  faqTitle: string;
  faqs: WebFaq[];
  
  gallerySubtitle: string;
  galleryTitle: string;
  galleryItems: WebGalleryItem[];

  experienceYears?: number;
  topStripExperienceText?: string;
  topStripLocationText?: string;
  bookingSlots?: string[];
  
  footerPhone: string;
  footerWorkingHours: string;
  footerCopyrightAndAddress: string;
  
  // Brand & Location Customization
  salonName?: string;
  salonSubtitle?: string;
  salonLogoUrl?: string;
  salonDistrictCity?: string;

  // Social Media Links
  socialLinks?: SocialLinks;

  // WhatsApp and Google Maps integration variables
  whatsappNumber?: string;
  whatsappMessage?: string;
  googleMapsIframeUrl?: string;
  googleMapsDirectionsUrl?: string;
  salonAddressText?: string;
}
