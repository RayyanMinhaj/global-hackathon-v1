import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

// Types for configuration
interface ColorTheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
  border?: string;
  code?: string;
}

interface MarkdownMermaidViewerProps {
  content: string;
  colorTheme?: ColorTheme;
  className?: string;
}

// Error Boundary for Mermaid
class MermaidErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Mermaid rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          Error rendering diagram
        </div>
      );
    }
    return this.props.children;
  }
}

// Mermaid Diagram Component
const MermaidDiagram: React.FC<{ chart: string; theme: Required<ColorTheme> }> = ({ chart, theme }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [diagramId] = useState(() => `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    
    if (chart && !renderingRef.current) {
      const renderDiagram = async () => {
        try {
          renderingRef.current = true;
          setIsRendering(true);
          setError(null);
          
          if (svgContainerRef.current && mountedRef.current) {
            while (svgContainerRef.current.firstChild) {
              svgContainerRef.current.removeChild(svgContainerRef.current.firstChild);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 50));
          
          if (!mountedRef.current) return;
          
          const { svg } = await mermaid.render(diagramId, chart);
          
          if (svgContainerRef.current && mountedRef.current) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svg;
            const svgElement = tempDiv.querySelector('svg');
            
            if (svgElement) {
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
              svgElement.style.display = 'block';
              svgElement.style.margin = '0 auto';
              svgContainerRef.current.appendChild(svgElement);
            }
          }
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error);
          if (mountedRef.current) {
            setError('Error rendering diagram');
          }
        } finally {
          if (mountedRef.current) {
            setIsRendering(false);
            renderingRef.current = false;
          }
        }
      };
      
      const timeoutId = setTimeout(renderDiagram, 100);
      return () => clearTimeout(timeoutId);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [chart, diagramId]);

  useEffect(() => {
    const svgContainer = svgContainerRef.current;
    return () => {
      mountedRef.current = false;
      renderingRef.current = false;
      if (svgContainer) {
        try {
          while (svgContainer.firstChild) {
            svgContainer.removeChild(svgContainer.firstChild);
          }
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div 
      className="flex justify-center my-4" 
      data-diagram-id={diagramId}
      style={{ minHeight: '50px' }}
    >
      {isRendering && (
        <div className="flex items-center justify-center p-4">
          <div 
            className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{
              borderColor: `${theme.primary}30`,
              borderTopColor: theme.primary
            }}
          ></div>
          <span className="ml-2" style={{ color: theme.text }}>
            Rendering diagram...
          </span>
        </div>
      )}
      {error && (
        <div className="text-red-400 text-center p-4 text-sm">
          {error}
        </div>
      )}
      <div 
        ref={svgContainerRef} 
        className={`${isRendering || error ? 'hidden' : 'block'} w-full`}
      />
    </div>
  );
};

// Main Component
const MarkdownMermaidViewer: React.FC<MarkdownMermaidViewerProps> = ({ 
  content, 
  colorTheme = {},
  className = ''
}) => {
  const theme: Required<ColorTheme> = useMemo(() => ({
    primary: colorTheme.primary || '#22D3EE',
    secondary: colorTheme.secondary || '#67E8F9',
    accent: colorTheme.accent || '#0EA5E9',
    background: colorTheme.background || '#1c1c1c',
    text: colorTheme.text || '#D1D5DB',
    border: colorTheme.border || '#374151',
    code: colorTheme.code || '#2a2a2a'
  }), [colorTheme]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: theme.primary,
        primaryTextColor: '#ffffff',
        primaryBorderColor: theme.primary,
        lineColor: theme.secondary,
        secondaryColor: theme.code,
        tertiaryColor: theme.background,
      }
    });
  }, [theme]);

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      style={{ 
        backgroundColor: theme.background,
        color: theme.text,
        padding: '1rem',
        borderRadius: '0.5rem'
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: (props) => {
            const { className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match?.[1];
            
            if (language === 'mermaid') {
              const chart = String(children).replace(/\n$/, '');
              const chartKey = `mermaid-${chart.slice(0, 50).replace(/\s+/g, '-')}-${Date.now()}`;
              return (
                <MermaidErrorBoundary key={chartKey}>
                  <MermaidDiagram chart={chart} theme={theme} />
                </MermaidErrorBoundary>
              );
            }
            
            return (
              <code 
                className={`${className || ''} px-1 rounded`}
                style={{ 
                  backgroundColor: theme.code,
                  color: theme.secondary
                }}
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre: (props) => {
            const { children } = props;
            return (
              <pre 
                className="p-4 rounded-lg overflow-x-auto"
                style={{ backgroundColor: theme.code }}
              >
                {children}
              </pre>
            );
          },
          h1: (props) => {
            const { children } = props;
            return (
              <h1 
                className="text-3xl font-bold mb-4 pb-2 border-b"
                style={{ 
                  color: '#fff',
                  borderColor: `${theme.primary}33`
                }}
              >
                {children}
              </h1>
            );
          },
          h2: (props) => {
            const { children } = props;
            return (
              <h2 
                className="text-2xl font-bold mb-3 mt-6"
                style={{ color: '#fff' }}
              >
                {children}
              </h2>
            );
          },
          h3: (props) => {
            const { children } = props;
            return (
              <h3 
                className="text-xl font-bold mb-2 mt-4"
                style={{ color: theme.primary }}
              >
                {children}
              </h3>
            );
          },
          h4: (props) => {
            const { children } = props;
            return (
              <h4 
                className="text-lg font-semibold mb-2 mt-3"
                style={{ color: theme.secondary }}
              >
                {children}
              </h4>
            );
          },
          p: (props) => {
            const { children } = props;
            return (
              <p 
                className="mb-4 leading-relaxed"
                style={{ color: theme.text }}
              >
                {children}
              </p>
            );
          },
          ul: (props) => {
            const { children } = props;
            return (
              <ul className="mb-4 space-y-2">
                {children}
              </ul>
            );
          },
          ol: (props) => {
            const { children } = props;
            return (
              <ol className="mb-4 space-y-2 list-decimal list-inside">
                {children}
              </ol>
            );
          },
          li: (props) => {
            const { children } = props;
            return (
              <li className="flex items-start">
                <span 
                  className="w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0"
                  style={{ backgroundColor: theme.primary }}
                ></span>
                <span style={{ color: theme.text }}>{children}</span>
              </li>
            );
          },
          strong: (props) => {
            const { children } = props;
            return (
              <strong 
                className="font-semibold"
                style={{ color: theme.secondary }}
              >
                {children}
              </strong>
            );
          },
          em: (props) => {
            const { children } = props;
            return (
              <em style={{ color: theme.secondary }}>
                {children}
              </em>
            );
          },
          blockquote: (props) => {
            const { children } = props;
            return (
              <blockquote 
                className="border-l-4 pl-4 py-2 my-4 italic"
                style={{ 
                  borderColor: theme.primary,
                  backgroundColor: `${theme.code}80`,
                  color: theme.text
                }}
              >
                {children}
              </blockquote>
            );
          },
          a: (props) => {
            const { children, href } = props;
            return (
              <a 
                href={href}
                className="underline hover:no-underline transition-colors"
                style={{ color: theme.accent }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          table: (props) => {
            const { children } = props;
            return (
              <div className="overflow-x-auto my-4">
                <table 
                  className="w-full border-collapse rounded-lg"
                  style={{ border: `1px solid ${theme.border}` }}
                >
                  {children}
                </table>
              </div>
            );
          },
          thead: (props) => {
            const { children } = props;
            return (
              <thead style={{ backgroundColor: `${theme.primary}20` }}>
                {children}
              </thead>
            );
          },
          tbody: (props) => {
            const { children } = props;
            return (
              <tbody style={{ backgroundColor: `${theme.background}80` }}>
                {children}
              </tbody>
            );
          },
          tr: (props) => {
            const { children } = props;
            return (
              <tr 
                className="transition-colors"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                {children}
              </tr>
            );
          },
          th: (props) => {
            const { children } = props;
            return (
              <th 
                className="px-4 py-2 text-left text-sm font-semibold"
                style={{ 
                  border: `1px solid ${theme.border}`,
                  color: theme.primary,
                  backgroundColor: `${theme.primary}10`
                }}
              >
                {children}
              </th>
            );
          },
          td: (props) => {
            const { children } = props;
            return (
              <td 
                className="px-4 py-2 text-sm"
                style={{ 
                  border: `1px solid ${theme.border}`,
                  color: theme.text
                }}
              >
                {children}
              </td>
            );
          },
          hr: () => (
            <hr 
              className="my-6"
              style={{ borderColor: theme.border }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Export the component
export default MarkdownMermaidViewer;
export type { MarkdownMermaidViewerProps, ColorTheme };