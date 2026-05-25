import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { X } from 'lucide-react';

export default function CropperModal({ imageUrl, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);
  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Cắt ảnh (Crop)</h3>
          <button onClick={onCancel} className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-stone-100"><X size={20}/></button>
        </div>
        <div className="relative w-full h-[60vh] bg-stone-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteInternal}
          />
        </div>
        <div className="p-4 border-t flex justify-between items-center bg-stone-50">
          <div className="text-sm font-medium text-stone-500">Kéo và thu phóng để chọn vùng ảnh</div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 bg-stone-200 font-bold rounded-lg hover:bg-stone-300">Huỷ bỏ</button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700">Cắt ảnh</button>
          </div>
        </div>
      </div>
    </div>
  );
}
