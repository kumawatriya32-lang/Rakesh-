import React, { useState, useEffect } from 'react';
import { 
  BarChart3, CalendarDays, KeyRound, MessageSquare, 
  Settings, Check, X, ShieldAlert, Award, Star, 
  Sparkles, RefreshCw, LogOut, MailCheck, Edit, Trash2, IndianRupee
} from 'lucide-react';
import { Booking, Room, Review, Inquiry, DashboardStats } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
  allRooms: Room[];
  onRefreshRooms: () => void;
}

export default function AdminPanel({ onLogout, allRooms, onRefreshRooms }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'rooms' | 'inquiries' | 'reviews'>('stats');
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [rooms, setRooms] = useState<Room[]>(allRooms || []);
  
  const [isLoading, setIsLoading] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Edit states for rooms
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingStatus, setEditingStatus] = useState<'available' | 'maintenance'>('available');

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotif({ text, type });
    setTimeout(() => {
      setNotif(null);
    }, 4000);
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes, reviewsRes, inquiriesRes, roomsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/bookings'),
        fetch('/api/admin/reviews'),
        fetch('/api/inquiries'),
        fetch('/api/rooms')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (inquiriesRes.ok) setInquiries(await inquiriesRes.json());
      if (roomsRes.ok) {
        const parsedRooms = await roomsRes.json();
        setRooms(parsedRooms);
      }
    } catch (e) {
      console.error(e);
      showNotification("Could not sync with the estate server files", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Modify Booking Status (Approve/Reject)
  const handleBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        showNotification(`Reservation marked as ${status} successfully!`);
        fetchAdminData();
      } else {
        throw new Error();
      }
    } catch (e) {
      showNotification("Could not alter booking status", "error");
    }
  };

  // Switch Booking Payment Status
  const toggleBookingPayment = async (bookingId: string, current: 'paid' | 'unpaid') => {
    const nextPayment = current === 'paid' ? 'unpaid' : 'paid';
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: nextPayment })
      });
      if (response.ok) {
        showNotification("Payment register updated");
        fetchAdminData();
      }
    } catch (e) {
      showNotification("Could not update payment status", "error");
    }
  };

  // Remove booking record
  const deleteBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to permanently erase this booking record?")) return;
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showNotification("Requisite reservation record has been purged");
        fetchAdminData();
      }
    } catch (e) {
      showNotification("Failed deleting reservation", "error");
    }
  };

  // Modify Room rates and status
  const startRoomEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingPrice(room.price);
    setEditingStatus(room.status);
  };

  const saveRoomEdits = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(editingPrice), status: editingStatus })
      });
      if (response.ok) {
        setEditingRoomId(null);
        showNotification("Suite parameters updated perfectly!");
        // Refresh local items
        fetchAdminData();
        onRefreshRooms(); // sync state with top panel
      }
    } catch (e) {
      showNotification("Could not update suite rates", "error");
    }
  };

  // Curation of reviews (Approve/Delete)
  const handleReviewStatus = async (reviewId: string, status: 'approved') => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        showNotification("Guest review approved for live display!");
        fetchAdminData();
      }
    } catch (e) {
      showNotification("Approval failed", "error");
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showNotification("Review purged successfully.");
        fetchAdminData();
      }
    } catch (e) {
      showNotification("Error deleting review", "error");
    }
  };

  // Inquiry Responded Status toggle
  const handleInquiryStatus = async (inquiryId: string, status: 'pending' | 'responded') => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        showNotification("Inquiry status catalogued");
        fetchAdminData();
      }
    } catch (e) {
      showNotification("Error updating status", "error");
    }
  };

  return (
    <div className="bg-brand-green text-brand-cream border border-brand-gold-dark/20 p-6 md:p-8 rounded-2xl shadow-2xl space-y-8 premium-glow" id="admin-panel-container">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gold-dark/10 pb-6">
        <div>
          <span className="font-mono text-xs tracking-[0.4em] text-brand-gold-dark font-bold uppercase flex items-center gap-1.5">
            <Award size={14} className="text-brand-gold-dark" />
            MAHIKA PRIVATE CONSOLE
          </span>
          <h2 className="font-display text-3xl font-bold mt-1 text-gradient-gold">
            Estate Staff Command Center
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="p-2.5 bg-brand-olive hover:bg-brand-sage/20 text-brand-gold-dark border border-brand-gold-dark/20 hover:border-brand-gold-dark rounded-xl transition-all font-mono text-xs flex items-center gap-1.5"
            title="Refresh database"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            SYNC
          </button>
          
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-200 text-xs font-mono tracking-wider uppercase font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <LogOut size={14} />
            RESTRICTED LOGOUT
          </button>
        </div>
      </div>

      {/* Floating notifications */}
      {notif && (
        <div className={`p-4 rounded-xl text-xs font-sans flex items-center gap-2 max-w-md mx-auto animate-fade-in border ${
          notif.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
            : 'bg-red-950/80 border-red-500 text-red-300'
        }`} id="admin-live-notif">
          {notif.type === 'success' ? <Check size={16} /> : <ShieldAlert size={16} />}
          <span>{notif.text}</span>
        </div>
      )}

      {/* Admin Tab Selectors */}
      <div className="flex flex-wrap gap-2.5 border-b border-brand-gold-dark/10 pb-4">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
            activeTab === 'stats' 
              ? 'bg-brand-gold-dark text-brand-green border-brand-gold-dark font-bold' 
              : 'border-brand-gold-dark/10 hover:border-brand-gold-dark/40 text-brand-cream/80'
          }`}
        >
          <BarChart3 size={15} />
          OVERVIEW STATS
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
            activeTab === 'bookings' 
              ? 'bg-brand-gold-dark text-brand-green border-brand-gold-dark font-bold' 
              : 'border-brand-gold-dark/10 hover:border-brand-gold-dark/40 text-brand-cream/80'
          }`}
        >
          <CalendarDays size={15} />
          RESERVATIONS ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
            activeTab === 'rooms' 
              ? 'bg-brand-gold-dark text-brand-green border-brand-gold-dark font-bold' 
              : 'border-brand-gold-dark/10 hover:border-brand-gold-dark/40 text-brand-cream/80'
          }`}
        >
          <KeyRound size={15} />
          ROOM DECK
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
            activeTab === 'inquiries' 
              ? 'bg-brand-gold-dark text-brand-green border-brand-gold-dark font-bold' 
              : 'border-brand-gold-dark/10 hover:border-brand-gold-dark/40 text-brand-cream/80'
          }`}
        >
          <MailCheck size={15} />
          BANQUETS ({inquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
            activeTab === 'reviews' 
              ? 'bg-brand-gold-dark text-brand-green border-brand-gold-dark font-bold' 
              : 'border-brand-gold-dark/10 hover:border-brand-gold-dark/40 text-brand-cream/80'
          }`}
        >
          <MessageSquare size={15} />
          TESTIMONIALS ({reviews.length})
        </button>
      </div>

      {/* TABS CONTENT PANELS */}

      {/* 1. STATS OVERVIEW PANEL */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-fade-in" id="admin-stats-tab">
          
          {/* Key Metrics Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-brand-olive/30 border border-brand-gold-dark/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-brand-cream/50 block uppercase">Total Revenue (Approved)</span>
                <span className="text-2xl font-bold font-display text-brand-gold-dark mt-1 block">
                  ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              <div className="p-3 bg-brand-gold-dark/10 rounded-xl text-brand-gold-dark">
                <IndianRupee size={24} />
              </div>
            </div>

            <div className="p-5 bg-brand-olive/30 border border-brand-gold-dark/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-brand-cream/50 block uppercase">Occupancy Estimate</span>
                <span className="text-2xl font-bold font-display text-brand-gold-dark mt-1 block">
                  {stats?.occupancyRate || '35'}%
                </span>
              </div>
              <div className="p-3 bg-brand-gold-dark/10 rounded-xl text-brand-gold-dark">
                <BarChart3 size={24} />
              </div>
            </div>

            <div className="p-5 bg-brand-olive/30 border border-brand-gold-dark/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-brand-cream/50 block uppercase">Active System Bookings</span>
                <span className="text-2xl font-bold font-display text-brand-gold-dark mt-1 block">
                  {stats?.totalBookings || '0'}
                </span>
                {stats && stats.pendingBookings > 0 && (
                  <span className="text-[10px] text-amber-400 font-mono italic">
                    *{stats.pendingBookings} awaiting decision
                  </span>
                )}
              </div>
              <div className="p-3 bg-brand-gold-dark/10 rounded-xl text-brand-gold-dark">
                <CalendarDays size={24} />
              </div>
            </div>

            <div className="p-5 bg-brand-olive/30 border border-brand-gold-dark/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-brand-cream/50 block uppercase">Uncurated Reviews</span>
                <span className="text-2xl font-bold font-display text-brand-gold-dark mt-1 block col-span-1">
                  {stats?.pendingReviews !== undefined ? stats.pendingReviews : '0'}
                </span>
              </div>
              <div className="p-3 bg-brand-gold-dark/10 rounded-xl text-brand-gold-dark">
                <MessageSquare size={24} />
              </div>
            </div>

          </div>

          {/* Quick Estate Status Note */}
          <div className="p-6 bg-brand-olive/15 border border-brand-gold-dark/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-brand-gold-dark font-semibold uppercase flex items-center gap-1.5">
                <Sparkles size={12} className="text-brand-gold-dark" />
                SYSTEM NOTIFICATION SYSTEM LIVE
              </span>
              <p className="text-sm text-brand-cream/70">
                Incoming reservations trigger automatic alerts. You can direct review bookings, moderate user ratings, and manage rates instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKINGS MANAGEMENT PANEL */}
      {activeTab === 'bookings' && (
        <div className="space-y-4 animate-fade-in" id="admin-bookings-tab">
          <h3 className="font-display text-xl font-semibold text-brand-gold-dark">
            Manage Incoming Room Reservations
          </h3>
          
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-brand-cream/60 font-sans">
              No booking records registered on the system files.
            </div>
          ) : (
            <div className="overflow-x-auto space-y-4">
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="p-5 bg-brand-olive/20 border border-brand-gold-dark/10 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] bg-brand-gold-dark/10 text-brand-gold-dark font-mono font-bold px-2 py-0.5 rounded">
                      {booking.id}
                    </span>
                    <h4 className="font-display text-base font-bold text-brand-cream mt-1">{booking.guestName}</h4>
                    <p className="text-xs font-mono text-brand-cream/60">{booking.guestEmail}</p>
                    <p className="text-xs font-mono text-brand-gold-dark">{booking.guestPhone}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-cream/40 uppercase font-mono block">Selected Sanctuary</span>
                    <p className="text-xs font-sans font-semibold text-brand-cream/90">{booking.roomName}</p>
                    <div className="text-[11px] font-mono text-brand-cream/70 mt-1">
                      {booking.checkIn} ➔ {booking.checkOut}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-cream/40 uppercase font-mono block">Tariff Summary</span>
                    <p className="text-xs font-mono text-brand-gold-dark font-bold">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
                    <button
                      onClick={() => toggleBookingPayment(booking.id, booking.paymentStatus)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border inline-block select-none ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-red-950/80 border-red-500 text-red-300'
                      }`}
                    >
                      {booking.paymentStatus === 'paid' ? 'Paid (Toggle)' : 'Unpaid (Toggle)'}
                    </button>
                    {booking.notes && (
                      <p className="text-[10px] italic text-brand-cream/50 mt-1 bg-brand-green/30 p-1.5 rounded">
                        "{booking.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Select */}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-lg border ${
                      booking.status === 'approved'
                        ? 'bg-emerald-950/85 text-emerald-400 border-emerald-500/30'
                        : booking.status === 'rejected'
                        ? 'bg-red-950/85 text-red-400 border-red-500/30'
                        : 'bg-amber-950/85 text-amber-400 border-amber-500/30'
                    }`}>
                      {booking.status}
                    </span>

                    <button
                      onClick={() => handleBookingStatus(booking.id, 'approved')}
                      disabled={booking.status === 'approved'}
                      className="p-2 bg-emerald-900/50 hover:bg-emerald-900 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 disabled:opacity-40"
                      title="Approve reservation"
                    >
                      <Check size={16} />
                    </button>

                    <button
                      onClick={() => handleBookingStatus(booking.id, 'rejected')}
                      disabled={booking.status === 'rejected'}
                      className="p-2 bg-red-950/50 hover:bg-red-950 text-red-400 rounded-lg transition-colors border border-red-500/20 disabled:opacity-40"
                      title="Reject reservation"
                    >
                      <X size={16} />
                    </button>

                    <button
                      onClick={() => deleteBooking(booking.id)}
                      className="p-2 bg-brand-olive hover:bg-red-950 text-brand-gold-dark hover:text-red-400 rounded-lg border border-brand-gold-dark/10 transition-colors"
                      title="Erase booking record"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ROOM DECK MANAGEMENT PANEL */}
      {activeTab === 'rooms' && (
        <div className="space-y-4 animate-fade-in" id="admin-rooms-tab">
          <h3 className="font-display text-xl font-semibold text-brand-gold-dark">
            Manage Room Pricing & Sanctuary Statuses
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div 
                key={room.id}
                className="p-5 bg-brand-olive/20 border border-brand-gold-dark/10 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display font-bold text-base text-brand-cream">{room.name}</h4>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      room.status === 'available'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                        : 'bg-red-950 text-red-400 border-red-500/40'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-cream/65 line-clamp-2 mb-4">{room.description}</p>
                </div>

                {editingRoomId === room.id ? (
                  /* Edit Mode Inputs */
                  <div className="p-3 bg-brand-green/80 border border-brand-gold-dark/20 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-brand-gold-dark mb-1">Pricing (₹)</label>
                        <input
                          type="number"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(Number(e.target.value))}
                          className="w-full bg-brand-olive text-brand-cream text-xs p-1.5 rounded focus:border-brand-gold-dark outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-brand-gold-dark mb-1">Status</label>
                        <select
                          value={editingStatus}
                          onChange={(e: any) => setEditingStatus(e.target.value)}
                          className="w-full bg-brand-olive text-brand-cream text-xs p-1.5 rounded focus:border-brand-gold-dark outline-none"
                        >
                          <option value="available">Available</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1.5">
                      <button
                        onClick={() => setEditingRoomId(null)}
                        className="px-2 py-1 bg-brand-olive text-brand-cream/70 text-[10px] font-mono uppercase rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveRoomEdits(room.id)}
                        className="px-3 py-1 bg-brand-gold-dark text-brand-green text-[10px] font-mono uppercase font-bold rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Static Mode View */
                  <div className="flex items-center justify-between pt-3 border-t border-brand-gold-dark/10">
                    <span className="font-mono text-xs text-brand-gold-dark font-bold">
                      ₹{room.price.toLocaleString('en-IN')}/night
                    </span>
                    <button
                      onClick={() => startRoomEdit(room)}
                      className="px-3 py-1 bg-brand-olive hover:bg-brand-sage/25 border border-brand-gold-dark/20 text-brand-gold-dark rounded-lg text-xs font-mono flex items-center gap-1"
                    >
                      <Edit size={12} />
                      QUOTATION RATES
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 4. BANQUET / EVENTS INQUIRIES GENERAL LIST */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4 animate-fade-in" id="admin-inquiries-tab">
          <h3 className="font-display text-xl font-semibold text-brand-gold-dark">
            Destination Weddings & Luxury Corporate Inquiries
          </h3>

          {inquiries.length === 0 ? (
            <div className="p-12 text-center text-brand-cream/60">
              No general wedding or festival inquiries stored yet.
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div 
                  key={inq.id}
                  className="p-5 bg-brand-olive/20 border border-brand-gold-dark/10 rounded-xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-brand-gold-dark/10 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] bg-brand-gold-dark text-brand-green font-mono uppercase font-bold px-2 py-0.5 rounded mr-2">
                        {inq.type} Event
                      </span>
                      <strong className="font-display text-base text-brand-cream">{inq.name}</strong>
                    </div>
                    <div className="text-right text-xs font-mono text-brand-gold-dark/80">
                      Planned Date: {inq.date} ✦ Attending: {inq.guests} Guests
                    </div>
                  </div>

                  <p className="text-sm text-brand-cream/85 bg-brand-green/30 p-3 rounded-lg italic">
                    "{inq.message}"
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-brand-gold-dark/10">
                    <div className="text-xs font-sans text-brand-cream/60">
                      Phone: <span className="text-brand-cream font-mono font-bold">{inq.phone}</span> | 
                      Email: <span className="text-brand-cream ml-1">{inq.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded inline-block ${
                        inq.status === 'responded'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inq.status}
                      </span>
                      
                      <button
                        onClick={() => handleInquiryStatus(inq.id, 'responded')}
                        className="px-3 py-1 bg-brand-olive hover:bg-brand-gold-dark hover:text-brand-green text-brand-gold-dark text-xs font-mono uppercase rounded transition-all"
                      >
                        Responded
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 5. GUEST REVIEWS MODERATION PANEL */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-fade-in" id="admin-reviews-tab">
          <h3 className="font-display text-xl font-semibold text-brand-gold-dark">
            Moderate Guest Testimonials & Live Slates
          </h3>

          {reviews.length === 0 ? (
            <div className="p-12 text-center text-brand-cream/60">
              No testimonial reviews filed on direct files.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div 
                  key={rev.id}
                  className="p-5 bg-brand-olive/20 border border-brand-gold-dark/10 rounded-xl"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <strong className="font-sans text-sm block">{rev.authorName}</strong>
                      <span className="text-[10px] text-brand-cream/50 font-mono block">{rev.authorEmail}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-brand-green/45 px-2 py-1 rounded border border-brand-gold-dark/20 text-brand-gold-dark font-bold text-xs">
                      {rev.rating} <Star size={12} className="fill-current" />
                    </div>
                  </div>

                  <p className="text-xs text-brand-cream/75 italic bg-brand-green/20 p-2.5 rounded mb-4">
                    "{rev.comment}"
                  </p>

                  <div className="flex justify-between items-center pt-2.5 border-t border-brand-gold-dark/10">
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                      rev.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}>
                      {rev.status}
                    </span>

                    <div className="flex gap-2">
                      {rev.status === 'pending' && (
                        <button
                          onClick={() => handleReviewStatus(rev.id, 'approved')}
                          className="px-2.5 py-1 bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-500/20 text-emerald-300 text-xs font-mono uppercase rounded transition-colors"
                        >
                          Approve Live
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="p-1 px-2.5 bg-red-950/60 hover:bg-red-950 text-red-300 border border-red-500/10 text-xs font-mono uppercase rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
