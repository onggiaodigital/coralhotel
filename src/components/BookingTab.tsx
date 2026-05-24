import React, { useState, useEffect } from 'react';
import { Booking, Room, LoyaltyCustomer, ServiceItem, ServiceOrder } from '../types';
import { formatVND, formatDate, calculateNights, generateId } from '../utils';
import { 
  Plus, Calendar, Phone, CreditCard, User, Mail, DollarSign, Tag,
  ShoppingBag, CheckCircle, ArrowRight, XCircle, Search, Info, Clock, Notebook, Trash2, ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingTabProps {
  bookings: Booking[];
  rooms: Room[];
  loyaltyCustomers: LoyaltyCustomer[];
  services: ServiceItem[];
  serviceOrders: ServiceOrder[];
  onAddBooking: (booking: Booking, shouldUpdateRoom?: boolean) => void;
  onUpdateBooking: (booking: Booking) => void;
  onAddServiceOrder: (order: ServiceOrder) => void;
  onDeleteServiceOrder: (orderId: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string, finalPrice: number, earnedPoints: number) => void;
  onCancelBooking: (bookingId: string) => void;
}

export default function BookingTab({
  bookings,
  rooms,
  loyaltyCustomers,
  services,
  serviceOrders,
  onAddBooking,
  onUpdateBooking,
  onAddServiceOrder,
  onDeleteServiceOrder,
  onCheckIn,
  onCheckOut,
  onCancelBooking
}: BookingTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isServiceOrderModalOpen, setIsServiceOrderModalOpen] = useState(false);
  
  // Target objects
  const [selectedBookingForCheckout, setSelectedBookingForCheckout] = useState<Booking | null>(null);
  const [selectedBookingForService, setSelectedBookingForService] = useState<Booking | null>(null);

  // New Booking State
  const [bookRoomId, setBookRoomId] = useState('');
  const [bookCustName, setBookCustName] = useState('');
  const [bookCustPhone, setBookCustPhone] = useState('');
  const [bookCustIdentity, setBookCustIdentity] = useState('');
  const [bookCustEmail, setBookCustEmail] = useState('');
  const [bookCheckIn, setBookCheckIn] = useState('');
  const [bookCheckOut, setBookCheckOut] = useState('');
  const [bookLoyaltyCustId, setBookLoyaltyCustId] = useState('');
  const [autoCheckInImmediately, setAutoCheckInImmediately] = useState(true);

  // New Service Order State
  const [orderServiceId, setOrderServiceId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [serviceOrderTab, setServiceOrderTab] = useState<'order' | 'list'>('order');

  // Load defaults when modal opens
  const availableRooms = rooms.filter(r => r.status === 'Available');

  // Trigger effect when Room select changes or dates change to calculate prices
  const selectedRoomDetails = rooms.find(r => r.id === bookRoomId);
  const selectedLoyaltyCust = loyaltyCustomers.find(c => c.id === bookLoyaltyCustId);
  
  // Get loyal customer tier discount
  const getDiscountPercent = (tier?: string) => {
    if (!tier) return 0;
    if (tier === 'Silver') return 5;
    if (tier === 'Gold') return 10;
    if (tier === 'Platinum') return 15;
    return 0;
  };

  const currentDiscountPercent = getDiscountPercent(selectedLoyaltyCust?.tier);
  const calculatedNights = bookCheckIn && bookCheckOut ? calculateNights(bookCheckIn, bookCheckOut) : 1;
  const rawTotalPrice = selectedRoomDetails ? selectedRoomDetails.price * calculatedNights : 0;
  const discountAmount = Math.round(rawTotalPrice * (currentDiscountPercent / 100));
  const finalComputedPrice = rawTotalPrice - discountAmount;

  // Sync loyalty client fields if user selects a pre-existing loyalty customer
  useEffect(() => {
    if (selectedLoyaltyCust) {
      setBookCustName(selectedLoyaltyCust.name);
      setBookCustPhone(selectedLoyaltyCust.phone);
      setBookCustIdentity(selectedLoyaltyCust.identity);
      setBookCustEmail(selectedLoyaltyCust.email);
    }
  }, [bookLoyaltyCustId]);

  // Handle Book Form Submit
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookRoomId || !bookCustName || !bookCheckIn || !bookCheckOut) {
      alert('Vui lòng điền đầy đủ thông tin đặt phòng bắt buộc!');
      return;
    }

    const roomObj = rooms.find(r => r.id === bookRoomId);
    if (!roomObj) return;

    const bId = generateId('B');
    const newBooking: Booking = {
      id: bId,
      roomId: bookRoomId,
      roomNumber: roomObj.number,
      customerName: bookCustName,
      customerPhone: bookCustPhone,
      customerIdentity: bookCustIdentity,
      customerEmail: bookCustEmail || undefined,
      checkInDate: bookCheckIn,
      checkOutDate: bookCheckOut,
      status: autoCheckInImmediately ? 'CheckedIn' : 'Confirmed',
      totalPrice: finalComputedPrice,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      loyaltyCustomerId: bookLoyaltyCustId || undefined,
      actualCheckIn: autoCheckInImmediately ? `${bookCheckIn} 12:00` : undefined
    };

    onAddBooking(newBooking, true); // true updates room state
    setIsBookModalOpen(false);

    // Reset fields
    setBookRoomId('');
    setBookCustName('');
    setBookCustPhone('');
    setBookCustIdentity('');
    setBookCustEmail('');
    setBookCheckIn('');
    setBookCheckOut('');
    setBookLoyaltyCustId('');
  };

  // Helper to open Quick Book from outside
  useEffect(() => {
    // If we have some specific fast booking action triggered
  }, []);

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.customerPhone.includes(searchTerm) || 
                          b.roomNumber.includes(searchTerm) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Services associated with a booking
  const getServiceOrdersForBooking = (bookingId: string) => {
    return serviceOrders.filter(so => so.bookingId === bookingId);
  };

  const handleOpenCheckoutModal = (booking: Booking) => {
    setSelectedBookingForCheckout(booking);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (!selectedBookingForCheckout) return;

    const activeOrders = getServiceOrdersForBooking(selectedBookingForCheckout.id);
    const serviceSubtotal = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const roomCharge = selectedBookingForCheckout.totalPrice; // already loyalty discounted
    const finalBill = roomCharge + serviceSubtotal;

    // Loyalty points system: 1 point earned per 100,000 VND spent (total bill)
    // Rounded to the nearest whole integer
    const earnedPoints = Math.floor(finalBill / 100000);

    onCheckOut(selectedBookingForCheckout.id, finalBill, earnedPoints);
    setIsCheckoutModalOpen(false);
    setSelectedBookingForCheckout(null);
  };

  const handleAddServiceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForService || !orderServiceId || orderQuantity < 1) return;

    const serv = services.find(s => s.id === orderServiceId);
    if (!serv) return;

    const newOrder: ServiceOrder = {
      id: generateId('SO'),
      bookingId: selectedBookingForService.id,
      serviceId: orderServiceId,
      quantity: Number(orderQuantity),
      orderDate: new Date().toISOString().split('T')[0],
      totalPrice: serv.price * orderQuantity,
      status: 'Served'
    };

    onAddServiceOrder(newOrder);
    setOrderServiceId('');
    setOrderQuantity(1);
    // Switch to order list so the user can verify immediately
    setServiceOrderTab('list');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên khách, số điện thoại, số phòng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-gray-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl text-sm font-semibold text-gray-600">
            {['All', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'].map((stat) => (
              <button
                key={stat}
                onClick={() => setFilterStatus(stat)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === stat 
                    ? 'bg-white text-red-600 shadow-2xs font-bold' 
                    : 'hover:text-gray-900'
                }`}
              >
                {stat === 'All' && 'Tất cả'}
                {stat === 'Confirmed' && 'Chờ nhận phòng'}
                {stat === 'CheckedIn' && 'Đang lưu trú'}
                {stat === 'CheckedOut' && 'Đã thanh toán'}
                {stat === 'Cancelled' && 'Đã hủy'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            // Pick first available room if none selected
            if (availableRooms.length > 0) {
              setBookRoomId(availableRooms[0].id);
            }
            // Default dates (today and tomorrow)
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            setBookCheckIn(today);
            setBookCheckOut(tomorrow);
            setIsBookModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Đặt phòng mới
        </button>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-5">Mã Đặt / Phòng</th>
                <th className="py-4 px-5">Khách hàng</th>
                <th className="py-4 px-5">Thời gian lưu trú</th>
                <th className="py-4 px-5">Phí tạm tính</th>
                <th className="py-4 px-5 text-center">Trạng thái</th>
                <th className="py-4 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredBookings.map((b) => {
                const isLoyalty = !!b.loyaltyCustomerId;
                const activeOrders = getServiceOrdersForBooking(b.id);
                const serviceTotal = activeOrders.reduce((sum, so) => sum + so.totalPrice, 0);

                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* ID & Room */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-gray-900 font-mono text-sm uppercase">{b.id}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="p-1 px-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-md font-display">
                          Phòng {b.roomNumber}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-5">
                      <div className="font-medium text-gray-800 flex items-center gap-1.5">
                        {b.customerName}
                        {isLoyalty && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 rounded-sm uppercase">VIP</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs space-y-0.5 mt-1 font-mono">
                        <div>SĐT: {b.customerPhone}</div>
                        <div>CCCD/Passport: {b.customerIdentity}</div>
                      </div>
                    </td>

                    {/* Lease Dates */}
                    <td className="py-4 px-5">
                      <div className="text-gray-800 font-medium">
                        {formatDate(b.checkInDate)} <span className="text-gray-400 mx-1">→</span> {formatDate(b.checkOutDate)}
                      </div>
                      <div className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {calculateNights(b.checkInDate, b.checkOutDate)} đêm
                      </div>
                    </td>

                    {/* Dynamic bills info */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-gray-900 font-mono">{formatVND(b.totalPrice)}</div>
                      {serviceTotal > 0 && (
                        <div className="text-xs text-blue-600 font-semibold mt-0.5">
                          + {formatVND(serviceTotal)} dịch vụ
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'Confirmed' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        b.status === 'CheckedIn' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.status === 'CheckedOut' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          b.status === 'Confirmed' ? 'bg-amber-500' :
                          b.status === 'CheckedIn' ? 'bg-emerald-500' :
                          b.status === 'CheckedOut' ? 'bg-gray-400' :
                          'bg-red-500'
                        }`} />
                        {b.status === 'Confirmed' && 'Chờ nhận phòng'}
                        {b.status === 'CheckedIn' && 'Đang lưu trú'}
                        {b.status === 'CheckedOut' && 'Đã thanh toán (Trả phòng)'}
                        {b.status === 'Cancelled' && 'Đã hủy'}
                      </span>
                    </td>

                    {/* Active Booking Controls */}
                    <td className="py-4 px-5 text-right space-x-1.5">
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => onCheckIn(b.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Nhận phòng
                        </button>
                      )}

                      {b.status === 'CheckedIn' && (
                        <>
                          {/* Order supplemental services */}
                          <button
                            onClick={() => {
                              setSelectedBookingForService(b);
                              setServiceOrderTab('order');
                              setIsServiceOrderModalOpen(true);
                            }}
                            className="px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-red-500" />
                            Gọi dịch vụ (+{activeOrders.length})
                          </button>

                          {/* Quick Checkout */}
                          <button
                            onClick={() => handleOpenCheckoutModal(b)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            Thanh toán
                          </button>
                        </>
                      )}

                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có đồng ý hủy đặt phòng này chứ?')) {
                              onCancelBooking(b.id);
                            }
                          }}
                          className="p-1 px-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Hủy đặt"
                        >
                          X
                        </button>
                      )}

                      {b.status === 'CheckedOut' && (
                        <button
                          onClick={() => handleOpenCheckoutModal(b)}
                          className="px-2 py-1 border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Notebook className="w-3.5 h-3.5 text-red-500" />
                          Bản sao hóa đơn
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Không có bản ghi đặt phòng nào được tìm thấy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Room Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full overflow-hidden my-8"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-900">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-base font-display">Tạo phiếu đặt phòng mới</span>
                </div>
                <button 
                  onClick={() => setIsBookModalOpen(false)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                
                {/* Check Loyalty Member Link */}
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">
                    Quét khách hàng thân thiết (Nếu có)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-500"
                    value={bookLoyaltyCustId}
                    onChange={(e) => setBookLoyaltyCustId(e.target.value)}
                  >
                    <option value="">-- Chọn khách hàng thành viên để giảm giá --</option>
                    {loyaltyCustomers.map(lc => (
                      <option key={lc.id} value={lc.id}>
                        {lc.name} - {lc.phone} ({lc.tier} / Giảm {getDiscountPercent(lc.tier)}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Main room select */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Chọn phòng trống <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                      value={bookRoomId}
                      onChange={(e) => setBookRoomId(e.target.value)}
                    >
                      <option value="">-- Chọn phòng --</option>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id} disabled={r.status !== 'Available'}>
                          P.{r.number} ({r.type === 'Single' ? 'Đơn' : r.type === 'Double' ? 'Đôi' : r.type === 'Family' ? 'Gia đình' : 'VIP'}) 
                          - {formatVND(r.price)}/đêm {r.status !== 'Available' ? `[Bận: ${r.status}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phân loại nhận phòng</label>
                    <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded-md accent-red-600"
                          checked={autoCheckInImmediately}
                          onChange={(e) => setAutoCheckInImmediately(e.target.checked)}
                        />
                        Nhận phòng ngay lập tức (Check-In)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin khách hàng</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Họ và tên khách <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                          value={bookCustName}
                          onChange={(e) => setBookCustName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        <input
                          type="tel"
                          required
                          placeholder="0901234567"
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                          value={bookCustPhone}
                          onChange={(e) => setBookCustPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Số CCCD / Hộ chiếu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        <input
                          type="text"
                          required
                          placeholder="00109xxxxxxxx"
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                          value={bookCustIdentity}
                          onChange={(e) => setBookCustIdentity(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        <input
                          type="email"
                          placeholder="tenkhach@gmail.com"
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                          value={bookCustEmail}
                          onChange={(e) => setBookCustEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Schedule Dates */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thời gian đặt phòng</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ngày nhận phòng</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm font-mono"
                        value={bookCheckIn}
                        onChange={(e) => setBookCheckIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ngày trả phòng</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm font-mono"
                        value={bookCheckOut}
                        min={bookCheckIn || undefined}
                        onChange={(e) => setBookCheckOut(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bill Summary Preview inside Book Modal */}
                {selectedRoomDetails && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Đơn giá phòng:</span>
                      <span className="font-mono">{formatVND(selectedRoomDetails.price)} / đêm</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Số lượng ngày đêm lưu trú:</span>
                      <span className="font-semibold text-gray-900">{calculatedNights} đêm</span>
                    </div>

                    {currentDiscountPercent > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Mức ưu đãi thành viên VIP ({selectedLoyaltyCust?.tier}):</span>
                        <span>Giảm {currentDiscountPercent}% (-{formatVND(discountAmount)})</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-gray-900">
                      <span className="font-semibold">Phí phòng dự tính:</span>
                      <span className="text-lg font-bold text-red-600 font-mono">{formatVND(finalComputedPrice)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    {autoCheckInImmediately ? 'Nhận phòng trực tiếp' : 'Xác nhận đặt phòng'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Extra Services modal for Active stays */}
      <AnimatePresence>
        {isServiceOrderModalOpen && selectedBookingForService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-red-900 text-base font-display block">Dịch vụ bổ sung cho phòng {selectedBookingForService.roomNumber}</span>
                  <span className="text-xs text-gray-50s text-red-700 font-mono uppercase font-semibold">Khách: {selectedBookingForService.customerName}</span>
                </div>
                <button 
                  onClick={() => setIsServiceOrderModalOpen(false)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Tabs within service order */}
              <div className="flex border-b border-gray-100 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setServiceOrderTab('order')}
                  className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${serviceOrderTab === 'order' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                  Gọi món & Đặt dịch vụ
                </button>
                <button
                  type="button"
                  onClick={() => setServiceOrderTab('list')}
                  className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${serviceOrderTab === 'list' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                  Dịch vụ đã Order ({getServiceOrdersForBooking(selectedBookingForService.id).length})
                </button>
              </div>

              <div className="p-6">
                {serviceOrderTab === 'order' ? (
                  <form onSubmit={handleAddServiceOrderSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Chọn Menu dịch vụ</label>
                      <select
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                        value={orderServiceId}
                        onChange={(e) => setOrderServiceId(e.target.value)}
                      >
                        <option value="">-- Chọn dịch vụ bổ sung --</option>
                        {/* Categorize in groups */}
                        {['Food', 'Drinks', 'Spa', 'Laundry', 'Transport'].map(cat => {
                          const items = services.filter(s => s.category === cat);
                          if (items.length === 0) return null;
                          return (
                            <optgroup key={cat} label={cat === 'Food' ? '🍔 Đồ ăn' : cat === 'Drinks' ? '🍹 Đồ uống' : cat === 'Spa' ? '💆 Spa & Beauty' : cat === 'Laundry' ? '🧺 Giặt là' : '🚗 Vận tải xe cộ'}>
                              {items.map(i => (
                                <option key={i.id} value={i.id}>
                                  {i.name} ({formatVND(i.price)}/{i.unit})
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Số lượng</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={100}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-mono text-sm"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Number(e.target.value))}
                      />
                    </div>

                    {orderServiceId && (
                      <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100 flex justify-between items-center text-sm font-semibold">
                        <span className="text-gray-600">Thành tiền dịch vụ:</span>
                        <span className="text-red-600 text-lg font-bold font-mono">
                          {formatVND((services.find(s => s.id === orderServiceId)?.price || 0) * orderQuantity)}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => setIsServiceOrderModalOpen(false)}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
                      >
                        Yêu cầu phục vụ
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-[250px] overflow-y-auto border border-gray-150 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold uppercase">
                            <th className="p-3.5">Dịch vụ</th>
                            <th className="p-3.5 text-center">SL</th>
                            <th className="p-3.5 text-right">Tổng tiền</th>
                            <th className="p-3.5 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {getServiceOrdersForBooking(selectedBookingForService.id).map(o => {
                            const originalItem = services.find(s => s.id === o.serviceId);
                            return (
                              <tr key={o.id} className="hover:bg-gray-50">
                                <td className="p-3.5">
                                  <div className="font-bold text-gray-900">{originalItem?.name || 'Dịch vụ đã sửa'}</div>
                                  <div className="text-[10px] text-gray-400 font-semibold">{originalItem?.category}</div>
                                </td>
                                <td className="p-3.5 text-center font-mono">{o.quantity}</td>
                                <td className="p-3.5 text-right font-mono text-gray-900">{formatVND(o.totalPrice)}</td>
                                <td className="p-3.5 text-center">
                                  <button
                                    onClick={() => onDeleteServiceOrder(o.id)}
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                          {getServiceOrdersForBooking(selectedBookingForService.id).length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400 font-semibold">
                                Chưa lưu thông tin dịch vụ bổ sung nào.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-gray-50 p-4.5 rounded-xl border border-gray-150 flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-600">Tổng doanh thu phụ phí dịch vụ:</span>
                      <span className="font-mono text-lg font-bold text-red-600">
                        {formatVND(getServiceOrdersForBooking(selectedBookingForService.id).reduce((sum, so) => sum + so.totalPrice, 0))}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsServiceOrderModalOpen(false)}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Hoàn thành xem xét
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Bills & Invoice Receipt Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && selectedBookingForCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-gray-150 shadow-2xl max-w-lg w-full overflow-hidden my-8"
            >
              {/* Receipt Header Style */}
              <div className="bg-red-600 p-6 text-white text-center relative">
                {/* Decorative cutouts */}
                <span className="text-sm font-semibold uppercase tracking-widest block opacity-75">HÓA ĐƠN THANH TOÁN CHÍNH THỨC</span>
                <h3 className="text-3xl font-bold font-display tracking-tight mt-1">Coral Hotel</h3>
                <div className="text-xs font-mono mt-1 opacity-90">ID: {selectedBookingForCheckout.id}</div>
                <div className="absolute -bottom-3 left-0 right-0 h-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 3% 0%, 6% 100%, 9% 0%, 12% 100%, 15% 0%, 18% 100%, 21% 0%, 24% 100%, 27% 0%, 30% 100%, 33% 0%, 36% 100%, 39% 0%, 42% 100%, 45% 0%, 48% 100%, 51% 0%, 54% 100%, 57% 0%, 60% 100%, 63% 0%, 66% 100%, 69% 0%, 72% 100%, 75% 0%, 78% 100%, 81% 0%, 84% 100%, 87% 0%, 90% 100%, 93% 0%, 96% 100%, 99%  0%, 100% 100%)' }} />
              </div>

              <div className="p-6 pt-10 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-gray-700">
                {/* Customer Details info block */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-3 border-b border-gray-100">
                  <div>
                    <span className="text-gray-400 text-xs font-bold block uppercase">Họ và tên khách</span>
                    <span className="font-bold text-gray-900">{selectedBookingForCheckout.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs font-bold block uppercase">Số phòng lưu trú</span>
                    <span className="font-bold text-red-600">Phòng {selectedBookingForCheckout.roomNumber}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-400 text-xs font-bold block uppercase">Số điện thoại</span>
                    <span className="font-medium">{selectedBookingForCheckout.customerPhone}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-400 text-xs font-bold block uppercase">Thời gian</span>
                    <span className="font-medium text-xs">
                      {formatDate(selectedBookingForCheckout.checkInDate)} - {formatDate(selectedBookingForCheckout.checkOutDate)}
                    </span>
                  </div>
                </div>

                {/* Subtotal table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-1.5">Chi tiết chi phí</h4>
                  
                  {/* Room Cost line */}
                  <div className="flex justify-between items-center py-1">
                    <div>
                      <span className="font-medium text-gray-800">Tiền phòng ({calculateNights(selectedBookingForCheckout.checkInDate, selectedBookingForCheckout.checkOutDate)} đêm)</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      {formatVND(selectedBookingForCheckout.totalPrice + (selectedBookingForCheckout.discountAmount || 0))}
                    </span>
                  </div>

                  {/* Loyalty Member info badge */}
                  {selectedBookingForCheckout.discountAmount && (
                    <div className="flex justify-between items-center text-emerald-600 text-xs py-0.5 font-semibold">
                      <span>Ưu đãi thành viên VIP (Từ điểm tích lũy)</span>
                      <span>- {formatVND(selectedBookingForCheckout.discountAmount)}</span>
                    </div>
                  )}

                  {/* Service charges detail block */}
                  {getServiceOrdersForBooking(selectedBookingForCheckout.id).length > 0 && (
                    <div className="border-t border-dashed border-gray-200 pt-2.5 mt-2.5 space-y-2">
                      <span className="text-xs font-bold text-blue-600 block uppercase">Phụ phí dịch vụ bổ sung:</span>
                      {getServiceOrdersForBooking(selectedBookingForCheckout.id).map(so => {
                        const originalS = services.find(s => s.id === so.serviceId);
                        return (
                          <div key={so.id} className="flex justify-between items-center text-xs text-gray-600">
                            <span>{originalS?.name} ({so.quantity} x {formatVND(originalS?.price || 0)})</span>
                            <span className="font-mono">{formatVND(so.totalPrice)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-6 bg-red-50/40 p-4 rounded-xl">
                  {/* Calculations */}
                  <div className="flex justify-between items-center text-gray-500 font-semibold mb-1">
                    <span>Tổng tiền phòng:</span>
                    <span className="font-mono">{formatVND(selectedBookingForCheckout.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 font-semibold mb-3">
                    <span>Tổng dịch vụ bổ trợ:</span>
                    <span className="font-mono">
                      {formatVND(getServiceOrdersForBooking(selectedBookingForCheckout.id).reduce((sum, so) => sum + so.totalPrice, 0))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-900 pt-2 border-t border-red-100">
                    <div>
                      <span className="text-sm font-bold block">TỔNG CỘNG HÓA ĐƠN</span>
                      {selectedBookingForCheckout.status === 'CheckedIn' && (
                        <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                          Tích lũy +{Math.floor((selectedBookingForCheckout.totalPrice + getServiceOrdersForBooking(selectedBookingForCheckout.id).reduce((sum, so) => sum + so.totalPrice, 0)) / 100000)} điểm thành viên
                        </span>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-red-600 font-mono">
                      {formatVND(
                        selectedBookingForCheckout.totalPrice + 
                        getServiceOrdersForBooking(selectedBookingForCheckout.id).reduce((sum, so) => sum + so.totalPrice, 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="text-center text-gray-400 text-xs py-2">
                  Cảm ơn quý khách đã tin chọn Khách sạn Coral Hotel!
                </div>

                <div className="flex gap-2 text-sm font-semibold pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setSelectedBookingForCheckout(null);
                    }}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Đóng lại
                  </button>
                  
                  {selectedBookingForCheckout.status === 'CheckedIn' && (
                    <button
                      type="button"
                      onClick={handleConfirmCheckout}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Xác nhận Thanh toán
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
