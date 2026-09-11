import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, Layers, CheckCircle, ArrowRight, ShieldCheck, Cpu, Droplets, Star, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { KerastaseProduct } from '../types';

interface KerastaseViewProps {
  products: KerastaseProduct[];
  onBookKerastaseService?: (productName?: string) => void;
}

const SERIES_IMAGE_MAP: Record<string, string> = {
  'Genesis': '/KERASTASE/26.png',
  'Chronologiste': '/KERASTASE/27.png',
  'Elixir Ultime': '/KERASTASE/29.png',
  'Gloss Absolu': '/KERASTASE/36.png',
  'Gloss Absolu Crème': '/KERASTASE/36.png',
  'Première': '/KERASTASE/46.png',
  'Blond Absolu': '/KERASTASE/47.png',
  'Nutritive': '/KERASTASE/48.png',
  'Curl Manifesto': '/KERASTASE/49.png',
  'Symbiose': '/KERASTASE/32.png',
  'Résistance': '/KERASTASE/33.png',
  'Densifique': '/KERASTASE/34.png',
  'Chroma Absolu': '/KERASTASE/193.png',
  'Fusio-Dose': '/KERASTASE/39.png',
  'Discipline': '/KERASTASE/40.png',
};

const KERASTASE_VIDEOS = [
  'WhatsApp Video 2026-08-26 at 16.12.31 (1).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.31.mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32 (1).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32 (2).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32 (3).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32 (4).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32 (5).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32 (6).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32 (7).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.32.mp4',
  'WhatsApp Video 2026-08-26 at 16.12.33 (1).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.33 (2).mp4',
  'WhatsApp Video 2026-08-26 at 16.12.33.mp4',
].map((fileName) => `/kerastase-videos/${encodeURIComponent(fileName)}`);

