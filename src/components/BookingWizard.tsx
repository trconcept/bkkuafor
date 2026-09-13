import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clock, Calendar, ChevronRight, ChevronLeft, Scissors, Star, UserPlus, FileText, CheckCircle, ShieldCheck, Copy, Check, ArrowRight, Search, Tag } from 'lucide-react';
import { SalonService, Stylist, Appointment } from '../types';
import { SALON_SERVICES, SALON_STYLISTS } from '../data';
import { normalizeTurkishMobilePhone } from '../utils/phone';

type BookingSubmission = Omit<Appointment, 'id' | 'createdAt' | 'customerPhone'> & {
  customerPhone: string;
  website: string;
  clientStartedAt: number;
};

interface BookingWizardProps {
  services?: SalonService[];
  stylists?: Stylist[];
  slotOptions?: string[];
  onAddAppointment: (appointment: BookingSubmission) => Promise<string> | string;
  initialSelectedService?: SalonService | null;
  onGoToMyAppointments?: () => void;
  kscanComingSoon?: boolean;
}

export default function BookingWizard({
  services = SALON_SERVICES,
  stylists = SALON_STYLISTS,
  slotOptions,
  onAddAppointment,
  initialSelectedService = null,
  onGoToMyAppointments,
  kscanComingSoon = true
}: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<SalonService[]>(() => {
    return initialSelectedService ? [initialSelectedService] : [];
  });
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Search & Category filter inside Step 1
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Post-booking confirmation state
  const [completedTrackingCode, setCompletedTrackingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formStartedAt = useRef(Date.now());
  const phoneFormatError = customerPhone.trim() && !normalizeTurkishMobilePhone(customerPhone)
    ? '05xx xxx xx xx biçiminde geçerli bir cep telefonu girin.'
    : '';

  // Filtered services for step 1
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchCategory = serviceCategoryFilter === 'all' || srv.category === serviceCategoryFilter;
      const matchSearch = !serviceSearch.trim() || 
        srv.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        srv.description.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (srv.customPriceText && srv.customPriceText.toLowerCase().includes(serviceSearch.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [services, serviceCategoryFilter, serviceSearch]);

  // Generate next 7 days list programmatically
  const getNext7Days = () => {
    const days = [];
    const locale = 'tr-TR';
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        fullDate: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString(locale, { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString(locale, { month: 'short' }),
        isWeekend
      });
    }
    return days;
  };

  const next7Days = getNext7Days();

  // Handle service toggling
  const handleToggleService = (service: SalonService) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const totalMinutes = selectedServices.reduce((acc, s) => acc + s.duration, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);
  const hasFlexiblePrice = selectedServices.some((s) => s.priceType === 'free' || s.customPriceText?.includes('SERBEST') || s.customPriceText?.includes('Dakika'));

  const stepLabels = [
    { num: 1, label: 'Hizmet Seçimi', icon: <Scissors className="h-4.5 w-4.5" /> },
    { num: 2, label: 'Stylist / Uzman', icon: <UserPlus className="h-4.5 w-4.5" /> },
    { num: 3, label: 'Tarih & Saat', icon: <Calendar className="h-4.5 w-4.5" /> },
    { num: 4, label: 'Onay & Kod Üretimi', icon: <FileText className="h-4.5 w-4.5" /> },
  ];

  const defaultSlots = slotOptions && slotOptions.length ? slotOptions : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const activeSlots = selectedStylist && selectedStylist.availableSlots && selectedStylist.availableSlots.length ? selectedStylist.availableSlots : defaultSlots;

  const handleFinalizeBooking = async () => {
    if (!customerName.trim()) {
      alert('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }

    const normalizedPhone = normalizeTurkishMobilePhone(customerPhone);
    if (!customerPhone.trim()) {
      setSubmitError('Telefon numarası zorunludur.');
      return;
    }

    if (!normalizedPhone) {
      setSubmitError('05xx xxx xx xx biçiminde geçerli bir cep telefonu girin.');
      return;
    }

    if (!selectedStylist) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const trackingCode = await onAddAppointment({
        trackingCode: '',
        customerName: customerName.trim(),
        customerPhone: normalizedPhone,
        services: selectedServices,
        stylist: selectedStylist,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        totalPrice,
        priceNote: hasFlexiblePrice ? 'Esnek / Serbest Tarife İşlemi İçerir' : undefined,
        status: 'pending',
        notes: notes.trim() || undefined,
        website: '',
        clientStartedAt: formStartedAt.current
      });
      setCompletedTrackingCode(trackingCode);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Randevu oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!completedTrackingCode) return;
    navigator.clipboard.writeText(completedTrackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="py-6 max-w-6xl mx-auto" id="booking-wizard-layout">
      
      {/* Editorial Titles */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="text-xs text-[#cba358] tracking-[0.2em] font-bold font-mono uppercase bg-[#dfa069]/10 border border-[#dfa069]/20 px-3 py-1 rounded-full inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#dfa069]" />
          KVKK UYUMLU GÜVENLİ REZERVASYON
        </span>
        <h2 className="font-sans font-black text-3xl text-gray-950 tracking-tight">
          Lüks Salon Deneyiminizi Planlayın
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm">
          Telefon numarası zorunlu olarak alınır; sistem sahte ve tekrarlayan randevuları engeller ve size özel takip kodu ile işlemi güvenli şekilde tamamlar.
        </p>
      </div>

      {/* SUCCESS CONFIRMATION MODAL CARD */}
      {completedTrackingCode ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-[#dfa069] p-8 md:p-12 shadow-2xl max-w-2xl mx-auto text-center space-y-6"
          id="booking-success-card"
        >
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-black text-[#dfa069] uppercase tracking-widest">
              REZERVASYONUNUZ ALINDI
            </span>
            <h3 className="font-sans font-black text-2xl sm:text-3xl text-gray-950">
              Tebrikler, {customerName}!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Randevunuz salon sistemimize başarıyla iletildi. Randevunuzu sorgulamak ve durumunu kontrol etmek için aşağıdaki benzersiz takip kodunu saklayınız.
            </p>
          </div>

          {/* Unique Code Display Box */}
          <div className="bg-[#0f0f11] text-white rounded-2xl p-6 border border-[#2d2d38] space-y-3 shadow-inner">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-widest block">
              SİZE ÖZEL RANDEVU TAKİP KODUNUZ
            </span>
            
            <div className="flex items-center justify-center space-x-3">
              <span className="font-mono font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#ebd6b8] via-[#dfa069] to-[#ebd6b8] tracking-wider">
                {completedTrackingCode}
              </span>
              
              <button
                onClick={handleCopyCode}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-[#ebd6b8] rounded-xl transition-all active:scale-90 cursor-pointer"
                title="Kodu Kopyala"
              >
                {copiedCode ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>

            <span className="text-[10px] text-amber-300/80 font-mono block">
              {copiedCode ? '✓ Kod panoya kopyalandı!' : 'Kopyalamak için butona tıklayın'}
            </span>
          </div>

          {/* Appointment summary details */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-left">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Tarih</span>
              <span className="font-bold text-gray-800">{selectedDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Saat</span>
              <span className="font-bold text-gray-800">{selectedTimeSlot}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Stilist</span>
              <span className="font-bold text-gray-800">{selectedStylist?.name}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {onGoToMyAppointments && (
              <button
                onClick={onGoToMyAppointments}
                className="px-6 py-3.5 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <span>Randevularım Sayfasına Git</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => {
                setCompletedTrackingCode(null);
                setStep(1);
                setSelectedServices([]);
                setSelectedStylist(null);
                setSelectedDate('');
                setSelectedTimeSlot('');
                setCustomerName('');
                setNotes('');
              }}
              className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Yeni Bir Randevu Al
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Progress Wizard Tabs */}
          <div className="bg-[#131317] rounded-3xl p-4 border border-[#222226] max-w-4xl mx-auto mb-8 flex justify-between items-center flex-wrap gap-4" id="progress-tabs">
            {stepLabels.map((sl) => (
              <div key={sl.num} className="flex items-center space-x-3" id={`progress-step-${sl.num}`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= sl.num
                    ? 'bg-gradient-to-tr from-[#dfa069] to-[#cba358] text-[#0f0f11]'
                    : 'bg-[#1c1c22] text-[#8e8d97] border border-[#222226]'
                }`}>
                  {sl.icon}
                </div>
                <div className="hidden sm:block flex flex-col">
                  <span className={`text-[9px] font-mono tracking-wider uppercase ${step >= sl.num ? 'text-[#cba358]' : 'text-[#63626c]'}`}>
                    Adım {sl.num}
                  </span>
                  <span className={`text-xs font-bold ${step >= sl.num ? 'text-white' : 'text-[#8e8d97]'}`}>
                    {sl.label}
                  </span>
                </div>
                {sl.num < 4 && (
                  <ChevronRight className="h-4 w-4 hidden md:block text-[#2d2d35]" />
                )}
              </div>
            ))}
          </div>

          {/* Core Split Form Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="main-booking-grid">
            
            {/* Left Side Active Step Workspace */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm min-h-[480px] flex flex-col justify-between" id="wizard-workspace">
              <div>
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: HİZMET SEÇİMİ (Kategori Filtreli & Aramalı) */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-150 pb-3">
                        <div>
                          <h3 className="font-sans font-black text-xl text-gray-950 tracking-tight">Hizmet Seçimi Yapın</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Fiyat tarifemizdeki tüm kuaför, bakım, tırnak, ağda ve solaryum işlemlerimiz ({services.length} Hizmet).
                          </p>
                        </div>

                        {/* Search in Services */}
                        <div className="relative w-full sm:w-56">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="İşlem ara (Solaryum, Balyaj)..."
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold placeholder-gray-400 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Category Chips Scroll */}
                      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-thin">
                        {[
                          { id: 'all', label: 'Tümü' },
                          { id: 'sac-kesim', label: 'Saç Grubu' },
                          { id: 'boyama', label: 'Boya & Balyaj' },
                          { id: 'perma-duzlestirme', label: 'Perma & Keratin' },
                          { id: 'el-ayak', label: 'Manikür & Tırnak' },
                          { id: 'agda', label: 'Ağda Grubu' },
                          { id: 'bakim', label: 'Bakım Ürünleri' },
                          { id: 'makyaj-gelin', label: 'Gelin & Makyaj' },
                          { id: 'ozel-islemler', label: 'Solaryum & K-Scan' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setServiceCategoryFilter(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all cursor-pointer ${
                              serviceCategoryFilter === cat.id
                                ? 'bg-[#0f0f11] text-[#ebd6b8] font-black'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Service Cards Roster */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin" id="wizard-service-list">
                        {filteredServices.length === 0 ? (
                          <div className="col-span-2 text-center py-10 text-gray-400 text-xs">
                            Aramanıza uygun işlem bulunamadı.
                          </div>
                        ) : (
                          filteredServices.map((serv) => {
                            const isKscanService = serv.id === 'srv-ozel-2' || serv.name.toLowerCase().includes('k-scan');
                            const isServiceDisabled = isKscanService && kscanComingSoon;
                            const isSelected = selectedServices.some((s) => s.id === serv.id);
                            const priceLabel = isServiceDisabled
                              ? 'Yakında'
                              : (serv.showPrice === false 
                                ? 'Fiyat Danışınız' 
                                : (serv.customPriceText || (serv.price ? `₺${serv.price}` : 'SERBEST')));

                            return (
                              <div
                                key={serv.id}
                                onClick={() => {
                                  if (isServiceDisabled) return;
                                  handleToggleService(serv);
                                }}
                                id={`wizard-check-${serv.id}`}
                                className={`p-3.5 rounded-2xl border-2 transition-all flex gap-3 ${
                                  isServiceDisabled
                                    ? 'border-gray-200 bg-gray-100/70 opacity-65 cursor-not-allowed'
                                    : isSelected
                                      ? 'border-[#dfa069] bg-amber-50/25 shadow-sm cursor-pointer'
                                      : 'border-gray-150 hover:border-gray-200 bg-gray-50/40 hover:bg-white cursor-pointer'
                                }`}
                              >
                                <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isServiceDisabled
                                    ? 'border-gray-300 bg-gray-200 text-gray-400'
                                    : isSelected ? 'bg-[#dfa069] border-[#dfa069] text-gray-900 font-bold' : 'border-gray-300 bg-white'
                                }`}>
                                  {isSelected && !isServiceDisabled && <span className="text-[10px]">✓</span>}
                                  {isServiceDisabled && <span className="text-[10px]">✕</span>}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-1">
                                    <h4 className="font-sans font-bold text-xs text-gray-900 truncate">{serv.name}</h4>
                                    <span className={`font-sans font-black text-xs shrink-0 font-mono ${isServiceDisabled ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md text-[10px]' : 'text-[#a06b3e]'}`}>
                                      {priceLabel}
                                    </span>
                                  </div>
                                  <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-1 mt-0.5">
                                    {isServiceDisabled ? 'Bu cihaz yakında salonumuzda hizmete girecektir. Şu an randevuya kapalıdır.' : serv.description}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 mt-1.5">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span>{serv.duration} Dakika</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: STYLIST SEÇİMİ */}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-gray-150 pb-3">
                        <h3 className="font-sans font-black text-xl text-gray-950 tracking-tight">Uzman Stilist Seçin</h3>
                        <p className="text-xs text-gray-500 mt-1">İşleminizi gerçekleştirecek usta salon ekibimizden dilediğinizi seçin.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="wizard-stylist-list">
                        <div
                          onClick={() => setSelectedStylist({
                            id: 'st-any',
                            name: 'Farketmez / İlk Müsait Uzman',
                            role: 'Müsait Olan İlk Usta Stilist',
                            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
                            rating: 4.9,
                            reviewsCount: 300,
                            specialities: ['Tüm Salon Hizmetleri'],
                            availableSlots: defaultSlots
                          })}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex gap-4 items-center ${
                            selectedStylist?.id === 'st-any'
                              ? 'border-[#dfa069] bg-amber-50/20'
                              : 'border-gray-150 hover:border-gray-200'
                          }`}
                        >
                          <div className="h-12 w-12 bg-[#ebd6b8] text-gray-900 rounded-full flex items-center justify-center font-black text-lg">
                            ★
                          </div>
                          <div>
                            <h4 className="font-sans font-bold text-sm text-gray-900">En Hızlı Randevu (Fark Etmez)</h4>
                            <p className="text-gray-400 text-xs mt-0.5">Randevu saatine uygun usta atanacaktır.</p>
                          </div>
                        </div>

                        {stylists.map((sty) => {
                          const isSelected = selectedStylist?.id === sty.id;
                          return (
                            <div
                              key={sty.id}
                              onClick={() => setSelectedStylist(sty)}
                              id={`stylist-card-select-${sty.id}`}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex gap-4 ${
                                isSelected
                                  ? 'border-[#dfa069] bg-amber-50/20'
                                  : 'border-gray-150 hover:border-[#dfa069]/30 hover:bg-gray-50/40'
                              }`}
                            >
                              <div className="h-14 w-14 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                <img src={sty.avatar} alt={sty.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-sans font-black text-sm text-gray-900 truncate">{sty.name}</h4>
                                <p className="text-[11px] text-[#a06b3e] font-bold tracking-tight leading-none mt-0.5">{sty.role}</p>
                                <div className="flex items-center space-x-1.5 text-xs text-amber-500 font-bold mt-1.5">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span>{sty.rating}</span>
                                  <span className="text-gray-400 font-medium">({sty.reviewsCount} Puan)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: TARİH & SAAT SEÇİMİ */}
                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-gray-150 pb-3">
                        <h3 className="font-sans font-black text-xl text-gray-950 tracking-tight">Tarih & Saat Seçimi</h3>
                        <p className="text-xs text-gray-500 mt-1">Geniş zaman dilimlerinden uygun olan randevu aralığını seçin.</p>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-bold text-gray-800 uppercase block font-mono">1. Randevu Günü Seçin:</span>
                        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none" id="date-slider">
                          {next7Days.map((day) => {
                            const isSelected = selectedDate === day.fullDate;
                            return (
                              <button
                                key={day.fullDate}
                                id={`date-button-${day.fullDate}`}
                                onClick={() => {
                                  setSelectedDate(day.fullDate);
                                  setSelectedTimeSlot('');
                                }}
                                className={`flex flex-col items-center p-3 rounded-2xl border min-w-16 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-t from-[#0f0f11] to-[#25252d] text-white border-[#dfa069]'
                                    : 'bg-gray-50 border-gray-150 text-gray-600 hover:border-gray-200'
                                }`}
                              >
                                <span className="text-[10px] font-mono tracking-wider uppercase">{day.monthName}</span>
                                <span className="text-xl font-black mt-0.5">{day.dayNum}</span>
                                <span className="text-[10px] font-bold mt-0.5">{day.dayName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {selectedDate && (
                        <div className="space-y-3 pt-2">
                          <span className="text-xs font-bold text-gray-800 uppercase block font-mono">2. Saat Dilimi Seçin:</span>
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2" id="time-slots">
                            {activeSlots.map((slot) => {
                              const isSelected = selectedTimeSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  id={`time-slot-${slot.replace(':', '-')}`}
                                  onClick={() => setSelectedTimeSlot(slot)}
                                  className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all text-center cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#dfa069] text-gray-900 border-[#dfa069] shadow-md'
                                      : 'bg-white border-gray-150 text-gray-700 hover:border-gray-200 hover:bg-gray-50/50'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 4: MÜŞTERİ BİLGİLERİ VE ONAY */}
                  {step === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-gray-150 pb-3">
                        <h3 className="font-sans font-black text-xl text-gray-950 tracking-tight">Müşteri Bilgileri & Onay</h3>
                        <p className="text-xs text-gray-500 mt-1">Telefon numarası zorunludur; aynı numara ve aynı saat tekrar eden talepler engellenir.</p>
                      </div>

                      <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-[#dfa069] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Kişisel Veri Gizliliği Güvencesi:</span>
                          Randevunuzu tamamladığınızda size benzersiz bir takip kodu üretilecektir. Randevunuzu bu kodla sorgulayabilirsiniz.
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="customer-form">
                             <input
                               type="text"
                               name="website"
                               tabIndex={-1}
                               autoComplete="off"
                               aria-hidden="true"
                               className="absolute -left-[9999px] h-px w-px opacity-0"
                               value=""
                               onChange={() => undefined}
                             />
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase font-mono block">Müşteri Adı Soyadı *</label>
                          <input
                            id="customer-name-input"
                            type="text"
                            required
                            placeholder="Örn: Melis Ersoy"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 focus:bg-white transition-all"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase font-mono block">Telefon Numarası *</label>
                          <input
                            id="customer-phone-input"
                            type="tel"
                            required
                            placeholder="örn: 0505 123 45 67"
                            value={customerPhone}
                            autoComplete="tel"
                            inputMode="tel"
                            onChange={(e) => {
                              setCustomerPhone(e.target.value);
                              setSubmitError(null);
                            }}
                            aria-invalid={Boolean(phoneFormatError)}
                            aria-describedby="customer-phone-hint"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 focus:bg-white transition-all"
                          />
                          <p id="customer-phone-hint" className={`text-[10px] font-semibold ${phoneFormatError ? 'text-red-600' : 'text-gray-500'}`}>
                            {phoneFormatError || '05xx, +905xx veya 0090 5xx formatları kabul edilir.'}
                          </p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase font-mono block">İşlem & Özel İstek Notları</label>
                          <textarea
                            id="booking-notes-input"
                            placeholder="İstediğiniz saç tonu, solaryum seans dakikası veya özel isteklerinizi yazabilirsiniz..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-bold text-gray-800 min-h-20 focus:bg-white transition-all resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Wizard bottom navigation controls */}
              <div className="mt-8 pt-4 border-t border-gray-150 flex items-center justify-between">
                <button
                  id="booking-prev-btn"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-4.5 py-3 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-150 disabled:opacity-40 cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Geri Dön</span>
                </button>

                {step < 4 ? (
                  <button
                    id="booking-next-btn"
                    onClick={() => {
                      if (step === 1 && selectedServices.length === 0) {
                        alert('Lütfen en az bir hizmet seçin.');
                        return;
                      }
                      if (step === 2 && !selectedStylist) {
                        alert('Lütfen bir uzman stilist seçimi yapın.');
                        return;
                      }
                      if (step === 3 && (!selectedDate || !selectedTimeSlot)) {
                        alert('Lütfen randevu tarihi ve saati seçin.');
                        return;
                      }
                      setStep((s) => Math.min(4, s + 1));
                    }}
                    className="px-6 py-3 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-[#0f0f11] rounded-xl text-xs font-black tracking-wide shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                  >
                    <span>İleri Adım</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    id="booking-submit-btn"
                    onClick={handleFinalizeBooking}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 bg-gradient-to-r from-[#dfa069] to-[#cba358] hover:opacity-90 text-gray-950 font-sans font-black text-xs tracking-wider uppercase rounded-xl flex items-center space-x-2 shadow-lg cursor-pointer transition-all"
                  >
                    <CheckCircle className="h-4 w-4 stroke-[2.5]" />
                    <span>{isSubmitting ? 'WHATSAPP AÇILIYOR...' : 'WHATSAPP’TAN RANDEVU TALEBİ GÖNDER'}</span>
                  </button>
                )}
              </div>
               {submitError && (
                 <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700" role="alert">
                   {submitError}
                 </p>
               )}

            </div>

            {/* Right Side Instant Appointment Receipt summary */}
            <div className="lg:col-span-4 bg-[#131317] rounded-3xl p-6 border border-[#222226] text-white space-y-6" id="wizard-summary-panel">
              
              <div className="border-b border-[#2d2d35] pb-4 flex items-center justify-between">
                <h4 className="font-sans font-extrabold text-[#ebd6b8] text-sm tracking-wide">Rezervasyon Özeti</h4>
                <span className="text-[10px] font-mono font-bold bg-[#dfa069]/10 text-[#dfa069] px-2.5 py-0.5 rounded-full border border-[#dfa069]/20">
                  Canlı Tarife
                </span>
              </div>

              {/* Selected Services Receipt */}
              <div className="space-y-3" id="summary-service-lines">
                <span className="text-[9px] font-mono tracking-wider text-[#63626c] uppercase block">Seçilen Hizmetler:</span>
                {selectedServices.length === 0 ? (
                  <p className="text-[#8e8d97] text-xs italic">Henüz hizmet seçimi yapılmadı.</p>
                ) : (
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    {selectedServices.map((s) => (
                      <div key={s.id} className="flex justify-between items-start text-xs text-[#d6d5dd]">
                        <span className="line-clamp-1 flex-1 pr-2">+ {s.name}</span>
                        <span className="font-mono text-white text-[11px] shrink-0">
                          {s.showPrice === false 
                            ? 'Danışınız' 
                            : (s.customPriceText || (s.price ? `₺${s.price}` : 'SERBEST'))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chosen Stylist Receipt */}
              <div className="space-y-2.5 pt-3 border-t border-[#1f1f25]" id="summary-stylist-block">
                <span className="text-[9px] font-mono tracking-wider text-[#63626c] uppercase block">Seçilen Uzman:</span>
                {selectedStylist ? (
                  <div className="flex items-center space-x-3 bg-[#1e1e24] p-2.5 rounded-xl border border-[#2d2d35]">
                    <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-[#cba358]/20">
                      <img src={selectedStylist.avatar} alt={selectedStylist.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{selectedStylist.name}</h5>
                      <span className="text-[9.5px] text-[#8e8d97] block truncate">{selectedStylist.role}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#8e8d97] text-xs italic">Uzman seçimi yapılmadı.</p>
                )}
              </div>

              {/* Time & Scheduling date Receipt */}
              <div className="space-y-2.5 pt-3 border-t border-[#1f1f25]" id="summary-time-block">
                <span className="text-[9px] font-mono tracking-wider text-[#63626c] uppercase block font-medium">Seçilen Zaman:</span>
                {selectedDate && selectedTimeSlot ? (
                  <div className="flex items-center space-x-2.5 bg-[#dfa069]/5 text-[#dfa069] border border-[#dfa069]/15 p-2.5 rounded-xl text-xs font-bold font-mono">
                    <Clock className="h-4 w-4 text-[#dfa069]" />
                    <span>{selectedDate} • Saat {selectedTimeSlot}</span>
                  </div>
                ) : (
                  <p className="text-[#8e8d97] text-xs italic">Tarih rezerve edilmedi.</p>
                )}
              </div>

              {/* Calculation Bottom Receipts */}
              <div className="pt-4 border-t border-[#2d2d35] space-y-3" id="summary-total-receipt">
                <div className="flex justify-between text-xs text-[#8e8d97] font-mono">
                  <span>Toplam Tahmini Süre:</span>
                  <span className="font-semibold text-white">{totalMinutes} dk</span>
                </div>
                
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-extrabold text-[#ebd6b8]">Tarife Bilgisi:</span>
                  <span className="font-sans font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e2be89] to-[#ebd6b8]">
                    {hasFlexiblePrice ? 'Tarife / Serbest' : `₺${totalPrice}`}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
