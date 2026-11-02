'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null); // Nyimpen index file yg lagi diputer

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 sm:px-6 mb-8 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <h1 className="text-xl font-bold">TeraPlay <span className="text-blue-600">Clone</span></h1>
        </div>
        <button className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          LOGIN / SIGNUP
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-6 mb-8 border border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="https://www.terabox.app/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <svg className="absolute left-3 top-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <button 
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setUrl(text);
                } catch (e) {
                  alert('Gagal paste otomatis, paste manual aja.');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              PASTE
            </button>
          </div>
          
          <button
            onClick={handleFetch}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Play'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* List File */}
        {data && data.list && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex gap-2 bg-slate-50">
              <span className="text-sm font-bold text-slate-600">Total {data.list.length} File ditemukan</span>
            </div>

            <div className="flex flex-col">
              {data.list.map((file, index) => {
                const isImage = file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                const isVideo = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
                
                // Link stream prioritas (buat video) atau link gambar
                const streamUrl = file.fast_stream_url?.['1080p'] || file.fast_stream_url?.['720p'] || file.fast_stream_url?.['480p'] || file.normal_dlink;

                return (
                  <div key={index} className="border-b border-slate-100 last:border-0">
                    
                    {/* Bagian Header List (Bisa di klik) */}
                    <div 
                      onClick={() => setActiveFileIndex(activeFileIndex === index ? null : index)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${activeFileIndex === index ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                    >
                      <div className="w-20 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                         {isVideo ? (
                           <svg className="text-white/50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                         ) : isImage ? (
                           <svg className="text-white/50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                         ) : (
                           <svg className="text-white/50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                         )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{file.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                          <span>{file.size_formatted}</span>
                          {file.duration && <><span className="w-1 h-1 bg-slate-300 rounded-full"></span><span>{file.duration}</span></>}
                          {file.quality && <><span className="w-1 h-1 bg-slate-300 rounded-full"></span><span className="text-green-600">{file.quality}</span></>}
                        </div>
                      </div>
                      
                      {/* Tombol panah buat buka tutup player */}
                      <div className={`text-slate-400 transition-transform ${activeFileIndex === index ? 'rotate-180' : ''}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>

                    {/* Player / Preview Inline (Muncul kalau di klik) */}
                    {activeFileIndex === index && (
                      <div className="bg-slate-900 border-t border-slate-200">
                        {isVideo ? (
                          <div className="aspect-video bg-black flex items-center justify-center relative">
                            {/* Hapus autoPlay biar ga jalan otomatis */}
                            <video controls controlsList="nodownload" className="w-full h-full object-contain">
                              <source src={streamUrl} type="video/mp4" />
                              Browser lu ga support video.
                            </video>
                          </div>
                        ) : isImage ? (
                          <div className="p-4 flex justify-center bg-slate-900">
                            <img src={streamUrl} alt={file.name} className="max-h-[400px] object-contain rounded-lg" />
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-400 text-sm">
                            Tipe file tidak didukung untuk ditampilkan.
                          </div>
                        )}
                        
                        {/* Action Bar di dalam player */}
                        <div className="p-3 bg-slate-800 flex justify-end gap-2">
                           <a 
                              href={file.normal_dlink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              Download
                            </a>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
