import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { contextStore, addContextSource, removeContextSource, toggleContextSource, updateContextSource } from '~/lib/stores/context';
import { classNames } from '~/utils/classNames';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';

export const ContextManager = () => {
  const sources = useStore(contextStore);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'url' | 'search'>('url');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAddUrl = async (urlToAdd?: string) => {
    const targetUrl = urlToAdd || inputValue;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      toast.error('Please enter a valid URL');
      return;
    }

    const id = Math.random().toString(36).substring(7);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      addContextSource({
        id,
        type: 'url',
        name: data.name || targetUrl,
        content: data.content,
        enabled: true,
      });

      if (!urlToAdd) setInputValue('');
      toast.success('Source added successfully');
    } catch (error: any) {
      toast.error('Failed to crawl: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = async () => {
    if (!inputValue) return;

    setIsProcessing(true);
    setSearchResults([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: inputValue }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setSearchResults(data.results);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const sourcesList = Object.values(sources);

  return (
    <div className="flex flex-col gap-4 p-4 bg-bolt-elements-background-depth-3 rounded-xl border border-bolt-elements-borderColor shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="i-ph:books-duotone text-sky-500 text-xl" />
          <h3 className="text-sm font-medium text-bolt-elements-textPrimary">Knowledge Base (RAG)</h3>
        </div>
        <div className="flex bg-bolt-elements-background-depth-1 rounded-lg p-0.5 border border-bolt-elements-borderColor">
          <button
            onClick={() => setMode('url')}
            className={classNames("px-2 py-1 text-[10px] rounded-md transition-all", mode === 'url' ? "bg-sky-500 text-white shadow-sm" : "text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary")}
          >
            URL
          </button>
          <button
            onClick={() => setMode('search')}
            className={classNames("px-2 py-1 text-[10px] rounded-md transition-all", mode === 'search' ? "bg-sky-500 text-white shadow-sm" : "text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary")}
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className={classNames("absolute left-2 top-1/2 -translate-y-1/2 text-bolt-elements-textTertiary", mode === 'url' ? "i-ph:link" : "i-ph:magnifying-glass")} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === 'url' ? "Paste documentation URL..." : "Search documentation on Google..."}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            onKeyDown={(e) => e.key === 'Enter' && (mode === 'url' ? handleAddUrl() : handleSearch())}
          />
        </div>
        <button
          onClick={mode === 'url' ? handleAddUrl : handleSearch}
          disabled={isProcessing || !inputValue}
          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {isProcessing ? <div className="i-ph:spinner-gap animate-spin" /> : mode === 'url' ? 'Add' : 'Search'}
        </button>
      </div>

      {mode === 'search' && searchResults.length > 0 && (
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto animate-fade-in border-t border-bolt-elements-borderColor pt-2 mt-1">
          <p className="text-[10px] text-bolt-elements-textTertiary font-medium px-1">Top results:</p>
          {searchResults.map((result, i) => (
            <div key={i} className="flex flex-col gap-1 p-2 bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-sky-500 truncate flex-1">{result.title}</span>
                <button 
                  onClick={() => handleAddUrl(result.url)}
                  className="text-[10px] bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 px-1.5 py-0.5 rounded transition-all shrink-0"
                >
                  Add to Context
                </button>
              </div>
              <span className="text-[9px] text-bolt-elements-textTertiary line-clamp-1">{result.url}</span>
            </div>
          ))}
        </div>
      )}

      {sourcesList.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-bolt-elements-borderColor">
          <p className="text-[10px] text-bolt-elements-textTertiary font-medium px-1 uppercase tracking-wider">Active Sources ({sourcesList.length})</p>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {sourcesList.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-2 bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor group hover:border-sky-500/30 transition-all"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    onChange={() => toggleContextSource(source.id)}
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-bolt-elements-textPrimary truncate">
                      {source.name}
                    </span>
                    <span className="text-[9px] text-bolt-elements-textSecondary uppercase">
                      {source.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeContextSource(source.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-bolt-elements-textTertiary hover:text-red-500 transition-all"
                >
                  <div className="i-ph:trash text-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

