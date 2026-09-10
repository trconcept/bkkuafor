import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Clock, Scissors, UserCheck, XCircle, CheckCircle, RefreshCw, MessageSquare, Star, KeyRound, Copy, Check } from 'lucide-react';
import { Appointment, SalonReview } from '../types';

interface MyAppointmentsViewProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onAddReview: (review: Omit<SalonReview, 'id' | 'date'>) => void;
  onLookupAppointment?: (trackingCode: string) => Promise<Appointment[]>;
}

export default function MyAppointmentsView({
  appointments,
  onCancelAppointment,
  onAddReview,
  onLookupAppointment,
}: MyAppointmentsViewProps) {
  const [trackingCode, setTrackingCode] = useState('');
  const [searchedCode, setSearchedCode] = useState('');
  const [selectedReviewAppointmentId, setSelectedReviewAppointmentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lookupResults, setLookupResults] = useState<Appointment[] | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  
  // Rating form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = trackingCode.trim().toUpperCase();
    setSearchedCode(code);
    setLookupResults(null);
    setLookupError(null);
    if (onLookupAppointment && code) {
      try {
        setLookupResults(await onLookupAppointment(code));
      } catch (error) {
        if (error instanceof Error && !error.message.includes('bulunamadı')) {
          setLookupError(error.message);
        } else {
          setLookupResults([]);
        }
      }
    }
  };

  // Filter appointments that match the typed tracking code (or partial match)
  const cleanSearch = searchedCode.replace(/[\s-]/g, '').toUpperCase();
  const matchedAppointments = searchedCode
    ? (lookupResults ?? appointments).filter((app) => {
        const appCode = (app.trackingCode || app.id).replace(/[\s-]/g, '').toUpperCase();
        return appCode.includes(cleanSearch);
      })
    : [];

  const handleCancelClick = (appId: string) => {
    if (window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      onCancelAppointment(appId);
    }
  };

  const handleReviewSubmit = (app: Appointment) => {
    if (!reviewComment.trim()) {
      alert('Lütfen stylistlerimize ve aldığınız hizmete ilişkin yorumunuzu yazın.');
      return;
    }

    onAddReview({
      customerName: app.customerName,
      comment: reviewComment,
      rating: reviewRating,
      serviceCategory: app.services[0]?.name || 'Saç Tasarımı'
    });

    setSelectedReviewAppointmentId(null);
    setReviewComment('');
    setReviewRating(5);
    alert('Yorumunuz için çok teşekkür ederiz! Başarıyla yayınlandı.');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-8" id="my-appointments-view">
      
      {/* Search Header cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4 text-center max-w-2xl mx-auto">
        <div className="h-12 w-12 bg-[#dfa069]/10 text-[#dfa069] rounded-full flex items-center justify-center mx-auto mb-2">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="font-sans font-black text-2xl text-gray-950 tracking-tight">Randevu Takip Kodu ile Sorgulama</h2>
        <p className="text-gray-500 text-xs leading-relaxed">
          KVKK veri güvenliği gereğince telefon numarası saklanmamaktadır. Randevu oluştururken size verilen benzersiz takip kodunu yazarak randevunuzun onay durumunu kontrol edebilir veya iptal edebilirsiniz.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto pt-2" id="tracking-search-form">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="lookup-tracking-input"
              type="text"
              placeholder="Randevu takip kodunuzu girin"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="w-full bg-gray-50 border border-gray-150 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-gray-800 placeholder-gray-400 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#dfa069]/20 focus:border-[#dfa069] focus:bg-white transition-all"
            />
          </div>
          <button
            id="search-appointment-btn"
            type="submit"
            className="px-5 py-3 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Sorgula
          </button>
        </form>

      </div>

      {/* Searched Area */}
      {searchedCode && (
        <div className="space-y-6" id="search-results-section">
          <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
            <h3 className="font-sans font-black text-lg text-gray-950">
              Sorgulama Sonuçları ({matchedAppointments.length})
            </h3>
            <span className="text-xs text-gray-400 font-mono">Takip Kodu: "{searchedCode}"</span>
          </div>

          {matchedAppointments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100" id="search-empty-state">
              <p className="text-3xl">🔍</p>
              <h4 className="font-sans font-bold text-base text-gray-800 mt-2">Kayıt Bulunamadı</h4>
              <p className="text-gray-500 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                "{searchedCode}" koduna ait aktif veya geçmiş bir randevu kaydı bulunamamıştır. Lütfen kodunuzu kontrol ediniz.
              </p>
              {lookupError && <p className="mt-3 text-xs font-bold text-red-600">{lookupError}</p>}
            </div>
          ) : (
            <div className="space-y-5" id="appointment-records-list">
              <AnimatePresence>
                {matchedAppointments.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative"
                  >
                    {/* Event Status overlay strip */}
                    <div className="absolute top-0 left-6 h-1 w-24 rounded-b-lg overflow-hidden">
                      <div className={`h-full w-full ${
                        app.status === 'pending' ? 'bg-orange-400' :
                        app.status === 'approved' ? 'bg-[#cba358]' :
                        app.status === 'completed' ? 'bg-emerald-500' : 'bg-red-400'
                      }`} />
                    </div>

                    {/* Salon details side */}
                    <div className="space-y-3.5 flex-1 min-w-0">
                      
                      {/* Booking status label */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center space-x-1.5 bg-[#0f0f11] text-[#ebd6b8] px-3 py-1 rounded-xl font-mono text-xs font-black">
                          <span>KOD: {app.trackingCode || app.id}</span>
                          <button
                            onClick={() => handleCopyCode(app.trackingCode || app.id)}
                            className="text-gray-400 hover:text-white cursor-pointer ml-1"
                            title="Kodu Kopyala"
                          >
                            {copiedId === (app.trackingCode || app.id) ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-mono font-bold rounded-full ${
                          app.status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          app.status === 'approved' ? 'bg-[#dfa069]/10 text-[#a06b3e] border border-[#dfa069]/20' :
                          app.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-gray-50 text-gray-500 border border-gray-150 line-through'
                        }`}>
                          {app.status === 'pending' && 'Yönetici Onayı Bekleniyor'}
                          {app.status === 'approved' && 'Randevu Onaylandı'}
                          {app.status === 'completed' && 'Tamamlandı'}
                          {app.status === 'cancelled' && 'İptal Edildi'}
                        </span>
                      </div>

                      {/* Customer Name & Service name */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-800 block">
                          Danışan: <span className="font-extrabold text-gray-950">{app.customerName}</span>
                        </span>
                        <h4 className="font-sans font-black text-base text-gray-900 leading-tight">
                          {app.services.map((s) => s.name).join(' + ')}
                        </h4>
                        <p className="text-gray-500 text-xs">
                          Toplam Süre: <span className="font-mono font-bold text-gray-700">{app.services.reduce((c, s) => c + s.duration, 0)} dk</span>
                          {app.totalPrice > 0 && (
                            <> • Tarife: <span className="font-mono font-bold text-[#a06b3e]">₺{app.totalPrice}</span></>
                          )}
                          {app.priceNote && (
                            <span className="text-gray-400 italic block mt-0.5 font-mono text-[10px]">{app.priceNote}</span>
                          )}
                        </p>
                      </div>

                      {/* Stylist & scheduling timeline */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-gray-50 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[9px] text-gray-400 block font-mono uppercase">Tarih</span>
                            <span className="font-bold">{app.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[9px] text-gray-400 block font-mono uppercase">Saat</span>
                            <span className="font-bold">{app.timeSlot}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                          <div className="h-7 w-7 rounded-full overflow-hidden border border-gray-150 shrink-0">
                            <img src={app.stylist.avatar} alt={app.stylist.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] text-gray-400 block font-mono uppercase">Uzman Stilist</span>
                            <span className="font-bold truncate text-xs block">{app.stylist.name}</span>
                          </div>
                        </div>
                      </div>

                      {app.notes && (
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-[11px] text-gray-500 italic mt-3">
                          <span className="font-bold font-sans not-italic text-gray-700 block mb-0.5">Notunuz:</span>
                          "{app.notes}"
                        </div>
                      )}
                    </div>

                    {/* Actions controls buttons */}
                    <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 md:border-l md:border-gray-100 md:pl-6 pt-4 md:pt-0" id={`actions-${app.id}`}>
                      {app.status === 'pending' && (
                        <button
                          id={`cancel-appointment-btn-${app.id}`}
                          onClick={() => handleCancelClick(app.id)}
                          className="w-full md:w-36 px-4 py-2.5 bg-red-50 text-red-650 hover:bg-red-100 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Randevuyu İptal Et</span>
                        </button>
                      )}

                      {app.status === 'approved' && (
                        <div className="text-center py-2 px-3 bg-[#dfa069]/5 text-[#a06b3e] border border-[#dfa069]/20 rounded-xl text-xs font-bold leading-tight flex items-center gap-1.5">
                          <UserCheck className="h-4 w-4 stroke-[2]" />
                          <span>Rezervasyon Onaylandı!</span>
                        </div>
                      )}

                      {app.status === 'completed' && (
                        <div className="space-y-2">
                          <button
                            id={`add-review-btn-${app.id}`}
                            onClick={() => setSelectedReviewAppointmentId(
                              selectedReviewAppointmentId === app.id ? null : app.id
                            )}
                            className="w-full md:w-36 px-4 py-2.5 bg-gradient-to-tr from-[#dfa069] to-[#cba358] text-gray-950 hover:opacity-90 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Deneyimi Puanla</span>
                          </button>
                        </div>
                      )}

                      {app.status === 'cancelled' && (
                        <div className="text-center py-2 px-3 bg-gray-50 text-gray-400 border border-gray-150 rounded-xl text-[11px] font-bold">
                          Randevu İptal Edildi
                        </div>
                      )}
                    </div>

                    {/* Collapsible review panel */}
                    <AnimatePresence>
                      {selectedReviewAppointmentId === app.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full md:col-span-12 border-t border-gray-100 pt-5 mt-4 text-left space-y-4"
                        >
                          <span className="text-xs font-bold text-gray-800 font-sans block">Hizmet Değerlendirme & Yorumu:</span>
                          
                          {/* Star picker */}
                          <div className="flex items-center space-x-1.5" id={`review-stars-${app.id}`}>
                            {[1, 2, 3, 4, 5].map((st) => (
                              <button
                                key={st}
                                id={`star-${app.id}-${st}`}
                                onClick={() => setReviewRating(st)}
                                className="p-0.5 cursor-pointer text-amber-400 hover:scale-110 active:scale-95 transition-all"
                              >
                                <Star className={`h-6 w-6 ${reviewRating >= st ? 'fill-current' : 'text-gray-200'}`} />
                              </button>
                            ))}
                            <span className="text-xs text-gray-400 font-bold font-mono ml-2">({reviewRating}/5 Puan)</span>
                          </div>

                          <div className="space-y-2">
                            <textarea
                              id={`review-comment-textarea-${app.id}`}
                              placeholder="Fön, renklendirme, Kérastase veya solaryum işlemlerimiz hakkında düşüncelerinizi yazın..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs font-bold text-gray-800 min-h-16 focus:outline-none focus:ring-2 focus:ring-[#dfa069]/20 focus:border-[#dfa069] focus:bg-white"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                id={`cancel-review-btn-${app.id}`}
                                onClick={() => setSelectedReviewAppointmentId(null)}
                                className="px-3.5 py-1.5 border border-gray-100 hover:bg-gray-50 text-gray-500 text-xs rounded-lg font-bold transition-colors cursor-pointer"
                              >
                                Vazgeç
                              </button>
                              <button
                                id={`submit-review-btn-${app.id}`}
                                onClick={() => handleReviewSubmit(app)}
                                className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-[#0f0f11] text-xs rounded-lg font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Değerlendirmeyi Gönder
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
