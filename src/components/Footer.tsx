import React from 'react';
import { Phone, Mail, MapPin, MessageSquare, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Stay' },
    { id: 'accommodation', label: 'Luxury Suites' },
    { id: 'event-hall', label: 'Events Hall' },
    { id: 'experiences', label: 'Experiences' },
    { id: 'gallery', label: 'Gallery Showcase' },
  ];

  return (
    <footer className="bg-brand-green text-brand-cream border-t border-brand-gold-dark/20 pt-16 pb-8" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Narrative */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold text-gradient-gold tracking-widest uppercase">
                MAHIKA
              </span>
              <span className="text-xs font-mono text-brand-gold-dark/80 uppercase tracking-[0.3em] -mt-1 pl-0.5">
                Valley Stay • Jaipur
              </span>
            </div>
            <p className="font-sans text-sm text-brand-cream/70 leading-relaxed max-w-sm">
              Nestled near the historic sands of Begas, Jaipur, Mahika Valley Stay stands as an exquisite fusion of pristine Rajasthan heritage, private pool relaxation, and ultra-premium modern comfort. 
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-brand-olive hover:bg-brand-gold-dark hover:text-brand-green text-brand-gold-dark rounded-full transition-colors border border-brand-gold-dark/20"
                aria-label="Instagram Profile"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-brand-olive hover:bg-brand-gold-dark hover:text-brand-green text-brand-gold-dark rounded-full transition-colors border border-brand-gold-dark/20"
                aria-label="Facebook Page"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://wa.me/917073832421" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-brand-olive hover:bg-brand-gold-dark hover:text-brand-green text-brand-gold-dark rounded-full transition-colors border border-brand-gold-dark/20"
                aria-label="WhatsApp Chat"
              >
                <MessageSquare size={18} />
              </a>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-gold-dark/90 uppercase tracking-wider mb-6 border-b border-brand-gold-dark/10 pb-2">
              Bespoke Navigation
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="font-sans text-sm text-brand-cream/75 hover:text-brand-gold-dark transition-colors text-left flex items-center gap-1 group"
                  >
                    <span className="text-brand-gold-dark/40 group-hover:text-brand-gold-dark transition-colors">▪</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Stay Experiences */}
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-gold-dark/90 uppercase tracking-wider mb-6 border-b border-brand-gold-dark/10 pb-2">
              Resort Features
            </h3>
            <ul className="space-y-3 font-sans text-sm text-brand-cream/75">
              <li className="flex items-center gap-2">
                <span className="text-brand-gold-dark">✓</span> 4 Ultra-Luxury Private Suites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-gold-dark">✓</span> Crystal-Clear Swimming Pool
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-gold-dark">✓</span> Curated Signature Cocktail Lounge & Bar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-gold-dark">✓</span> Extensive Wedding Garden & Lawn Area
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-gold-dark">✓</span> Cozy Sunset Fireplace & Bonfire Arena
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-gold-dark">✓</span> Pure Rajasthani Village Escapes
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-gold-dark/90 uppercase tracking-wider mb-6 border-b border-brand-gold-dark/10 pb-2">
              The Stay Estate
            </h3>
            <ul className="space-y-4 font-sans text-sm text-brand-cream/75">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-brand-gold-dark shrink-0 pt-0.5" />
                <span>
                  <strong>Mahika Valley Stay</strong><br />
                  Begas, Near Ajmer Road Highways,<br />
                  Jaipur, Rajasthan, India - 303007
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-gold-dark shrink-0" />
                <a href="tel:+917073832421" className="hover:text-brand-gold-dark transition-colors">
                  +91 7073832421
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand-gold-dark shrink-0" />
                <a href="mailto:reservations@mahikavalleystay.com" className="hover:text-brand-gold-dark transition-colors break-all">
                  info@mahikavalleystay.com
                </a>
              </li>
              <li className="pt-2 font-mono text-xs text-brand-gold-dark/70">
                Check-In: 14:00 PM<br />
                Check-Out: 11:00 AM
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-gold-dark/10 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-brand-cream/50">
            &copy; {currentYear} Mahika Valley Stay. All Rights Reserved.
          </p>
          <p className="font-mono text-xs text-brand-cream/40">
            Designed for Elite Rajasthan Tourism • Secure Reservation Guaranteed
          </p>
        </div>

      </div>
    </footer>
  );
}
