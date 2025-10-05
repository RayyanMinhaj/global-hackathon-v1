import React, { useState } from 'react';
import MarkdownMermaidViewer from '../components/MarkdownMermaidViewer';
import ScreenMockupDisplay from '../components/ScreenMockupDisplay';

type ViewType = 'srs' | 'diagrams' | 'screens';

const DocumentationDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<Array<{ name: string; content: string; status: 'loading' | 'done' | 'error' }>>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('srs');
  const [screenMockups, setScreenMockups] = useState<Array<{ name: string; mockupUrl?: string; status: 'loading' | 'done' | 'error' }>>([]);

  const handleGenerate = () => {
    const API_URL = (import.meta.env && (import.meta.env.VITE_BACKEND_URL_PROD as string)) || 'http://localhost:5000';

    setIsGenerating(true);
    setHasGenerated(true);
    // Clear previous state
    setSections([]);
    setScreenMockups([]);

    (async () => {
      try {
        const resp = await fetch(`${API_URL}/api/generate_srs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: inputText })
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || `Request failed with status ${resp.status}`);
        }

        const data = await resp.json();
        const srs = data.srs_document || data.srs || data.document || '';
        const initial = srs || 'No SRS returned from server.';
        setSections([{ name: 'SRS', content: initial, status: 'done' }]);

        const addSectionLoading = (title: string) => {
          setSections(prev => [...prev, { name: title, content: '', status: 'loading' }]);
        };

        const updateSection = (title: string, content: string, status: 'done' | 'error' = 'done') => {
          setSections(prev => prev.map(s => (s.name === title ? { ...s, content, status } : s)));
        };

        const ensureMermaid = (code: string) => {
          if (!code) return '';
          if (code.includes('```mermaid')) return code;
          const looksLikeMermaid = /(^|\n)\s*(graph|flowchart|sequenceDiagram|erDiagram|classDiagram|stateDiagram)/i.test(code);
          if (looksLikeMermaid) {
            return '\n\n' + '```mermaid\n' + code + '\n```' + '\n';
          }
          return code;
        };

        const callAgent = async (name: string, url: string, body: any, extractor: (d: any) => string) => {
          addSectionLoading(name);
          try {
            const r = await fetch(`${API_URL}${url}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            if (!r.ok) {
              const err = await r.json().catch(() => ({}));
              updateSection(name, err.error || `Request failed with status ${r.status}`, 'error');
              return;
            }
            const jd = await r.json().catch(() => ({}));
            let content = extractor(jd) || JSON.stringify(jd);
            content = ensureMermaid(content);
            updateSection(name, content, 'done');
          } catch (err: any) {
            updateSection(name, err?.message || String(err), 'error');
          }
        };

        const source = srs || inputText;

        await callAgent('ERD', '/api/generate_erd', { table_definitions: [source] }, (d) => d?.erd_diagram || d?.erd || d?.diagram || '');
        await callAgent('System Architecture', '/api/generate_architecture', { requirements: source }, (d) => d?.architecture_diagram || d?.architecture || '');
        await callAgent('Dataflow', '/api/generate_dataflow', { description: source }, (d) => d?.dataflow_diagram || d?.dataflow || '');
        await callAgent('Sequence', '/api/generate_sequence', { description: source }, (d) => d?.sequence_diagram || d?.sequence || '');
        await callAgent('Palette', '/api/generate_palette', { description: source }, (d) => d?.palette_diagram || d?.palette || '');
        await callAgent('Microservices', '/api/generate_microservices', { requirements: source, scale: 'medium', consistency: 'eventual' }, (d) => d?.architecture_diagram || d?.architecture || '');

        // Generate screen mockups - Start immediately
        console.log('Starting screen mockup generation...');
        
        // Initialize screen mockups with loading state
        setScreenMockups([
          { name: 'Home Page', mockupUrl: undefined, status: 'loading' },
          { name: 'Dashboard', mockupUrl: undefined, status: 'loading' },
          { name: 'User Profile', mockupUrl: undefined, status: 'loading' }
        ]);

        // Simulate mockup generation with delays
        setTimeout(() => {
          console.log('Updating Home Page mockup...');
          setScreenMockups(prev => prev.map(s => 
            s.name === 'Home Page' ? { ...s, status: 'done' as const } : s
          ));
        }, 2000);
        
        setTimeout(() => {
          console.log('Updating Dashboard mockup...');
          setScreenMockups(prev => prev.map(s => 
            s.name === 'Dashboard' ? { ...s, status: 'done' as const } : s
          ));
        }, 3000);
        
        setTimeout(() => {
          console.log('Updating User Profile mockup...');
          setScreenMockups(prev => prev.map(s => 
            s.name === 'User Profile' ? { ...s, status: 'done' as const } : s
          ));
        }, 4000);

      } catch (e: any) {
        setSections([{ name: 'SRS', content: `Error generating document: ${e?.message || e}`, status: 'error' }]);
      } finally {
        setIsGenerating(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative">
      {/* Frosted Glass Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/30 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-purple-600">MiddlWare</span>
            <span className="text-gray-700"> Docs</span>
          </h1>
          <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium text-gray-700 transition-all">
            Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100vh-73px)] overflow-hidden">
        <div className={`h-full transition-all duration-700 ease-in-out ${hasGenerated ? 'flex' : 'flex items-center justify-center'}`}>
          {/* Input Section */}
          <div className={`transition-all duration-700 ease-in-out ${
            hasGenerated 
              ? 'w-1/2 border-r border-white/30 flex flex-col h-full' 
              : 'w-full max-w-3xl px-6'
          }`}>
            {!hasGenerated && (
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                    Fire your middlemen.
                  </span>
                </h2>
                <p className="text-2xl md:text-3xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
                  MiddlWare turns your ideas and brain dumps into{' '}
                  <span className="text-purple-600 font-semibold">SRS documents</span>,{' '}
                  <span className="text-pink-500 font-semibold">diagrams</span>, and{' '}
                  <span className="text-orange-500 font-semibold">mockups</span> devs can use.
                </p>
              </div>
            )}
            
            <div className={`flex flex-col ${hasGenerated ? 'h-full p-6' : ''}`}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your project requirements, features, or any specifications you'd like to document..."
                className={`w-full p-6 rounded-2xl border-2 border-white/40 bg-white/30 backdrop-blur-md text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 shadow-lg ${
                  hasGenerated ? 'flex-1 mb-4' : 'h-64 mb-6'
                }`}
              />
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  isGenerating
                    ? 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white hover:shadow-2xl hover:scale-105'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Documentation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Panel - Slides in from right */}
          {hasGenerated && (
            <div className="w-1/2 h-full bg-white/10 backdrop-blur-sm animate-slide-in-right overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold text-gray-800">Preview</h2>
                  </div>
                  
                  {/* View Type Dropdown */}
                  <div className="relative">
                    <select
                      value={currentView}
                      onChange={(e) => setCurrentView(e.target.value as ViewType)}
                      className="px-4 py-2 rounded-lg border-2 border-white/40 bg-white/30 backdrop-blur-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
                    >
                      <option value="srs">SRS Document</option>
                      <option value="diagrams">Diagrams</option>
                      <option value="screens">Screen Mockups</option>
                    </select>
                  </div>
                </div>
                
                {sections.length > 0 || screenMockups.length > 0 ? (
                  <div className="space-y-6">
                    {/* SRS Document View */}
                    {currentView === 'srs' && (
                      <div>
                        {sections.filter(s => s.name === 'SRS').map((s) => (
                          <div key={s.name} className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-semibold text-gray-800">{s.name}</h3>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                s.status === 'loading' 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : s.status === 'error' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                            <div className="prose max-w-none">
                              <MarkdownMermaidViewer
                                content={s.content || (s.status === 'loading' ? 'Generating...' : 'No content')}
                                colorTheme={{
                                  primary: '#7C3AED',
                                  secondary: '#DB2777',
                                  accent: '#EA580C',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  text: '#1F2937',
                                  border: 'rgba(255, 255, 255, 0.3)',
                                  code: 'rgba(255, 255, 255, 0.2)'
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                        {sections.filter(s => s.name === 'SRS').length === 0 && (
                          <div className="text-center text-gray-500 py-12">
                            <p>No SRS document generated yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Diagrams View */}
                    {currentView === 'diagrams' && (
                      <div>
                        {sections.filter(s => s.name !== 'SRS').map((s) => (
                          <div key={s.name} className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-semibold text-gray-800">{s.name}</h3>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                s.status === 'loading' 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : s.status === 'error' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                            <div className="prose max-w-none">
                              <MarkdownMermaidViewer
                                content={s.content || (s.status === 'loading' ? 'Generating...' : 'No content')}
                                colorTheme={{
                                  primary: '#7C3AED',
                                  secondary: '#DB2777',
                                  accent: '#EA580C',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  text: '#1F2937',
                                  border: 'rgba(255, 255, 255, 0.3)',
                                  code: 'rgba(255, 255, 255, 0.2)'
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                        {sections.filter(s => s.name !== 'SRS').length === 0 && (
                          <div className="text-center text-gray-500 py-12">
                            <p>No diagrams generated yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Screen Mockups View */}
                    {currentView === 'screens' && (
                      <div>
                        {screenMockups.length > 0 ? (
                          screenMockups.map((screen) => (
                            <div key={screen.name} className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">{screen.name}</h3>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  screen.status === 'loading' 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : screen.status === 'error' 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {screen.status}
                                </span>
                              </div>
                              {screen.status === 'loading' ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                  <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                                  <p className="text-gray-500">Generating mockup...</p>
                                </div>
                              ) : (
                                <ScreenMockupDisplay
                                  mockupUrl={screen.mockupUrl}
                                  title={`${screen.name} Mockup`}
                                  colorTheme={{
                                    primary: '#7C3AED',
                                    secondary: '#DB2777',
                                    accent: '#EA580C',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    text: '#1F2937',
                                    border: 'rgba(255, 255, 255, 0.3)',
                                  }}
                                  className="w-full"
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-12">
                            <p>No screen mockups generated yet</p>
                            <p className="text-sm mt-2">Screen mockups length: {screenMockups.length}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg">Generating documentation...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DocumentationDashboard;