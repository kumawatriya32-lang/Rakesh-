import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = "917073832421";
  const defaultMessage = "Hello Mahika Valley Stay, I would like to inquire about availability and luxury packages.";
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-2xl transition-all duration-300 group hover:rotate-6 hover:-translate-y-1"
      id="whatsapp-floating-bubble"
      aria-label="Chat on WhatsApp"
    >
      {/* Wave animation effect behind the bubble */}
      <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping opacity-75 group-hover:animate-none" />
      <MessageCircle size={28} className="relative z-10 fill-current" />
      
      {/* Hover tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 origin-right transition-transform bg-brand-green border border-brand-gold-dark/20 text-brand-gold-dark font-mono text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
        WhatsApp Concierge ✦ Live
      </span>
    </a>
  );
}
