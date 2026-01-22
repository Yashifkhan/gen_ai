// import React, { useState } from 'react';
// import axios from 'axios';
// import { Send, Moon, Sun, Sparkles, Paperclip, Upload, X } from 'lucide-react';

// const chatSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)

// export default function App() {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState('');
//   const [previewUrl, setPreviewUrl] = useState(null);

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];

//     if (file && file.type === 'application/pdf') {
//       setSelectedFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setUploadStatus('');
//     } else {
//       alert('Please select a valid PDF file');
//       event.target.value = '';
//     }
//   };

//   const uploadPDF = async () => {
//     if (!selectedFile) {
//       alert('Please select a PDF file first');
//       return;
//     }
//     const formData = new FormData();
//     formData.append('pdf', selectedFile);
//     formData.append('nodeId', chatSessionId);
//     setIsUploading(true);
//     setUploadStatus('Uploading...');
//     try {
//       const response = await axios.post(
//         'http://localhost:8000/api/v1/emo-chat-upload-pdf',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//           timeout: 60000, // 60 seconds for large files
//         }
//       );

//       if (response.data.success) {
//         setUploadStatus(`✅ Uploaded successfully! ${response.data.data.chunks} chunks created`);

//         // Add system message
//         setMessages(prev => [...prev, {
//           id: Date.now(),
//           text: `📄 PDF "${response.data.data.filename}" uploaded. You can now ask questions about it!`,
//           sender: 'system',
//           timestamp: new Date().toISOString(),
//         }]);

//         // Clear file input
//         setSelectedFile(null);
//         document.getElementById('pdfInput').value = '';
//       }

//     } catch (error) {
//       console.error('Upload error:', error);
//       // setUploadStatus('❌ Upload failed: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!inputMessage.trim()) return;

//     const userMsg = {
//       nodeId: chatSessionId,
//       text: inputMessage,
//       sender: 'user',
//     };
//     setMessages(prev => [...prev, userMsg]);
//     setInputMessage('');
//     setIsLoading(true);
//     try {
//   const tempAiMessageId = Date.now() + 1;

//   setMessages(prev => [
//     ...prev,
//     {
//       id: tempAiMessageId,
//       text: '',
//       sender: 'ai',
//     },
//   ]);

//   const response = await fetch('http://localhost:8000/api/v1/emo-chat', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ 
//       message: userMsg.text, 
//       nodeId: userMsg.nodeId 
//     }),
//   });

//   const reader = response.body.getReader();
//   const decoder = new TextDecoder();
//   let buffer = ''; // Buffer for incomplete lines
//   let accumulatedText = '';

//   while (true) {
//     const { done, value } = await reader.read();

//     if (done) {
//       setIsLoading(false);
//       break;
//     }

//     // Add to buffer
//     buffer += decoder.decode(value, { stream: true });

//     // Split by newlines
//     const lines = buffer.split('\n');

//     // Keep the last incomplete line in buffer
//     buffer = lines.pop() || '';

//     for (const line of lines) {
//       if (line.trim().startsWith('data: ')) {
//         try {
//           const jsonStr = line.slice(6).trim();
//           const data = JSON.parse(jsonStr);

//           if (data.chunk) {
//             accumulatedText += data.chunk;

//             setMessages(prev =>
//               prev.map(msg =>
//                 msg.id === tempAiMessageId
//                   ? { ...msg, text: accumulatedText }
//                   : msg
//               )
//             );
//           }

//           if (data.done) {
//             setIsLoading(false);
//           }

//           if (data.error) {
//             console.error('Error:', data.error);
//             setIsLoading(false);
//           }
//         } catch (e) {
//           console.error('JSON parse error:', e);
//         }
//       }
//     }
//   }
// } catch (error) {
//   console.error('Error:', error);
//   setIsLoading(false);

//   setMessages(prev => [
//     ...prev,
//     {
//       id: Date.now() + 1,
//       text: 'An error occurred. Please try again.',
//       sender: 'ai',
//     },
//   ]);
// }
//   };

