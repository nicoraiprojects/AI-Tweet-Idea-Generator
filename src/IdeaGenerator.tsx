import React, { useState } from 'react';

// You might want to add some basic CSS for the new layout
// Add this to your main CSS file if you don't have it:
/*
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
*/

function IdeaGenerator() {
  type SuggestedIdea = {
    generated_idea: string;
    [key: string]: any;
  };

  type ReferenceTweet = {
    row_number: number;
    Reference_Tweet: string;
    Category: string;
    Tone_Style: string;
  };

  // --- State Variables (No changes here) ---
  const [suggestedIdeas, setSuggestedIdeas] = useState<SuggestedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalIdea, setFinalIdea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Educational');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [variations, setVariations] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [referenceTweets, setReferenceTweets] = useState<ReferenceTweet[]>([]);
  const [newTweetText, setNewTweetText] = useState('');
  const [newTweetTag, setNewTweetTag] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTweetText, setEditTweetText] = useState('');
  const [editTweetTag, setEditTweetTag] = useState('');
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);
  const [selectedForGeneration, setSelectedForGeneration] = useState<ReferenceTweet[]>([]);

  // --- Functions (No changes here) ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setVariations(null);
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          tone: selectedTone,
          reference_tweets: selectedForGeneration.map(t => t.Reference_Tweet)
        }),
      });
      const data = await response.json();
      setVariations(data);
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas. Make sure your n8n 'generate' workflow is active.");
    } finally {
      setIsGenerating(false);
    }
  };
  const fetchIdeas = async () => { setIsLoading(true); setSuggestedIdeas([]); try { const response = await fetch('https://fahisk.app.n8n.cloud/webhook/start', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); const data = await response.json(); let foundIdeas: SuggestedIdea[] = []; if (Array.isArray(data)) foundIdeas = data; else if (data && Array.isArray(data.items)) foundIdeas = data.items; else if (data && data.generated_idea) foundIdeas = [data]; setSuggestedIdeas(foundIdeas); } catch (error) { console.error("Error fetching ideas:", error); alert("Failed to fetch ideas. Make sure your n8n workflow is active."); } finally { setIsLoading(false); } };
  const handleCopyIdea = async (ideaText: string, index: number) => { try { await navigator.clipboard.writeText(ideaText); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 1500); } catch { alert('Failed to copy!'); } };
  const fetchReferenceTweets = async () => { setIsLoadingReferences(true); try { const response = await fetch('https://fahisk.app.n8n.cloud/webhook/second', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ category: selectedCategory, tone: selectedTone }) }); const data = await response.json(); console.log("📦 Raw data from n8n:", data); if (Array.isArray(data)) { const flatTweets = data.map(item => { const raw = item?.json ?? item; return { row_number: raw.row_number, Reference_Tweet: raw["Reference Tweet"], Category: raw.Category, Tone_Style: raw.Tone }; }); setReferenceTweets(flatTweets); console.log("✅ Flattened reference tweets:", flatTweets); } else { console.warn("⚠️ Unexpected data:", data); setReferenceTweets([]); } } catch (error) { alert("Failed to fetch reference tweets."); console.error("Fetch error:", error); setReferenceTweets([]); } finally { setIsLoadingReferences(false); } };
  const handleAddOrUpdateTweet = async () => {
    if (editIndex !== null) {
      handleUpdateReferenceTweet();
    } else {
      if (newTweetText?.trim() && newTweetTag) {
        try {
          // Call the backend to add the new reference tweet
          const response = await fetch('https://fahisk.app.n8n.cloud/webhook/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Reference_Tweet: newTweetText,
              Category: selectedCategory,
              Tone_Style: newTweetTag
            }),
          });
          const data = await response.json();
          // Assume backend returns the new tweet with row_number
          const newTweet: ReferenceTweet = {
            row_number: data.row_number || Date.now(),
            Reference_Tweet: newTweetText,
            Category: selectedCategory,
            Tone_Style: newTweetTag
          };
          setReferenceTweets([...referenceTweets, newTweet]);
          setNewTweetText('');
          setNewTweetTag('');
        } catch (error) {
          alert("Failed to add reference tweet.");
          console.error("Add error:", error);
        }
      }
    }
  };
  const handleCancelEdit = () => { setEditIndex(null); setEditTweetText(''); setEditTweetTag(''); };
  const handleSuggestionClick = (ideaText: string) => { setFinalIdea(ideaText); };
  const handleDeleteReferenceTweet = async (tweet: ReferenceTweet, idx: number) => { try { await fetch('https://fahisk.app.n8n.cloud/webhook/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ row_number: tweet.row_number }), }); setReferenceTweets(referenceTweets.filter((_, i) => i !== idx)); setSelectedForGeneration(prev => prev.filter(t => t.row_number !== tweet.row_number)); } catch (error) { alert("Failed to delete reference tweet."); console.error("Delete error:", error); } };
  const handleUpdateReferenceTweet = async () => { if (editIndex !== null && editTweetText?.trim() && editTweetTag) { const tweetToUpdate = referenceTweets[editIndex]; const updatedTweet = { ...tweetToUpdate, Reference_Tweet: editTweetText, Tone_Style: editTweetTag }; try { await fetch('https://fahisk.app.n8n.cloud/webhook/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ row_number: updatedTweet.row_number, Reference_Tweet: updatedTweet.Reference_Tweet, Category: updatedTweet.Category, Tone_Style: updatedTweet.Tone_Style }), }); setReferenceTweets(referenceTweets.map(t => t.row_number === updatedTweet.row_number ? updatedTweet : t)); setSelectedForGeneration(prev => prev.map(t => t.row_number === updatedTweet.row_number ? updatedTweet : t)); setEditIndex(null); setEditTweetText(''); setEditTweetTag(''); } catch (error) { alert("Failed to update reference tweet."); console.error("Update error:", error); } } };
  const handleSelectTweetForGeneration = (tweet: ReferenceTweet) => { if (!selectedForGeneration.some(t => t.row_number === tweet.row_number)) { setSelectedForGeneration([...selectedForGeneration, tweet]); } };
  const handleRemoveTweetFromGeneration = (tweetToRemove: ReferenceTweet) => { setSelectedForGeneration(selectedForGeneration.filter(t => t.row_number !== tweetToRemove.row_number)); };

  return (
    // <<< NEW: A main container for the whole page layout
    <div className="page-container">
      <div className="generator-container">
        {/* --- Column 1: Suggested Ideas --- */}
        <div className="generator-column">
          <div className="card">
            <h3>Suggested Ideas</h3>
            <button onClick={fetchIdeas} disabled={isLoading} className="btn btn-secondary">
              {isLoading ? 'Fetching...' : 'Fetch New Ideas'}
            </button>
            <div className="ideas-list">
              {suggestedIdeas.length > 0 ? (
                suggestedIdeas.map((idea, index) => (
                  <div key={index} className="suggestion-card" onClick={() => handleSuggestionClick(idea.generated_idea)}>
                    <span>{idea.generated_idea}</span>
                    <button type="button" className="copy-btn" onClick={e => { e.stopPropagation(); handleCopyIdea(idea.generated_idea, index); }} title="Copy">
                      {copiedIndex === index ? <span>✓ Copied</span> : <span>📋</span>}
                    </button>
                  </div>
                ))
              ) : ( !isLoading && <p>No ideas yet. Click "Fetch New Ideas".</p> )}
            </div>
          </div>
        </div>

        {/* --- Column 2: Create Your Content --- */}
        <div className="generator-column">
          <form onSubmit={handleSubmit} className="card">
            <h3>Create Your Content</h3>
            <textarea
              className="form-input"
              value={finalIdea}
              onChange={(e) => setFinalIdea(e.target.value)}
              rows={4}
              placeholder="Click an idea, or type your own..."
              required
            />
            <div className="selected-tweets-section">
              <h4>Tweets Selected for Generation</h4>
              {selectedForGeneration.length > 0 ? (
                <ul className="selected-list">
                  {selectedForGeneration.map(tweet => (
                    <li key={tweet.row_number}>
                      <span>{tweet.Reference_Tweet}</span>
                      <button type="button" className="btn-link danger" onClick={() => handleRemoveTweetFromGeneration(tweet)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data-message">Select tweets from the list below to use them as inspiration.</p>
              )}
            </div>
          </form>
        </div>

        {/* --- Column 3: Manage Reference Tweets --- */}
        <div className="generator-column">
          <div className="card">
            <h3>Manage Reference Tweets</h3>
            <div className="form-group">
              <label>Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="form-input">
                <option value="Educational">Educational</option>
                <option value="BuildInPublic">BuildInPublic</option>
                <option value="SuccessStory">SuccessStory</option>
                <option value="Motivational">Motivational</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tone/Style</label>
              <select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} className="form-input">
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
              </select>
            </div>
            <button type="button" onClick={fetchReferenceTweets} disabled={isLoadingReferences} className="btn btn-secondary" style={{ marginBottom: "1rem" }}>
              {isLoadingReferences ? 'Fetching...' : 'Fetch Reference Tweets'}
            </button>


               <div className="table-container">
              <table className="reference-tweet-table">
                <thead>
                  <tr>
                    <th>Id</th><th>Reference Tweet</th><th>Category</th><th>Tone/Style</th><th>Actions</th><th>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceTweets.length > 0 ? (
                    referenceTweets.map((tweet, idx) => (
                      <tr key={tweet.row_number}>
                        <td>{tweet.row_number}</td>
                        <td>{tweet.Reference_Tweet}</td>
                        <td>{tweet.Category}</td>
                        <td>{tweet.Tone_Style}</td>
                        <td>
                          <button type="button" className="btn-link" onClick={() => { setEditIndex(idx); setEditTweetText(tweet.Reference_Tweet); setEditTweetTag(tweet.Tone_Style); }}>Edit</button>
                          <button type="button" className="btn-link danger" onClick={() => handleDeleteReferenceTweet(tweet, idx)}>Delete</button>
                        </td>
                        <td>
                          <button type="button" className="btn btn-secondary" onClick={() => handleSelectTweetForGeneration(tweet)} disabled={selectedForGeneration.some(t => t.row_number === tweet.row_number)}>Select</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="no-data-message">No reference tweets loaded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="form-group">
              <input className="form-input" type="text" placeholder="Reference Tweet" value={editIndex !== null ? editTweetText : newTweetText} onChange={e => editIndex !== null ? setEditTweetText(e.target.value) : setNewTweetText(e.target.value)} />
              <select className="form-input" value={editIndex !== null ? editTweetTag : newTweetTag} onChange={e => editIndex !== null ? setEditTweetTag(e.target.value) : setNewTweetTag(e.target.value)}>
                <option value="">Select Tone</option>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
              </select>
              {editIndex !== null ? (
                <>
                  <button type="button" className="btn btn-secondary" onClick={handleUpdateReferenceTweet}>Update</button>
                  <button type="button" className="btn btn-link" onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={handleAddOrUpdateTweet}>Add</button>
              )}
            </div>
           
          </div>
        </div>
      </div>
      {/* <<< MOVED TO HERE: Generated Variations Section is now at the bottom */}
      {variations && (
        <div className="generator-column">
            <div className="card">
              <h3>Generated Variations</h3>
              <div><strong>Variation 1:</strong> {variations?.variation1 || variations?.[0]?.variation1}</div>
              <div><strong>Variation 2:</strong> {variations?.variation2 || variations?.[0]?.variation2}</div>
              <div><strong>Variation 3:</strong> {variations?.variation3 || variations?.[0]?.variation3}</div>
            </div>
        </div>
      )}
      {/* Generate Tweets Button at the very bottom */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "2rem 0" }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ minWidth: 220, fontSize: "1.1rem" }}
          disabled={isGenerating || !finalIdea || selectedForGeneration.length === 0}
          onClick={handleSubmit}
        >
          {isGenerating ? 'Generating...' : 'Generate Tweets'}
        </button>
      </div>
    </div>
  );
}

export default IdeaGenerator;