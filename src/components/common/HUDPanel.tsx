/**
 * BLACK S.H.E.E.P. - Light Theme HUD Panel Component
 * White Base (#FFFFFF), Crisp Black Typography/Borders, Scientific Red Accents (#DC2626)
 */

import React from 'react';

interface HUDPanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  tag?: string;
  status?: string;
  statusColor?: 'amber' | 'golden' | 'red' | 'emerald' | 'zinc';
  variant?: 'default' | 'amber' | 'golden';
  className?: string;
  headerRight?: React.ReactNode;
  cornerBrackets?: boolean;
  scanline?: boolean;
  onClick?: () => void;
}

export const HUDPanel: React.FC<HUDPanelProps> = ({
  children,
  title,
  subtitle,
  tag,
  status,
  statusColor = 'amber',
  variant = 'default',
  className = '',
  headerRight,
  cornerBrackets = true,
  scanline = false,
  onClick,
}) => {
  const displayTag = tag || subtitle;
  const getStatusColor = () => {
    switch (statusColor) {
      case 'amber':
      case 'red':
        return 'text-[#DC2626] bg-red-50 border-red-200';
      case 'golden':
        return 'text-black bg-zinc-100 border-zinc-300';
      case 'emerald':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      default:
        return 'text-zinc-700 bg-zinc-100 border-zinc-300';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white/95 backdrop-blur-md border border-black/15 rounded-xs p-4 sm:p-5 transition-all duration-200 overflow-hidden shadow-sm ${
        onClick ? 'cursor-pointer hover:border-[#DC2626] hover:shadow-md' : ''
      } ${className}`}
    >
      {/* Corner Brackets */}
      {cornerBrackets && (
        <>
          {/* Top-Left Bracket */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#DC2626] pointer-events-none" />
          {/* Top-Right Bracket */}
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#DC2626] pointer-events-none" />
          {/* Bottom-Left Bracket */}
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#DC2626] pointer-events-none" />
          {/* Bottom-Right Bracket */}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#DC2626] pointer-events-none" />
        </>
      )}

      {/* Optional Subtle Red Scanline */}
      {scanline && (
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#DC2626]/50 to-transparent animate-scanline pointer-events-none" />
      )}

      {/* Header Bar */}
      {(title || displayTag || status || headerRight) && (
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-black/10 text-xs font-mono-data">
          <div className="flex items-center gap-2">
            {displayTag && (
              <span className="text-[10px] text-[#DC2626] font-bold tracking-wider uppercase">
                {displayTag}
              </span>
            )}
            {displayTag && title && <span className="text-black/30">/</span>}
            {title && (
              <h3 className="font-display text-lg tracking-wider text-black uppercase">
                {title}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status && (
              <span
                className={`text-[9px] font-mono-data px-2 py-0.5 rounded-xs border font-bold tracking-wider uppercase ${getStatusColor()}`}
              >
                {status}
              </span>
            )}
            {headerRight}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-black">{children}</div>
    </div>
  );
};
