import React from 'react';

export const GifBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for better text contrast */}
            <img
                src="/background.gif"
                alt="Background"
                className="w-full h-full object-cover object-center"
            />
        </div>
    );
};
