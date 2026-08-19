import React, { useState } from 'react';
import AIAssistant from './AIAssistant';
import { Bot, X } from 'lucide-react';

const AIChatFab = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed z-50 inset-x-3 sm:inset-x-auto sm:right-4 bottom-24 lg:bottom-24 sm:w-[400px]">
          <div className="max-h-[calc(100vh-8.5rem)] overflow-y-auto custom-scrollbar rounded-2xl">
            <AIAssistant onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI assistant"
        title="AI Travel Assistant"
        className={`fixed z-50 bottom-20 lg:bottom-6 right-4 flex items-center gap-2 h-12 pl-4 rounded-full shadow-lg pressable transition ${
          open ? 'bg-white/10 border border-white/20 text-white' : 'bg-primary hover:bg-primary-dark text-white'
        }`}
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        <span className="hidden sm:inline text-sm font-semibold pr-1">AI Assistant</span>
      </button>
    </>
  );
};

export default AIChatFab;