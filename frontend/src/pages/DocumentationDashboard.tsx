import React, { useState } from 'react';
import MarkdownMermaidViewer from '../components/MarkdownMermaidViewer';

const DocumentationDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);



  const handleGenerate = () => {
    const API_URL = (import.meta.env && (import.meta.env.VITE_BACKEND_URL_PROD as string)) || 'http://localhost:5000';

    setIsGenerating(true);

    (async () => {
      try {
        // 1) Generate SRS
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
        let combined = srs || 'No SRS returned from server.';

        // 2) Call other agent endpoints in parallel (only agent endpoints)
        const calls = [
          // ERD: send table_definitions as array containing the description/SRS
          fetch(`${API_URL}/api/generate_erd`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_definitions: [inputText || srs] })
          }).then(async r => ({ name: 'ERD', ok: r.ok, data: await r.json().catch(() => ({})), status: r.status })),

          // System architecture
          fetch(`${API_URL}/api/generate_architecture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requirements: inputText || srs })
          }).then(async r => ({ name: 'Architecture', ok: r.ok, data: await r.json().catch(() => ({})), status: r.status })),

          // Dataflow
          fetch(`${API_URL}/api/generate_dataflow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: inputText || srs })
          }).then(async r => ({ name: 'Dataflow', ok: r.ok, data: await r.json().catch(() => ({})), status: r.status })),

          // Sequence
          fetch(`${API_URL}/api/generate_sequence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: inputText || srs })
          }).then(async r => ({ name: 'Sequence', ok: r.ok, data: await r.json().catch(() => ({})), status: r.status })),

          // Palette
          fetch(`${API_URL}/api/generate_palette`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: inputText || srs })
          }).then(async r => ({ name: 'Palette', ok: r.ok, data: await r.json().catch(() => ({})), status: r.status })),

          // Microservices
          fetch(`${API_URL}/api/generate_microservices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requirements: inputText || srs, scale: 'medium', consistency: 'eventual' })
          }).then(async r => ({ name: 'Microservices', ok: r.ok, data: await r.json().catch(() => ({})), status: r.status })),
        ];

        const results = await Promise.allSettled(calls);

        // Append each agent's output
        for (const res of results) {
          if (res.status === 'fulfilled') {
            const out = res.value;
            if (!out.ok) {
              combined += `\n\n## ${out.name} (error)\n\nRequest failed with status ${out.status} - ${out.data?.error || JSON.stringify(out.data)}`;
              continue;
            }

            // For each agent, attempt to extract common fields and append
            switch (out.name) {
              case 'ERD':
                combined += `\n\n## ERD Diagram\n\n${out.data?.erd_diagram || out.data?.erd || JSON.stringify(out.data)}`;
                break;
              case 'Architecture':
                combined += `\n\n## System Architecture\n\n${out.data?.architecture_diagram || JSON.stringify(out.data)}`;
                break;
              case 'Dataflow':
                combined += `\n\n## Dataflow Diagram\n\n${out.data?.dataflow_diagram || JSON.stringify(out.data)}`;
                break;
              case 'Sequence':
                combined += `\n\n## Sequence Diagram\n\n${out.data?.sequence_diagram || JSON.stringify(out.data)}`;
                break;
              case 'Palette':
                combined += `\n\n## Color Palette\n\n${out.data?.palette_diagram || JSON.stringify(out.data)}`;
                break;
              case 'Microservices':
                combined += `\n\n## Microservices Architecture\n\n${out.data?.architecture_diagram || JSON.stringify(out.data)}`;
                break;
              default:
                combined += `\n\n## ${out.name}\n\n${JSON.stringify(out.data)}`;
            }
          } else {
            combined += `\n\n## Unknown Agent Error\n\n${JSON.stringify(res)}`;
          }
        }

        setGeneratedContent(combined);
      } catch (e: any) {
        setGeneratedContent(`Error generating document: ${e?.message || e}`);
      } finally {
        setIsGenerating(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Frosted Glass Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8 pt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Documentation
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                {" "}Generator
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Generate comprehensive documentation with markdown and diagrams
            </p>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 min-h-[600px]">
            {/* Input Section */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 flex flex-col min-h-[600px]">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-purple-600">📝</span>
                Input Requirements
              </h2>
              
              <div className="flex-1 flex flex-col">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your project requirements, features, or any specifications you'd like to document..."
                  className="flex-1 w-full p-4 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
                />
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`mt-4 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
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
                      <span>🚀</span>
                      Generate Documentation
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 flex flex-col min-h-[600px]">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-orange-500">📋</span>
                Generated Documentation
              </h2>
              
              <div className="flex-1 overflow-hidden rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm">
                {generatedContent ? (
                  <div 
                    className="h-full overflow-y-auto max-h-[500px]" 
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(168, 85, 247, 0.5) transparent'
                    }}
                  >
                    <MarkdownMermaidViewer
                      content={generatedContent}
                      colorTheme={{
                        primary: '#7C3AED',
                        secondary: '#DB2777',
                        accent: '#EA580C',
                        background: 'rgba(255, 255, 255, 0.05)',
                        text: '#1F2937',
                        border: 'rgba(255, 255, 255, 0.3)',
                        code: 'rgba(255, 255, 255, 0.2)'
                      }}
                      className="h-full p-4"
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-lg">Your generated documentation will appear here</p>
                      <p className="text-sm mt-2">Click "Generate Documentation" to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationDashboard;