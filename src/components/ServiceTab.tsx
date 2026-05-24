import React, { useState } from 'react';
import { ServiceItem, ServiceOrder } from '../types';
import { formatVND, generateId } from '../utils';
import { 
  Coffee, Utensils, Scissors, Sparkles, Truck, Plus, Trash2, Edit2, Search, Filter, 
  Settings, ShoppingCart, CheckCircle2, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServiceTabProps {
  services: ServiceItem[];
  serviceOrders: ServiceOrder[];
  onAddService: (service: ServiceItem) => void;
  onUpdateService: (service: ServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
}

export default function ServiceTab({
  services,
  serviceOrders,
  onAddService,
  onUpdateService,
  onDeleteService
}: ServiceTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetService, setTargetService] = useState<ServiceItem | null>(null);

  // Form fields state
  const [sName, setSName] = useState('');
  const [sCategory, setSCategory] = useState<'Food' | 'Drinks' | 'Spa' | 'Laundry' | 'Transport'>('Food');
  const [sPrice, setSPrice] = useState(50000);
  const [sUnit, setSUnit] = useState('Lượt');

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return <Utensils className="w-5 h-5 text-red-600" />;
      case 'Drinks': return <Coffee className="w-5 h-5 text-red-600" />;
      case 'Spa': return <Sparkles className="w-5 h-5 text-red-600" />;
      case 'Laundry': return <Scissors className="w-5 h-5 text-red-600" />;
      default: return <Truck className="w-5 h-5 text-red-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Food': return 'Đồ ăn';
      case 'Drinks': return 'Đồ uống';
      case 'Spa': return 'Spa & Trị liệu';
      case 'Laundry': return 'Giặt là';
      case 'Transport': return 'Vận chuyển / Thuê xe';
      default: return category;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sUnit.trim()) return;

    const newService: ServiceItem = {
      id: generateId('S'),
      name: sName,
      category: sCategory,
      price: Number(sPrice),
      unit: sUnit
    };

    onAddService(newService);
    setIsAddOpen(false);

    // reset fields
    setSName('');
    setSCategory('Food');
    setSPrice(50000);
    setSUnit('Lượt');
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setTargetService(s);
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetService || !targetService.name.trim()) return;

    onUpdateService(targetService);
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có đồng ý xóa dịch vụ bổ sung ${id} khỏi danh mục?`)) {
      onDeleteService(id);
    }
  };

  // Stats: count how many times services were ordered
  const getOrderCount = (serviceId: string) => {
    return serviceOrders
      .filter(o => o.serviceId === serviceId)
      .reduce((sum, o) => sum + o.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Filtering, Search & Creation Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ ăn uống, spa..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 bg-gray-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            {['All', 'Food', 'Drinks', 'Spa', 'Laundry', 'Transport'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-white text-red-600 font-bold shadow-2xs' 
                    : 'hover:text-gray-900'
                }`}
              >
                {cat === 'All' ? 'Tất cả' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm dịch vụ mới
        </button>
      </div>

      {/* Services Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.map(s => {
          const timesServed = getOrderCount(s.id);
          const revenueEarned = timesServed * s.price;

          return (
            <motion.div
              layout
              key={s.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs hover:border-red-200 transition-all cursor-default relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-red-50 rounded-xl">
                    {getCategoryIcon(s.category)}
                  </div>
                  <div className="flex flex-col items-end text-xs font-semibold">
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-200 font-mono">CODE: {s.id}</span>
                    <span className="text-red-500 mt-1 uppercase text-[10px] tracking-wider">{getCategoryLabel(s.category)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-base leading-snug">{s.name}</h3>
                  <div className="text-sm font-semibold text-red-600 font-mono flex items-baseline gap-1">
                    <span className="text-lg font-bold">{formatVND(s.price)}</span>
                    <span className="text-gray-400 text-xs font-normal">/ {s.unit}</span>
                  </div>
                </div>
              </div>

              {/* Service Statistics mini indicators */}
              <div className="border-t border-gray-50/50 pt-3 mt-4 flex items-center justify-between text-xs text-gray-500 font-semibold bg-gray-50/30 p-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                  Đã chu cấp: <span className="text-gray-800 font-bold font-mono">{timesServed}</span>
                </div>
                {timesServed > 0 && (
                  <div className="text-emerald-700">
                    Thu về: <span className="font-bold font-mono">{formatVND(revenueEarned)}</span>
                  </div>
                )}
              </div>

              {/* Editing Controls */}
              <div className="flex gap-1.5 border-t border-gray-100 pt-3 mt-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(s)}
                  className="flex-1 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-red-500" />
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="px-2.5 py-1.5 border border-red-50 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                  title="Xóa món"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white border border-gray-100 rounded-2xl font-semibold">
            Không tìm thấy món ăn hay dịch vụ nào trong danh mục.
          </div>
        )}
      </div>

      {/* Add New Service Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <span className="font-semibold text-red-900 text-base font-display">Tạo dịch vụ bổ sung mới</span>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tên dịch vụ sản phẩm</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Phở bò, Massage trị liệu, Combo giặt sấy..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phân loại dịch vụ</label>
                    <select
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm bg-white"
                      value={sCategory}
                      onChange={(e) => setSCategory(e.target.value as any)}
                    >
                      <option value="Food">🍔 Đồ ăn</option>
                      <option value="Drinks">🍹 Nước uống</option>
                      <option value="Spa">💆 Spa - Làm đẹp</option>
                      <option value="Laundry">🧺 Giặt ủi</option>
                      <option value="Transport">🚗 Đón sân bay / Xe máy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Đơn vị tính</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Lượt, Tô, Ly, Kg..."
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                      value={sUnit}
                      onChange={(e) => setSUnit(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Đơn giá bán (VND)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-mono text-sm"
                    value={sPrice}
                    onChange={(e) => setSPrice(Number(e.target.value))}
                  />
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
                    Tạo dịch vụ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Service Modal */}
      <AnimatePresence>
        {isEditOpen && targetService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-red-50 p-4 border-b border-red-150 flex justify-between items-center">
                <span className="font-semibold text-red-900 text-base font-display">Sửa thông tin dịch vụ</span>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="text-red-500 hover:text-red-800 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tên sản phẩm dịch vụ</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                    value={targetService.name}
                    onChange={(e) => setTargetService({ ...targetService, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phân loại dịch vụ</label>
                    <select
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm bg-white"
                      value={targetService.category}
                      onChange={(e) => setTargetService({ ...targetService, category: e.target.value as any })}
                    >
                      <option value="Food">🍔 Đồ ăn</option>
                      <option value="Drinks">🍹 Nước uống</option>
                      <option value="Spa">💆 Spa - Làm đẹp</option>
                      <option value="Laundry">🧺 Giặt ủi</option>
                      <option value="Transport">🚗 Đón sân bay / Xe máy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Đơn vị tính</label>
                    <input
                      type="text"
                      required
                      placeholder="Lượt..."
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                      value={targetService.unit}
                      onChange={(e) => setTargetService({ ...targetService, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Đơn giá bán (VND)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-mono text-sm"
                    value={targetService.price}
                    onChange={(e) => setTargetService({ ...targetService, price: Number(e.target.value) })}
                  />
                </div>

                <div className="flex gap-3 pt-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
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
