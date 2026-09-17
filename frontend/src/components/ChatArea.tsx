import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Feed Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 m-0">
            Conversational Intelligence
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Multi-Turn Active Memory
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line text-[13px]">{m.content}</div>

              {/* Clarification Questions Pill Box */}
              {m.clarifyingQuestions && m.clarifyingQuestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Targeted Environmental Clarifications Needed:
                  </div>
                  <div className="space-y-1.5">
                    {m.clarifyingQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-amber-400 font-bold font-mono">Q{idx + 1}:</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggested Quick Answer Pills */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                      Quick Respond (Click to populate):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onQuickPillClick('We grow wheat as a single-crop monoculture, soil organic carbon is 0.35%, and annual rainfall is 450mm.')}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-full border border-slate-700 transition cursor-pointer"
                      >
                        🌾 Wheat Monoculture (0.35% SOC, 450mm rain)
                      </button>
                      <button
                        onClick={() => onQuickPillClick('It is a vineyard with grapes near Nashik, drip irrigation, low organic carbon, and high pesticide spraying.')}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-full border border-slate-700 transition cursor-pointer"
                      >
                        🍇 Vineyard in Nashik (High pesticide)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <span>Evaluating multi-variable environmental pressures & retrieving scientific evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe ecosystem observations or ask about interventions..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition disabled:opacity-40 disabled:hover:bg-emerald-600 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
