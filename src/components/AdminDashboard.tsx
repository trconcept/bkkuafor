import { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Calendar, Scissors, Users, Plus, Check, X, CheckSquare, 
  Trash2, ShieldCheck, CreditCard, Search, Mail, MessageSquare, Star, 
  ToggleLeft, AlertTriangle, ChevronDown, Clock, UserCheck, Pencil,
  Image, Sparkles, MapPin, Upload, RefreshCw, Eye, BookOpen, Share2,
  Instagram, Facebook, Video, Twitter, Phone, HelpCircle, LayoutDashboard,
  LogOut, Menu, BellRing, Lock
} from 'lucide-react';
import { 
  SalonService, Stylist, Appointment, SalonReview, AdminMessage, 
  WebContent, KerastaseProduct, BlogPost, SocialLinks, WebFaq 
} from '../types';
import { normalizeTurkishMobilePhone } from '../utils/phone';
import { uploadAdminMedia } from '../utils/api';

interface AdminDashboardProps {
  services: SalonService[];
  stylists: Stylist[];
  appointments: Appointment[];
  reviews: SalonReview[];
  messages: AdminMessage[];
  webContent: WebContent;
  kerastaseProducts: KerastaseProduct[];
  blogPosts: BlogPost[];
  blockedPhones?: string[];
  notificationSettings?: { browser: boolean; sound: boolean };
  onUpdateNotifications?: (settings: { browser: boolean; sound: boolean }) => void;
  onUpdateAppointments: (appointments: Appointment[]) => void;
  onUpdateServices: (services: SalonService[]) => void;
  onUpdateStylists: (stylists: Stylist[]) => void;
  onUpdateMessages: (messages: AdminMessage[]) => void;
  onUpdateReviews: (reviews: SalonReview[]) => void;
  onUpdateWebContent: (content: WebContent) => void;
  onUpdateKerastaseProducts: (products: KerastaseProduct[]) => void;
  onUpdateBlogPosts: (posts: BlogPost[]) => void;
  onUpdateBlockedPhones?: (phones: string[]) => void;
  onChangeAdminPassword?: (currentPassword: string, nextPassword: string) => Promise<boolean> | boolean;
  onLogout?: () => void;
}

