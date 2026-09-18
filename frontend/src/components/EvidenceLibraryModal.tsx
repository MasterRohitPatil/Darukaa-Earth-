import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Database, Search, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceLibraryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEvidence();
    }
  }, [isOpen]);

  const loadEvidence = async (q?: string) => {
    setLoading(true);
    try {
      const data = await api.getEvidence(q);
      setEvidenceList(data.evidence || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvidence(searchQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                Scientific Evidence & Retrieval Corpus
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Curated FAO, IPCC, IPBES & ISRIC Literature Chunks for Grounded RAG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scientific evidence by variable, intervention, or mechanism..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
          >
            Filter
          </button>
        </form>

        {/* Evidence List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs animate-pulse">
              Retrieving indexed scientific records...
            </div>
          ) : evidenceList.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No evidence records matched your query.
            </div>
          ) : (
            evidenceList.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800">
                      {doc.source_organization} ({doc.year})
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {doc.ecosystem}
                    </span>
                  </div>
                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 font-medium"
                  >
                    Source Document <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                  {doc.title}
                </h4>

                <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Scientific Mechanism:
                  </span>
                  {doc.mechanism}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/40">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold not-italic block mb-1">
                    Chunked Empirical Finding:
                  </span>
                  "{doc.text}"
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-500 mr-1 self-center">Variables:</span>
                  {doc.variables?.map((v: string, i: number) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
