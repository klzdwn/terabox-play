'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/terabox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengambil data');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">
          TeraBox <span className="text-blue-500">Online Player</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Paste your TeraBox link below and start playing or downloading instantly. No apps, no BS.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Paste TeraBox Link Here
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="https://www.terabox.app/wap/share/filelist?surl=..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
          >
            {loading ? 'Processing...' : 'Play Now'}
          </button>
        </div>
      </div>

      {/* Error Box */}
      {error && (
        <div className="w-full max-w-2xl bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-xl mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result Box */}
      {result && (
        <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Response Data
          </h2>
          <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto border border-slate-800">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Footer / Trust badges ala iteraplay */}
      <div className="mt-16 text-center text-slate-500 text-sm">
        <div className="flex justify-center gap-6 mb-2">
          <span>🚀 Fast</span>
          <span>💎 No Ads</span>
          <span>🔒 Private</span>
        </div>
        <p>Secure API proxy. Powered by xAPIverse.</p>
      </div>
    </div>
  );
}
