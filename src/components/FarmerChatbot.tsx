import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Mic, MicOff, X, Trash2, Bot, User, CornerDownLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './chat.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const FarmerChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I am your KisanSaarthi assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en-IN' | 'hi-IN' | 'mr-IN'>('en-IN');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      synth.speak(utterance);
    }
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      speak(data.reply);

      // Handle Navigation Commands
      const cmd = text.toLowerCase();
      if (cmd.includes('dashboard') || cmd.includes('home')) {
        setTimeout(() => navigate('/farmer/dashboard'), 1500);
      } else if (cmd.includes('hub') || cmd.includes('nearby')) {
        setTimeout(() => navigate('/farmer/book-slot'), 1500);
      } else if (cmd.includes('queue') || cmd.includes('waiting') || cmd.includes('line')) {
        // Assume queue status is part of dashboard or a specific route
        setTimeout(() => navigate('/farmer/dashboard'), 1500);
      } else if (cmd.includes('booking') || cmd.includes('book') || cmd.includes('slot')) {
        setTimeout(() => navigate('/farmer/book-slot'), 1500);
      }
    } catch (error) {
      setIsTyping(false);
      console.error('Chat error:', error);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const clearChat = () => {
    setMessages([
      { id: '1', text: "Chat cleared. How can I help you now?", sender: 'bot', timestamp: new Date() }
    ]);
  };

  if (!window.location.pathname.startsWith('/farmer') && window.location.pathname !== '/') return null;

  return (
    <div className="chat-container">
      {!isOpen ? (
        <button className="chat-bubble" onClick={() => setIsOpen(true)}>
          <MessageSquare size={28} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            1
          </span>
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Kisan Saarthi AI</h3>
                <p className="text-[10px] opacity-80">Online & Ready to Help</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Clear Chat">
                <Trash2 size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
                <div className="text-[9px] opacity-50 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <div className="quick-suggestions">
              <button onClick={() => handleSend("Book Slot")} className="suggestion-btn">📅 Book Slot</button>
              <button onClick={() => handleSend("Check Queue")} className="suggestion-btn">📊 Check Queue</button>
              <button onClick={() => handleSend("Nearby Hubs")} className="suggestion-btn">📍 Nearby Hubs</button>
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={toggleListening} 
                className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-primary'}`}
              >
                {isListening ? <Mic size={20} /> : <Mic size={20} />}
              </button>
              <button onClick={() => handleSend()} className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                <Send size={20} />
              </button>
            </div>

            <div className="chat-lang-selector">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-auto flex items-center gap-1">
                <Sparkles size={10} className="text-primary" /> Assistant Language:
              </span>
              <button onClick={() => setLanguage('en-IN')} className={`lang-tab ${language === 'en-IN' ? 'active' : ''}`}>EN</button>
              <button onClick={() => setLanguage('hi-IN')} className={`lang-tab ${language === 'hi-IN' ? 'active' : ''}`}>HI</button>
              <button onClick={() => setLanguage('mr-IN')} className={`lang-tab ${language === 'mr-IN' ? 'active' : ''}`}>MR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerChatbot;
