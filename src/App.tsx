import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, MapPin, Users, Award, Shield, 
  MessageSquare, Phone, Mail, Clock, Plus, Star, 
  ChevronRight, ArrowRight, Eye, Sparkles, Building, 
  Coffee, GlassWater, Flame, HelpCircle, Compass
} from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AvailabilityWidget from './components/AvailabilityWidget';
import SuiteCard from './components/SuiteCard';
import BookingModal from './components/BookingModal';
import AdminPanel from './components/AdminPanel';
import WhatsAppButton from './components/WhatsAppButton';
import { Room, Booking, Review, GalleryItem, Inquiry } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  
  // Dynamic Booking Selector State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(2);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Filter state for Gallery page
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  
  // Custom Reviews and Contact submit state
  const [newReview, setNewReview] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [newInquiry, setNewInquiry] = useState({
    type: "wedding" as any,
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: 50,
    message: ""
  });
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  // Admin login states
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  // Load backend variables
  const fetchRoomsAndReviews = async () => {
    try {
      const [roomsRes, reviewsRes, galleryRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/reviews'),
        fetch('/api/gallery')
      ]);
      
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (galleryRes.ok) setGallery(await galleryRes.json());
    } catch (err) {
      console.error("Using secure client-side storage fallback values:", err);
    }
  };

  useEffect(() => {
    fetchRoomsAndReviews();
    // Maintain credentials local session
    if (localStorage.getItem('mahika_admin_auth') === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('mahika_admin_auth', 'true');
        setCurrentPage('admin');
      } else {
        setAdminLoginError(result.error || "Incorrect admin user or key. Verification denied.");
      }
    } catch (e) {
      setAdminLoginError("Unable to establish remote clearance protocol with server.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('mahika_admin_auth');
    setCurrentPage('home');
  };

  // Submit dynamic Reviews
  const submitReviewFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(false);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: newReview.name,
          authorEmail: newReview.email,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (response.ok) {
        setReviewSuccess(true);
        setNewReview({ name: "", email: "", rating: 5, comment: "" });
        fetchRoomsAndReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit standard banquet or event inquiry
  const submitGeneralInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySuccess(false);
    setInquiryError("");
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      });
      if (response.ok) {
        setInquirySuccess(true);
        setNewInquiry({
          type: "wedding",
          name: "",
          email: "",
          phone: "",
          date: "",
          guests: 50,
          message: ""
        });
      } else {
        const errorData = await response.json();
        setInquiryError(errorData.error || "Inquiry submission failed.");
      }
    } catch (err) {
      setInquiryError("Failed sending inquiry packet to reservation console.");
    }
  };

  // Availability Check Trigger from Widget
  const triggerAvailabilityBooking = (checkI: string, checkO: string, guests: number, targetRoomId: string) => {
    const foundRoom = rooms.find(r => r.id === targetRoomId) || rooms[0];
    if (foundRoom) {
      setSelectedRoom(foundRoom);
      setCheckInDate(checkI);
      setCheckOutDate(checkO);
      setGuestCount(guests);
      setIsBookingOpen(true);
    }
  };

  // Standard Room Select Trigger
  const triggerQuickBooking = (roomId: string) => {
    const foundRoom = rooms.find(r => r.id === roomId);
    if (foundRoom) {
      setSelectedRoom(foundRoom);
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      const out = new Date();
      out.setDate(out.getDate() + 2);
      
      setCheckInDate(tom.toISOString().split('T')[0]);
      setCheckOutDate(out.toISOString().split('T')[0]);
      setGuestCount(2);
      setIsBookingOpen(true);
    }
  };

  // Filter gallery based on selected key
  const filteredGallery = galleryFilter === 'all' 
    ? gallery 
    : gallery.filter(item => item.category === galleryFilter);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-green selection:bg-brand-gold-dark selection:text-brand-green font-sans" id="site-root-div">
      
      {/* Universal Luxury Navigation */}
      <Navbar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Pages Switch Routing Router */}
      <main className="pb-1">

        {/* 1. HOME SCREEN VIEW */}
        {currentPage === 'home' && (
          <section className="animate-fade-in" id="page-home-panel">
            
            {/* Full screen majestic cinematic hero */}
            <div className="relative h-[85vh] md:h-[95vh] flex items-center justify-center bg-brand-green text-center overflow-hidden">
              
              {/* Overlay Atmospheric Background Image mimicking a cinematic feed */}
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.4] transition-all transform scale-100 ease-out duration-1000"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=1920&q=90')` }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-transparent to-brand-green/40" />

              <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-6">
                
                <span className="font-mono text-xs md:text-sm tracking-[0.5em] text-brand-gold-dark uppercase block animate-pulse">
                  ✦ LUXURY COUNTRY RETREAT ✦
                </span>

                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-brand-cream/95 tracking-wide leading-tight">
                  Experience Luxury, <br />
                  <span className="italic font-normal text-gradient-gold">Nature</span> & Royal Rajasthan.
                </h1>

                <p className="font-sans text-sm md:text-lg text-brand-cream/80 max-w-2xl mx-auto font-light leading-relaxed">
                  Deeply ensconced in Begas, Jaipur, Mahika Valley Stay stands as an exquisite paradise for exclusive family weekends, premium parties, and destination weddings.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                  <button
                    onClick={() => setCurrentPage('accommodation')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-gold-dark to-amber-600 hover:brightness-110 text-brand-green font-sans text-xs tracking-widest font-bold uppercase rounded-xl shadow-2xl transition-transform transform hover:-translate-y-0.5 cursor-pointer"
                    id="hero-book-now-trigger"
                  >
                    Bespoke Bookings Catalog
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage('about')}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-green/80 hover:bg-brand-olive text-brand-gold-dark border border-brand-gold-dark/40 hover:border-brand-gold-dark font-mono text-xs tracking-widest uppercase rounded-xl transition-all"
                  >
                    Our Chronicle Story
                  </button>
                </div>

              </div>
              
              {/* Soft scrolling navigation prompt */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none hidden md:block">
                <span className="font-mono text-[9px] tracking-widest text-brand-gold-dark/60 uppercase block mb-1">
                  DISCOVER THE SANCTUARY
                </span>
                <span className="inline-block w-0.5 h-10 bg-brand-gold-dark/30 animate-pulse rounded" />
              </div>

            </div>

            {/* Check Availability Widget overlayed directly under the hero section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
              <AvailabilityWidget 
                rooms={rooms} 
                onCheck={triggerAvailabilityBooking} 
              />
            </div>

            {/* Showcase key features with elegant bento-styled blocks */}
            <div className="py-24 bg-brand-cream text-brand-green" id="home-features-grid">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="font-mono text-xs tracking-[0.4em] text-brand-sage uppercase font-bold block mb-2">
                    THE LIVING PROPERTY STATE
                  </span>
                  <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-brand-green">
                    An Immaculate Estate Designed For Distingushed Travelers
                  </h2>
                  <p className="font-sans text-sm text-brand-sage mt-4 leading-relaxed">
                    Every corner of Mahika Valley Stay is handcrafted to evoke absolute peace, from the deep terracotta tiles and luxury private balconies to the curated vintage Rajasthani furnishings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* Feature 1: Rooms */}
                  <div className="p-8 bg-brand-cream-dark/40 border border-brand-green/5 hover:border-brand-gold-dark/30 rounded-2xl space-y-4 transition-all hover:bg-brand-cream-dark/50 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-dark/15 text-brand-gold-dark flex items-center justify-center">
                      <Compass size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-green">4 Luxury Sights Rooms</h3>
                    <p className="text-xs text-brand-sage leading-relaxed">
                      Elegantly appointed suites including traditional frescoes, customized sit-out courtyards, private glass showers, and high-fidelity smart elements.
                    </p>
                    <button 
                      onClick={() => setCurrentPage('accommodation')} 
                      className="text-xs font-mono font-bold tracking-wider text-brand-gold-dark flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Explore Rooms <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Feature 2: Event Hall */}
                  <div className="p-8 bg-brand-cream-dark/40 border border-brand-green/5 hover:border-brand-gold-dark/30 rounded-2xl space-y-4 transition-all hover:bg-brand-cream-dark/50 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-dark/15 text-brand-gold-dark flex items-center justify-center">
                      <Building size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-green">1 Premium Event Hall</h3>
                    <p className="text-xs text-brand-sage leading-relaxed">
                      Adorned with brass visual chandeliers and modular acoustics, our banquet simplifies upscale corporate retreats, private galas, or elite destination weddings.
                    </p>
                    <button 
                      onClick={() => setCurrentPage('event-hall')} 
                      className="text-xs font-mono font-bold tracking-wider text-brand-gold-dark flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Plan Banquet Event <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Feature 3: Swimming Pool */}
                  <div className="p-8 bg-brand-cream-dark/40 border border-brand-green/5 hover:border-brand-gold-dark/30 rounded-2xl space-y-4 transition-all hover:bg-brand-cream-dark/50 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-dark/15 text-brand-gold-dark flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-green">Crystal Swimming Pool</h3>
                    <p className="text-xs text-brand-sage leading-relaxed">
                      Wash away worries in our sparkling deep blue aquatic oasis, surrounded by lush daybed loungers, green palms, and sunset mocktail services.
                    </p>
                    <button 
                      onClick={() => setCurrentPage('experiences')} 
                      className="text-xs font-mono font-bold tracking-wider text-brand-gold-dark flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Bespoke Experiences <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Feature 4: Luxury Bar */}
                  <div className="p-8 bg-brand-cream-dark/40 border border-brand-green/5 hover:border-brand-gold-dark/30 rounded-2xl space-y-4 transition-all hover:bg-brand-cream-dark/50 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-dark/15 text-brand-gold-dark flex items-center justify-center">
                      <GlassWater size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-green">Signature Cocktails Bar</h3>
                    <p className="text-xs text-brand-sage leading-relaxed">
                      A fully stocked visual sanctuary serving fine spirits, international blends, and Rajasthani spiced mocktails crafted by local heritage mixologists.
                    </p>
                  </div>

                  {/* Feature 5: Garden Lawn */}
                  <div className="p-8 bg-brand-cream-dark/40 border border-brand-green/5 hover:border-brand-gold-dark/30 rounded-2xl space-y-4 transition-all hover:bg-brand-cream-dark/50 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-dark/15 text-brand-gold-dark flex items-center justify-center">
                      <Coffee size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-green">Expansive Garden Arena</h3>
                    <p className="text-xs text-brand-sage leading-relaxed">
                      Perfectly manicured flower alleys and grand lush turf sections configured to support up to 500 guests under starlit nights or warm sunrise brunches.
                    </p>
                  </div>

                  {/* Feature 6: Bonfire Experience */}
                  <div className="p-8 bg-brand-cream-dark/40 border border-brand-green/5 hover:border-brand-gold-dark/30 rounded-2xl space-y-4 transition-all hover:bg-brand-cream-dark/50 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-dark/15 text-brand-gold-dark flex items-center justify-center">
                      <Flame size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-green">Sunset Bonfire Nights</h3>
                    <p className="text-xs text-brand-sage leading-relaxed">
                      Cosy firepit circles arranged in the evenings offering soulful Rajasthani folk music, starlit dining menus, and family-styled culinary activities.
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* Mid-screen visual divider showcasing luxury feel */}
            <div className="relative py-32 bg-brand-green text-brand-cream overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 fixed scroll-smooth"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80')` }}
              />
              <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-4">
                <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark uppercase block font-bold">
                  CELESTIAL REVELRY
                </span>
                <h3 className="font-display text-3xl md:text-5xl font-bold leading-normal text-gradient-gold">
                  "Where the sands of Rajasthan greet the luxury of a private escape."
                </h3>
                <p className="font-mono text-xs text-brand-cream/50 uppercase tracking-widest pt-2">
                  ✦ Begas, Near Ajmer Road Pathways, Jaipur ✦
                </p>
              </div>
            </div>

            {/* Testimonials highlight block */}
            <div className="py-24 bg-brand-cream-dark/25 text-brand-green">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-xl mx-auto mb-16">
                  <span className="font-mono text-xs tracking-[0.4em] text-brand-sage uppercase font-bold block mb-2">
                    LORE & PRAISE
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold">
                    Testimonials From Noble Guests
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-6 bg-brand-cream border border-brand-gold-dark/10 rounded-2xl shadow-md space-y-4">
                      <div className="flex gap-1 text-brand-gold-dark">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={15} className="fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-brand-sage italic leading-relaxed">
                        "{review.comment}"
                      </p>
                      <div className="border-t border-brand-green/10 pt-4 flex items-center justify-between">
                        <span className="font-sans text-xs font-bold text-brand-green">{review.authorName}</span>
                        <span className="text-[10px] font-mono text-brand-sage">Verified Guest ✓</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Interactive maps section */}
            <div className="py-16 bg-brand-cream border-t border-brand-green/15 text-brand-green">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  
                  <div className="space-y-6">
                    <span className="font-mono text-xs text-brand-sage font-bold tracking-[0.3em] uppercase block">
                      GEOGRAPHIC COORDINATES
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-bold">
                      A Royal Escape Near Jaipur Ajmer-Road Expressway
                    </h2>
                    <p className="text-sm text-brand-sage leading-relaxed">
                      Mahika Valley Stay is located in Begas, Jaipur, thoughtfully positioned off the main highways, ensuring complete rural privacy while keeping key Jaipur palaces and airport transit accessible within 45-60 minutes.
                    </p>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-brand-gold-dark rounded-full" />
                        <span>Begas Town Circle: 5 Mins Range</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-brand-gold-dark rounded-full" />
                        <span>Tehsils & Local Bazar: 10 Mins Access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-brand-gold-dark rounded-full" />
                        <span>Ajmer Highways Bypass: 15 Mins Drive</span>
                      </div>
                    </div>
                    
                    <a 
                      href="https://maps.google.com/?q=Mahika+Valley+Stay+Begas+Jaipur" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green hover:bg-brand-olive text-brand-gold-dark text-xs font-mono uppercase tracking-widest rounded-xl transition-all font-bold"
                    >
                      LAUNCH ROUTE IN GOOGLE MAPS ➔
                    </a>
                  </div>

                  {/* Simulated gorgeous map preview matching resort theme */}
                  <div className="relative rounded-2xl overflow-hidden border border-brand-gold-dark/20 h-96 shadow-2xl bg-brand-olive">
                    
                    {/* Retro dark resort styled map layout */}
                    <div className="absolute inset-0 bg-brand-green/95 p-8 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-brand-gold-dark tracking-widest uppercase">MAHIKA ESTATE ATLAS</span>
                        <h4 className="font-display text-xl text-brand-cream">Begas Precinct, Jaipur</h4>
                      </div>

                      {/* Map abstract graphics */}
                      <div className="relative flex-grow border border-brand-gold-dark/10 rounded-xl my-4 overflow-hidden bg-brand-olive/30 p-4 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-brand-gold-dark/10 border border-brand-gold-dark flex items-center justify-center text-brand-gold-dark animate-pulse mb-3">
                          <MapPin size={28} />
                        </div>
                        <div className="font-mono text-[11px] text-brand-cream/80 space-y-1">
                          <p>LAT: 26.8525° N | LON: 75.5412° E</p>
                          <p className="text-brand-gold-dark font-medium">✦ MAHIKA VALLEY STAY ✦</p>
                          <p className="text-[10px] text-brand-cream/50">Begas, Ajmer Link Road, Rajasthan, India</p>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-brand-cream/40 text-center">
                        *Complimentary premium chauffeur coordinates available upon request.
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </section>
        )}

        {/* 2. ABOUT PAGE VIEW */}
        {currentPage === 'about' && (
          <section className="py-20 animate-fade-in" id="page-about-panel">
            <div className="max-w-4xl mx-auto px-4 space-y-12">
              
              <div className="text-center space-y-3">
                <span className="font-mono text-xs tracking-widest text-brand-gold-dark-dark font-bold uppercase">✦ OUR CHRONICLE HERITAGE ✦</span>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-brand-green">The Story of Mahika Valley Stay</h1>
                <p className="text-sm font-mono text-brand-sage">LUXURY RESIDENTIAL ESTATE • JAIPUR, RAJASTHAN</p>
              </div>

              <div className="relative rounded-2xl overflow-hidden h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80" 
                  alt="Mahika Valley Courtyard View" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-brand-cream font-display text-lg italic text-center">
                  "Step away from the mechanical rush of city centers into Jaipur's pristine countryside retreat."
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-sm text-brand-sage leading-relaxed">
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-bold text-brand-green">A Royal Countryside Vision</h3>
                  <p>
                    Established on the historic agricultural plains of Begas, Mahika Valley Stay was conceptualized as a serene oasis where contemporary world-class resort amenities and the warm, artistic hospitality of royal Rajasthan blend cohesively.
                  </p>
                  <p>
                    From our hand-sculpted arches and premium terracotta layouts to our solar-heated organic gardens, we represent a conscious, high-end interpretation of desert retreat leisure.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-bold text-brand-green">Bespoke Guest Philosophy</h3>
                  <p>
                    We cater carefully to high-net-worth travelers, destination wedding guests, and creative collectives who value pristine acoustic privacy, private pool access, and curated culinary experiences.
                  </p>
                  <p>
                    At Mahika, you are not merely renting a room; you are accessing a fully secured private estate with a around-the-clock dedicated butler console, visual cocktail bars, and sunset folk arts evenings.
                  </p>
                </div>
              </div>

              {/* Stats highlights banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-brand-olive text-brand-cream rounded-2xl text-center">
                <div>
                  <span className="font-display text-3xl font-bold text-brand-gold-dark">4</span>
                  <p className="text-[10px] font-mono uppercase text-brand-cream/60">Privileged Suites</p>
                </div>
                <div>
                  <span className="font-display text-3xl font-bold text-brand-gold-dark">1</span>
                  <p className="text-[10px] font-mono uppercase text-brand-cream/60">Banquets Hall</p>
                </div>
                <div>
                  <span className="font-display text-3xl font-bold text-brand-gold-dark">12k+</span>
                  <p className="text-[10px] font-mono uppercase text-brand-cream/60">Sq. Ft. Lush Lawns</p>
                </div>
                <div>
                  <span className="font-display text-3xl font-bold text-brand-gold-dark">100%</span>
                  <p className="text-[10px] font-mono uppercase text-brand-cream/60">Acoustic Privacy</p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* 3. ACCOMMODATION PAGE VIEW */}
        {currentPage === 'accommodation' && (
          <section className="py-20 bg-brand-cream animate-fade-in" id="page-accommodation-panel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-xs tracking-widest text-brand-gold-dark-dark uppercase block font-bold mb-1">
                  EXCLUSIVE SANCTUARIES
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-green">
                  Private Palatial Suites
                </h1>
                <p className="font-sans text-sm text-brand-sage mt-3">
                  Deliberately limited to only four premium accommodations to secure absolute quietness, bespoke care, and direct swimming pool access slots.
                </p>
              </div>

              <div className="space-y-12">
                {rooms.map((room) => (
                  <SuiteCard 
                    key={room.id}
                    room={room}
                    onBookNow={triggerQuickBooking}
                  />
                ))}
              </div>

            </div>
          </section>
        )}

        {/* 4. EVENT HALL PAGE VIEW */}
        {currentPage === 'event-hall' && (
          <section className="py-20 animate-fade-in" id="page-event-hall-panel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-xs tracking-widest text-brand-gold-dark uppercase block font-bold mb-1">
                  IMPERIAL CELEBRATIONS
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-green">
                  The Palace Banquet Hall & Lawns
                </h1>
                <p className="font-sans text-sm text-brand-sage mt-3">
                  Scale your special days to royal standards. We provide luxury indoor banquet hosting space coupled with expansive open-sky visual landscaping.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
                
                {/* Showcase image galleries */}
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden h-96 shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80" 
                      alt="Wedding banquet setting" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl overflow-hidden h-24">
                      <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80" alt="cocktails bar" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-xl overflow-hidden h-24">
                      <img src="https://images.unsplash.com/photo-1526495124232-a04e1849168a?auto=format&fit=crop&w=400&q=80" alt="bonfire space" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-xl overflow-hidden h-24">
                      <img src="https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=400&q=80" alt="swimming pool deck" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Fact sheet list */}
                  <div className="p-6 bg-brand-olive/5 border border-brand-gold-dark/10 rounded-xl space-y-3">
                    <h4 className="font-mono text-xs text-brand-gold-dark font-bold uppercase">BANQUET DETAILS & MEASURES</h4>
                    <ul className="text-xs space-y-2 text-brand-sage">
                      <li className="flex justify-between border-b border-brand-green/10 pb-1">
                        <span>Indoor Capacity:</span>
                        <strong className="text-brand-green">120 Seated | 200 Floating</strong>
                      </li>
                      <li className="flex justify-between border-b border-brand-green/10 pb-1">
                        <span>Lawn Capactiy:</span>
                        <strong className="text-brand-green text-right">Up to 500 Guests</strong>
                      </li>
                      <li className="flex justify-between border-b border-brand-green/10 pb-1">
                        <span>Audio Solutions:</span>
                        <strong className="text-brand-green">Built-In Smart Soundbars + Mixer</strong>
                      </li>
                      <li className="flex justify-between pb-1">
                        <span>Dedicated Guest Washrooms:</span>
                        <strong className="text-brand-green">Available (Exquisite Marble Styling)</strong>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Inquiry submit box */}
                <div className="bg-brand-olive text-brand-cream p-8 rounded-2xl border border-brand-gold-dark/30 shadow-2xl space-y-6">
                  
                  <div className="text-center">
                    <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark uppercase block">
                      RESERVE BANQUET SLOTS
                    </span>
                    <h3 className="font-display text-2xl font-bold mt-1 text-gradient-gold">
                      Estate Event Inquiry Form
                    </h3>
                    <p className="text-xs text-brand-cream/60 mt-2">
                      Please catalog your date requirements below. Our high-end hospitality specialists will reply with customized brochure booklets within 12 hours.
                    </p>
                  </div>

                  {inquirySuccess ? (
                    <div className="p-6 bg-emerald-950/40 border border-emerald-500 rounded-xl text-center space-y-4">
                      <span className="text-emerald-400 font-display text-lg block">Inquiry Logged ✓</span>
                      <p className="text-xs text-brand-cream/80 leading-relaxed">
                        Your event inquiry has been logged in our central register. To secure an instant custom quotation, you can also ping us on WhatsApp below.
                      </p>
                      <a
                        href={`https://wa.me/917073832421?text=${encodeURIComponent("Hello Mahika Valley Stay! I just lodged an Event Inquiry for my " + newInquiry.type + " and would like to coordinate dates.")}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-mono font-bold tracking-wider uppercase text-white"
                      >
                        Claim Priority WhatsApp Review
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={submitGeneralInquiry} className="space-y-4">
                      {inquiryError && (
                        <div className="p-3 bg-red-950 border border-red-500 text-xs text-red-300 rounded">
                          {inquiryError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-brand-gold-dark uppercase font-bold">Event Category</label>
                        <select
                          value={newInquiry.type}
                          onChange={(e: any) => setNewInquiry({ ...newInquiry, type: e.target.value })}
                          className="w-full px-3 py-2.5 bg-brand-green border border-brand-gold-dark/20 focus:border-brand-gold-dark text-brand-cream rounded-xl text-xs outline-none"
                        >
                          <option value="wedding">Destination Royal Wedding</option>
                          <option value="corporate">Upscale Corporate Retreat</option>
                          <option value="birthday">Private Milestones & Birthdays</option>
                          <option value="other">Exclusive High-End Gatherings</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-brand-gold-dark uppercase font-bold">Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Meera Sharma"
                            value={newInquiry.name}
                            onChange={(e) => setNewInquiry({ ...newInquiry, name: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 bg-brand-green border border-brand-gold-dark/20 focus:border-brand-gold-dark text-brand-cream rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-brand-gold-dark uppercase font-bold">Contact Phone</label>
                          <input
                            type="tel"
                            placeholder="e.g. +91 9414012345"
                            value={newInquiry.phone}
                            onChange={(e) => setNewInquiry({ ...newInquiry, phone: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 bg-brand-green border border-brand-gold-dark/20 focus:border-brand-gold-dark text-brand-cream rounded-xl text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-brand-gold-dark uppercase font-bold">Planned Date</label>
                          <input
                            type="date"
                            value={newInquiry.date}
                            onChange={(e) => setNewInquiry({ ...newInquiry, date: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 bg-brand-green border border-brand-gold-dark/20 focus:border-brand-gold-dark text-brand-cream rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-brand-gold-dark uppercase font-bold">Expected Guests</label>
                          <input
                            type="number"
                            min={10}
                            max={600}
                            value={newInquiry.guests}
                            onChange={(e) => setNewInquiry({ ...newInquiry, guests: Number(e.target.value) })}
                            required
                            className="w-full px-3 py-2.5 bg-brand-green border border-brand-gold-dark/20 focus:border-brand-gold-dark text-brand-cream rounded-xl text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-brand-gold-dark uppercase font-bold">Email Handle</label>
                        <input
                          type="email"
                          placeholder="e.g. guest@corporate.in"
                          value={newInquiry.email}
                          onChange={(e) => setNewInquiry({ ...newInquiry, email: e.target.value })}
                          required
                          className="w-full px-3 py-2.5 bg-brand-green border border-brand-gold-dark/20 focus:border-brand-gold-dark text-brand-cream rounded-xl text-xs outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-brand-gold-dark uppercase font-bold">Inquiry Narrative & Remarks</label>
                        <textarea
                          placeholder="Please elaborate on your catering requirements, lighting setup or room reserves details..."
                          rows={3}
                          value={newInquiry.message}
                          onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                          className="w-full px-3 py-2 bg-brand-green border border-brand-gold-dark/20 focus:border-brand-gold-dark text-brand-cream rounded-xl text-xs outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-brand-gold-dark to-amber-600 hover:brightness-110 text-brand-green font-sans text-xs tracking-widest font-bold uppercase rounded-xl transition-all shadow-lg text-center"
                      >
                        LOG BANQUETS INQUIRY ➔
                      </button>

                    </form>
                  )}

                </div>

              </div>

            </div>
          </section>
        )}

        {/* 5. EXPERIENCES PAGE VIEW */}
        {currentPage === 'experiences' && (
          <section className="py-20 animate-fade-in text-brand-green" id="page-experiences-panel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-xs tracking-widest text-brand-gold-dark-dark uppercase block font-bold mb-1">
                  CURATED LIVING ART
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  The Mahika Valley Lifestyle
                </h1>
                <p className="font-sans text-sm text-brand-sage mt-3">
                  We believe true high-end hospitality lies in small, beautifully executed micro-moments. Explore our hand-designed on-property and local adventures.
                </p>
              </div>

              <div className="space-y-24">
                
                {/* Exp 1: Pool */}
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="w-full lg:w-1/2 h-96 rounded-2xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=1200&q=80" alt="Resort swimming pool" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4">
                    <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark-dark font-bold uppercase block">
                      AQUATIC THERAPY
                    </span>
                    <h3 className="font-display text-3xl font-bold text-brand-green">Celestial Swimming Pool</h3>
                    <p className="text-sm text-brand-sage leading-relaxed">
                      Our signature infinity-style pool is treated with high-grade organic mineral salts rather than harsh bleach, keeping the water silky soft and eyes safe. Framed by palm layouts, cozy sunset beds, and a designated mocktails console, the pool is open exclusively to our four suites, securing unhurried calm.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono text-brand-gold-dark">
                      <span>✦ Filtered mineral elements</span> | <span>✦ Plush bathrobes provided</span>
                    </div>
                  </div>
                </div>

                {/* Exp 2: Cozy bonfire */}
                <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                  <div className="w-full lg:w-1/2 h-96 rounded-2xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1526495124232-a04e1849168a?auto=format&fit=crop&w=1200&q=80" alt="bonfire night" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4">
                    <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark-dark font-bold uppercase block">
                      STALLION STARS ORBIT
                    </span>
                    <h3 className="font-display text-3xl font-bold text-brand-green">Bonfire Nights & Folk Lore</h3>
                    <p className="text-sm text-brand-sage leading-relaxed">
                      As desert twilight turns to deep dark night, gather around our circular stone fire pits. Savor complimentary warm spiced cider, slow-cooked local Rajasthani delicacies, and intimate acoustic melodies by master Manganiyar folk musicians. Perfect for close-knit family reunions and couples' escapes.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono text-brand-gold-dark">
                      <span>✦ Live acoustic music</span> | <span>✦ Custom appetizers menus</span>
                    </div>
                  </div>
                </div>

                {/* Exp 3: Bar & Rajasthan walks */}
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="w-full lg:w-1/2 h-96 rounded-2xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80" alt="Cocktail bar" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4">
                    <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark-dark font-bold uppercase block">
                      LOCAL FLAVOUR ATLAS
                    </span>
                    <h3 className="font-display text-3xl font-bold text-brand-green">Bespoke Heritage Cocktail Lounge</h3>
                    <p className="text-sm text-brand-sage leading-relaxed">
                      Our in-house mixologist blends signature cocktails infused with Jaipur desert roses, organic cardamom seeds, and pure local organic honey. Located inside our antique wood lounge bar, the space coordinates customized tasting sessions paired with Jaipur village excursions, pottery retreats, and regional sand dune strolls.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* 6. GALLERY PAGE VIEW */}
        {currentPage === 'gallery' && (
          <section className="py-20 animate-fade-in text-brand-green" id="page-gallery-panel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-xs tracking-widest text-brand-gold-dark-dark uppercase block font-bold mb-1">
                  PORTRAIT CHRONICLES
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  Resort Media Gallery Showcase
                </h1>
                <p className="font-sans text-sm text-brand-sage mt-2">
                  Gaze inside the golden hour visual landscapes of Mahika Valley Stay, spanning our suites, crystal pool waters, banquet chandeliers, and bonfire pits.
                </p>
              </div>

              {/* Filtering Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-brand-green/10 pb-4">
                {['all', 'rooms', 'pool', 'hall', 'night', 'experience'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                      galleryFilter === cat 
                        ? 'bg-brand-green text-brand-gold-dark border-brand-green font-bold shadow-md' 
                        : 'border-brand-green/10 hover:border-brand-gold-dark/40 text-brand-sage'
                    }`}
                  >
                    {cat === 'all' ? '✦ ALL REVELRYS' : cat}
                  </button>
                ))}
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGallery.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative group rounded-2xl overflow-hidden border border-brand-gold-dark/10 shadow-lg h-72 cursor-pointer"
                  >
                    <img 
                      src={item.url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-transparent to-transparent opacity-8 transition-opacity duration-300" />
                    
                    <div className="absolute bottom-4 left-4 right-4 text-brand-cream">
                      <span className="font-mono text-[9px] text-brand-gold-dark tracking-widest uppercase block mb-0.5">
                        {item.category}
                      </span>
                      <h4 className="font-display text-base font-medium tracking-wide">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* 7. REVIEWS & TESTIMONIALS SUBMISSIONS PAGE */}
        {currentPage === 'reviews' && (
          <section className="py-20 animate-fade-in text-brand-green" id="page-reviews-panel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-xs tracking-widest text-brand-gold-dark-dark uppercase block font-bold mb-1">
                  ESTEEMED DISPATCH
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  Guest Reviews & Noble Notes
                </h1>
                <p className="font-sans text-sm text-brand-sage mt-2">
                  Read unfiltered notes logged by travelers across India and abroad. We invite all guests to share their authentic retreat chronicles.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                
                {/* Visual score display */}
                <div className="lg:col-span-1 p-8 bg-brand-olive text-brand-cream rounded-2xl border border-brand-gold-dark/20 text-center space-y-4 shadow-xl">
                  <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark/80 uppercase block font-bold">
                    OVERALL STANDARDS SCORE
                  </span>
                  <div className="font-display text-6xl font-bold text-gradient-gold">4.9</div>
                  <div className="flex justify-center gap-1 text-brand-gold-dark">
                    {[1, 2, 3, 4, 5].map((_, i) => <Star key={i} size={18} className="fill-current" />)}
                  </div>
                  <p className="text-xs text-brand-cream/65 leading-relaxed">
                    Based on verified direct guest bookings surveys. 100% of respondents praise absolute room cleanliness, pool water clarity, and warm estate butler attention.
                  </p>
                </div>

                {/* Submissions checklist with custom form */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Testimonials list */}
                  <div className="space-y-4">
                    <h3 className="font-display text-2xl font-bold border-b border-brand-green/10 pb-2">Latest verified reviews</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-5 bg-brand-cream-dark/20 border border-brand-gold-dark/10 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <strong className="font-sans text-sm text-brand-green">{rev.authorName}</strong>
                            <div className="flex gap-0.5 text-brand-gold-dark">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} size={12} className="fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-brand-sage italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit review */}
                  <div className="p-6 bg-brand-cream border border-brand-gold-dark/25 rounded-2xl space-y-4 shadow-lg">
                    <h4 className="font-display text-xl font-bold">Erect a Testimonial Note</h4>
                    <p className="text-xs text-brand-sage leading-relaxed">
                      Your words keep our craftsmen inspired. Reviews are logged on the administration file console prior to live front exhibition.
                    </p>

                    {reviewSuccess ? (
                      <div className="p-4 bg-emerald-900/10 border border-emerald-500 rounded-xl text-xs text-emerald-800 text-center font-sans">
                        ✦ Chronicle entry received! Your noble notes have been dispatched to the estate moderation list. Thank you.
                      </div>
                    ) : (
                      <form onSubmit={submitReviewFeedback} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-sans text-brand-sage">Your Name</label>
                            <input
                              type="text"
                              required
                              value={newReview.name}
                              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                              placeholder="e.g. Maharaja Vikram"
                              className="w-full px-3 py-2 bg-brand-cream-dark/40 border border-brand-green/10 focus:border-brand-gold-dark rounded-xl text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-sans text-brand-sage">Your Email</label>
                            <input
                              type="email"
                              required
                              value={newReview.email}
                              onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                              placeholder="e.g. noble@delhi.com"
                              className="w-full px-3 py-2 bg-brand-cream-dark/40 border border-brand-green/10 focus:border-brand-gold-dark rounded-xl text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-sans text-brand-sage block mb-1">Your Retinue Rating</label>
                          <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                            className="px-3 py-2 bg-brand-cream-dark/40 border border-brand-green/10 text-xs rounded-xl font-mono"
                          >
                            <option value={5}>✦✦✦✦✦ Perfect five stellar star rating</option>
                            <option value={4}>✦✦✦✦ Luxurious four star rating</option>
                            <option value={3}>✦✦✦ Comfort three star rating</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-sans text-brand-sage">Your Chronicle Comments</label>
                          <textarea
                            required
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Write your honest memories here..."
                            rows={3}
                            className="w-full px-3 py-2 bg-brand-cream-dark/40 border border-brand-green/10 focus:border-brand-gold-dark rounded-xl text-xs outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-brand-green hover:bg-brand-olive text-brand-gold-dark text-xs font-mono uppercase tracking-wider rounded-xl font-bold cursor-pointer"
                        >
                          SUBMIT CHRONICLE ENTRY
                        </button>
                      </form>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </section>
        )}

        {/* 8. CONTACT PAGE VIEW & SECURE LOGINS */}
        {currentPage === 'contact' && (
          <section className="py-20 animate-fade-in text-brand-green" id="page-contact-panel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-xs tracking-widest text-brand-gold-dark-dark uppercase block font-bold mb-1">
                  ESTATE ACCESS DESK
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  Secure Communication & Maps
                </h1>
                <p className="font-sans text-sm text-brand-sage mt-2">
                  Begin your escape with premium host support. Coordinate weddings schedules, private dinner menus, and customized transport logs.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* Host Details panel */}
                <div className="space-y-8">
                  
                  <div className="p-6 bg-brand-olive text-brand-cream border border-brand-gold-dark/20 rounded-2xl shadow-xl space-y-6">
                    <h3 className="font-display text-2xl font-semibold text-gradient-gold">Direct Reservation Lines</h3>
                    
                    <div className="space-y-4 text-sm font-sans">
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-brand-gold-dark" />
                        <div>
                          <span className="text-[10px] uppercase font-mono block text-brand-cream/50">Calling Telephone</span>
                          <a href="tel:+917073832421" className="font-bold hover:text-brand-gold-dark">+91 7073832421</a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MessageSquare size={18} className="text-brand-gold-dark" />
                        <div>
                          <span className="text-[10px] uppercase font-mono block text-brand-cream/50">WhatsApp Concierge Desk</span>
                          <a href="https://wa.me/917073832421" className="font-bold text-emerald-400 hover:brightness-110">Launch Chat Integration</a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-brand-gold-dark" />
                        <div>
                          <span className="text-[10px] uppercase font-mono block text-brand-cream/50">Electronic Mail Handle</span>
                          <a href="mailto:info@mahikavalleystay.com" className="font-mono hover:text-brand-gold-dark">info@mahikavalleystay.com</a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-brand-gold-dark" />
                        <div>
                          <span className="text-[10px] uppercase font-mono block text-brand-cream/50">The Estate Coordinates</span>
                          <span>Begas, Near Ajmer Road Highways, Jaipur, Rajasthan, India</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin restricted gate entry */}
                  <div className="p-6 bg-brand-cream border border-brand-gold-dark/20 rounded-2xl space-y-4 shadow-lg">
                    <div className="flex items-center gap-2 text-brand-green font-display text-lg font-bold">
                      <Shield size={20} className="text-brand-gold-dark" />
                      <span>Staff restricted gate login</span>
                    </div>
                    <p className="text-[11px] text-brand-sage font-mono">
                      *Verify credential clearance to manage live room rates and book queues. Authorized personnel only.
                    </p>

                    {isAdminLoggedIn ? (
                      <div className="p-4 bg-brand-olive/10 border border-brand-gold-dark/20 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-emerald-800">✓ Personnel Session Verified Active</span>
                        <button
                          onClick={() => setCurrentPage('admin')}
                          className="px-4 py-2 bg-gradient-to-r from-brand-gold-dark to-amber-600 text-brand-green font-mono text-[9px] uppercase font-bold rounded shadow"
                        >
                          Launch Dashboard
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleAdminAuth} className="space-y-3">
                        {adminLoginError && (
                          <div className="p-2.5 bg-red-950/10 border border-red-500 text-[11px] text-red-800 rounded">
                            {adminLoginError}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Staff ID"
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                            required
                            className="px-3 py-2 bg-brand-cream-dark/40 border border-brand-green/10 text-xs rounded-xl outline-none"
                          />
                          <input
                            type="password"
                            placeholder="Clear Key"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            className="px-3 py-2 bg-brand-cream-dark/40 border border-brand-green/10 text-xs rounded-xl outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-brand-green hover:bg-brand-olive text-brand-gold-dark text-[10px] font-mono uppercase tracking-[0.2em] font-bold rounded-xl transition"
                        >
                          VERIFY PERMISSION PASS
                        </button>
                        <p className="text-[9px] text-center text-brand-sage italic">
                          (Demo hints: user: <span className="font-mono bg-brand-cream-dark px-1 rounded text-brand-green font-bold">admin</span> | pass: <span className="font-mono bg-brand-cream-dark px-1 rounded text-brand-green font-bold">royalmahika</span>)
                        </p>
                      </form>
                    )}
                  </div>

                </div>

                {/* Simulated luxury direct enquiry contact form */}
                <div className="p-8 bg-brand-cream-dark/30 border border-brand-gold-dark/15 rounded-2xl space-y-6 shadow-xl">
                  <h3 className="font-display text-2xl font-bold">Dispatch high-end stay queries</h3>
                  <p className="text-xs text-brand-sage">
                    Use our verified host box to request custom stay itineraries, corporate billing registers, or airport pickups coordinates.
                  </p>

                  <form onSubmit={(e) => { e.preventDefault(); alert("Enquiry dispatched successfully to Mahika stays hosts."); }} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-brand-sage">Your Name</label>
                        <input type="text" required placeholder="Noble Traveler Name" className="w-full p-2.5 bg-brand-cream border border-brand-green/10 rounded-xl outline-none focus:border-brand-gold-dark" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-brand-sage">Telephone</label>
                        <input type="tel" required placeholder="e.g. +91" className="w-full p-2.5 bg-brand-cream border border-brand-green/10 rounded-xl outline-none focus:border-brand-gold-dark font-mono" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-brand-sage">Email Handle</label>
                      <input type="email" required placeholder="noble@travels.co" className="w-full p-2.5 bg-brand-cream border border-brand-green/10 rounded-xl outline-none focus:border-brand-gold-dark" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-brand-sage">Message & Intentions</label>
                      <textarea rows={4} required placeholder="Please clarify dates and custom welcome amenities desires..." className="w-full p-2.5 bg-brand-cream border border-brand-green/10 rounded-xl outline-none focus:border-brand-gold-dark" />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-brand-green hover:bg-brand-olive text-brand-gold-dark text-xs font-mono uppercase tracking-widest font-bold rounded-xl transition-all"
                    >
                      SEND HOST PACKAGE DESK
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* 9. SECURE CLASSIFIED ADMINISTRATION DASHBOARD PANEL */}
        {currentPage === 'admin' && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in" id="page-admin-panel">
            {isAdminLoggedIn ? (
              <AdminPanel 
                onLogout={handleAdminLogout} 
                allRooms={rooms}
                onRefreshRooms={fetchRoomsAndReviews}
              />
            ) : (
              <div className="p-12 text-center text-brand-sage max-w-md mx-auto space-y-4">
                <Shield size={48} className="mx-auto text-brand-gold-dark" />
                <h3 className="font-display text-xl font-bold">Estate Clearance Required</h3>
                <p className="text-xs leading-relaxed">
                  Your personnel clearance token has expired or is invalid. Please return to the Contact page to verify permissions check.
                </p>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="px-5 py-2.5 bg-brand-green text-brand-gold-dark text-xs uppercase font-mono tracking-wider rounded"
                >
                  Clear Permissions
                </button>
              </div>
            )}
          </section>
        )}

      </main>

      {/* Booking popup widget system modal toggles */}
      {isBookingOpen && selectedRoom && (
        <BookingModal
          room={selectedRoom || rooms[0]}
          initialCheckIn={checkInDate}
          initialCheckOut={checkOutDate}
          initialGuests={guestCount}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedRoom(null);
          }}
          onBookingSuccess={fetchRoomsAndReviews}
        />
      )}

      {/* Floating social integration elements */}
      <WhatsAppButton />

      {/* Elegant footer section */}
      <Footer onNavigate={setCurrentPage} />

    </div>
  );
}
