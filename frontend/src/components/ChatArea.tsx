import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onQuickPillClick: (pillText: string) => void;
}

export const ChatArea: React.FC<Props> = ({
  messages,
  onSendMessage,
  isLoading,
  onQuickPillClick
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-xs">
      {/* Feed Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 m-0">
            Conversational Intelligence Feed
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Stateful Context
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-900/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none shadow-xs'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs'
              }`}
            >
              {/* Proper Markdown Rendering (No raw asterisks or hash symbols!) */}
              <div className="space-y-1.5">
                <ReactMarkdown
                  components={{
                    h3: ({ node, ...props }) => (
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1 tracking-tight" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-2.5 mb-1 uppercase tracking-wide" {...props} />
                    ),
                    h5: ({ node, ...props }) => (
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 mb-0.5" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-slate-600 dark:text-slate-300" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-4 space-y-1 my-1 text-slate-700 dark:text-slate-300" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-4 space-y-1 my-1 text-slate-700 dark:text-slate-300" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="text-[12px]" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-2 border-emerald-500 pl-2.5 my-1.5 text-slate-600 dark:text-slate-400 italic text-[11px]" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-700" {...props} />
                    )
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>

              {/* Clarification Questions Pill Box */}
              {m.clarifyingQuestions && m.clarifyingQuestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Targeted Environmental Questions:
                  </div>
                  <div className="space-y-1.5">
                    {m.clarifyingQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-800 dark:text-slate-200 flex items-start gap-2"
                      >
                        <span className="text-amber-600 dark:text-amber-400 font-bold font-mono shrink-0">
                          Q{idx + 1}:
                        </span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggested Quick Answer Pills */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5 font-medium">
                      One-Click Quick Answers (Click to autofill):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => onQuickPillClick('We grow wheat as a single-crop monoculture, soil organic carbon is 0.35%, and annual rainfall is 450mm.')}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 transition cursor-pointer font-medium"
                      >
                        🌾 Wheat Monoculture (0.35% SOC, 450mm rain)
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickPillClick('It is a vineyard with grapes near Nashik, drip irrigation, low organic carbon, and high pesticide spraying.')}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 transition cursor-pointer font-medium"
                      >
                        🍇 Vineyard in Nashik (High pesticide)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-500 dark:text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span>Evaluating multi-variable environmental pressures & retrieving scientific evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe ecosystem observations or ask about interventions..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition disabled:opacity-40 disabled:hover:bg-emerald-700 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
