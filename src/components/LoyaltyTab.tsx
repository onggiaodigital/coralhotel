import React, { useState } from 'react';
import { LoyaltyCustomer, Booking } from '../types';
import { formatDate, generateId } from '../utils';
import { 
  Award, Shield, Search, Plus, UserPlus, Phone, CreditCard, Mail, 
  Calendar, ChevronRight, CheckCircle2, TrendingUp, Sparkles, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TIER_BENEFITS, getTierFromPoints } from '../mockData';

interface LoyaltyTabProps {
  loyaltyCustomers: LoyaltyCustomer[];
  bookings: Booking[];
  onAddLoyaltyCustomer: (customer: LoyaltyCustomer) => void;
  onUpdateLoyaltyCustomer: (customer: LoyaltyCustomer) => void;
}

export default function LoyaltyTab({
  loyaltyCustomers,
  bookings,
  onAddLoyaltyCustomer,
  onUpdateLoyaltyCustomer
}: LoyaltyTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('All');
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<LoyaltyCustomer | null>(null);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Manual Creation state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custIdentity, setCustIdentity] = useState('');

  const filteredCustomers = loyaltyCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          c.identity.includes(searchTerm);
    const matchesTier = selectedTierFilter === 'All' || c.tier === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platform':
      case 'Platinum':
        return {
          cardBg: 'from-slate-800 to-slate-900 text-white',
          badgeBg: 'bg-slate-700 text-slate-100 border-slate-600',
          accentColor: 'text-slate-200',
          progressColor: 'bg-linear-to-r from-teal-400 to-slate-100'
        };
      case 'Gold':
        return {
          cardBg: 'from-amber-500 to-yellow-600 text-white',
          badgeBg: 'bg-amber-400/30 text-amber-50 border-amber-400',
          accentColor: 'text-yellow-100',
          progressColor: 'bg-linear-to-r from-yellow-300 to-amber-200'
        };
      case 'Silver':
        return {
          cardBg: 'from-slate-400 to-slate-500 text-white',
          badgeBg: 'bg-slate-300/30 text-slate-50 border-slate-300',
          accentColor: 'text-slate-100',
          progressColor: 'bg-linear-to-r from-slate-200 to-slate-100'
        };
      default: // Bronze
        return {
          cardBg: 'from-amber-700/80 to-amber-800 text-white',
          badgeBg: 'bg-amber-600/30 text-amber-50 border-amber-600',
          accentColor: 'text-amber-100',
          progressColor: 'bg-amber-400'
        };
    }
  };

  const getNextTierDetails = (points: number) => {
    if (points >= TIER_BENEFITS.Platinum.requiredPoints) {
      return { nextTier: 'Tối đa', pointsNeeded: 0, percentage: 100 };
    }
    if (points >= TIER_BENEFITS.Gold.requiredPoints) {
      const needed = TIER_BENEFITS.Platinum.requiredPoints - points;
      const range = TIER_BENEFITS.Platinum.requiredPoints - TIER_BENEFITS.Gold.requiredPoints;
      const progress = points - TIER_BENEFITS.Gold.requiredPoints;
      return { 
        nextTier: 'Platinum', 
        pointsNeeded: needed, 
        percentage: Math.min(100, Math.round((progress / range) * 100)) 
      };
    }
    if (points >= TIER_BENEFITS.Silver.requiredPoints) {
      const needed = TIER_BENEFITS.Gold.requiredPoints - points;
      const range = TIER_BENEFITS.Gold.requiredPoints - TIER_BENEFITS.Silver.requiredPoints;
      const progress = points - TIER_BENEFITS.Silver.requiredPoints;
      return { 
        nextTier: 'Gold', 
        pointsNeeded: needed, 
        percentage: Math.min(100, Math.round((progress / range) * 100)) 
      };
    }
    const needed = TIER_BENEFITS.Silver.requiredPoints - points;
    const range = TIER_BENEFITS.Silver.requiredPoints;
    return { 
      nextTier: 'Silver', 
      pointsNeeded: needed, 
      percentage: Math.min(100, Math.round((points / range) * 100)) 
    };
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !custIdentity.trim()) return;

    if (loyaltyCustomers.some(lc => lc.phone === custPhone)) {
      alert('Số điện thoại này đã được tích hợp thẻ thành viên!');
      return;
    }

    const newCust: LoyaltyCustomer = {
      id: generateId('LC'),
      name: custName,
      phone: custPhone,
      email: custEmail || 'chưa cập nhật',
      identity: custIdentity,
      points: 0,
      tier: 'Bronze',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onAddLoyaltyCustomer(newCust);
    setIsAddOpen(false);

    // reset fields
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustIdentity('');
  };

  const getCustomerBookings = (custId: string) => {
    return bookings.filter(b => b.loyaltyCustomerId === custId);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and loyalty overview instructions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên chủ thẻ, SĐT, số chứng minh..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 bg-gray-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            {['All', 'Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTierFilter(tier)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedTierFilter === tier 
                    ? 'bg-white text-red-600 font-bold shadow-2xs' 
                    : 'hover:text-gray-900'
                }`}
              >
                {tier === 'All' ? 'Tất cả hạng VIP' : `${tier}`}
              </button>
            ))}
          </div>
        </div>

        {/* Member Manual Add button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Mở thẻ thành viên mới
        </button>
      </div>

      {/* Tier Benefits Quick Guide panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(TIER_BENEFITS).map(([tier, data]) => (
          <div key={tier} className="bg-white border border-gray-150 p-4 rounded-xl flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              tier === 'Platinum' ? 'bg-slate-100 text-slate-800' :
              tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
              tier === 'Silver' ? 'bg-slate-100 text-slate-600' :
              'bg-amber-100/40 text-amber-800'
            }`}>
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Hạng {tier}</div>
              <div className="text-xs text-gray-500">Giảm <span className="font-bold text-red-600">{data.discount}%</span> tiền phòng ({data.requiredPoints}đ)</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loyalty Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(c => {
          const block = getTierColor(c.tier);
          const nextData = getNextTierDetails(c.points);
          const history = getCustomerBookings(c.id);

          return (
            <motion.div
              layout
              key={c.id}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Membership Card Top banner */}
              <div className={`bg-linear-to-br ${block.cardBg} p-5 relative overflow-hidden flex flex-col justify-between h-[180px]`}>
                {/* Decorative circle highlights */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute -left-12 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs tracking-widest font-bold uppercase opacity-80 font-display">CORAL HOTEL MEMBER</span>
                    <h4 className="text-lg font-bold mt-1 tracking-tight truncate max-w-[200px]">{c.name}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${block.badgeBg}`}>
                    👑 Hạng {c.tier}
                  </span>
                </div>

                <div className="space-y-2 mt-4 z-10">
                  <div className="flex justify-between text-xs opacity-90 font-mono">
                    <span>SĐT: {c.phone}</span>
                    <span>Tích lũy: {c.points} điểm</span>
                  </div>

                  {/* Level progression bar */}
                  <div>
                    <div className="flex justify-between text-[10px] opacity-75 mb-1 font-semibold">
                      <span>Tiến trình đến hạng tiếp theo</span>
                      <span>{nextData.pointsNeeded > 0 ? `Cần thêm ${nextData.pointsNeeded} đ` : 'Hạng tối đa'}</span>
                    </div>
                    <div className="w-full bg-black/15 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${block.progressColor} transition-all duration-300`} style={{ width: `${nextData.percentage}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details bottom */}
              <div className="p-5 space-y-4">
                <div className="text-xs text-gray-500 font-semibold space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Mã thẻ:</span>
                    <span className="text-gray-900 font-bold">{c.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CCCD:</span>
                    <span className="text-gray-900">{c.identity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-gray-900 truncate max-w-[170px]" title={c.email}>{c.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày mở:</span>
                    <span>{formatDate(c.joinedDate)}</span>
                  </div>
                </div>

                {/* Micro Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => setSelectedCustomerForHistory(c)}
                    className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-colors border border-gray-200 inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-red-500" />
                    Lịch sử đặt ({history.length} lượt)
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white border border-gray-100 rounded-2xl font-semibold">
            Không tìm thấy thành viên nào trùng khớp thông tin tìm kiếm.
          </div>
        )}
      </div>

      {/* Register loyalty model */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-sm w-full overflow-hidden"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <span className="font-semibold text-red-900 text-base font-display flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-red-600" />
                  Cấp thẻ Khách hàng thân thiết
                </span>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleRegister} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Họ và tên khách hàng</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lê Hoàng Nam"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Số điện thoại liên hệ</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input
                      type="tel"
                      required
                      placeholder="0912xxxxx..."
                      className="w-full pl-9 pr-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm font-mono"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Số CCCD / Hộ chiếu</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input
                      type="text"
                      required
                      placeholder="Điền 12 số CCCD..."
                      className="w-full pl-9 pr-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm font-mono"
                      value={custIdentity}
                      onChange={(e) => setCustIdentity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Địa chỉ Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                  />
                </div>

                <div className="bg-red-50 p-3 rounded-lg text-xs text-red-800 font-semibold space-y-1 leading-relaxed">
                  <div>💡 Khách hàng sẽ bắt đầu ở hạng <b>Bronze (Đồng)</b>.</div>
                  <div>📈 Mỗi khi thanh toán, khách hàng được cộng thêm điểm thành viên (1 điểm cho mỗi 100K chi tiêu thực tế) để thăng hạng!</div>
                </div>

                <div className="flex gap-3 pt-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Mở thẻ thành viên
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History view popover Modal */}
      <AnimatePresence>
        {selectedCustomerForHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-red-900 text-base font-display block">Lịch sử giao dịch thành viên</span>
                  <span className="text-xs text-red-700 font-bold uppercase">{selectedCustomerForHistory.name} - 👑 {selectedCustomerForHistory.tier} ({selectedCustomerForHistory.points} điểm)</span>
                </div>
                <button 
                  onClick={() => setSelectedCustomerForHistory(null)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="p-6">
                <div className="max-h-[300px] overflow-y-auto border border-gray-150 rounded-xl mb-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold uppercase">
                        <th className="p-3">Mã đơn</th>
                        <th className="p-3">Phòng</th>
                        <th className="p-3">Thời điểm</th>
                        <th className="p-3 text-right">Chi phí đặt phòng</th>
                        <th className="p-3 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {getCustomerBookings(selectedCustomerForHistory.id).map(hb => (
                        <tr key={hb.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-900">{hb.id}</td>
                          <td className="p-3">Phòng {hb.roomNumber}</td>
                          <td className="p-3 text-gray-500">{hb.checkInDate}</td>
                          <td className="p-3 text-right font-mono text-gray-900">
                            {hb.totalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(hb.totalPrice) : 'Chưa định giá'}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              hb.status === 'CheckedOut' ? 'bg-emerald-50 text-emerald-700' :
                              hb.status === 'CheckedIn' ? 'bg-blue-50 text-blue-700' :
                              hb.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {hb.status === 'CheckedOut' ? 'Hoàn tất' :
                               hb.status === 'CheckedIn' ? 'Đang nghỉ' :
                               hb.status === 'Cancelled' ? 'Đã hủy' : 'Đã giữ'}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {getCustomerBookings(selectedCustomerForHistory.id).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">
                            Khách hàng thân thiết chưa thực hiện đơn đặt phòng nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomerForHistory(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Đóng lịch sử xem
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
