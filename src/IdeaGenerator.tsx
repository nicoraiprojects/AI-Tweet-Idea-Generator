import React, { useState, useEffect, useRef } from 'react';

function IdeaGenerator() {
  // --- Type Definitions ---
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

  // --- State Variables ---
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
  const [fetchSubreddit, setFetchSubreddit] = useState('');
  const [fetchLimit, setFetchLimit] = useState(5);
  const [topSubreddits, setTopSubreddits] = useState<string[]>([]);
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const subredditInputRef = useRef<HTMLDivElement>(null);

  // --- Side Effects ---

  // Effect to fetch top subreddits from Reddit API on mount
  useEffect(() => {
    const fetchTopSubreddits = async () => {
      setIsLoadingSubreddits(true);
      try {
        const response = await fetch('https://www.reddit.com/subreddits/popular.json?limit=50');
        const data = await response.json();
        const subreddits = (data.data.children || []).map((item: any) => item.data.display_name);
        const aiExamples = [
          'AI','ArtificialInteligence', 'MachineLearning','Technology', 'OpenAI', 'ChatGPT', 'DeepLearning', 'AGI', 'AItools', 'Singularity',
          'computervision', 'Datascience', 'LanguageTechnology', 'Robotics', 'PromptEngineering', 'GPT3', 'GPT4'
        ];
        // The original code was only using the preset list. This combines them.
        const allSubs = Array.from(new Set([...aiExamples, ...subreddits]));
        setTopSubreddits(allSubs);
      } catch (e) {
        console.error("Failed to fetch subreddits, using fallback list.", e);
        setTopSubreddits([
          'AI','ArtificialInteligence', 'MachineLearning','Technology', 'OpenAI', 'ChatGPT', 'DeepLearning', 'AGI', 'AItools', 'Singularity',
          'computervision', 'Datascience', 'LanguageTechnology', 'Robotics', 'PromptEngineering', 'GPT3', 'GPT4'
        ]);
      } finally {
        setIsLoadingSubreddits(false);
      }
    };
    fetchTopSubreddits();
  }, []);

  // Effect to handle clicks outside the subreddit dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subredditInputRef.current && !subredditInputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Derived State ---
  const filteredSubreddits = topSubreddits.filter(sub =>
    sub.toLowerCase().includes(fetchSubreddit.toLowerCase())
  );

  // --- Functions ---
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
          idea: finalIdea,
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

  const fetchIdeas = async () => {
    if (!fetchSubreddit) {
        alert("Please enter a subreddit first.");
        return;
    }
    setIsLoading(true);
    setSuggestedIdeas([]);
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/start', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ subreddit: fetchSubreddit, limit: fetchLimit })
      });
      const data = await response.json();
      let foundIdeas: any[] = [];
      if (Array.isArray(data)) foundIdeas = data.map(item => item?.json ?? item);
      else if (data && data.generated_idea) foundIdeas = [data];

      const cleanedIdeas = foundIdeas.map(idea => {
        let text = idea.title || idea.generated_idea || '';
        const prefixRegex = /^(?:\*\*|)?(?:Content|Tweet|Twitter)\s(?:Idea|Post):\s?(?:\*\*|")?\s?/i;
        text = text.replace(prefixRegex, '').replace(/(\*\*|")\s*$/, '').trim();
        return { generated_idea: text };
      });
      setSuggestedIdeas(cleanedIdeas);

    } catch (error) {
      console.error("Error fetching ideas:", error);
      alert("Failed to fetch ideas. Make sure your n8n workflow is active.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchReferenceTweets = async () => {
    setIsLoadingReferences(true);
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/second', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, tone: selectedTone })
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const flatTweets = data.map(item => {
          const raw = item?.json ?? item;
          return {
            row_number: raw.row_number,
            Reference_Tweet: raw["Reference Tweet"] || raw.Reference_Tweet,
            Category: raw.Category,
            Tone_Style: raw.Tone_Style || raw.Tone
          };
        });
        setReferenceTweets(flatTweets);
      } else {
        setReferenceTweets([]);
      }
    } catch (error) {
      alert("Failed to fetch reference tweets.");
      console.error("Fetch reference tweets error:", error);
      setReferenceTweets([]);
    } finally {
      setIsLoadingReferences(false);
    }
  };

  const handleAddOrUpdateTweet = async () => {
    if (editIndex !== null) {
      handleUpdateReferenceTweet();
    } else {
      const categoryForNewTweet = selectedCategory;
      const toneForNewTweet = newTweetTag || selectedTone;
      if (newTweetText?.trim() && toneForNewTweet) {
        try {
          const response = await fetch('https://fahisk.app.n8n.cloud/webhook/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Reference_Tweet: newTweetText,
              Category: categoryForNewTweet,
              Tone_Style: toneForNewTweet
            }),
          });
          const data = await response.json();
          if (data && data.row_number) {
            const newTweet: ReferenceTweet = {
              row_number: data.row_number,
              Reference_Tweet: newTweetText,
              Category: categoryForNewTweet,
              Tone_Style: toneForNewTweet
            };
            setReferenceTweets([...referenceTweets, newTweet]);
            setNewTweetText('');
            setNewTweetTag('');
          } else {
            alert("Failed to add reference tweet: Unexpected response from backend.");
          }
        } catch (error) {
          alert("Failed to add reference tweet.");
          console.error("Add error:", error);
        }
      } else {
        alert("Please enter tweet text and select a tone to add.");
      }
    }
  };

  const handleUpdateReferenceTweet = async () => {
    if (editIndex !== null && editTweetText?.trim() && editTweetTag) {
      const tweetToUpdate = referenceTweets[editIndex];
      if (!tweetToUpdate || tweetToUpdate.row_number === undefined) {
        alert("Cannot update tweet: Missing row number.");
        return;
      }
      const updatedTweetData = {
        row_number: tweetToUpdate.row_number,
        Reference_Tweet: editTweetText,
        Category: tweetToUpdate.Category,
        Tone_Style: editTweetTag
      };
      try {
        const response = await fetch('https://fahisk.app.n8n.cloud/webhook/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTweetData),
        });
        if (response.ok) {
          setReferenceTweets(referenceTweets.map(t => t.row_number === updatedTweetData.row_number ? updatedTweetData : t));
          setSelectedForGeneration(prev => prev.map(t => t.row_number === updatedTweetData.row_number ? updatedTweetData : t));
          setEditIndex(null);
          setEditTweetText('');
          setEditTweetTag('');
        } else {
          const errorData = await response.text();
          alert(`Failed to update reference tweet: ${errorData || response.statusText}`);
        }
      } catch (error) {
        alert("Failed to update reference tweet.");
        console.error("Update error:", error);
      }
    } else {
      alert("Please ensure tweet text and tag are filled before updating.");
    }
  };

  const handleDeleteReferenceTweet = async (tweet: ReferenceTweet) => {
    if (!window.confirm(`Are you sure you want to delete the tweet with ID ${tweet.row_number}?`)) return;
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row_number: tweet.row_number }),
      });
      if (response.ok) {
        setReferenceTweets(referenceTweets.filter(t => t.row_number !== tweet.row_number));
        setSelectedForGeneration(prev => prev.filter(t => t.row_number !== tweet.row_number));
      } else {
        const errorData = await response.text();
        alert(`Failed to delete reference tweet: ${errorData || response.statusText}`);
      }
    } catch (error) {
      alert("Failed to delete reference tweet.");
      console.error("Delete error:", error);
    }
  };

  const handleCopyIdea = async (ideaText: string, index: number) => { try { await navigator.clipboard.writeText(ideaText); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 1500); } catch { alert('Failed to copy!'); } };
  const handleCancelEdit = () => { setEditIndex(null); setEditTweetText(''); setEditTweetTag(''); };
  const handleSuggestionClick = (ideaText: string) => { setFinalIdea(ideaText); };
  const handleSelectTweetForGeneration = (tweet: ReferenceTweet) => { if (!selectedForGeneration.some(t => t.row_number === tweet.row_number)) { setSelectedForGeneration([...selectedForGeneration, tweet]); } };
  const handleRemoveTweetFromGeneration = (tweetToRemove: ReferenceTweet) => { setSelectedForGeneration(selectedForGeneration.filter(t => t.row_number !== tweetToRemove.row_number)); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ─── Suggested Ideas ─── */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
        <h3 className="text-xl font-bold text-purple-700">Suggested Ideas</h3>

        <div className="flex flex-col sm:flex-row sm:space-x-4 items-end mb-4 gap-4">
          <div className="flex-1 w-full">
            <label htmlFor="subreddit" className="text-sm font-medium text-gray-600 block mb-1">
              Subreddit
            </label>
            <div className="relative" ref={subredditInputRef}>
              {/* --- MODIFICATION START --- */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="subreddit"
                  type="text"
                  className="w-full pl-10 pr-10 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={fetchSubreddit}
                  onChange={e => setFetchSubreddit(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Type or select a subreddit..."
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-purple-600"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {/* --- MODIFICATION END --- */}

              {isDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isLoadingSubreddits ? (
                     <li className="px-4 py-2 text-gray-500 italic">Loading...</li>
                  ) : filteredSubreddits.length > 0 ? (
                    filteredSubreddits.map(sub => (
                      <li key={sub} className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-purple-100" onClick={() => { setFetchSubreddit(sub); setIsDropdownOpen(false); }}>
                        {sub}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500 italic">No matches found.</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div className="w-full sm:w-24 flex flex-col">
            <label htmlFor="limit" className="text-sm font-medium text-gray-600 block mb-1">How Many?</label>
            <select id="limit" className="w-full px-4 py-2 bg-purple-100 border border-purple-400 rounded-lg font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200" value={fetchLimit} onChange={e => setFetchLimit(Number(e.target.value))}>
              {[5, 10, 20, 30].map(n => (<option key={n} value={n}>{n}</option>))}
            </select>
          </div>
        </div>

        <button onClick={fetchIdeas} disabled={isLoading || !fetchSubreddit} className="px-4 py-2 bg-purple-100 border border-purple-400 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Fetching…' : 'Fetch New Ideas'}
        </button>

        <div className="flex flex-col gap-2 mt-4">
          {isLoading ? (<p className="text-center text-gray-500 italic">Loading suggested ideas…</p>) : suggestedIdeas.length > 0 ? (
            suggestedIdeas.map((idea, idx) => (
              <div key={idx} onClick={() => handleSuggestionClick(idea.generated_idea)} className="flex justify-between items-center px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 transition">
                <span className="text-gray-900">{idea.generated_idea}</span>
                <button onClick={e => { e.stopPropagation(); handleCopyIdea(idea.generated_idea, idx); }} className="ml-4 p-1 rounded hover:text-purple-400 text-gray-500">
                  {copiedIndex === idx ? '✅' : '📋'}
                </button>
              </div>
            ))
          ) : (<p className="text-center text-gray-500 italic">No ideas yet. Click “Fetch New Ideas.”</p>)}
        </div>
      </div>

      {/* ─── Create Your Content ─── */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
        <h3 className="text-xl font-bold text-purple-700">Create Your Content</h3>
        <textarea className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-purple-200" rows={4} placeholder="Click an idea from the left, or type your own here…" value={finalIdea} onChange={e => setFinalIdea(e.target.value)} />
        <div className="mt-4">
          <h4 className="text-lg text-gray-600 mb-2">Tweets Selected for Generation</h4>
          {selectedForGeneration.length > 0 ? (
            <ul className="space-y-2">
              {selectedForGeneration.map(t => (
                <li key={t.row_number} className="flex items-center justify-between p-2 bg-gray-100 border border-gray-200 rounded-md">
                  <span className="text-gray-900 flex-1 truncate">{t.Reference_Tweet}</span>
                  <button onClick={() => handleRemoveTweetFromGeneration(t)} className="text-sm text-red-500 hover:text-red-600 ml-4">Remove</button>
                </li>
              ))}
            </ul>
          ) : (<p className="text-gray-500 italic">Select tweets from the list below to use them as inspiration.</p>)}
        </div>
      </div>

      {/* ─── Manage Reference Tweets ─── */}
      <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
        <h3 className="text-xl font-bold text-purple-700">Manage Reference Tweets</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="text-sm font-medium text-gray-600 block mb-1">Category</label>
            <select id="category" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option>
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="text-sm font-medium text-gray-600 block mb-1">Tone / Style</label>
            <select id="tone" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200" value={selectedTone} onChange={e => setSelectedTone(e.target.value)}>
              <option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option>
            </select>
          </div>
          <button onClick={fetchReferenceTweets} disabled={isLoadingReferences} className="px-4 py-2 bg-purple-100 border border-purple-400 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoadingReferences ? 'Fetching…' : 'Fetch Reference Tweets'}
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 reference-tweet-table">
              <thead className="bg-purple-400">
                <tr>{['Id', 'Reference Tweet', 'Category', 'Tone/Style', 'Actions', 'Select'].map(h => (<th key={h} className="px-4 py-2 text-left text-white uppercase text-xs font-semibold tracking-wide">{h}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingReferences ? (<tr><td colSpan={6} className="py-4 text-center text-gray-500 italic">Loading…</td></tr>) : referenceTweets.length > 0 ? (
                  referenceTweets.map((t, idx) => (
                    <tr key={t.row_number}>
                      <td data-label="Id" className="px-4 py-2">{t.row_number}</td>
                      <td data-label="Reference Tweet" className="px-4 py-2">{t.Reference_Tweet}</td>
                      <td data-label="Category" className="px-4 py-2">{t.Category}</td>
                      <td data-label="Tone/Style" className="px-4 py-2">{t.Tone_Style}</td>
                      <td data-label="Actions" className="px-4 py-2 space-x-2">
                        <button onClick={() => { setEditIndex(idx); setEditTweetText(t.Reference_Tweet); setEditTweetTag(t.Tone_Style); }} className="text-sm text-indigo-600 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteReferenceTweet(t)} className="text-sm text-red-500 hover:underline">Delete</button>
                      </td>
                      <td data-label="Select" className="px-4 py-2">
                        <button onClick={() => handleSelectTweetForGeneration(t)} disabled={selectedForGeneration.some(x => x.row_number === t.row_number)} className="px-3 py-1 bg-purple-400 text-white text-sm rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed">Select</button>
                      </td>
                    </tr>
                  ))
                ) : (<tr><td colSpan={6} className="py-4 text-center text-gray-500 italic">No tweets loaded.</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-600 block">{editIndex != null ? 'Edit Reference Tweet' : 'Add New Reference Tweet'}</label>
            <textarea rows={3} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-purple-200" value={editIndex != null ? editTweetText : newTweetText} onChange={e => editIndex != null ? setEditTweetText(e.target.value) : setNewTweetText(e.target.value)} placeholder="Reference Tweet text…"/>
            <select className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200" value={editIndex != null ? editTweetTag : newTweetTag} onChange={e => editIndex != null ? setEditTweetTag(e.target.value) : setNewTweetTag(e.target.value)}>
              <option value="">Select Tone</option><option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option>
            </select>
            {editIndex != null ? (
              <div className="flex space-x-4 items-center">
                <button onClick={handleUpdateReferenceTweet} className="px-4 py-2 bg-purple-100 border border-purple-400 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">Update</button>
                <button onClick={handleCancelEdit} className="text-sm text-gray-600 hover:underline">Cancel</button>
              </div>
            ) : (<button onClick={handleAddOrUpdateTweet} className="px-4 py-2 bg-purple-100 border border-purple-400 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">Add</button>)}
          </div>
        </div>
      </div>

      {/* ─── Generate Button (full-width footer) ─── */}
      <div className="col-span-full flex justify-center mt-8">
        <button onClick={handleSubmit} disabled={isGenerating || !finalIdea || selectedForGeneration.length === 0} className="px-6 py-3 bg-purple-400 text-white font-semibold rounded-lg hover:bg-purple-500 text-lg min-w-[220px] disabled:opacity-50 disabled:cursor-not-allowed">
          {isGenerating ? 'Generating…' : 'Generate Tweets'}
        </button>
      </div>

      {/* Generated Variations card BELOW the generate button */}
      {variations && (
        <div className="col-span-full flex justify-center mt-4">
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mt-6 space-y-4 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-purple-700">Generated Variations</h3>
            {(Array.isArray(variations) ? variations : [variations]).map((v, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                {v.variation1 && <p><strong>Variation 1:</strong> {v.variation1}</p>}
                {v.variation2 && <p><strong>Variation 2:</strong> {v.variation2}</p>}
                {v.variation3 && <p><strong>Variation 3:</strong> {v.variation3}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default IdeaGenerator;