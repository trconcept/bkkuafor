import { Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { SalonService } from '../types';

interface ServiceCardProps {
  key?: string;
  service: SalonService;
  onSelect: (service: SalonService) => void;
  isSelected?: boolean;
}

export default function ServiceCard({
  service,
  onSelect,
  isSelected = false,
}: ServiceCardProps) {
  // Format category badge label
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'sac-kesim':
        return 'Saç Grubu';
      case 'boyama':
        return 'Boya Grubu';
      case 'perma-duzlestirme':
        return 'Perma & Keratin';
      case 'el-ayak':
        return 'Manikür & Pedikür';
      case 'agda':
        return 'Ağda Grubu';
      case 'bakim':
        return 'Bakım & Terapi';
      case 'makyaj-gelin':
        return 'Gelin & Makyaj';
      case 'ozel-islemler':
        return 'Özel İşlem & Solaryum';
      default:
        return 'Salon Hizmeti';
    }
  };

  // Resolve price display text
  const renderPriceText = () => {
    if (service.showPrice === false) {
      return 'Fiyat Bilgisi Alınız';
    }
    if (service.customPriceText) {
      return service.customPriceText;
    }
    if (service.priceType === 'free' || service.price === 0) {
      return 'SERBEST / Fiyat Alınız';
    }
    return `₺${service.price}`;
  };

  return (
    <div
      id={`service-card-${service.id}`}
      className={`relative bg-[#131317] rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col h-full group ${
        isSelected
          ? 'ring-2 ring-[#dfa069] border-[#dfa069] shadow-lg shadow-[#dfa069]/10'
          : 'border-[#222226] hover:border-[#38383e] hover:shadow-xl'
      }`}
    >
      {/* Aspect 4:3 Image Cover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1c1c22]">
        <img
          src={service.image}
          alt={service.name}
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/fiyat-tarifesi.jpg';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#0f0f11]/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-[#dfa069] uppercase border border-[#cba358]/20">
            {getCategoryLabel(service.category)}
          </span>
        </div>
      </div>

      {/* Roster Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-[11px] text-[#8e8d97] font-mono">
            <Clock className="h-3.5 w-3.5 text-[#dfa069]" />
            <span>{service.duration} Dakika</span>
            <span className="text-[#3c3b44]">•</span>
            <span className="flex items-center gap-1 text-[#4ade80]">
              <ShieldCheck className="h-3 w-3" />
              Uzman Elinden
            </span>
          </div>

          <h3 className="font-sans font-extrabold text-[#ebd6b8] text-base leading-snug group-hover:text-white transition-colors">
            {service.name}
          </h3>
          
          <p className="text-[#8e8d97] text-xs leading-relaxed line-clamp-2">
            {service.description}
          </p>

          {/* Bullet highlights */}
          <div className="flex flex-wrap gap-1 px-1 py-1.5" id={`features-${service.id}`}>
            {(service.features || []).map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 text-[9px] bg-[#1a1a20] text-[#cba358] border border-[#dfa069]/15 px-1.5 py-0.5 rounded-lg"
              >
                <Sparkles className="h-2 w-2 text-[#dfa069]" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action prices split row */}
        <div className="pt-3 border-t border-[#1f1f24] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[#63626c] uppercase font-mono block">Tarife Fiyatı</span>
            <span className="font-sans font-black text-sm sm:text-base text-white">
              {renderPriceText()}
            </span>
          </div>

          <button
            id={`trigger-book-${service.id}`}
            onClick={() => onSelect(service)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              isSelected
                ? 'bg-[#dfa069] text-gray-950 font-black'
                : 'bg-[#1e1e24] hover:bg-[#dfa069] text-white hover:text-gray-950 border border-transparent'
            }`}
          >
            {isSelected ? 'Seçildi ✓' : 'Randevu Al'}
          </button>
        </div>
      </div>
    </div>
  );
}
