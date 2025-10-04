import React from 'react';
import { useMessage } from '../hooks';

const Home: React.FC = () => {
  const [message, setMessage] = useMessage();

  const handleUpdateMessage = () => {
    setMessage(`Updated at ${new Date().toLocaleTimeString()}`);
  };

  const handleResetMessage = () => {
    setMessage('Hello from Jotai!');
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
    </div>
  );
};

export default Home;
