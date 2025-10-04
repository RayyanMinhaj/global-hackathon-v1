import React, { useState } from 'react';
import { useMessage } from '../hooks';
import { getApiUrl } from '../config/environment';

const Home: React.FC = () => {
  const [message, setMessage] = useMessage();
  const [erdResponse, setErdResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
        <p>Test the backend ERD generation API with sample data:</p>
        
        <button 
          onClick={testErdGeneration} 
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Generating ERD...' : 'Test ERD Generation'}
        </button>
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {erdResponse && (
          <div style={{ marginTop: '20px' }}>
            <h3>ERD Response:</h3>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {erdResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
