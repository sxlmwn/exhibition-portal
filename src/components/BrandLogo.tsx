import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 36,
  showText = true,
  textColor = 'text-charcoal',
  subtextColor = 'text-sage-800'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Glass Tent-Canopy Architectural Mark */}
      <div 
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Canopy Facet Gradients */}
            <linearGradient id="canopyLeft" x1="24" y1="6" x2="6" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A4C2A3" />
              <stop offset="100%" stopColor="#4A6549" />
            </linearGradient>
            <linearGradient id="canopyRight" x1="24" y1="6" x2="42" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C2D8C1" />
              <stop offset="100%" stopColor="#5D7A5C" />
            </linearGradient>
            <linearGradient id="canopyCenter" x1="24" y1="6" x2="24" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2EFE1" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#7E9D7C" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#3B533A" stopOpacity="0.95" />
            </linearGradient>
            
            {/* Pavilion Pillars & Base */}
            <linearGradient id="boothBase" x1="12" y1="30" x2="36" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A6549" />
              <stop offset="100%" stopColor="#243323" />
            </linearGradient>

            {/* Glass Sheen / Specular Highlights */}
            <linearGradient id="glassSheen" x1="18" y1="8" x2="28" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Pavilion Base Platform */}
          <ellipse cx="24" cy="40" rx="17" ry="4.5" fill="#243323" fillOpacity="0.18" />
          <path
            d="M9 39C9 37 15.7 35.5 24 35.5C32.3 35.5 39 37 39 39C39 41 32.3 42.5 24 42.5C15.7 42.5 9 41 9 39Z"
            fill="url(#boothBase)"
            fillOpacity="0.4"
          />

          {/* Pavilion Booth Structural Pillars */}
          <path d="M12 28L13 38.5" stroke="#4A6549" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 30L24 39" stroke="#3B533A" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M36 28L35 38.5" stroke="#4A6549" strokeWidth="2" strokeLinecap="round" />

          {/* Main Glass Tent Canopy Left Facet */}
          <path
            d="M24 6L8 28C13 29.5 19 30 24 30V6Z"
            fill="url(#canopyLeft)"
            fillOpacity="0.95"
          />

          {/* Main Glass Tent Canopy Right Facet */}
          <path
            d="M24 6L40 28C35 29.5 29 30 24 30V6Z"
            fill="url(#canopyRight)"
            fillOpacity="0.92"
          />

          {/* Central Glass Diamond Ridge */}
          <path
            d="M24 6L16 29C20 30 28 30 32 29L24 6Z"
            fill="url(#canopyCenter)"
          />

          {/* Specular Diagonal Reflection Sheen */}
          <path
            d="M24 6L19 21C22 21.5 26 21.5 28.5 20.8L24 6Z"
            fill="url(#glassSheen)"
          />

          {/* Top Canopy Apex Finial Bead */}
          <circle cx="24" cy="5.5" r="2.2" fill="#EBF4EA" stroke="#4A6549" strokeWidth="1" />
        </svg>
      </div>

      {/* Bold iOS-Style Typography Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-sans font-extrabold text-base sm:text-lg tracking-tight leading-none ${textColor}`}>
            Exhibition Agency
          </span>
          <span className={`font-sans text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase leading-tight mt-0.5 ${subtextColor}`}>
            Portal
          </span>
        </div>
      )}
    </div>
  );
};
