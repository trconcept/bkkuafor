import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Calendar, Clock, Lock, Sparkles, Phone, ShieldCheck, 
  Mail, ArrowRight, Star, Heart, CheckCircle, HelpCircle, MapPin,
  MessageCircle, Navigation, Instagram, Facebook, Video, Twitter, ChevronDown,
  BellRing
} from 'lucide-react';
import Header from './components/Header';
import ServiceCard from './components/ServiceCard';
import BookingWizard from './components/BookingWizard';
import MyAppointmentsView from './components/MyAppointmentsView';
import KerastaseView from './components/KerastaseView';
import BlogView from './components/BlogView';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { 
  SalonService, Stylist, Appointment, SalonReview, ActiveSection, 
  AdminMessage, WebContent, KerastaseProduct, BlogPost 
} from './types';
import { 
  SALON_SERVICES, SALON_STYLISTS, REVIEWS, 
  INITIAL_MESSAGES, INITIAL_WEB_CONTENT, KERASTASE_PRODUCTS, INITIAL_BLOG_POSTS 
} from './data';
import { resolveGoogleMapsEmbedUrl, resolveGoogleMapsDirectionsUrl } from './utils/maps';
import {
  cancelAppointment as cancelAppointmentApi,
  changeAdminPassword as changeAdminPasswordApi,
  createAdminAppointment,
  createAppointment,
  deleteAdminAppointment,
  getAdminAppointments,
  getAdminBlockedPhones,
  getAdminSession,
  lookupAppointment,
  logoutAdmin,
  replaceAdminBlockedPhones,
  updateAdminAppointment
} from './utils/api';
import { normalizeTurkishMobilePhone } from './utils/phone';

// Helper function to format WhatsApp click links correctly
const getFormattedWhatsappUrl = (number: string, message: string) => {
  if (!number) return '';
  let cleanNumber = number.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
    cleanNumber = '90' + cleanNumber.substring(1);
  } else if (cleanNumber.length === 10) {
    cleanNumber = '90' + cleanNumber;
  }
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
};

const BOOKING_GUARD_KEY = 'salon_booking_guard_v1';

const normalizePhoneNumber = (value?: string) => {
  return normalizeTurkishMobilePhone(value);
};

const getDeviceFingerprint = () => {
  try {
    const screenInfo = typeof window !== 'undefined' && window.screen
      ? `${window.screen.width}x${window.screen.height}`
      : 'unknown-screen';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown-timezone';
    return `${navigator.userAgent}|${navigator.language}|${screenInfo}|${timezone}`;
  } catch {
    return 'unknown-device';
  }
};

const getBookingGuardRecords = () => {
  try {
    const raw = localStorage.getItem(BOOKING_GUARD_KEY);
    if (!raw) return [] as Array<{ deviceFingerprint: string; createdAt: string; stylistId: string; date: string; timeSlot: string; customerName: string }>;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as Array<{ deviceFingerprint: string; createdAt: string; stylistId: string; date: string; timeSlot: string; customerName: string }>;
  }
};

const saveBookingGuardRecords = (records: Array<{ deviceFingerprint: string; createdAt: string; stylistId: string; date: string; timeSlot: string; customerName: string }>) => {
  try {
    localStorage.setItem(BOOKING_GUARD_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage failures silently; the UI must still work without the rate-limit cache.
  }
};

const validateBookingAgainstAbuseRules = (input: {
  customerName: string;
  date: string;
  timeSlot: string;
  stylistId: string;
  clientStartedAt: number;
  appointments: Appointment[];
}) => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const fingerprint = getDeviceFingerprint();
  const records = getBookingGuardRecords().filter((record) => now - new Date(record.createdAt).getTime() <= oneDayMs);

  if (!input.customerName.trim()) {
    return 'Lütfen adınızı ve soyadınızı giriniz.';
  }

  if (!input.date || !input.timeSlot || !input.stylistId) {
    return 'Lütfen tarih, saat ve uzman seçimini tamamlayınız.';
  }

  if (now - input.clientStartedAt < 6000) {
    return 'Randevu formunu çok hızlı doldurdunuz. Lütfen birkaç saniye bekleyip tekrar deneyin.';
  }

  const sameSlotConflict = input.appointments.some((appointment) => {
    if (!['pending', 'approved'].includes(appointment.status)) return false;
    return appointment.stylist.id === input.stylistId && appointment.date === input.date && appointment.timeSlot === input.timeSlot;
  });

  if (sameSlotConflict) {
    return 'Seçilen saat için aynı uzman adına bekleyen veya onaylanmış bir randevu zaten mevcut. Lütfen farklı bir saat deneyin.';
  }

  const sameDeviceRecords = records.filter((record) => record.deviceFingerprint === fingerprint);
  const sameTimeRecords = records.filter((record) => 
    record.stylistId === input.stylistId && record.date === input.date && record.timeSlot === input.timeSlot
  );

  if (sameDeviceRecords.length >= 3) {
    return 'Aynı cihazdan günlük randevu limiti doldu. Lütfen daha sonra tekrar deneyin.';
  }

  if (sameDeviceRecords.filter((record) => now - new Date(record.createdAt).getTime() <= 30 * 60 * 1000).length >= 2) {
    return 'Aynı cihazdan kısa süre içinde çok fazla randevu talebi oluşturuldu. Lütfen birkaç dakika sonra tekrar deneyin.';
  }

  if (sameTimeRecords.length >= 1) {
    return 'Bu saat ve uzman için daha önce benzer bir talep kaydı tespit edildi. Lütfen başka bir zaman seçin.';
  }

  return null;
};

