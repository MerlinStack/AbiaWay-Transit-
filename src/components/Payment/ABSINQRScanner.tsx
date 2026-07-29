import { memo } from 'react';

interface ABSINQRScannerProps {
  progress: number;
  onCancel: () => void;
}

const ABSINQRScanner = memo(({ progress, onCancel }: ABSINQRScannerProps) => (
  <div className="glass-card text-center p-8">
    <div className="mb-6">
      <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center flex-col">
        <div className="text-6xl">📷</div>
        <div className="text-xs text-gray-600 mt-2">Scan ABSIN QR Code</div>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-gray-400 text-sm">Position QR code within the frame</p>
      <button className="mt-6 px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition" onClick={onCancel}>
        Cancel
      </button>
    </div>
  </div>
));

export default ABSINQRScanner;
