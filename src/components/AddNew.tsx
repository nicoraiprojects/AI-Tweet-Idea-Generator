import React, { useState } from 'react';

function AddNew() {
  const [tweetText, setTweetText] = useState('');
  const [tweetTags, setTweetTags] = useState('');
  const [tweetCategory, setTweetCategory] = useState('Educational');
  const [tweetTone, setTweetTone] = useState('casual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedTweets, setSuggestedTweets] = useState<any[]>([]);

  const handleAddTweet = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tweetText.trim()) {
      alert('Tweet text cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    // TODO: Replace with actual API call if needed
    setTimeout(() => {
      alert('Reference tweet added!');
      setTweetText('');
      setTweetTags('');
      setTweetCategory('Educational');
      setTweetTone('casual');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSuggestTweets = async () => {
    setIsSuggesting(true);
    setSuggestedTweets([]);
    const response = await fetch('https://your-n8n-instance/webhook/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: tweetText, // Assuming tweetText is the topic
        hashtags: tweetTags.split(',').map(h => h.trim()).filter(Boolean),
        accounts: '', // No accounts selected in this form
        category: tweetCategory,
        tone: tweetTone,
      }),
    });
    const data = await response.json();
    setSuggestedTweets(data.suggestions || []);
    setIsSuggesting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm ">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Add New Idea</h2>
      <p className="text-gray-500 mt-1 mb-6">This page will contain a form to add a new tweet idea manually.</p>
      <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mb-4">
        <h4 className="font-semibold mb-3 text-gray-800">Add New Reference Tweet</h4>
        <form className="space-y-4" onSubmit={handleAddTweet}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tweet Text</label>
            <input
              type="text"
              value={tweetText}
              onChange={e => setTweetText(e.target.value)}
              placeholder="Enter the new tweet..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={tweetTags}
              onChange={e => setTweetTags(e.target.value)}
              placeholder="e.g., funny, tech"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={tweetCategory}
                onChange={e => setTweetCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option>Educational</option>
                <option>BuildInPublic</option>
                <option>SuccessStory</option>
                <option>Motivational</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tone / Style</label>
              <select
                value={tweetTone}
                onChange={e => setTweetTone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Tweet'}
              </button>
              <button
                type="button"
                onClick={handleSuggestTweets}
                disabled={isSuggesting}
                className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSuggesting ? 'Suggesting...' : 'Suggest Tweets'}
              </button>
              <button
                type="button"
                onClick={() => { setTweetText(''); setTweetTags(''); }}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {suggestedTweets.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
          <h4 className="font-semibold mb-3 text-gray-800">Suggested Tweets</h4>
          <ul className="space-y-2">
            {suggestedTweets.map((tweet, index) => (
              <li key={index} className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-800">{tweet.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Likes: {tweet.likes}, Retweets: {tweet.retweets}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AddNew;