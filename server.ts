import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Handle global definitions for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface formats matching /src/types.ts
interface Room {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  size: string;
  capacity: string;
  price: number;
  images: string[];
  amenities: string[];
  status: 'available' | 'maintenance';
}

interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'unpaid' | 'paid';
  notes?: string;
  createdAt: string;
}

interface Review {
  id: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

interface GalleryItem {
  id: string;
  url: string;
  category: 'rooms' | 'pool' | 'hall' | 'night' | 'garden' | 'experience';
  title: string;
  type: 'image' | 'video';
}

interface Inquiry {
  id: string;
  type: 'wedding' | 'corporate' | 'birthday' | 'other';
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  message: string;
  status: 'pending' | 'responded';
  createdAt: string;
}

// Global store initialized with beautiful premium mock data to prevent blank-screen syndrome
const DEFAULT_ROOMS: Room[] = [
  {
    id: "room-royal-suite",
    name: "Royal Heritage Suite",
    description: "The ultimate royal sanctuary, adorned with heritage Rajasthani frescoes, vintage wood accents, and custom artifacts.",
    longDescription: "Step into an era of unmatched grandeur. The Royal Heritage Suite features hand-crafted stone arches, royal miniature artworks, and modern opulence. Revel in a private private sit-out courtyard overlooking the beautifully manicured visual landscapes of Jaipur. Complete with a private glass-enclosed Jacuzzi tub, luxury plush fabrics, customizable climate control, and a signature curated personal mini bar.",
    size: "650 sq. ft.",
    capacity: "2 Adults + 1 Child",
    price: 13500,
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "King Size Poster Bed",
      "Private Balcony & Courtyard",
      "En-suite Jacuzzi Tub",
      "Rajasthani Artwork & Decor",
      "Royal Welcomes Tray",
      "Premium Minibar",
      "Vented Air Conditioning",
      "65\" Smart OLED TV",
      "Ultra-Fast WiFi 6"
    ],
    status: 'available'
  },
  {
    id: "room-desert-rose",
    name: "Desert Rose Luxury Room",
    description: "A gorgeous blending of modern luxury minimalist aesthetics, warm terracotta tones, and custom ambient lighting.",
    longDescription: "Inspired by the serene sands of Rajasthan, the Desert Rose room is a space of earthy luxury. Standard styled and fully complete with an open-to-sky exotic outdoor rain shower experience, handmade clay tiles, custom brass fixtures, and a lush private hammock garden. Specially framed for travelers seeking natural tranquility combined with absolute luxury.",
    size: "480 sq. ft.",
    capacity: "2 Adults",
    price: 9800,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "Luxury Terracotta Floor",
      "Open-Sky Private Rain Shower",
      "Sand Dune Facing Deck",
      "Premium Cotton Bathrobes",
      "All-Natural Organic Toiletry Kit",
      "Espresso Capsule Machine",
      "Induction Climate Panel",
      "High-Fidelity Audio System",
      "Complementary Fruit Basket"
    ],
    status: 'available'
  },
  {
    id: "room-aravalli-view",
    name: "Aravalli View Imperial Suite",
    description: "Perched high for panoramic framing of the scenic Aravalli mountain foothills, with stunning premium glass facades.",
    longDescription: "Awake to golden sunrises painting the mist-shrouded Aravalli Hills. The suite boasts glass walls that seamlessly bring nature indoors, a cozy wood-burning style fireplace for Jaipur winters, an inviting deep soaking brass bathtub, and custom designer furniture. This is an elegant design perfect for long luxurious weekend escapes.",
    size: "580 sq. ft.",
    capacity: "2 Adults + 2 Children",
    price: 15500,
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "Floor-to-ceiling Glass Windows",
      "Scenic Mountains View Lounge",
      "Custom Antique Brass Bathtub",
      "Earthy Brick Stone Fireplace",
      "Deep Pillowy Soft Bedsheets",
      "French Press Tea & Coffee",
      "Smart Touch Automation",
      "Walk-In Luxury Wardrobe",
      "Custom Curated Bookshelf"
    ],
    status: 'available'
  },
  {
    id: "room-maharaja-family",
    name: "The Maharaja Family Palace",
    description: "An incredibly grand two-bedroom suite featuring a private luxury drawing hall and exclusive customized butler service.",
    longDescription: "Perfect for multi-generation families or friends traveling as a elite circle. The Maharaja Family Palace features two master bedrooms, an expansive indoor private living room, marble floors, hand-carved pillars, and customized personal dining services. Immerse yourself in total privacy with designated paths to the main pool and bar, and unmatched space.",
    size: "950 sq. ft.",
    capacity: "4 Adults + 2 Children",
    price: 21000,
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "Two Premium Master Bedrooms",
      "Large Royal Drawing Room",
      "Dedicated Butler Service Desk",
      "Direct Private Swimming Pool Access",
      "Exquisite Marble Inlay Art",
      "Premium Luggage Dressing Area",
      "Two Luxury En-Suite Washrooms",
      "In-Suite Luxury Dining Table",
      "Royal Welcome Refreshments"
    ],
    status: 'available'
  }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "book-1",
    roomId: "room-royal-suite",
    roomName: "Royal Heritage Suite",
    checkIn: "2026-06-15",
    checkOut: "2026-06-18",
    guestName: "Aditya Vardhan Singh",
    guestEmail: "aditya.singh@royal.in",
    guestPhone: "+91 9876543210",
    guestCount: 2,
    totalPrice: 40500,
    status: "approved",
    paymentStatus: "paid",
    notes: "Celebrating anniversary. Please arrange rose petals and a complimentary champagne bottle.",
    createdAt: "2026-06-05T10:00:00Z"
  },
  {
    id: "book-2",
    roomId: "room-aravalli-view",
    roomName: "Aravalli View Imperial Suite",
    checkIn: "2026-06-10",
    checkOut: "2026-06-12",
    guestName: "Priya Mehra",
    guestEmail: "priya.mehra@gmail.com",
    guestPhone: "+91 9911882233",
    guestCount: 2,
    totalPrice: 31000,
    status: "pending",
    paymentStatus: "unpaid",
    notes: "Requires late check-out on the 12th if possible.",
    createdAt: "2026-06-07T14:30:00Z"
  },
  {
    id: "book-3",
    roomId: "room-desert-rose",
    roomName: "Desert Rose Luxury Room",
    checkIn: "2026-06-14",
    checkOut: "2026-06-16",
    guestName: "Vikram Dev",
    guestEmail: "vikramdev007@hotmail.com",
    guestPhone: "+91 8877665544",
    guestCount: 1,
    totalPrice: 19600,
    status: "approved",
    paymentStatus: "paid",
    notes: "Quiet room needed for focused remote working retreat.",
    createdAt: "2026-06-06T09:15:00Z"
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    authorName: "Ananya Deshmukh",
    authorEmail: "ananya@deshmukh.co",
    rating: 5,
    comment: "An absolute slice of heaven in Jaipur! Mahika Valley Stay offers international luxury standards woven elegantly with Rajput heritage. The pool is immaculate, the private bar experience was bespoke, and the service was warm and unbelievably attentive. Will be recommending this to all our business associates.",
    status: "approved",
    createdAt: "2026-05-20T12:00:00Z"
  },
  {
    id: "rev-2",
    authorName: "Kabir Malhotra",
    authorEmail: "kabir.malhotra@gmail.com",
    rating: 5,
    comment: "This place sets the bar for countryside boutique luxury in India. Stayed at the Royal Heritage Suite with my wife—it felt like a modern palace room. Absolute privacy, gorgeous design, and a highly beautiful starlit bonfire dinner arranged by the chef. Simply spectacular.",
    status: "approved",
    createdAt: "2026-06-01T15:40:00Z"
  },
  {
    id: "rev-3",
    authorName: "Sarah Jenkins",
    authorEmail: "sarahj@london.uk",
    rating: 5,
    comment: "Exceptional architecture, beautiful lush organic gardens, and a magical pool. The Jaipur village tour they organized felt authentic, while return to the luxury of the Aravalli View Suite made it the highlight of my trip to India.",
    status: "approved",
    createdAt: "2026-05-28T18:22:00Z"
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    url: "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=1200&q=80",
    category: "pool",
    title: "Celestial Swimming Pool & Deck",
    type: "image"
  },
  {
    id: "gal-2",
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
    category: "rooms",
    title: "Royal Heritage Bed Archwork",
    type: "image"
  },
  {
    id: "gal-3",
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    category: "hall",
    title: "Chandelier Adorned Premium Event Hall",
    type: "image"
  },
  {
    id: "gal-4",
    url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
    category: "experience",
    title: "Mahika Signature Cocktail Bar Lounging",
    type: "image"
  },
  {
    id: "gal-5",
    url: "https://images.unsplash.com/photo-1526495124232-a04e1849168a?auto=format&fit=crop&w=1200&q=80",
    category: "experience",
    title: "Cozy Star-lit Bonfire Experience",
    type: "image"
  },
  {
    id: "gal-6",
    url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
    category: "night",
    title: "Mahika Valley Golden Hour Glow",
    type: "image"
  }
];

