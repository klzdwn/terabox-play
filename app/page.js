'use client';
import { useState, useRef, useEffect } from 'react';

// Komponen Thumbnail pake Canvas biar ga kedip
const SmartThumbnail = ({ file, getBestVideoUrl }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const isVideo = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
  const isImage = file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
  const src = isVideo ? getBestVideoUrl(file) : file.normal_dlink;

  // Kalo ini gambar asli, tampilin langsung
  if (isImage) {
    return <img src={src} alt="thumb" className="w-full h-full object-cover" />;
  }

  // Kalo video, kita pake video hidden buat dapetin frame, terus gambar ke canvas
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-slate-900 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse z-10">
          <svg className="text-slate-600" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      )}
      
      <video 
        ref={videoRef}
        src={src} 
        preload="metadata"
        muted
        playsInline
        className={`hidden`} // Video aslinya disembunyiin
        onLoadedData={(e) => {
          const video = e.target;
          const canvas = canvasRef.current;
          if (canvas && video) {
            // Gambar frame video ke canvas
            canvas.width = 160;
            canvas.height = 90;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setIsLoaded(true); // Tampilin canvas
          }
        }}
      />
      
      {/* Canvas buat nampilin hasil screenshot video */}
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Icon Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
        <svg className="text-white drop-shadow-md" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      </div>
    </div>
  );
};

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

  const handleDirectDownload = (fileUrl) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBestVideoUrl = (file) => {
    if (file.fast_stream_url) {
      return file.fast_stream_url['480p'] || file.fast_stream_url['360p'] || file.fast_stream_url['720p'] || file.fast_stream_url['1080p'] || file.normal_dlink;
    }
    return file.normal_dlink;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[100px]"></div>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-2">
          <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain" />
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl border border-white/10 shadow-2xl z-[10000] transition-all active:scale-95 flex items-center justify-center backdrop-blur-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          </button>
        </div>
      )}

      <nav className="relative z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-md py-4 px-4 sm:px-6 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <span className="text-xl font-black tracking-tight text-white">Tera<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Play</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">Login</button>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-12 pb-20">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            Download & Play <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">TeraBox Files</span>
          </h1>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-black/50 mb-8">
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tempel link TeraBox di sini..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 pl-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <svg className="absolute left-4 top-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            
            <button 
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setUrl(text);
                } catch (e) { alert('Paste manual aja'); }
              }}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 sm:py-0 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95 text-sm self-start sm:self-auto sm:h-[54px]"
            >
              Paste
            </button>
          </div>
          
          <div className="flex flex-row gap-3 mt-6">
            <button
              onClick={() => handleFetch('play')}
              disabled={loading || !url.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              {loading && isPlayMode ? 'Loading...' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Play
                </>
              )}
            </button>
            
            <button
              onClick={() => handleFetch('download')}
              disabled={loading || !url.trim()}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 active:scale-[0.98]"
            >
               {loading && !isPlayMode ? 'Loading...' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
              <span>{error}</span>
            </div>
          )}

          {data && showList && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/5">{data.list.length} Files Found</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              {isPlayMode && activeFileIndex !== null && (
                <div key={`player-${activeFileIndex}`} className="bg-black rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-xl relative aspect-video">
                   {(() => {
                     const file = data.list[activeFileIndex];
                     const isVid = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
                     const isImg = file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
                     
                     if (isImg) {
                        return (
                          <div className="relative w-full h-full flex items-center justify-center group">
                            <img src={file.normal_dlink} alt={file.name} className="w-full h-full object-contain pointer-events-none" />
                            <button onClick={() => setFullscreenImage(file.normal_dlink)} className="absolute bottom-4 right-4 bg-black/60 text-white p-3 rounded-xl border border-white/10 z-20">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                            </button>
                          </div>
                        );
                     }
                     if (isVid) {
                       return (
                         <video key={`vid-${activeFileIndex}`} controls controlsList="nodownload" playsInline className="w-full h-full object-contain">
                           <source src={getBestVideoUrl(file)} type="video/mp4" />
                         </video>
                       );
                     }
                     return null;
                   })()}
                </div>
              )}

              {isPlayMode ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {data.list.map((file, index) => (
                    <div 
                      key={index} onClick={() => setActiveFileIndex(index)}
                      className={`p-3 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${activeFileIndex === index ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/50 border-transparent hover:bg-slate-800'}`}
                    >
                      <div className="w-20 h-14 bg-slate-950 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center border border-white/5">
                         <SmartThumbnail file={file} getBestVideoUrl={getBestVideoUrl} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold truncate mb-1 ${activeFileIndex === index ? 'text-blue-400' : 'text-slate-200'}`}>{file.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span>{file.size_formatted}</span>
                          {file.duration && <span>• {file.duration}</span>}
                          {file.quality && <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">{file.quality}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {data.list.map((file, index) => {
                    const isVideo = file.type === 'video' || file.name.match(/\.(mp4|mkv|mov|webm)$/i);
                    const ext = file.name.split('.').pop().toUpperCase();
                    
                    return (
                      <div key={index} className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 relative border border-white/10">
                             <SmartThumbnail file={file} getBestVideoUrl={getBestVideoUrl} />
                             <div className="absolute top-0 right-0 bg-black/80 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-bl-md">
                               {isVideo ? ext : 'IMG'}
                             </div>
                           </div>
                           <div className="flex-1 min-w-0">
                             <h3 className="text-sm font-bold text-white truncate mb-2">{file.name}</h3>
                             <div className="flex flex-wrap gap-2 text-xs font-semibold">
                               <span className="bg-white/5 text-slate-300 px-2 py-1 rounded-md">{file.size_formatted}</span>
                               {file.duration && <span className="bg-white/5 text-slate-300 px-2 py-1 rounded-md">{file.duration}</span>}
                               {file.quality && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md">{file.quality}</span>}
                             </div>
                           </div>
                        </div>

                        {isVideo && (
                          <div className="flex gap-3 mt-2">
                            <button 
                              onClick={() => handleDirectDownload(file.fast_stream_url?.['1080p'] || file.fast_stream_url?.['720p'] || file.normal_dlink)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              Server 1 (HD)
                            </button>
                            <button 
                              onClick={() => handleDirectDownload(file.normal_dlink)}
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              Server 2 (MP4)
                            </button>
                          </div>
                        )}
                        {!isVideo && (
                          <button 
                            onClick={() => handleDirectDownload(file.normal_dlink)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
                          >
                            Download File
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
