
import React, { useState } from 'react';

interface VideoProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoProfileModal: React.FC<VideoProfileModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  // Updated video ID from the provided link: https://youtu.be/T22xizpIbY8
  const videoId = "T22xizpIbY8"; 

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500" 
        onClick={handleClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-slate-900 w-full max-w-6xl rounded-[2.5rem] shadow-[0_0_100px_rgba(34,197,94,0.2)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/10">
        
        {/* Close Button - High Z-index */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-6 right-6 z-[210] w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all group active:scale-90"
        >
          <i className="fas fa-times group-hover:rotate-90 transition-transform"></i>
        </button>

        {/* Video Player Area */}
        <div className="flex-grow bg-black aspect-video flex items-center justify-center relative min-h-[400px]">
          {!isPlaying ? (
            /* Splash Screen / Play Button Overlay */
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-8 text-center bg-slate-900/40">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
              
              <button 
                onClick={() => setIsPlaying(true)}
                className="relative w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(22,163,74,0.8)] group cursor-pointer hover:scale-110 transition-transform active:scale-95"
              >
                <i className="fas fa-play text-3xl ml-1 text-white animate-pulse"></i>
              </button>
              
              <div className="relative">
                <h3 className="text-4xl font-black mb-3 tracking-tight">Profil Bisnis</h3>
                <p className="text-slate-300 text-sm max-w-md font-medium leading-relaxed">
                  Tonton video presentasi <span className="text-green-500 font-bold">Mitra Gizi Lokal Mandiri</span> untuk melihat operasional kami.
                </p>
              </div>
            </div>
          ) : (
            /* Actual Video Embed */
            <iframe
              className="w-full h-full absolute inset-0 z-10"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
              title="Business Profile Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}

          {/* Background Decorative Image (Visible when loading or paused) */}
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
            alt="Background decor"
          />
        </div>

        {/* Narrative Side Panel */}
        <div className="w-full md:w-80 bg-slate-800/80 backdrop-blur-md p-10 flex flex-col gap-8 border-l border-white/5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-500/10 text-green-400 rounded-md">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest">Informasi Utama</span>
            </div>
            <h4 className="text-white text-xl font-black leading-tight">Membangun Kemandirian Gizi</h4>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-green-600/20 text-green-500 flex items-center justify-center flex-shrink-0 text-xs font-black">1</div>
              <div>
                <h5 className="text-white text-sm font-bold mb-1">Rantai Pasok H-1</h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">Menjamin kesegaran maksimal untuk protein hewani dan sayuran.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-green-600/20 text-green-500 flex items-center justify-center flex-shrink-0 text-xs font-black">2</div>
              <div>
                <h5 className="text-white text-sm font-bold mb-1">Standardisasi SLHS</h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">Sertifikasi Higiene Sanitasi di setiap unit produksi kami.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-green-600/20 text-green-500 flex items-center justify-center flex-shrink-0 text-xs font-black">3</div>
              <div>
                <h5 className="text-white text-sm font-bold mb-1">Impact Lokal</h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">Memberdayakan lebih dari 50 petani dan peternak di sekitar Kebayoran.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button 
              onClick={handleClose}
              className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-all active:scale-95 shadow-xl"
            >
              Lanjut Belanja
            </button>
            <p className="text-[9px] text-center text-slate-500 mt-4 uppercase tracking-tighter">
              UD Mitra Gizi Lokal Mandiri &copy; 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
