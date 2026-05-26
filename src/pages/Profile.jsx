import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, Store, Star, UserCircle, MapPin, Info, LogOut, ChevronRight, Eye, EyeOff, X, FileText, Shield, Navigation, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setFormData }) {
  const markerRef = useRef(null);

  const updatePosition = async (latlng) => {
    setPosition(latlng);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
      if (res.data && res.data.display_name && setFormData) {
        setFormData(prev => ({...prev, address: res.data.display_name}));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const map = useMapEvents({
    click(e) {
      updatePosition(e.latlng);
    },
    locationfound(e) {
      updatePosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          updatePosition(marker.getLatLng());
        }
      },
    }),
    [setPosition, setFormData],
  );

  useEffect(() => {
    if (!position) map.locate();
  }, [map, position]);

  return position === null ? null : (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    ></Marker>
  );
}

function MapUpdater({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) map.flyTo(center, 15);
  }, [center, map]);
  return null;
}
const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function Profile() {
  const { customer, updateCustomer } = useOutletContext();
  const navigate = useNavigate();
  
  // Auth states (if not logged in)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ phone: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  
  // Map States
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn`);
      setSearchResults(res.data);
    } catch(err) {}
  };

  const handleOpenEdit = () => {
    setEditForm({ name: customer.name || '', phone: customer.phone || '', address: customer.address || '' });
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('bakery_token');
      const res = await axios.put(`${BACKEND_URL}/customer/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        localStorage.setItem('bakery_customer', JSON.stringify(res.data.data.customer));
        updateCustomer(res.data.data.customer);
        setShowEditModal(false);
        alert('Cập nhật thông tin thành công!');
      }
    } catch(err) {
       alert('Lỗi cập nhật thông tin: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const payload = isLoginMode ? { phone: authForm.phone, password: authForm.password } : authForm;
      const res = await axios.post(`${BACKEND_URL}${endpoint}`, payload);
      
      if (res.data.success) {
        localStorage.setItem('bakery_token', res.data.data.token);
        localStorage.setItem('bakery_customer', JSON.stringify(res.data.data.customer));
        updateCustomer(res.data.data.customer);
        
        // Request GPS silently without saving to DB per user request
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => console.log("GPS Location acquired:", pos.coords.latitude, pos.coords.longitude),
            (err) => console.log("GPS Permission denied/failed:", err)
          );
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bakery_token');
    localStorage.removeItem('bakery_customer');
    updateCustomer(null);
  };

  if (!customer) {
    return (
      <div className="pb-24 pt-12 px-4 bg-brand-50 min-h-screen flex flex-col justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 max-w-sm w-full mx-auto">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo_donut.jpg" alt="Logo" className="w-24 h-24 object-contain p-1 rounded-full shadow-md border-2 border-brand-100 bg-white mb-4" />
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2 text-center">
              {isLoginMode ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h2>
            <p className="text-stone-600 text-sm text-center">
              {isLoginMode ? 'Tham gia cùng MABAE - Tiệm Bánh Donut' : 'Đăng ký ngay để nhận ưu đãi từ MABAE'}
            </p>
          </div>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <input 
                  type="text" required placeholder="Họ và tên"
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium"
                  value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <input 
                type="tel" required placeholder="Số điện thoại"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium"
                value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})}
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} required placeholder="Mật khẩu"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium pr-12"
                value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-700 p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors shadow-md mt-2">
              {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium text-brand-800">
            {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-brand-600 font-bold hover:underline">
              {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-brand-50 min-h-screen">
      {/* Background Graphic */}
      <div className="h-40 bg-gradient-to-b from-brand-600/20 to-brand-50 rounded-b-[40px] absolute top-0 w-full z-0"></div>

      <div className="px-4 pt-12 relative z-10">
        {/* Membership Card */}
        <div className="w-full bg-gradient-to-br from-teal-50/90 via-blue-50/80 to-brand-200 rounded-3xl p-6 shadow-sm border border-white/50 backdrop-blur-sm mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">{customer.name}</h2>
              <div className="inline-flex items-center gap-1.5 bg-brand-500/20 px-3 py-1 rounded-full text-brand-800 font-bold text-sm border border-brand-200">
                <span>⭐</span> 0 điểm
              </div>
            </div>
            <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
              <QrCodeIcon />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-serif text-stone-800 mb-2">Thành Viên Mới</h3>
            <div className="w-full h-1 bg-brand-900/10 rounded-full mb-3">
              <div className="w-[10%] h-full bg-brand-500 rounded-full"></div>
            </div>
            <p className="text-stone-700 text-xs font-medium mb-1">Tích luỹ thêm để thăng hạng thẻ</p>
            <p className="text-brand-700 text-xs font-bold flex items-center">Tìm hiểu về quyền lợi thẻ <Info className="w-3 h-3 ml-1"/></p>
          </div>
        </div>

        {/* Tài khoản */}
        <div className="mb-8 mt-4">
          <h3 className="font-bold text-stone-900 text-lg mb-4 px-1">Tài khoản</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-100/50">
            <button onClick={handleOpenEdit} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <UserCircle size={22} className="text-brand-600"/>
                Chỉnh sửa thông tin
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <Link to="/orders" className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <Clock size={22} className="text-brand-600"/>
                Lịch sử đặt hàng
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </Link>
          </div>
        </div>

        {/* Khác */}
        <div className="mb-4">
          <h3 className="font-bold text-brand-900 text-lg mb-4 px-1">Khác</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-100/50">
            <button onClick={() => alert('Về chúng tôi đang được cập nhật!')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <Info size={22} className="text-brand-600"/>
                Về chúng tôi
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <button onClick={() => alert('Điều khoản sử dụng đang được cập nhật!')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <FileText size={22} className="text-brand-600"/>
                Điều khoản sử dụng
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <button onClick={() => alert('Chính sách bảo mật đang được cập nhật!')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <Shield size={22} className="text-brand-600"/>
                Chính sách bảo mật
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <LogOut size={22} className="text-brand-600"/>
                Đăng xuất
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-900">Thông tin cá nhân</h3>
              <button onClick={() => setShowEditModal(false)} className="text-stone-400 hover:text-stone-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1 ml-1">Họ và tên</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none font-medium focus:bg-white focus:border-brand-500 transition-colors"
                  value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1 ml-1">Số điện thoại</label>
                <input 
                  type="tel" required 
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none font-medium focus:bg-white focus:border-brand-500 transition-colors"
                  value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1 ml-1">Địa chỉ giao hàng mặc định</label>
                <textarea 
                  rows="2"
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none font-medium resize-none focus:bg-white focus:border-brand-500 transition-colors mb-2"
                  value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})}
                  placeholder="Nhập địa chỉ của bạn"
                ></textarea>
                <button type="button" onClick={() => {
                  setIsMapOpen(true);
                  if (navigator.geolocation && !customerLocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                      (err) => console.log('Lỗi định vị:', err),
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                  }
                }} className="w-full flex items-center gap-2 justify-center py-2.5 bg-stone-100 text-stone-700 font-bold rounded-xl border border-stone-200 hover:bg-stone-200 transition-colors text-sm">
                  <Navigation size={16} className="text-brand-600"/> 
                  {customerLocation ? 'Đã ghim vị trí trên bản đồ' : 'Ghim vị trí trên bản đồ'}
                </button>
              </div>
              <button type="submit" className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-md mt-4">
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsMapOpen(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-white">
               <h2 className="text-lg font-bold text-stone-900">Ghim Vị Trí</h2>
               <button onClick={() => setIsMapOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-800"><X size={18}/></button>
             </div>
             
             <div className="p-3 bg-stone-50 border-b border-stone-100">
               <form onSubmit={handleMapSearch} className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Tìm kiếm địa chỉ..." 
                   className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg outline-none focus:border-brand-500"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
                 <button type="submit" className="px-3 py-2 bg-brand-500 text-white rounded-lg flex items-center justify-center hover:bg-brand-600">
                   <Search size={16} />
                 </button>
               </form>
               {searchResults.length > 0 && (
                 <div className="absolute z-[1000] left-0 right-0 top-[110px] mx-4 max-h-48 overflow-y-auto bg-white border border-stone-200 shadow-xl rounded-lg">
                   {searchResults.map((res, i) => (
                     <div 
                       key={i} 
                       className="p-3 text-sm border-b border-stone-100 cursor-pointer hover:bg-brand-50"
                       onClick={() => {
                         const latlng = { lat: parseFloat(res.lat), lng: parseFloat(res.lon) };
                         setCustomerLocation(latlng);
                         setEditForm(prev => ({...prev, address: res.display_name}));
                         setSearchResults([]);
                         setSearchQuery('');
                       }}
                     >
                       {res.display_name}
                     </div>
                   ))}
                 </div>
               )}
             </div>

             <div className="p-2 bg-stone-50 text-[11px] text-stone-500 font-medium text-center">
               Bạn có thể tìm kiếm, chạm vào bản đồ hoặc kéo thả ghim để chọn chính xác điểm giao.
             </div>
             <div className="h-[50vh] w-full relative z-0">
                <MapContainer center={customerLocation || [21.0285, 105.8542]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                  <MapUpdater center={customerLocation} />
                  <LocationMarker 
                    position={customerLocation} 
                    setPosition={setCustomerLocation} 
                    setFormData={setEditForm}
                  />
                </MapContainer>
             </div>
             <div className="p-4 bg-white border-t border-stone-100">
               <button onClick={() => setIsMapOpen(false)} className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700">Xác nhận vị trí</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Just a simple visual mock for the tiny QR in the corner of the card
function QrCodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-800">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <path d="M7 7h.01"></path>
      <path d="M17 7h.01"></path>
      <path d="M7 17h.01"></path>
      <path d="M17 17h.01"></path>
    </svg>
  );
}
