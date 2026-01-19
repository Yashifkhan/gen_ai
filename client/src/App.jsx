import React, { useState } from 'react';
import axios from 'axios';
import { Send, Moon, Sun, Sparkles } from 'lucide-react';

const chatSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);


  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      nodeId: chatSessionId,
      text: inputMessage,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:8000/api/v1/emo-chat',
        { message: userMsg.text, nodeId: userMsg.nodeId },
      );

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: res.data.data,
          sender: 'ai',
        },
      ]);
      setIsLoading(false)
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          text: 'AI response failed.',
          sender: 'ai',
        },
      ]);
    }
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={
        isDarkMode
          ? {
            background:
              'linear-gradient(135deg, #0b0206 0%, #4a0f2a 45%, #8b0f3a 100%)',
            color: '#ffffff',
          }
          : { background: '#f1f5f9' }
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h1 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Emo AI
        </h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun className="text-white" /> : <Moon />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg?.id}
            className={`flex ${msg?.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="px-4 py-2 rounded-xl max-w-[75%] text-sm"
              style={
                msg?.sender === 'user'
                  ? {
                    background:
                      'linear-gradient(135deg, #8b0f3a, #c2185b)',
                    color: '#ffffff',
                  }
                  : isDarkMode
                    ? {
                      background: 'rgba(0,0,0,0.35)',
                      color: '#ffffff',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
                    : {
                      background: '#ffffff',
                      color: '#1e293b',
                      border: '1px solid #e5e7eb',
                    }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
     {isLoading && (
          <div className="flex justify-start">
            <div
              className={`relative px-5 py-2 rounded-2xl text-sm flex items-center gap-3
                ${isDarkMode
                  ? 'bg-black/40 text-white border border-white/20 shadow-lg shadow-blue-500/10'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-lg'
                }`}
            >

<style>
{`
@keyframes dotBounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-4px); /* 👈 increase height here */
    opacity: 1;
  }
}
`}
</style>
              <span className="font-medium">AI is thinking</span>
            {/* <div className="flex gap-1 relative z-10">
  <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite] [animation-delay:0ms]" />
  <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite] [animation-delay:150ms]" />
  <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite] [animation-delay:300ms]" />
</div> */}
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />


            </div>
          </div>
        )}


      {/* Input */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <textarea
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 resize-none px-3 py-2 rounded-lg outline-none"
          style={
            isDarkMode
              ? {
                background: 'rgba(0,0,0,0.35)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.12)',
              }
              : {
                background: '#ffffff',
                border: '1px solid #e5e7eb',
              }
          }
        />

        <button
          onClick={handleSendMessage}
          className="px-4 py-2 rounded-lg text-white"
          style={{
            background: 'linear-gradient(135deg, #8b0f3a, #c2185b)',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
