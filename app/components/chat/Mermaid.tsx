import React, { useEffect, useRef, useState } from 'react';
import { classNames } from '~/utils/classNames';

interface MermaidProps {
  chart: string;
}

export const Mermaid = ({ chart }: MermaidProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      try {
        // Dynamically import mermaid from CDN to avoid build-time issues
        const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs' as any)).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: document.querySelector('html')?.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter',
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        
        setSvg(svg);
        setError(null);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram. Please check the syntax.');
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs">
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container flex justify-center p-4 bg-white dark:bg-zinc-900 rounded-lg border border-bolt-elements-borderColor my-2 overflow-x-auto shadow-sm"
      dangerouslySetInnerHTML={{ __html: svg || '<div class="i-ph:spinner-gap animate-spin text-2xl text-sky-500" />' }}
    />
  );
};
