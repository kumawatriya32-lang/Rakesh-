import React, { useState } from 'react';
import { Menu, X, Phone, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export default function Navbar({ currentPage, onNavigate, isAdminLoggedIn, onLogoutAdmin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'accommodation', label: 'Suites' },
    { id: 'event-hall', label: 'Event Hall' },
    { id: 'experiences', label: 'Experiences' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-green/95 backdrop-blur-md border-b border-brand-gold-dark/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => handleItemClick('home')} 
            className="flex flex-col cursor-pointer group"
            id="nav-logo"
          >
            <span className="font-display text-2xl md:text-3xl font-bold text-gradient-gold tracking-widest uppercase transition-opacity group-hover:opacity-90">
              MAHIKA
            </span>
            <span className="text-[10px] md:text-xs font-mono text-brand-gold-dark/80 uppercase tracking-[0.3em] -mt-1 pl-0.5">
              Valley Stay • Jaipur
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`font-sans text-sm tracking-wider uppercase transition-all duration-300 relative py-2 ${
                  currentPage === item.id 
                    ? 'text-brand-gold-dark font-medium' 
                    : 'text-brand-cream/80 hover:text-brand-gold-dark'
                }`}
                id={`nav-link-${item.id}`}
              >
                {item.label}
                {currentPage === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold-dark rounded" />
                )}
              </button>
            ))}
            
            {isAdminLoggedIn ? (
              <button
                onClick={() => handleItemClick('admin')}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-gold-dark/10 border border-brand-gold-dark/30 text-brand-gold-dark rounded text-xs font-mono font-bold tracking-wider uppercase hover:bg-brand-gold-dark/20 transition-all"
                id="nav-admin-active"
              >
                <ShieldCheck size={14} />
                Admin Panel
              </button>
            ) : (
              <button
                onClick={() => handleItemClick('admin')}
                className="text-xs text-brand-cream/35 hover:text-brand-gold-dark/50 transition-all font-mono"
                id="nav-admin-login-btn"
              >
                [Staff Login]
              </button>
            )}
          </nav>

          {/* Quick Contact & Call Button */}
          <div className="hidden sm:flex items-center gap-4">
            <a 
              href="tel:+917073832421" 
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-olive hover:bg-brand-sage/40 border border-brand-gold-dark/30 text-brand-gold-dark rounded transition-all duration-300 font-mono text-xs tracking-wider uppercase font-bold"
              id="nav-call-btn"
            >
              <Phone size={14} className="animate-pulse" />
              +91 7073832421
            </a>
            
            <button
              onClick={() => handleItemClick('accommodation')}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-gold-dark to-amber-600 hover:brightness-110 text-brand-green font-sans text-xs tracking-wider uppercase font-bold rounded shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              id="nav-book-btn"
            >
              Book Now
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden flex items-center gap-3">
            <a 
              href="tel:+917073832421" 
              className="p-2.5 bg-brand-olive text-brand-gold-dark rounded border border-brand-gold-dark/20"
              aria-label="Call Mahika Valley Stay"
            >
              <Phone size={16} />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-brand-cream/90 hover:text-brand-gold-dark focus:outline-none border border-brand-cream/10 rounded"
              id="nav-hamburger"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden bg-brand-green border-b border-brand-gold-dark/20 animate-fade-in divide-y divide-brand-gold-dark/10" id="mobile-menu">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`block w-full text-left px-4 py-3 rounded-md text-base font-sans tracking-wide uppercase transition-colors ${
                  currentPage === item.id 
                    ? 'text-brand-gold-dark bg-brand-olive/50 font-bold border-l-4 border-brand-gold-dark' 
                    : 'text-brand-cream/80 hover:bg-brand-olive/30 hover:text-brand-gold-dark'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <button
              onClick={() => handleItemClick('admin')}
              className={`block w-full text-left px-4 py-3 rounded-md text-base font-mono tracking-wider uppercase ${
                currentPage === 'admin'
                  ? 'text-brand-gold-dark bg-brand-olive/50'
                  : 'text-brand-cream/40 hover:text-brand-gold-dark'
              }`}
            >
              {isAdminLoggedIn ? 'Staff Console [Active]' : 'Staff Login'}
            </button>
          </div>
          
          <div className="px-4 py-4 space-y-3">
            <div className="text-center font-mono text-xs text-brand-cream/60">
              For Reservations & Inquiries:
            </div>
            <a 
              href="tel:+917073832421" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-brand-olive text-brand-gold-dark border border-brand-gold-dark/30 rounded font-mono text-sm tracking-widest font-bold uppercase"
            >
              <Phone size={16} />
              +91 7073832421
            </a>
            <button
              onClick={() => handleItemClick('accommodation')}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-brand-gold-dark to-amber-600 text-brand-green font-sans text-sm tracking-wider uppercase font-bold rounded shadow-lg"
            >
              Select & Book Suite
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
