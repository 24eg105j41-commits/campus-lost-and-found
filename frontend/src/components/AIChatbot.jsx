import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  Minimize2,
  Maximize2,
  ExternalLink,
  MapPin,
  Tag,
  RefreshCw,
} from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "👋 Hi! I'm your **Campus Lost & Found AI Assistant**.\n\nI can help you search the database for lost belongings, check recent found reports, guide you through filing a report, or answer campus office questions.",
      suggestedQuestions: [
        "Did anyone find a black water bottle?",
        "How do I submit an ownership claim?",
        "Where is the campus lost and found office?",
        "Show recent lost items",
      ],
      relatedItems: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await API.post('/ai/chatbot', {
        message: text,
        history,
      });

      if (res.data.success) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.data.reply,
          suggestedQuestions: res.data.suggestedQuestions || [],
          relatedItems: res.data.relatedItems || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(res.data.message || 'Failed to process message');
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I'm having trouble connecting to the campus database right now. Please ensure the backend server is running on port 5000.",
        suggestedQuestions: [
          "Where is the lost & found office?",
          "Browse lost items directory",
        ],
        relatedItems: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-campus-600 to-indigo-600 hover:from-campus-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-campus-600/30 hover:scale-105 transition-all duration-200"
          aria-label="Open Campus AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-tight pr-1">Campus AI</span>
          <span className="text-[10px] uppercase font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-full">
            Live
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-campus-600 via-campus-700 to-indigo-700 text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5 leading-none">
                  Campus AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h3>
                <p className="text-[11px] text-campus-100 mt-0.5">
                  Lost & Found Intelligence Desk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[88%] ${
                        msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          msg.sender === 'user'
                            ? 'bg-campus-600 text-white'
                            : 'bg-white border border-slate-200 text-campus-600 shadow-sm'
                        }`}
                      >
                        {msg.sender === 'user' ? (
                          <User className="w-3.5 h-3.5" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                          msg.sender === 'user'
                            ? 'bg-campus-600 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {msg.text}

                        {/* Interactive related items cards */}
                        {msg.relatedItems && msg.relatedItems.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Matched Listings:
                            </p>
                            {msg.relatedItems.map((item) => (
                              <Link
                                key={item._id}
                                to={`/items/${item._id}`}
                                onClick={() => setIsOpen(false)}
                                className="block p-2 rounded-xl bg-slate-50 hover:bg-campus-50 border border-slate-200 hover:border-campus-300 transition-all text-slate-800 group"
                              >
                                <div className="flex items-center justify-between text-[11px] mb-0.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                                      item.type === 'lost'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {item.type}
                                  </span>
                                  <span className="text-slate-400 font-medium">
                                    {item.category}
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-slate-900 group-hover:text-campus-600 flex items-center justify-between">
                                  <span className="truncate">{item.itemName}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                                </h4>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.location}</span>
                                </p>
                              </Link>
                            ))}
                          </div>
                        )}

                        <span
                          className={`block text-[10px] mt-1 text-right ${
                            msg.sender === 'user'
                              ? 'text-campus-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Suggested follow-up questions */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9 max-w-[85%]">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            disabled={loading}
                            className="text-[11px] bg-white hover:bg-campus-50 border border-slate-200 hover:border-campus-300 text-slate-700 hover:text-campus-700 px-2.5 py-1 rounded-full transition-colors shadow-2xs text-left"
                          >
                            💬 {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 ml-9 bg-white border border-slate-200 px-3 py-2 rounded-2xl w-fit shadow-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-campus-600" />
                    <span>Searching campus database & matching...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input section */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about lost items, office hours, claiming..."
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="p-2.5 bg-campus-600 hover:bg-campus-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-center text-slate-400 mt-1.5">
                  AI answers queries using actual campus lost & found records.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
