import React, { useEffect, useRef, useState } from 'react';
import { classNames } from '~/utils/classNames';

interface MermaidProps {
  chart: string;
}

export const Mermaid = ({ chart }: MermaidProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!chart || chart.trim().length === 0) return;

    const renderChart = async () => {
      try {
        const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs' as any)).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: document.querySelector('html')?.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter',
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          // Validate syntax first
          await mermaid.parse(chart);
          
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
          setError(null);
          setIsTyping(false);
        } catch (parseErr) {
          // If parsing fails, we assume it's still being typed unless it's been a while
          console.warn('Mermaid parsing waiting for more input...');
        }
      } catch (err: any) {
        console.error('Mermaid core error:', err);
      }
    };

    const timer = setTimeout(renderChart, 200);
    return () => clearTimeout(timer);
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 font-bold">
          <div className="i-ph:warning-circle-fill" />
          Diagram Syntax Error
        </div>
        <pre className="whitespace-pre-wrap opacity-80">{error}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-[var(--bolt-border-radius)] border border-bolt-elements-borderColor my-2 overflow-x-auto shadow-sm min-h-[100px]"
    >
      {svg ? (
        <div className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="i-ph:spinner-gap animate-spin text-2xl text-sky-500" />
          <span className="text-[10px] text-bolt-elements-textTertiary animate-pulse">Rendering diagram...</span>
        </div>
      )}
    </div>
  );
};
