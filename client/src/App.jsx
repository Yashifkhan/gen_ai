import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Menu, X, Sun, Moon, Copy, Check, MessageSquare, Zap, Brain, Heart, Plus } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      // id: 1,
      text: "What are you working on",
      // sender: 'ai',
      // timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const conversations = [
    { id: 1, title: 'General Questions', date: 'Today', messageCount: 12 },
    { id: 2, title: 'Coding Help', date: 'Yesterday', messageCount: 8 },
    { id: 3, title: 'Creative Writing', date: '2 days ago', messageCount: 15 },
  ];

  const quickPrompts = [
    { icon: Brain, text: 'Explain quantum computing' },
    { icon: Zap, text: 'Write a Python function' },
    { icon: Heart, text: 'Give me life advice' },
    { icon: MessageSquare, text: 'Tell me a joke' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const generateAIResponse = async (userMessage) => {
    const responses = [
      "That's a great question! Let me help you with that. Based on what you've asked, here's what I think...",
      "I understand what you're looking for. Here's a detailed explanation that should help...",
      "Interesting! Let me break this down for you in a clear and helpful way...",
      "I'd be happy to assist with that! Here's my analysis of your question...",
      "Great point! Let me provide you with some insights on this topic..."
    ];

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const context = userMessage.toLowerCase().includes('code') 
      ? "\n\nHere's a solution:\n```javascript\nfunction example() {\n  return 'Hello World';\n}\n```"
      : userMessage.toLowerCase().includes('explain')
      ? "\n\nIn simple terms: This is a complex topic that involves multiple factors. The key points to understand are the fundamental concepts and how they interconnect."
      : "";
    
    return randomResponse + context;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const aiResponse = await generateAIResponse(inputMessage);

    setIsTyping(false);
    const aiMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hi! I'm Emo AI, your intelligent assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }
    ]);
    setIsSidebarOpen(false);
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} font-sans antialiased transition-colors duration-300 overflow-hidden`}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'} transform transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} flex flex-col`}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'}`}>
                Emo AI
              </h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className={`p-2 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-colors`}
            >
              <X className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
            </button>
          </div>

          <button 
            onClick={handleClearChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'} rounded-lg font-medium transition-all shadow-md text-sm`}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-2 px-2`}>
            Recent Chats
          </h3>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'} truncate pr-2`}>{conv.title}</h4>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex-shrink-0`}>{conv.messageCount}</span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{conv.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={`p-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} space-y-2`}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium text-sm">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          <button
            onClick={handleClearChat}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium text-sm">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Compact Header */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/90 backdrop-blur-md border-slate-200'} border-b px-3 py-3 shadow-sm flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-colors active:scale-95`}
              >
                <Menu className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              </button>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>
                <div>
                  <h2 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Emo AI</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'} flex items-center gap-1`}>
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Quick Prompts - Show when chat is empty */}
            {messages.length === 1 && (
              <div className="mb-6">
                <h3 className={`text-center text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  How can I help you?
                </h3>
                <p className={`text-center mb-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Try one of these prompts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuickPrompt(prompt.text)}
                        className={`p-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'} rounded-xl border transition-all active:scale-95 text-left flex items-center justify-start gap-3`}
                      >
                        <div className={`w-8 h-8 mt-1 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-2`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className={`font-medium text-xs leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{prompt.text}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`flex-1 ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`inline-block max-w-[85%]`}>
                    <div className={`rounded-2xl px-3 py-2 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-tr-md'
                        : isDarkMode 
                        ? 'bg-slate-800 text-slate-100 rounded-tl-md border border-slate-700'
                        : 'bg-white text-slate-800 rounded-tl-md border border-slate-200'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {message.timestamp}
                      </span>
                      {message.sender === 'ai' && (
                        <button
                          onClick={() => handleCopyMessage(message.text, message.id)}
                          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95`}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md flex-shrink-0 text-xs">
                    You
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className={`rounded-2xl px-3 py-2 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} rounded-tl-md shadow-sm`}>
                  <div className="flex gap-1">
                    <span className={`w-2 h-2 ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></span>
                    <span className={`w-2 h-2 ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></span>
                    <span className={`w-2 h-2 ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Compact Input Area */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/90 backdrop-blur-md border-slate-200'} border-t p-3 shadow-lg flex-shrink-0`}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                      e.target.style.height = 'auto';
                    }
                  }}
                  placeholder="Ask Emo AI anything..."
                  rows="1"
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm`}
                  style={{ maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} text-center mt-2`}>
              Emo AI can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}