import React, { useState } from 'react';
import { Sparkles, Maximize2, Users, Coins, ArrowRight, Check } from 'lucide-react';
import { Room } from '../types';

interface SuiteCardProps {
  key?: string;
  room: Room;
  onBookNow: (roomId: string) => void;
}

export default function SuiteCard({ room, onBookNow }: SuiteCardProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const nextImage = () => {
    if (room.images && room.images.length > 0) {
      setActiveImageIdx((prev) => (prev + 1) % room.images.length);
    }
  };

  return (
    <article 
      className="bg-brand-olive/25 border border-brand-gold-dark/10 rounded-2xl overflow-hidden hover:border-brand-gold-dark/40 transition-all duration-300 shadow-xl group flex flex-col lg:flex-row h-full"
      id={`suite-card-${room.id}`}
    >
      
      {/* Visual Carousel Preview Area */}
      <div className="relative w-full lg:w-2/5 min-h-[300px] lg:min-h-full overflow-hidden shrink-0">
        <img
          src={room.images[activeImageIdx] || "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"}
          alt={`${room.name} interior`}
          className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-105"
        />
        
        {/* Dark film gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-transparent to-transparent opacity-80" />

        {/* Status Badge */}
        <span className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase border ${
          room.status === 'available'
            ? 'bg-brand-green/80 text-brand-gold-dark border-brand-gold-dark/30'
            : 'bg-red-950/80 text-red-400 border-red-500/20'
        }`}>
          {room.status === 'available' ? '✦ Available' : '• Under Maintenance'}
        </span>

        {/* Carousel Click Controls */}
        {room.images && room.images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute bottom-4 right-4 bg-brand-green/90 hover:bg-brand-gold-dark hover:text-brand-green border border-brand-gold-dark/20 text-brand-gold-dark p-2 rounded-xl text-xs font-mono tracking-wider transition-colors"
          >
            SIGHTS: {activeImageIdx + 1}/{room.images.length} ✦ NEXT
          </button>
        )}
      </div>

      {/* Narrative & Details Area */}
      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark uppercase font-bold flex items-center gap-1.5">
                <Sparkles size={11} />
                DESERT OASIS CHIC
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-cream mt-1 group-hover:text-brand-gold-dark transition-colors">
                {room.name}
              </h3>
            </div>
            
            <div className="text-right">
              <span className="font-mono text-xs text-brand-cream/40 block">From per night</span>
              <span className="font-display text-2xl font-bold text-gradient-gold">
                ₹{room.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="font-sans text-sm text-brand-cream/70 leading-relaxed mb-6 mt-3">
            {room.longDescription || room.description}
          </p>

          <hr className="border-brand-gold-dark/10 my-4" />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 my-4">
            <div className="flex items-center gap-2.5 text-brand-cream/80 font-mono text-xs">
              <Maximize2 size={15} className="text-brand-gold-dark" />
              <span>{room.size}</span>
            </div>
            <div className="flex items-center gap-2.5 text-brand-cream/80 font-mono text-xs">
              <Users size={15} className="text-brand-gold-dark" />
              <span>Max {room.capacity}</span>
            </div>
            <div className="flex items-center gap-2.5 text-brand-cream/80 font-mono text-xs col-span-2 sm:col-span-1">
              <Coins size={15} className="text-brand-gold-dark" />
              <span>₹1,500 extra guest</span>
            </div>
          </div>

          <hr className="border-brand-gold-dark/10 my-4" />

          {/* Amenities Grid */}
          <div className="space-y-2 mt-4">
            <h4 className="font-mono text-[10px] tracking-wider text-brand-gold-dark uppercase font-bold">
              Bespoke Sanctuary Amenities:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {room.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-brand-cream/75">
                  <Check size={11} className="text-brand-gold-dark shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Book Call to Action */}
        <div className="mt-8 pt-4 border-t border-brand-gold-dark/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] text-brand-cream/40">
            *Includes traditional breakfast & pool deck access
          </span>
          
          <button
            onClick={() => onBookNow(room.id)}
            disabled={room.status !== 'available'}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              room.status === 'available'
                ? 'bg-gradient-to-r from-brand-gold-dark to-amber-600 text-brand-green hover:brightness-110 shadow-lg cursor-pointer'
                : 'bg-brand-olive/40 text-brand-cream/35 cursor-not-allowed border border-brand-cream/5'
            }`}
          >
            {room.status === 'available' ? (
              <>
                SELECT & SECURE SUITE
                <ArrowRight size={14} />
              </>
            ) : (
              'MAINTENANCE STATUS'
            )}
          </button>
        </div>

      </div>
    </article>
  );
}
