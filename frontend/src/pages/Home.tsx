import React, { useState } from 'react';
import { useMessage } from '../hooks';
import { getApiUrl } from '../config/environment';
import MarkdownMermaidExample from '../examples/MarkdownMermaidExample';

const Home: React.FC = () => {
  const [message, setMessage] = useMessage();
  const [erdResponse, setErdResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testSampleDiagram = () => {
    const sampleMarkdownWithMermaid = `# Sample ERD Diagram

This is a sample Entity Relationship Diagram created with Mermaid:

\`\`\`mermaid
erDiagram
    USERS {
        int id PK
        varchar username UK
        varchar email UK
        timestamp created_at
    }
    POSTS {
        int id PK
        int user_id FK
        varchar title
        text content
        timestamp created_at
    }
    COMMENTS {
        int id PK
        int post_id FK
        int user_id FK
        text content
        timestamp created_at
    }
    
    USERS ||--o{ POSTS : "creates"
    POSTS ||--o{ COMMENTS : "has"
    USERS ||--o{ COMMENTS : "writes"
\`\`\`

## Features Demonstrated

- **Primary Keys (PK)**: Unique identifiers for each table
- **Foreign Keys (FK)**: References between tables
- **Unique Keys (UK)**: Unique constraints
- **Relationships**: One-to-many relationships between entities

### Additional Notes

This diagram shows a simple blog-like system with:
1. Users who can create posts
2. Posts that belong to users
3. Comments that belong to both posts and users
`;
    setErdResponse(sampleMarkdownWithMermaid);
  };

  const handleUpdateMessage = () => {
    setMessage(`Updated at ${new Date().toLocaleTimeString()}`);
  };

  const handleResetMessage = () => {
    setMessage('Hello from Jotai!');
  };

  const testErdGeneration = async () => {
    setIsLoading(true);
    setError('');
    setErdResponse('');
    
    // Sample table definitions for testing
    const sampleTableDefinitions = [
      {
        table_name: "users",
        columns: [
          { name: "id", type: "INTEGER", primary_key: true },
          { name: "username", type: "VARCHAR(50)", unique: true },
          { name: "email", type: "VARCHAR(100)", unique: true },
          { name: "created_at", type: "TIMESTAMP" }
        ]
      },
      {
        table_name: "posts",
        columns: [
          { name: "id", type: "INTEGER", primary_key: true },
          { name: "user_id", type: "INTEGER", foreign_key: "users.id" },
          { name: "title", type: "VARCHAR(200)" },
          { name: "content", type: "TEXT" },
          { name: "created_at", type: "TIMESTAMP" }
        ]
      }
    ];

    try {
      // Use the environment configuration for backend URL
      const response = await fetch(getApiUrl('/api/generate_erd'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_definitions: sampleTableDefinitions
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setErdResponse(data.erd_diagram);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Welcome to the Hackathon App</h1>
      <p>This is the home page showcasing simple Jotai state management.</p>
      
      <div className="features">
        <h2>Features</h2>
        <ul>
          <li>React Router for navigation</li>
          <li>Flask backend with logging</li>
          <li>Modern UI with CSS</li>
          <li>TypeScript support</li>
          <li>✨ Simple Jotai state management</li>
        </ul>
      </div>

      <div className="jotai-demo">
        <h2>Jotai Demo</h2>
        <div className="message-display">
          <p><strong>Current message:</strong> {message}</p>
        </div>
        
        <div className="controls">
          <button onClick={handleUpdateMessage} className="btn-primary">
            Update Message
          </button>
          <button onClick={handleResetMessage} className="btn-secondary">
            Reset Message
          </button>
        </div>
      </div>

      <div className="erd-test">
        <h2>ERD Generation Test</h2>
        <p>Test the Mermaid diagram rendering with sample data:</p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={testSampleDiagram}
            className="btn-secondary"
          >
            Show Sample Diagram
          </button>
          
          <button 
            onClick={testErdGeneration} 
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Generating ERD...' : 'Test Backend API'}
          </button>
        </div>
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

       <MarkdownMermaidExample />
      </div>
    </div>
  );
};

export default Home;
