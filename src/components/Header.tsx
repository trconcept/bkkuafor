import { Scissors, Calendar, Clock, Lock, Menu, X, Sparkles, PhoneCall, MapPin, BookOpen, Instagram } from 'lucide-react';
import { ActiveSection, WebContent } from '../types';
import { useState } from 'react';

interface HeaderProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  webContent?: WebContent;
}

export default function Header({
  activeSection,
  setActiveSection,
  webContent,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const salonName = webContent?.salonName || "BK KUAFÖR & BEAUTY";
  const salonSubtitle = webContent?.salonSubtitle || "Bayan Kuaförü & Kérastase Salonu";
  const salonLogoUrl = webContent?.salonLogoUrl || "/bk-logo.jpg";
  const salonDistrictCity = webContent?.salonDistrictCity || "Çekmeköy, İstanbul";
  const phoneHref = webContent?.footerPhone ? `tel:${webContent.footerPhone.replace(/[^0-9+]/g, '')}` : "tel:+902122432020";

  // Clean, focused navbar items (excluding redundant services/booking links)
  const navItems: { id: ActiveSection; label: string; isHighlight?: boolean }[] = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'kerastase', label: 'KÉRASTASE', isHighlight: true },
    { id: 'blog', label: 'Blog' },
    { id: 'my-appointments', label: 'Randevularım' },
    { id: 'gallery', label: 'Galeri' },
    { id: 'faq', label: 'SSS' },
  ];

  return (
    <header className={`sticky top-0 z-50 text-white backdrop-blur-md border-b border-[#222228] shadow-md ${activeSection === 'kerastase' ? 'bg-[#0c0c0e]/75' : 'bg-[#0c0c0e]/95'}`} id="salon-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Title */}
          <div 
            onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer group"
            id="brand-logo-container"
          >
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-black border border-[#dfa069]/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img 
                src={salonLogoUrl} 
                alt={salonName} 
                className="h-full w-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ebd6b8] via-[#e2be89] to-[#ebd6b8]">
                {salonName}
              </span>
              <span className="text-[9.5px] text-[#9b9aa5] uppercase tracking-[0.2em] font-medium font-mono">
                {salonSubtitle}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link row - perfectly aligned and centered */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-2" id="desktop-nav-links">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 h-10 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#dfa069] to-[#cba358] text-[#0f0f11] shadow-md font-black'
                      : item.isHighlight
                      ? 'text-[#ebd6b8] hover:text-white bg-[#191920] hover:bg-[#23232c] border border-[#dfa069]/40 font-extrabold'
                      : 'text-[#d6d5dd] hover:bg-[#1a1a20] hover:text-white'
                  }`}
                >
                  {item.isHighlight && (
                    <Sparkles
                      className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-[#111113]' : 'text-[#dfa069]'
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Call-to-actions */}
          <div className="hidden sm:flex items-center space-x-3" id="header-ctas">
            {webContent?.socialLinks?.instagram && webContent.socialLinks.instagramVisible !== false && (
              <a
                href={webContent.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 bg-[#1a1a20] hover:bg-[#25252e] text-[#dfa069] border border-gray-800 rounded-xl flex items-center justify-center transition-all"
                title="Instagram'da Takip Edin"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}

            <a 
              href={phoneHref} 
              className="flex items-center text-[#cba358] text-xs font-bold border border-[#dfa069]/30 px-4 py-2 rounded-xl hover:bg-[#dfa069]/10 transition-all font-mono h-10"
              title={`Konum: ${salonDistrictCity}`}
            >
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#dfa069]" />
              <span>{salonDistrictCity}</span>
            </a>
          </div>

          {/* Mobile responsive toggle button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              id="mobile-menu-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-[#d6d5dd] hover:text-white hover:bg-[#1a1a20] rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drop down menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111115] border-b border-[#222226] px-4 py-4 space-y-2" id="mobile-menu-overlay">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`mob-nav-${item.id}`}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-between ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-[#dfa069] to-[#cba358] text-[#0f0f11] font-black'
                  : item.isHighlight
                  ? 'bg-[#1c1a22] text-[#ebd6b8] border border-[#dfa069]/30'
                  : 'text-[#d6d5dd] hover:bg-[#1c1c22]'
              }`}
            >
              <span>{item.label}</span>
              {item.isHighlight && <Sparkles className="h-3.5 w-3.5 text-[#dfa069]" />}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
