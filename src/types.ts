export interface Room {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  size: string; // e.g. "450 sq. ft."
  capacity: string; // e.g. "2 Adults + 1 Child"
  price: number; // in INR
  images: string[];
  amenities: string[];
  status: 'available' | 'maintenance';
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
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

export interface Review {
  id: string;
  authorName: string;
  authorEmail: string;
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: 'rooms' | 'pool' | 'hall' | 'night' | 'garden' | 'experience';
  title: string;
  type: 'image' | 'video';
}

export interface Inquiry {
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

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  occupancyRate: number; // %
  totalReviews: number;
  pendingReviews: number;
  totalInquiries: number;
}
