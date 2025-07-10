import React from 'react';
import IdeaGenerator from './IdeaGenerator';
 
function App() {
  return (
    <div className="
      w-full max-w-screen-xl mx-auto
      px-4 py-8 md:px-6 lg:px-8
      bg-gray-50 text-gray-900
      min-h-screen
    ">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2">
          AI Tweet Idea Generator
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Let our AI assistant help you craft the perfect tweet.
        </p>
      </header>
      <IdeaGenerator />
    </div>
  );
}
 
export default App;