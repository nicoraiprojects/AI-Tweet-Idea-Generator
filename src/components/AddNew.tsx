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

    const response = await fetch('https://fahis12.app.n8n.cloud/webhook/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: tweetText,
        tags: tweetTags.split(',').map(t => t.trim()).filter(Boolean),
        category: tweetCategory,
        tone: tweetTone,
      }),
    });

    if (response.ok) {
      alert('Reference tweet added!');
      setTweetText('');
      setTweetTags('');
      setTweetCategory('Educational');
      setTweetTone('casual');
    } else {
      alert('Failed to add tweet.');
    }

    setIsSubmitting(false);
  };

  const handleSuggestTweets = async () => {
    setIsSuggesting(true);
    setSuggestedTweets([]);
    const response = await fetch('https://fahis12.app.n8n.cloud/webhook/reddit-post-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: tweetText,
        hashtags: tweetTags.split(',').map(h => h.trim()).filter(Boolean),
        accounts: '',
        category: tweetCategory,
        tone: tweetTone,
      }),
    });
    const data = await response.json();
    setSuggestedTweets(data.suggestions || []);
    setIsSuggesting(false);
  };

  return (
    <div className=" p-4 sm:p-6  shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Add New Idea</h2>
      <p className="text-gray-400 text-sm sm:text-base mt-1 mb-6">
        This page will contain a form to add a new tweet idea manually.
      </p>
      <div className="p-4  rounded-lg mb-4">
        <h4 className="font-semibold text-white mb-3 text-base sm:text-lg">Add New Reference Tweet</h4>
        <form className="space-y-4" onSubmit={handleAddTweet}>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Tweet Text</label>
            <textarea
              value={tweetText}
              onChange={e => setTweetText(e.target.value)}
              placeholder="Enter the new tweet..."
              rows={4}
              className="w-full p-2 rounded-xl bg-[#2a323c] text-white placeholder-[#4f5761] border border-gray-600 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Tags</label>
            <input
              type="text"
              value={tweetTags}
              onChange={e => setTweetTags(e.target.value)}
              placeholder="e.g., funny, tech"
              className="w-full p-2 rounded-lg bg-[#2a323c] text-[#576574] placeholder-[#4f5761] border border-gray-600 text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Category</label>
              <select
                value={tweetCategory}
                onChange={e => setTweetCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#2a323c] text-[#D3D3D3] border border-gray-600 text-sm sm:text-base"
              >
                <option>Educational</option>
                <option>BuildInPublic</option>
                <option>SuccessStory</option>
                <option>Motivational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Tone / Style</label>
              <select
                value={tweetTone}
                onChange={e => setTweetTone(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#2a323c] text-[#D3D3D3] border border-gray-600 text-sm sm:text-base"
              >
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer bg-gradient-to-r from-[#50c878] to-[#3eb489] text-white font-semibold rounded-lg hover:from-green-700 hover:to-white-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 shadow-lg transition-all duration-300 text-sm sm:text-base"
            >
              {isSubmitting ? 'Adding...' : 'Add Tweet'}
            </button>
            <button
              type="button"
              onClick={handleSuggestTweets}
              disabled={isSuggesting}
              className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 shadow-lg transition-all duration-300 text-sm sm:text-base"
            >
              {isSuggesting ? 'Suggesting...' : 'Suggest Tweets'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTweetText('');
                setTweetTags('');
              }}
              className="w-full cursor-pointer bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {suggestedTweets.length > 0 && (
        <div className="mt-6 p-4 bg-[#2a323c] border border-gray-600 rounded-lg">
          <h4 className="font-semibold mb-3 text-white text-base sm:text-lg">Suggested Tweets</h4>
          <ul className="space-y-2">
            {suggestedTweets.map((tweet, index) => (
              <li key={index} className="bg-[#2a323c] p-3 rounded-lg shadow-sm border border-gray-600">
                <p className="text-white text-sm sm:text-base">{tweet.text}</p>
                <p className="text-sm text-gray-400 mt-1">
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