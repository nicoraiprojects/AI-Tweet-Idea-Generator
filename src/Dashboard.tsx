import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function Dashboard() {
  // --- Type Definitions (unchanged) ---
  type SuggestedIdea = { generated_idea: string; flair?: string; [key: string]: any; };
  type ReferenceTweet = { row_number: number; Reference_Tweet: string; Category: string; Tone_Style: string; Tags?: string; };

  // --- State Variables (unchanged) ---
  const [suggestedIdeas, setSuggestedIdeas] = useState<SuggestedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalIdea, setFinalIdea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Educational');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [variations, setVariations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [referenceTweets, setReferenceTweets] = useState<ReferenceTweet[]>([]);
  const [originalTweets, setOriginalTweets] = useState<ReferenceTweet[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);
  const [fetchSubreddit, setFetchSubreddit] = useState('');
  const [fetchLimit, setFetchLimit] = useState(5);
  const [topSubreddits, setTopSubreddits] = useState<string[]>([]);
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [brandVoice, setBrandVoice] = useState('');
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedTweetData, setEditedTweetData] = useState<Partial<ReferenceTweet> | null>(null);
  const [newTweetText, setNewTweetText] = useState('');
  const [newTweetCategory, setNewTweetCategory] = useState('Educational');
  const [newTweetTone, setNewTweetTone] = useState('casual');
  const [newTweetTags, setNewTweetTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReferenceSectionVisible, setIsReferenceSectionVisible] = useState(false);
  const [suggestionTopic, setSuggestionTopic] = useState('');
  const [suggestionHashtags, setSuggestionHashtags] = useState('');
  const [suggestionAccounts, setSuggestionAccounts] = useState('');
  const [suggestedTweets, setSuggestedTweets] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const subredditInputRef = useRef<HTMLDivElement>(null);
  // New ref for the Reference Tweet Manager section
  const referenceSectionRef = useRef<HTMLDivElement>(null);

  // --- Scroll to Reference Tweet Manager when visible ---
  useEffect(() => {
    if (isReferenceSectionVisible && referenceSectionRef.current) {
      referenceSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isReferenceSectionVisible]);

  // --- Functions (unchanged) ---
  const ideasPerPage = 10;
  const displayedIdeas = suggestedIdeas.slice(0, page * ideasPerPage);
  const filteredSubreddits = topSubreddits.filter(sub => sub.toLowerCase().includes(fetchSubreddit.toLowerCase()));
  useEffect(() => {
    const cachedSubreddits = localStorage.getItem('topSubreddits');
    if (cachedSubreddits) {
      setTopSubreddits(JSON.parse(cachedSubreddits));
      setIsLoadingSubreddits(false);
    } else {
      fetchTopSubreddits();
    }
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subredditInputRef.current && !subredditInputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const fetchTopSubreddits = async () => {
    setIsLoadingSubreddits(true);
    try {
      const response = await fetch('https://www.reddit.com/subreddits/popular.json?limit=50');
      const data = await response.json();
      const subreddits = (data.data.children || []).map((item: any) => item.data.display_name);
      const aiExamples = ['AI', 'ArtificialInteligence', 'MachineLearning', 'Technology', 'OpenAI', 'ChatGPT', 'DeepLearning', 'AGI', 'AItools', 'Singularity', 'computervision', 'Datascience', 'LanguageTechnology', 'Robotics', 'PromptEngineering', 'GPT3', 'GPT4'];
      const allSubs = Array.from(new Set([...aiExamples, ...subreddits]));
      setTopSubreddits(allSubs);
      localStorage.setItem('topSubreddits', JSON.stringify(allSubs));
    } catch (e) {
      console.error("Failed to fetch subreddits:", e);
      setTopSubreddits(['AI', 'ArtificialInteligence', 'MachineLearning', 'Technology', 'OpenAI', 'ChatGPT', 'DeepLearning', 'AGI', 'AItools', 'Singularity', 'computervision', 'Datascience', 'LanguageTechnology', 'Robotics', 'PromptEngineering', 'GPT3', 'GPT4']);
    } finally {
      setIsLoadingSubreddits(false);
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setVariations([]);
    try {
      const response = await fetch('https://fahis12.app.n8n.cloud/webhook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: finalIdea, category: selectedCategory, tone: selectedTone, brand_voice: brandVoice }),
      });
      const data = await response.json();
      let variationsArray: string[] = [];
      const resultObject = Array.isArray(data) && data.length > 0 ? data[0] : data;
      if (resultObject) {
        if (resultObject.variation1) variationsArray.push(resultObject.variation1);
        if (resultObject.variation2) variationsArray.push(resultObject.variation2);
        if (resultObject.variation3) variationsArray.push(resultObject.variation3);
      } else {
        toast.error('The AI returned an unexpected format. Please try again.');
      }
      setVariations(variationsArray);
      toast.success('Variations generated!');
    } catch (error) {
      console.error('Error generating variations:', error);
      toast.error('Failed to generate variations. Check the n8n workflow and console.');
    } finally {
      setIsGenerating(false);
    }
  };
  const fetchIdeas = async () => {
    if (!fetchSubreddit) {
      toast.error("Please enter a subreddit first.");
      return;
    }
    setIsLoading(true);
    setSuggestedIdeas([]);
    setPage(1);
    try {
      const response = await fetch('https://fahis12.app.n8n.cloud/webhook/start', {
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
        return { generated_idea: text, flair: idea.flair || idea.link_flair_text };
      });
      setSuggestedIdeas(cleanedIdeas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      toast.error("Failed to fetch ideas. Make sure your n8n 'start' workflow is active.");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchReferenceTweets = async () => {
    setIsLoadingReferences(true);
    setReferenceTweets([]);
    try {
      const response = await fetch('https://fahis12.app.n8n.cloud/webhook/second', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, tone: selectedTone, tags: selectedTags }),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const flatTweets = data.map(item => {
          const raw = item?.json ?? item;
          return {
            row_number: raw.row_number,
            Reference_Tweet: raw["Reference Tweet"] || raw.Reference_Tweet,
            Category: raw.Category,
            Tone_Style: raw.Tone_Style || raw["Tone/Style"] || raw.Tone,
            Tags: raw.Tags || ''
          };
        });
        setReferenceTweets(flatTweets);
        setOriginalTweets(flatTweets);
      } else {
        setReferenceTweets([]);
        setOriginalTweets([]);
      }
    } catch (error) {
      toast.error("Failed to fetch reference tweets.");
      console.error("Fetch reference tweets error:", error);
      setReferenceTweets([]);
      setOriginalTweets([]);
    } finally {
      setIsLoadingReferences(false);
    }
  };
  const fetchAllReferenceTweets = async () => {
    setIsLoadingReferences(true);
    setReferenceTweets([]);
    try {
      const response = await fetch('https://fahis12.app.n8n.cloud/webhook/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const flatTweets = data.map(item => {
          const raw = item?.json ?? item;
          return {
            row_number: raw.row_number,
            Reference_Tweet: raw["Reference Tweet"] || raw.Reference_Tweet,
            Category: raw.Category,
            Tone_Style: raw.Tone_Style || raw["Tone/Style"] || raw.Tone,
            Tags: raw.Tags || ''
          };
        });
        setReferenceTweets(flatTweets);
        setOriginalTweets(flatTweets);
      } else {
        setReferenceTweets([]);
        setOriginalTweets([]);
      }
    } catch (error) {
      toast.error("Failed to fetch all reference tweets.");
      setReferenceTweets([]);
      setOriginalTweets([]);
    } finally {
      setIsLoadingReferences(false);
    }
  };
  const handleAddTweet = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTweetText.trim()) {
      toast.error('Tweet text cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetch('https://fahis12.app.n8n.cloud/webhook/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Reference_Tweet: newTweetText, Category: newTweetCategory, Tone_Style: newTweetTone, Tags: newTweetTags }),
      });
      toast.success('Reference tweet added!');
      setNewTweetText('');
      setNewTweetTags('');
      setNewTweetCategory('Educational');
      setNewTweetTone('casual');
      await fetchAllReferenceTweets();
    } catch (error) {
      console.error("Error adding tweet:", error);
      toast.error("Failed to add the new reference tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateTweet = async () => {
    if (!editingRowId || !editedTweetData) return;
    setIsSubmitting(true);
    try {
      await fetch('https://fahis12.app.n8n.cloud/webhook/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row_number: editingRowId, ...editedTweetData }),
      });
      toast.success('Reference tweet updated!');
      setEditingRowId(null);
      setEditedTweetData(null);
      await fetchAllReferenceTweets();
    } catch (error) {
      console.error("Error updating tweet:", error);
      toast.error("Failed to update the reference tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteTweet = async (rowNumber: number) => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return;
    setIsSubmitting(true);
    try {
      await fetch('https://fahis12.app.n8n.cloud/webhook/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row_number: rowNumber }),
      });
      toast.error('Reference tweet deleted.');
      setReferenceTweets(prev => prev.filter(t => t.row_number !== rowNumber));
      setOriginalTweets(prev => prev.filter(t => t.row_number !== rowNumber));
    } catch (error) {
      console.error("Error deleting tweet:", error);
      toast.error("Failed to delete the reference tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSuggestTweets = async () => {
    if (!suggestionTopic) return;
    setIsSuggesting(true);
    setSuggestedTweets([]);
    try {
      const response = await fetch('https://fahis12.app.n8n.cloud/webhook/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: suggestionTopic,
          hashtags: suggestionHashtags.split(',').map(h => h.trim()).filter(Boolean),
          accounts: suggestionAccounts.split(',').map(a => a.trim()).filter(Boolean)
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const responseText = data.text || (Array.isArray(data) && data[0]?.text) || '';
      if (responseText.trim().toUpperCase() === 'NO_RESULTS' || responseText.trim() === '') {
        setSuggestedTweets([]);
      } else {
        const suggestionsArray = responseText.split('|||').map(s => s.trim()).filter(Boolean);
        setSuggestedTweets(suggestionsArray);
      }
    } catch (error) {
      console.error("Error suggesting tweets:", error);
      toast.error("Failed to suggest new tweets.");
    } finally {
      setIsSuggesting(false);
    }
  };
  const handleAddSuggestedTweet = (tweetText: string) => {
    setIsReferenceSectionVisible(true);
    setNewTweetText(tweetText);
    setSuggestedTweets(prev => prev.filter(t => t !== tweetText));
  };
  const handleStartEdit = (tweet: ReferenceTweet) => {
    setEditingRowId(tweet.row_number);
    setEditedTweetData({
      Reference_Tweet: tweet.Reference_Tweet,
      Category: tweet.Category,
      Tone_Style: tweet.Tone_Style,
      Tags: tweet.Tags
    });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTweetData(prev => ({ ...prev, [name]: value } as Partial<ReferenceTweet>));
  };
  const handleCopyIdea = async (ideaText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(ideaText);
      toast.success('Copied to clipboard!');
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      toast.error('Failed to copy!');
    }
  };
  const handleSuggestionClick = (ideaText: string) => {
    setFinalIdea(ideaText);
    toast('Idea loaded into generator!', { icon: '✅' });
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setReferenceTweets(originalTweets);
      return;
    }
    const filtered = originalTweets.filter(t => t.Reference_Tweet.toLowerCase().includes(query.toLowerCase()));
    setReferenceTweets(filtered);
  };

  return (
    <div className="w-full mx-auto space-y-12">
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' },
      }} />

      <div className="space-y-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Generate Tweet Ideas</h2>
          <p className="text-gray-400 mb-6">Enter a topic or keywords to generate tweet ideas from Reddit.</p>
          <div className="flex flex-col w-full max-w-2xl gap-4 sm:flex-row sm:gap-2 items-center">
  <div className="flex-1 w-full">
    <label htmlFor="subreddit" className="text-sm font-medium text-gray-400 block mb-1">Subreddit</label>
    <div className="relative" ref={subredditInputRef}>
                <input
                  id="subreddit"
                  type="text"
                  className="w-full px-4 py-2 bg-[#161b22] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 text-sm sm:text-base"
                  value={fetchSubreddit}
                  onChange={(e) => setFetchSubreddit(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="e.g. ArtificialIntelligence"
                  autoComplete="off"
                />
                {isDropdownOpen && (
                  <ul className="absolute z-20 w-full mt-1 bg-[#161b22] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingSubreddits ? (
                      <li className="px-4 py-2 text-gray-500 italic text-sm">Loading...</li>
                    ) : filteredSubreddits.length > 0 ? (
                      filteredSubreddits.map((sub) => (
                        <li
                          key={sub}
                          className="px-4 py-2 text-gray-300 cursor-pointer hover:bg-gray-800 text-sm sm:text-base"
                          onClick={() => {
                            setFetchSubreddit(sub);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {sub}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500 italic text-sm">No matches found.</li>
                    )}
                  </ul>
                )}
              </div>
  </div>
  <div className="w-full sm:w-24">
    <label htmlFor="limit" className="text-sm font-medium text-gray-400 block mb-1">Limit</label>
    <select
      id="limit"
      className="w-full px-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg font-semibold text-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
      value={fetchLimit}
      onChange={(e) => setFetchLimit(Number(e.target.value))}
    >
      {[5, 10, 20, 30].map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  </div>
  <button
    onClick={fetchIdeas}
    disabled={isLoading || !fetchSubreddit}
    className="w-full sm:w-auto px-6 mt-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 shadow-lg transition-all duration-300 text-sm sm:text-base"
  >
    {isLoading ? 'Fetching...' : 'Fetch Ideas'}
  </button>
</div>
          <div className="mt-6 space-y-2">
            {isLoading ? <p className="text-sm text-center text-gray-500 py-4">Loading ideas...</p> : suggestedIdeas.length === 0 ? <p className="text-sm text-center text-gray-500 py-4">No ideas fetched yet. Use the form above to get started.</p> : <> {displayedIdeas.map((idea) => (<div key={idea.generated_idea} className="bg-[#0d1117] p-3 rounded-lg border border-gray-700 flex justify-between items-center cursor-pointer hover:border-blue-500 hover:bg-gray-800 transition-all" onClick={() => handleSuggestionClick(idea.generated_idea)}><p className="text-sm flex-grow pr-4 truncate text-gray-300">{idea.generated_idea}</p><div className="flex-shrink-0"><button className="text-xs font-semibold bg-blue-900/50 text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-800/60 transition">Select</button></div></div>))} {suggestedIdeas.length > displayedIdeas.length && (<button onClick={() => setPage(page + 1)} className="w-full text-sm font-semibold text-blue-400 py-2 hover:underline">Load More</button>)} </>}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2 text-white">Generate Tweet Variations</h3>
            <textarea className="w-full p-3 bg-[#161b22] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y text-white placeholder-gray-500" rows={4} placeholder="Select an idea from above or draft your own here..." value={finalIdea} onChange={e => setFinalIdea(e.target.value)} />
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2 text-white">Brand Voice (Optional)</h4>
            <textarea className="w-full p-3 bg-[#161b22] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500" rows={3} placeholder="Describe your brand tone (e.g., Friendly, professional)..." value={brandVoice} onChange={e => setBrandVoice(e.target.value)} />
            <div className="mt-2 p-4 border-2 border-dotted border-gray-700 rounded-lg text-center text-gray-500" onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file && file.type === 'text/plain') { const reader = new FileReader(); reader.onload = (event) => setBrandVoice(event.target?.result as string); reader.onerror = () => toast.error('Failed to read file.'); reader.readAsText(file); } }} onDragOver={e => e.preventDefault()}>
              <p>Drag & drop a .txt file or <label htmlFor="brandVoiceFile" className="text-blue-400 cursor-pointer font-semibold hover:underline">browse</label></p>
              <input id="brandVoiceFile" type="file" accept=".txt" onChange={(e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => setBrandVoice(event.target?.result as string); reader.onerror = () => toast.error('Failed to read file.'); reader.readAsText(file); } }} className="hidden" />
            </div>
          </div>
          <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-700">
            <h4 className="text-lg font-semibold mb-2 text-white">Generation Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <select className="w-full p-2 bg-[#161b22] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}><option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tone / Style</label>
                <select className="w-full p-2 bg-[#161b22] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" value={selectedTone} onChange={e => setSelectedTone(e.target.value)}><option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option></select>
              </div>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isGenerating || !finalIdea} className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1117] focus:ring-blue-500">
            {isGenerating ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>

        {variations.length > 0 && <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 shadow-lg"><h3 className="text-xl font-bold mb-4 text-white">Generated Variations</h3><div className="space-y-4">{variations.map((text, i) => (<div key={i} className="bg-[#0d1117] p-4 rounded-lg border border-gray-700 flex justify-between items-center"><p className="text-sm flex-grow pr-4 text-gray-300">{text}</p><div className="flex space-x-2 flex-shrink-0"><button onClick={() => handleCopyIdea(text, i)} className="text-xs font-semibold bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-600 transition">{copiedIndex === i ? 'Copied!' : 'Copy'}</button><button onClick={() => { setIsReferenceSectionVisible(true); handleAddSuggestedTweet(text); }} className="text-xs font-semibold bg-green-900/60 text-green-300 px-3 py-1.5 rounded-md hover:bg-green-800/70 transition">Add to Library</button></div></div>))}</div></div>}

        <div className="text-center">
          <button onClick={() => setIsReferenceSectionVisible(!isReferenceSectionVisible)} className="text-sm text-blue-400 font-semibold py-1 cursor-pointer hover:underline">
            {isReferenceSectionVisible ? 'Hide' : 'Show'} Reference Tweet Manager
          </button>
        </div>

        {isReferenceSectionVisible && (
          <div ref={referenceSectionRef} className="bg-[#161b22] p-6 rounded-lg border border-gray-800 shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Reference Tweet Manager</h3>
              <button onClick={() => setIsReferenceSectionVisible(false)} className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600 text-gray-300">Hide</button>
            </div>
            <p className="text-sm text-gray-400 -mt-4">Manage your library of inspiration for AI-generated content.</p>

            {/* Filtering Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white"><option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option></select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tone / Style</label>
                  <select value={selectedTone} onChange={e => setSelectedTone(e.target.value)} className="w-full p-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white"><option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option></select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
                  <input type="text" value={selectedTags.join(', ')} onChange={e => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))} placeholder="e.g., funny, tech" className="w-full p-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white" />
                </div>
              </div>
              <button onClick={fetchReferenceTweets} disabled={isLoadingReferences} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50">{isLoadingReferences ? 'Fetching...' : 'Fetch References'}</button>
            </div>
            <button onClick={fetchAllReferenceTweets} disabled={isLoadingReferences} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">Fetch All</button>
            <hr className="border-dashed border-gray-700" />

            {/* Add New Reference Tweet Form */}
            <div className="p-4 bg-[#0d1117] border-2 border-dashed border-gray-800 rounded-lg">
              <h4 className="font-semibold mb-3 text-white">Add New Reference Tweet</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tweet Text</label>
                  <input type="text" value={newTweetText} onChange={e => setNewTweetText(e.target.value)} placeholder="Enter the new tweet..." className="w-full p-2 bg-[#161b22] border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
                  <input type="text" value={newTweetTags} onChange={e => setNewTweetTags(e.target.value)} placeholder="e.g., funny, tech" className="w-full p-2 bg-[#161b22] border border-gray-700 rounded-lg text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select value={newTweetCategory} onChange={e => setNewTweetCategory(e.target.value)} className="w-full p-2 bg-[#161b22] border border-gray-700 rounded-lg text-white"><option>Educational</option><option>BuildInPublic</option><option>SuccessStory</option><option>Motivational</option></select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tone / Style</label>
                    <select value={newTweetTone} onChange={e => setNewTweetTone(e.target.value)} className="w-full p-2 bg-[#161b22] border border-gray-700 rounded-lg text-white"><option value="casual">Casual</option><option value="professional">Professional</option><option value="witty">Witty</option></select>
                  </div>
                  <div className="md:col-span-2 flex gap-2 pt-6">
                    <button onClick={handleAddTweet} disabled={isSubmitting} className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50">{isSubmitting ? 'Adding...' : 'Add Tweet'}</button>
                    <button type="button" onClick={() => { setNewTweetText(''); setNewTweetTags(''); }} className="w-full bg-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-dashed border-gray-700" />

            {/* Suggest New Tweets by Topic */}
            <div className="p-4 bg-[#0d1117] border-2 border-dashed border-gray-800 rounded-lg">
              <h4 className="font-semibold mb-3 text-white">Suggest New Tweets by Topic</h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Topic</label>
                    <input type="text" value={suggestionTopic} onChange={e => setSuggestionTopic(e.target.value)} placeholder="e.g., AI startups" className="w-full p-2 bg-[#161b22] border border-gray-700 rounded-lg text-white" />
                  </div>
                  <button onClick={handleSuggestTweets} disabled={isSuggesting || !suggestionTopic} className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-600 disabled:opacity-50 whitespace-nowrap">{isSuggesting ? 'Finding...' : 'Find Tweets'}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Hashtags</label><input type="text" value={suggestionHashtags} onChange={e => setSuggestionHashtags(e.target.value)} placeholder="e.g., #AI, #Tech" className="w-full p-2 bg-[#161b22] border border-gray-700 rounded-lg text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Accounts</label><input type="text" value={suggestionAccounts} onChange={e => setSuggestionAccounts(e.target.value)} placeholder="e.g., @user1, @user2" className="w-full p-2 bg-[#161b22] border border-gray-700 rounded-lg text-white" /></div>
                </div>
                {suggestedTweets.length > 0 && <div className="space-y-2 pt-2">{suggestedTweets.map((tweet, index) => (<div key={index} className="bg-[#161b22] border border-gray-700 p-3 rounded-lg flex justify-between items-center"><p className="text-sm flex-grow pr-4 text-gray-300">{tweet}</p><button onClick={() => handleAddSuggestedTweet(tweet)} className="text-xs font-semibold bg-green-900/60 text-green-300 px-3 py-1.5 rounded-md hover:bg-green-800/70 transition whitespace-nowrap">Add to Library</button></div>))}</div>}
              </div>
            </div>

            {/* Reference Tweet Table */}
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full">
                <thead className="bg-gray-800">
                  <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-3">ID</th><th scope="col" className="px-6 py-3">Reference Tweet</th><th scope="col" className="px-6 py-3">Category</th><th scope="col" className="px-6 py-3">Tone/Style</th><th scope="col" className="px-6 py-3">Tags</th><th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#161b22] divide-y divide-gray-800">
                  {isLoadingReferences ? (<tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading references...</td></tr>) : referenceTweets.length > 0 ? (referenceTweets.map(t => {
                    const isEditing = editingRowId === t.row_number;
                    return (<tr key={t.row_number} className={isEditing ? 'bg-gray-800' : 'hover:bg-gray-800/50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.row_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-300 w-2/5">{t.Reference_Tweet}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{t.Category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{t.Tone_Style}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{t.Tags}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-4">
                          <button onClick={() => handleStartEdit(t)} className="text-blue-400 hover:text-blue-300">Edit</button>
                          <button onClick={() => handleDeleteTweet(t.row_number)} className="text-red-500 hover:text-red-400">Delete</button>
                        </div>
                      </td>
                    </tr>);
                  })) : (<tr><td colSpan={6} className="text-center py-10 text-gray-500">No tweets loaded. Fetch some!</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;