const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    type: "wedding",
    name: "Rajesh Khandelwal",
    email: "rajesh.wedding@outlook.com",
    phone: "+91 9414012345",
    date: "2026-11-20",
    guests: 180,
    message: "Seeking a royal destination venue in Jaipur for my daughter's wedding. We require booking of all rooms for two nights alongside banquet services for 180 guests.",
    status: "pending",
    createdAt: "2026-06-03T11:20:00Z"
  },
  {
    id: "inq-2",
    type: "corporate",
    name: "Meera Nair (Innovate Tech)",
    email: "mnair@innovate.co.in",
    phone: "+91 9123456780",
    date: "2026-08-15",
    guests: 25,
    message: "Corporate retreat inquiry. Planning leadership brainstorming workshop, requires 4 suites shared accommodation, projector, dinner gatherings, and team bonfire setup.",
    status: "responded",
    createdAt: "2026-06-02T16:05:00Z"
  }
];

// Helper read/write database functions
function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file, using defaults:", error);
  }
  
  // Write default state to DB_FILE immediately to act as persistent layer
  const defaultDb = {
    rooms: DEFAULT_ROOMS,
    bookings: DEFAULT_BOOKINGS,
    reviews: DEFAULT_REVIEWS,
    gallery: DEFAULT_GALLERY,
    inquiries: DEFAULT_INQUIRIES
  };
  writeDb(defaultDb);
  return defaultDb;
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(express.json());

  // --- API ROUTES ---

  // 1. Rooms
  app.get('/api/rooms', (req, res) => {
    const db = readDb();
    res.json(db.rooms);
  });

  app.put('/api/rooms/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const roomIdx = db.rooms.findIndex((r: any) => r.id === id);
    if (roomIdx !== -1) {
      db.rooms[roomIdx] = { ...db.rooms[roomIdx], ...req.body };
      writeDb(db);
      res.json({ success: true, room: db.rooms[roomIdx] });
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  });

  // 2. Bookings
  app.get('/api/bookings', (req, res) => {
    const db = readDb();
    res.json(db.bookings);
  });

  app.post('/api/bookings', (req, res) => {
    const db = readDb();
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guestCount, totalPrice, notes } = req.body;
    
    if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: "Missing required fields for booking" });
    }

    // Direct overlapping reservation validation (Realtime availability check!)
    const targetRoomBookings = db.bookings.filter(
      (b: any) => b.roomId === roomId && b.status !== 'rejected'
    );

    const overlap = targetRoomBookings.some((b: any) => {
      const bIn = new Date(b.checkIn).getTime();
      const bOut = new Date(b.checkOut).getTime();
      const tIn = new Date(checkIn).getTime();
      const tOut = new Date(checkOut).getTime();
      return (tIn < bOut) && (tOut > bIn);
    });

    if (overlap) {
      return res.status(400).json({ error: "The targeted room is already booked for these selected dates. Please choose alternate dates or select an elite alternate suite." });
    }

    const matchedRoom = db.rooms.find((r: any) => r.id === roomId);

    const newBooking: Booking = {
      id: `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      roomId,
      roomName: matchedRoom ? matchedRoom.name : "Luxury Suite",
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      guestCount,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
      notes,
      createdAt: new Date().toISOString()
    };

    db.bookings.push(newBooking);
    writeDb(db);
    res.json({ success: true, booking: newBooking });
  });

  app.put('/api/bookings/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const idx = db.bookings.findIndex((b: any) => b.id === id);
    if (idx !== -1) {
      db.bookings[idx] = { ...db.bookings[idx], ...req.body };
      writeDb(db);
      res.json({ success: true, booking: db.bookings[idx] });
    } else {
      res.status(404).json({ error: "Booking record is missing" });
    }
  });

  app.delete('/api/bookings/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const initialLen = db.bookings.length;
    db.bookings = db.bookings.filter((b: any) => b.id !== id);
    if (db.bookings.length < initialLen) {
      writeDb(db);
      res.json({ success: true, message: "Booking removed successfully" });
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  });

  // 3. Reviews
  app.get('/api/reviews', (req, res) => {
    const db = readDb();
    // Return only approved reviews for front-facing reviews display
    const approved = db.reviews.filter((r: any) => r.status === 'approved');
    res.json(approved);
  });

  app.get('/api/admin/reviews', (req, res) => {
    const db = readDb();
    res.json(db.reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const db = readDb();
    const { authorName, authorEmail, rating, comment } = req.body;
    if (!authorName || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      authorName,
      authorEmail: authorEmail || "",
      rating: Number(rating),
      comment,
      status: 'pending', // Pending admin approval
      createdAt: new Date().toISOString()
    };

    db.reviews.push(newReview);
    writeDb(db);
    res.json({ success: true, review: newReview });
  });

  app.put('/api/reviews/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const idx = db.reviews.findIndex((r: any) => r.id === id);
    if (idx !== -1) {
      db.reviews[idx] = { ...db.reviews[idx], ...req.body };
      writeDb(db);
      res.json({ success: true, review: db.reviews[idx] });
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  });

  app.delete('/api/reviews/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const initialLen = db.reviews.length;
    db.reviews = db.reviews.filter((r: any) => r.id !== id);
    if (db.reviews.length < initialLen) {
      writeDb(db);
      res.json({ success: true, message: "Review deleted successfully" });
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  });

  // 4. Gallery Items
  app.get('/api/gallery', (req, res) => {
    const db = readDb();
    res.json(db.gallery);
  });

  app.post('/api/gallery', (req, res) => {
    const db = readDb();
    const { url, category, title, type } = req.body;
    if (!url || !category || !title) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      url,
      category,
      title,
      type: type || 'image'
    };

    db.gallery.push(newItem);
    writeDb(db);
    res.json({ success: true, item: newItem });
  });

  app.delete('/api/gallery/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const initialLen = db.gallery.length;
    db.gallery = db.gallery.filter((g: any) => g.id !== id);
    if (db.gallery.length < initialLen) {
      writeDb(db);
      res.json({ success: true, message: "Gallery media removed" });
    } else {
      res.status(404).json({ error: "Gallery item not found" });
    }
  });

  // 5. Inquiries (Events)
  app.get('/api/inquiries', (req, res) => {
    const db = readDb();
    res.json(db.inquiries);
  });

  app.post('/api/inquiries', (req, res) => {
    const db = readDb();
    const { type, name, email, phone, date, guests, message } = req.body;
    if (!type || !name || !email || !phone || !date || !guests) {
      return res.status(400).json({ error: "Please enter all required banquet fields" });
    }

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      type,
      name,
      email,
      phone,
      date,
      guests: Number(guests),
      message: message || "",
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.inquiries.push(newInquiry);
    writeDb(db);
    res.json({ success: true, inquiry: newInquiry });
  });

  app.put('/api/inquiries/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const idx = db.inquiries.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      db.inquiries[idx] = { ...db.inquiries[idx], ...req.body };
      writeDb(db);
      res.json({ success: true, inquiry: db.inquiries[idx] });
    } else {
      res.status(404).json({ error: "Inquiry not found" });
    }
  });

  // 6. Admin Stats Dashboard Aggregation API
  app.get('/api/admin/stats', (req, res) => {
    const db = readDb();
    const totalBookings = db.bookings.length;
    const pendingBookings = db.bookings.filter((b: any) => b.status === 'pending').length;
    const approvedBookings = db.bookings.filter((b: any) => b.status === 'approved');
    
    const totalRevenue = approvedBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);
    
    // Average occupancy rate: (number of booked days / days)
    // Simply calculated as (approved bookings / rooms total count) * 100 for simulated showcase
    const occupancyRate = totalBookings > 0 
      ? Math.round((approvedBookings.length / (db.rooms.length || 4)) * 100)
      : 35;

    const totalReviews = db.reviews.length;
    const pendingReviews = db.reviews.filter((r: any) => r.status === 'pending').length;
    const totalInquiries = db.inquiries.length;

    res.json({
      totalBookings,
      pendingBookings,
      totalRevenue,
      occupancyRate: occupancyRate > 100 ? 100 : occupancyRate,
      totalReviews,
      pendingReviews,
      totalInquiries
    });
  });

  // 7. Admin Secure Validation (Simulation)
  app.post('/api/admin/auth', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'royalmahika') {
      res.json({ success: true, token: "mahika-royal-jwt-token-access" });
    } else {
      res.status(401).json({ error: "Invalid credential entries. Access denied." });
    }
  });

  // Load database seeds on start
  readDb();

  // Integrated Vite Middleware for smooth development & SPA handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mahika Valley Stay server is live on http://localhost:${PORT}`);
  });
}

startServer();
