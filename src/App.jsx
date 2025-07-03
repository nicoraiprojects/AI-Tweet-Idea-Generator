import React from 'react';
import './App.css'; // Import the new global styles
import IdeaGenerator from './IdeaGenerator';

function App() {
  return (
    <div className="app-container">
      <header style={{textAlign:'center'}} className="app-header">
      
        <h1>AI Tweet Idea Generator</h1>
        <p>Let our AI assistant help you craft the perfect tweet.</p>
      </header>
      <IdeaGenerator />
    </div>
  );
}

export default App;