import React, { useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeModal = ({ isOpen, onClose }) => {
  const qrRef = useRef(null);

  useEffect(() => {
    if (isOpen && qrRef.current) {
      // QR code will be rendered automatically by QRCodeCanvas
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'abia-one-qr.png';
      link.href = url;
      link.click();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Abia Way QR Code',
        text: 'Scan this QR code to pay for your ride',
        url: window.location.href
      }).catch(() => alert('Share cancelled'));
    } else {
      alert('Share not supported on this device');
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="modal-overlay absolute inset-0" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Your QR Code</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <i data-lucide="x" className="w-6 h-6"></i>
            </button>
          </div>
          
          <div className="mb-6 flex justify-center">
            <div className="qr-container bg-white p-4 rounded-xl">
              <QRCodeCanvas 
                value="ABIA-WAY-2026-ABUOMA-DAVID"
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#16a34a"
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mb-4 text-center">
            Show this code to scan at terminals
          </p>
          
          <div className="flex gap-4 justify-center">
            <button 
              className="btn-secondary px-6 py-3 rounded-lg flex items-center gap-2"
              onClick={handleDownload}
            >
              <i data-lucide="download" className="w-4 h-4"></i>
              Download
            </button>
            <button 
              className="btn-secondary px-6 py-3 rounded-lg flex items-center gap-2"
              onClick={handleShare}
            >
              <i data-lucide="share" className="w-4 h-4"></i>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;