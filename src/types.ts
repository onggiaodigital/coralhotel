export interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite' | 'Family';
  price: number; // in VND
  status: 'Available' | 'Booked' | 'Cleaning' | 'Maintenance';
  floor: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Food' | 'Drinks' | 'Spa' | 'Laundry' | 'Transport';
  price: number;
  unit: string;
}

export interface ServiceOrder {
  id: string;
  bookingId: string;
  serviceId: string;
  quantity: number;
  orderDate: string;
  totalPrice: number;
  status: 'Served' | 'Paid';
}

export interface LoyaltyCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  identity: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinedDate: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomNumber: string; // denormalized for convenience
  customerName: string;
  customerPhone: string;
  customerIdentity: string;
  customerEmail?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  actualCheckIn?: string; // YYYY-MM-DD HH:MM
  actualCheckOut?: string; // YYYY-MM-DD HH:MM
  status: 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';
  totalPrice: number; // dynamic or static
  discountAmount?: number;
  loyaltyCustomerId?: string; // Optional link to loyalty profile
}
