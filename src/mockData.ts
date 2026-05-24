import { Room, ServiceItem, LoyaltyCustomer, Booking, ServiceOrder } from './types';

export const INITIAL_ROOMS: Room[] = [
  // Floor 1
  { id: '101', number: '101', type: 'Single', price: 350000, status: 'Available', floor: 1 },
  { id: '102', number: '102', type: 'Single', price: 350000, status: 'Booked', floor: 1 },
  { id: '103', number: '103', type: 'Double', price: 550000, status: 'Available', floor: 1 },
  { id: '104', number: '104', type: 'Double', price: 550000, status: 'Cleaning', floor: 1 },
  { id: '105', number: '105', type: 'Family', price: 900000, status: 'Maintenance', floor: 1 },
  
  // Floor 2
  { id: '201', number: '201', type: 'Single', price: 380000, status: 'Available', floor: 2 },
  { id: '202', number: '202', type: 'Double', price: 580000, status: 'Booked', floor: 2 },
  { id: '203', number: '203', type: 'Double', price: 580000, status: 'Available', floor: 2 },
  { id: '204', number: '204', type: 'Suite', price: 1500000, status: 'Booked', floor: 2 },
  { id: '205', number: '205', type: 'Family', price: 950000, status: 'Available', floor: 2 },

  // Floor 3
  { id: '301', number: '301', type: 'Double', price: 600000, status: 'Available', floor: 3 },
  { id: '302', number: '302', type: 'Double', price: 600000, status: 'Cleaning', floor: 3 },
  { id: '303', number: '303', type: 'Suite', price: 1600000, status: 'Available', floor: 3 },
  { id: '304', number: '304', type: 'Suite', price: 1600000, status: 'Booked', floor: 3 },
  { id: '305', number: '305', type: 'Family', price: 1000000, status: 'Available', floor: 3 }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  // Food & Drinks
  { id: 'S01', name: 'Phở bò Hà Nội', category: 'Food', price: 65000, unit: 'Tô' },
  { id: 'S02', name: 'Cơm rang hải sản', category: 'Food', price: 75000, unit: 'Đĩa' },
  { id: 'S03', name: 'Cà phê nâu đá', category: 'Drinks', price: 29000, unit: 'Ly' },
  { id: 'S04', name: 'Nước dừa tươi', category: 'Drinks', price: 35000, unit: 'Trái' },
  
  // Spa
  { id: 'S05', name: 'Massage body thảo dược (60p)', category: 'Spa', price: 350000, unit: 'Voucher' },
  { id: 'S06', name: 'Xông hơi đá muối Himalaya', category: 'Spa', price: 150000, unit: 'Lượt' },

  // Laundry
  { id: 'S07', name: 'Giặt sấy lấy nhanh', category: 'Laundry', price: 30000, unit: 'Kg' },
  { id: 'S08', name: 'Ủi hơi cao cấp', category: 'Laundry', price: 15000, unit: 'Bộ' },

  // Transport
  { id: 'S09', name: 'Thuê xe máy Honda Vision', category: 'Transport', price: 150000, unit: 'Ngày' },
  { id: 'S10', name: 'Xe đưa đón sảnh Sân bay', category: 'Transport', price: 250000, unit: 'Lượt' }
];

export const INITIAL_LOYALTY_CUSTOMERS: LoyaltyCustomer[] = [
  { id: 'LC01', name: 'Nguyễn Văn Hải', phone: '0901234567', email: 'hai.nguyen@gmail.com', identity: '241589412', points: 150, tier: 'Silver', joinedDate: '2025-01-15' },
  { id: 'LC02', name: 'Trần Thị Thu Trang', phone: '0912345678', email: 'trang.tt@yahoo.com', identity: '001092003441', points: 420, tier: 'Gold', joinedDate: '2025-02-10' },
  { id: 'LC03', name: 'Phạm Minh Đức', phone: '0987654321', email: 'duc.pham99@outlook.com', identity: '038099042312', points: 850, tier: 'Platinum', joinedDate: '2024-11-01' },
  { id: 'LC04', name: 'Lê Hoàng Nam', phone: '0934567890', email: 'nam.lehoang@gmail.com', identity: '184905102', points: 30, tier: 'Bronze', joinedDate: '2026-03-20' },
  { id: 'LC05', name: 'Vũ Thùy Linh', phone: '0977889901', email: 'linh.vu@gmail.com', identity: '001095034567', points: 210, tier: 'Silver', joinedDate: '2025-08-11' }
];

