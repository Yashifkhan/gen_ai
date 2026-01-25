import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  Copy, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  Code2,
  Quote,
  Zap
} from 'lucide-react';

const MessageContent = ({ content, isDarkMode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preprocess content to convert • bullets to proper markdown
  const preprocessContent = (text) => {
    // Convert lines starting with • to markdown list items
    return text.replace(/^• (.+)$/gm, '- $1');
  };

  const processedContent = preprocessContent(content);

  return (
    <div className="relative group">
      {/* Copy Button */}
      <button
        onClick={() => handleCopy(content)}
        className={`absolute -top-2 -right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-sm ${
          isDarkMode 
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
            : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
        }`}
        title="Copy message"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Main Heading with emoji
          h1: ({ node, children, ...props }) => {
            // Extract emoji if present
            const childText = String(children);
            const emojiMatch = childText.match(/^([\u{1F300}-\u{1F9FF}])\s*(.+)$/u);
            
            return (
              <div className="mb-4">
                <h2
                  className={`text-lg md:text-xl font-bold pb-2 border-b-2 flex items-center gap-2 ${
                    isDarkMode 
                      ? 'border-blue-500/30 text-blue-300' 
                      : 'border-blue-500/40 text-slate-800'
                  }`}
                  {...props}
                >
                  {emojiMatch ? (
                    <>
                      <span className="text-2xl">{emojiMatch[1]}</span>
                      <span>{emojiMatch[2]}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 flex-shrink-0" />
                      {children}
                    </>
                  )}
                </h2>
              </div>
            );
          },
          
          // Section Headings
          h3: ({ node, children, ...props }) => (
            <h3
              className={`text-base md:text-lg font-semibold mt-5 mb-2.5 flex items-center gap-2 ${
                isDarkMode ? 'text-slate-100' : 'text-slate-800'
              }`}
              {...props}
            >
              <div className={`w-1 h-5 rounded-full ${
                isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
              }`} />
              <span>{children}</span>
            </h3>
          ),
          
          // Paragraphs
          p: ({ node, children, ...props }) => {
            const text = String(children);
            
            // Check if it's "Quick Answer" or "In Simple Terms"
            const isQuickAnswer = text.includes('Quick Answer:');
            const isSimpleTerms = text.includes('In Simple Terms:');
            
            if (isQuickAnswer || isSimpleTerms) {
              return (
                <div
                  className={`mb-4 p-3 rounded-lg border-l-4 ${
                    isDarkMode
                      ? 'bg-blue-500/10 border-blue-500 text-slate-200'
                      : 'bg-blue-50 border-blue-500 text-slate-700'
                  }`}
                  {...props}
                >
                  <div className="flex items-start gap-2">
                    <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <p className="text-sm leading-relaxed flex-1">{children}</p>
                  </div>
                </div>
              );
            }
            
            return (
              <p
                className={`mb-3 text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
                {...props}
              >
                {children}
              </p>
            );
          },
          
          // Bold/Strong text - Enhanced highlight
          strong: ({ node, children, ...props }) => {
            const text = String(children);
            
            // Special styling for section labels like "Quick Answer:", "Development Path:"
            if (text.endsWith(':')) {
              return (
                <strong
                  className={`font-bold text-sm inline-flex items-center gap-1.5 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}
                  {...props}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`} />
                  {children}
                </strong>
              );
            }
            
            return (
              <strong
                className={`font-semibold px-1.5 py-0.5 rounded ${
                  isDarkMode
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-blue-100 text-blue-700'
                }`}
                {...props}
              >
                {children}
              </strong>
            );
          },
          
          // Unordered Lists - Bullet Points
          ul: ({ node, ...props }) => (
            <ul
              className={`space-y-2 mb-4 ml-1 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
              {...props}
            />
          ),
          
          // List Items with custom bullets
          li: ({ node, children, ...props }) => (
            <li className="flex items-start gap-2.5 text-sm leading-relaxed" {...props}>
              <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
              }`} />
              <span className="flex-1">{children}</span>
            </li>
          ),
          
          // Ordered Lists
          ol: ({ node, ...props }) => (
            <ol
              className={`space-y-2 mb-4 ml-1 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
              {...props}
            />
          ),
          
          // Inline Code
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    isDarkMode
                      ? 'bg-slate-700 text-blue-300'
                      : 'bg-slate-100 text-blue-600'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            // Code block
            const codeString = String(children).replace(/\n$/, '');
            const language = className?.replace('language-', '') || 'text';
            
            return (
              <div className="relative group/code mb-4">
                <div className={`flex items-center justify-between px-3 py-1.5 rounded-t-lg text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{language}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(codeString)}
                    className={`p-1 rounded opacity-0 group-hover/code:opacity-100 transition-opacity ${
                      isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <pre
                  className={`p-3 rounded-b-lg overflow-x-auto text-xs ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-200'
                      : 'bg-slate-50 text-slate-800'
                  }`}
                >
                  <code className="font-mono" {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          
          // Links
        //   a: ({ node, children, href, ...props }) => (
            
        //       href={href}
        //       className={`inline-flex items-center gap-1 underline hover:no-underline text-sm transition-colors ${
        //         isDarkMode 
        //           ? 'text-blue-400 hover:text-blue-300' 
        //           : 'text-blue-600 hover:text-blue-700'
        //       }`}
        //       target="_blank"
        //       rel="noopener noreferrer"
        //       {...props}
        //     >
        //       {children}
        //       <ExternalLink className="w-3 h-3" />
        //     </a>
        //   ),
          
          // Blockquotes
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className={`relative border-l-3 pl-4 py-2 my-4 text-sm italic ${
                isDarkMode
                  ? 'border-purple-500 bg-purple-500/5 text-slate-300'
                  : 'border-purple-500 bg-purple-50 text-slate-700'
              }`}
              {...props}
            >
              <Quote className={`absolute -left-2 top-2 w-4 h-4 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-500'
              }`} />
              {children}
            </blockquote>
          ),

          // Horizontal Rule
          hr: ({ node, ...props }) => (
            <hr
              className={`my-4 border-t ${
                isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}
              {...props}
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;