import React, { useState } from 'react';

function IdeaGenerator() {
  // Type for a suggested idea object
  type SuggestedIdea = {
    generated_idea: string;
    [key: string]: any;
  };

  // State definitions (isLoading, finalIdea, etc. remain the same)
  const [suggestedIdeas, setSuggestedIdeas] = useState<SuggestedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalIdea, setFinalIdea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Educational');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [variations, setVariations] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // State for the reference tweets library
  type ReferenceTweet = {
    text: string;
    tag: string;
  };
  const [referenceTweets, setReferenceTweets] = useState<ReferenceTweet[]>([]);
  const [newTweetText, setNewTweetText] = useState('');
  const [newTweetTag, setNewTweetTag] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTweetText, setEditTweetText] = useState('');
  const [editTweetTag, setEditTweetTag] = useState('');

  // Handlers (handleSubmit, fetchIdeas, handleCopyIdea remain the same)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setVariations(null);

    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/second', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_idea: finalIdea,
          category: selectedCategory,
          tone_style: selectedTone,
          reference_tweets: referenceTweets.filter(t => t.tag === selectedTone).map(t => t.text),
        }),
      });
      const data = await response.json();
      setVariations(data);
    } catch (error) {
      console.error("Error generating variations:", error);
      alert("Failed to generate variations. Make sure your n8n 'Generate Variations' workflow is active.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (ideaText: string) => {
    setFinalIdea(ideaText);
  };

  const fetchIdeas = async () => {
    setIsLoading(true);
    setSuggestedIdeas([]);
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/start', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      let foundIdeas: SuggestedIdea[] = [];
      if (Array.isArray(data)) foundIdeas = data;
      else if (data && Array.isArray(data.items)) foundIdeas = data.items;
      else if (data && data.generated_idea) foundIdeas = [data];
      setSuggestedIdeas(foundIdeas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      alert("Failed to fetch ideas. Make sure your n8n 'Get Ideas' workflow is active and CORS is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyIdea = async (ideaText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(ideaText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      alert('Failed to copy!');
    }
  };

  const handleAddOrUpdateTweet = () => {
    if (editIndex !== null) { // Update existing
      if (editTweetText.trim() && editTweetTag) {
        setReferenceTweets(referenceTweets.map((t, i) => i === editIndex ? { text: editTweetText, tag: editTweetTag } : t));
        setEditIndex(null); setEditTweetText(''); setEditTweetTag('');
      }
    } else { // Add new
      if (newTweetText.trim() && newTweetTag) {
        setReferenceTweets([...referenceTweets, { text: newTweetText, tag: newTweetTag }]);
        setNewTweetText(''); setNewTweetTag('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditIndex(null); setEditTweetText(''); setEditTweetTag('');
  }


  return (
    <div className="generator-container">
      <div className="generator-column">
        {/* Section for Suggested Ideas */}
        <div className="card">
          <h3>Suggested Ideas</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)'}}>Click an idea to use it, or copy it for later.</p>
          <button
            type="button"
            onClick={fetchIdeas}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? 'Fetching...' : 'Fetch New Ideas'}
          </button>
          <div className="ideas-list">
            {Array.isArray(suggestedIdeas) && suggestedIdeas.length > 0 ? (
              suggestedIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(idea.generated_idea)}
                  title="Click to use this idea"
                >
                  <span>{idea.generated_idea}</span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={e => { e.stopPropagation(); handleCopyIdea(idea.generated_idea, index); }}
                    aria-label="Copy idea"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === index ? (
                      <span className="success-icon">✓ Copied</span>
                    ) : (
                      <span>📋</span>
                    )}
                  </button>
                </div>
              ))
            ) : (
              !isLoading && <p className="placeholder-text">Click "Fetch New Ideas" to start.</p>
            )}
          </div>
        </div>
      </div>

      <div className="generator-column">
        {/* Main Form for Submission */}
        <form onSubmit={handleSubmit} className="card">
          <h3>Create Your Content</h3>
          <div className="form-group">
            <label htmlFor="idea-paste-area" className="form-label">Your Chosen Idea</label>
            <textarea
              id="idea-paste-area"
              className="form-input"
              value={finalIdea}
              onChange={(e) => setFinalIdea(e.target.value)}
              required
              rows={4}
              placeholder="Click an idea, or type your own here..."
            />
          </div>

          {/* Reference Tweet Library */}
          <div className="form-group">
            <label className="form-label">Reference Tweet Library <span style={{ color: 'var(--danger-color)' }}>*</span></label>
            
            {/* FIX: Ensure Select dropdown is always visible, manage state dynamically */}
            <div className="reference-tweet-controls">
              <input
                type="text"
                className="form-input"
                placeholder="Enter example tweet text"
                value={editIndex !== null ? editTweetText : newTweetText}
                onChange={e => editIndex !== null ? setEditTweetText(e.target.value) : setNewTweetText(e.target.value)}
              />
               <select
                className="form-input form-select"
                value={editIndex !== null ? editTweetTag : newTweetTag}
                onChange={e => editIndex !== null ? setEditTweetTag(e.target.value) : setNewTweetTag(e.target.value)}
                >
                <option value="">Select Tag</option>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
              </select>
              
              {editIndex !== null ? (
                <>
                  <button type="button" className="btn btn-secondary" onClick={handleAddOrUpdateTweet}>Update</button>
                  <button type="button" className="btn btn-link" onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={handleAddOrUpdateTweet}>Add</button>
              )}
            </div>

            <div className="reference-tweet-list">
              {referenceTweets.length > 0 ? (
                <ul>
                  {referenceTweets.map((tweet, idx) => (
                    <li key={idx} className="reference-tweet-item">
                      <span className="text">{tweet.text}</span>
                      <span className="tag">{tweet.tag}</span>
                      <div className="actions">
                          <button type="button" className="btn-link" onClick={() => {
                          setEditIndex(idx); setEditTweetText(tweet.text); setEditTweetTag(tweet.tag);
                          }}>Edit</button>
                          <button type="button" className="btn-link danger" onClick={() => setReferenceTweets(referenceTweets.filter((_, i) => i !== idx))}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="error-text">Please add at least one reference tweet.</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category-select" className="form-label">Category</label>
            <select id="category-select" className="form-input" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="Educational">Educational</option>
              <option value="BuildInPublic">BuildInPublic</option>
              <option value="SuccessStory">SuccessStory</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tone-select" className="form-label">Tone/Style</label>
            <select id="tone-select" className="form-input" value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)}>
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="witty">Witty</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isGenerating || !finalIdea || referenceTweets.length === 0}>
            {isGenerating ? 'Generating...' : 'Generate Tweets'}
          </button>
        </form>

        {/* Section for Output */}
        {isGenerating && <div className="card"><p className="placeholder-text">Generating variations...</p></div>}
        
        {variations && (
          <div className="card variations-output">
            <h3>Generated Variations</h3>
            <div className="variation-card"><strong>Variation 1:</strong> {Array.isArray(variations) ? variations[0].variation1 : variations.variation1}</div>
            <div className="variation-card"><strong>Variation 2:</strong> {Array.isArray(variations) ? variations[0].variation2 : variations.variation2}</div>
            <div className="variation-card"><strong>Variation 3:</strong> {Array.isArray(variations) ? variations[0].variation3 : variations.variation3}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdeaGenerator;