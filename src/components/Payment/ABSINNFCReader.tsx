import { memo } from 'react';

interface ABSINNFCReaderProps {
  progress: number;
  onCancel: () => void;
}

const ABSINNFCReader = memo(({ progress, onCancel }: ABSINNFCReaderProps) => (
  <div className="glass-card text-center p-8">
    <div className="mb-6">
      <div className="w-32 h-32 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center text-5xl animate-pulse">📱</div>
      <h3 className="text-lg font-semibold mb-2">Place ABSIN Card Near Phone</h3>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-gray-400 text-sm">Waiting for NFC tag...</p>
      <button className="mt-6 px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition" onClick={onCancel}>
        Cancel
      </button>
    </div>
  </div>
));

export default ABSINNFCReader;
