'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCreatedUrl('');

    try {
      let ttl_seconds = null;
      if (expiresAt) {
        const expiresDate = new Date(expiresAt);
        const now = new Date();
        const diffMs = expiresDate.getTime() - now.getTime();
        if (diffMs > 0) {
          ttl_seconds = Math.floor(diffMs / 1000);
        } else {
          // If date is in past, maybe just ignore or throw? 
          // Let's set to 1 second to expire it immediately if they picked past date
          ttl_seconds = 1;
        }
      }

      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl_seconds || undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If 400, show validation error
        throw new Error(data.error || 'Something went wrong');
      }

      setCreatedUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8">Pastebin Clone</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Paste your content here..."
            required
            spellCheck={false}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Expires At (Optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Views (Optional)</label>
            <input
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              placeholder="e.g. 5"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {createdUrl && (
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Paste Created!</h2>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={createdUrl}
              className="flex-1 p-2 bg-white dark:bg-black border rounded"
            />
            <button
              onClick={() => navigator.clipboard.writeText(createdUrl)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copy
            </button>
            <a
              href={createdUrl}
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
