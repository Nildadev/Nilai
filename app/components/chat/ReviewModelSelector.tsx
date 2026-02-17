import type { ProviderInfo } from '~/types/model';
import { useEffect, useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { ModelInfo } from '~/lib/.server/llm/stream-text'; // Adjusted import to match project
import { classNames } from '~/utils/classNames';

interface ReviewModelSelectorProps {
  model?: string;
  setModel?: (model: string) => void;
  modelList: any[];
}

export const ReviewModelSelector = ({
  model,
  setModel,
  modelList,
}: ReviewModelSelectorProps) => {
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [focusedModelIndex, setFocusedModelIndex] = useState(-1);
  const modelSearchInputRef = useRef<HTMLInputElement>(null);
  const modelOptionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = modelList.filter(
    (m) =>
      m.label.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()),
  );

  useEffect(() => {
    setFocusedModelIndex(-1);
  }, [modelSearchQuery, isModelDropdownOpen]);

  useEffect(() => {
    if (isModelDropdownOpen && modelSearchInputRef.current) {
      modelSearchInputRef.current.focus();
    }
  }, [isModelDropdownOpen]);

  const handleModelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isModelDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedModelIndex((prev) => (prev + 1 >= filteredModels.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedModelIndex((prev) => (prev - 1 < 0 ? filteredModels.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedModelIndex >= 0 && focusedModelIndex < filteredModels.length) {
          const selectedModel = filteredModels[focusedModelIndex];
          setModel?.(selectedModel.name);
          setIsModelDropdownOpen(false);
          setModelSearchQuery('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
        break;
    }
  };

  useEffect(() => {
    if (focusedModelIndex >= 0 && modelOptionsRef.current[focusedModelIndex]) {
      modelOptionsRef.current[focusedModelIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedModelIndex]);

  return (
    <div className="relative" onKeyDown={handleModelKeyDown} ref={modelDropdownRef}>
      <div
        className={classNames(
          'flex items-center gap-1 px-2 py-1 rounded-md border border-bolt-elements-borderColor',
          'bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary text-[10px]',
          'hover:border-sky-500/50 transition-all cursor-pointer min-w-[100px] max-w-[150px]',
          isModelDropdownOpen ? 'ring-1 ring-sky-500/50 border-sky-500/50' : undefined,
        )}
        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
      >
        <div className="truncate flex-1">{modelList.find((m) => m.name === model)?.label || 'Select model'}</div>
        <div className={classNames('i-ph:caret-down w-3 h-3 opacity-50', isModelDropdownOpen ? 'rotate-180' : undefined)} />
      </div>

      {isModelDropdownOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-[10002] w-64 p-1 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 shadow-xl animate-in fade-in zoom-in-95">
          <div className="px-2 pb-1 pt-1">
            <div className="relative">
              <input
                ref={modelSearchInputRef}
                type="text"
                value={modelSearchQuery}
                onChange={(e) => setModelSearchQuery(e.target.value)}
                placeholder="Search review models..."
                className="w-full pl-7 pr-3 py-1.5 rounded-md text-xs bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor text-bolt-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <div className="i-ph:magnifying-glass text-bolt-elements-textTertiary" />
              </div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {filteredModels.length === 0 ? (
              <div className="px-3 py-2 text-xs text-bolt-elements-textTertiary text-center">No models found</div>
            ) : (
              filteredModels.map((modelOption, index) => (
                <div
                  ref={(el) => (modelOptionsRef.current[index] = el)}
                  key={index}
                  className={classNames(
                    'px-3 py-2 text-xs cursor-pointer rounded-md transition-colors mx-1 my-0.5',
                    'hover:bg-sky-500/10 hover:text-sky-500',
                    model === modelOption.name || focusedModelIndex === index
                      ? 'bg-sky-500/10 text-sky-500'
                      : 'text-bolt-elements-textPrimary',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModel?.(modelOption.name);
                    setIsModelDropdownOpen(false);
                    setModelSearchQuery('');
                  }}
                >
                  {modelOption.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
