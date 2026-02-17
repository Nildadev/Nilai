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
    // Basic validation: Don't render if it's just the header or too short
    if (chart.trim().split('\n').length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsTyping(false);
        const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs' as any)).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: document.querySelector('html')?.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter',
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if chart is valid before rendering
        try {
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
          setError(null);
        } catch (renderErr) {
          // If it fails, it might still be streaming
          console.warn('Incomplete mermaid syntax...');
        }
      } catch (err: any) {
        console.error('Mermaid module error:', err);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [chart]);

  if (error && !isTyping) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs">
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-lg border border-bolt-elements-borderColor my-2 overflow-x-auto shadow-sm min-h-[100px]"
    >
      {svg ? (
        <div className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="i-ph:spinner-gap animate-spin text-2xl text-sky-500" />
          <span className="text-[10px] text-bolt-elements-textTertiary animate-pulse">Generating diagram...</span>
        </div>
      )}
    </div>
  );
};
