import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X } from 'lucide-react';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function CropperModal({ imageUrl, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) {
        onCancel();
        return;
    }
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );
    
    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Cắt ảnh (Crop)</h3>
          <button onClick={onCancel} className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-stone-100"><X size={20}/></button>
        </div>
        <div className="relative w-full h-[60vh] bg-stone-900 flex justify-center items-center overflow-auto p-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={16 / 9}
          >
            <img ref={imgRef} src={imageUrl} onLoad={onImageLoad} style={{ maxHeight: '50vh' }} />
          </ReactCrop>
        </div>
        <div className="p-4 border-t bg-white">
          <div className="flex justify-between items-center">
            <div className="text-xs font-medium text-stone-500">Kéo các góc sáng để thu phóng hoặc di chuyển vùng cắt</div>
            <div className="flex gap-2">
              <button onClick={onCancel} className="px-4 py-2 bg-stone-200 font-bold rounded-lg hover:bg-stone-300">Huỷ bỏ</button>
              <button onClick={handleConfirm} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700">Cắt ảnh</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
