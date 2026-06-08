import React, { useState } from 'react';
import { Calendar, Users, Eye } from 'lucide-react';
import { Room } from '../types';

interface AvailabilityWidgetProps {
  rooms: Room[];
  onCheck: (checkIn: string, checkOut: string, guests: number, selectedRoomId: string) => void;
}

export default function AvailabilityWidget({ rooms, onCheck }: AvailabilityWidgetProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minCheckIn = tomorrow.toISOString().split('T')[0];

  const overTomorrow = new Date();
  overTomorrow.setDate(overTomorrow.getDate() + 2);
  const minCheckOut = overTomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(minCheckIn);
  const [checkOut, setCheckOut] = useState(minCheckOut);
  const [guests, setGuests] = useState(2);
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    onCheck(checkIn, checkOut, guests, roomId || (rooms[0]?.id || ""));
  };

  return (
    <div className="bg-brand-green/95 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-brand-gold-dark/20 shadow-2xl max-w-5xl mx-auto premium-glow -mt-16 relative z-30" id="availability-widget">
      <div className="text-center mb-6">
        <span className="font-mono text-xs tracking-[0.4em] text-brand-gold-dark uppercase block mb-1">
          RESERVATIONS ONLINE
        </span>
        <h3 className="font-display text-2xl font-bold text-brand-cream/90">
          Secure Your Royal Haven
        </h3>
      </div>
      
      <form onSubmit={handleCheck} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        
        {/* Check-In Date */}
        <div className="space-y-2">
          <label className="block text-xs font-mono tracking-wider text-brand-gold-dark/80 uppercase">
            Check-In Arrival
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-gold-dark pointer-events-none">
              <Calendar size={16} />
            </span>
            <input
              type="date"
              min={minCheckIn}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                // Auto adjust checkout if checkout is before or same as checkin
                if (new Date(e.target.value) >= new Date(checkOut)) {
                  const newOut = new Date(e.target.value);
                  newOut.setDate(newOut.getDate() + 1);
                  setCheckOut(newOut.toISOString().split('T')[0]);
                }
              }}
              required
              className="w-full pl-10 pr-3 py-3 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-sm focus:outline-none focus:border-brand-gold-dark transition-colors font-mono"
            />
          </div>
        </div>

        {/* Check-Out Date */}
        <div className="space-y-2">
          <label className="block text-xs font-mono tracking-wider text-brand-gold-dark/80 uppercase">
            Check-Out Departure
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-gold-dark pointer-events-none">
              <Calendar size={16} />
            </span>
            <input
              type="date"
              min={checkIn}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-sm focus:outline-none focus:border-brand-gold-dark transition-colors font-mono"
            />
          </div>
        </div>

        {/* Select Room */}
        <div className="space-y-2">
          <label className="block text-xs font-mono tracking-wider text-brand-gold-dark/80 uppercase">
            Preferred Suite
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-gold-dark pointer-events-none">
              <Eye size={16} />
            </span>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs focus:outline-none focus:border-brand-gold-dark transition-colors font-sans appearance-none"
            >
              <option value="" disabled className="text-brand-cream/45">Choose a suite...</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="bg-brand-olive text-brand-cream">
                  {room.name} (₹{room.price.toLocaleString('en-IN')}/night)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guest count & Submit Check */}
        <div className="space-y-2 lg:col-span-1">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 space-y-2">
              <label className="block text-[10px] font-mono tracking-wider text-brand-gold-dark/80 uppercase text-center">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full py-3 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-sm focus:outline-none focus:border-brand-gold-dark transition-colors text-center font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num} className="bg-brand-olive text-brand-cream">{num}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-gold-dark to-amber-600 hover:brightness-110 active:scale-95 text-brand-green font-sans text-xs tracking-widest font-bold uppercase rounded-xl transition-all shadow-lg text-center cursor-pointer"
                id="availability-check-submit"
              >
                CHECK DATES
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