//   return (
//     <div className="h-screen flex flex-col"
//       style={
//         isDarkMode
//           ? {
//             background:
//               'linear-gradient(135deg, #0b0206 0%, #4a0f2a 45%, #8b0f3a 100%)',
//             color: '#ffffff',
//           }
//           : { background: '#f1f5f9' }
//       }
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 border-b border-white/10">
//         <h1 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
//           Emo AI
//         </h1>
//         <button onClick={() => setIsDarkMode(!isDarkMode)}>
//           {isDarkMode ? <Sun className="text-white" /> : <Moon />}
//         </button>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.map(msg => (
//           <div
//             key={msg?.id}
//             className={`flex ${msg?.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className="px-4 py-2 rounded-xl max-w-[75%] text-sm"
//               style={
//                 msg?.sender === 'user'
//                   ? {
//                     background: 'linear-gradient(135deg, #8b0f3a, #c2185b)',
//                     color: '#ffffff',
//                   }
//                   : isDarkMode
//                     ? {
//                       background: 'rgba(0,0,0,0.35)',
//                       color: '#ffffff',
//                       backdropFilter: 'blur(6px)',
//                       border: '1px solid rgba(255,255,255,0.08)',
//                     }
//                     : {
//                       background: '#ffffff',
//                       color: '#1e293b',
//                       border: '1px solid #e5e7eb',
//                     }
//               }
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}

//         {/* AI Loading (acts like a message) */}
//         {isLoading && (
//           <div className="flex justify-start">
//             <div
//               className={`px-5 py-2 rounded-2xl text-sm flex items-center gap-2
//           ${isDarkMode
//                   ? 'bg-black/40 text-white border border-white/20'
//                   : 'bg-white text-slate-800 border border-slate-200'
//                 }`}
//             >
//               <span className="font-medium">AI is thinking</span>
//               {/* <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} /> */}
//               <div className="flex gap-1 pt-1">
//                 <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite]" />
//                 <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite] [animation-delay:150ms]" />
//                 <span className="w-1.5 h-1.5 rounded-full bg-current animate-[dotBounce_1.2s_ease-in-out_infinite] [animation-delay:300ms]" />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <style>
//         {`
// @keyframes dotBounce {
//   0%, 100% {
//     transform: translateY(0);
//     opacity: 0.5;
//   }
//   50% {
//     transform: translateY(-4px);
//     opacity: 1;
//   }
// }
// `}
//       </style>




//       {/* Input */}
//       <div className="border-t border-white/10">

//         {/* PDF Upload Section */}
//         <div className="p-3 border-b border-white/10">
//           <div className="flex items-center gap-2">

//             {/* Hidden file input */}
//             <input
//               id="pdfUploadInput"
//               type="file"
//               accept=".pdf"
//               onChange={handleFileSelect}
//               className="hidden"
//             />

//             {/* Upload Button */}




//             {/* Selected File Preview */}
//             {selectedFile && (
//               <div
//                 className={`
//       mt-3 relative w-40 rounded-lg border p-2 text-xs
//       ${isDarkMode
//                     ? 'bg-black/40 border-white/20 text-white'
//                     : 'bg-white border-slate-200 text-slate-700'
//                   }
//     `}
//               >
//                 {/* Remove Button */}
//                 <button
//                   onClick={() => {
//                     setSelectedFile(null);
//                     setUploadStatus('');
//                     document.getElementById('pdfUploadInput').value = '';
//                   }}
//                   className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:scale-105 transition"
//                 >
//                   <X size={14} />
//                 </button>

//                 {/* File Info */}
//                 <div className="flex items-center gap-2">
//                   <div className="h-10 w-10 flex items-center justify-center rounded bg-rose-600/20">
//                     <Paperclip size={18} />
//                   </div>

//                   <div className="flex-1 overflow-hidden">
//                     <p className="truncate font-medium">
//                       {selectedFile.name}
//                     </p>
//                     <p className="text-[10px] opacity-70">
//                       {(selectedFile.size / 1024).toFixed(1)} KB
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//             {/* Upload Button */}
//             {selectedFile && (
//               <button
//                 onClick={uploadPDF}
//                 disabled={isUploading}
//                 className={`
//             px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-white transition
//             ${isUploading ? 'cursor-not-allowed opacity-70' : 'hover:opacity-90'}
//             bg-gradient-to-r from-rose-900 to-pink-700
//           `}
//               >
//                 {isUploading ? (
//                   <>
//                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                     Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload size={16} />
//                     Upload
//                   </>
//                 )}
//               </button>
//             )}
//           </div>

//           {/* Upload Status */}
//           {uploadStatus && (
//             <div
//               className={`
//           mt-2 text-xs px-3 py-2 rounded-lg border
//           ${uploadStatus.includes('✅')
//                   ? isDarkMode
//                     ? 'bg-green-500/20 border-green-500/30 text-white'
//                     : 'bg-green-100 border-green-200 text-green-700'
//                   : isDarkMode
//                     ? 'bg-red-500/20 border-red-500/30 text-white'
//                     : 'bg-red-100 border-red-200 text-red-700'
//                 }
//         `}
//             >
//               {uploadStatus}
//             </div>
//           )}
//         </div>

