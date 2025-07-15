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
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);
  const [selectedForGeneration, setSelectedForGeneration] = useState<ReferenceTweet[]>([]);
  const [fetchSubreddit, setFetchSubreddit] = useState('');
  const [fetchLimit, setFetchLimit] = useState(5);
  const [topSubreddits, setTopSubreddits] = useState<string[]>([]);
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const subredditInputRef = useRef<HTMLDivElement>(null);
  const [singleGeneratedIdea, setSingleGeneratedIdea] = useState('');
  const [isGeneratingSingleIdea, setIsGeneratingSingleIdea] = useState(false);

  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedTweetData, setEditedTweetData] = useState<Partial<ReferenceTweet> | null>(null);
  const [newTweetText, setNewTweetText] = useState('');
  const [newTweetCategory, setNewTweetCategory] = useState('Educational');
  const [newTweetTone, setNewTweetTone] = useState('casual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);


  // --- Side Effects ---
  useEffect(() => {
    const fetchTopSubreddits = async () => {
      setIsLoadingSubreddits(true);
      try {
        const response = await fetch('https://www.reddit.com/subreddits/popular.json?limit=50');
        const data = await response.json();
        const subreddits = (data.data.children || []).map((item: any) => item.data.display_name);
        const aiExamples = [ 'AI','ArtificialInteligence', 'MachineLearning','Technology', 'OpenAI', 'ChatGPT', 'DeepLearning', 'AGI', 'AItools', 'Singularity', 'computervision', 'Datascience', 'LanguageTechnology', 'Robotics', 'PromptEngineering', 'GPT3', 'GPT4' ];
        const allSubs = Array.from(new Set([...aiExamples, ...subreddits]));
        setTopSubreddits(allSubs);
      } catch (e) {
        console.error("Failed to fetch subreddits, using fallback list.", e);
        setTopSubreddits([ 'AI','ArtificialInteligence', 'MachineLearning','Technology', 'OpenAI', 'ChatGPT', 'DeepLearning', 'AGI', 'AItools', 'Singularity', 'computervision', 'Datascience', 'LanguageTechnology', 'Robotics', 'PromptEngineering', 'GPT3', 'GPT4' ]);
      } finally {
        setIsLoadingSubreddits(false);
      }
    };
    fetchTopSubreddits();
  }, []);

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
          idea: finalIdea,
          category: selectedCategory,
          tone: selectedTone,
          reference_tweets: selectedForGeneration.map(t => t.Reference_Tweet)
        }),
      });
      const data = await response.json();
      const result = data[0]?.json?.variation1 ? data.map(item => item.json) : (data.json?.text ? JSON.parse(data.json.text) : data);
      setVariations(Array.isArray(result) ? result : [result]);
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas. Make sure your n8n 'generate' workflow is active and configured correctly.");
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
      else if (data && (data.title || data.generated_idea)) foundIdeas = [data];

      const cleanedIdeas = foundIdeas.map(idea => {
        let text = idea.title || idea.generated_idea || '';
        const prefixRegex = /^(?:\*\*|)?(?:Content|Tweet|Twitter)\s(?:Idea|Post):\s?(?:\*\*|")?\s?/i;
        text = text.replace(prefixRegex, '').replace(/(\*\*|")\s*$/, '').trim();
        return { generated_idea: text };
      });
      setSuggestedIdeas(cleanedIdeas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      alert("Failed to fetch ideas. Make sure your n8n 'start' workflow is active.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateSingleIdea = async () => {
    if (!finalIdea) {
      alert("Please set a base idea in Step 2 before generating.");
      return;
    }
    setIsGeneratingSingleIdea(true);
    setSingleGeneratedIdea('');
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          title: finalIdea,
          category: selectedCategory,
          tone: selectedTone,
        }),
      });
      const data = await response.json();
      const ideaText = data.text || data.generated_idea || (data[0]?.json?.generated_idea) || (Array.isArray(data) && data[0]?.generated_idea) || JSON.stringify(data);
      setSingleGeneratedIdea(ideaText);
    } catch (error) {
      console.error("Error generating single idea:", error);
      alert("Failed to generate the idea. Please check your n8n workflow and connection.");
    } finally {
      setIsGeneratingSingleIdea(false);
    }
  };

  const fetchReferenceTweets = async () => {
    setIsLoadingReferences(true);
    setReferenceTweets([]);
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
            Tone_Style: raw.Tone_Style || raw["Tone/Style"] || raw.Tone
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
  
  const handleAddTweet = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTweetText.trim()) {
      alert('Tweet text cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetch('https://fahisk.app.n8n.cloud/webhook/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Reference_Tweet: newTweetText,
          Category: newTweetCategory,
          Tone_Style: newTweetTone,
        }),
      });
      setNewTweetText('');
      setIsAddFormVisible(false);
      await fetchReferenceTweets();
    } catch (error) {
      console.error("Error adding tweet:", error);
      alert("Failed to add the new reference tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTweet = async () => {
    if (!editingRowId || !editedTweetData) return;
    setIsSubmitting(true);
    try {
      await fetch('https://fahisk.app.n8n.cloud/webhook/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row_number: editingRowId,
          ...editedTweetData
        }),
      });
      setEditingRowId(null);
      setEditedTweetData(null);
      await fetchReferenceTweets();
    } catch (error) {
      console.error("Error updating tweet:", error);
      alert("Failed to update the reference tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTweet = async (rowNumber: number) => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return;
    setIsSubmitting(true);
    try {
      await fetch('https://fahisk.app.n8n.cloud/webhook/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row_number: rowNumber }),
      });
      setReferenceTweets(prev => prev.filter(t => t.row_number !== rowNumber));
    } catch (error) {
      console.error("Error deleting tweet:", error);
      alert("Failed to delete the reference tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (tweet: ReferenceTweet) => {
    setEditingRowId(tweet.row_number);
    setEditedTweetData({
      Reference_Tweet: tweet.Reference_Tweet,
      Category: tweet.Category,
      Tone_Style: tweet.Tone_Style,
    });
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTweetData(prev => ({ ...prev, [name]: value } as Partial<ReferenceTweet>));
  };
  
  const handleCopyIdea = async (ideaText: string, index: number) => { try { await navigator.clipboard.writeText(ideaText); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 1500); } catch { alert('Failed to copy!'); } };
  const handleSuggestionClick = (ideaText: string) => { setFinalIdea(ideaText); };
  const handleSelectTweetForGeneration = (tweet: ReferenceTweet) => { if (!selectedForGeneration.some(t => t.row_number === tweet.row_number)) { setSelectedForGeneration([...selectedForGeneration, tweet]); } };
  const handleRemoveTweetFromGeneration = (tweetToRemove: ReferenceTweet) => { setSelectedForGeneration(selectedForGeneration.filter(t => t.row_number !== tweetToRemove.row_number)); };

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
              <h3 className="text-xl font-bold text-purple-700">1. Fetch Ideas</h3>
              <div className="flex flex-col sm:flex-row sm:space-x-4 items-end gap-4">
                <div className="flex-1 w-full">
                  <label htmlFor="subreddit" className="text-sm font-medium text-slate-600 block mb-1">Subreddit</label>
                  <div className="relative" ref={subredditInputRef}>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                      </div>
                      <input id="subreddit" type="text" className="w-full pl-10 pr-10 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-300" value={fetchSubreddit} onChange={e => setFetchSubreddit(e.target.value)} onFocus={() => setIsDropdownOpen(true)} placeholder="Type or select a subreddit..." autoComplete="off"/>
                      <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-purple-600" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                    {isDropdownOpen && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingSubreddits ? ( <li className="px-4 py-2 text-slate-500 italic">Loading...</li> ) : filteredSubreddits.length > 0 ? (
                          filteredSubreddits.map(sub => ( <li key={sub} className="px-4 py-2 text-slate-800 cursor-pointer hover:bg-purple-100" onClick={() => { setFetchSubreddit(sub); setIsDropdownOpen(false); }}>{sub}</li> ))
                        ) : ( <li className="px-4 py-2 text-slate-500 italic">No matches found.</li> )}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-24 flex flex-col">
                  <label htmlFor="limit" className="text-sm font-medium text-slate-600 block mb-1">How Many?</label>
                  <select id="limit" className="w-full px-4 py-2 bg-purple-100 border-purple-200 border rounded-lg font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300" value={fetchLimit} onChange={e => setFetchLimit(Number(e.target.value))}>
                    {[5, 10, 20, 30].map(n => (<option key={n} value={n}>{n}</option>))}
                  </select>
                </div>
              </div>
              <button onClick={fetchIdeas} disabled={isLoading || !fetchSubreddit} className="w-full px-4 py-2 bg-purple-100 border border-purple-300 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Fetching…' : 'Fetch New Ideas'}
              </button>
              <div className="flex flex-col gap-2 mt-4">
                {isLoading ? (<p className="text-center text-slate-500 italic">Loading suggested ideas…</p>) : suggestedIdeas.length > 0 ? (
                  suggestedIdeas.map((idea, idx) => (
                    <div key={idx} onClick={() => handleSuggestionClick(idea.generated_idea)} className="flex justify-between items-center px-4 py-2 border border-slate-200 rounded-lg cursor-pointer hover:border-purple-400 transition">
                      <span className="text-slate-900">{idea.generated_idea}</span>
                      <button onClick={e => { e.stopPropagation(); handleCopyIdea(idea.generated_idea, idx); }} className="ml-4 p-1 rounded hover:text-purple-400 text-slate-500">{copiedIndex === idx ? '✅' : '📋'}</button>
                    </div>
                  ))
                ) : (<p className="text-center text-slate-500 italic">No ideas yet. Click “Fetch New Ideas.”</p>)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
              <h3 className="text-xl font-bold text-purple-700">2. Set a Idea</h3>
              <textarea className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-purple-300 flex-grow" placeholder="Click an idea from the left, or type your own here…" value={finalIdea} onChange={e => setFinalIdea(e.target.value)} />
              <div className="bg-white border border-slate-200 rounded-2xl p-6  flex flex-col gap-5">
              <h3 className="text-xl font-bold text-purple-700">3. Generate a Single Idea</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <label htmlFor="genSingleCategory" className="text-sm font-medium text-slate-600 block mb-1">Category</label>
                  <select id="genSingleCategory" className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="genSingleTone" className="text-sm font-medium text-slate-600 block mb-1">Tone / Style</label>
                  <select id="genSingleTone" className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" value={selectedTone} onChange={e => setSelectedTone(e.target.value)}>
                    <option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option>
                  </select>
                </div>
                <button onClick={handleGenerateSingleIdea} disabled={isGeneratingSingleIdea || !finalIdea} className="md:col-span-1 w-full px-4 py-2 bg-purple-100 border border-purple-300 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isGeneratingSingleIdea ? 'Generating…' : 'Generate Idea'}
                </button>
              </div>
            </div>
          </div>
          </div>
           {(isGeneratingSingleIdea || singleGeneratedIdea) && (
                <div className="mt-4 p-4 bg-slate-50 mx-auto shadow-lg border border-slate-200 rounded-lg">
                  {isGeneratingSingleIdea ? (
                    <p className="text-slate-500 italic text-center">Generating your idea...</p>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-slate-800 flex-grow">{singleGeneratedIdea}</p>
                      <button 
                        onClick={() => setFinalIdea(singleGeneratedIdea)}
                        className="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 whitespace-nowrap flex-shrink-0"
                      >
                        Use this Idea
                      </button>
                    </div>
                  )}
                </div>
              )}

          {/* --- UPDATED: 4. Manage Reference Tweets --- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
            <h3 className="text-xl font-bold text-purple-700">4. Manage Reference Tweets</h3>
            
            {/* --- THIS IS THE UPDATED SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label htmlFor="refCategory" className="text-sm font-medium text-slate-600 block mb-1">Category</label>
                <select 
                  id="refCategory" 
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="refTone" className="text-sm font-medium text-slate-600 block mb-1">Tone / Style</label>
                <select 
                  id="refTone" 
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" 
                  value={selectedTone} 
                  onChange={e => setSelectedTone(e.target.value)}
                >
                  <option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option>
                </select>
              </div>
              <button 
                onClick={fetchReferenceTweets} 
                disabled={isLoadingReferences} 
                className="md:col-span-1 w-full px-4 py-2 bg-purple-100 border border-purple-300 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingReferences ? 'Fetching…' : 'Fetch References'}
              </button>
            </div>
            {/* --- END OF UPDATED SECTION --- */}

            
            <div className="mt-4">
              <h4 className="text-lg text-slate-600 mb-2">Tweets Selected for Generation</h4>
              {selectedForGeneration.length > 0 ? (
                <ul className="space-y-2">{selectedForGeneration.map(t => (<li key={t.row_number} className="flex items-center justify-between p-2 bg-slate-100 border border-slate-200 rounded-md"><span className="text-slate-900 flex-1 truncate">{t.Reference_Tweet}</span><button onClick={() => handleRemoveTweetFromGeneration(t)} className="text-sm text-red-500 hover:text-red-600 ml-4">Remove</button></li>))}</ul>
              ) : (<p className="text-slate-500 italic">Select at least one tweet from the list below to enable generation.</p>)}
            </div>

            

            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-purple-600"><tr>{['Id', 'Reference Tweet', 'Category', 'Tone/Style', 'Actions'].map(h => (<th key={h} className="px-4 py-2 text-left text-white uppercase text-xs font-semibold tracking-wide">{h}</th>))}</tr></thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoadingReferences ? (<tr><td colSpan={5} className="py-4 text-center text-slate-500 italic">Loading…</td></tr>) : referenceTweets.length > 0 ? (
                    referenceTweets.map((t) => {
                      const isEditing = editingRowId === t.row_number;
                      return (
                      <tr key={t.row_number} className={isEditing ? 'bg-purple-50' : ''}>
                        <td className="px-4 py-2 align-top">{t.row_number}</td>
                        <td className="px-4 py-2 align-top w-1/2">
                          {isEditing ? (
                             <input type="text" name="Reference_Tweet" value={editedTweetData?.Reference_Tweet || ''} onChange={handleEditChange} className="w-full px-2 py-1 border border-purple-300 rounded-md"/>
                          ) : ( t.Reference_Tweet )}
                        </td>
                        <td className="px-4 py-2 align-top">
                           {isEditing ? (
                              <select name="Category" value={editedTweetData?.Category || ''} onChange={handleEditChange} className="w-full px-2 py-1 border border-purple-300 rounded-md">
                                <option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option>
                              </select>
                           ) : ( t.Category )}
                        </td>
                        <td className="px-4 py-2 align-top">
                           {isEditing ? (
                              <select name="Tone_Style" value={editedTweetData?.Tone_Style || ''} onChange={handleEditChange} className="w-full px-2 py-1 border border-purple-300 rounded-md">
                                <option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option>
                              </select>
                           ) : ( t.Tone_Style )}
                        </td>
                        <td className="px-4 py-2 align-top">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                  <button onClick={handleUpdateTweet} disabled={isSubmitting} className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50">Save</button>
                                  <button onClick={() => setEditingRowId(null)} className="px-3 py-1 bg-slate-400 text-white text-sm rounded-lg hover:bg-slate-500">Cancel</button>
                                </>
                            ) : (
                                <>
                                  <button onClick={() => handleSelectTweetForGeneration(t)} disabled={selectedForGeneration.some(x => x.row_number === t.row_number)} className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">Select</button>
                                  <button onClick={() => handleStartEdit(t)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">Edit</button>
                                  <button onClick={() => handleDeleteTweet(t.row_number)} disabled={isSubmitting} className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50">Delete</button>
                                </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )})
                  ) : (<tr><td colSpan={5} className="py-4 text-center text-slate-500 italic">No tweets loaded. Please use the filters and fetch.</td></tr>)}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              {!isAddFormVisible && (
                <button
                    onClick={() => setIsAddFormVisible(true)}
                    className="w-full px-4 py-2 bg-green-100 border-2 border-dashed border-green-300 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition"
                >
                    + Add New Reference Tweet
                </button>
              )}
              {isAddFormVisible && (
                <form onSubmit={handleAddTweet} className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg space-y-3 mt-4">
                    <h4 className="font-semibold text-slate-800">Add New Reference Tweet</h4>
                    <div>
                        <label htmlFor="newTweetText" className="text-sm font-medium text-slate-600 block mb-1">Tweet Text</label>
                        <input id="newTweetText" type="text" value={newTweetText} onChange={(e) => setNewTweetText(e.target.value)} placeholder="Enter the new tweet..." className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div>
                            <label htmlFor="newTweetCategory" className="text-sm font-medium text-slate-600 block mb-1">Category</label>
                            <select id="newTweetCategory" value={newTweetCategory} onChange={(e) => setNewTweetCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300">
                                <option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="newTweetTone" className="text-sm font-medium text-slate-600 block mb-1">Tone / Style</label>
                            <select id="newTweetTone" value={newTweetTone} onChange={(e) => setNewTweetTone(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300">
                                <option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <button type="submit" disabled={isSubmitting} className="flex-grow px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Adding...' : 'Add Tweet'}
                            </button>
                            <button type="button" onClick={() => setIsAddFormVisible(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
              )}
            </div>
          </div>

          
          
          <div className="col-span-full flex justify-center mt-2">
            <button onClick={handleSubmit} disabled={isGenerating || !finalIdea || selectedForGeneration.length === 0} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 text-lg min-w-[220px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isGenerating ? 'Generating…' : 'Generate Final Variations'}
            </button>
          </div>

          {variations && (
            <div className="col-span-full bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-lg">
              <h3 className="text-xl font-bold text-purple-700">Generated Variations</h3>
              {(Array.isArray(variations) ? variations : [variations]).map((v, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  {v.variation1 && <p><strong>Variation 1:</strong> {v.variation1}</p>}
                  {v.variation2 && <p><strong>Variation 2:</strong> {v.variation2}</p>}
                  {v.variation3 && <p><strong>Variation 3:</strong> {v.variation3}</p>}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default IdeaGenerator;