import React, { useState } from 'react';
import MarkdownMermaidViewer from '../components/MarkdownMermaidViewer';

const DocumentationDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mockup markdown content with mermaid diagram
  const mockupContent = `# Software Requirements Specification (SRS)

## 1. Introduction

This document outlines the requirements for the **FlowSync Project Management System**, a comprehensive platform designed to streamline team collaboration and project tracking.

### 1.1 Purpose
To provide a unified solution for project planning, team collaboration, and progress tracking.

### 1.2 Scope
FlowSync will serve teams of all sizes, from startups to enterprise organizations.

## 2. System Architecture

\`\`\`mermaid
graph TB
    A[Frontend React App] --> B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Project Management Service]
    B --> E[Collaboration Service]
    B --> F[Analytics Service]
    
    C --> G[(User Database)]
    D --> H[(Project Database)]
    E --> I[(Messages Database)]
    F --> J[(Analytics Database)]
    
    K[Real-time Updates] --> E
    L[File Storage] --> D
\`\`\`

## 3. Core Features

### 3.1 Project Planning
- **Task Management**: Create, assign, and track tasks
- **Timeline Visualization**: Gantt charts and milestone tracking
- **Resource Allocation**: Manage team capacity and workload

### 3.2 Team Collaboration
- **Real-time Chat**: Instant messaging within projects
- **File Sharing**: Document upload and version control
- **Comments & Reviews**: Collaborative feedback system

### 3.3 Analytics & Reporting
- **Progress Tracking**: Visual dashboards and metrics
- **Performance Analytics**: Team productivity insights
- **Custom Reports**: Exportable project summaries

## 4. User Flow Diagram

\`\`\`mermaid
flowchart LR
    A[User Login] --> B{New User?}
    B -->|Yes| C[Onboarding]
    B -->|No| D[Dashboard]
    C --> D
    D --> E[Select Project]
    E --> F[Project Workspace]
    F --> G[Create Tasks]
    F --> H[Collaborate]
    F --> I[View Analytics]
\`\`\`

## 5. Technical Requirements

### 5.1 Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with glassmorphism design
- **State Management**: React hooks and context

### 5.2 Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Real-time**: WebSocket connections

## 6. Security Requirements

> **Important**: All user data must be encrypted at rest and in transit.

### Security Measures:
1. **Authentication**: Multi-factor authentication
2. **Authorization**: Role-based access control
3. **Data Protection**: End-to-end encryption
4. **Monitoring**: Real-time security alerts

## 7. Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | < 2s | 1.3s |
| API Response | < 500ms | 280ms |
| Uptime | 99.9% | 99.95% |
| Concurrent Users | 10,000+ | 5,000 |

---

*This document will be updated as requirements evolve and new features are planned.*`;

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setGeneratedContent(mockupContent);
      setIsGenerating(false);
    }, 1500);
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