import React, { useState, useRef, useEffect } from 'react';
import useNotificationStore from '../../stores/notificationStore';
import { Bot, BarChart3, Clock, Map, AlertTriangle, CloudRain, CreditCard, Mic, Send } from 'lucide-react';

interface SpeechRecognition extends EventTarget {
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    SpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  time: string;
  suggestions?: string[];
  quickReplies?: string[];
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      type: 'ai', 
      text: "👋 Hello! I'm your AI travel assistant. I can help with routes, fares, delays, and more. How can I assist you today?", 
      time: 'Just now',
      suggestions: ['Check traffic', 'Find route', 'Fare info', 'Report issue'],
      quickReplies: undefined
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const chatRef = useRef(null);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const responses = {
    traffic: {
      text: '🚦 **Traffic Update**\n\n• Umuahia-Aba: Moderate (25 min)\n• Aba-PH: Heavy (45 min)\n• Umuahia-Ohafia: Light (30 min)',
      quickReplies: ['Delays?', 'Accidents?', 'Best time?']
    },
    fare: {
      text: '💰 **Fare Information**\n\n• Standard Bus: ₦150\n• Premium Bus: ₦250 (AC)\n• Express: ₦350\n• Student Discount: 20% off',
      quickReplies: ['Student discount', 'Monthly pass', 'Group fare']
    },
    peak: {
      text: '⏰ **Peak Hours**\n\n• Morning: 7:00 - 9:00 AM\n• Evening: 4:00 - 7:00 PM\n• Weekend: 10:00 AM - 2:00 PM',
      quickReplies: ['Weekend schedule', 'Night buses', 'Holidays']
    },
    route: {
      text: '🗺️ **Best Route to Aba**\n\n• Fastest: Umuahia-Aba Express (25 min)\n• Cheapest: Local route (35 min, ₦150)\n• Scenic: Via Bende (45 min)',
      quickReplies: ['Show on map', 'Stops', 'Schedule']
    },
    delay: {
      text: '⚠️ **Active Delays**\n\n• Osisioma to Park: +10 min (Construction)\n• Aba Terminal: +5 min (High traffic)',
      quickReplies: ['Other routes', 'Alternative', 'ETA']
    },
    weather: {
      text: '☁️ **Weather Forecast**\n\n• Now: 28°C, Partly cloudy\n• 6 PM: Light rain expected\n• Tomorrow: 26°C, Sunny',
      quickReplies: ['Umbrella needed?', 'Weekend forecast']
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now(),
      type: 'user',
      text: input,
      time: 'Just now'
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);

    // Simulate AI response with typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      let response = {
        text: "I can help with routes, fares, delays, and schedules. What would you like to know?",
        quickReplies: ['Traffic', 'Fares', 'Routes', 'Delays']
      };
      
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('traffic')) response = responses.traffic;
      else if (lowerInput.includes('fare') || lowerInput.includes('cost')) response = responses.fare;
      else if (lowerInput.includes('peak') || lowerInput.includes('busy')) response = responses.peak;
      else if (lowerInput.includes('route') || lowerInput.includes('way')) response = responses.route;
      else if (lowerInput.includes('delay')) response = responses.delay;
      else if (lowerInput.includes('weather') || lowerInput.includes('rain')) response = responses.weather;

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        text: response.text,
        time: 'Just now',
        quickReplies: response.quickReplies
      }]);
    }, 1500);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      showNotification('Voice Input', 'Voice input not supported in this browser');
      return;
    }

    setVoiceMode(true);
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setVoiceMode(false);
      setTimeout(() => handleSend(), 500);
    };

    recognition.onerror = () => {
      setVoiceMode(false);
      showNotification('Voice Input', 'Voice input failed, please try again');
    };
  };

  const quickActions = [
    { icon: 'bar-chart-3', label: 'Traffic', action: 'traffic', color: 'blue' },
    { icon: 'clock', label: 'Peak Hours', action: 'peak', color: 'yellow' },
    { icon: 'map', label: 'Best Route', action: 'route', color: 'green' },
    { icon: 'alert-triangle', label: 'Delays', action: 'delay', color: 'red' },
    { icon: 'cloud-rain', label: 'Weather', action: 'weather', color: 'purple' },
    { icon: 'credit-card', label: 'Fares', action: 'fare', color: 'pink' },
  ];

  return (
    <div className="ai-assistant glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Travel Assistant</h3>
          <p className="text-xs text-gray-400">Online • Ready to help</p>
        </div>
        <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Active
        </span>
      </div>
      
      <div 
        ref={chatRef}
        className="space-y-4 mb-4 max-h-64 overflow-y-auto custom-scrollbar pr-2"
      >
        {messages.map(msg => (
          <div key={msg.id}>
            <div className={msg.type === 'ai' ? 'ai-message' : 'user-message'}>
              <p className="text-sm whitespace-pre-line">{msg.text}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-gray-500">{msg.time}</span>
                {msg.type === 'ai' && (
                  <button className="text-[10px] text-primary hover:text-primary-light">
                    Copy
                  </button>
                )}
              </div>
            </div>
            {msg.quickReplies && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msg.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    className="text-xs bg-white/5 hover:bg-primary/20 px-3 py-1 rounded-full transition"
                    onClick={() => {
                      setInput(reply);
                      setTimeout(() => handleSend(), 100);
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
        {quickActions.map(({ icon, label, action, color }) => {
          const c = color === 'green' ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400' :
                    color === 'blue' ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' :
                    color === 'yellow' ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400' :
                    color === 'purple' ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' :
                    color === 'red' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' :
                    'bg-green-500/10 hover:bg-green-500/20 text-green-400';
          const iconC = color === 'green' ? 'text-green-400' :
                        color === 'blue' ? 'text-blue-400' :
                        color === 'yellow' ? 'text-yellow-400' :
                        color === 'purple' ? 'text-purple-400' :
                        color === 'red' ? 'text-red-400' :
                        'text-green-400';
          return (
          <button
            key={action}
            className={`text-xs ${c} p-2 rounded-lg transition flex flex-col items-center gap-1 group`}
            onClick={() => {
              setInput(`Tell me about ${label.toLowerCase()}`);
              setTimeout(() => handleSend(), 100);
            }}
          >
            {{
              'bar-chart-3': <BarChart3 className={`w-4 h-5 ${iconC} group-hover:scale-110 transition`} />,
              'clock': <Clock className={`w-4 h-5 ${iconC} group-hover:scale-110 transition`} />,
              'map': <Map className={`w-4 h-5 ${iconC} group-hover:scale-110 transition`} />,
              'alert-triangle': <AlertTriangle className={`w-4 h-5 ${iconC} group-hover:scale-110 transition`} />,
              'cloud-rain': <CloudRain className={`w-4 h-5 ${iconC} group-hover:scale-110 transition`} />,
              'credit-card': <CreditCard className={`w-4 h-5 ${iconC} group-hover:scale-110 transition`} />,
            }[icon]}
            <span className="text-[10px]">{label}</span>
          </button>
          );
        })}
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary"
          />
          <button
            className={`absolute right-2 top-2 p-1.5 rounded-lg transition ${
              voiceMode ? 'bg-primary text-white animate-pulse' : 'hover:bg-white/10'
            }`}
            onClick={handleVoiceInput}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <button
          className="btn-primary px-4 py-2 rounded-lg"
          onClick={handleSend}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div 
          className="ai-insight p-3 text-xs cursor-pointer hover:scale-[1.02] transition flex items-center gap-2"
          onClick={() => {
            setInput('Are there any delays?');
            setTimeout(() => handleSend(), 100);
          }}
        >
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <div>
            <span className="text-gray-300 font-medium">Delay Alert</span>
            <p className="text-gray-400">Osisioma to Park +10min</p>
          </div>
        </div>
        <div 
          className="ai-insight p-3 text-xs cursor-pointer hover:scale-[1.02] transition flex items-center gap-2"
          onClick={() => {
            setInput("What's the weather like?");
            setTimeout(() => handleSend(), 100);
          }}
        >
          <CloudRain className="w-4 h-4 text-blue-400" />
          <div>
            <span className="text-gray-300 font-medium">Weather</span>
            <p className="text-gray-400">Light rain at 6 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;