import React, { useState } from 'react';

function SuggestedNew() {
  const [topic, setTopic] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [accounts, setAccounts] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedTweets, setSuggestedTweets] = useState<string[]>([]);

  const handleSuggestTweets = async () => {
    if (!topic) return;
    setIsSuggesting(true);
    setSuggestedTweets([]);
    try {
      const response = await fetch('https://fahis12.app.n8n.cloud/webhook/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
          accounts: accounts.split(',').map(a => a.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      // Support both array of strings or array of objects with 'text' property
      let suggestions: string[] = [];
      if (Array.isArray(data)) {
        suggestions = data.map((item: any) => typeof item === 'string' ? item : item.text || '');
      } else if (Array.isArray(data.suggestions)) {
        suggestions = data.suggestions.map((item: any) => typeof item === 'string' ? item : item.text || '');
      } else if (typeof data.text === 'string') {
        suggestions = data.text.split('|||').map(s => s.trim()).filter(Boolean);
      }
      setSuggestedTweets(suggestions);
    } catch (e) {
      setSuggestedTweets(['Failed to fetch suggestions.']);
    }
    setIsSuggesting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Suggested New Ideas</h2>
      <p className="text-gray-500 mt-1 mb-6">This page will display AI-suggested ideas based on trends.</p>
      <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mb-4">
        <h4 className="font-semibold mb-3 text-gray-800">Suggest New Tweets by Topic</h4>
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., AI startups"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={handleSuggestTweets}
              disabled={isSuggesting || !topic}
              className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-600 disabled:opacity-50 whitespace-nowrap"
            >
              {isSuggesting ? 'Finding...' : 'Find Tweets'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={e => setHashtags(e.target.value)}
                placeholder="e.g., #AI, #Tech"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accounts</label>
              <input
                type="text"
                value={accounts}
                onChange={e => setAccounts(e.target.value)}
                placeholder="e.g., @user1, @user2"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          {suggestedTweets.length > 0 && (
            <div className="space-y-2 pt-2">
              {suggestedTweets.map((tweet, index) => (
                <div key={index} className="bg-white border p-3 rounded-lg flex justify-between items-center">
                  <p className="text-sm flex-grow pr-4">{tweet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuggestedNew;