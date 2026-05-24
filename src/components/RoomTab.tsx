import React, { useState } from 'react';
import { Room, Booking, LoyaltyCustomer } from '../types';
import { formatVND } from '../utils';
import { 
  Building2, Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, 
  Sparkles, Wrench, Search, Filter, RefreshCw, Eye, BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoomTabProps {
  rooms: Room[];
  bookings: Booking[];
  loyaltyCustomers: LoyaltyCustomer[];
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onQuickBook: (room: Room) => void;
  onViewBooking: (bookingId: string) => void;
}

export default function RoomTab({
  rooms,
  bookings,
  loyaltyCustomers,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onQuickBook,
  onViewBooking
}: RoomTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
  const [selectedType, setSelectedType] = useState<string | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<string | 'All'>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  // Add Room form state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<'Single' | 'Double' | 'Suite' | 'Family'>('Single');
  const [newRoomPrice, setNewRoomPrice] = useState(350000);
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomStatus, setNewRoomStatus] = useState<'Available' | 'Booked' | 'Cleaning' | 'Maintenance'>('Available');

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchTerm) || room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = selectedFloor === 'All' || room.floor === selectedFloor;
    const matchesType = selectedType === 'All' || room.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || room.status === selectedStatus;
    return matchesSearch && matchesFloor && matchesType && matchesStatus;
  });

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort();

  const handleOpenAddModal = () => {
    // Generate a default room number succeeding the last room for convenience
    const lastRoom = rooms[rooms.length - 1];
    const defaultNextNum = lastRoom ? String(Number(lastRoom.number) + 1) : '101';
    setNewRoomNumber(defaultNextNum);
    setNewRoomType('Single');
    setNewRoomPrice(350000);
    setNewRoomFloor(lastRoom ? lastRoom.floor : 1);
    setNewRoomStatus('Available');
    setIsAddModalOpen(true);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    if (rooms.some(r => r.number === newRoomNumber)) {
      alert(`Số phòng ${newRoomNumber} đã tồn tại!`);
      return;
    }

    const newRoom: Room = {
      id: newRoomNumber,
      number: newRoomNumber,
      type: newRoomType,
      price: Number(newRoomPrice),
      floor: Number(newRoomFloor),
      status: newRoomStatus
    };

    onAddRoom(newRoom);
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (room: Room) => {
    setRoomToEdit(room);
    setIsEditModalOpen(true);
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomToEdit) return;

    onUpdateRoom(roomToEdit);
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = (roomId: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ${roomId}?`)) {
      onDeleteRoom(roomId);
    }
  };

  // Get active booking detail for booked rooms
  const getActiveBookingForRoom = (roomId: string) => {
    return bookings.find(b => b.roomId === roomId && (b.status === 'CheckedIn' || b.status === 'Confirmed'));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div id="room-controls" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm số phòng, loại phòng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-gray-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Floor filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-red-500"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            >
              <option value="All">Tất cả tầng</option>
              {floors.map(f => (
                <option key={f} value={f}>Tầng {f}</option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <select
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-red-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">Tất cả loại phòng</option>
            <option value="Single">Phòng Đơn (Single)</option>
            <option value="Double">Phòng Đôi (Double)</option>
            <option value="Suite">Cao cấp / VIP (Suite)</option>
            <option value="Family">Phòng Gia đình (Family)</option>
          </select>

          {/* Status filter */}
          <select
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-red-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Available">Còn trống (Sẵn sàng)</option>
            <option value="Booked">Đang sử dụng (Đã đặt)</option>
            <option value="Cleaning">Đang dọn dẹp</option>
            <option value="Maintenance">Đang bảo trì</option>
          </select>
        </div>

        {/* Add Room Button */}
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm self-stretch md:self-auto cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm phòng mới
        </button>
      </div>

      {/* Room Listing Grid */}
      <div id="rooms-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredRooms.map(room => {
          const activeBooking = getActiveBookingForRoom(room.id);
          
          // Style mapping
          const styleMap = {
            Available: {
              bg: 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400',
              badge: 'bg-emerald-100 text-emerald-800',
              label: 'Còn trống',
              dot: 'bg-emerald-500',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            },
            Booked: {
              bg: 'bg-red-50/40 border-red-200 hover:border-red-400',
              badge: 'bg-red-100 text-red-800',
              label: 'Đang ở / Đã đặt',
              dot: 'bg-red-500',
              icon: <BookOpen className="w-5 h-5 text-red-600" />
            },
            Cleaning: {
              bg: 'bg-amber-50/40 border-amber-200 hover:border-amber-400',
              badge: 'bg-amber-100 text-amber-800',
              label: 'Đang dọn',
              dot: 'bg-amber-500',
              icon: <Sparkles className="w-5 h-5 text-amber-600" />
            },
            Maintenance: {
              bg: 'bg-gray-50/70 border-gray-200 hover:border-gray-400',
              badge: 'bg-gray-100 text-gray-800',
              label: 'Bảo trì',
              dot: 'bg-gray-500',
              icon: <Wrench className="w-5 h-5 text-gray-600" />
            }
          };

          const ui = styleMap[room.status];

          return (
            <motion.div
              layout
              key={room.id}
              className={`flex flex-col bg-white border rounded-2xl p-4.5 transition-all duration-200 relative group overflow-hidden ${ui.bg}`}
            >
              {/* Top Banner Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${ui.dot}`} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider font-mono">TẦNG {room.floor}</div>
                  <h3 className="text-2xl font-bold font-display text-gray-900 leading-none mt-1">Phòng {room.number}</h3>
                </div>
                <div className="p-1 px-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-white border border-gray-200 shadow-2xs">
                  <span className={`w-2 h-2 rounded-full ${ui.dot} animate-pulse`} />
                  <span className="text-gray-700">{ui.label}</span>
                </div>
              </div>

              {/* Room details */}
              <div className="space-y-1.5 my-3 flex-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Loại phòng:</span>
                  <span className="font-semibold text-gray-800">
                    {room.type === 'Single' && 'Phòng Đơn'}
                    {room.type === 'Double' && 'Phòng Đôi'}
                    {room.type === 'Suite' && 'Thượng hạng VIP'}
                    {room.type === 'Family' && 'Gia đình'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Giá phòng:</span>
                  <span className="font-bold text-red-600 font-mono">{formatVND(room.price)}/đêm</span>
                </div>

                {/* Additional status for booked customers */}
                {room.status === 'Booked' && activeBooking && (
                  <div className="border-t border-red-100/50 pt-2 mt-2 space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-gray-800">
                      <span className="text-gray-400">Khách:</span>
                      <span className="truncate max-w-[120px]" title={activeBooking.customerName}>{activeBooking.customerName}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Thời gian:</span>
                      <span>{activeBooking.checkInDate} → {activeBooking.checkOutDate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex gap-2 border-t border-gray-100 pt-3 mt-2">
                {room.status === 'Available' ? (
                  <button
                    onClick={() => onQuickBook(room)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-red-600" />
                    Đặt phòng nhanh
                  </button>
                ) : room.status === 'Booked' && activeBooking ? (
                  <button
                    onClick={() => onViewBooking(activeBooking.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Xem hóa đơn dịch vụ
                  </button>
                ) : room.status === 'Cleaning' ? (
                  <button
                    onClick={() => onUpdateRoom({ ...room, status: 'Available' })}
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Hoàn tất dọn dẹp
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateRoom({ ...room, status: 'Cleaning' })}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Giao dọn dẹp
                  </button>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEditModal(room)}
                  className="p-1.5 border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
                  title="Sửa phòng"
                >
                  <Edit2 className="w-3.5 h-3.5 text-red-500" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(room.id)}
                  className="p-1.5 border border-red-100 hover:border-red-200 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                  title="Xóa phòng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white border border-gray-100 rounded-2xl">
            Không tìm thấy phòng nào phù hợp điều kiện lọc.
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <span className="font-semibold text-red-900 text-base font-display">Thêm phòng mới</span>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Số phòng</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 106, 206..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tầng</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={15}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Loại phòng</label>
                    <select
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value as any)}
                    >
                      <option value="Single">Phòng Đơn</option>
                      <option value="Double">Phòng Đôi</option>
                      <option value="Suite">VIP Suite</option>
                      <option value="Family">Gia đình</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Giá phòng một đêm (VND)</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-mono"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Trạng thái phòng</label>
                  <select
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                    value={newRoomStatus}
                    onChange={(e) => setNewRoomStatus(e.target.value as any)}
                  >
                    <option value="Available">Trống (Sẵn sàng)</option>
                    <option value="Cleaning">Đang dọn dẹp</option>
                    <option value="Maintenance">Đang bảo trì</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                  >
                    Thêm phòng
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Room Modal */}
      <AnimatePresence>
        {isEditModalOpen && roomToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <span className="font-semibold text-red-900 text-base font-display">Chỉnh sửa phòng {roomToEdit.number}</span>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdateRoom} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tầng</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={15}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                      value={roomToEdit.floor}
                      onChange={(e) => setRoomToEdit({ ...roomToEdit, floor: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Loại phòng</label>
                    <select
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                      value={roomToEdit.type}
                      onChange={(e) => setRoomToEdit({ ...roomToEdit, type: e.target.value as any })}
                    >
                      <option value="Single">Phòng Đơn</option>
                      <option value="Double">Phòng Đôi</option>
                      <option value="Suite">VIP Suite</option>
                      <option value="Family">Gia đình</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Giá phòng một đêm (VND)</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-mono"
                    value={roomToEdit.price}
                    onChange={(e) => setRoomToEdit({ ...roomToEdit, price: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Trạng thái phòng</label>
                  <select
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                    value={roomToEdit.status}
                    onChange={(e) => setRoomToEdit({ ...roomToEdit, status: e.target.value as any })}
                  >
                    <option value="Available">Trống (Sẵn sàng)</option>
                    <option value="Booked">Đang sử dụng (Đã đặt)</option>
                    <option value="Cleaning">Đang dọn dẹp</option>
                    <option value="Maintenance">Đang bảo trì</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
