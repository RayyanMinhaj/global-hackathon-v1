import React, { useState } from 'react';
import MarkdownMermaidViewer from '../components/MarkdownMermaidViewer';

const DocumentationDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);



  const handleGenerate = () => {
    const API_URL = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || 'http://localhost:5000';

    setIsGenerating(true);

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
        const content = data.srs_document || data.srs || data.document || '';
        setGeneratedContent(content || 'No document returned from server.');
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