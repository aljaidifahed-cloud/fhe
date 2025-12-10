import React from 'react';

export const VideoBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden bg-slate-900 pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover opacity-80"
      >
        <source src="/background.mp4" type="video/mp4" />
        {/* Fallback if video is missing or format unsupported */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-pulse"></div>
      </video>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/40"></div>
    </div>
  );
};
