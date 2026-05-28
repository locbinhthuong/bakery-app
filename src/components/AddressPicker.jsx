import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Search, Check, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue (only if not already fixed globally, doing it here is safe)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setAddress }) {
  const markerRef = useRef(null);

  const updatePosition = async (latlng) => {
    setPosition(latlng);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
      if (res.data && res.data.display_name && setAddress) {
        setAddress(res.data.display_name);
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
    [setPosition, setAddress],
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
    if (center && center.lat) {
      map.flyTo(center, 16);
    }
  }, [center, map]);
  return null;
}

export default function AddressPicker({ 
  address, 
  setAddress, 
  location, 
  setLocation,
  defaultCenter = [10.810583, 106.709145], // Default HCMC if no settings
  placeholder = "Địa chỉ giao hàng",
  required = true
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=vn&limit=5`);
        const data = res.data || [];
        setSuggestions(data);
        if (data.length > 0) {
          // Gợi ý đồng thời định vị trên bản đồ luôn (Preview)
          setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 600); // Debounce 600ms
  };

  const handleSelectSuggestion = (sug) => {
    setAddress(sug.display_name);
    setLocation({ lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) });
    setSuggestions([]);
    // Keep expanded so user can verify on map
  };

  const handleGetCurrentLocation = (e) => {
    e.preventDefault(); // Prevent form submission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          // Will reverse geocode in LocationMarker
        },
        (err) => {
          alert('Không thể lấy vị trí hiện tại của bạn. Vui lòng kiểm tra quyền truy cập vị trí.');
          console.log('Lỗi định vị:', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Trình duyệt của bạn không hỗ trợ định vị.');
    }
  };

  return (
    <div className={`relative w-full flex flex-col bg-white rounded-xl transition-all ${isExpanded ? 'border border-brand-500 shadow-sm' : 'border border-stone-200'}`} ref={containerRef}>
      {/* Input Field */}
      <div className="relative flex items-center w-full">
        <input 
          type="text" 
          placeholder={placeholder} 
          required={required}
          className="w-full px-4 py-3 outline-none font-medium text-stone-800 bg-transparent"
          value={address} 
          onChange={handleInputChange}
          onFocus={() => setIsExpanded(true)}
          onClick={() => setIsExpanded(true)}
        />
        <button 
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 text-stone-400 hover:text-brand-600 transition-colors bg-transparent z-10"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Accordion Area (Inline) */}
      {isExpanded && (
        <div className="w-full flex flex-col border-t border-brand-100 overflow-hidden rounded-b-xl">
          
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="max-h-48 overflow-y-auto bg-white border-b border-stone-100">
              {suggestions.map((sug, i) => (
                <div 
                  key={i} 
                  className="px-4 py-3 text-sm border-b border-stone-50 cursor-pointer hover:bg-brand-50 flex items-start gap-3 text-stone-700 transition-colors"
                  onClick={() => handleSelectSuggestion(sug)}
                >
                  <MapPin size={18} className="mt-0.5 text-stone-400 shrink-0" />
                  <span className="line-clamp-2 leading-relaxed">{sug.display_name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Map Area */}
          <div className="h-[250px] w-full relative z-0">
            <MapContainer 
              center={(location && location.lat) ? [location.lat, location.lng] : defaultCenter} 
              zoom={15} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
              <MapUpdater center={location} />
              <LocationMarker 
                position={location} 
                setPosition={setLocation} 
                setAddress={setAddress}
              />
            </MapContainer>
            
            {/* Quick Actions overlay on map */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
              <button 
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-brand-600 hover:bg-brand-50 hover:scale-105 transition-all"
                title="Vị trí của tôi"
              >
                <Navigation size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="absolute top-3 left-3 right-16 z-[1000] pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-[11px] sm:text-xs font-medium text-stone-700 shadow-sm inline-block border border-stone-100">
                Kéo thả ghim để chọn chính xác điểm giao
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
