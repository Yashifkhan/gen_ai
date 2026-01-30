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







// 'use client';
import React, { useState, useRef, useEffect } from "react";
import { Send, Moon, Sun, Paperclip, ChevronDown, Sparkles, Bot, User, FileText, Check } from "lucide-react";
import MessageContent from "./MessageContent";
import.meta.env


const apiUrl = import.meta.env.VITE_API_URL;
console.log("api url ",apiUrl);

const chatSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const AI_MODELS = [
  { id: "gpt-4", name: "Emo-4", desc: "Most capable model" },
  { id: "gpt-3.5", name: "Emo-3.5", desc: "Fast & efficient" },
  // { id: "claude", name: "Claude", desc: "Balanced performance" },
];

export default function EmoChat() {

  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const modelMenuRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const autoUploadPDF = async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("nodeId", chatSessionId);

    setIsUploading(true);

    try {
      const response = await fetch(`${apiUrl}/emo-chat-upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `PDF "${data.data.filename}" uploaded successfully! Ask me anything about it.`,
            sender: "system",
          },
        ]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Failed to upload PDF. Please try again.",
          sender: "system",
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (file && file.type === "application/pdf") {
      autoUploadPDF(file);
    } else {
      alert("Please select a valid PDF file");
    }

    event.target.value = "";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const tempAiMessageId = Date.now() + 1;

      setMessages((prev) => [
        ...prev,
        {
          id: tempAiMessageId,
          text: "",
          sender: "ai",
        },
      ]);
// http://localhost:8000/api/v1/emo-chat
      const response = await fetch(`${apiUrl}/emo-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          nodeId: chatSessionId,
          model: selectedModel.id,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsLoading(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6).trim();
              const data = JSON.parse(jsonStr);

              if (data.chunk) {
                accumulatedText += data.chunk;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAiMessageId
                      ? { ...msg, text: accumulatedText }
                      : msg
                  )
                );
              }

              if (data.done) setIsLoading(false);
              if (data.error) {
                console.error("Error:", data.error);
                setIsLoading(false);
              }
            } catch (e) {
              console.error("JSON parse error:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "An error occurred. Please try again.",
          sender: "ai",
        },
      ]);
    }
  };

  const cn = (...classes) => classes.filter(Boolean).join(" ");

  // Theme classes
  const bgClass = isDarkMode ? 'bg-black' : 'bg-white';
  const textClass = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const borderClass = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const headerBg = isDarkMode ? 'bg-black' : 'bg-white/80';
  const primaryBg = isDarkMode ? 'bg-transparent border border-gray-200' : 'bg-black text-white';
  const primaryText = 'text-white';
  const accentBg = isDarkMode ? 'bg-slate-800' : 'bg-slate-100';
  const accentText = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const cardBg = isDarkMode ? 'bg-black/60' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const hoverAccent = isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100';
  const popoverBg = isDarkMode ? 'bg-black' : 'bg-white';
  const popoverBorder = isDarkMode ? 'border-slate-600' : 'border-slate-200';

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${bgClass} ${textClass}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 md:px-6 py-2 border-b ${borderClass} backdrop-blur-sm ${headerBg} sticky top-0 z-50`}>
        <div className="flex items-center gap-3">
          
           <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Emo</h1>
            <p className={`text-xs ${mutedText}`}>AI Assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2.5 rounded-xl ${hoverAccent} transition-colors duration-200`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className={`w-5 h-5 ${isDarkMode ? 'text-slate-100/80' : 'text-slate-900/80'}`} />
          ) : (
            <Moon className={`w-5 h-5 ${isDarkMode ? 'text-slate-100/80' : 'text-slate-900/80'}`} />
          )}
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          {messages.length === 0 && (
            <div className="h-[calc(100vh-280px)] flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className={`text-lg font-semibold tracking-tight ${textClass}`}>
                    Hi, how can I help you today?
                  </h2>
                  <p className={`${mutedText} text-sm max-w-sm mx-auto`}>
                    Ask me anything or upload a PDF to get started with your questions.
                  </p>
                </div>
               
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages
  .filter(msg => msg.text?.trim())
  .map((msg) => {
    const isUser = msg.sender === "user";
    const isSystem = msg.sender === "system";

    return (
      // <div
      //   key={msg.id}
      //   className={cn(
      //     "flex gap-4",
      //     isUser && "flex-row-reverse",
      //     isSystem && "justify-center"
      //   )}
      // >
      //   <div
      //     className={cn(
      //       "px-4 py-1.5 rounded-2xl max-w-[85%] md:max-w-[75%] text-sm",
      //       isUser && `${primaryBg} ${primaryText} rounded-tr-md`,
      //       msg.sender === "ai" && `${cardBg} ${cardBorder} rounded-tl-md border`,
           
      //     )}
      //   >
      //     {/* {isSystem && <FileText className="w-4 h-4" />} */}
      //     {msg.text}
      //   </div>
      // </div>
      <div
              key={msg.id}
              className={cn(
                "flex gap-4",
                isUser && "flex-row-reverse",
                isSystem && "justify-center"
              )}
            >
              {/* Avatar - Optional but recommended */}
              {/* {!isSystem && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
                  isUser 
                    ? "bg-blue-500" 
                    : isDarkMode 
                      ? "bg-purple-600" 
                      : "bg-purple-500"
                )}>
                  {isUser ? (
                    <span className="text-white text-sm font-semibold">You</span>
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
              )} */}

              <div
                className={cn(
                  "px-2 py-1.5 rounded-2xl max-w-[85%] md:max-w-[75%]",
                  isUser && `${primaryBg} ${primaryText} rounded-tr-md`,
                  msg.sender === "ai" && `${cardBg} ${cardBorder} rounded-tl-md border shadow-sm`,
                )}
              >
                {/* Use MessageContent component for AI responses */}
                {msg.sender === "ai" ? (
                  <MessageContent content={msg.text} isDarkMode={isDarkMode} />
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
      
    );
  })}


            {isLoading && (
          <div className="flex justify-start">
            <div
              className={`relative px-5 py-1.5 rounded-2xl text-sm flex items-center gap-3
                ${isDarkMode
                  ? 'bg-black/40 text-white border border-white/20 shadow-lg shadow-blue-500/10'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-lg'
                }`}
            >
              <span className="font-medium">AI is thinking</span>
              <div className="flex gap-1 items-end h-2">
  <span
    className="w-1.5 h-1.5 rounded-full bg-blue-500"
    style={{ animation: "dotFloat 1s ease-in-out infinite" }}
  />
  <span
    className="w-1.5 h-1.5 rounded-full bg-purple-500"
    style={{ animation: "dotFloat 1s ease-in-out infinite 0.2s" }}
  />
  <span
    className="w-1.5 h-1.5 rounded-full bg-pink-500"
    style={{ animation: "dotFloat 1s ease-in-out infinite 0.4s" }}
  />
</div>

<style>
{`
@keyframes dotFloat {
  0%, 100% {
    transform: translateY(2px);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-2px);
    opacity: 1;
  }
}
`}
</style>


              {/* <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} /> */}

            </div>
          </div>
        )}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className={` ${borderClass} ${headerBg} backdrop-blur-sm p-1`}>
        <div className="max-w-3xl mx-auto">
          {/* Upload Progress */}
          {isUploading && (
            <div className={`mb-3 px-4 py-2 rounded-xl ${accentBg} ${accentText} text-sm flex items-center gap-3`}>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Uploading PDF...</span>
            </div>
          )}

   {showModelMenu && (
                    <div className={`absolute bottom-full left-2 mb-2 w-52 rounded-xl border ${popoverBorder} ${popoverBg} shadow-lg overflow-hidden`}>
                      <div className="p-1">
                        {AI_MODELS.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setShowModelMenu(false);
                            }}
                            className={cn(
                              "w-full  px-3 py-1 rounded-lg text-left transition-colors duration-150 flex items-center justify-between group",
                              selectedModel.id === model.id
                                ? accentBg
                                : isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/50'
                            )}
                          >
                            <div>
                              <div className={`font-medium text-sm ${textClass}`}>
                                {model.name}
                              </div>
                              <div className={`text-xs ${mutedText}`}>
                                {model.desc}
                              </div>
                            </div>
                            {selectedModel.id === model.id && (
                              <Check className={`w-4 h-4 ${isDarkMode ? 'text-blue-600' : 'text-blue-600'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
          {/* Input Container */}
          <div className={`rounded-2xl border  ${cardBorder} ${cardBg} shadow-sm overflow-hidden transition-shadow duration-200 focus-within:shadow-md ${isDarkMode ? 'focus-within:border-white-600/30' : 'focus-within:border-blue-600/30'}`}>
            {/* Textarea */}
            <div
              className="px-4 pt-2 cursor-text"
              onClick={() => textareaRef.current?.focus()}
            >
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Message Emo..."
                disabled={isLoading}
                className={cn(
                  "w-full resize-none bg-transparent outline-none transition-opacity duration-200",
                  textClass,
                  isDarkMode ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400',
                  isLoading && "cursor-not-allowed opacity-50"
                )}
                style={{ minHeight: "24px", maxHeight: "150px" }}
              />
            </div>

            {/* Actions Bar */}
            <div className="px-3 py-1 flex items-center justify-between">
              {/* Left Actions */}
              <div className="flex items-center ">
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
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    isLoading || isUploading
                      ? "opacity-40 cursor-not-allowed"
                      : `${hoverAccent} ${mutedText} ${isDarkMode ? 'hover:text-slate-100' : 'hover:text-slate-900'}`
                  )}
                  aria-label="Attach PDF"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Model Selector */}
                <div className="relative" ref={modelMenuRef}>
                  <button
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    disabled={isLoading}
                    className={cn(
                      "px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2",
                      isLoading
                        ? "opacity-40 cursor-not-allowed"
                        : `${hoverAccent} ${mutedText} ${isDarkMode ? 'hover:text-slate-100' : 'hover:text-slate-900'}`
                    )}
                  >
                    {selectedModel.name}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        showModelMenu && "rotate-180"
                      )}
                    />
                  </button>

               
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  !inputMessage.trim() || isLoading
                    ? isDarkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : `${primaryBg} ${primaryText} hover:opacity-90 shadow-sm`
                )}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className={`text-center text-xs ${mutedText} mt-2`}>
            Emo can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
    </div>
  );
}