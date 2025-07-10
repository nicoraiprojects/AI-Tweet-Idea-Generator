import React, { useState } from 'react';
// Import both CSS files
import './App.css'; // Global styles and layout
import './IdeaGenerator.css'; // Component-specific styles

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

  // --- State Variables ---
  const [suggestedIdeas, setSuggestedIdeas] = useState<SuggestedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalIdea, setFinalIdea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Educational'); // Keep state synced
  const [selectedTone, setSelectedTone] = useState('casual'); // Keep state synced
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

  // Add state for subreddit and limit
  const [fetchSubreddit, setFetchSubreddit] = useState('');
  const [fetchLimit, setFetchLimit] = useState(5);

  // --- Functions (Mostly unchanged, minor adjustments) ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setVariations(null);
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory, // Ensure category/tone are used if needed by generate workflow
          tone: selectedTone,
          idea: finalIdea,
          reference_tweets: selectedForGeneration.map(t => t.Reference_Tweet)
        }),
      });
      const data = await response.json();
      // Assuming the 'generate' webhook returns an object with variation keys or an array
      setVariations(data);
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas. Make sure your n8n 'generate' workflow is active.");
    } finally {
      setIsGenerating(false);
    }
  };
  const fetchIdeas = async () => {
    setIsLoading(true);
    setSuggestedIdeas([]);
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/start', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subreddit: fetchSubreddit,
          limit: fetchLimit
        })
      });
      const data = await response.json();
      let foundIdeas: any[] = [];
      // This logic handles different possible n8n return structures
      if (Array.isArray(data)) foundIdeas = data.map(item => item?.json ?? item);
      else if (data && (data.title || data.generated_idea)) foundIdeas = [data]; // Handle single object return

      // Assuming the Reddit node returns titles in a 'title' property or the AI returns 'generated_idea'
      setSuggestedIdeas(foundIdeas.map(idea => ({ generated_idea: idea.title || idea.generated_idea || JSON.stringify(idea) /* fallback */ })));

    } catch (error) {
      console.error("Error fetching ideas:", error);
      alert("Failed to fetch ideas. Make sure your n8n 'start' workflow is active.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleCopyIdea = async (ideaText: string, index: number) => { try { await navigator.clipboard.writeText(ideaText); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 1500); } catch { alert('Failed to copy!'); } };
  const fetchReferenceTweets = async () => { setIsLoadingReferences(true); try { const response = await fetch('https://fahisk.app.n8n.cloud/webhook/second', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ category: selectedCategory, tone: selectedTone }) }); const data = await response.json(); console.log("📦 Raw data from n8n:", data); if (Array.isArray(data)) { // Assuming the Google Sheets node returns an array of objects
             const flatTweets = data.map(item => {
                 // Access properties based on how your Google Sheet node outputs them
                 // Use item?.json if data is structured like [{ json: {...} }, ...]
                 // Otherwise, just use item if data is structured like [{...}, {...}, ...]
                 const raw = item?.json ?? item;
                 return {
                     row_number: raw.row_number, // Use the actual row number from the sheet
                     Reference_Tweet: raw["Reference Tweet"] || raw.Reference_Tweet, // Handle potential key variations
                     Category: raw.Category,
                     Tone_Style: raw.Tone_Style || raw.Tone // Handle potential key variations
                 };
             });
             setReferenceTweets(flatTweets);
             console.log("✅ Flattened reference tweets:", flatTweets);
         } else {
             console.warn("⚠️ Unexpected data:", data);
             setReferenceTweets([]); // Set to empty array on unexpected data
         }
     } catch (error) {
         alert("Failed to fetch reference tweets. Make sure your n8n 'second' workflow is active and returns data in the expected format.");
         console.error("Fetch reference tweets error:", error);
         setReferenceTweets([]); // Set to empty array on error
     } finally {
         setIsLoadingReferences(false);
     }
 };
  const handleAddOrUpdateTweet = async () => {
    // Use selected category/tone for new tweets
    const categoryForNewTweet = selectedCategory;
    const toneForNewTweet = newTweetTag || selectedTone; // Use newTweetTag if available, otherwise current selectedTone

    if (editIndex !== null) {
      handleUpdateReferenceTweet(); // This uses existing state for edit
    } else {
      if (newTweetText?.trim() && toneForNewTweet) { // Check for toneForNewTweet
        try {
          // Call the backend to add the new reference tweet
          const response = await fetch('https://fahisk.app.n8n.cloud/webhook/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Reference_Tweet: newTweetText,
              Category: categoryForNewTweet, // Use categoryForNewTweet
              Tone_Style: toneForNewTweet // Use toneForNewTweet
            }),
          });
          const data = await response.json();
          console.log("📦 Raw data from webhook/add:", data);
          // Assume backend returns the new tweet data including its assigned row_number
          if(data && data.row_number) {
               const newTweet: ReferenceTweet = {
                  row_number: data.row_number, // Use the row_number from the backend response
                  Reference_Tweet: newTweetText,
                  Category: categoryForNewTweet,
                  Tone_Style: toneForNewTweet
               };
               setReferenceTweets([...referenceTweets, newTweet]);
               setNewTweetText('');
               setNewTweetTag('');
          } else {
               alert("Failed to add reference tweet: Unexpected response from backend.");
               console.error("Add error: Unexpected response data:", data);
          }

        } catch (error) {
          alert("Failed to add reference tweet. Make sure your n8n 'add' workflow is active.");
          console.error("Add error:", error);
        }
      } else {
          alert("Please enter tweet text and select a tone/tag to add.");
      }
    }
  };
  const handleCancelEdit = () => { setEditIndex(null); setEditTweetText(''); setEditTweetTag(''); };
  const handleSuggestionClick = (ideaText: string) => { setFinalIdea(ideaText); };
  const handleDeleteReferenceTweet = async (tweet: ReferenceTweet, idx: number) => {
      if (!window.confirm(`Are you sure you want to delete the tweet with ID ${tweet.row_number}?`)) {
          return; // Stop if user cancels
      }
      try {
          const response = await fetch('https://fahisk.app.n8n.cloud/webhook/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ row_number: tweet.row_number }),
          });
          // Check if the deletion was successful based on the response
          // (You might need to adjust this depending on what your n8n workflow returns)
          if (response.ok) { // Check for success status code (e.g., 200)
              setReferenceTweets(referenceTweets.filter(t => t.row_number !== tweet.row_number)); // Filter by row_number
              setSelectedForGeneration(prev => prev.filter(t => t.row_number !== tweet.row_number));
              console.log(`Tweet with ID ${tweet.row_number} deleted.`);
          } else {
              // Handle errors based on response status or body
              const errorData = await response.text(); // or response.json() if backend returns JSON
              alert(`Failed to delete reference tweet: ${errorData || response.statusText}`);
              console.error("Delete error response:", response.status, errorData);
          }
      } catch (error) {
          alert("Failed to delete reference tweet.");
          console.error("Delete error:", error);
      }
  };
  const handleUpdateReferenceTweet = async () => {
     if (editIndex !== null && editTweetText?.trim() && editTweetTag) {
         const tweetToUpdate = referenceTweets[editIndex];
         // Ensure we have a row_number to send for update
         if (!tweetToUpdate || tweetToUpdate.row_number === undefined || tweetToUpdate.row_number === null) {
             alert("Cannot update tweet: Missing row number.");
             console.error("Update error: Tweet or row number is missing.", tweetToUpdate);
             return;
         }
         const updatedTweetData = {
             row_number: tweetToUpdate.row_number, // Use the existing row_number
             Reference_Tweet: editTweetText,
             Category: tweetToUpdate.Category, // Keep the original category
             Tone_Style: editTweetTag
         };
         try {
             const response = await fetch('https://fahisk.app.n8n.cloud/webhook/update', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(updatedTweetData),
             });

             if (response.ok) { // Check for successful response
                 // Update the tweet in the local state using the unique row_number
                 setReferenceTweets(referenceTweets.map(t =>
                     t.row_number === updatedTweetData.row_number ? updatedTweetData : t
                 ));
                 // Also update it in the selected for generation list if it's there
                 setSelectedForGeneration(prev => prev.map(t =>
                      t.row_number === updatedTweetData.row_number ? updatedTweetData : t
                 ));
                 setEditIndex(null);
                 setEditTweetText('');
                 setEditTweetTag('');
                 console.log(`Tweet with ID ${updatedTweetData.row_number} updated.`);
             } else {
                 const errorData = await response.text();
                 alert(`Failed to update reference tweet: ${errorData || response.statusText}`);
                 console.error("Update error response:", response.status, errorData);
             }
         } catch (error) {
             alert("Failed to update reference tweet. Make sure your n8n 'update' workflow is active.");
             console.error("Update error:", error);
         }
     } else {
         alert("Please ensure tweet text and tag are filled before updating.");
     }
  };
  const handleSelectTweetForGeneration = (tweet: ReferenceTweet) => { if (!selectedForGeneration.some(t => t.row_number === tweet.row_number)) { setSelectedForGeneration([...selectedForGeneration, tweet]); } };
  const handleRemoveTweetFromGeneration = (tweetToRemove: ReferenceTweet) => { setSelectedForGeneration(selectedForGeneration.filter(t => t.row_number !== tweetToRemove.row_number)); };

 return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ─── Suggested Ideas ─── */}
      <div className="
        bg-gray-50 border border-gray-200
        rounded-2xl p-6 shadow-lg
        flex flex-col gap-5
      ">
        <h3 className="text-xl font-bold text-purple-700">Suggested Ideas</h3>

        <div className="flex space-x-4 items-end mb-4">
          <div className="flex-1 flex flex-col space-y-2">
            <label htmlFor="subreddit" className="text-sm font-medium text-gray-600">
              Subreddit
            </label>
            <input
              id="subreddit"
              type="text"
              className="
                w-full px-4 py-2 bg-gray-100 border border-gray-200
                rounded-lg text-gray-900
                focus:outline-none focus:ring-2 focus:ring-purple-200
              "
              value={fetchSubreddit}
              onChange={e => setFetchSubreddit(e.target.value)}
              placeholder="e.g., technology"
            />
          </div>
          <div className="w-24 flex flex-col space-y-2">
            <label htmlFor="limit" className="text-sm font-medium text-gray-600">
              How Many?
            </label>
            <select
              id="limit"
              className="
                w-full px-4 py-2 bg-purple-100 border border-purple-400
                rounded-lg font-semibold text-purple-700
                focus:outline-none focus:ring-2 focus:ring-purple-200
              "
              value={fetchLimit}
              onChange={e => setFetchLimit(Number(e.target.value))}
            >
              {[5, 10, 20, 30].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchIdeas}
          disabled={isLoading}
          className="
            px-4 py-2 bg-purple-100 border border-purple-400
            text-purple-700 font-semibold rounded-lg
            hover:bg-purple-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isLoading ? 'Fetching…' : 'Fetch New Ideas'}
        </button>

        <div className="flex flex-col gap-2 mt-4">
          {isLoading ? (
            <p className="text-center text-gray-500 italic">Loading suggested ideas…</p>
          ) : suggestedIdeas.length > 0 ? (
            suggestedIdeas.map((idea, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(idea.generated_idea)}
                className="
                  flex justify-between items-center
                  px-4 py-2 border border-gray-200
                  rounded-lg cursor-pointer
                  hover:border-purple-400 transition
                "
              >
                <span className="text-gray-900">{idea.generated_idea}</span>
                <button
                  onClick={e => { e.stopPropagation(); handleCopyIdea(idea.generated_idea, idx); }}
                  className="ml-4 p-1 rounded hover:text-purple-400 text-gray-500"
                >
                  {copiedIndex === idx ? '✅' : '📋'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">
              No ideas yet. Click “Fetch New Ideas.”
            </p>
          )}
        </div>
      </div>

      {/* ─── Create Your Content ─── */}
      <div className="
        bg-gray-50 border border-gray-200
        rounded-2xl p-6 shadow-lg
        flex flex-col gap-5
      ">
        <h3 className="text-xl font-bold text-purple-700">Create Your Content</h3>
        <textarea
          className="
            w-full px-4 py-2 bg-gray-100 border border-gray-200
            rounded-lg resize-y
            focus:outline-none focus:ring-2 focus:ring-purple-200
          "
          rows={4}
          placeholder="Click an idea from the left, or type your own here…"
          value={finalIdea}
          onChange={e => setFinalIdea(e.target.value)}
        />

        <div className="mt-4">
          <h4 className="text-lg text-gray-600 mb-2">
            Tweets Selected for Generation
          </h4>
          {selectedForGeneration.length > 0 ? (
            <ul className="space-y-2">
              {selectedForGeneration.map(t => (
                <li key={t.row_number} className="
                  flex items-center justify-between
                  p-2 bg-gray-100 border border-gray-200 rounded-md
                ">
                  <span className="text-gray-900 flex-1 truncate">
                    {t.Reference_Tweet}
                  </span>
                  <button
                    onClick={() => handleRemoveTweetFromGeneration(t)}
                    className="text-sm text-red-500 hover:text-red-600 ml-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              Select tweets from the list below to use them as inspiration.
            </p>
          )}
        </div>
      </div>

      {/* ─── Manage Reference Tweets ─── */}
      <div className="
        lg:col-span-2
        bg-gray-50 border border-gray-200
        rounded-2xl p-6 shadow-lg
        flex flex-col gap-5
      ">
        <h3 className="text-xl font-bold text-purple-700">Manage Reference Tweets</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="text-sm font-medium text-gray-600 block mb-1">
              Category
            </label>
            <select
              id="category"
              className="
                w-full px-4 py-2 bg-gray-100 border border-gray-200
                rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200
              "
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option>Educational</option>
              <option>BuildInPublic</option>
              <option>SuccessStory</option>
              <option>Motivational</option>
            </select>
          </div>

          <div>
            <label htmlFor="tone" className="text-sm font-medium text-gray-600 block mb-1">
              Tone / Style
            </label>
            <select
              id="tone"
              className="
                w-full px-4 py-2 bg-gray-100 border border-gray-200
                rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200
              "
              value={selectedTone}
              onChange={e => setSelectedTone(e.target.value)}
            >
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="witty">Witty</option>
            </select>
          </div>

          <button
            onClick={fetchReferenceTweets}
            disabled={isLoadingReferences}
            className="
              px-4 py-2 bg-purple-100 border border-purple-400
              text-purple-700 font-semibold rounded-lg
              hover:bg-purple-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoadingReferences ? 'Fetching…' : 'Fetch Reference Tweets'}
          </button>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 reference-tweet-table">
              <thead className="bg-purple-400">
                <tr>
                  {['Id','Reference Tweet','Category','Tone/Style','Actions','Select'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-white uppercase text-xs font-semibold tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingReferences ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500 italic">
                      Loading…
                    </td>
                  </tr>
                ) : referenceTweets.length > 0 ? (
                  referenceTweets.map((t, idx) => (
                    <tr key={t.row_number}>
                      <td data-label="Id" className="px-4 py-2">{t.row_number}</td>
                      <td data-label="Reference Tweet" className="px-4 py-2">
                        {t.Reference_Tweet}
                      </td>
                      <td data-label="Category" className="px-4 py-2">{t.Category}</td>
                      <td data-label="Tone/Style" className="px-4 py-2">{t.Tone_Style}</td>
                      <td data-label="Actions" className="px-4 py-2 space-x-2">
                        <button onClick={() => {/*…*/}} className="text-sm text-indigo-600 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteReferenceTweet(t, idx)} className="text-sm text-red-500 hover:underline">
                          Delete
                        </button>
                      </td>
                      <td data-label="Select" className="px-4 py-2">
                        <button
                          onClick={() => handleSelectTweetForGeneration(t)}
                          disabled={selectedForGeneration.some(x => x.row_number === t.row_number)}
                          className="
                            px-3 py-1 bg-purple-400 text-white text-sm
                            rounded-lg hover:bg-purple-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                          "
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500 italic">
                      No tweets loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add / Edit form */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 block">
              {editIndex != null ? 'Edit Reference Tweet' : 'Add New Reference Tweet'}
            </label>
            <textarea
              rows={3}
              className="
                w-full px-4 py-2 bg-gray-100 border border-gray-200
                rounded-lg resize-y
                focus:outline-none focus:ring-2 focus:ring-purple-200
              "
              value={editIndex != null ? editTweetText : newTweetText}
              onChange={e => editIndex != null ? setEditTweetText(e.target.value) : setNewTweetText(e.target.value)}
              placeholder="Reference Tweet text…"
            />
            <select
              className="
                w-full px-4 py-2 bg-gray-100 border border-gray-200
                rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200
              "
              value={editIndex != null ? editTweetTag : newTweetTag}
              onChange={e => editIndex != null ? setEditTweetTag(e.target.value) : setNewTweetTag(e.target.value)}
            >
              <option value="">Select Tone</option>
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="witty">Witty</option>
            </select>
            {editIndex != null ? (
              <div className="flex space-x-4">
                <button
                  onClick={handleUpdateReferenceTweet}
                  className="
                    px-4 py-2 bg-purple-100 border border-purple-400
                    text-purple-700 font-semibold rounded-lg
                    hover:bg-purple-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Update
                </button>
                <button onClick={handleCancelEdit} className="text-sm text-gray-600 hover:underline">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddOrUpdateTweet}
                className="
                  px-4 py-2 bg-purple-100 border border-purple-400
                  text-purple-700 font-semibold rounded-lg
                  hover:bg-purple-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Generate Button (full-width footer) ─── */}
      <div className="col-span-full flex justify-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={isGenerating || !finalIdea || selectedForGeneration.length === 0}
          className="
            px-6 py-3 bg-purple-400 text-white font-semibold
            rounded-lg hover:bg-purple-500 text-lg
            min-w-[220px]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isGenerating ? 'Generating…' : 'Generate Tweets'}
        </button>
      </div>

      {/* Generated Variations card BELOW the generate button */}
      {variations && (
        <div className="col-span-full flex justify-center mt-4">
          <div className="
            bg-gray-100 border border-gray-200
            rounded-lg p-6 mt-6 space-y-4 w-full max-w-2xl
          ">
            <h3 className="text-xl font-bold text-purple-700">
              Generated Variations
            </h3>
            {(Array.isArray(variations) ? variations : [variations]).map((v, i) => (
              <div key={i} className="
                bg-gray-50 border border-gray-200
                rounded-lg p-4 space-y-2
              ">
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