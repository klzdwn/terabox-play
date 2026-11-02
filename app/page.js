'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedFile(null);

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
      
      // Otomatis pilih file video pertama buat diputer
      if (resJson.list && resJson.list.length > 0) {
        const firstVideo = resJson.list.find(f => f.type === 'video') || resJson.list[0];
        setSelectedFile(firstVideo);
      }

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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span className="hidden sm:inline">LOGIN / SIGNUP</span>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              PASTE
            </button>
          </div>
          
          <button
            onClick={handleFetch}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Play
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Video Player Area (Kalau udah dipilih) */}
        {selectedFile && (
          <div className="mb-8">
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative">
              <video 
                key={selectedFile.file_path} // Biar video reload kalau ganti pilihan
                controls 
                autoPlay
                className="w-full h-full object-contain"
              >
                <source 
                  src={selectedFile.fast_stream_url?.['1080p'] || selectedFile.fast_stream_url?.['720p'] || selectedFile.fast_stream_url?.['480p'] || selectedFile.normal_dlink} 
                  type="video/mp4" 
                />
              </video>
            </div>
            <div className="mt-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold break-all">{selectedFile.name}</h2>
                <p className="text-sm text-slate-500">{selectedFile.size_formatted} • {selectedFile.duration} • {selectedFile.quality}</p>
              </div>
              <a 
                href={selectedFile.normal_dlink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap ml-4"
              >
                Download
              </a>
            </div>
          </div>
        )}

        {/* List File */}
        {data && data.list && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Tabs */}
            <div className="p-4 border-b border-slate-100 flex gap-2">
              <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs">{data.list.length}</span>
                Files
              </button>
            </div>

            {/* List Items */}
            <div className="max-h-[400px] overflow-y-auto">
              {data.list.map((file, index) => (
                <div 
                  key={index}
                  onClick={() => {
                     if (file.type === 'video') setSelectedFile(file);
                  }}
                  className={`p-4 border-b border-slate-50 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedFile?.file_path === file.file_path ? 'bg-blue-50/50' : ''}`}
                >
                  {/* Thumbnail Placeholder */}
                  <div className="w-20 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                     {/* Gambar thumbnail aslinya ga ada di API, jadi pake icon video */}
                     <svg className="text-white/50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{file.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>{file.size_formatted}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{file.duration}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-green-600">{file.quality}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 text-center bg-slate-50 text-sm text-slate-500">
              Pilih video di atas untuk memutar. Klik Download untuk menyimpan.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
