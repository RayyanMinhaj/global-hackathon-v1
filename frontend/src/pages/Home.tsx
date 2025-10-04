import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="page">
      <h1>Welcome to the Hackathon App</h1>
      <p>This is the home page of your application.</p>
      <div className="features">
        <h2>Features</h2>
        <ul>
          <li>React Router for navigation</li>
          <li>Flask backend with logging</li>
          <li>Modern UI with CSS</li>
          <li>TypeScript support</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