//         {/* Message Input */}
//         <div className="p-4 flex gap-2">
//           <button
//             onClick={() => document.getElementById('pdfUploadInput').click()}
//             disabled={isUploading}
//             className={`
//           px-2.5 py-2 rounded-lg flex items-center gap-2 text-sm transition
//           ${isUploading ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90'}
//           ${isDarkMode
//                 ? 'bg-rose-900/50 text-white border border-white/20'
//                 : 'bg-white border border-slate-200'
//               }
//         `}
//           >
//             <Paperclip size={18} />
//           </button>
//           <textarea
//             value={inputMessage}
//             onChange={e => setInputMessage(e.target.value)}
//             onKeyDown={e => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSendMessage();
//               }
//             }}
//             rows={1}
//             placeholder="Type your message..."
//             disabled={isLoading}
//             className={`
//         flex-1 resize-none px-3 py-2 rounded-lg outline-none transition
//         ${isLoading ? 'cursor-not-allowed opacity-70' : ''}
//         ${isDarkMode
//                 ? 'bg-black/40 text-white border border-white/20'
//                 : 'bg-white border border-slate-200'
//               }
//       `}
//           />

//           <button
//             onClick={handleSendMessage}
//             disabled={!inputMessage.trim() || isLoading}
//             className={`
//         px-4 py-2 rounded-lg text-white flex items-center justify-center transition
//         ${(!inputMessage.trim() || isLoading)
//                 ? 'cursor-not-allowed opacity-70'
//                 : 'hover:opacity-90'
//               }
//         bg-gradient-to-r from-rose-900 to-pink-700
//       `}
//           >
//             {isLoading ? (
//               <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
//             ) : (
//               <Send size={18} />
//             )}
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// }












import React, { useState, useRef, useEffect } from 'react';
import { Send, Moon, Sun, Paperclip, ChevronDown } from 'lucide-react';

const chatSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const AI_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', desc: 'Most capable' },
  { id: 'gpt-3.5', name: 'GPT-3.5', desc: 'Fast & efficient' },
  { id: 'claude', name: 'Claude', desc: 'Balanced' }
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoUploadPDF = async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('nodeId', chatSessionId);

    setIsUploading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/emo-chat-upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `📄 PDF "${data.data.filename}" uploaded successfully! Ask me anything about it.`,
          sender: 'system',
        }]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `❌ Failed to upload PDF. Please try again.`,
        sender: 'system',
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      autoUploadPDF(file);
    } else {
      alert('Please select a valid PDF file');
    }

    event.target.value = '';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      nodeId: chatSessionId,
      text: inputMessage,
      sender: 'user',
      id: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const tempAiMessageId = Date.now() + 1;

      setMessages(prev => [...prev, {
        id: tempAiMessageId,
        text: '',
        sender: 'ai',
      }]);

      const response = await fetch('http://localhost:8000/api/v1/emo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          nodeId: userMsg.nodeId,
          model: selectedModel.id
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsLoading(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              const data = JSON.parse(jsonStr);

              if (data.chunk) {
                accumulatedText += data.chunk;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === tempAiMessageId
                      ? { ...msg, text: accumulatedText }
                      : msg
                  )
                );
              }

              if (data.done) setIsLoading(false);
              if (data.error) {
                console.error('Error:', data.error);
                setIsLoading(false);
              }
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'An error occurred. Please try again.',
        sender: 'ai',
      }]);
    }
  };
console.log("isDarkMode",isDarkMode);

