import React from 'react';
import imageLoader from '../assets/image.png';

// ── Image Loading Animation Component ─────────────────────────────────
export default function ImageLoader({ size = 40, text = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="animate-bounce"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: '1s'
        }}
      >
        <img
          src={imageLoader}
          alt="Loading..."
          className="w-full h-full object-contain drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(66, 122, 67, 0.3))'
          }}
        />
      </div>
      {text && (
        <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
          {text}
        </p>
      )}
    </div>
  );
}

// ── Small Image Loading Animation for buttons/icons ─────────────────────
export function SmallImageLoader({ size = 20 }) {
  return (
    <div className="flex items-center justify-center" style={{ width: `${size}px`, height: `${size}px` }}>
      <div
        className="animate-spin"
        style={{ animationDuration: '2s' }}
      >
        <img
          src={imageLoader}
          alt="Loading..."
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

// ── Image Loading Animation with progress ──────────────────────────────
export function ImageLoaderWithProgress({ progress, size = 60 }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        {/* Rotating image */}
        <div
          className="animate-spin"
          style={{ animationDuration: '2s' }}
        >
          <img
            src={imageLoader}
            alt="Loading..."
            className="w-full h-full object-contain"
          />
        </div>

        {/* Progress indicator */}
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-green-600">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
