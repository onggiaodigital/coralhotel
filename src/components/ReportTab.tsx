import React, { useState } from 'react';
import { Booking, Room, LoyaltyCustomer, ServiceOrder, ServiceItem } from '../types';
import { formatVND } from '../utils';
import { 
  BarChart3, PiggyBank, Calendar, Percent, Users, Box, Coffee, Check, DollarSign,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportTabProps {
  bookings: Booking[];
  rooms: Room[];
  loyaltyCustomers: LoyaltyCustomer[];
  services: ServiceItem[];
  serviceOrders: ServiceOrder[];
}

export default function ReportTab({
  bookings,
  rooms,
  loyaltyCustomers,
  services,
  serviceOrders
}: ReportTabProps) {
  const [reportPeriod, setReportPeriod] = useState<'All' | 'May'>('All');

  // Compute stats
  const checkedOutBookings = bookings.filter(b => b.status === 'CheckedOut');
  
  // Total room revenue from checked out bookings
  const roomRevenue = checkedOutBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Total service revenue from paid service orders (status 'Paid' or connected to checked-out bookings)
  const paidServiceOrders = serviceOrders.filter(so => {
    // Is either marked as Paid or the parent booking is CheckedOut
    const parentBooking = bookings.find(b => b.id === so.bookingId);
    return so.status === 'Paid' || (parentBooking && parentBooking.status === 'CheckedOut');
  });
  
  const serviceRevenue = paidServiceOrders.reduce((sum, so) => sum + so.totalPrice, 0);
  const totalRevenue = roomRevenue + serviceRevenue;

  // Occupancy stats
  const occupiedRoomsCount = rooms.filter(r => r.status === 'Booked').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRoomsCount / rooms.length) * 100) : 0;
  const cleaningRoomsCount = rooms.filter(r => r.status === 'Cleaning').length;

  // Revenue breakdown by category
  const categories = ['Food', 'Drinks', 'Spa', 'Laundry', 'Transport'];
  const categoryRevenue = categories.map(cat => {
    const revenue = paidServiceOrders.reduce((sum, order) => {
      const parentS = services.find(s => s.id === order.serviceId);
      if (parentS && parentS.category === cat) {
        return sum + order.totalPrice;
      }
      return sum;
    }, 0);

    return {
      category: cat,
      label: cat === 'Food' ? '🍔 Ăn uống' : cat === 'Drinks' ? '🍹 Đồ uống' : cat === 'Spa' ? '💆 Spa làm đẹp' : cat === 'Laundry' ? '🧺 Giặt là' : '🚗 Vận tải dã ngoại',
      revenue,
      color: cat === 'Food' ? '#ef4444' : cat === 'Drinks' ? '#3b82f6' : cat === 'Spa' ? '#ec4899' : cat === 'Laundry' ? '#eab308' : '#10b981'
    };
  });

  const totalCatRevenue = categoryRevenue.reduce((sum, c) => sum + c.revenue, 0);

  // Growth / Revenue by completed bookings (Daily block chart)
  // Let's group room revenue by checkOutDate
  const dailyGroups: Record<string, { total: number; bookingsCount: number }> = {};
  checkedOutBookings.forEach(b => {
    const rawDate = b.checkOutDate || b.checkInDate;
    if (!rawDate) return;
    // get dd/mm
    const dateFormatted = rawDate.split('-').slice(1).reverse().join('/');
    if (!dailyGroups[dateFormatted]) {
      dailyGroups[dateFormatted] = { total: 0, bookingsCount: 0 };
    }
    // Add room price + any service price linked to this booking
    const servicesCost = paidServiceOrders.filter(so => so.bookingId === b.id).reduce((sum, so) => sum + so.totalPrice, 0);
    dailyGroups[dateFormatted].total += b.totalPrice + servicesCost;
    dailyGroups[dateFormatted].bookingsCount += 1;
  });

  const dailyChartData = Object.entries(dailyGroups)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // take last 7 active dates

  return (
    <div className="space-y-6">
      
      {/* Top Level Metric KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase block tracking-wider">Tổng Doanh thu</span>
              <h3 className="text-2xl font-extrabold font-mono text-red-600 mt-1.5 leading-none">{formatVND(totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <PiggyBank className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 font-semibold mt-4 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Phòng: {formatVND(roomRevenue)} | Dịch vụ: {formatVND(serviceRevenue)}
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase block tracking-wider">Tỉ lệ lấp đầy</span>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 mt-1.5 leading-none">{occupancyRate}%</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <Percent className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 font-semibold mt-4">
            Đang lưu trú: {occupiedRoomsCount}/{rooms.length} phòng | Dọn dẹp: {cleaningRoomsCount}
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase block tracking-wider">Tổng đơn đặt phòng</span>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 mt-1.5 leading-none">{bookings.length}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-xs text-gray-400 font-semibold mt-4">
            Đã check-out: <span className="text-gray-800 font-bold">{checkedOutBookings.length}</span> | Đã đặt trước: <span className="text-gray-800 font-bold">{bookings.filter(b => b.status === 'Confirmed').length}</span>
          </div>
        </div>

        {/* Loyalty programs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase block tracking-wider">Khách thân thiết</span>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 mt-1.5 leading-none">{loyaltyCustomers.length}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <Users className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 font-semibold mt-4 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Hội viên VIP thăng cấp tự động
          </div>
        </div>
      </div>

      {/* Graphical statistics layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Room daily revenue bar chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-base font-display">Biểu đồ Doanh thu thu hoạch gần đây</h3>
            <span className="text-xs text-gray-400 font-bold font-mono">ĐƠN VỊ: VND</span>
          </div>

          {dailyChartData.length > 0 ? (
            <div className="h-[250px] flex items-end justify-around gap-2 pt-6">
              {dailyChartData.map((data, index) => {
                const maxVal = Math.max(...dailyChartData.map(d => d.total));
                const barHeight = maxVal > 0 ? (data.total / maxVal) * 80 : 0; // max 80% height

                return (
                  <div key={index} className="flex flex-col items-center flex-1 group relative">
                    {/* Bar Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-10 text-center font-mono font-semibold min-w-[100px]">
                      <div>{data.date}</div>
                      <div className="text-red-400 font-bold">{formatVND(data.total)}</div>
                      <div className="text-gray-300 text-[9px]">{data.bookingsCount} lượt Checkout</div>
                    </div>

                    {/* Simple Column Graphic */}
                    <div className="w-full bg-linear-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-300 relative overflow-hidden" 
                         style={{ height: `${Math.max(10, barHeight)}%` }} 
                    >
                      <div className="absolute inset-0 bg-white/10 hover:bg-transparent pointer-events-none" />
                    </div>

                    <span className="text-[10px] text-gray-400 font-bold font-mono mt-3">{data.date}</span>
                    <span className="text-[9px] text-gray-700 font-bold font-mono mt-0.5">{Math.round(data.total / 1000)}k</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu giao dịch hoàn thiện thanh toán để vẽ biểu đồ doanh thu.
            </div>
          )}
        </div>

        {/* Extra services pie / breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base font-display mb-4">Cơ cấu doanh số Dịch vụ</h3>
            <div className="text-xs text-gray-400 font-semibold mb-6">Tỉ lệ đóng góp của từng dịch vụ bổ sung</div>
          </div>

          <div className="space-y-4">
            {categoryRevenue.map(c => {
              const share = totalCatRevenue > 0 ? Math.round((c.revenue / totalCatRevenue) * 100) : 0;
              return (
                <div key={c.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{c.label}</span>
                    <span className="text-gray-900 font-mono font-bold">
                      {formatVND(c.revenue)} <span className="text-gray-400 font-semibold text-[10px]">({share}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${share}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}

            {totalCatRevenue === 0 && (
              <div className="text-center text-gray-400 text-xs py-10">Chưa ghi nhận phí phụ thu dịch vụ nào.</div>
            )}
          </div>

          {totalCatRevenue > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Tổng phụ phí dịch vụ:</span>
              <span className="font-mono text-red-650 font-bold text-red-600">{formatVND(totalCatRevenue)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Checked Out logs */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs mt-6">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
          <h3 className="font-bold text-gray-900 text-base font-display">Lịch sử hóa đơn đã Checkout</h3>
          <span className="p-1 px-2.5 bg-red-50 text-red-700 text-xs font-extrabold rounded-lg font-mono">
            {checkedOutBookings.length} giao dịch thành công
          </span>
        </div>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 text-xs font-bold uppercase">
                <th className="py-3 px-5">Mã đơn đặt</th>
                <th className="py-3 px-5">Phòng số</th>
                <th className="py-3 px-5">Chủ phòng</th>
                <th className="py-3 px-5">Ngày Checkout</th>
                <th className="py-3 px-5 text-right">Tổng thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {checkedOutBookings.map(b => {
                const totalWithS = b.totalPrice + paidServiceOrders.filter(so => so.bookingId === b.id).reduce((sum, so) => sum + so.totalPrice, 0);
                return (
                  <tr key={b.id} className="hover:bg-gray-55 text-gray-700 transition-colors font-medium">
                    <td className="py-3 px-5 font-mono text-gray-900 font-semibold">{b.id}</td>
                    <td className="py-3 px-5">
                      <span className="p-1 px-2 bg-red-50 text-red-700 rounded text-xs font-bold font-display">Phòng {b.roomNumber}</span>
                    </td>
                    <td className="py-3 px-5">{b.customerName}</td>
                    <td className="py-3 px-5 font-mono font-normal text-xs">{b.checkOutDate}</td>
                    <td className="py-3 px-5 text-right font-mono font-bold text-gray-900">{formatVND(totalWithS)}</td>
                  </tr>
                );
              })}

              {checkedOutBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Chưa hoàn tất bất kỳ giao dịch trả phòng checkout nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