const changeThem=()=>{
  console.log("hiiii");
  setIsDarkMode(prev => !prev)
}
useEffect(()=>{
  console.log("sjfkshdfkhs");
  

},[isDarkMode])

  return (
    <div
      className="h-screen flex flex-col"
      style={isDarkMode ? {
        // background: 'linear-gradient(135deg, #2a2a2a 0%, #0e5f3d 45%, #00A240 100%)',
        background: 'linear-gradient(to bottom, #2a2a2a 1%, #1a3f2f 50%, #00A240 100%)',
        color: '#ffffff',
      } : {
        background: '#f8fafc',
        color: '#1e293b'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Emo 
          </h1>
          {/* <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-100 text-rose-600' */}
            {/* }`}> */}
            {/* {selectedModel.name} */}
          {/* </span> */}
        </div>
        <button
          onClick={()=>changeThem()}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          {isDarkMode ? <Sun size={20} className="text-white" /> : <Moon size={20} />}
        </button>
       
      </div>

      {/* Messages */}
      <div className="flex-1 -mt-40 p-4 space-y-1">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-1 opacity-60">
              <h3 className="text-xl font-semibold tracking-wide text-white">
                Hi, <span>Yashif</span>
              </h3>
              <p className="text-base text-gray-200">
                What would you like help with today?
              </p>
            </div>

          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' :
                msg.sender === 'system' ? 'justify-center' :
                  'justify-start'
              }`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${msg.sender === 'system' ? 'text-xs' : ''
                }`}
              style={
                msg.sender === 'user' ? {
                  background: 'linear-gradient(135deg, #8b0f3a, #c2185b)',
                  color: '#ffffff',
                } : msg.sender === 'system' ? {
                  background: isDarkMode ? 'rgba(139,15,58,0.2)' : 'rgba(139,15,58,0.1)',
                  color: isDarkMode ? '#ffffff' : '#8b0f3a',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(139,15,58,0.2)'}`,
                } : isDarkMode ? {
                  background: 'rgba(0,0,0,0.35)',
                  color: '#ffffff',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                } : {
                  background: '#ffffff',
                  color: '#1e293b',
                  border: '1px solid #e2e8f0',
                }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2"
              style={isDarkMode ? {
                background: 'rgba(0,0,0,0.35)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)',
              } : {
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
              }}
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showModelMenu && (
        <div className={` bottom-full ml-5 left-10 w-40 rounded-xl shadow-xl overflow-hidden z-10 ${isDarkMode ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-slate-200'
          }`}
        >
          {AI_MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model);
                setShowModelMenu(false);
              }}
              className={`w-full px-4 py-1 text-left transition ${selectedModel.id === model.id
                  ? isDarkMode ? 'bg-rose-500/20' : 'bg-rose-50'
                  : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
            >
              <div className={`font-medium text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {model.name}
              </div>
              <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'
                }`}>
                {model.desc}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="py-1 px-1">
        {/* File Upload Progress */}
        {isUploading && (
          <div className={`mb-3 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 ${isDarkMode ? 'bg-rose-500/20 text-white' : 'bg-rose-50 text-rose-700'
            }`}>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Uploading PDF...
          </div>
        )}

        {/* Unified Input Container */}
        <div
          className={`rounded-2xl overflow-hidden ${isDarkMode
              ? 'bg-[#2a2a2a] border border-white/10'
              : 'bg-white border border-slate-200 shadow-sm'
            }`}
        >
          {/* Top Part - Text Input (Clickable) */}
          <div
            className="px-4 pt-2 cursor-text"
            onClick={() => textareaRef.current?.focus()}
          >
            <textarea
              ref={textareaRef}
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
                }
              }}
              rows={1}
              placeholder="Reply..."
              disabled={isLoading}
              className={`w-full resize-none bg-transparent outline-none transition max-h-[120px] text-base ${isLoading ? 'cursor-not-allowed opacity-70' : ''
                } ${isDarkMode
                  ? 'text-white placeholder:text-white/40'
                  : 'text-slate-900 placeholder:text-slate-400'
                }`}
              style={{ minHeight: '18px' }}
            />
          </div>

          {/* Bottom Part - Actions */}
          <div className={`px-3 py-1 flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-slate-200'
            }`}>
            {/* Left Actions - Upload & Model Selector */}
            <div className="flex items-center gap-1">
              {/* PDF Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className={`p-1 rounded-lg transition ${(isLoading || isUploading) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'
                  } ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}
              >
                <Paperclip size={18} />
              </button>

              {/* Model Selector */}
              <div className="relative z-20">
                <button
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${isLoading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'
                    } ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}
                >
                  {selectedModel.name}
                  <ChevronDown size={14} className="opacity-60" />
                </button>


              </div>
            </div>

            {/* Right Actions - Send Button Only */}
            <div className="flex items-center gap-2">
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-xl text-white transition ${(!inputMessage.trim() || isLoading)
                    ? 'opacity-40 cursor-not-allowed bg-rose-800/50'
                    : 'hover:opacity-90 bg-gradient-to-br from-rose-700 to-rose-600 shadow-lg shadow-rose-500/25'
                  }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}