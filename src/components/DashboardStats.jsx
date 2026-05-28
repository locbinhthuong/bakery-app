import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, ShoppingBag, XCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

export default function DashboardStats({ orders = [] }) {
  const [timeframe, setTimeframe] = useState('day'); // 'day', 'week', 'month', 'year'
  const [offset, setOffset] = useState(0); // 0 = current, 1 = previous, etc.

  // Date manipulation helpers
  const getPeriodRange = (tf, off) => {
    const now = new Date();
    let start, end, label;

    if (tf === 'day') {
      const d = new Date(now);
      d.setDate(d.getDate() - off);
      start = new Date(d.setHours(0, 0, 0, 0));
      end = new Date(d.setHours(23, 59, 59, 999));
      label = off === 0 ? 'Hôm nay' : off === 1 ? 'Hôm qua' : d.toLocaleDateString('vi-VN');
    } else if (tf === 'week') {
      const d = new Date(now);
      const day = d.getDay() || 7; 
      d.setDate(d.getDate() - day + 1 - (off * 7));
      start = new Date(d.setHours(0, 0, 0, 0));
      const e = new Date(start);
      e.setDate(e.getDate() + 6);
      end = new Date(e.setHours(23, 59, 59, 999));
      label = `Tuần ${start.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})} - ${end.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}`;
    } else if (tf === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth() - off, 1);
      start = new Date(d);
      end = new Date(now.getFullYear(), now.getMonth() - off + 1, 0, 23, 59, 59, 999);
      label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    } else if (tf === 'year') {
      const y = now.getFullYear() - off;
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
      label = `Năm ${y}`;
    }

    return { start, end, label };
  };

  const { start, end, label } = getPeriodRange(timeframe, offset);

  const periodOrders = useMemo(() => {
    return (orders || []).filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, start, end]);

  const stats = useMemo(() => {
    const successful = periodOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');
    const cancelled = periodOrders.filter(o => o.status === 'CANCELLED');
    return {
      totalRevenue: successful.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      totalOrders: periodOrders.length,
      successOrders: successful.length,
      cancelledOrders: cancelled.length,
    };
  }, [periodOrders]);

  const chartData = useMemo(() => {
    const dataMap = new Map();
    const successful = periodOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');

    if (timeframe === 'day') {
      for (let i = 0; i < 24; i++) dataMap.set(i, { name: `${i}h`, revenue: 0, orders: 0 });
      successful.forEach(o => {
        const hour = new Date(o.createdAt).getHours();
        dataMap.get(hour).revenue += o.totalAmount;
        dataMap.get(hour).orders += 1;
      });
    } else if (timeframe === 'week') {
      const days = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];
      days.forEach(d => dataMap.set(d, { name: d, revenue: 0, orders: 0 }));
      successful.forEach(o => {
        let d = new Date(o.createdAt).getDay();
        d = d === 0 ? 6 : d - 1;
        dataMap.get(days[d]).revenue += o.totalAmount;
        dataMap.get(days[d]).orders += 1;
      });
    } else if (timeframe === 'month') {
      const numDays = end.getDate();
      for (let i = 1; i <= numDays; i++) dataMap.set(i, { name: `${i}`, revenue: 0, orders: 0 });
      successful.forEach(o => {
        const date = new Date(o.createdAt).getDate();
        dataMap.get(date).revenue += o.totalAmount;
        dataMap.get(date).orders += 1;
      });
    } else if (timeframe === 'year') {
      const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      months.forEach(m => dataMap.set(m, { name: m, revenue: 0, orders: 0 }));
      successful.forEach(o => {
        const month = new Date(o.createdAt).getMonth();
        dataMap.get(months[month]).revenue += o.totalAmount;
        dataMap.get(months[month]).orders += 1;
      });
    }
    return Array.from(dataMap.values());
  }, [periodOrders, timeframe, end]);

  const data = {
    labels: chartData.map(d => d.name),
    datasets: [
      {
        type: 'line',
        label: 'Số đơn',
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        borderWidth: 3,
        pointRadius: 4,
        yAxisID: 'y1',
        data: chartData.map(d => d.orders),
      },
      {
        type: 'bar',
        label: 'Doanh thu (₫)',
        backgroundColor: '#d946ef',
        borderRadius: 4,
        yAxisID: 'y',
        data: chartData.map(d => d.revenue),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { borderDash: [3, 3] },
        ticks: {
          callback: function(value) {
            return value > 0 ? (value / 1000) + 'k' : 0;
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { display: false },
        ticks: { precision: 0 }
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 md:p-6 mb-8 mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-stone-900 font-serif flex items-center gap-2">
          <TrendingUp className="text-brand-600" /> Thống kê doanh thu
        </h2>
        
        <div className="flex items-center gap-4 bg-stone-50 p-1 rounded-xl w-full md:w-auto">
          <select 
            value={timeframe} 
            onChange={(e) => { setTimeframe(e.target.value); setOffset(0); }}
            className="bg-white border border-stone-200 text-sm font-bold rounded-lg px-3 py-1.5 outline-none flex-1 md:flex-none"
          >
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
            <option value="year">Năm</option>
          </select>

          <div className="flex items-center justify-between md:justify-center gap-2 bg-white border border-stone-200 rounded-lg px-2 py-1 flex-1 md:flex-none">
            <button onClick={() => setOffset(prev => prev + 1)} className="p-1 hover:bg-stone-100 rounded text-stone-600"><ChevronLeft size={16}/></button>
            <span className="text-sm font-bold min-w-[100px] text-center">{label}</span>
            <button onClick={() => setOffset(prev => Math.max(0, prev - 1))} disabled={offset === 0} className={`p-1 rounded ${offset === 0 ? 'text-stone-300' : 'hover:bg-stone-100 text-stone-600'}`}><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
          <div className="flex items-center gap-2 text-brand-600 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Doanh thu</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-brand-900">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <ShoppingBag size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Đơn</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-900">{stats.totalOrders}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <ShoppingBag size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Thành Công</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-900">{stats.successOrders}</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Đã Hủy</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-red-900">{stats.cancelledOrders}</div>
        </div>
      </div>

      <div className="h-[300px] w-full relative">
        <Chart type='bar' data={data} options={options} />
      </div>
    </div>
  );
}
