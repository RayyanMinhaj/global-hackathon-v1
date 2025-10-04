import React, { useState, useEffect } from 'react';


const About: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  
  useEffect(() => {
    // Test backend connection
    fetch('http://127.0.0.1:5000/health')
      .then(response => response.json())
      .then(data => {
        setBackendStatus(data.status === 'healthy' ? 'Connected ✅' : 'Error ❌');
      })
      .catch(() => {
        setBackendStatus('Disconnected ❌');
      });
  }, []);

  return (
    <div className="page">
      <h1>About This Project</h1>
      <div className="about-content">
        <section>
          <h2>Project Overview</h2>
          <p>
            This is a full-stack application built for a hackathon, featuring a React frontend 
            with TypeScript and a Flask backend with comprehensive logging.
          </p>
        </section>
        
        <section>
          <h2>Backend Status</h2>
          <p>Backend Connection: <strong>{backendStatus}</strong></p>
          {backendStatus.includes('❌') && (
            <p className="error">
              Make sure to start the Flask backend server: <code>python app.py</code>
            </p>
          )}
        </section>

        <section>
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <h3>Frontend</h3>
              <ul>
                <li>React 19</li>
                <li>TypeScript</li>
                <li>React Router</li>
                <li>Vite</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Backend</h3>
              <ul>
                <li>Flask</li>
                <li>Python</li>
                <li>Logging</li>
                <li>CORS</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