export default function KerastaseView({
  products,
  onBookKerastaseService,
}: KerastaseViewProps) {
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedStep, setSelectedStep] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [videoIndex, setVideoIndex] = useState(() => Math.floor(Math.random() * KERASTASE_VIDEOS.length));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique series list
  const seriesList = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.series)));
    return ['all', ...list];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSeries = selectedSeries === 'all' || p.series.toLowerCase() === selectedSeries.toLowerCase();
      const matchStep = selectedStep === 'all' || p.stepType === selectedStep;
      const matchQuery = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.series.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeries && matchStep && matchQuery;
    });
  }, [products, selectedSeries, selectedStep, searchQuery]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Helper default image
  const getProductImage = (prod: KerastaseProduct) => {
    if (SERIES_IMAGE_MAP[prod.series]) return SERIES_IMAGE_MAP[prod.series];
    if (prod.image && prod.image.trim()) return prod.image;
    return 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop';
  };

  return (
    <div className="relative space-y-8 pb-12" id="kerastase-page-container">
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#0c0b0e]" aria-hidden="true">
        <video
          key={KERASTASE_VIDEOS[videoIndex]}
          autoPlay
          muted
          playsInline
          onEnded={() => setVideoIndex((current) => (current + 1) % KERASTASE_VIDEOS.length)}
          className="h-full w-full object-cover"
        >
          <source src={KERASTASE_VIDEOS[videoIndex]} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0b0e]/70" />
      </div>
      
      {/* 1. Hero Luxury Header */}
      <div 
        className="relative rounded-3xl overflow-hidden bg-[#0c0b0e]/75 text-white p-6 sm:p-9 lg:p-12 border border-[#2a2730] shadow-2xl"
        id="kerastase-hero"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 bg-white/10 backdrop-blur-md text-[#ebd6b8] border border-[#dfa069]/30 rounded-full text-[10px] font-mono font-black uppercase tracking-[0.25em]">
              KÉRASTASE PARIS • 1964'TEN BERİ ÖNCÜ
            </span>
            <span className="flex items-center gap-1 text-[#4ade80] text-[10px] font-mono font-bold bg-[#4ade80]/10 px-2.5 py-1 rounded-full border border-[#4ade80]/20">
              <ShieldCheck className="h-3 w-3" />
              Yetkili Salon & Bakım Portalı
            </span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
            Saçın Her İhtiyacı İçin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebd6b8] via-[#e2be89] to-[#ebd6b8]">
              Profesyonel Lüks Ritüeller
            </span>
          </h1>

          <p className="text-[#a09fa9] text-sm sm:text-base leading-relaxed max-w-2xl">
            1964'ten bu yana kişiye özel saç bakım ritüelleriyle mükemmelliğin sınırlarını zorlayan Kérastase; Première, Chronologiste, Blond Absolu, Genesis ve Fusio-Dose serileriyle salonumuzda sizi bekliyor.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {onBookKerastaseService && (
              <button
                onClick={() => onBookKerastaseService()}
                className="px-6 py-3.5 bg-gradient-to-r from-[#dfa069] to-[#cba358] hover:opacity-95 text-gray-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>KÉRASTASE SALON RANDEVUSU AL</span>
              </button>
            )}
            <a
              href="#kscan-section"
              className="px-5 py-3.5 bg-[#1f1e24] hover:bg-[#282730] text-[#ebd6b8] border border-white/10 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Cpu className="h-4 w-4 text-[#dfa069]" />
              <span>Yapay Zekâ Saç Analizini Keşfet (K-SCAN)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Premium editorial spacing instead of the three-card ritual block */}
      <div className="h-1" aria-hidden="true" />

      {/* 3. Filters and Search Bar */}
      <div className="bg-[#f5efe9]/80 backdrop-blur-md rounded-[2rem] p-6 border border-[#e8dcc6]/80 shadow-[0_18px_45px_rgba(16,12,10,0.08)] space-y-5" id="kerastase-filters-box">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-sans font-black text-xl text-gray-950 tracking-tight">Kérastase Ürün Kataloğu</h2>
            <p className="text-xs text-gray-500 mt-0.5">İhtiyacınıza uygun seriyi veya bakım adımını seçerek filtreleyebilirsiniz ({filteredProducts.length} Ürün Listeleniyor).</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün veya seri ara (Örn: Première, Yağ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-150 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dfa069]/20 focus:border-[#dfa069] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Series Horizontal Scroll Filter with Prev/Next Navigation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
              KÉRASTASE SERİSİ SEÇİN:
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                title="Sola Kaydır"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                title="Sağa Kaydır"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 px-1 scroll-smooth pr-10 scrollbar-thin"
            id="series-scroll-list"
          >
            {seriesList.map((ser) => {
              const isSelected = selectedSeries === ser;
              return (
                <button
                  key={ser}
                  onClick={() => setSelectedSeries(ser)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 min-w-max transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f0f11] text-[#ebd6b8] shadow-md ring-2 ring-[#dfa069]/40'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ser === 'all' ? 'Tüm Seriler' : ser}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs">
          <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider mr-1">Bakım Adımı:</span>
          {[
            { id: 'all', label: 'Tüm Adımlar' },
            { id: '1-banyo', label: '1. Saç Banyosu' },
            { id: '2-durulanan', label: '2. Durulanan Bakım' },
            { id: '3-durulanmayan', label: '3. Durulanmayan Bakım' },
            { id: 'on-bakim', label: 'Ön Bakım' },
            { id: 'salon-bakim', label: 'Salon Özel Ritüeli' },
            { id: 'cihaz', label: 'Yapay Zeka (K-Scan)' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStep(st.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedStep === st.id
                  ? 'bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-150'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Products Grid with Image Covers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="kerastase-products-grid">
        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-150">
              <span className="text-4xl">🧴</span>
              <h4 className="font-sans font-bold text-lg text-gray-900 mt-3">Eşleşen Kérastase Ürünü Bulunamadı</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Arama kriterlerinizi değiştirerek veya "Tüm Seriler" filtresini seçerek ürünleri görüntüleyebilirsiniz.
              </p>
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#f7f2ed]/85 backdrop-blur-md rounded-[1.8rem] overflow-hidden border border-[#e9dfd4] hover:border-[#dfa069]/60 hover:shadow-[0_20px_50px_rgba(16,12,10,0.12)] transition-all flex flex-col justify-between group space-y-4"
                id={`kerastase-card-${prod.id}`}
              >
                <div>
                  {/* Product Image Cover */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img
                      src={getProductImage(prod)}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = 'true';
                          target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop';
                        }
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-3 py-1 bg-[#0f0f11]/90 backdrop-blur-md text-[#ebd6b8] rounded-full text-[9.5px] font-mono font-black uppercase tracking-wider border border-[#dfa069]/20">
                        {prod.series}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[#a06b3e] rounded-lg text-[9.5px] font-bold font-mono shadow-sm">
                        {prod.stepLabel}
                      </span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-sans font-black text-lg text-gray-950 group-hover:text-[#a06b3e] transition-colors leading-snug">
                      {prod.name}
                    </h3>

                    {prod.size && (
                      <span className="block text-[11px] font-mono font-bold text-gray-700">
                        Ambalaj: {prod.size}
                      </span>
                    )}

                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                      {prod.description}
                    </p>

                    {/* Benefits */}
                    {prod.benefits && prod.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {prod.benefits.map((ben, bidx) => (
                          <span
                            key={bidx}
                            className="inline-flex items-center gap-1 text-[9.5px] font-bold bg-[#faf8f5] text-[#523d26] border border-[#ebd6b8] px-2 py-0.5 rounded-md"
                          >
                            <CheckCircle className="h-3 w-3 text-[#dfa069]" />
                            {ben}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-gray-100/80 pt-4">
                  <span className="text-[10px] font-mono uppercase font-bold text-gray-700">
                    Salonda Uygulanır
                  </span>
                  {onBookKerastaseService && (
                    <button
                      onClick={() => onBookKerastaseService(prod.name)}
                      className="px-4 py-2 bg-[#0f0f11] hover:bg-[#dfa069] text-white hover:text-gray-950 text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Bakım Randevusu Al</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 5. Dedicated K-SCAN AI Diagnostic Spotlight Section */}
      <div
        id="kscan-section"
        className="rounded-3xl bg-gradient-to-br from-[#121216] via-[#1a1a22] to-[#0c0c0e] text-white p-8 sm:p-12 lg:p-16 border border-[#2d2d38] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 justify-between"
      >
        <div className="relative z-10 max-w-xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Cpu className="h-3.5 w-3.5 mr-1" />
            YAPAY ZEKÂ DESTEKLİ SAÇ DERİSİ VE SAÇ ANALİZİ
          </div>

          <h2 className="font-sans font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            K-SCAN Akıllı Teşhis Kamerası ile Saçınızı Mikroskobik Düzeyde Tanıyın
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed">
            K-SCAN, yalnızca yetkili Kérastase salonlarında bulunan yenilikçi bir akıllı kameradır. Gelişmiş yapay zekâ teknolojisiyle saç derinizi ve tellerinizi 100 kat büyüterek analiz eder ve size özel Fusio-Dose bakım reçetenizi saniyeler içinde oluşturur.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#22222c] p-3 rounded-xl border border-gray-800">
              <span className="text-[#dfa069] font-bold block text-sm">100x Zoom</span>
              <span className="text-gray-400 text-[10px]">Mikroskopik Kök Analizi</span>
            </div>
            <div className="bg-[#22222c] p-3 rounded-xl border border-gray-800">
              <span className="text-[#4ade80] font-bold block text-sm">%100 Kişisel</span>
              <span className="text-gray-400 text-[10px]">Fusio-Dose Kokteyl Reçetesi</span>
            </div>
          </div>

          {onBookKerastaseService && (
            <button
              onClick={() => onBookKerastaseService('K-SCAN Saç Analizi')}
              className="px-6 py-3.5 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
            >
              <span>Ücretsiz K-SCAN Randevusu Al</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right side teaser box */}
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-gray-800 bg-[#16161d] p-6 space-y-4 shrink-0 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-gray-800 pb-3">
            <div className="h-10 w-10 bg-amber-500/10 text-[#dfa069] rounded-xl flex items-center justify-center font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-white">Fusio-Dose Kokteyl</h4>
              <span className="text-[10px] text-gray-400 font-mono">Kişiselleştirilmiş Salon Terapisi</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            K-SCAN analizi sonrası saçınızın birincil ihtiyacı (Konsantre) ve ikincil ihtiyacı (Booster) belirlenerek gözünüzün önünde anında harmanlanır ve saçınıza uygulanır.
          </p>
          <div className="bg-amber-500/10 text-[#ebd6b8] p-3 rounded-xl border border-amber-500/20 text-xs font-mono font-bold flex items-center justify-between">
            <span>Uygulama Süresi:</span>
            <span className="text-white">15 Dakika</span>
          </div>
        </div>
      </div>

    </div>
  );
}
