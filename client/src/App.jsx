import React, { useState } from 'react';
import axios from 'axios';
import { Send, Moon, Sun, Sparkles, Paperclip, Upload, X } from 'lucide-react';

const chatSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus('');
    } else {
      alert('Please select a valid PDF file');
      event.target.value = '';
    }
  };

  const uploadPDF = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('nodeId', chatSessionId);

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/emo-chat-upload-pdf',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for large files
        }
      );

      if (response.data.success) {
        setUploadStatus(`✅ Uploaded successfully! ${response.data.data.chunks} chunks created`);

        // Add system message
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `📄 PDF "${response.data.data.filename}" uploaded. You can now ask questions about it!`,
          sender: 'system',
          timestamp: new Date().toISOString(),
        }]);

        // Clear file input
        setSelectedFile(null);
        document.getElementById('pdfInput').value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      // setUploadStatus('❌ Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

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
                    background: 'linear-gradient(135deg, #8b0f3a, #c2185b)',
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

        {/* AI Loading (acts like a message) */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`px-5 py-2 rounded-2xl text-sm flex items-center gap-2
          ${isDarkMode
                  ? 'bg-black/40 text-white border border-white/20'
                  : 'bg-white text-slate-800 border border-slate-200'
                }`}
            >
              <span className="font-medium">AI is thinking</span>
              {/* <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} /> */}
              <div className="flex gap-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite] [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite] [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
@keyframes dotBounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
`}
      </style>




      {/* Input */}
      <div className="border-t border-white/10">

        {/* PDF Upload Section */}
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center gap-2">

            {/* Hidden file input */}
            <input
              id="pdfUploadInput"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Button */}




            {/* Selected File Preview */}
            {selectedFile && (
              <div
                className={`
      mt-3 relative w-40 rounded-lg border p-2 text-xs
      ${isDarkMode
                    ? 'bg-black/40 border-white/20 text-white'
                    : 'bg-white border-slate-200 text-slate-700'
                  }
    `}
              >
                {/* Remove Button */}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadStatus('');
                    document.getElementById('pdfUploadInput').value = '';
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:scale-105 transition"
                >
                  <X size={14} />
                </button>

                {/* File Info */}
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 flex items-center justify-center rounded bg-rose-600/20">
                    <Paperclip size={18} />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] opacity-70">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Upload Button */}
            {selectedFile && (
              <button
                onClick={uploadPDF}
                disabled={isUploading}
                className={`
            px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-white transition
            ${isUploading ? 'cursor-not-allowed opacity-70' : 'hover:opacity-90'}
            bg-gradient-to-r from-rose-900 to-pink-700
          `}
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            )}




            {/* Clear Button */}
            {/* {selectedFile && !isUploading && (
        <button
          onClick={() => {
            setSelectedFile(null);
            setUploadStatus('');
            document.getElementById('pdfUploadInput').value = '';
          }}
          className={`
            p-2 rounded-lg transition
            ${isDarkMode
              ? 'bg-red-500/20 border border-red-500/30 text-white'
              : 'bg-red-100 border border-red-200 text-red-600'
            }
          `}
        >
          <X size={16} />
        </button>
      )} */}
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div
              className={`
          mt-2 text-xs px-3 py-2 rounded-lg border
          ${uploadStatus.includes('✅')
                  ? isDarkMode
                    ? 'bg-green-500/20 border-green-500/30 text-white'
                    : 'bg-green-100 border-green-200 text-green-700'
                  : isDarkMode
                    ? 'bg-red-500/20 border-red-500/30 text-white'
                    : 'bg-red-100 border-red-200 text-red-700'
                }
        `}
            >
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 flex gap-2">
          <button
            onClick={() => document.getElementById('pdfUploadInput').click()}
            disabled={isUploading}
            className={`
          px-2.5 py-2 rounded-lg flex items-center gap-2 text-sm transition
          ${isUploading ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90'}
          ${isDarkMode
                ? 'bg-rose-900/50 text-white border border-white/20'
                : 'bg-white border border-slate-200'
              }
        `}
          >
            <Paperclip size={18} />
          </button>
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
            disabled={isLoading}
            className={`
        flex-1 resize-none px-3 py-2 rounded-lg outline-none transition
        ${isLoading ? 'cursor-not-allowed opacity-70' : ''}
        ${isDarkMode
                ? 'bg-black/40 text-white border border-white/20'
                : 'bg-white border border-slate-200'
              }
      `}
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`
        px-4 py-2 rounded-lg text-white flex items-center justify-center transition
        ${(!inputMessage.trim() || isLoading)
                ? 'cursor-not-allowed opacity-70'
                : 'hover:opacity-90'
              }
        bg-gradient-to-r from-rose-900 to-pink-700
      `}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