export const INITIAL_BOOKINGS: Booking[] = [
  // Checked In Booking (Active)
  {
    id: 'B26052001',
    roomId: '102',
    roomNumber: '102',
    customerName: 'Nguyễn Văn Hải',
    customerPhone: '0901234567',
    customerIdentity: '241589412',
    customerEmail: 'hai.nguyen@gmail.com',
    checkInDate: '2026-05-20',
    checkOutDate: '2026-05-23',
    actualCheckIn: '2026-05-20 14:15',
    status: 'CheckedIn',
    totalPrice: 1050000,
    loyaltyCustomerId: 'LC01'
  },
  {
    id: 'B26052101',
    roomId: '202',
    roomNumber: '202',
    customerName: 'Trần Thị Thu Trang',
    customerPhone: '0912345678',
    customerIdentity: '001092003441',
    customerEmail: 'trang.tt@yahoo.com',
    checkInDate: '2026-05-21',
    checkOutDate: '2026-05-25',
    actualCheckIn: '2026-05-21 12:30',
    status: 'CheckedIn',
    totalPrice: 2320000,
    loyaltyCustomerId: 'LC02'
  },
  {
    id: 'B26052102',
    roomId: '204',
    roomNumber: '204',
    customerName: 'Phạm Minh Đức',
    customerPhone: '0987654321',
    customerIdentity: '038099042312',
    customerEmail: 'duc.pham99@outlook.com',
    checkInDate: '2026-05-21',
    checkOutDate: '2026-05-24',
    actualCheckIn: '2026-05-21 13:00',
    status: 'CheckedIn',
    totalPrice: 4500000,
    loyaltyCustomerId: 'LC03'
  },
  
  // Confirmed booking for future
  {
    id: 'B26052501',
    roomId: '304',
    roomNumber: '304',
    customerName: 'Vũ Thùy Linh',
    customerPhone: '0977889901',
    customerIdentity: '001095034567',
    customerEmail: 'linh.vu@gmail.com',
    checkInDate: '2026-05-25',
    checkOutDate: '2026-05-28',
    status: 'Confirmed',
    totalPrice: 4800000,
    loyaltyCustomerId: 'LC05'
  },
  // Checked Out Past Bookings (for Revenue statistics)
  {
    id: 'B26051501',
    roomId: '101',
    roomNumber: '101',
    customerName: 'Trần Văn Hoàng',
    customerPhone: '0922334455',
    customerIdentity: '197412584',
    customerEmail: 'hoang.tran@gmail.com',
    checkInDate: '2026-05-15',
    checkOutDate: '2026-05-17',
    actualCheckIn: '2026-05-15 14:02',
    actualCheckOut: '2026-05-17 11:50',
    status: 'CheckedOut',
    totalPrice: 700000,
  },
  {
    id: 'B26051601',
    roomId: '205',
    roomNumber: '205',
    customerName: 'Lê Hoàng Nam',
    customerPhone: '0934567890',
    customerIdentity: '184905102',
    customerEmail: 'nam.lehoang@gmail.com',
    checkInDate: '2026-05-16',
    checkOutDate: '2026-05-20',
    actualCheckIn: '2026-05-16 15:30',
    actualCheckOut: '2026-05-20 11:30',
    status: 'CheckedOut',
    totalPrice: 3800000,
    loyaltyCustomerId: 'LC04'
  },
  {
    id: 'B26051801',
    roomId: '303',
    roomNumber: '303',
    customerName: 'Hoàng Kim Chi',
    customerPhone: '0944556677',
    customerIdentity: '081231456',
    checkInDate: '2026-05-18',
    checkOutDate: '2026-05-20',
    actualCheckIn: '2026-05-18 14:00',
    actualCheckOut: '2026-05-20 12:00',
    status: 'CheckedOut',
    totalPrice: 3200000,
  },
  {
    id: 'B26051901',
    roomId: '103',
    roomNumber: '103',
    customerName: 'Phan Tuấn Anh',
    customerPhone: '0966554433',
    customerIdentity: '272183294',
    checkInDate: '2026-05-19',
    checkOutDate: '2026-05-21',
    actualCheckIn: '2026-05-19 14:05',
    actualCheckOut: '2026-05-21 11:45',
    status: 'CheckedOut',
    totalPrice: 1100000,
  }
];

export const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [
  // Linked to Active Booking B26052001
  {
    id: 'SO001',
    bookingId: 'B26052001',
    serviceId: 'S01', // Pho Bo
    quantity: 2,
    orderDate: '2026-05-20',
    totalPrice: 130000,
    status: 'Served'
  },
  {
    id: 'SO002',
    bookingId: 'B26052001',
    serviceId: 'S03', // Ca phe
    quantity: 2,
    orderDate: '2026-05-20',
    totalPrice: 58000,
    status: 'Served'
  },

  // Linked to Active Booking B26052101
  {
    id: 'SO003',
    bookingId: 'B26052101',
    serviceId: 'S05', // Massage Body
    quantity: 1,
    orderDate: '2026-05-21',
    totalPrice: 350000,
    status: 'Served'
  },
  {
    id: 'SO004',
    bookingId: 'B26052101',
    serviceId: 'S04', // Nuoc Dua
    quantity: 3,
    orderDate: '2026-05-21',
    totalPrice: 105000,
    status: 'Served'
  },

  // Linked to Checked Out Bookings (For service revenue statistics)
  {
    id: 'SO005',
    bookingId: 'B26051601',
    serviceId: 'S09', // Thuê xe máy
    quantity: 4,
    orderDate: '2026-05-16',
    totalPrice: 600000,
    status: 'Paid'
  },
  {
    id: 'SO006',
    bookingId: 'B26051801',
    serviceId: 'S05', // Massage
    quantity: 2,
    orderDate: '2026-05-18',
    totalPrice: 700000,
    status: 'Paid'
  },
  {
    id: 'SO007',
    bookingId: 'B26051801',
    serviceId: 'S06', // Xông hơi
    quantity: 2,
    orderDate: '2026-05-18',
    totalPrice: 300000,
    status: 'Paid'
  },
  {
    id: 'SO008',
    bookingId: 'B26051901',
    serviceId: 'S02', // Cơm rang
    quantity: 1,
    orderDate: '2026-05-20',
    totalPrice: 75000,
    status: 'Paid'
  }
];

export const TIER_BENEFITS = {
  Bronze: { discount: 0, requiredPoints: 0 },
  Silver: { discount: 5, requiredPoints: 100 },
  Gold: { discount: 10, requiredPoints: 300 },
  Platinum: { discount: 15, requiredPoints: 800 }
};

export function getTierFromPoints(points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
  if (points >= TIER_BENEFITS.Platinum.requiredPoints) return 'Platinum';
  if (points >= TIER_BENEFITS.Gold.requiredPoints) return 'Gold';
  if (points >= TIER_BENEFITS.Silver.requiredPoints) return 'Silver';
  return 'Bronze';
}
