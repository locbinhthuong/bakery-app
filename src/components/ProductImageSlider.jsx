import { useState, useEffect, useRef } from 'react';
import { CakeSlice } from 'lucide-react';

export default function ProductImageSlider({ images, fallbackImage, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const isDragging = useRef(false);
  
  const allImages = (images && images.length > 0) ? images : (fallbackImage ? [fallbackImage] : []);

  useEffect(() => {
    if (allImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
      }, 3000); // 3 seconds per slide
      return () => clearInterval(timer);
    }
  }, [allImages.length]);

  if (allImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-brand-300 bg-brand-50">
        <CakeSlice size={24} />
      </div>
    );
  }

  const minSwipeDistance = 30;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      isDragging.current = true;
      if (isLeftSwipe) {
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
      }
      if (isRightSwipe) {
        setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      }
    }
  };

  const handleClick = (e) => {
    if (isDragging.current) {
      e.stopPropagation();
      e.preventDefault();
      isDragging.current = false;
    }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-stone-100"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClickCapture={handleClick}
    >
      {allImages.map((img, i) => (
        <div key={i} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={img} alt={`${productName} ${i}`} className="w-full h-full object-cover" />
        </div>
      ))}
      {/* Mini dots indicator for products */}
      {allImages.length > 1 && (
        <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
          {allImages.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
