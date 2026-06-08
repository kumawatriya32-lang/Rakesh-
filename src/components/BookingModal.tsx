import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Room } from '../types';

interface BookingModalProps {
  room: Room | null;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function BookingModal({
  room,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onClose,
  onBookingSuccess
}: BookingModalProps) {
  if (!room) return null;

  const [checkIn, setCheckIn] = useState(initialCheckIn || new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(initialCheckOut || "");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState(initialGuests || 2);
  const [notes, setNotes] = useState("");
  
  const [nightsCount, setNightsCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(room.price);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Determine nights and price instantly
  useEffect(() => {
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const count = diffDays > 0 ? diffDays : 1;
      setNightsCount(count);
      
      // Calculate extra guest charges if guestCount exceeds room capacity default (2 guests)
      let basePrice = room.price * count;
      if (guestCount > 2) {
        const extraGuests = guestCount - 2;
        basePrice += (extraGuests * 1500 * count);
      }
      setTotalPrice(basePrice);
    } else {
      setNightsCount(1);
      setTotalPrice(room.price);
    }
  }, [checkIn, checkOut, guestCount, room.price]);

  // Set default checkout to 1 day after checkin if empty
  useEffect(() => {
    if (checkIn && !checkOut) {
      const nextDate = new Date(checkIn);
      nextDate.setDate(nextDate.getDate() + 1);
      setCheckOut(nextDate.toISOString().split('T')[0]);
    }
  }, [checkIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          guestPhone,
          guestCount,
          totalPrice,
          notes
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Reservation failed to save.");
      }

      setBookedDetails(result.booking);
      setIsBooked(true);
      onBookingSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected reservation error occurred. Please verify dates and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compose high-end dispatch link for WhatsApp instant booking confirmation
  const getWhatsAppLaunchStr = () => {
    if (!bookedDetails && !room) return "";
    const detail = bookedDetails || { id: "PENDING-RESRV", totalRent: totalPrice };
    const textMsg = `*MAHIKA VALLEY STAY - RESERVATION CONSPIRACY REQUEST*
---------------------------------------
*Stay Reference ID:* ${detail.id}
*Suite Selected:* ${room.name}
*Guest Lord/Lady:* ${guestName}
*Check-In Arrival:* ${checkIn}
*Check-Out Departure:* ${checkOut}
*Nights Count:* ${nightsCount} Night(s)
*Total Occupants:* ${guestCount} Guest(s)
*Email Handle:* ${guestEmail}
*Phone:* ${guestPhone}
*Total Quoted Tariff:* ₹${totalPrice.toLocaleString('en-IN')}
*Special Notes:* ${notes || 'None'}
---------------------------------------
Please approve my secure reservation and send payment gateway instructions. Thank you.`;
    return `https://wa.me/917073832421?text=${encodeURIComponent(textMsg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-green/80 backdrop-blur-md overflow-y-auto" id="booking-modal-backdrop">
      
      <div className="bg-brand-green border border-brand-gold-dark/30 rounded-2xl max-w-2xl w-full text-brand-cream shadow-2xl relative overflow-hidden my-8" id="booking-modal-outer">
        
        {/* Aesthetic design framing */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-gold-dark via-amber-500 to-yellow-600" />

        {/* Modal Header */}
        <div className="p-6 border-b border-brand-gold-dark/10 flex items-center justify-between bg-brand-olive/20">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark uppercase font-bold">
              ESTATE RESERVATION CONCIERGE
            </span>
            <h3 className="font-display text-2xl font-semibold mt-1">
              {room.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-cream/60 hover:text-brand-gold-dark hover:bg-brand-olive rounded-xl transition-all"
            aria-label="Close Booking Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 md:p-8">
          
          {isBooked ? (
            /* Success View */
            <div className="text-center py-8 space-y-6 animate-fade-in" id="booking-success-view">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-500 text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display text-3xl font-bold tracking-wide text-brand-gold-dark">
                  Reservation Dispatched!
                </h4>
                <p className="font-sans text-sm text-brand-cream/70 max-w-md mx-auto">
                  Your luxury stay request at Mahika Valley has been stored in our system. Reference ID: <span className="font-mono text-brand-gold-dark font-semibold">{bookedDetails?.id}</span>.
                </p>
              </div>

              <div className="p-6 bg-brand-olive/30 border border-brand-gold-dark/20 rounded-xl max-w-md mx-auto space-y-3 text-left">
                <div className="text-xs font-mono text-brand-gold-dark/80 tracking-wider text-center uppercase border-b border-brand-gold-dark/10 pb-2">
                  Reservation Recap
                </div>
                <div className="grid grid-cols-2 text-xs font-sans gap-y-1">
                  <span className="text-brand-cream/55">Suite:</span>
                  <span className="font-semibold text-right">{room.name}</span>
                  <span className="text-brand-cream/55">Check-In:</span>
                  <span className="font-semibold text-right">{checkIn}</span>
                  <span className="text-brand-cream/55">Check-Out:</span>
                  <span className="font-semibold text-right">{checkOut}</span>
                  <span className="text-brand-cream/55">Occupants:</span>
                  <span className="font-semibold text-right">{guestCount} Guests</span>
                  <span className="text-brand-cream/55">Est. Tariff:</span>
                  <span className="text-brand-gold-dark font-bold text-right text-sm">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <a
                  href={getWhatsAppLaunchStr()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full max-w-md px-6 py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-sans text-xs tracking-widest font-bold uppercase rounded-xl transition-all shadow-xl"
                  id="whatsapp-confirm-claim-button"
                >
                  SEND WHATSAPP RESERVATION CLAIM
                </a>
                <p className="font-sans text-[11px] text-brand-cream/40 max-w-sm mx-auto">
                  *Recommended: Send our WhatsApp request immediately to bypass review lines and secure instant priority clearance.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-brand-olive hover:bg-brand-sage/20 border border-brand-gold-dark/10 text-brand-gold-dark font-mono text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  Return to Sanctuary
                </button>
              </div>
            </div>

          ) : (

            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Dynamic Rate Summary Banner */}
              <div className="grid grid-cols-3 bg-brand-olive/35 border border-brand-gold-dark/20 rounded-xl p-4 text-center divide-x divide-brand-gold-dark/10">
                <div>
                  <span className="text-[10px] text-brand-cream/50 uppercase font-mono block">Base Rate</span>
                  <span className="text-sm font-semibold">₹{room.price.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-cream/50 uppercase font-mono block">Duration</span>
                  <span className="text-sm font-semibold text-brand-gold-dark">{nightsCount} Night{nightsCount > 1 ? 's' : ''}</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-cream/50 uppercase font-mono block">Estimated Cost</span>
                  <span className="text-sm font-bold text-brand-gold-dark">₹{totalPrice.toLocaleString('en-IN')}*</span>
                </div>
              </div>

              {/* Error Warning Banner */}
              {errorMsg && (
                <div className="p-4 bg-red-950/80 border border-red-500/20 rounded-xl text-xs text-red-300 font-sans">
                  {errorMsg}
                </div>
              )}

              {/* Date & Guest Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-brand-gold-dark uppercase tracking-wider">Arrival</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-3.5 text-brand-gold-dark" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      className="w-full pl-9 pr-2.5 py-2.5 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs font-mono focus:border-brand-gold-dark outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-brand-gold-dark uppercase tracking-wider">Departure</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-3.5 text-brand-gold-dark" />
                    <input
                      type="date"
                      min={checkIn}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className="w-full pl-9 pr-2.5 py-2.5 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs font-mono focus:border-brand-gold-dark outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-brand-gold-dark uppercase tracking-wider">Total Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs focus:border-brand-gold-dark outline-none transition-colors appearance-none font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num} className="bg-brand-olive text-brand-cream">{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Guest Details Panel */}
              <div className="space-y-4">
                <div className="text-xs font-mono text-brand-gold-dark uppercase tracking-[0.2em] border-b border-brand-gold-dark/10 pb-1.5 font-bold">
                  Guest Identification
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-sans text-brand-cream/80">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3.5 text-brand-gold-dark/60" />
                      <input
                        type="text"
                        placeholder="e.g. Aditya Dev"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs focus:border-brand-gold-dark outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-sans text-brand-cream/80">Phone Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-3.5 text-brand-gold-dark/60" />
                      <input
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs focus:border-brand-gold-dark outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-sans text-brand-cream/80">Email Handle</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3.5 text-brand-gold-dark/60" />
                    <input
                      type="email"
                      placeholder="e.g. user@luxury.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs focus:border-brand-gold-dark outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-sans text-brand-cream/80">Custom Royal Inquiries & Wishes (Optional)</label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-3 text-brand-gold-dark/60" />
                    <textarea
                      placeholder="e.g. airport pickups, candlelit dinners, vegan breakfasts..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-olive border border-brand-gold-dark/20 rounded-xl text-brand-cream text-xs focus:border-brand-gold-dark outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Tariff Disclaimer */}
              <div className="text-[10px] text-brand-cream/40 leading-relaxed">
                *Subject to 12% luxury Rajasthan hospitality tax. The final rates cover premium welcome mocktails, high-speed Wi-Fi, swimming pool entry slots, and private garden seating. Payments are arranged securely via encrypted invoices or elite wire transfers.
              </div>

              {/* Submit panel */}
              <div className="pt-4 border-t border-brand-gold-dark/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-brand-cream/70 hover:text-brand-cream bg-brand-olive/35 hover:bg-brand-olive rounded-xl text-xs font-mono uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-brand-gold-dark to-amber-600 hover:brightness-110 active:scale-95 text-brand-green font-sans text-xs tracking-widest font-bold uppercase rounded-xl transition-all shadow-xl disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  id="booking-modal-submit-btn"
                >
                  {isSubmitting ? 'PROCESSING SECURE LOCK...' : 'CONFIRM STAY RESERVATION'}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
