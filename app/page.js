'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setData(null);
    setActiveFileIndex(null);

    try {
      const response = await fetch('/api/terabox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const resJson = await response.json();
      if (!response.ok || resJson.status !== 'success') {
        throw new Error(resJson.error || resJson.message || 'Gagal mengambil data');
      }
      setData(resJson);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 py-4 px-4 sm:px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">iTera<span className="text-blue-600">Play</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-slate-600 font-medium hover:text-blue-600">Telegram Bot</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-500/20">
            LOGIN / SIGNUP
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-white pt-16 pb-12 px-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Best TeraBox Video <br className="hidden sm:block"/>
          <span className="text-blue-600">Player & Downloader Online</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
          Login to enjoy unlimited features and video plays - Free registration available!
        </p>

        {/* Input Card (The Main App) */}
        <div className="max-w-3xl mx-auto bg-white sm:bg-slate-50 rounded-3xl shadow-xl sm:shadow-lg border border-slate-100 p-4 sm:p-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="https://www.terabox.app/..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 pl-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <svg className="absolute left-4 top-4.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <button 
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setUrl(text);
                } catch (e) { alert('Paste manual aja'); }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              PASTE
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleFetch}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 shadow-md shadow-blue-500/20"
            >
              {loading ? 'Memproses...' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Play
                </>
              )}
            </button>
            <button
              onClick={handleFetch}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 shadow-md shadow-green-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download
            </button>
          </div>

          {/* Hasil List File (Kalau ada data) */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-left">
              {error}
            </div>
          )}

          {data && data.list && (
            <div className="mt-6 text-left">
              <div className="flex gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs">{data.list.length}</span> Videos
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {data.list.map((file, index) => {
                  const isVideo = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
                  const isImage = file.type === 'image' || file.name.match(/\.(jpg|jpeg|png)$/i);
                  const streamUrl = file.fast_stream_url?.['1080p'] || file.fast_stream_url?.['720p'] || file.fast_stream_url?.['480p'] || file.normal_dlink;

                  return (
                    <div key={index} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                      <div 
                        onClick={() => setActiveFileIndex(activeFileIndex === index ? null : index)}
                        className={`p-3 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${activeFileIndex === index ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="w-16 h-12 bg-slate-800 rounded-lg shrink-0 flex items-center justify-center">
                           {isVideo ? <svg className="text-white/50" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> : <svg className="text-white/50" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold truncate">{file.name}</h3>
                          <p className="text-xs text-slate-500">{file.size_formatted} • {file.duration || file.quality}</p>
                        </div>
                      </div>

                      {activeFileIndex === index && (
                        <div className="bg-black aspect-video relative">
                          {isVideo ? (
                            <video controls className="w-full h-full"><source src={streamUrl} type="video/mp4" /></video>
                          ) : isImage ? (
                            <img src={streamUrl} alt="img" className="w-full h-full object-contain" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* SEO / Content Section (Biar persis web asli) */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How to Use the TeraBox Player</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
              <h3 className="font-bold mb-2">Find & Copy</h3>
              <p className="text-sm text-slate-500">Go to TeraBox and find your video. Copy the link from the address bar or hit share.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
              <h3 className="font-bold mb-2">Paste & Play</h3>
              <p className="text-sm text-slate-500">Come back here and paste it. Click 'Play' and boom - you're watching instantly!</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
              <h3 className="font-bold mb-2">Stream or Download</h3>
              <p className="text-sm text-slate-500">Use our TeraBox Video Downloader feature to save offline or stream instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">Why Choose Our TeraBox Player?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl mb-2">🎥</div>
              <h3 className="font-bold text-sm mb-1">Online Player</h3>
              <p className="text-xs text-slate-500">No downloads needed</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-bold text-sm mb-1">Works Everywhere</h3>
              <p className="text-xs text-slate-500">Phone, laptop, tablet</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-sm mb-1">Super Fast</h3>
              <p className="text-xs text-slate-500">Loads in 2-3 seconds</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-sm mb-1">Downloader</h3>
              <p className="text-xs text-slate-500">Completely free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
        <p className="mb-2">© 2024 TeraPlay Clone. Powered by xAPIverse.</p>
        <p className="text-xs">We don't store any files. All rights reserved.</p>
      </footer>
    </div>
  );
}
