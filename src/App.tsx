import React, { useState, useEffect } from 'react';
import { Room, Booking, LoyaltyCustomer, ServiceItem, ServiceOrder } from './types';
import { 
  INITIAL_ROOMS, 
  INITIAL_SERVICES, 
  INITIAL_LOYALTY_CUSTOMERS, 
  INITIAL_BOOKINGS, 
  INITIAL_SERVICE_ORDERS,
  getTierFromPoints
} from './mockData';
import RoomTab from './components/RoomTab';
import BookingTab from './components/BookingTab';
import ServiceTab from './components/ServiceTab';
import LoyaltyTab from './components/LoyaltyTab';
import ReportTab from './components/ReportTab';
import { 
  Hotel, Calendar, Settings, ShieldAlert, Award, BarChart3, 
  ListOrdered, RefreshCw, Sparkles, Building2, UserCheck, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'services' | 'loyalty' | 'reports'>('rooms');

  // Core application states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<LoyaltyCustomer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);

  // Load from local storage or set defaults
  useEffect(() => {
    const localRooms = localStorage.getItem('coral_rooms');
    const localBookings = localStorage.getItem('coral_bookings');
    const localLoyalty = localStorage.getItem('coral_loyalty');
    const localServices = localStorage.getItem('coral_services');
    const localOrders = localStorage.getItem('coral_orders');

    if (localRooms) setRooms(JSON.parse(localRooms));
    else setRooms(INITIAL_ROOMS);

    if (localBookings) setBookings(JSON.parse(localBookings));
    else setBookings(INITIAL_BOOKINGS);

    if (localLoyalty) setLoyaltyCustomers(JSON.parse(localLoyalty));
    else setLoyaltyCustomers(INITIAL_LOYALTY_CUSTOMERS);

    if (localServices) setServices(JSON.parse(localServices));
    else setServices(INITIAL_SERVICES);

    if (localOrders) setServiceOrders(JSON.parse(localOrders));
    else setServiceOrders(INITIAL_SERVICE_ORDERS);
  }, []);

  // Persist storage whenever any state registers updates
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleRoomsUpdate = (newRooms: Room[]) => {
    setRooms(newRooms);
    saveState('coral_rooms', newRooms);
  };

  const handleBookingsUpdate = (newBookings: Booking[]) => {
    setBookings(newBookings);
    saveState('coral_bookings', newBookings);
  };

  const handleLoyaltyUpdate = (newLoyalty: LoyaltyCustomer[]) => {
    setLoyaltyCustomers(newLoyalty);
    saveState('coral_loyalty', newLoyalty);
  };

  const handleServicesUpdate = (newServices: ServiceItem[]) => {
    setServices(newServices);
    saveState('coral_services', newServices);
  };

  const handleServiceOrdersUpdate = (newOrders: ServiceOrder[]) => {
    setServiceOrders(newOrders);
    saveState('coral_orders', newOrders);
  };

  // State handlers callbacks passed to child components
  const addRoom = (room: Room) => {
    const updated = [...rooms, room];
    handleRoomsUpdate(updated);
  };

  const updateRoom = (updatedRoom: Room) => {
    const updated = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    handleRoomsUpdate(updated);
  };

  const deleteRoom = (roomId: string) => {
    const updated = rooms.filter(r => r.id !== roomId);
    handleRoomsUpdate(updated);
  };

  const addBooking = (booking: Booking, shouldUpdateRoomStatus = true) => {
    const updatedBookings = [booking, ...bookings];
    handleBookingsUpdate(updatedBookings);

    if (shouldUpdateRoomStatus) {
      // If booking checkedIn, room is booked. Otherwise, booked status is given only on checkIn.
      const roomStatus = booking.status === 'CheckedIn' ? 'Booked' : 'Available';
      if (roomStatus === 'Booked') {
        const updatedRooms = rooms.map(r => r.id === booking.roomId ? { ...r, status: 'Booked' as const } : r);
        handleRoomsUpdate(updatedRooms);
      }
    }
  };

  const updateBooking = (updatedBooking: Booking) => {
    const updated = bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    handleBookingsUpdate(updated);
  };

  const cancelBooking = (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    // Set Booking Cancelled
    const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b);
    handleBookingsUpdate(updatedBookings);

    // Free up Room
    const updatedRooms = rooms.map(r => r.id === targetBooking.roomId ? { ...r, status: 'Available' as const } : r);
    handleRoomsUpdate(updatedRooms);
  };

  const executeCheckIn = (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    const todayDate = new Date().toISOString().split('T')[0];

    // Mark Checked In
    const updatedBookings = bookings.map(b => b.id === bookingId ? {
      ...b,
      status: 'CheckedIn' as const,
      actualCheckIn: `${todayDate} 14:00`
    } : b);
    handleBookingsUpdate(updatedBookings);

    // Set Room status to Booked
    const updatedRooms = rooms.map(r => r.id === targetBooking.roomId ? { ...r, status: 'Booked' as const } : r);
    handleRoomsUpdate(updatedRooms);
  };

  const executeCheckOut = (bookingId: string, finalBillTotalPrice: number, earnedPoints: number) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    const todayDate = new Date().toISOString().split('T')[0];

    // Mark Booking as Checked out
    const updatedBookings = bookings.map(b => b.id === bookingId ? {
      ...b,
      status: 'CheckedOut' as const,
      actualCheckOut: `${todayDate} 11:30`
    } : b);
    handleBookingsUpdate(updatedBookings);

    // Mark Room status to Cleaning (Standard hotel policy ensures cleaning is performed on check out!)
    const updatedRooms = rooms.map(r => r.id === targetBooking.roomId ? { ...r, status: 'Cleaning' as const } : r);
    handleRoomsUpdate(updatedRooms);

    // Save and accumulate loyalty points if connected
    if (targetBooking.loyaltyCustomerId) {
      const updatedLoyalty = loyaltyCustomers.map(lc => {
        if (lc.id === targetBooking.loyaltyCustomerId) {
          const freshPoints = lc.points + earnedPoints;
          const freshTier = getTierFromPoints(freshPoints);
          return {
            ...lc,
            points: freshPoints,
            tier: freshTier
          };
        }
        return lc;
      });
      handleLoyaltyUpdate(updatedLoyalty);
    }
  };

  const addService = (service: ServiceItem) => {
    const updated = [...services, service];
    handleServicesUpdate(updated);
  };

  const updateService = (updatedS: ServiceItem) => {
    const updated = services.map(s => s.id === updatedS.id ? updatedS : s);
    handleServicesUpdate(updated);
  };

  const deleteService = (serviceId: string) => {
    const updated = services.filter(s => s.id !== serviceId);
    handleServicesUpdate(updated);
  };

  const addServiceOrder = (order: ServiceOrder) => {
    const updated = [order, ...serviceOrders];
    handleServiceOrdersUpdate(updated);
  };

  const deleteServiceOrder = (id: string) => {
    const updated = serviceOrders.filter(so => so.id !== id);
    handleServiceOrdersUpdate(updated);
  };

  const addLoyaltyCustomer = (customer: LoyaltyCustomer) => {
    const updated = [...loyaltyCustomers, customer];
    handleLoyaltyUpdate(updated);
  };

  const updateLoyaltyCustomer = (updatedCust: LoyaltyCustomer) => {
    const updated = loyaltyCustomers.map(lc => lc.id === updatedCust.id ? updatedCust : lc);
    handleLoyaltyUpdate(updated);
  };

  // Trigger quick book preset selection
  const handleQuickBookRequest = (room: Room) => {
    setActiveTab('bookings');
    // Prefill helper state will be picked up inside BookingTab trigger callbacks
    // Simply opening the create dialog works great!
  };

  // Reset core data to defaults
  const resetToFactoryData = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu ban đầu? Mọi chỉnh sửa hiện tại sẽ bị xóa sạch.')) {
      localStorage.clear();
      setRooms(INITIAL_ROOMS);
      setBookings(INITIAL_BOOKINGS);
      setLoyaltyCustomers(INITIAL_LOYALTY_CUSTOMERS);
      setServices(INITIAL_SERVICES);
      setServiceOrders(INITIAL_SERVICE_ORDERS);
      setActiveTab('rooms');
    }
  };

  return (
    <div id="hotel-applet" className="min-h-screen flex flex-col bg-slate-50 text-gray-800">
      
      {/* Upper Branded Header */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand with requested red icon highlighting */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-650 bg-red-600 rounded-xl shadow-xs text-white flex items-center justify-center animate-pulse">
              <Hotel className="w-6.5 h-6.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-gray-900 tracking-tight leading-none flex items-center gap-1.5">
                Coral Hotel <span className="text-red-500 font-extrabold text-xs bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">PMS</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-semibold">Hệ thống quản lý khách sạn thông minh & tối giản</p>
            </div>
          </div>

          {/* Practical system utility state */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-500 font-mono hidden md:flex items-center gap-1.5 p-1 px-3.5 bg-gray-50 rounded-lg border border-gray-150">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Sẵn sàng • 21/05/2026
            </span>

            {/* Reset Defaults button */}
            <button
              onClick={resetToFactoryData}
              title="Khôi phục dữ liệu ban đầu"
              className="p-2 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-all hover:bg-red-50 bg-white cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Primary Tab Navigation & Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Core Menu Tabs */}
        <div id="tabs-navigation" className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-150 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'rooms' 
                ? 'bg-red-600 text-white shadow-xs font-bold' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'rooms' ? 'text-white' : 'text-red-500'}`} />
            Sơ đồ phòng ({rooms.length})
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'bookings' 
                ? 'bg-red-600 text-white shadow-xs font-bold' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-white' : 'text-red-500'}`} />
            Đặt phòng & Checkout ({bookings.filter(b => b.status === "CheckedIn").length} lưu trú)
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'services' 
                ? 'bg-red-600 text-white shadow-xs font-bold' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ListOrdered className={`w-4 h-4 ${activeTab === 'services' ? 'text-white' : 'text-red-500'}`} />
            Dịch vụ bổ sung ({services.length})
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'loyalty' 
                ? 'bg-red-600 text-white shadow-xs font-bold' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Award className={`w-4 h-4 ${activeTab === 'loyalty' ? 'text-white' : 'text-red-500'}`} />
            Khách hàng thân thiết ({loyaltyCustomers.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'reports' 
                ? 'bg-red-600 text-white shadow-xs font-bold' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'reports' ? 'text-white' : 'text-red-500'}`} />
            Báo cáo & Doanh thu
          </button>
        </div>

        {/* Tab View Container */}
        <div id="tab-viewport" className="min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'rooms' && (
                <RoomTab
                  rooms={rooms}
                  bookings={bookings}
                  loyaltyCustomers={loyaltyCustomers}
                  onAddRoom={addRoom}
                  onUpdateRoom={updateRoom}
                  onDeleteRoom={deleteRoom}
                  onQuickBook={handleQuickBookRequest}
                  onViewBooking={(id) => {
                    setActiveTab('bookings');
                    // We can also trigger highlights if we want
                  }}
                />
              )}

              {activeTab === 'bookings' && (
                <BookingTab
                  bookings={bookings}
                  rooms={rooms}
                  loyaltyCustomers={loyaltyCustomers}
                  services={services}
                  serviceOrders={serviceOrders}
                  onAddBooking={addBooking}
                  onUpdateBooking={updateBooking}
                  onAddServiceOrder={addServiceOrder}
                  onDeleteServiceOrder={deleteServiceOrder}
                  onCheckIn={executeCheckIn}
                  onCheckOut={executeCheckOut}
                  onCancelBooking={cancelBooking}
                />
              )}

              {activeTab === 'services' && (
                <ServiceTab
                  services={services}
                  serviceOrders={serviceOrders}
                  onAddService={addService}
                  onUpdateService={updateService}
                  onDeleteService={deleteService}
                />
              )}

              {activeTab === 'loyalty' && (
                <LoyaltyTab
                  loyaltyCustomers={loyaltyCustomers}
                  bookings={bookings}
                  onAddLoyaltyCustomer={addLoyaltyCustomer}
                  onUpdateLoyaltyCustomer={updateLoyaltyCustomer}
                />
              )}

              {activeTab === 'reports' && (
                <ReportTab
                  bookings={bookings}
                  rooms={rooms}
                  loyaltyCustomers={loyaltyCustomers}
                  services={services}
                  serviceOrders={serviceOrders}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Styled Footer with required matching text */}
      <footer className="bg-white border-t border-gray-150 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
          <div className="flex items-center gap-1 text-slate-400">
            <span>© 2026 Coral Hotel Management System. Tất cả bản quyền được bảo hộ.</span>
          </div>
          
          {/* Explicitly requested text footer block */}
          <div className="flex items-center gap-1.5 p-1 px-3 bg-red-50 text-red-600 rounded-full border border-red-100 uppercase tracking-wide font-bold">
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />
            <span>App AI tạo bởi ra bởi RedPola.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