export default function App() {
  const normalizeWebContent = (content: WebContent): WebContent => ({
    ...content,
    showcaseSubtitle: content.showcaseSubtitle === '2026 Menü Seçkisi' ? 'Menü Seçkisi' : content.showcaseSubtitle,
    footerCopyrightAndAddress: content.footerCopyrightAndAddress === '© 2026 BK Kuaför & Beauty Lounge • İstanbul Kadın Kuaförleri Odası Üyesi.'
      ? 'BK Kuaför & Beauty Lounge • İstanbul Kadın Kuaförleri Odası Üyesi.'
      : content.footerCopyrightAndAddress,
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<SalonService | null>(null);

  // Secure admin token state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('is_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then(() => {
        if (active) setIsAdminAuthenticated(true);
      })
      .catch(() => {
        if (active) {
          setIsAdminAuthenticated(false);
          try {
            sessionStorage.removeItem('is_admin_logged_in');
          } catch {
            // Ignore unavailable session storage.
          }
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Client-Side pathname checking
  useEffect(() => {
    const handleRouteSync = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setActiveSection('admin');
      } else if (path === '/services') {
        setActiveSection('services');
      } else if (path === '/kerastase') {
        setActiveSection('kerastase');
      } else if (path === '/blog') {
        setActiveSection('blog');
      } else if (path === '/booking') {
        setActiveSection('booking');
      } else if (path === '/my-appointments') {
        setActiveSection('my-appointments');
      } else if (path === '/gallery') {
        setActiveSection('gallery');
      } else if (path === '/faq') {
        setActiveSection('faq');
      } else {
        if (window.location.hash === '#admin') {
          setActiveSection('admin');
        } else {
          setActiveSection('home');
        }
      }
    };

    handleRouteSync();
    window.addEventListener('popstate', handleRouteSync);
    return () => window.removeEventListener('popstate', handleRouteSync);
  }, []);

  const changeSectionWithUrl = (section: ActiveSection) => {
    setActiveSection(section);
    const targetUrl = section === 'home' ? '/' : `/${section}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  // Persistent States
  const [webContent, setWebContent] = useState<WebContent>(() => {
    try {
      const saved = localStorage.getItem('salon_web_content');
      return saved ? normalizeWebContent(JSON.parse(saved) as WebContent) : INITIAL_WEB_CONTENT;
    } catch {
      return INITIAL_WEB_CONTENT;
    }
  });

  const [services, setServices] = useState<SalonService[]>(() => {
    try {
      const saved = localStorage.getItem('salon_services');
      return saved ? JSON.parse(saved) : SALON_SERVICES;
    } catch {
      return SALON_SERVICES;
    }
  });

  const [kerastaseProducts, setKerastaseProducts] = useState<KerastaseProduct[]>(() => {
    try {
      const saved = localStorage.getItem('salon_kerastase_products');
      if (!saved) return KERASTASE_PRODUCTS;

      const savedProducts = JSON.parse(saved) as KerastaseProduct[];
      const savedIds = new Set(savedProducts.map((product) => product.id));
      return [
        ...savedProducts,
        ...KERASTASE_PRODUCTS.filter((product) => !savedIds.has(product.id))
      ];
    } catch {
      return KERASTASE_PRODUCTS;
    }
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('salon_blog_posts');
      return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
    } catch {
      return INITIAL_BLOG_POSTS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    return [];
  });

  const [blockedPhones, setBlockedPhones] = useState<string[]>(() => {
    return [];
  });

  const [reviews, setReviews] = useState<SalonReview[]>(() => {
    try {
      const saved = localStorage.getItem('salon_reviews');
      return saved ? JSON.parse(saved) : REVIEWS;
    } catch {
      return REVIEWS;
    }
  });

  const [stylists, setStylists] = useState<Stylist[]>(() => {
    try {
      const saved = localStorage.getItem('salon_stylists');
      return saved ? JSON.parse(saved) : SALON_STYLISTS;
    } catch {
      return SALON_STYLISTS;
    }
  });

  const [messages, setMessages] = useState<AdminMessage[]>(() => {
    try {
      const saved = localStorage.getItem('salon_messages');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const refreshStateFromStorage = () => {
    try {
      const savedWebContent = localStorage.getItem('salon_web_content');
      if (savedWebContent) {
        const parsed = normalizeWebContent(JSON.parse(savedWebContent) as WebContent);
        setWebContent((prev) => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
      }

      const savedServices = localStorage.getItem('salon_services');
      if (savedServices) {
        const parsed = JSON.parse(savedServices);
        setServices((prev) => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
      }

      const savedKerastaseProducts = localStorage.getItem('salon_kerastase_products');
      if (savedKerastaseProducts) {
        const parsed = JSON.parse(savedKerastaseProducts);
        setKerastaseProducts((prev) => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
      }

      const savedBlogPosts = localStorage.getItem('salon_blog_posts');
      if (savedBlogPosts) {
        const parsed = JSON.parse(savedBlogPosts);
        setBlogPosts((prev) => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
      }

      const savedReviews = localStorage.getItem('salon_reviews');
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        setReviews((prev) => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
      }

      const savedStylists = localStorage.getItem('salon_stylists');
      if (savedStylists) {
        const parsed = JSON.parse(savedStylists);
        setStylists((prev) => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
      }

      const savedMessages = localStorage.getItem('salon_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages((prev) => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
      }
    } catch {
      // Ignore stale or malformed localStorage payloads.
    }
  };

  useEffect(() => {
    refreshStateFromStorage();

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      const keys = [
        'salon_web_content',
        'salon_services',
        'salon_kerastase_products',
        'salon_blog_posts',
        'salon_reviews',
        'salon_stylists',
        'salon_messages'
      ];

      if (keys.includes(event.key)) {
        refreshStateFromStorage();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (activeSection === 'admin' || activeSection === 'home' || activeSection === 'booking') {
        refreshStateFromStorage();
      }
    }, 7000);

    return () => window.clearInterval(timer);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== 'admin' || !isAdminAuthenticated) return;
    let active = true;
    getAdminAppointments()
      .then((result) => {
        if (active) setAppointments(result.appointments);
      })
      .catch(() => {
        if (active) setAppointments([]);
      });
    return () => {
      active = false;
    };
  }, [activeSection, isAdminAuthenticated]);

  useEffect(() => {
    if (activeSection !== 'admin' || !isAdminAuthenticated) return;
    let active = true;
    getAdminBlockedPhones()
      .then((result) => {
        if (active) setBlockedPhones(result.blockedPhones.map(normalizePhoneNumber).filter(Boolean));
      })
      .catch(() => {
        if (active) setBlockedPhones([]);
      });
    return () => {
      active = false;
    };
  }, [activeSection, isAdminAuthenticated]);

  // Contact form submission states
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('Genel Sorular');
  const [contactMessage, setContactMessage] = useState('');

  const [adminToast, setAdminToast] = useState<{ id: string; message: string } | null>(null);
  const [hasRequestedNotificationPermission, setHasRequestedNotificationPermission] = useState(false);
  const [adminNotificationSettings, setAdminNotificationSettings] = useState<{ browser: boolean; sound: boolean }>(() => {
    try {
      const saved = localStorage.getItem('salon_admin_notification_settings');
      return saved ? JSON.parse(saved) : { browser: true, sound: true };
    } catch {
      return { browser: true, sound: true };
    }
  });

  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const publicAnsweredMessages = messages
    .filter((msg) => msg.replyText && msg.replyText.trim().length > 0)
    .slice(0, 4);

  const requestNotificationPermissionIfNeeded = async () => {
    if (!adminNotificationSettings.browser || !('Notification' in window) || hasRequestedNotificationPermission) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setHasRequestedNotificationPermission(true);
      }
    } catch {
      // Some browsers block permission requests in non-user gestures; ignore silently.
    }
  };

  const handleAdminPasswordChange = async (currentPassword: string, nextPassword: string) => {
    try {
      await changeAdminPasswordApi(currentPassword, nextPassword);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdminAppointmentsUpdate = (updatedAppointments: Appointment[]) => {
    const previousById = new Map(appointments.map((appointment) => [appointment.id, appointment]));
    const nextById = new Map(updatedAppointments.map((appointment) => [appointment.id, appointment]));
    setAppointments(updatedAppointments);

    const sync = async () => {
      await Promise.all([
        ...updatedAppointments
          .filter((appointment) => !previousById.has(appointment.id))
          .map((appointment) => createAdminAppointment(appointment)),
        ...updatedAppointments
          .filter((appointment) => {
            const previous = previousById.get(appointment.id);
            return previous && JSON.stringify(previous) !== JSON.stringify(appointment);
          })
          .map((appointment) => updateAdminAppointment(appointment.id, appointment)),
        ...appointments
          .filter((appointment) => !nextById.has(appointment.id))
          .map((appointment) => deleteAdminAppointment(appointment.id))
      ]);
    };

    void sync().catch(async () => {
      try {
        const result = await getAdminAppointments();
        setAppointments(result.appointments);
      } catch {
        // Keep the optimistic admin UI when the recovery request also fails.
      }
    });
  };

  const handleBlockedPhonesUpdate = (updatedPhones: string[]) => {
    const normalizedPhones = [...new Set(updatedPhones.map(normalizePhoneNumber).filter(Boolean))];
    setBlockedPhones(normalizedPhones);
    void replaceAdminBlockedPhones(normalizedPhones).catch(async () => {
      try {
        const result = await getAdminBlockedPhones();
        setBlockedPhones(result.blockedPhones.map(normalizePhoneNumber).filter(Boolean));
      } catch {
        // Keep the optimistic UI if the recovery request also fails.
      }
    });
  };

  const playAdminNotificationSound = () => {
    try {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;

      const context = new AudioCtor();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(620, context.currentTime + 0.35);

      gainNode.gain.setValueAtTime(0.0001, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.75);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.8);
    } catch {
      // Silent fallback when browser audio APIs are unavailable.
    }
  };

  const triggerAdminNewAppointmentAlert = (newApp: Appointment) => {
    const toastMessage = `Yeni randevu: ${newApp.customerName} • ${newApp.date} ${newApp.timeSlot}`;
    setAdminToast({ id: newApp.id, message: toastMessage });

    if (document.hidden || activeSection !== 'admin') {
      if (adminNotificationSettings.browser && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Yeni randevu bildirimi', {
          body: toastMessage,
          tag: `appointment-${newApp.id}`
        });
      }

      if (adminNotificationSettings.sound) {
        playAdminNotificationSound();
      }
    }
  };

  useEffect(() => {
    if (activeSection === 'admin') {
      requestNotificationPermissionIfNeeded();
    }
  }, [activeSection, adminNotificationSettings.browser]);

  useEffect(() => {
    localStorage.setItem('salon_admin_notification_settings', JSON.stringify(adminNotificationSettings));
  }, [adminNotificationSettings]);

  useEffect(() => {
    if (!adminToast) return;

    const timeout = window.setTimeout(() => {
      setAdminToast(null);
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [adminToast]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('salon_web_content', JSON.stringify(webContent));
  }, [webContent]);

  useEffect(() => {
    localStorage.setItem('salon_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('salon_kerastase_products', JSON.stringify(kerastaseProducts));
  }, [kerastaseProducts]);

  useEffect(() => {
    localStorage.setItem('salon_blog_posts', JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    localStorage.setItem('salon_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('salon_stylists', JSON.stringify(stylists));
  }, [stylists]);

  useEffect(() => {
    localStorage.setItem('salon_messages', JSON.stringify(messages));
  }, [messages]);

  // Action: Add a booking request through the server and open WhatsApp for salon approval.
  const handleAddAppointment = async (newAppRaw: Omit<Appointment, 'id' | 'createdAt'> & { website: string; clientStartedAt: number }) => {
    const normalizedPhone = normalizePhoneNumber(newAppRaw.customerPhone || '');
    if (!normalizedPhone) {
      throw new Error('Telefon numarası zorunludur. Lütfen geçerli bir numara girin.');
    }

    const blockedMatch = blockedPhones.some((phone) => normalizePhoneNumber(phone) === normalizedPhone);
    if (blockedMatch) {
      throw new Error('Bu telefon numarası engellendi. Lütfen farklı bir iletişim bilgisi kullanın.');
    }

    const duplicatePhoneCount = appointments.filter((appointment) => {
      const appointmentPhone = normalizePhoneNumber(appointment.customerPhone || '');
      return appointmentPhone && appointmentPhone === normalizedPhone && ['pending', 'approved'].includes(appointment.status);
    }).length;

    if (duplicatePhoneCount >= 1) {
      throw new Error('Aynı telefon numarasından birden fazla aktif randevu talebi oluşturulamaz.');
    }

    const validationError = validateBookingAgainstAbuseRules({
      customerName: newAppRaw.customerName,
      date: newAppRaw.date,
      timeSlot: newAppRaw.timeSlot,
      stylistId: newAppRaw.stylist.id,
      clientStartedAt: newAppRaw.clientStartedAt,
      appointments,
    });

    if (validationError) {
      throw new Error(validationError);
    }

    const result = await createAppointment(newAppRaw as unknown as Record<string, unknown>);
    const newApp: Appointment = {
      ...newAppRaw,
      ...result.appointment,
      customerPhone: normalizedPhone,
      status: 'pending'
    };

    const deviceFingerprint = getDeviceFingerprint();
    const records = getBookingGuardRecords();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const updatedRecords = [
      ...records.filter((record) => new Date(record.createdAt).getTime() >= cutoff),
      {
        deviceFingerprint,
        createdAt: new Date().toISOString(),
        stylistId: newAppRaw.stylist.id,
        date: newAppRaw.date,
        timeSlot: newAppRaw.timeSlot,
        customerName: newAppRaw.customerName
      }
    ];
    saveBookingGuardRecords(updatedRecords);

    setAppointments((prev) => [newApp, ...prev.filter((appointment) => appointment.id !== newApp.id)]);
    triggerAdminNewAppointmentAlert(newApp);
    setSelectedServiceForBooking(null);

    const whatsappNumber = webContent.socialLinks?.whatsapp || webContent.whatsappNumber || '+905527440585';
    const serviceNames = newApp.services.map((service) => service.name).join(', ');
    const message = [
      'Merhaba BK Kuaför, yeni randevu talebi var.',
      '',
      `Müşteri: ${newApp.customerName}`,
      `Telefon: ${newApp.customerPhone || 'Belirtilmedi'}`,
      `Hizmet: ${serviceNames}`,
      `Uzman: ${newApp.stylist.name}`,
      `Tarih: ${newApp.date}`,
      `Saat: ${newApp.timeSlot}`,
      `Not: ${newApp.notes || 'Yok'}`,
      '',
      'Lütfen bu randevu talebini onaylayın veya reddedin.'
    ].join('\n');

    const whatsappUrl = getFormattedWhatsappUrl(whatsappNumber, message);
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    return result.appointment.trackingCode;
  };

  // Action: Cancel booking
  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id || app.trackingCode === id ? { ...app, status: 'cancelled' as const } : app))
    );
    void cancelAppointmentApi(id).catch(() => undefined);
  };

  // Action: Post client review testimonial
  const handleAddReview = (newRevRaw: Omit<SalonReview, 'id' | 'date'>) => {
    const newRev: SalonReview = {
      ...newRevRaw,
      id: `rev-${reviews.length + 1}`,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  // Action: Contact message submission
  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) {
      alert('Lütfen adınızı ve mesajınızı eksiksiz girin.');
      return;
    }

    const newMsg: AdminMessage = {
      id: `msg-${messages.length + 1}`,
      senderName: contactName,
      senderPhone: contactPhone || 'Belirtilmedi',
      subject: contactSubject,
      message: contactMessage,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false
    };

    setMessages((prev) => [newMsg, ...prev]);
    setContactName('');
    setContactPhone('');
    setContactMessage('');
    alert('Sorunuz ve talebiniz salon yöneticilerine başarıyla iletildi!');
  };

  // Switch catalog item trigger to Booking page
  const handleSelectServiceShortcut = (service: SalonService) => {
    setSelectedServiceForBooking(service);
    changeSectionWithUrl('booking');
  };

  // Kerastase or Blog booking trigger
  const handleSelectSpecialBooking = (serviceNameOrCategory?: string) => {
    // Find matching service if any
    if (serviceNameOrCategory) {
      const match = services.find((s) => 
        s.name.toLowerCase().includes(serviceNameOrCategory.toLowerCase()) ||
        s.category.toLowerCase().includes(serviceNameOrCategory.toLowerCase())
      );
      if (match) {
        setSelectedServiceForBooking(match);
      }
    }
    changeSectionWithUrl('booking');
  };

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const visibleStylists = stylists.filter((sty) => sty.isVisible !== false);
  const experienceYears = webContent.experienceYears || 20;
  const topStripExperienceText = webContent.topStripExperienceText || `${experienceYears} Yıllık Tecrübe`;
  const topStripLocationText = webContent.topStripLocationText || webContent.salonDistrictCity || 'Ümraniye & Çekmeköy';

  return (
    <div className={`min-h-screen text-gray-800 flex flex-col font-sans selection:bg-[#dfa069] selection:text-[#0f0f11] ${activeSection === 'kerastase' ? 'bg-[#0c0b0e]' : 'bg-[#faf8f5]'}`} id="salon-root-container">
      
      {/* 1. Global Navigation header */}
      <Header
        activeSection={activeSection}
        setActiveSection={changeSectionWithUrl}
        webContent={webContent}
      />

      {activeSection === 'admin' && adminToast && (
        <div className="fixed right-4 top-24 z-50 max-w-sm rounded-2xl border border-[#dfa069]/40 bg-[#171510]/95 px-4 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#dfa069]/10 text-[#f7d7a6]">
              <BellRing className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#dfa069]">Yeni randevu</p>
              <p className="mt-1 text-sm font-medium text-[#f4efe8]">{adminToast.message}</p>
            </div>
          </div>
        </div>
      )}

      {activeSection !== 'admin' && (
        <div className="relative overflow-hidden border-b border-[#2a2522]/80 bg-[radial-gradient(circle_at_top,_rgba(223,160,105,0.2),_transparent_52%),linear-gradient(180deg,#120f0e_0%,#171310_100%)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#dfa069]/80 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-[#f3e8d6]">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dfa069]/30 bg-[#201b18]/85 px-3 py-1.5 shadow-[0_0_30px_rgba(223,160,105,0.09)] transition-all duration-300 hover:border-[#dfa069]/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dfa069]/10 ring-1 ring-[#dfa069]/30">
                  <Scissors className="h-3.5 w-3.5 text-[#dfa069]" />
                </div>
                <span className="text-[#f8e8cc] font-semibold tracking-[0.18em]">{topStripExperienceText}</span>
              </div>
              <div className="flex items-center gap-3 text-[#d8d0c7]/80">
                <span className="font-semibold tracking-[0.18em] text-[#f5ebdd]">{webContent.salonName || 'BK Kuaför & Beauty'}</span>
                <span className="hidden sm:inline h-1 w-1 rounded-full bg-[#dfa069]" />
                <span className="tracking-[0.18em]">{topStripLocationText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Core Application Viewport */}
      <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full ${activeSection === 'kerastase' ? 'bg-transparent relative z-10' : ''}`} id="viewport-body">
        <AnimatePresence mode="wait">
          
          {/* A. ANA SAYFA VIEW */}
          {activeSection === 'home' && (
            <motion.div
              key="home-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-14"
              id="home-screen-layout"
            >
              {/* Premium Hero block */}
              <div 
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c0c0e] via-[#16151a] to-[#0a0a0c] text-white p-6 sm:p-12 lg:p-16 shadow-2xl flex flex-col lg:flex-row items-center gap-8 justify-between border border-[#222228]"
                id="hero-banner-card"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay" 
                  style={{ backgroundImage: `url('${webContent.heroImgUrl}')` }} 
                />

                <div className="relative z-10 max-w-2xl space-y-6 text-center lg:text-left">
                  <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-gradient-to-r from-[#dfa069]/20 to-[#cba358]/20 text-[#ebd6b8] font-bold text-xs rounded-full border border-[#dfa069]/30 font-mono uppercase tracking-widest">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    {webContent.heroTagline || "Zarafet, Lüks & Kusursuz İşçilik"}
                  </span>
                  <h1 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-white lg:max-w-xl">
                    {webContent.heroTitle || "BK Kuaför ile Saçlarınızdaki Eşsiz Sanatı Keşfedin"}
                  </h1>
                  <p className="text-[#9e9da8] text-sm sm:text-base leading-relaxed lg:max-w-lg">
                    {webContent.heroDescription || "BK Kuaför & Beauty; yetkili Kérastase Paris bakım ritüelleri, Olaplex bağ korumalı renklendirme, profesyonel solaryum ve porselen makyaj hizmetleriyle size özel lüks güzellik deneyimi sunar."}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                    <button
                      id="hero-book-btn"
                      onClick={() => changeSectionWithUrl('booking')}
                      className="px-6 py-3.5 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-sans font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer transition-all"
                    >
                      <span>{webContent.heroButtonPrimary || "ONLINE RANDEVU AL"}</span>
                      <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    
                    <button
                      id="hero-kerastase-btn"
                      onClick={() => changeSectionWithUrl('kerastase')}
                      className="px-6 py-3.5 bg-[#1e1d24] text-[#ebd6b8] border border-[#dfa069]/30 hover:border-[#dfa069] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#dfa069]" />
                      <span>{webContent.heroButtonSecondary || "KÉRASTASE ÜRÜNLERİ"}</span>
                    </button>
                  </div>
                </div>

                {/* Right side teaser floating image card */}
                <div className="relative w-full max-w-sm shrink-0 aspect-[4/3] rounded-2xl overflow-hidden border border-[#2d2d35]/50 shadow-2xl" id="hero-floating-image">
                  <img 
                    src={webContent.heroImgUrl || "/bk-logo.jpg"} 
                    alt="Salon Teaser" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11]/90 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[9px] text-[#dfa069] font-mono uppercase block font-medium">{webContent.heroImgLabelTop || "Lüks Salon Deneyimi"}</span>
                      <span className="font-bold text-sm tracking-wide">{webContent.heroImgLabelBottom || "BK Kuaför & Beauty Lounge"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bullet highlights bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center" id="features-promos-row">
                {(webContent.features || []).map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm space-y-2 flex flex-col items-center">
                    <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center mb-1 text-[#dfa069]">
                      {i === 0 ? <Sparkles className="h-6 w-6" /> : i === 1 ? <ShieldCheck className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                    </div>
                    <h4 className="font-sans font-extrabold text-[#0f0f11] text-sm">{f.title}</h4>
                    <p className="text-xs text-gray-500 max-w-xs">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Showcase tariff services segment */}
              <div className="space-y-6" id="home-featured-services">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-xs text-[#dfa069] font-extrabold tracking-widest uppercase font-mono">{webContent.showcaseSubtitle || "Menü Seçkisi"}</span>
                    <h2 className="font-sans font-black text-2xl text-gray-950 tracking-tight">{webContent.showcaseTitle || "Öne Çıkan Hizmet ve Bakımlarımız"}</h2>
                  </div>
                  <button 
                    onClick={() => changeSectionWithUrl('services')}
                    className="text-xs font-bold text-[#cba358] hover:text-[#dfa069] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Tüm Tarife ({services.length}) <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="featured-grid">
                  {services.slice(0, 3).map((srv) => (
                    <ServiceCard
                      key={srv.id}
                      service={srv}
                      onSelect={handleSelectServiceShortcut}
                    />
                  ))}
                </div>
              </div>

              {/* Kerastase Showcase Banner on Home */}
              <div className="bg-gradient-to-r from-[#111115] via-[#1a1920] to-[#111115] rounded-3xl p-8 sm:p-10 border border-[#2a2933] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 max-w-xl text-center sm:text-left">
                  <span className="text-xs font-mono font-black text-[#dfa069] uppercase tracking-widest">
                    KÉRASTASE PARIS YETKİLİ MERKEZİ
                  </span>
                  <h3 className="font-sans font-black text-2xl text-white">
                    Première, Chronologiste & Fusio-Dose Serilerini Keşfedin
                  </h3>
                  <p className="text-xs text-gray-400">
                    Saç analizi cihazı K-SCAN ve kişiye özel saç ritüellerimiz hakkında bilgi edinin.
                  </p>
                </div>
                <button
                  onClick={() => changeSectionWithUrl('kerastase')}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black text-xs uppercase tracking-wider rounded-xl shrink-0 transition-all shadow-md cursor-pointer"
                >
                  Kérastase Sayfasına Git →
                </button>
              </div>

              {/* STYLIST SPECIALISTS */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-150 space-y-6 text-center shadow-sm" id="home-stylists-intro">
                <div className="max-w-xl mx-auto space-y-2">
                  <span className="text-xs text-[#dfa069] font-black font-mono uppercase tracking-widest">{webContent.stylistsSubtitle || "Sanatçılarımız"}</span>
                  <h2 className="font-sans font-black text-2xl text-gray-950 tracking-tight">{webContent.stylistsTitle || "Kusursuz Makası Kullanan Usta Eller"}</h2>
                  <p className="text-gray-500 text-xs">{webContent.stylistsDesc || "Uluslararası akademilerden ödüllü uzman vizajist ve baş stilistlerimizle tanışın."}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stylist-grid">
                  {visibleStylists.map((sty) => (
                    <div key={sty.id} className="bg-gray-50/70 p-4 rounded-2xl border border-gray-150 space-y-3 flex flex-col items-center">
                      <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#ebd6b8]">
                        <img src={sty.avatar} alt={sty.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <h4 className="font-sans font-extrabold text-sm text-[#0f0f11] truncate">{sty.name}</h4>
                        <span className="text-[10px] text-[#a06b3e] font-bold block mt-0.5 truncate uppercase font-mono">{sty.role.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold bg-white py-0.5 px-2 rounded-full border border-gray-150">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{sty.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVIEWS & QUICK CONSULTATION SPLIT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="home-reviews-contact-split">
                
                {/* Testimonial slider col */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs text-[#dfa069] font-extrabold tracking-widest uppercase font-mono">{webContent.reviewsSubtitle || "Misafir Deneyimi"}</span>
                    <h2 className="font-sans font-black text-2xl text-gray-950 tracking-tight">{webContent.reviewsTitle || "Danışanlarımız BK Kuaför Hakkında Ne Dedi?"}</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-h-[380px] overflow-y-auto pr-1" id="scrolling-reviews-container">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-sans font-extrabold text-xs text-gray-900 block">{rev.customerName}</span>
                            <span className="text-[10px] text-gray-400 font-mono italic block mt-0.5">{rev.date} • {rev.serviceCategory}</span>
                          </div>
                          <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed italic">
                          "{rev.comment}"
                        </p>

                        {rev.replyText && (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                            <div className="mb-1 text-[10px] font-mono font-black uppercase tracking-[0.18em] text-emerald-700">Cevap</div>
                            <p className="text-xs leading-relaxed text-emerald-900">{rev.replyText}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultation form column */}
                <div className="lg:col-span-5 bg-[#111115] rounded-3xl p-6 sm:p-8 border border-[#222228] text-white space-y-5" id="consultation-box">
                  <div className="border-b border-gray-800 pb-3 flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-[#dfa069]/10 text-[#dfa069] flex items-center justify-center shrink-0">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-sans font-extrabold text-[#ebd6b8] text-sm tracking-wide">Fikir Alın / Bize Yazın</h3>
                      <span className="text-[10px] text-gray-400 font-mono block uppercase">Mesajınız Anında Yöneticiye İletilir</span>
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-3 text-xs" id="quick-consultation-form">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400 font-black uppercase font-mono block">Ad Soyad *</label>
                      <input
                        type="text"
                        required
                        placeholder="Adınız Soyadınız"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-[#1c1c22] border border-[#2d2d35] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400 font-black uppercase font-mono block">İletişim Telefon No</label>
                      <input
                        type="tel"
                        placeholder="05... (Opsiyonel)"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-[#1c1c22] border border-[#2d2d35] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400 font-black uppercase font-mono block">Görüşme Konusu</label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full bg-[#1c1c22] border border-[#2d2d35] rounded-xl px-3.5 py-2.5 text-white outline-none"
                      >
                        <option value="Genel Sorular">Genel Sorular / Fiyat Bilgisi</option>
                        <option value="Kérastase Bakımları">Kérastase Paris Ritüelleri & K-SCAN</option>
                        <option value="Solaryum Seansları">Solaryum Seansları (Dakika Başı 50 TL)</option>
                        <option value="Gelin Saçı & Makyajı">Gelin Saçı & Makyajı Paketleri</option>
                        <option value="Balyaj & Renklendirme">Balyaj & Ombre Danışmanlığı</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400 font-black uppercase font-mono block">Sorunuz veya Mesajınız *</label>
                      <textarea
                        required
                        placeholder="Nasıl bir değişiklik hayal ediyorsunuz? Detayları yazın..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-[#1c1c22] border border-[#2d2d35] rounded-xl p-3 min-h-16 text-white placeholder-gray-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black tracking-wide rounded-xl uppercase transition-opacity hover:opacity-90 cursor-pointer"
                    >
                      Bize Sorun / Gönder →
                    </button>
                  </form>
                </div>

              </div>

              {publicAnsweredMessages.length > 0 && (
                <div className="pt-8 border-t border-gray-150 mt-8" id="home-client-questions-section">
                  <div className="mb-5">
                    <span className="text-xs text-[#dfa069] font-extrabold tracking-widest uppercase font-mono">Danışan İletişim & Fikir Talepleri</span>
                    <h3 className="mt-2 font-sans font-black text-2xl text-gray-950 tracking-tight">Sorular ve Cevaplar</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publicAnsweredMessages.map((msg) => (
                      <div key={msg.id} className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#a06b3e]">{msg.subject}</span>
                          <span className="text-[10px] text-gray-400">{msg.date}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="font-sans font-black text-sm text-gray-900">{msg.senderName}</p>
                          <p className="text-xs leading-relaxed text-gray-700">{msg.message}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                          <div className="mb-1 text-[10px] font-mono font-black uppercase tracking-[0.18em] text-emerald-700">Cevap</div>
                          <p className="text-xs leading-relaxed text-emerald-900">{msg.replyText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Maps Location Segment */}
              <div className="pt-8 border-t border-gray-150 mt-12" id="home-maps-segment">
                <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-4" id="address-map-card">
                  {(() => {
                    const resolvedMapUrl = resolveGoogleMapsEmbedUrl(
                      webContent.googleMapsIframeUrl,
                      webContent.salonAddressText,
                      webContent.salonName
                    );
                    const resolvedDirectionsUrl = resolveGoogleMapsDirectionsUrl(
                      webContent.googleMapsDirectionsUrl,
                      webContent.googleMapsIframeUrl,
                      webContent.salonAddressText || webContent.salonName
                    );

                    return (
                      <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-[#dfa069] flex items-center justify-center">
                              <MapPin className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="font-sans font-black text-sm text-gray-950">Salon Konumumuz & Navigasyon</h4>
                              <span className="text-[10px] text-gray-400 font-mono block uppercase">
                                {webContent.salonDistrictCity || 'Beyoğlu, İstanbul'}
                              </span>
                            </div>
                          </div>

                          {resolvedDirectionsUrl && (
                            <a
                              href={resolvedDirectionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black text-xs rounded-xl transition-transform active:scale-95 cursor-pointer shadow-md"
                            >
                              <Navigation className="h-3.5 w-3.5 fill-current text-gray-950" />
                              <span>Google Haritalarda Aç & Yol Tarifi Al</span>
                            </a>
                          )}
                        </div>

                        {resolvedMapUrl ? (
                          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
                            <iframe
                              src={resolvedMapUrl}
                              title={`${webContent.salonName || 'BK Kuaför'} Konumu`}
                              className="w-full h-full border-0"
                              allowFullScreen={true}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                        ) : null}

                        {webContent.salonAddressText && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <span className="text-xs text-[#a06b3e] font-extrabold shrink-0 uppercase font-mono bg-[#dfa069]/10 px-2.5 py-1 rounded-md">Salon Açık Adresi:</span>
                            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                              {webContent.salonAddressText}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

            </motion.div>
          )}

          {/* B. FİYAT TARİFESİ & HİZMETLERİMİZ VIEW */}
          {activeSection === 'services' && (
            <motion.div
              key="services-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
              id="services-screen-layout"
            >
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs text-[#a06b3e] font-black font-mono uppercase tracking-[0.2em]">
                  Resmi Fiyat Tarifesi
                </span>
                <h2 className="font-sans font-black text-3xl text-gray-950 tracking-tight">Hizmet Menümüz & Seans Tarifeleri</h2>
                <p className="text-gray-500 text-xs sm:text-sm">
                  İstanbul Kadın Kuaförleri Odası tarifesine uygun saç kesimi, renklendirme, perma, medikal kuru manikür, ağda, solaryum ve bakım işlemlerimiz.
                </p>
              </div>

              {/* Grid of services */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="services-grid-list">
                {services.map((srv) => (
                  <ServiceCard
                    key={srv.id}
                    service={srv}
                    onSelect={handleSelectServiceShortcut}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* C. KÉRASTASE DEDICATED VIEW */}
          {activeSection === 'kerastase' && (
            <motion.div
              key="kerastase-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <KerastaseView
                products={kerastaseProducts}
                onBookKerastaseService={handleSelectSpecialBooking}
              />
            </motion.div>
          )}

          {/* D. BLOG DEDICATED VIEW */}
          {activeSection === 'blog' && (
            <motion.div
              key="blog-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <BlogView
                posts={blogPosts}
                onBookService={handleSelectSpecialBooking}
              />
            </motion.div>
          )}

          {/* E. RANDEVU AL WIZARD VIEW (KVKK UYUMLU) */}
          {activeSection === 'booking' && (
            <motion.div
              key="booking-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <BookingWizard
                services={services}
                stylists={stylists}
                slotOptions={webContent.bookingSlots && webContent.bookingSlots.length ? webContent.bookingSlots : undefined}
                onAddAppointment={handleAddAppointment}
                initialSelectedService={selectedServiceForBooking}
                onGoToMyAppointments={() => changeSectionWithUrl('my-appointments')}
              />
            </motion.div>
          )}

          {/* F. RANDEVULARIM VIEW (KOD İLE SORGULAMA) */}
          {activeSection === 'my-appointments' && (
            <motion.div
              key="my-appointments-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <MyAppointmentsView
                appointments={appointments}
                onCancelAppointment={handleCancelAppointment}
                onAddReview={handleAddReview}
                onLookupAppointment={lookupAppointment}
              />
            </motion.div>
          )}

          {/* G. GALERİ VIEW */}
          {activeSection === 'gallery' && (
            <motion.div
              key="gallery-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
              id="gallery-layout"
            >
              <div className="rounded-[2rem] border border-[#d6c9ab] bg-[#f3efe5] p-4 sm:p-6 lg:p-8 shadow-[0_24px_80px_rgba(15,15,17,0.08)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-[#a06b3e] font-black font-mono uppercase tracking-[0.24em]">
                      {webContent.gallerySubtitle || "Çalışmalarımız"}
                    </span>
                    <h3 className="font-sans font-black text-2xl sm:text-4xl text-[#0f0f11] tracking-tight">
                      {webContent.galleryTitle || "BK Kuaför Sanat Galerisi"}
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#0f0f11] text-[#ebd6b8] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.18em] font-mono">
                    Portfolio
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[180px]">
                  {(webContent.galleryItems || []).map((item, idx) => {
                    const isVideo = item.mediaType === 'video' || Boolean(item.videoUrl);
                    const layoutClass = idx === 0
                      ? 'md:col-span-5 md:row-span-2'
                      : idx === 1
                        ? 'md:col-span-3'
                        : idx === 2
                          ? 'md:col-span-4'
                          : idx === 3
                            ? 'md:col-span-6'
                            : 'md:col-span-3';

                    return (
                      <figure
                        key={`${item.title}-${idx}`}
                        className={`group relative overflow-hidden rounded-[1.6rem] border border-[#d8d0bd] bg-[#0f0f11] shadow-[0_18px_40px_rgba(15,15,17,0.14)] ${layoutClass}`}
                      >
                        {isVideo ? (
                          <video
                            src={item.videoUrl || item.src}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                        ) : (
                          <img
                            src={item.src}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11]/80 via-[#0f0f11]/15 to-transparent" />
                        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f7f0dd] backdrop-blur-sm">
                          {isVideo ? 'Video' : 'Portföy'}
                        </div>
                        <figcaption className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 text-left">
                          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[#f7f0dd] backdrop-blur-sm">
                            {idx + 1}
                          </span>
                          <p className="mt-3 font-sans text-base sm:text-lg font-black text-white tracking-tight">
                            {item.title}
                          </p>
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* G2. SIKÇA SORULANLAR VIEW */}
          {activeSection === 'faq' && (
            <motion.div
              key="faq-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
              id="faq-layout"
            >
              <div className="rounded-[2rem] bg-[#111115] border border-[#222228] p-5 sm:p-8 shadow-[0_24px_80px_rgba(15,15,17,0.18)]">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-[#dfa069] font-black font-mono uppercase tracking-[0.24em]">
                      {webContent.faqSubtitle || "Sıkça Sorulanlar"}
                    </span>
                    <h3 className="mt-2 font-sans font-black text-2xl text-white tracking-tight">
                      {webContent.faqTitle || "Rezervasyon ve Salon Hizmetleri Hakkında Merak Edilenler"}
                    </h3>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2" id="faq-accordion-box">
                  {(webContent.faqs || []).map((faq, fidx) => {
                    const isOpen = expandedFaqIndex === fidx;

                    return (
                      <div
                        key={fidx}
                        className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                          isOpen
                            ? 'border-[#dfa069]/60 bg-[#18181d] shadow-[0_20px_50px_rgba(223,160,105,0.07)]'
                            : 'border-[#2a2a2d] bg-[#17171d] hover:border-[#3a3a41]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqIndex(isOpen ? null : fidx)}
                          className="flex w-full items-start justify-between gap-3 p-5 text-left"
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#dfa069]/30 bg-[#1d1d22] text-[#dfa069]">
                              <HelpCircle className="h-3.5 w-3.5" />
                            </span>
                            <h4 className="font-sans font-extrabold text-sm text-[#ebd6b8] leading-relaxed">
                              {faq.q}
                            </h4>
                          </div>

                          <span
                            className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 ${
                              isOpen
                                ? 'border-[#dfa069]/50 bg-[#dfa069]/10 text-[#f7d6aa]'
                                : 'border-white/10 bg-[#1b1b20] text-[#d6d5dd]'
                            }`}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <p className="px-5 pb-5 pt-1 text-xs leading-relaxed text-gray-300 pl-14">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* H. GELİŞMİŞ DİKEY YÖNETİCİ PANELİ (ADMIN VIEW) */}
          {activeSection === 'admin' && (
            <motion.div
              key="admin-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              {isAdminAuthenticated ? (
                <AdminDashboard
                  services={services}
                  stylists={stylists}
                  appointments={appointments}
                  reviews={reviews}
                  messages={messages}
                  webContent={webContent}
                  kerastaseProducts={kerastaseProducts}
                  blogPosts={blogPosts}
                  blockedPhones={blockedPhones}
                  notificationSettings={adminNotificationSettings}
                  onUpdateNotifications={setAdminNotificationSettings}
                  onUpdateAppointments={handleAdminAppointmentsUpdate}
                  onUpdateServices={setServices}
                  onUpdateStylists={setStylists}
                  onUpdateMessages={setMessages}
                  onUpdateReviews={setReviews}
                  onUpdateWebContent={setWebContent}
                  onUpdateKerastaseProducts={setKerastaseProducts}
                  onUpdateBlogPosts={setBlogPosts}
                  onUpdateBlockedPhones={handleBlockedPhonesUpdate}
                  onChangeAdminPassword={handleAdminPasswordChange}
                  onLogout={() => {
                    void logoutAdmin().catch(() => undefined);
                    sessionStorage.removeItem('is_admin_logged_in');
                    setIsAdminAuthenticated(false);
                  }}
                />
              ) : (
                <AdminLogin
                  onLoginSuccess={() => {
                    sessionStorage.setItem('is_admin_logged_in', 'true');
                    setIsAdminAuthenticated(true);
                  }}
                  onBackToHome={() => changeSectionWithUrl('home')}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. High contrast footer with Social Media Links & Logo */}
      <footer className="relative z-20 bg-[#0b0b0d] text-gray-400 border-t border-[#1e1e24] py-12 mt-16 text-xs text-center space-y-6" id="custom-app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-black border border-[#dfa069]/30 flex items-center justify-center">
              <img src={webContent.salonLogoUrl || '/bk-logo.jpg'} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-sans font-black text-white tracking-wider text-sm">
              {webContent.salonName || "BK KUAFÖR & BEAUTY"}
            </span>
          </div>

          {/* Social Links Row */}
          <div className="flex items-center space-x-4" id="footer-social-links">
            {webContent.socialLinks?.instagram && webContent.socialLinks.instagramVisible !== false && (
              <a href={webContent.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#17171d] hover:bg-[#252530] text-[#dfa069] rounded-xl transition-all" title="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {webContent.socialLinks?.facebook && webContent.socialLinks.facebookVisible !== false && (
              <a href={webContent.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#17171d] hover:bg-[#252530] text-[#dfa069] rounded-xl transition-all" title="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {webContent.socialLinks?.tiktok && webContent.socialLinks.tiktokVisible !== false && (
              <a href={webContent.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#17171d] hover:bg-[#252530] text-[#dfa069] rounded-xl transition-all" title="TikTok">
                <Video className="h-4 w-4" />
              </a>
            )}
            {webContent.socialLinks?.xTwitter && webContent.socialLinks.xTwitterVisible !== false && (
              <a href={webContent.socialLinks.xTwitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#17171d] hover:bg-[#252530] text-[#dfa069] rounded-xl transition-all" title="X (Twitter)">
                <Twitter className="h-4 w-4" />
              </a>
            )}
          </div>

          <p className="text-gray-500">
            {webContent.footerCopyrightAndAddress || `© ${webContent.salonName || "BK Kuaför"} • ${webContent.salonDistrictCity || "Beyoğlu, İstanbul."}`}
          </p>

          <div className="flex space-x-4 font-mono text-xs">
            <a href={`tel:${(webContent.footerPhone || "").replace(/[^0-9+]/g, '')}`} className="hover:text-white font-bold text-[#ebd6b8]">{webContent.footerPhone || "0(212) 243 20 20"}</a>
            <span className="text-gray-700">•</span>
            <span className="text-gray-500">{webContent.footerWorkingHours || "Pazartesi İzinli, Salı-Pazar 09:00-19:30"}</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Trigger */}
      {((webContent.socialLinks?.whatsapp && webContent.socialLinks.whatsappVisible !== false) || (webContent.whatsappNumber && webContent.socialLinks?.whatsappVisible !== false)) && (
        <a
          href={getFormattedWhatsappUrl(webContent.socialLinks?.whatsapp || webContent.whatsappNumber || '', webContent.whatsappMessage || '')}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp ile İletişime Geçin"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce cursor-pointer group"
          id="global-floating-whatsapp"
        >
          <MessageCircle className="h-7 w-7 fill-white/10 text-white transition-transform group-hover:rotate-12" />
          <span className="absolute right-16 bg-gray-950 text-[#ebd6b8] text-[10px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg border border-gray-800 uppercase tracking-widest font-mono">
            WhatsApp Destek
          </span>
        </a>
      )}
    </div>
  );
}
