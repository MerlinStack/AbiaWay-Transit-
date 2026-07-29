import { memo } from 'react';

interface ABSINProcessingProps {
  progress: number;
  step: number;
}

const stepMessages = {
  1: 'Verifying card with ABSIN...',
  2: 'Checking real-time balance...',
  3: 'Processing secure payment...',
};

const ABSINProcessing = memo(({ progress, step }: ABSINProcessingProps) => (
  <div className="glass-card text-center p-8">
    <div className="mb-6">
      <div className="text-6xl mb-4 animate-spin">🔄</div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-gray-400">{stepMessages[step] || 'Processing...'}</p>
      <p className="text-xs text-gray-500 mt-3">Please don't close this window</p>
    </div>
  </div>
));

export default ABSINProcessing;
