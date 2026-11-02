'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);
  const [showList, setShowList] = useState(false);
  const [isPlayMode, setIsPlayMode] = useState(true);

  const handleFetch = async (mode) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setData(null);
    setActiveFileIndex(null);
    setIsPlayMode(mode === 'play');

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
      setShowList(true);
      
      if (mode === 'play' && resJson.list.length > 0) {
         const firstVideo = resJson.list.find(f => f.type === 'video') || resJson.list[0];
         setActiveFileIndex(resJson.list.indexOf(firstVideo));
      }

    } catch (err) {
      setError(err.message);
      setShowList(false);
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
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Tera<span className="text-blue-600">Play</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 flex items-center gap-2">
            LOGIN / SIGNUP
          </button>
        </div>
      </nav>

      {/* Header / Input Area */}
      <header className="pt-10 pb-6 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="https://www.terabox.app/..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 pl-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button 
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setUrl(text);
                } catch (e) { alert('Paste manual aja'); }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
            >
              PASTE
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleFetch('play')}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 shadow-md shadow-blue-500/20"
            >
              {loading && isPlayMode ? 'Loading...' : 'Play'}
            </button>
            <button
              onClick={() => handleFetch('download')}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 shadow-md shadow-green-500/20"
            >
               {loading && !isPlayMode ? 'Loading...' : 'Download'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-left">
              {error}
            </div>
          )}

          {/* List File */}
          {data && showList && (
            <div className="mt-6 border border-blue-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="p-3 flex gap-2 border-b border-blue-100 bg-blue-50/30">
                <button className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs">{data.list.length}</span> Files
                </button>
              </div>

              {isPlayMode && activeFileIndex !== null && (
                <div className="bg-black w-full aspect-video relative border-b border-slate-800">
                   <video 
                     key={activeFileIndex} 
                     controls 
                     controlsList="nodownload"
                     playsInline
                     className="w-full h-full object-contain"
                   >
                     <source 
                       src={data.list[activeFileIndex].fast_stream_url?.['1080p'] || data.list[activeFileIndex].fast_stream_url?.['720p'] || data.list[activeFileIndex].fast_stream_url?.['480p'] || data.list[activeFileIndex].normal_dlink} 
                       type="video/mp4" 
                     />
                   </video>
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto">
                {data.list.map((file, index) => {
                  const isVideo = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
                  const isImage = file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
                  
                  const streamUrl = file.fast_stream_url?.['1080p'] || file.fast_stream_url?.['720p'] || file.fast_stream_url?.['480p'] || file.normal_dlink;
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => {
                         if (isPlayMode) {
                            setActiveFileIndex(index);
                         } else {
                            window.open(file.normal_dlink, '_blank');
                         }
                      }}
                      className={`p-3 sm:p-4 border-b border-slate-100 flex items-center gap-3 sm:gap-4 cursor-pointer transition-colors ${activeFileIndex === index && isPlayMode ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      {/* THUMBNAIL BANNER */}
                      <div className="w-24 h-16 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center shadow-sm">
                         {isVideo ? (
                           <>
                             <video 
                               src={streamUrl} 
                               preload="metadata" 
                               className="w-full h-full object-cover opacity-80 pointer-events-none"
                             />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                               <svg className="text-white drop-shadow-md" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                             </div>
                           </>
                         ) : isImage ? (
                           <img src={file.normal_dlink} alt="thumb" className="w-full h-full object-cover" loading="lazy" />
                         ) : (
                           <svg className="text-slate-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                         )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{file.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span>{file.size_formatted}</span>
                          {file.duration && <><span>•</span><span>{file.duration}</span></>}
                          {file.quality && <><span>•</span><span className="text-green-600 font-bold">{file.quality}</span></>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* TEKS BAWAH UDAH GUE HAPUS DI SINI */}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
