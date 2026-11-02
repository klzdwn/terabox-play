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
  
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleFetch = async (mode) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setData(null);
    setActiveFileIndex(null);
    setIsPlayMode(mode === 'play');
    setFullscreenImage(null);

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
         const firstVideoIndex = resJson.list.findIndex(f => 
           f.type === 'video' || 
           f.name.match(/\.(mp4|mkv|mov|webm)$/i)
         );
         setActiveFileIndex(firstVideoIndex !== -1 ? firstVideoIndex : 0);
      }

    } catch (err) {
      setError(err.message);
      setShowList(false);
    } finally {
      setLoading(false);
    }
  };

  const getBestVideoUrl = (file) => {
    if (file.fast_stream_url) {
      return file.fast_stream_url['480p'] || file.fast_stream_url['360p'] || file.fast_stream_url['720p'] || file.fast_stream_url['1080p'] || file.normal_dlink;
    }
    return file.normal_dlink;
  };

  const Thumbnail = ({ file }) => {
    const [error, setError] = useState(false);
    const isVideo = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
    const isImage = file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
    const src = isVideo ? getBestVideoUrl(file) : file.normal_dlink;

    if (error || !isVideo) {
      return (
        <div className="w-full h-full relative flex items-center justify-center bg-slate-800">
          {isImage ? (
             <img src={src} alt="thumb" className="w-full h-full object-cover" />
          ) : (
             <>
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <svg className="text-white/80 drop-shadow-md relative z-10" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
             </>
          )}
        </div>
      );
    }

    return (
      <>
        <video 
          src={src} 
          preload="metadata" 
          onError={() => setError(true)}
          className="w-full h-full object-cover opacity-80 pointer-events-none"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <svg className="text-white drop-shadow-md" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* FULLSCREEN IMAGE OVERLAY */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <img 
            src={fullscreenImage} 
            alt="Fullscreen" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

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

          {data && showList && (
            <div className="mt-6 border border-blue-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="p-3 flex gap-2 border-b border-blue-100 bg-blue-50/30">
                <button className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs">{data.list.length}</span> Files
                </button>
              </div>

              {/* MAIN PLAYER AREA */}
              {isPlayMode && activeFileIndex !== null && (
                <div className="bg-black w-full aspect-video relative border-b border-slate-800 flex items-center justify-center overflow-hidden">
                   {(() => {
                     const file = data.list[activeFileIndex];
                     const isVid = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
                     const isImg = file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
                     
                     // KALAU FOTO
                     if (isImg) {
                        return (
                          <div className="relative w-full h-full flex items-center justify-center group">
                            <img 
                              src={file.normal_dlink} 
                              alt={file.name} 
                              className="w-full h-full object-contain pointer-events-none" 
                            />
                            {/* TOMBOL FULLSCREEN DI POJOK KANAN BAWAH */}
                            <button 
                              onClick={() => setFullscreenImage(file.normal_dlink)}
                              className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-md transition-all border border-white/20 z-20"
                              title="Fullscreen"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                            </button>
                          </div>
                        );
                     }

                     // KALAU VIDEO
                     if (isVid) {
                       return (
                         <video 
                           key={activeFileIndex} 
                           controls 
                           controlsList="nodownload"
                           playsInline
                           className="w-full h-full object-contain"
                         >
                           <source src={getBestVideoUrl(file)} type="video/mp4" />
                         </video>
                       );
                     }
                     return null;
                   })()}
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto">
                {data.list.map((file, index) => {
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
                      <div className="w-24 h-16 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center shadow-sm">
                         <Thumbnail file={file} />
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
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
