import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Key, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (preview: string) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await api.setGeminiKey(apiKey.trim());
      if (res.status === 'success') {
        setStatus('success');
        onKeySaved(res.key_preview || 'Configured');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error('Failed to save key.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error updating API key.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white m-0">
              Google Gemini API Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed m-0">
            Paste your Google Gemini API key below. Once saved, EcoReason will directly call Google's live <strong>Gemini 1.5 Flash / 2.5 Flash</strong> models to generate real-time scientific explanations.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Google AI Studio API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Keys are stored locally in <code className="text-slate-400">backend/.env</code> and never exposed to the public.
            </span>
          </div>

          {status === 'success' && (
            <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-2.5 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Google Gemini API connected and verified successfully!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-950/40 border border-red-800 text-red-300 p-2.5 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'saving' || !apiKey.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {status === 'saving' ? 'Connecting...' : 'Save & Enable Live AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
