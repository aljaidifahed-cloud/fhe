import React from 'react';

export const YouTubeBackground: React.FC = () => {
    const videoId = "YrK0kwqL_-E";
    // specific params for background usage: autoplay, mute, loop, no controls, playlist (for looping)
    const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
            <style>{`
                .video-container iframe {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100vw;
                    height: 100vh;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }
                @media (min-aspect-ratio: 16/9) {
                    .video-container iframe {
                        height: 56.25vw;
                    }
                }
                @media (max-aspect-ratio: 16/9) {
                    .video-container iframe {
                        width: 177.78vh;
                    }
                }
            `}</style>
            <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for better text contrast */}
            <div className="video-container absolute inset-0 w-full h-full">
                <iframe
                    src={src}
                    title="Background Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        </div>
    );
};