export default function AdminDashboard({
  services,
  stylists,
  appointments,
  reviews,
  messages,
  webContent,
  kerastaseProducts,
  blogPosts,
  blockedPhones = [],
  notificationSettings,
  onUpdateNotifications,
  onUpdateAppointments,
  onUpdateServices,
  onUpdateStylists,
  onUpdateMessages,
  onUpdateReviews,
  onUpdateWebContent,
  onUpdateKerastaseProducts,
  onUpdateBlogPosts,
  onUpdateBlockedPhones,
  onChangeAdminPassword,
  onLogout,
}: AdminDashboardProps) {
   
  // Left Vertical Sidebar Active Tab state
  const [activeTab, setActiveTab] = useState<
    'appointments' | 'stats' | 'services' | 'kerastase' | 'blog' | 'social' | 'stylists' | 'messages' | 'reviews' | 'gallery' | 'faq' | 'content' | 'password'
  >('appointments');
  
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Search and status filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'cancelled'>('all');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

  const currentNotificationSettings = notificationSettings || { browser: true, sound: true };

  // Interactive inline creator forms visibility toggles
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [newKerastaseOpen, setNewKerastaseOpen] = useState(false);
  const [newBlogOpen, setNewBlogOpen] = useState(false);
  const [newStylistOpen, setNewStylistOpen] = useState(false);
  const [editingStylistId, setEditingStylistId] = useState<string | null>(null);
  const [stylistReplyDrafts, setStylistReplyDrafts] = useState<Record<string, string>>({});
  const [reviewReplyDrafts, setReviewReplyDrafts] = useState<Record<string, string>>({});
  const [blockedPhoneInput, setBlockedPhoneInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showNewPasswordField, setShowNewPasswordField] = useState(false);
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);

  const normalizeBlockedPhone = (value: string) => normalizeTurkishMobilePhone(value);

  const formatPhoneDisplay = (value?: string) => {
    const normalized = normalizeBlockedPhone(value || '');
    if (!normalized) return 'Belirtilmedi';

    const digits = normalized.startsWith('90') ? normalized.slice(2) : normalized;
    if (digits.length === 10) {
      return `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }

    if (digits.length === 9) {
      return `+90 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
    }

    return `+${normalized}`;
  };

  const handleAddBlockedPhone = () => {
    const normalized = normalizeBlockedPhone(blockedPhoneInput);
    if (!normalized) {
      alert('Engellenecek telefon numarasını girin.');
      return;
    }

    const hasExisting = blockedPhones.some((phone) => normalizeBlockedPhone(phone) === normalized);
    if (hasExisting) {
      alert('Bu numara zaten engellenmiş listede mevcut.');
      return;
    }

    onUpdateBlockedPhones?.([...blockedPhones, normalized]);
    setBlockedPhoneInput('');
  };

  const handleRemoveBlockedPhone = (phone: string) => {
    const normalizedPhone = normalizeBlockedPhone(phone);
    onUpdateBlockedPhones?.(blockedPhones.filter((blocked) => normalizeBlockedPhone(blocked) !== normalizedPhone));
  };

  const handleChangeAdminPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);

    if (!currentPassword.trim() || !newPassword.trim() || !newPasswordConfirm.trim()) {
      setPasswordChangeMessage({ type: 'error', text: 'Eski şifre, yeni şifre ve tekrar alanları zorunludur.' });
      return;
    }

    if (newPassword.length < 12) {
      setPasswordChangeMessage({ type: 'error', text: 'Yeni şifre en az 12 karakter olmalıdır.' });
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordChangeMessage({ type: 'error', text: 'Yeni şifre ile tekrar alanı eşleşmiyor.' });
      return;
    }

    if (!onChangeAdminPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'Şifre güncelleme fonksiyonu mevcut değil.' });
      return;
    }

    try {
      const success = await onChangeAdminPassword(currentPassword, newPassword);
      if (success) {
        setPasswordChangeMessage({ type: 'success', text: 'Yönetici şifresi başarıyla güncellendi.' });
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      } else {
        setPasswordChangeMessage({ type: 'error', text: 'Eski şifre hatalı veya yeni şifre geçersiz.' });
      }
    } catch {
      setPasswordChangeMessage({ type: 'error', text: 'Şifre güncelleme sırasında bir hata oluştu.' });
    }
  };

  const findSlotConflict = (candidate: Pick<Appointment, 'date' | 'timeSlot' | 'stylist' | 'status'>, ignoreId?: string) => {
    return appointments.find((app) => {
      if (app.id === ignoreId) return false;
      if (app.status === 'cancelled') return false;
      if (!['pending', 'approved'].includes(app.status)) return false;
      return app.date === candidate.date && app.timeSlot === candidate.timeSlot && app.stylist.id === candidate.stylist.id;
    });
  };

  const [styName, setStyName] = useState('');
  const [styRole, setStyRole] = useState('');
  const [styAvatar, setStyAvatar] = useState('');
  const [styRating, setStyRating] = useState<number>(4.8);
  const [styReviewsCount, setStyReviewsCount] = useState<number>(0);
  const [stySpecialities, setStySpecialities] = useState('');
  const [styVisible, setStyVisible] = useState(true);

  const [editStyName, setEditStyName] = useState('');
  const [editStyRole, setEditStyRole] = useState('');
  const [editStyAvatar, setEditStyAvatar] = useState('');
  const [editStyRating, setEditStyRating] = useState<number>(4.8);
  const [editStyReviewsCount, setEditStyReviewsCount] = useState<number>(0);
  const [editStySpecialities, setEditStySpecialities] = useState('');
  const [editStyVisible, setEditStyVisible] = useState(true);
  
  // -------------------------------------------------------------
  // HİZMET EKLE / DÜZENLE STATES
  // -------------------------------------------------------------
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState<SalonService['category']>('sac-kesim');
  const [srvPrice, setSrvPrice] = useState<number | string>(50);
  const [srvCustomPriceText, setSrvCustomPriceText] = useState('');
  const [srvShowPrice, setSrvShowPrice] = useState(true);
  const [srvDuration, setSrvDuration] = useState(45);
  const [srvDescription, setSrvDescription] = useState('');
  const [srvFeatures, setSrvFeatures] = useState('');
  const [srvImage, setSrvImage] = useState('');

  // Edit service states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editSrvName, setEditSrvName] = useState('');
  const [editSrvCategory, setEditSrvCategory] = useState<SalonService['category']>('sac-kesim');
  const [editSrvPrice, setEditSrvPrice] = useState<number | string>(0);
  const [editSrvCustomPriceText, setEditSrvCustomPriceText] = useState('');
  const [editSrvShowPrice, setEditSrvShowPrice] = useState(true);
  const [editSrvDuration, setEditSrvDuration] = useState(45);
  const [editSrvDescription, setEditSrvDescription] = useState('');
  const [editSrvFeatures, setEditSrvFeatures] = useState('');
  const [editSrvImage, setEditSrvImage] = useState('');
  const [bulkPriceVisibility, setBulkPriceVisibility] = useState<'unchanged' | 'show' | 'hide'>('unchanged');
  const [bulkCustomPriceText, setBulkCustomPriceText] = useState('');
  const [bulkApplyCustomPriceText, setBulkApplyCustomPriceText] = useState(false);

  // -------------------------------------------------------------
  // KÉRASTASE ÜRÜN EKLE / DÜZENLE STATES
  // -------------------------------------------------------------
  const [kpName, setKpName] = useState('');
  const [kpSeries, setKpSeries] = useState('Première');
  const [kpStepType, setKpStepType] = useState<KerastaseProduct['stepType']>('1-banyo');
  const [kpStepLabel, setKpStepLabel] = useState('1. Saç Banyosu');
  const [kpSize, setKpSize] = useState('250 ml');
  const [kpDescription, setKpDescription] = useState('');
  const [kpBenefits, setKpBenefits] = useState('');
  const [kpImage, setKpImage] = useState('');

  // Edit Kerastase states
  const [editingKpId, setEditingKpId] = useState<string | null>(null);
  const [editKpName, setEditKpName] = useState('');
  const [editKpSeries, setEditKpSeries] = useState('Première');
  const [editKpStepType, setEditKpStepType] = useState<KerastaseProduct['stepType']>('1-banyo');
  const [editKpStepLabel, setEditKpStepLabel] = useState('1. Saç Banyosu');
  const [editKpSize, setEditKpSize] = useState('');
  const [editKpDescription, setEditKpDescription] = useState('');
  const [editKpBenefits, setEditKpBenefits] = useState('');
  const [editKpImage, setEditKpImage] = useState('');

  // -------------------------------------------------------------
  // BLOG YAZISI EKLE / DÜZENLE STATES
  // -------------------------------------------------------------
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Renklendirme & Balyaj');
  const [blogAuthor, setBlogAuthor] = useState('Baş Stilist');
  const [blogReadTime, setBlogReadTime] = useState('4 dk');
  const [blogTags, setBlogTags] = useState('Balyaj, Saç Modası, Trendler');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');

  // Edit Blog states
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editBlogTitle, setEditBlogTitle] = useState('');
  const [editBlogCategory, setEditBlogCategory] = useState('Renklendirme & Balyaj');
  const [editBlogAuthor, setEditBlogAuthor] = useState('');
  const [editBlogReadTime, setEditBlogReadTime] = useState('');
  const [editBlogTags, setEditBlogTags] = useState('');
  const [editBlogExcerpt, setEditBlogExcerpt] = useState('');
  const [editBlogContent, setEditBlogContent] = useState('');
  const [editBlogImage, setEditBlogImage] = useState('');

  // -------------------------------------------------------------
  // SOSYAL MEDYA STATES
  // -------------------------------------------------------------
  const [socialInstagram, setSocialInstagram] = useState(webContent.socialLinks?.instagram || '');
  const [socialInstagramVisible, setSocialInstagramVisible] = useState(webContent.socialLinks?.instagramVisible !== false);
  const [socialFacebook, setSocialFacebook] = useState(webContent.socialLinks?.facebook || '');
  const [socialFacebookVisible, setSocialFacebookVisible] = useState(webContent.socialLinks?.facebookVisible !== false);
  const [socialTiktok, setSocialTiktok] = useState(webContent.socialLinks?.tiktok || '');
  const [socialTiktokVisible, setSocialTiktokVisible] = useState(webContent.socialLinks?.tiktokVisible !== false);
  const [socialYoutube, setSocialYoutube] = useState(webContent.socialLinks?.youtube || '');
  const [socialYoutubeVisible, setSocialYoutubeVisible] = useState(webContent.socialLinks?.youtubeVisible !== false);
  const [socialWhatsapp, setSocialWhatsapp] = useState(webContent.socialLinks?.whatsapp || webContent.whatsappNumber || '');
  const [socialWhatsappVisible, setSocialWhatsappVisible] = useState(webContent.socialLinks?.whatsappVisible !== false);
  const [socialXTwitter, setSocialXTwitter] = useState(webContent.socialLinks?.xTwitter || '');
  const [socialXTwitterVisible, setSocialXTwitterVisible] = useState(webContent.socialLinks?.xTwitterVisible !== false);
  const [socialPinterest, setSocialPinterest] = useState(webContent.socialLinks?.pinterest || '');
  const [socialPinterestVisible, setSocialPinterestVisible] = useState(webContent.socialLinks?.pinterestVisible !== false);
  const [socialLinkedin, setSocialLinkedin] = useState(webContent.socialLinks?.linkedin || '');
  const [socialLinkedinVisible, setSocialLinkedinVisible] = useState(webContent.socialLinks?.linkedinVisible !== false);

  // Manual booking states
  const [manCustName, setManCustName] = useState('');
  const [manCustPhone, setManCustPhone] = useState('');
  const [manDate, setManDate] = useState('');
  const [manTime, setManTime] = useState('11:00');
  const [manSelectedStylistId, setManSelectedStylistId] = useState('');
  const [manSelectedServiceIds, setManSelectedServiceIds] = useState<string[]>([]);

  // Brand states
  const [editedSalonName, setEditedSalonName] = useState(webContent.salonName || '');
  const [editedSalonSubtitle, setEditedSalonSubtitle] = useState(webContent.salonSubtitle || '');
  const [editedSalonLogoUrl, setEditedSalonLogoUrl] = useState(webContent.salonLogoUrl || '');
  const [editedSalonDistrictCity, setEditedSalonDistrictCity] = useState(webContent.salonDistrictCity || '');
  const [editedTopStripExperienceText, setEditedTopStripExperienceText] = useState(webContent.topStripExperienceText || '');
  const [editedTopStripLocationText, setEditedTopStripLocationText] = useState(webContent.topStripLocationText || '');
  const [editedBookingSlotsText, setEditedBookingSlotsText] = useState((webContent.bookingSlots || []).join(', '));

  // Content states
  const [editedHeroTagline, setEditedHeroTagline] = useState(webContent.heroTagline || '');
  const [editedHeroTitle, setEditedHeroTitle] = useState(webContent.heroTitle || '');
  const [editedHeroDesc, setEditedHeroDesc] = useState(webContent.heroDescription || '');
  const [editedHeroBtn1, setEditedHeroBtn1] = useState(webContent.heroButtonPrimary || '');
  const [editedHeroBtn2, setEditedHeroBtn2] = useState(webContent.heroButtonSecondary || '');
  const [editedHeroImgUrl, setEditedHeroImgUrl] = useState(webContent.heroImgUrl || '');

  const [editedExperienceYears, setEditedExperienceYears] = useState<number>(webContent.experienceYears || 20);
  const [editedFooterPhone, setEditedFooterPhone] = useState(webContent.footerPhone || '');
  const [editedFooterWorkingHours, setEditedFooterWorkingHours] = useState(webContent.footerWorkingHours || '');
  const [editedFooterCopyright, setEditedFooterCopyright] = useState(webContent.footerCopyrightAndAddress || '');

  const [editedWhatsappNumber, setEditedWhatsappNumber] = useState(webContent.whatsappNumber || '');
  const [editedWhatsappMessage, setEditedWhatsappMessage] = useState(webContent.whatsappMessage || '');
  const [editedGoogleMapsIframeUrl, setEditedGoogleMapsIframeUrl] = useState(webContent.googleMapsIframeUrl || '');
  const [editedGoogleMapsDirectionsUrl, setEditedGoogleMapsDirectionsUrl] = useState(webContent.googleMapsDirectionsUrl || '');
  const [editedSalonAddressText, setEditedSalonAddressText] = useState(webContent.salonAddressText || '');

  const [galleryTitleDraft, setGalleryTitleDraft] = useState(webContent.galleryTitle || '');
  const [gallerySubtitleDraft, setGallerySubtitleDraft] = useState(webContent.gallerySubtitle || '');
  const [galleryItemTitle, setGalleryItemTitle] = useState('');
  const [galleryItemSrc, setGalleryItemSrc] = useState('');
  const [galleryItemMediaType, setGalleryItemMediaType] = useState<'image' | 'video'>('image');
  const [galleryItemVideoUrl, setGalleryItemVideoUrl] = useState('');
  const [galleryEditIndex, setGalleryEditIndex] = useState<number | null>(null);
  const [galleryMediaUploading, setGalleryMediaUploading] = useState(false);

  const [faqTitleDraft, setFaqTitleDraft] = useState(webContent.faqTitle || '');
  const [faqSubtitleDraft, setFaqSubtitleDraft] = useState(webContent.faqSubtitle || '');
  const [faqDrafts, setFaqDrafts] = useState<WebFaq[]>(webContent.faqs || []);
  const [faqQuestionInput, setFaqQuestionInput] = useState('');
  const [faqAnswerInput, setFaqAnswerInput] = useState('');
  const [faqEditIndex, setFaqEditIndex] = useState<number | null>(null);

  // File Upload Helper
  const handleLogoFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    void readImageFile(e, setEditedSalonLogoUrl);
  };

  const readImageFile = async (e: ChangeEvent<HTMLInputElement>, onLoaded: (value: string) => void | Promise<void>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası seçin.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel boyutu 5MB üzerinde olmamalıdır.');
      return;
    }

    const image = new window.Image();
    image.onload = async () => {
      const maxWidth = 1000;
      const maxHeight = 750;
      const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        alert('Görsel işlenemedi. Lütfen farklı bir görsel deneyin.');
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        const result = await uploadAdminMedia(canvas.toDataURL('image/jpeg', 0.78));
        await onLoaded(result.url);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Görsel sunucuya yüklenemedi.');
      }
    };
    image.onerror = () => alert('Görsel okunamadı. Lütfen farklı bir dosya deneyin.');
    image.src = URL.createObjectURL(file);
  };

  // -------------------------------------------------------------
  // SERVICE ACTIONS
  // -------------------------------------------------------------
  const handleAddNewService = (e: FormEvent) => {
    e.preventDefault();
    if (!srvName.trim() || !srvDescription.trim()) {
      alert('Lütfen hizmet adı ve açıklamasını doldurunuz.');
      return;
    }

    const featureArray = srvFeatures ? srvFeatures.split(',').map((f) => f.trim()).filter(Boolean) : ['Özel Salon Hizmeti'];
    const numPrice = Number(srvPrice) || 0;

    let image = srvImage.trim();
    if (!image) {
      image = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop';
    }

    const newSrv: SalonService = {
      id: `srv-${Date.now()}`,
      name: srvName,
      category: srvCategory,
      price: numPrice,
      customPriceText: srvCustomPriceText.trim() || undefined,
      showPrice: srvShowPrice,
      duration: Number(srvDuration) || 45,
      image,
      description: srvDescription,
      features: featureArray
    };

    onUpdateServices([...services, newSrv]);
    setNewServiceOpen(false);
    
    setSrvName('');
    setSrvDescription('');
    setSrvFeatures('');
    setSrvCustomPriceText('');
    setSrvPrice(50);
    alert(`"${srvName}" hizmeti başarıyla eklendi.`);
  };

  const handleStartEditService = (srv: SalonService) => {
    setEditingServiceId(srv.id);
    setEditSrvName(srv.name);
    setEditSrvCategory(srv.category);
    setEditSrvPrice(srv.price);
    setEditSrvCustomPriceText(srv.customPriceText || '');
    setEditSrvShowPrice(srv.showPrice !== false);
    setEditSrvDuration(srv.duration);
    setEditSrvDescription(srv.description);
    setEditSrvFeatures((srv.features || []).join(', '));
    setEditSrvImage(srv.image || '');
  };

  const handleSaveEditedService = (e: FormEvent) => {
    e.preventDefault();
    if (!editingServiceId) return;

    const featureArray = editSrvFeatures 
      ? editSrvFeatures.split(',').map((f) => f.trim()).filter(Boolean) 
      : ['Özel Salon Hizmeti'];

    const updatedServices = services.map((s) => {
      if (s.id === editingServiceId) {
        return {
          ...s,
          name: editSrvName,
          category: editSrvCategory,
          price: Number(editSrvPrice) || 0,
          customPriceText: editSrvCustomPriceText.trim() || undefined,
          showPrice: editSrvShowPrice,
          duration: Number(editSrvDuration) || 45,
          description: editSrvDescription,
          features: featureArray,
          image: editSrvImage || s.image,
        };
      }
      return s;
    });

    onUpdateServices(updatedServices);
    setEditingServiceId(null);
    alert(`"${editSrvName}" hizmet paketi başarıyla güncellendi.`);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Bu hizmet paketini silmek istediğinizden emin misiniz?')) {
      onUpdateServices(services.filter((s) => s.id !== id));
    }
  };

  const handleBulkUpdatePrices = () => {
    if (bulkPriceVisibility === 'unchanged' && !bulkApplyCustomPriceText) {
      alert('Toplu uygulamak istediğiniz fiyat ayarını seçin.');
      return;
    }

    const updatedServices = services.map((service) => ({
      ...service,
      ...(bulkPriceVisibility === 'show' ? { showPrice: true } : {}),
      ...(bulkPriceVisibility === 'hide' ? { showPrice: false } : {}),
      ...(bulkApplyCustomPriceText
        ? { customPriceText: bulkCustomPriceText.trim() || undefined }
        : {}),
    }));

    onUpdateServices(updatedServices);
    setBulkPriceVisibility('unchanged');
    setBulkCustomPriceText('');
    setBulkApplyCustomPriceText(false);
    alert('Fiyat ayarları tüm hizmetlere uygulandı.');
  };

  // -------------------------------------------------------------
  // KÉRASTASE ACTIONS (Add, Edit, Delete)
  // -------------------------------------------------------------
  const handleAddNewKerastaseProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!kpName.trim() || !kpDescription.trim()) {
      alert('Lütfen ürün adını ve açıklamasını giriniz.');
      return;
    }

    const benefitsArray = kpBenefits ? kpBenefits.split(',').map((b) => b.trim()).filter(Boolean) : [];

    const newProd: KerastaseProduct = {
      id: `kp-${Date.now()}`,
      name: kpName,
      series: kpSeries,
      stepType: kpStepType,
      stepLabel: kpStepLabel,
      size: kpSize,
      image: kpImage.trim() || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
      description: kpDescription,
      benefits: benefitsArray,
      isFeatured: true
    };

    onUpdateKerastaseProducts([...kerastaseProducts, newProd]);
    setNewKerastaseOpen(false);

    setKpName('');
    setKpDescription('');
    setKpBenefits('');
    setKpImage('');
    alert(`"${kpName}" ürünü Kérastase kataloğuna eklendi.`);
  };

  const handleStartEditKerastaseProduct = (prod: KerastaseProduct) => {
    setEditingKpId(prod.id);
    setEditKpName(prod.name);
    setEditKpSeries(prod.series);
    setEditKpStepType(prod.stepType);
    setEditKpStepLabel(prod.stepLabel);
    setEditKpSize(prod.size || '');
    setEditKpDescription(prod.description);
    setEditKpBenefits((prod.benefits || []).join(', '));
    setEditKpImage(prod.image || '');
  };

  const handleSaveEditedKerastaseProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!editingKpId) return;

    const benefitsArray = editKpBenefits ? editKpBenefits.split(',').map((b) => b.trim()).filter(Boolean) : [];

    const updated = kerastaseProducts.map((p) => {
      if (p.id === editingKpId) {
        return {
          ...p,
          name: editKpName,
          series: editKpSeries,
          stepType: editKpStepType,
          stepLabel: editKpStepLabel,
          size: editKpSize,
          image: editKpImage || p.image,
          description: editKpDescription,
          benefits: benefitsArray
        };
      }
      return p;
    });

    onUpdateKerastaseProducts(updated);
    setEditingKpId(null);
    alert(`"${editKpName}" Kérastase ürünü güncellendi.`);
  };

  const handleDeleteKerastaseProduct = (id: string) => {
    if (window.confirm('Bu Kérastase ürününü silmek istediğinizden emin misiniz?')) {
      onUpdateKerastaseProducts(kerastaseProducts.filter((p) => p.id !== id));
    }
  };

  // -------------------------------------------------------------
  // BLOG ACTIONS (Add, Edit, Delete)
  // -------------------------------------------------------------
  const handleAddNewBlogPost = (e: FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) {
      alert('Lütfen makale başlığını ve içeriğini giriniz.');
      return;
    }

    const tagsArray = blogTags ? blogTags.split(',').map((t) => t.trim()).filter(Boolean) : ['Güzellik'];
    const slug = blogTitle.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/^-|-$/g, '');

    const newPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: blogTitle,
      slug,
      category: blogCategory,
      author: blogAuthor,
      date: new Date().toISOString().split('T')[0],
      readTime: blogReadTime,
      tags: tagsArray,
      excerpt: blogExcerpt.trim() || blogContent.substring(0, 150) + '...',
      content: blogContent,
      image: blogImage.trim() || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop'
    };

    onUpdateBlogPosts([newPost, ...blogPosts]);
    setNewBlogOpen(false);

    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogImage('');
    alert(`"${blogTitle}" blog makalesi başarıyla yayınlandı.`);
  };

  const handleStartEditBlogPost = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setEditBlogTitle(post.title);
    setEditBlogCategory(post.category);
    setEditBlogAuthor(post.author);
    setEditBlogReadTime(post.readTime);
    setEditBlogTags((post.tags || []).join(', '));
    setEditBlogExcerpt(post.excerpt);
    setEditBlogContent(post.content);
    setEditBlogImage(post.image);
  };

  const handleSaveEditedBlogPost = (e: FormEvent) => {
    e.preventDefault();
    if (!editingBlogId) return;

    const tagsArray = editBlogTags ? editBlogTags.split(',').map((t) => t.trim()).filter(Boolean) : ['Güzellik'];

    const updated = blogPosts.map((p) => {
      if (p.id === editingBlogId) {
        return {
          ...p,
          title: editBlogTitle,
          category: editBlogCategory,
          author: editBlogAuthor,
          readTime: editBlogReadTime,
          tags: tagsArray,
          excerpt: editBlogExcerpt,
          content: editBlogContent,
          image: editBlogImage || p.image
        };
      }
      return p;
    });

    onUpdateBlogPosts(updated);
    setEditingBlogId(null);
    alert(`"${editBlogTitle}" makalesi güncellendi.`);
  };

  const handleDeleteBlogPost = (id: string) => {
    if (window.confirm('Bu blog makalesini silmek istediğinizden emin misiniz?')) {
      onUpdateBlogPosts(blogPosts.filter((p) => p.id !== id));
    }
  };

  // -------------------------------------------------------------
  // SOSYAL MEDYA SAVE ACTION
  // -------------------------------------------------------------
  const handleSaveSocialLinks = (e: FormEvent) => {
    e.preventDefault();
    const updatedSocial: SocialLinks = {
      instagram: socialInstagram.trim() || undefined,
      instagramVisible: socialInstagramVisible,
      facebook: socialFacebook.trim() || undefined,
      facebookVisible: socialFacebookVisible,
      tiktok: socialTiktok.trim() || undefined,
      tiktokVisible: socialTiktokVisible,
      youtube: socialYoutube.trim() || undefined,
      youtubeVisible: socialYoutubeVisible,
      whatsapp: socialWhatsapp.trim() || undefined,
      whatsappVisible: socialWhatsappVisible,
      xTwitter: socialXTwitter.trim() || undefined,
      xTwitterVisible: socialXTwitterVisible,
      pinterest: socialPinterest.trim() || undefined,
      pinterestVisible: socialPinterestVisible,
      linkedin: socialLinkedin.trim() || undefined,
      linkedinVisible: socialLinkedinVisible,
    };

    const updatedWeb: WebContent = {
      ...webContent,
      socialLinks: updatedSocial,
      whatsappNumber: socialWhatsapp.trim() || webContent.whatsappNumber
    };

    onUpdateWebContent(updatedWeb);
    alert('Sosyal medya hesap bağlantılarınız başarıyla kaydedildi.');
  };

  const handleAddNewStylist = (e: FormEvent) => {
    e.preventDefault();
    if (!styName.trim() || !styRole.trim()) {
      alert('Lütfen personel adını ve görevini doldurun.');
      return;
    }

    const newStylist: Stylist = {
      id: `st-${Date.now()}`,
      name: styName.trim(),
      role: styRole.trim(),
      avatar: styAvatar.trim() || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop',
      rating: Number(styRating) || 4.8,
      reviewsCount: Number(styReviewsCount) || 0,
      specialities: stySpecialities.split(',').map((item) => item.trim()).filter(Boolean),
      availableSlots: ['09:00', '10:00', '11:00', '13:00', '15:00'],
      isVisible: styVisible,
    };

    onUpdateStylists([newStylist, ...stylists]);
    setNewStylistOpen(false);
    setStyName('');
    setStyRole('');
    setStyAvatar('');
    setStyRating(4.8);
    setStyReviewsCount(0);
    setStySpecialities('');
    setStyVisible(true);
    alert(`"${newStylist.name}" personeli eklendi.`);
  };

  const handleStartEditStylist = (stylist: Stylist) => {
    setEditingStylistId(stylist.id);
    setEditStyName(stylist.name);
    setEditStyRole(stylist.role);
    setEditStyAvatar(stylist.avatar);
    setEditStyRating(stylist.rating);
    setEditStyReviewsCount(stylist.reviewsCount);
    setEditStySpecialities((stylist.specialities || []).join(', '));
    setEditStyVisible(stylist.isVisible !== false);
  };

  const handleSaveEditedStylist = (e: FormEvent) => {
    e.preventDefault();
    if (!editingStylistId) return;

    const updated = stylists.map((stylist) => {
      if (stylist.id === editingStylistId) {
        return {
          ...stylist,
          name: editStyName.trim(),
          role: editStyRole.trim(),
          avatar: editStyAvatar.trim() || stylist.avatar,
          rating: Number(editStyRating) || stylist.rating,
          reviewsCount: Number(editStyReviewsCount) || stylist.reviewsCount,
          specialities: editStySpecialities.split(',').map((item) => item.trim()).filter(Boolean),
          isVisible: editStyVisible,
        };
      }
      return stylist;
    });

    onUpdateStylists(updated);
    setEditingStylistId(null);
    alert(`"${editStyName}" personeli güncellendi.`);
  };

  const handleDeleteStylist = (id: string) => {
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      onUpdateStylists(stylists.filter((stylist) => stylist.id !== id));
    }
  };

  const handleToggleStylistVisibility = (id: string) => {
    onUpdateStylists(stylists.map((stylist) => {
      if (stylist.id === id) {
        return { ...stylist, isVisible: stylist.isVisible !== false };
      }
      return stylist;
    }));
  };

  const handleSaveMessageReply = (messageId: string) => {
    const replyText = (stylistReplyDrafts[messageId] || '').trim();
    if (!replyText) {
      alert('Cevap metnini yazınız.');
      return;
    }

    const updated = messages.map((msg) => {
      if (msg.id === messageId) {
        return { ...msg, replied: true, replyText, read: true };
      }
      return msg;
    });

    onUpdateMessages(updated);
    setStylistReplyDrafts((prev) => ({ ...prev, [messageId]: '' }));
    alert('Mesaja cevap kaydedildi.');
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm('Bu danışan iletişimini silmek istediğinizden emin misiniz?')) {
      onUpdateMessages(messages.filter((message) => message.id !== id));
    }
  };

  const handleSaveReviewReply = (reviewId: string) => {
    const replyText = (reviewReplyDrafts[reviewId] || '').trim();
    if (!replyText) {
      alert('Yorum için cevap metni yazınız.');
      return;
    }

    const updated = reviews.map((review) => {
      if (review.id === reviewId) {
        return { ...review, replied: true, replyText, isVisible: review.isVisible !== false };
      }
      return review;
    });

    onUpdateReviews(updated);
    setReviewReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
    alert('Yorum cevaplandı.');
  };

  const handleDeleteReview = (id: string) => {
    if (window.confirm('Bu müşteri yorumunu silmek istediğinizden emin misiniz?')) {
      onUpdateReviews(reviews.filter((review) => review.id !== id));
    }
  };

  const handleToggleReviewVisibility = (id: string) => {
    onUpdateReviews(reviews.map((review) => {
      if (review.id === id) {
        return { ...review, isVisible: review.isVisible !== false };
      }
      return review;
    }));
  };

  // -------------------------------------------------------------
  // ALL CONTENT & SEO SAVE ACTION
  // -------------------------------------------------------------
  const handleSaveAllWebContent = (e: FormEvent) => {
    e.preventDefault();
    const updated: WebContent = {
      ...webContent,
      salonName: editedSalonName,
      salonSubtitle: editedSalonSubtitle,
      salonLogoUrl: editedSalonLogoUrl,
      salonDistrictCity: editedSalonDistrictCity,
      topStripExperienceText: editedTopStripExperienceText,
      topStripLocationText: editedTopStripLocationText,
      bookingSlots: editedBookingSlotsText
        .split(',')
        .map((slot) => slot.trim())
        .filter(Boolean)
        .map((slot) => slot.includes(':') ? slot : `${slot}:00`),

      heroTagline: editedHeroTagline,
      heroTitle: editedHeroTitle,
      heroDescription: editedHeroDesc,
      heroButtonPrimary: editedHeroBtn1,
      heroButtonSecondary: editedHeroBtn2,
      heroImgUrl: editedHeroImgUrl,

      experienceYears: Number(editedExperienceYears) || 20,
      
      footerPhone: editedFooterPhone,
      footerWorkingHours: editedFooterWorkingHours,
      footerCopyrightAndAddress: editedFooterCopyright,
      
      whatsappNumber: editedWhatsappNumber,
      whatsappMessage: editedWhatsappMessage,
      googleMapsIframeUrl: editedGoogleMapsIframeUrl,
      googleMapsDirectionsUrl: editedGoogleMapsDirectionsUrl,
      salonAddressText: editedSalonAddressText,
    };
    onUpdateWebContent(updated);
    alert('Site ayarları başarıyla kaydedildi.');
  };

  const handleSaveFaqList = () => {
    onUpdateWebContent({
      ...webContent,
      faqTitle: faqTitleDraft,
      faqSubtitle: faqSubtitleDraft,
      faqs: faqDrafts,
    });
    alert('SSS listesi güncellendi.');
  };

  const handleSaveFaqEntry = () => {
    const question = faqQuestionInput.trim();
    const answer = faqAnswerInput.trim();
    if (!question || !answer) {
      alert('Soru ve cevap alanları zorunludur.');
      return;
    }

    const entry: WebFaq = { q: question, a: answer };
    const updatedFaqs = faqEditIndex !== null
      ? faqDrafts.map((item, index) => index === faqEditIndex ? entry : item)
      : [...faqDrafts, entry];

    setFaqDrafts(updatedFaqs);
    setFaqQuestionInput('');
    setFaqAnswerInput('');
    setFaqEditIndex(null);
  };

  const handleDeleteFaqEntry = (index: number) => {
    setFaqDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleEditFaqEntry = (index: number) => {
    const item = faqDrafts[index];
    if (!item) return;
    setFaqQuestionInput(item.q);
    setFaqAnswerInput(item.a);
    setFaqEditIndex(index);
  };

  const handleGalleryItemFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      setGalleryMediaUploading(true);
      try {
        const result = await uploadAdminMedia(reader.result);
        setGalleryItemSrc(result.url);
        if (file.type.startsWith('video/')) setGalleryItemVideoUrl(result.url);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Galeri dosyası sunucuya yüklenemedi.');
      } finally {
        setGalleryMediaUploading(false);
      }
    };
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Lütfen görsel veya video dosyası seçin.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Görsel veya video 15MB üzerinde olmamalıdır.');
      return;
    }
    reader.readAsDataURL(file);
  };

  const handleSaveGalleryItem = (e: FormEvent) => {
    e.preventDefault();
    if (!galleryItemTitle.trim()) {
      alert('Galeri başlığı gerekli.');
      return;
    }
    if (galleryMediaUploading) {
      alert('Dosya yükleniyor. Lütfen tamamlanmasını bekleyin.');
      return;
    }
    if (galleryItemMediaType === 'video' && !galleryItemVideoUrl.trim()) {
      alert('Video için YouTube bağlantısı veya yüklenmiş video gereklidir.');
      return;
    }
    if (galleryItemMediaType === 'image' && !galleryItemSrc.trim()) {
      alert('Resim için görsel bağlantısı veya yüklenmiş görsel gereklidir.');
      return;
    }

    const normalizedItem = {
      title: galleryItemTitle.trim(),
      src: galleryItemSrc.trim() || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
      mediaType: galleryItemMediaType,
      videoUrl: galleryItemMediaType === 'video' ? (galleryItemVideoUrl.trim() || galleryItemSrc.trim() || undefined) : undefined,
    };

    const currentItems = [...(webContent.galleryItems || [])];
    const targetItems = galleryEditIndex !== null
      ? currentItems.map((item, index) => index === galleryEditIndex ? normalizedItem : item)
      : [...currentItems, normalizedItem];

    onUpdateWebContent({
      ...webContent,
      galleryItems: targetItems,
      galleryTitle: galleryTitleDraft,
      gallerySubtitle: gallerySubtitleDraft,
    });

    setGalleryItemTitle('');
    setGalleryItemSrc('');
    setGalleryItemVideoUrl('');
    setGalleryItemMediaType('image');
    setGalleryEditIndex(null);
    alert(galleryEditIndex !== null ? 'Galeri içeriği güncellendi.' : 'Galeri içeriği eklendi.');
  };

  const handleEditGalleryItem = (index: number) => {
    const item = webContent.galleryItems[index];
    if (!item) return;
    setGalleryEditIndex(index);
    setGalleryItemTitle(item.title);
    setGalleryItemSrc(item.src || '');
    setGalleryItemMediaType(item.mediaType || 'image');
    setGalleryItemVideoUrl(item.videoUrl || '');
  };

  const handleDeleteGalleryItem = (index: number) => {
    if (!window.confirm('Bu galeri içeriğini silmek istediğinizden emin misiniz?')) return;
    const updated = (webContent.galleryItems || []).filter((_, idx) => idx !== index);
    onUpdateWebContent({ ...webContent, galleryItems: updated });
  };

  // Calculations
  const totalEarnings = appointments
    .filter((a) => a.status === 'approved' || a.status === 'completed')
    .reduce((curr, a) => curr + (a.totalPrice || 0), 0);

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyAppointments = appointments.filter((appointment) => {
    if (!appointment.date) return false;
    const appointmentDate = new Date(`${appointment.date}T00:00:00`);
    return appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear;
  });

  const yearlyAppointments = appointments.filter((appointment) => {
    if (!appointment.date) return false;
    const appointmentDate = new Date(`${appointment.date}T00:00:00`);
    return appointmentDate.getFullYear() === currentYear;
  });

  const monthlyCompletedJobs = monthlyAppointments.filter((appointment) => appointment.status === 'completed').length;
  const yearlyCompletedJobs = yearlyAppointments.filter((appointment) => appointment.status === 'completed').length;
  const monthlyEarnings = monthlyAppointments
    .filter((appointment) => appointment.status === 'approved' || appointment.status === 'completed')
    .reduce((sum, appointment) => sum + (appointment.totalPrice || 0), 0);
  const yearlyEarnings = yearlyAppointments
    .filter((appointment) => appointment.status === 'approved' || appointment.status === 'completed')
    .reduce((sum, appointment) => sum + (appointment.totalPrice || 0), 0);

  const statsRows = [...appointments].sort((a, b) => {
    const aKey = `${a.date || '0000-00-00'}T${a.timeSlot || '00:00'}`;
    const bKey = `${b.date || '0000-00-00'}T${b.timeSlot || '00:00'}`;
    return bKey.localeCompare(aKey);
  });

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'approved': return 'Onaylandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const code = (app.trackingCode || app.id).toLowerCase();
    const matchesQuery = app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         code.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const repeatedPhoneRiskEntries = Object.entries(
    appointments.reduce<Record<string, number>>((acc, app) => {
      const normalized = normalizeBlockedPhone(app.customerPhone || '');
      if (!normalized) return acc;
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {})
  )
    .filter(([, count]) => count > 1)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3);

  const sortedAppointments = [...appointments].sort((a, b) => {
    const aKey = `${a.date}T${a.timeSlot || '00:00'}`;
    const bKey = `${b.date}T${b.timeSlot || '00:00'}`;
    return aKey.localeCompare(bKey);
  });

  const appointmentsByDate = sortedAppointments.reduce<Record<string, Appointment[]>>((acc, app) => {
    if (!app.date) return acc;
    acc[app.date] = [...(acc[app.date] || []), app];
    return acc;
  }, {});

  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  const firstDayIndex = (monthStart.getDay() + 6) % 7;
  const totalDaysInMonth = monthEnd.getDate();
  const calendarDays: Array<Date | null> = [];

  const prevMonthDaysCount = firstDayIndex;
  const prevMonthLastDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 0).getDate();
  for (let i = prevMonthDaysCount - 1; i >= 0; i -= 1) {
    calendarDays.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, prevMonthLastDate - i));
  }

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    calendarDays.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
  }

  while (calendarDays.length % 7 !== 0) {
    const nextIndex = calendarDays.length - (totalDaysInMonth + prevMonthDaysCount) + 1;
    calendarDays.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, nextIndex));
  }

  const toLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calendarLabel = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(monthStart);

  const selectedWeekDates = (() => {
    const weekBase = new Date(calendarSelectedDate + 'T00:00:00');
    const day = weekBase.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(weekBase);
    start.setDate(weekBase.getDate() + diff);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  })();

  const openEditingAppointment = (app: Appointment) => {
    setEditingAppointmentId(app.id);
    setManCustName(app.customerName);
    setManCustPhone(app.customerPhone || '');
    setManDate(app.date);
    setManTime(app.timeSlot);
    setManSelectedStylistId(app.stylist.id);
    setManSelectedServiceIds(app.services.map((item) => item.id));
    setStatusFilter(app.status);
  };

  const handleSaveAppointmentEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingAppointmentId) return;

    const matchedStylist = stylists.find((s) => s.id === manSelectedStylistId) || stylists[0];
    const matchedServices = services.filter((s) => manSelectedServiceIds.includes(s.id));

    if (!manCustName.trim() || !manCustPhone.trim() || !manDate || !manSelectedStylistId || matchedServices.length === 0) {
      alert('Lütfen müşteri adı, telefon, tarih, stilist ve en az bir hizmet seçimini doldurun.');
      return;
    }

    const candidate = {
      date: manDate,
      timeSlot: manTime,
      stylist: matchedStylist,
      status: statusFilter === 'all' ? 'approved' : statusFilter,
    } as Pick<Appointment, 'date' | 'timeSlot' | 'stylist' | 'status'>;

    const conflict = findSlotConflict(candidate, editingAppointmentId);
    if (conflict) {
      alert(`Bu saat için ${conflict.stylist.name} uzmanına ait ${conflict.date} ${conflict.timeSlot} randevusu zaten mevcut. Farklı bir saat seçiniz.`);
      return;
    }

    const updated = appointments.map((app) => {
      if (app.id !== editingAppointmentId) return app;
      return {
        ...app,
        customerName: manCustName.trim(),
        customerPhone: manCustPhone.trim() || undefined,
        stylist: matchedStylist,
        services: matchedServices,
        date: manDate,
        timeSlot: manTime,
        totalPrice: matchedServices.reduce((sum, item) => sum + item.price, 0),
        status: statusFilter === 'all' ? app.status : statusFilter,
      };
    });

    onUpdateAppointments(updated);
    setEditingAppointmentId(null);
    setManCustName('');
    setManCustPhone('');
    setManDate('');
    setManTime('11:00');
    setManSelectedStylistId('');
    setManSelectedServiceIds([]);
    alert('Randevu başarıyla güncellendi.');
  };

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'completed' | 'cancelled') => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    if (newStatus === 'approved') {
      const conflict = findSlotConflict(target, id);
      if (conflict) {
        alert(`Bu saat için ${conflict.stylist.name} uzmanına ait ${conflict.date} ${conflict.timeSlot} randevusu zaten mevcut. Önce mevcut randevuyu kontrol edin.`);
        return;
      }
    }

    const updated = appointments.map((a) => 
      a.id === id ? { ...a, status: newStatus } : a
    );
    onUpdateAppointments(updated);
  };

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Bu randevu kaydını silmek istediğinizden emin misiniz?')) {
      onUpdateAppointments(appointments.filter((a) => a.id !== id));
    }
  };

  const handleManualBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manCustName.trim() || !manCustPhone.trim() || !manDate || !manSelectedStylistId || manSelectedServiceIds.length === 0) {
      alert('Lütfen müşteri adı, telefon numarası, tarih, stilist ve en az bir hizmet alanını doldurun.');
      return;
    }

    const matchedStylist = stylists.find((s) => s.id === manSelectedStylistId) || stylists[0];
    const matchedServices = services.filter((s) => manSelectedServiceIds.includes(s.id));
    const totalPrice = matchedServices.reduce((acc, s) => acc + s.price, 0);

    const candidate = {
      date: manDate,
      timeSlot: manTime,
      stylist: matchedStylist,
      status: 'approved' as const,
    };

    const conflict = findSlotConflict(candidate);
    if (conflict) {
      alert(`Bu saat için ${conflict.stylist.name} uzmanına ait ${conflict.date} ${conflict.timeSlot} randevusu zaten mevcut. Lütfen farklı bir zaman seçin.`);
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `BK-${randomNum}-ADM`;

    const newApp: Appointment = {
      id: trackingCode,
      trackingCode,
      customerName: manCustName,
      customerPhone: manCustPhone.trim() || undefined,
      services: matchedServices,
      stylist: matchedStylist,
      date: manDate,
      timeSlot: manTime,
      totalPrice,
      status: 'approved',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdateAppointments([newApp, ...appointments]);
    setManualBookingOpen(false);
    setManCustName('');
    setManCustPhone('');
    setManDate('');
    setManSelectedServiceIds([]);
    alert(`Randevu ${trackingCode} koduyla başarıyla takvime eklendi.`);
  };

  const sidebarNavItems = [
    { id: 'appointments', label: 'Randevu Takvimi', count: pendingAppointments.length, icon: <Calendar className="h-4 w-4" /> },
    { id: 'stats', label: 'İstatistikler', count: 0, icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'services', label: 'Fiyat Tarifesi & Hizmetler', count: services.length, icon: <Scissors className="h-4 w-4" /> },
    { id: 'kerastase', label: 'KÉRASTASE Kataloğu', count: kerastaseProducts.length, icon: <Sparkles className="h-4 w-4 text-[#dfa069]" /> },
    { id: 'blog', label: 'Blog Yönetimi', count: blogPosts.length, icon: <BookOpen className="h-4 w-4" /> },
    { id: 'social', label: 'Sosyal Medya Ayarları', count: 0, icon: <Share2 className="h-4 w-4" /> },
    { id: 'stylists', label: 'Personel & Stilistler', count: stylists.length, icon: <Users className="h-4 w-4" /> },
    { id: 'messages', label: 'Danışan Mesajları', count: messages.filter((m) => !m.read).length, icon: <Mail className="h-4 w-4" /> },
    { id: 'reviews', label: 'Müşteri Yorumları', count: reviews.length, icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'gallery', label: 'Galeri Yönetimi', count: (webContent.galleryItems || []).length, icon: <Image className="h-4 w-4" /> },
    { id: 'faq', label: 'SSS Yönetimi', count: (webContent.faqs || []).length, icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'content', label: 'Site Marka Kimliği & SEO', count: 0, icon: <ToggleLeft className="h-4 w-4" /> },
    { id: 'password', label: 'Şifre Değiştir', count: 0, icon: <Lock className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 lg:flex-row lg:gap-3 min-h-[750px] relative px-1 sm:px-2" id="admin-portal-wrapper">
      
      {/* 1. MODERN VERTICAL SIDEBAR MENU */}
      <aside className="w-full lg:w-64 bg-[#0d0d10] text-white rounded-2xl p-3 border border-[#222228] shadow-2xl flex flex-col justify-between shrink-0" id="admin-vertical-sidebar">
        
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222228] pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-black border border-[#dfa069]/40 flex items-center justify-center">
                <img src={webContent.salonLogoUrl || '/bk-logo.jpg'} alt="Logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="font-sans font-black text-sm text-white truncate max-w-36">
                  {webContent.salonName || "BK KUAFÖR"}
                </h3>
                <span className="text-[9px] font-mono text-[#dfa069] uppercase font-bold block">
                  Yönetim Portalı
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
              className="lg:hidden p-1.5 rounded-lg bg-[#1a1a22] text-gray-400"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className={`space-y-1.5 ${sidebarOpenMobile ? 'block' : 'hidden lg:block'}`} id="sidebar-nav-links">
            {sidebarNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black shadow-lg shadow-[#dfa069]/10'
                      : 'text-gray-400 hover:text-white hover:bg-[#181820]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black ${
                      isActive ? 'bg-black text-[#ebd6b8]' : 'bg-[#22222a] text-[#dfa069]'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#222228] mt-6 space-y-3">
          <div className="bg-[#16161e] p-3 rounded-2xl border border-gray-800 flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-[#dfa069]/20 text-[#dfa069] flex items-center justify-center font-bold text-xs">
              ADM
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">Süper Yönetici</span>
              <span className="text-[9px] text-[#4ade80] font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                Aktif Oturum
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Güvenli Çıkış</span>
            </button>
          )}
        </div>

      </aside>

      {/* 2. MAIN CONTENT VIEWPORT */}
      <div className="flex-1 space-y-4 min-w-0" id="admin-main-viewport">
        
        {/* TAB 1: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h3 className="font-sans font-black text-xl text-gray-950">Randevu Takvimi & Onayları</h3>
                <p className="text-xs text-gray-500 mt-0.5">Müşteri takip kodları ile gelen rezervasyonları yönetin.</p>
              </div>
            </div>

            {pendingAppointments.length > 0 && (
              <div className="flex justify-end">
                <div className="inline-flex items-center gap-3 rounded-full border border-[#f2c7a8] bg-gradient-to-r from-[#fff4ec] via-[#fffaf7] to-[#f9e9df] px-3.5 py-1.75 shadow-[0_12px_28px_rgba(180,84,41,0.12)] ring-1 ring-[#e9b998]/70">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#0f0f11] text-[#f7d7a6] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                    <BellRing className="h-4 w-4" />
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[8px] font-black text-white leading-none shadow-sm ring-2 ring-[#fff4ec]">
                      {pendingAppointments.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#a06b3e]" />
                    <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#7a4d2a]">
                      Yeni Randevu
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#efe2d1] bg-[#fffdfb] p-3 shadow-[0_10px_20px_rgba(15,15,17,0.03)] space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#a06b3e]">Engellenen numaralar</span>
                    <h4 className="mt-1 font-sans text-sm font-black text-gray-950">Sahte randevu ve tekrarlayan talepler</h4>
                  </div>
                  <div className="flex w-full max-w-md gap-2">
                    <input
                      type="tel"
                      value={blockedPhoneInput}
                      onChange={(e) => setBlockedPhoneInput(e.target.value)}
                      placeholder="0505 123 45 67"
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddBlockedPhone}
                      className="rounded-xl bg-[#0f0f11] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-[#dfa069] hover:text-[#0f0f11] transition-all cursor-pointer"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {repeatedPhoneRiskEntries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {repeatedPhoneRiskEntries.map(([phone, count]) => (
                      <span
                        key={phone}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700"
                      >
                        Risk: {formatPhoneDisplay(phone)} ({count} kez)
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {blockedPhones.length === 0 ? (
                    <span className="text-[10px] text-gray-500">Henüz engellenmiş numara yok.</span>
                  ) : (
                    blockedPhones.map((phone) => (
                      <button
                        key={phone}
                        type="button"
                        onClick={() => handleRemoveBlockedPhone(phone)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-700 transition-all hover:bg-red-100 cursor-pointer"
                      >
                        <span>{formatPhoneDisplay(phone)}</span>
                        <span>×</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ad veya Takip Kodu ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="pending">Onay Bekleyenler</option>
                  <option value="approved">Onaylananlar</option>
                  <option value="completed">Tamamlananlar</option>
                  <option value="cancelled">İptal Edilenler</option>
                </select>

                <button
                  onClick={() => setManualBookingOpen(!manualBookingOpen)}
                  className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 font-black text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Manuel Randevu Ekle</span>
                </button>
              </div>
            </div>

            {/* Manual Form */}
            <AnimatePresence>
              {manualBookingOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-[#dfa069]/30 bg-amber-50/20 rounded-2xl p-5 overflow-hidden"
                >
                  <form onSubmit={handleManualBookingSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                    <div className="sm:col-span-3 font-sans font-black text-sm text-[#a06b3e] border-b border-amber-200/50 pb-2">
                      Telefonla / Doğrudan Randevu Kaydı
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Müşteri Adı Soyadı *</label>
                      <input
                        type="text"
                        required
                        value={manCustName}
                        onChange={(e) => setManCustName(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Telefon *</label>
                      <input
                        type="tel"
                        required
                        value={manCustPhone}
                        onChange={(e) => setManCustPhone(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Randevu Tarihi *</label>
                      <input
                        type="date"
                        required
                        value={manDate}
                        onChange={(e) => setManDate(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Saat *</label>
                      <select
                        value={manTime}
                        onChange={(e) => setManTime(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs"
                      >
                        {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Stilist *</label>
                      <select
                        required
                        value={manSelectedStylistId}
                        onChange={(e) => setManSelectedStylistId(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs"
                      >
                        <option value="">Seçiniz...</option>
                        {stylists.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Hizmetler *</label>
                      <div className="max-h-24 overflow-y-auto border border-gray-200 bg-white rounded-lg p-2 space-y-1">
                        {services.map((s) => (
                          <label key={s.id} className="flex items-center space-x-2 text-[10px] font-normal cursor-pointer">
                            <input
                              type="checkbox"
                              checked={manSelectedServiceIds.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setManSelectedServiceIds([...manSelectedServiceIds, s.id]);
                                } else {
                                  setManSelectedServiceIds(manSelectedServiceIds.filter((id) => id !== s.id));
                                }
                              }}
                            />
                            <span>{s.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setManualBookingOpen(false)}
                        className="px-4 py-2 border border-gray-200 rounded-lg"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-lg"
                      >
                        Randevuyu Kaydet
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-2xl border border-[#efe2d1] bg-[#fffdfb] p-3 shadow-[0_10px_20px_rgba(15,15,17,0.03)] space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#a06b3e]">Bildirim ayarları</span>
                  <h4 className="mt-1 font-sans text-sm font-black text-gray-950">Yeni randevu uyarıları</h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-700">
                  <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5">
                    <input
                      type="checkbox"
                      checked={currentNotificationSettings.browser}
                      onChange={(e) => onUpdateNotifications?.({ ...currentNotificationSettings, browser: e.target.checked })}
                    />
                    Tarayıcı bildirimi
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5">
                    <input
                      type="checkbox"
                      checked={currentNotificationSettings.sound}
                      onChange={(e) => onUpdateNotifications?.({ ...currentNotificationSettings, sound: e.target.checked })}
                    />
                    Bildirim sesi
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#efe2d1] bg-[linear-gradient(180deg,#fffdfa_0%,#f9f4ee_100%)] p-3 sm:p-4 shadow-[0_14px_28px_rgba(15,15,17,0.04)] space-y-3">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#a06b3e]">Takvim görünümü</span>
                  <h4 className="mt-1 font-sans text-xl font-black tracking-tight text-gray-950">{calendarLabel}</h4>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    className="rounded-xl border border-[#e8ddd0] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:border-[#dfa069]/50 hover:text-[#a06b3e]"
                  >
                    Önceki
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                    className="rounded-xl border border-[#e8ddd0] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:border-[#dfa069]/50 hover:text-[#a06b3e]"
                  >
                    Bugün
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    className="rounded-xl border border-[#e8ddd0] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:border-[#dfa069]/50 hover:text-[#a06b3e]"
                  >
                    Sonraki
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono uppercase tracking-[0.18em] text-gray-600">
                {[
                  { label: 'Bekliyor', tone: 'pending' },
                  { label: 'Onaylı', tone: 'approved' },
                  { label: 'Tamamlandı', tone: 'completed' },
                ].map((item) => (
                  <span
                    key={item.tone}
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 ${
                      item.tone === 'pending'
                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                        : item.tone === 'approved'
                        ? 'border-amber-200 bg-amber-50 text-[#a06b3e]'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-500">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                  <div key={day} className="px-2 py-2 text-center">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {(calendarView === 'week' ? selectedWeekDates : calendarDays).map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} className="min-h-[120px] rounded-2xl border border-dashed border-[#e8ddd0] bg-white/50" />;

                  const dateKey = toLocalDateKey(date);
                  const dayAppointments = appointmentsByDate[dateKey] || [];
                  const isSelected = dateKey === calendarSelectedDate;
                  const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => {
                        setCalendarSelectedDate(dateKey);
                        setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                      }}
                      className={`min-h-[88px] rounded-2xl border p-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#dfa069] bg-[#fff8f2] shadow-[0_10px_22px_rgba(223,160,105,0.10)]'
                          : isCurrentMonth
                          ? 'border-[#ece5df] bg-white hover:border-[#dfa069]/50 hover:bg-[#fffaf4]'
                          : 'border-[#f1ece8] bg-[#faf8f7] text-gray-400'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`text-xs font-black ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                          {date.getDate()}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="rounded-full bg-[#dfa069]/10 px-1.5 py-0.5 text-[9px] font-mono font-black text-[#a06b3e]">
                            {dayAppointments.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayAppointments.slice(0, 2).map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditingAppointment(app);
                            }}
                            className={`w-full rounded-xl border px-1.5 py-1 text-left text-[9px] shadow-sm transition hover:opacity-90 ${
                              app.status === 'pending'
                                ? 'border-orange-200 bg-orange-50 text-orange-700'
                                : app.status === 'approved'
                                ? 'border-amber-200 bg-amber-50 text-[#a06b3e]'
                                : app.status === 'completed'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 bg-gray-100 text-gray-600'
                            }`}
                          >
                            <div className="font-black leading-tight">{app.timeSlot}</div>
                            <div className="truncate leading-tight">{app.customerName}</div>
                            {app.customerPhone && (
                              <div className="truncate leading-tight text-[8px] opacity-80">{app.customerPhone}</div>
                            )}
                          </button>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-[8px] font-mono font-black text-gray-500">+{dayAppointments.length - 2} daha</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#eae0d5] bg-white p-4 shadow-[0_10px_24px_rgba(17,17,19,0.03)]">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-sans text-base font-black text-gray-950">
                  {new Date(`${calendarSelectedDate}T00:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Seçili tarih</span>
              </div>

              {appointmentsByDate[calendarSelectedDate]?.length ? (
                <div className="space-y-3">
                  {appointmentsByDate[calendarSelectedDate].map((app) => (
                    <div key={app.id} className="rounded-2xl border border-[#efe6dc] bg-[#fffaf7] p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#a06b3e]">{app.trackingCode || app.id}</div>
                          <div className="mt-1 font-sans text-sm font-extrabold text-gray-900">{app.customerName}</div>
                          {app.customerPhone && (
                            <div className="mt-1 text-[10px] font-bold text-gray-600">Telefon: {app.customerPhone}</div>
                          )}
                          <div className="mt-1 text-[11px] text-gray-500">{app.timeSlot} • {app.stylist.name}</div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            app.status === 'approved' ? 'bg-amber-100 text-[#a06b3e]' :
                            app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {getStatusLabel(app.status)}
                          </span>

                          <button
                            type="button"
                            onClick={() => openEditingAppointment(app)}
                            className="rounded-lg border border-[#e7dfd8] bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 transition hover:border-[#dfa069]/50 hover:text-[#a06b3e]"
                          >
                            Düzenle
                          </button>

                          {app.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'completed')}
                              className="rounded-lg bg-[#0f0f11] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#dfa069] hover:text-[#111113]"
                            >
                              Bitti
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {app.services.map((srv) => (
                          <span key={srv.id} className="rounded-full border border-[#e7dfd8] bg-white px-2 py-0.5 text-[10px] font-bold text-gray-700">
                            {srv.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#e7dfd8] bg-[#faf8f7] px-3 py-6 text-center text-xs text-gray-500">
                  Bu tarihte randevu bulunmuyor.
                </div>
              )}
            </div>

            <AnimatePresence>
              {editingAppointmentId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/60 p-4 backdrop-blur-sm"
                  onClick={() => setEditingAppointmentId(null)}
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 10, opacity: 0, scale: 0.98 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl rounded-[1.75rem] border border-[#e6d7c8] bg-white p-5 shadow-[0_25px_60px_rgba(15,15,17,0.18)]"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#a06b3e]">Randevu düzenle</p>
                        <h4 className="mt-1 font-sans text-xl font-black text-gray-950">Rezervasyon Detayları</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingAppointmentId(null)}
                        className="rounded-xl border border-[#e8ddd0] bg-[#faf8f5] px-2.5 py-1.5 text-xs font-bold text-gray-700"
                      >
                        Kapat
                      </button>
                    </div>

                    <form onSubmit={handleSaveAppointmentEdit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Müşteri adı</label>
                        <input
                          type="text"
                          value={manCustName}
                          onChange={(e) => setManCustName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Telefon</label>
                        <input
                          type="tel"
                          value={manCustPhone}
                          onChange={(e) => setManCustPhone(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Durum</label>
                        <select
                          value={statusFilter === 'all' ? 'pending' : statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white"
                        >
                          <option value="pending">Onay Bekliyor</option>
                          <option value="approved">Onaylandı</option>
                          <option value="completed">Tamamlandı</option>
                          <option value="cancelled">İptal</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Tarih</label>
                        <input
                          type="date"
                          value={manDate}
                          onChange={(e) => setManDate(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Saat</label>
                        <select
                          value={manTime}
                          onChange={(e) => setManTime(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white"
                        >
                          {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Stilist</label>
                        <select
                          value={manSelectedStylistId}
                          onChange={(e) => setManSelectedStylistId(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white"
                        >
                          {stylists.map((stylist) => (
                            <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Hizmetler</label>
                        <div className="max-h-32 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {services.map((service) => (
                              <label key={service.id} className="flex items-center gap-2 text-[11px] font-medium text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={manSelectedServiceIds.includes(service.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setManSelectedServiceIds((prev) => [...prev, service.id]);
                                    } else {
                                      setManSelectedServiceIds((prev) => prev.filter((id) => id !== service.id));
                                    }
                                  }}
                                />
                                {service.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingAppointmentId(null)}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-[#0f0f11] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white hover:bg-[#dfa069] hover:text-[#111113]"
                        >
                          Kaydet
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-150">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-[#0f0f11] text-[#ebd6b8] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Takip Kodu & Müşteri</th>
                    <th className="p-3.5">Hizmetler</th>
                    <th className="p-3.5">Stilist</th>
                    <th className="p-3.5">Tarih & Saat</th>
                    <th className="p-3.5">Tutar</th>
                    <th className="p-3.5">Durum</th>
                    <th className="p-3.5 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        Randevu kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/50">
                        <td className="p-3.5">
                          <span className="font-mono font-black text-xs text-[#a06b3e] block">
                            {app.trackingCode || app.id}
                          </span>
                          <span className="font-extrabold text-gray-900 text-sm">{app.customerName}</span>
                        </td>
                        <td className="p-3.5 max-w-48">
                          <div className="flex flex-col gap-1">
                            {app.services.map((s) => (
                              <span key={s.id} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded truncate">
                                + {s.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-gray-800">{app.stylist.name}</td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <div>{app.date}</div>
                          <div className="font-bold text-[#dfa069]">{app.timeSlot}</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-gray-900">
                          {app.totalPrice > 0 ? `₺${app.totalPrice}` : 'Serbest'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            app.status === 'approved' ? 'bg-amber-100 text-[#a06b3e]' :
                            app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {getStatusLabel(app.status)}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          {app.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'approved')}
                              className="inline-flex items-center justify-center px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.12em] shadow-sm"
                            >
                              Onayla
                            </button>
                          )}
                          {app.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'completed')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold"
                            >
                              Tamamla
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAppointment(app.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STATISTICS */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#a06b3e]">Güvenlik</span>
              <h3 className="mt-1 font-sans font-black text-xl text-gray-950">Şifre Değiştir</h3>
            </div>

            <form onSubmit={handleChangeAdminPasswordSubmit} className="max-w-xl space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Eski Şifre</label>
                <div className="relative">
                  <input
                    type={showPasswordField ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white pr-10"
                    placeholder="Eski şifrenizi girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordField((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    {showPasswordField ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Yeni Şifre</label>
                <div className="relative">
                  <input
                    type={showNewPasswordField ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white pr-10"
                    placeholder="En az 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPasswordField((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    {showNewPasswordField ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">Yeni Şifre Tekrar</label>
                <div className="relative">
                  <input
                    type={showConfirmPasswordField ? 'text' : 'password'}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#dfa069] focus:bg-white pr-10"
                    placeholder="Yeni şifreyi tekrar girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPasswordField((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    {showConfirmPasswordField ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>

              {passwordChangeMessage && (
                <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${passwordChangeMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {passwordChangeMessage.text}
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-[#0f0f11] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-[#dfa069] hover:text-[#0f0f11] cursor-pointer"
              >
                Şifreyi Güncelle
              </button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h3 className="font-sans font-black text-xl text-gray-950">İstatistikler & İşlem Özeti</h3>
                <p className="text-xs text-gray-500 mt-0.5">Aylık ve yıllık randevu, iş yükü ve kazanç görünümü.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-150 bg-[#f8fafc] p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Aylık randevu</div>
                <div className="mt-3 text-3xl font-black text-gray-950">{monthlyAppointments.length}</div>
                <div className="mt-1 text-[11px] text-gray-500">Bu ay gelen toplam rezervasyon</div>
              </div>

              <div className="rounded-2xl border border-gray-150 bg-[#fefaf5] p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a06b3e]">Yıllık randevu</div>
                <div className="mt-3 text-3xl font-black text-gray-950">{yearlyAppointments.length}</div>
                <div className="mt-1 text-[11px] text-gray-500">Bu yıl toplam rezervasyon</div>
              </div>

              <div className="rounded-2xl border border-gray-150 bg-[#f0fdf4] p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-700">Yapılan işler</div>
                <div className="mt-3 text-3xl font-black text-gray-950">{monthlyCompletedJobs}</div>
                <div className="mt-1 text-[11px] text-gray-500">Bu ay tamamlanan işlem sayısı</div>
              </div>

              <div className="rounded-2xl border border-gray-150 bg-[#fff7ed] p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-700">Kazanç</div>
                <div className="mt-3 text-3xl font-black text-gray-950">₺{monthlyEarnings.toLocaleString('tr-TR')}</div>
                <div className="mt-1 text-[11px] text-gray-500">Bu ay onaylı / tamamlanan gelir</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-150 bg-gray-50 p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Yıllık tamamlanan iş sayısı</div>
                <div className="mt-3 text-2xl font-black text-gray-950">{yearlyCompletedJobs}</div>
              </div>

              <div className="rounded-2xl border border-gray-150 bg-gray-50 p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Yıllık kazanç</div>
                <div className="mt-3 text-2xl font-black text-gray-950">₺{yearlyEarnings.toLocaleString('tr-TR')}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-150 overflow-hidden">
              <div className="bg-[#0f0f11] text-[#ebd6b8] px-4 py-3 text-[10px] font-mono uppercase tracking-[0.2em]">
                İşlem Detay Tablosu
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-3">Müşteri</th>
                      <th className="p-3">Tarih</th>
                      <th className="p-3">Hizmet</th>
                      <th className="p-3">Durum</th>
                      <th className="p-3">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {statsRows.map((appointment) => {
                      const priceLabel = appointment.totalPrice > 0 ? `₺${appointment.totalPrice.toLocaleString('tr-TR')}` : 'Fiyatlandırılmadı';
                      const isUnpriced = appointment.totalPrice === 0 || appointment.totalPrice == null;

                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50/50">
                          <td className="p-3">
                            <div className="font-bold text-gray-900">{appointment.customerName}</div>
                            <div className="font-mono text-[10px] text-[#a06b3e]">{appointment.trackingCode || appointment.id}</div>
                          </td>
                          <td className="p-3 font-mono text-[11px]">{appointment.date}</td>
                          <td className="p-3 max-w-[260px]">
                            <div className="flex flex-wrap gap-1">
                              {appointment.services.map((service) => (
                                <span key={service.id} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-700">
                                  {service.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                              appointment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              appointment.status === 'approved' ? 'bg-amber-100 text-[#a06b3e]' :
                              appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-900">
                            <div>{priceLabel}</div>
                            {isUnpriced && (
                              <div className="mt-1 text-[10px] text-red-600 font-mono uppercase tracking-[0.12em]">Fiyat girilmedi</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h3 className="font-sans font-black text-xl text-gray-950">Fiyat Tarifesi & Salon Hizmetleri</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  İstanbul Kadın Kuaförleri Odası tarifesi ve Solaryum (dakika başı 50 TL) gibi tüm işlemleri esnek düzenleyin.
                </p>
              </div>

              <button
                onClick={() => setNewServiceOpen(!newServiceOpen)}
                className="px-4.5 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 font-black text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni İşlem / Hizmet Ekle</span>
              </button>
            </div>

            <div className="rounded-2xl border border-[#dfa069]/30 bg-amber-50/30 p-4 space-y-3">
              <div>
                <h4 className="font-sans font-black text-sm text-gray-900">Toplu fiyat ayarları</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Seçtiğiniz ayarlar tüm hizmetlere uygulanır. Tek tek düzenleme için hizmet kartındaki kalem simgesini kullanabilirsiniz.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block">Fiyat görünürlüğü</label>
                  <select
                    value={bulkPriceVisibility}
                    onChange={(e) => setBulkPriceVisibility(e.target.value as typeof bulkPriceVisibility)}
                    className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                  >
                    <option value="unchanged">Değiştirme</option>
                    <option value="show">Fiyatı göster</option>
                    <option value="hide">Fiyatı gizle</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block">Özel fiyat metni</label>
                  <input
                    type="text"
                    value={bulkCustomPriceText}
                    onChange={(e) => setBulkCustomPriceText(e.target.value)}
                    placeholder="Örn: Fiyat Alınız"
                    className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleBulkUpdatePrices}
                  className="px-4 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-xs"
                >
                  Tümüne Uygula
                </button>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkApplyCustomPriceText}
                  onChange={(e) => setBulkApplyCustomPriceText(e.target.checked)}
                  className="h-4 w-4 accent-[#dfa069]"
                />
                Özel fiyat metnini de tüm hizmetlere uygula
              </label>
            </div>

            {/* NEW SERVICE FORM */}
            <AnimatePresence>
              {newServiceOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-[#dfa069]/30 bg-[#faf9f5] rounded-2xl p-6 overflow-hidden"
                >
                  <form onSubmit={handleAddNewService} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                    <div className="sm:col-span-3 font-sans font-black text-base text-[#a06b3e] border-b border-amber-200/60 pb-2">
                      Tarifeye Yeni Hizmet Ekle
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Hizmet Adı *</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Turbo Solaryum Seansı"
                        value={srvName}
                        onChange={(e) => setSrvName(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Kategori *</label>
                      <select
                        value={srvCategory}
                        onChange={(e) => setSrvCategory(e.target.value as any)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                      >
                        <option value="sac-kesim">Saç Grubu (Kesim & Fön)</option>
                        <option value="boyama">Boya Grubu (Balyaj & Ombre)</option>
                        <option value="perma-duzlestirme">Perma & Keratin Düzleştirme</option>
                        <option value="el-ayak">Manikür - Pedikür (Nail Art)</option>
                        <option value="agda">Ağda Grubu</option>
                        <option value="bakim">Bakım Ürün & Terapi</option>
                        <option value="makyaj-gelin">Gelin & Makyaj</option>
                        <option value="ozel-islemler">Özel İşlemler & Solaryum</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Sayısal Fiyat (₺) (50, 0 vb. serbest)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="50"
                        value={srvPrice}
                        onChange={(e) => setSrvPrice(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Özel Fiyat Metni (Opsiyonel)</label>
                      <input
                        type="text"
                        placeholder="Örn: 50 ₺ / Dakika, 1.500 ₺ - SERBEST"
                        value={srvCustomPriceText}
                        onChange={(e) => setSrvCustomPriceText(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Tahmini Süre (Dakika)</label>
                      <input
                        type="number"
                        min="5"
                        value={srvDuration}
                        onChange={(e) => setSrvDuration(Number(e.target.value))}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="srv-show-price"
                        checked={srvShowPrice}
                        onChange={(e) => setSrvShowPrice(e.target.checked)}
                        className="h-4 w-4 accent-[#dfa069]"
                      />
                      <label htmlFor="srv-show-price" className="text-xs font-bold text-gray-800 cursor-pointer">
                        Fiyatı sitede göster (Kaldırılırsa "Fiyat Bilgisi Alınız" yazar)
                      </label>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-gray-500 font-mono block">Hizmet Görseli</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Görsel URL'si"
                          value={srvImage}
                          onChange={(e) => setSrvImage(e.target.value)}
                          className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs"
                        />
                        <label className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-xl cursor-pointer hover:bg-gray-50">
                          <Upload className="h-3.5 w-3.5" />
                          Dosyadan seç
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => { void readImageFile(e, setSrvImage); }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">En fazla 5MB seçilebilir; kayıt sırasında görsel otomatik küçültülür.</p>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-gray-500 font-mono block">Açıklama *</label>
                      <textarea
                        required
                        placeholder="Hizmet detayını yazınız..."
                        value={srvDescription}
                        onChange={(e) => setSrvDescription(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-3 text-xs min-h-16"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setNewServiceOpen(false)}
                        className="px-4 py-2 border border-gray-200 rounded-xl"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black"
                      >
                        Hizmeti Tarifeye Ekle
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EDIT SERVICE MODAL */}
            {editingServiceId && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-black text-lg text-gray-900">Hizmet Tarifesini Düzenle</h3>
                    <button onClick={() => setEditingServiceId(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedService} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Hizmet Adı</label>
                      <input
                        type="text"
                        required
                        value={editSrvName}
                        onChange={(e) => setEditSrvName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Fiyat (₺)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editSrvPrice}
                        onChange={(e) => setEditSrvPrice(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Özel Fiyat Metni</label>
                      <input
                        type="text"
                        value={editSrvCustomPriceText}
                        onChange={(e) => setEditSrvCustomPriceText(e.target.value)}
                        placeholder="Örn: 50 ₺ / Dakika, SERBEST"
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-srv-show-price"
                        checked={editSrvShowPrice}
                        onChange={(e) => setEditSrvShowPrice(e.target.checked)}
                        className="h-4 w-4 accent-[#dfa069]"
                      />
                      <label htmlFor="edit-srv-show-price" className="cursor-pointer">
                        Fiyatı sitede göster
                      </label>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Hizmet Görseli</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Görsel URL'si veya dosya seçin"
                          value={editSrvImage}
                          onChange={(e) => setEditSrvImage(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-2.5"
                        />
                        <label className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-xl cursor-pointer hover:bg-gray-50">
                          <Upload className="h-3.5 w-3.5" />
                          Dosyadan seç
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => { void readImageFile(e, setEditSrvImage); }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Açıklama</label>
                      <textarea
                        required
                        value={editSrvDescription}
                        onChange={(e) => setEditSrvDescription(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5 min-h-16"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingServiceId(null)}
                        className="px-4 py-2 border rounded-xl"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black"
                      >
                        Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List of Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-services-list">
              {services.map((srv) => (
                <div key={srv.id} className="p-4 rounded-2xl border border-gray-150 bg-gray-50/50 flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[9px] font-mono font-bold rounded">
                        {srv.category}
                      </span>
                      <span className="font-mono font-bold text-xs text-[#a06b3e]">
                        {srv.showPrice === false ? 'Gizli' : (srv.customPriceText || `₺${srv.price}`)}
                      </span>
                    </div>
                    <h4 className="font-sans font-black text-sm text-gray-900 truncate">{srv.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{srv.description}</p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleStartEditService(srv)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: KÉRASTASE KATALOĞU (EKLE & DÜZENLE & SİL) */}
        {activeTab === 'kerastase' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h3 className="font-sans font-black text-xl text-gray-950 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#dfa069]" />
                  <span>KÉRASTASE Ürün & Ritüel Kataloğu</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  PDF kataloğundaki tüm serileri (Première, Chronologiste, Blond Absolu vb.) yönetin ve düzenleyin.
                </p>
              </div>

              <button
                onClick={() => setNewKerastaseOpen(!newKerastaseOpen)}
                className="px-4.5 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 font-black text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Kérastase Ürünü Ekle</span>
              </button>
            </div>

            {/* ADD KERASTASE PRODUCT FORM */}
            <AnimatePresence>
              {newKerastaseOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-[#dfa069]/30 bg-amber-50/20 rounded-2xl p-6 overflow-hidden"
                >
                  <form onSubmit={handleAddNewKerastaseProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                    <div className="sm:col-span-3 font-sans font-black text-base text-[#a06b3e] border-b border-amber-200 pb-2">
                      Kérastase Kataloğuna Yeni Ürün Ekle
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Ürün Adı *</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Concentré Décalcifiant Ultra-Réparateur"
                        value={kpName}
                        onChange={(e) => setKpName(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Kérastase Serisi *</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Première, Chronologiste, Genesis..."
                        value={kpSeries}
                        onChange={(e) => setKpSeries(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Bakım Adımı *</label>
                      <select
                        value={kpStepType}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setKpStepType(val);
                          if (val === '1-banyo') setKpStepLabel('1. Saç Banyosu');
                          else if (val === '2-durulanan') setKpStepLabel('2. Durulanan Bakım');
                          else if (val === '3-durulanmayan') setKpStepLabel('3. Durulanmayan Bakım');
                          else if (val === 'on-bakim') setKpStepLabel('Ön Bakım');
                          else if (val === 'salon-bakim') setKpStepLabel('Salon Özel Ritüeli');
                          else if (val === 'cihaz') setKpStepLabel('Yapay Zeka Cihazı');
                        }}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      >
                        <option value="1-banyo">1. Saç Banyosu</option>
                        <option value="2-durulanan">2. Durulanan Bakım</option>
                        <option value="3-durulanmayan">3. Durulanmayan Bakım</option>
                        <option value="on-bakim">Ön Bakım</option>
                        <option value="salon-bakim">Salon Özel Ritüeli</option>
                        <option value="cihaz">Yapay Zeka (K-Scan)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Boyut / Ambalaj</label>
                      <input
                        type="text"
                        placeholder="Örn: 250 ml / 500 ml"
                        value={kpSize}
                        onChange={(e) => setKpSize(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Öne Çıkan Faydalar (Virgülle)</label>
                      <input
                        type="text"
                        placeholder="Kalsiyum Arındırma, Keratin Bağları"
                        value={kpBenefits}
                        onChange={(e) => setKpBenefits(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-gray-500 font-mono block">Görsel URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={kpImage}
                        onChange={(e) => setKpImage(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-gray-500 font-mono block">Ürün Açıklaması *</label>
                      <textarea
                        required
                        placeholder="Ürünün etki mekanizması ve saç tipine faydalarını yazınız..."
                        value={kpDescription}
                        onChange={(e) => setKpDescription(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-3 min-h-16"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setNewKerastaseOpen(false)}
                        className="px-4 py-2 border rounded-xl"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black"
                      >
                        Kérastase Ürününü Ekle
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EDIT KERASTASE MODAL */}
            {editingKpId && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-black text-lg text-gray-900">Kérastase Ürününü Düzenle</h3>
                    <button onClick={() => setEditingKpId(null)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedKerastaseProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Ürün Adı</label>
                      <input
                        type="text"
                        required
                        value={editKpName}
                        onChange={(e) => setEditKpName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Seri</label>
                      <input
                        type="text"
                        required
                        value={editKpSeries}
                        onChange={(e) => setEditKpSeries(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Boyut / Ambalaj</label>
                      <input
                        type="text"
                        value={editKpSize}
                        onChange={(e) => setEditKpSize(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Görsel URL</label>
                      <input
                        type="url"
                        value={editKpImage}
                        onChange={(e) => setEditKpImage(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Faydalar (Virgülle)</label>
                      <input
                        type="text"
                        value={editKpBenefits}
                        onChange={(e) => setEditKpBenefits(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Açıklama</label>
                      <textarea
                        required
                        value={editKpDescription}
                        onChange={(e) => setEditKpDescription(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5 min-h-16"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingKpId(null)}
                        className="px-4 py-2 border rounded-xl"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black"
                      >
                        Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kerastaseProducts.map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl border border-gray-150 bg-white flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#0f0f11] text-[#ebd6b8] text-[9px] font-mono font-bold rounded">
                        {prod.series}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {prod.stepLabel}
                      </span>
                    </div>
                    <h4 className="font-sans font-black text-sm text-gray-900 truncate">{prod.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleStartEditKerastaseProduct(prod)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKerastaseProduct(prod.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BLOG YÖNETİMİ (EKLE & DÜZENLE & SİL) */}
        {activeTab === 'blog' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h3 className="font-sans font-black text-xl text-gray-950 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#dfa069]" />
                  <span>Blog Makale & İçerik Yönetimi</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Google ve Yapay Zeka (AI) arama motorlarında öne çıkmanızı sağlayacak blog yazılarını yönetin ve düzenleyin.
                </p>
              </div>

              <button
                onClick={() => setNewBlogOpen(!newBlogOpen)}
                className="px-4.5 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 font-black text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Blog Yazısı Ekle</span>
              </button>
            </div>

            {/* ADD BLOG POST FORM */}
            <AnimatePresence>
              {newBlogOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-[#dfa069]/30 bg-amber-50/20 rounded-2xl p-6 overflow-hidden"
                >
                  <form onSubmit={handleAddNewBlogPost} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                    <div className="sm:col-span-3 font-sans font-black text-base text-[#a06b3e] border-b border-amber-200 pb-2">
                      Yeni SEO Uyumlu Blog Makalesi Oluştur
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Makale Başlığı *</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: 2026 Balyaj ve Renklendirme Trendleri"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Kategori *</label>
                      <select
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      >
                        <option value="Renklendirme & Balyaj">Renklendirme & Balyaj</option>
                        <option value="Kérastase & Bakım">Kérastase & Bakım</option>
                        <option value="Yapay Zeka & Teknoloji">Yapay Zeka & Teknoloji</option>
                        <option value="Solaryum & Bronzluk">Solaryum & Bronzluk</option>
                        <option value="Gelin & Makyaj">Gelin & Makyaj</option>
                        <option value="El & Ayak Bakımı">El & Ayak Bakımı</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Yazar</label>
                      <input
                        type="text"
                        value={blogAuthor}
                        onChange={(e) => setBlogAuthor(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Okuma Süresi</label>
                      <input
                        type="text"
                        value={blogReadTime}
                        onChange={(e) => setBlogReadTime(e.target.value)}
                        placeholder="Örn: 4 dk"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Etiketler (Virgülle)</label>
                      <input
                        type="text"
                        value={blogTags}
                        onChange={(e) => setBlogTags(e.target.value)}
                        placeholder="Balyaj, Saç Modası, Trendler"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-gray-500 font-mono block">Görsel URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={blogImage}
                        onChange={(e) => setBlogImage(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-gray-500 font-mono block">Özet</label>
                      <input
                        type="text"
                        placeholder="Makalenin kısa özeti..."
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-gray-500 font-mono block">Makale Tam Metni *</label>
                      <textarea
                        required
                        placeholder="Makale içeriğini yazınız..."
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl p-3 min-h-32 font-normal"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setNewBlogOpen(false)}
                        className="px-4 py-2 border rounded-xl"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black"
                      >
                        Yazıyı Yayınla
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EDIT BLOG POST MODAL */}
            {editingBlogId && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-black text-lg text-gray-900">Blog Makalesini Düzenle</h3>
                    <button onClick={() => setEditingBlogId(null)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedBlogPost} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Başlık</label>
                      <input
                        type="text"
                        required
                        value={editBlogTitle}
                        onChange={(e) => setEditBlogTitle(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Kategori</label>
                      <select
                        value={editBlogCategory}
                        onChange={(e) => setEditBlogCategory(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      >
                        <option value="Renklendirme & Balyaj">Renklendirme & Balyaj</option>
                        <option value="Kérastase & Bakım">Kérastase & Bakım</option>
                        <option value="Yapay Zeka & Teknoloji">Yapay Zeka & Teknoloji</option>
                        <option value="Solaryum & Bronzluk">Solaryum & Bronzluk</option>
                        <option value="Gelin & Makyaj">Gelin & Makyaj</option>
                        <option value="El & Ayak Bakımı">El & Ayak Bakımı</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Yazar</label>
                      <input
                        type="text"
                        value={editBlogAuthor}
                        onChange={(e) => setEditBlogAuthor(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Görsel URL</label>
                      <input
                        type="url"
                        value={editBlogImage}
                        onChange={(e) => setEditBlogImage(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Özet</label>
                      <input
                        type="text"
                        value={editBlogExcerpt}
                        onChange={(e) => setEditBlogExcerpt(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">İçerik</label>
                      <textarea
                        required
                        value={editBlogContent}
                        onChange={(e) => setEditBlogContent(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5 min-h-28"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingBlogId(null)}
                        className="px-4 py-2 border rounded-xl"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black"
                      >
                        Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Blog Posts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-2xl border border-gray-150 bg-white flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-50 text-[#a06b3e] text-[9px] font-mono font-bold rounded">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {post.date}
                      </span>
                    </div>
                    <h4 className="font-sans font-black text-sm text-gray-900 truncate">{post.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleStartEditBlogPost(post)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlogPost(post.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SOSYAL MEDYA */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm space-y-6">
            <div>
              <h3 className="font-sans font-black text-xl text-gray-950 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-[#dfa069]" />
                <span>Sosyal Medya Hesapları Yönetimi</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Sosyal medya profil bağlantılarınızı ekleyin. Bu bağlantılar header, footer ve iletişim alanlarında görüntülenecektir.
              </p>
            </div>

            <form onSubmit={handleSaveSocialLinks} className="space-y-4 max-w-2xl text-xs font-bold" id="social-media-form">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-gray-700 font-mono">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <span>Instagram Profil Linki</span>
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/kuaforunuz"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                />
                <label className="flex items-center gap-2 text-[10px] text-gray-600 font-mono cursor-pointer">
                  <input type="checkbox" checked={socialInstagramVisible} onChange={(e) => setSocialInstagramVisible(e.target.checked)} className="h-3.5 w-3.5 accent-[#dfa069]" />
                  Instagram görünür olsun
                </label>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-gray-700 font-mono">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp İletişim Numarası (+905...)</span>
                </label>
                <input
                  type="text"
                  placeholder="+905334567890"
                  value={socialWhatsapp}
                  onChange={(e) => setSocialWhatsapp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                />
                <label className="flex items-center gap-2 text-[10px] text-gray-600 font-mono cursor-pointer">
                  <input type="checkbox" checked={socialWhatsappVisible} onChange={(e) => setSocialWhatsappVisible(e.target.checked)} className="h-3.5 w-3.5 accent-[#dfa069]" />
                  WhatsApp görünür olsun
                </label>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-gray-700 font-mono">
                  <Video className="h-4 w-4 text-black" />
                  <span>TikTok Profil Linki</span>
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@kuaforunuz"
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                />
                <label className="flex items-center gap-2 text-[10px] text-gray-600 font-mono cursor-pointer">
                  <input type="checkbox" checked={socialTiktokVisible} onChange={(e) => setSocialTiktokVisible(e.target.checked)} className="h-3.5 w-3.5 accent-[#dfa069]" />
                  TikTok görünür olsun
                </label>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-gray-700 font-mono">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span>Facebook Sayfa Linki</span>
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/kuaforunuz"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                />
                <label className="flex items-center gap-2 text-[10px] text-gray-600 font-mono cursor-pointer">
                  <input type="checkbox" checked={socialFacebookVisible} onChange={(e) => setSocialFacebookVisible(e.target.checked)} className="h-3.5 w-3.5 accent-[#dfa069]" />
                  Facebook görünür olsun
                </label>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-gray-700 font-mono">
                  <Twitter className="h-4 w-4 text-gray-900" />
                  <span>X (Twitter) Profil Linki</span>
                </label>
                <input
                  type="url"
                  placeholder="https://x.com/kuaforunuz"
                  value={socialXTwitter}
                  onChange={(e) => setSocialXTwitter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                />
                <label className="flex items-center gap-2 text-[10px] text-gray-600 font-mono cursor-pointer">
                  <input type="checkbox" checked={socialXTwitterVisible} onChange={(e) => setSocialXTwitterVisible(e.target.checked)} className="h-3.5 w-3.5 accent-[#dfa069]" />
                  X görünür olsun
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md"
                >
                  Sosyal Medya Hesaplarını Kaydet →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: STİLİSTLER */}
        {activeTab === 'stylists' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <h3 className="font-sans font-black text-xl text-gray-950">Salon Personeli & Usta Stilistler</h3>
              <button
                onClick={() => setNewStylistOpen(!newStylistOpen)}
                className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Personel Ekle</span>
              </button>
            </div>

            <AnimatePresence>
              {newStylistOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-[#dfa069]/30 bg-amber-50/20 rounded-2xl p-5 overflow-hidden"
                >
                  <form onSubmit={handleAddNewStylist} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    <div className="sm:col-span-2 font-sans font-black text-base text-[#a06b3e] border-b border-amber-200 pb-2">
                      Yeni Personel / Usta Stilist Kaydı
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">İsim Soyisim *</label>
                      <input type="text" required value={styName} onChange={(e) => setStyName(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl p-2.5" />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Görev / Ünvan *</label>
                      <input type="text" required value={styRole} onChange={(e) => setStyRole(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl p-2.5" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Avatar URL veya Bilgisayar Dosyası</label>
                      <div className="flex gap-2 items-center">
                        <input type="url" value={styAvatar} onChange={(e) => setStyAvatar(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl p-2.5" />
                        <label className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer shrink-0">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') setStyAvatar(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Puan</label>
                      <input type="number" min="0" max="5" step="0.1" value={styRating} onChange={(e) => setStyRating(Number(e.target.value))} className="w-full border border-gray-200 bg-white rounded-xl p-2.5" />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Yorum Sayısı</label>
                      <input type="number" min="0" value={styReviewsCount} onChange={(e) => setStyReviewsCount(Number(e.target.value))} className="w-full border border-gray-200 bg-white rounded-xl p-2.5" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Uzmanlık Alanları (virgülle)</label>
                      <input type="text" value={stySpecialities} onChange={(e) => setStySpecialities(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl p-2.5" />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input type="checkbox" checked={styVisible} onChange={(e) => setStyVisible(e.target.checked)} className="h-4 w-4 accent-[#dfa069]" />
                      <label className="text-xs font-bold text-gray-800 cursor-pointer">Web sayfasında göster</label>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setNewStylistOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl">Vazgeç</button>
                      <button type="submit" className="px-6 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black">Personeli Kaydet</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {editingStylistId && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-black text-lg text-gray-900">Personeli Düzenle</h3>
                    <button onClick={() => setEditingStylistId(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
                  </div>

                  <form onSubmit={handleSaveEditedStylist} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">İsim Soyisim</label>
                      <input type="text" value={editStyName} onChange={(e) => setEditStyName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Görev / Ünvan</label>
                      <input type="text" value={editStyRole} onChange={(e) => setEditStyRole(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Avatar URL veya Bilgisayar Dosyası</label>
                      <div className="flex gap-2 items-center">
                        <input type="url" value={editStyAvatar} onChange={(e) => setEditStyAvatar(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
                        <label className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer shrink-0">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') setEditStyAvatar(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Puan</label>
                      <input type="number" min="0" max="5" step="0.1" value={editStyRating} onChange={(e) => setEditStyRating(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-2.5" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block">Yorum Sayısı</label>
                      <input type="number" min="0" value={editStyReviewsCount} onChange={(e) => setEditStyReviewsCount(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-2.5" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-mono block">Uzmanlık Alanları</label>
                      <input type="text" value={editStySpecialities} onChange={(e) => setEditStySpecialities(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input type="checkbox" checked={editStyVisible} onChange={(e) => setEditStyVisible(e.target.checked)} className="h-4 w-4 accent-[#dfa069]" />
                      <label className="text-xs font-bold text-gray-800 cursor-pointer">Web sayfasında göster</label>
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setEditingStylistId(null)} className="px-4 py-2 border rounded-xl">İptal</button>
                      <button type="submit" className="px-6 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black">Kaydet</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stylists.map((sty) => (
                <div key={sty.id} className="p-4 rounded-2xl border border-gray-150 bg-white flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 shrink-0">
                    <img src={sty.avatar} alt={sty.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-sans font-black text-sm text-gray-900">{sty.name}</h4>
                    <span className="text-[11px] text-[#dfa069] font-bold block">{sty.role}</span>
                    <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs mt-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{sty.rating} ({sty.reviewsCount} Puan)</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => handleToggleStylistVisibility(sty.id)} className="px-2 py-1 rounded-md text-[10px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">
                        {sty.isVisible === false ? 'Sayfada Gizli' : 'Sayfada Gösteriliyor'}
                      </button>
                      <button onClick={() => handleStartEditStylist(sty)} className="px-2 py-1 rounded-md text-[10px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">Düzenle</button>
                      <button onClick={() => handleDeleteStylist(sty.id)} className="px-2 py-1 rounded-md text-[10px] font-bold border border-red-200 text-red-600 hover:bg-red-50">Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MESAJLAR */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <h3 className="font-sans font-black text-xl text-gray-950">Danışan İletişim & Fikir Talepleri</h3>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="p-5 rounded-2xl border border-gray-150 bg-gray-50/50 space-y-3">
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <span className="font-sans font-black text-sm text-gray-900">{msg.senderName}</span>
                      <span className="text-xs text-gray-400 font-mono ml-2">{msg.senderPhone} • {msg.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#dfa069]/10 text-[#a06b3e] rounded-md text-[10px] font-bold">{msg.subject}</span>
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Sil"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700">{msg.message}</p>

                  {msg.replyText && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                      <div className="font-bold uppercase font-mono text-[10px] tracking-widest mb-1">Cevap</div>
                      <p>{msg.replyText}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-mono block">Admin cevabı</label>
                    <textarea
                      value={stylistReplyDrafts[msg.id] ?? msg.replyText ?? ''}
                      onChange={(e) => setStylistReplyDrafts((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                      className="w-full border border-gray-200 bg-white rounded-xl p-3 min-h-24 text-xs"
                      placeholder="Danışan için uygun cevabı yazın..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button onClick={() => handleSaveMessageReply(msg.id)} className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-xs">Cevabı Kaydet</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: YORUMLAR */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <h3 className="font-sans font-black text-xl text-gray-950">Müşteri Yorumları & Değerlendirmeleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-gray-150 bg-white space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-sans font-black text-sm text-gray-900">{rev.customerName}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{rev.rating}</span>
                      </div>
                      <button onClick={() => handleToggleReviewVisibility(rev.id)} className="px-2 py-1 rounded-md text-[10px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">{rev.isVisible === false ? 'Gizli' : 'Gösteriliyor'}</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic">"{rev.comment}"</p>
                  <span className="text-[10px] text-gray-400 font-mono block">{rev.date} • {rev.serviceCategory}</span>

                  {rev.replyText && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                      <div className="font-bold uppercase font-mono text-[10px] tracking-widest mb-1">Cevap</div>
                      <p>{rev.replyText}</p>
                    </div>
                  )}

                  <textarea
                    value={reviewReplyDrafts[rev.id] ?? rev.replyText ?? ''}
                    onChange={(e) => setReviewReplyDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 min-h-20 text-xs"
                    placeholder="Yorum için cevap yazın..."
                  />

                  <div className="flex justify-between items-center">
                    <button onClick={() => handleDeleteReview(rev.id)} className="px-3 py-2 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold hover:bg-red-50">Sil</button>
                    <button onClick={() => handleSaveReviewReply(rev.id)} className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-xs">Cevabı Kaydet</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: GALERİ YÖNETİMİ */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h3 className="font-sans font-black text-xl text-gray-950">Galeri Yönetimi</h3>
                <p className="text-xs text-gray-500 mt-0.5">Portfolio görsellerini, videolarını ve başlık açıklamalarını yönetin.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateWebContent({ ...webContent, galleryTitle: galleryTitleDraft, gallerySubtitle: gallerySubtitleDraft, galleryItems: webContent.galleryItems || [] });
                  alert('Galeri başlıkları kaydedildi.');
                }}
                className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-xs"
              >
                Başlıkları Kaydet
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-mono block">Galeri Başlığı</label>
                <input value={galleryTitleDraft} onChange={(e) => setGalleryTitleDraft(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-mono block">Galeri Alt Başlığı</label>
                <input value={gallerySubtitleDraft} onChange={(e) => setGallerySubtitleDraft(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
              </div>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4 border border-gray-200 rounded-2xl p-4 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <h5 className="font-sans font-black text-sm text-gray-900">{galleryEditIndex !== null ? 'Galeri Öğesini Düzenle' : 'Yeni Galeri Öğesi Ekle'}</h5>
                {galleryEditIndex !== null && (
                  <button type="button" onClick={() => { setGalleryEditIndex(null); setGalleryItemTitle(''); setGalleryItemSrc(''); setGalleryItemVideoUrl(''); setGalleryItemMediaType('image'); }} className="text-[10px] font-bold text-gray-600">İptal</button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block">Başlık</label>
                  <input type="text" value={galleryItemTitle} onChange={(e) => setGalleryItemTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-mono block">Tür</label>
                  <select value={galleryItemMediaType} onChange={(e) => setGalleryItemMediaType(e.target.value as 'image' | 'video')} className="w-full border border-gray-200 rounded-xl p-2.5 bg-white">
                    <option value="image">Resim</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-gray-500 font-mono block">Görsel veya Video URL</label>
                  <div className="flex gap-2 items-center">
                  <input type="text" value={galleryItemSrc} onChange={(e) => setGalleryItemSrc(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" placeholder={galleryItemMediaType === 'image' ? 'Görsel URL adresi' : 'Video küçük görseli (opsiyonel)'} />
                    <label className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl cursor-pointer shrink-0">
                      <Upload className="h-4 w-4" />
                      <input type="file" accept={galleryItemMediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleGalleryItemFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {galleryItemMediaType === 'video' && (
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-mono block">Video URL (YouTube veya doğrudan video bağlantısı)</label>
                    <input type="text" value={galleryItemVideoUrl} onChange={(e) => setGalleryItemVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=... veya yüklenmiş video" className="w-full border border-gray-200 rounded-xl p-2.5" />
                    <p className="text-[10px] text-gray-400 mt-1">{galleryMediaUploading ? 'Video yükleniyor...' : 'Bilgisayardan video seçebilir veya YouTube bağlantısı yapıştırabilirsiniz.'}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-[10px] uppercase tracking-wider">
                  {galleryMediaUploading ? 'Yükleniyor...' : galleryEditIndex !== null ? 'Kaydet' : 'Ekle'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h5 className="font-sans font-black text-sm text-gray-900">Mevcut Galeri İçerikleri</h5>
              {(webContent.galleryItems || []).map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
                  {item.mediaType === 'video' ? (
                    <video src={item.videoUrl || item.src} muted className="h-14 w-14 object-cover rounded-lg border border-gray-200" />
                  ) : (
                    <img src={item.src} alt={item.title} className="h-14 w-14 object-cover rounded-lg border border-gray-200" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-black text-xs text-gray-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{item.mediaType === 'video' ? 'Video' : 'Resim'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEditGalleryItem(index)} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700">Düzenle</button>
                    <button type="button" onClick={() => handleDeleteGalleryItem(index)} className="px-2.5 py-1.5 border border-red-200 rounded-lg text-[10px] font-bold text-red-600">Sil</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SSS YÖNETİMİ */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h3 className="font-sans font-black text-xl text-gray-950">SSS Yönetimi</h3>
                <p className="text-xs text-gray-500 mt-0.5">Sıkça sorulan soruları ekleyin, düzenleyin ve görünür şekilde yayınlayın.</p>
              </div>
              <button type="button" onClick={handleSaveFaqList} className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-xs">SSS Listesini Kaydet</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-mono block">SSS Başlığı</label>
                <input value={faqTitleDraft} onChange={(e) => setFaqTitleDraft(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-mono block">SSS Alt Başlığı</label>
                <input value={faqSubtitleDraft} onChange={(e) => setFaqSubtitleDraft(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5" />
              </div>
            </div>

            <div className="space-y-4 border border-gray-200 rounded-2xl p-4 bg-gray-50">
              <h5 className="font-sans font-black text-sm text-gray-900">{faqEditIndex !== null ? 'SSS Öğesini Düzenle' : 'Yeni SSS Ekle'}</h5>
              <div className="space-y-3">
                <input value={faqQuestionInput} onChange={(e) => setFaqQuestionInput(e.target.value)} placeholder="Soru" className="w-full border border-gray-200 rounded-xl p-2.5" />
                <textarea value={faqAnswerInput} onChange={(e) => setFaqAnswerInput(e.target.value)} rows={4} placeholder="Cevap" className="w-full border border-gray-200 rounded-xl p-2.5" />
              </div>
              <div className="flex justify-end gap-2">
                {faqEditIndex !== null && (
                  <button type="button" onClick={() => { setFaqEditIndex(null); setFaqQuestionInput(''); setFaqAnswerInput(''); }} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold">İptal</button>
                )}
                <button type="button" onClick={handleSaveFaqEntry} className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 rounded-xl font-black text-xs">{faqEditIndex !== null ? 'Kaydet' : 'Ekle'}</button>
              </div>
            </div>

            <div className="space-y-3">
              {(faqDrafts || []).map((item, index) => (
                <div key={`${item.q}-${index}`} className="rounded-2xl border border-gray-200 p-4 bg-white space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h6 className="font-sans font-black text-sm text-gray-900">{item.q}</h6>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => handleEditFaqEntry(index)} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700">Düzenle</button>
                      <button type="button" onClick={() => handleDeleteFaqEntry(index)} className="px-2.5 py-1.5 border border-red-200 rounded-lg text-[10px] font-bold text-red-600">Sil</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: CONTENT & SEO */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm space-y-6">
            <div>
              <h3 className="font-sans font-black text-xl text-gray-950">Site Marka Kimliği, Logo & SEO Ayarları</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Kuaför adı, logo, adres, telefon ve Google arama motoru ayarlarını düzenleyin.
              </p>
            </div>

            <form onSubmit={handleSaveAllWebContent} className="space-y-6 text-xs font-bold max-w-3xl">
              <div className="space-y-4 border-b border-gray-100 pb-6">
                <h4 className="font-sans font-black text-sm text-[#a06b3e]">1. Marka ve Logo</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-mono block">Salon Adı</label>
                    <input
                      type="text"
                      value={editedSalonName}
                      onChange={(e) => setEditedSalonName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono block">Alt Başlık</label>
                    <input
                      type="text"
                      value={editedSalonSubtitle}
                      onChange={(e) => setEditedSalonSubtitle(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-mono block">Logo URL veya Dosya Yükleme</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editedSalonLogoUrl}
                        onChange={(e) => setEditedSalonLogoUrl(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5"
                      />
                      <label className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer shrink-0">
                        <Upload className="h-4 w-4" />
                        <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-b border-gray-100 pb-6">
                <h4 className="font-sans font-black text-sm text-[#a06b3e]">2. İletişim ve Konum</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-mono block">Tecrübe Yılı</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={editedExperienceYears}
                      onChange={(e) => setEditedExperienceYears(Number(e.target.value) || 20)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono block">Telefon Numarası</label>
                    <input
                      type="text"
                      value={editedFooterPhone}
                      onChange={(e) => setEditedFooterPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-mono block">İlçe / Şehir Rozeti</label>
                    <input
                      type="text"
                      value={editedSalonDistrictCity}
                      onChange={(e) => setEditedSalonDistrictCity(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-mono block">Açık Adres Metni</label>
                    <input
                      type="text"
                      value={editedSalonAddressText}
                      onChange={(e) => setEditedSalonAddressText(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono block">Üst Çubuk Tecrübe Metni</label>
                    <input
                      type="text"
                      value={editedTopStripExperienceText}
                      onChange={(e) => setEditedTopStripExperienceText(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono block">Üst Çubuk Konum Metni</label>
                    <input
                      type="text"
                      value={editedTopStripLocationText}
                      onChange={(e) => setEditedTopStripLocationText(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-mono block">Randevu Saatleri (virgülle ayırın)</label>
                    <input
                      type="text"
                      value={editedBookingSlotsText}
                      onChange={(e) => setEditedBookingSlotsText(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                      placeholder="09:00, 10:00, 11:00"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Tüm Değişiklikleri Kaydet
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
