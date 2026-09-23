import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Trophy, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onAdminClick: () => void;
  onViewTop5: () => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAdminClick,
  onViewTop5,
  isPresentationMode,
  onTogglePresentationMode,
}) => {
  const { soundEnabled, toggleSound, leaderboard } = useLeaderboard();
  const { isAuthenticated, logout } = useAuth();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const eventStatus = leaderboard?.eventStatus || 'LIVE';

  return (
    <header className="w-full bg-white/95 border-b border-gray-200/90 shadow-2xs z-40 select-none shrink-0">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* LEFT: K J SOMAIYA BRANDING */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center group">
            <img
              src="/assets/branding/kj-somaiya-logo.svg"
              alt="K J Somaiya Institute of Management"
              className="h-9 sm:h-11 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/branding/kj-somaiya-logo.png';
              }}
            />
          </a>
        </div>

        {/* CENTER: SIH 2026 INTERNAL HACKATHON TITLE */}
        <div className="text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black tracking-tight text-gray-950 font-sans">
              SIH <span className="text-somaiya-700">2026</span>
            </span>
            <span className="text-gray-300 font-light">•</span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-gray-700">
              INTERNAL HACKATHON
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400 hidden md:block">
            K J Somaiya Institute of Management • Live Event Presentation
          </span>
        </div>

        {/* RIGHT: SIH LOGO + CONTROLS + LIVE PILL */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* SIH Logo */}
          <div className="flex items-center">
            <img
              src="/assets/branding/sih-logo.png"
              alt="Smart India Hackathon 2026"
              className="h-9 sm:h-11 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/branding/sih-logo.webp';
              }}
            />
          </div>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* VIEW TOP 5 Final Showcase Button */}
          <button
            onClick={onViewTop5}
            title="Open Cinematic Top 5 Showcase"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-somaiya-50 hover:bg-somaiya-100 text-somaiya-800 text-xs font-bold border border-somaiya-200 shadow-2xs transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-somaiya-700" />
            <span className="hidden sm:inline">View Top 5</span>
          </button>

          {/* PRESENTATION MODE Toggle */}
          <button
            onClick={onTogglePresentationMode}
            title={isPresentationMode ? 'Exit Presentation Mode (ESC)' : 'Enter 16:9 Presentation Mode'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs ${
              isPresentationMode
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            {isPresentationMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Presentation</span>
              </>
            )}
          </button>

          {/* Live Indicator Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-somaiya-50 text-somaiya-700 text-[11px] font-bold border border-somaiya-200 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-somaiya-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-somaiya-700"></span>
            </span>
            <span>LIVE</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute chimes' : 'Enable live score chimes'}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-somaiya-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Admin Access Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onAdminClick}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-somaiya-700 text-white text-xs font-semibold transition-all shadow-2xs"
              >
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">Control</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-somaiya-700 text-white text-xs font-semibold transition-all shadow-2xs"
            >
              <Shield className="w-3 h-3 text-gray-300" />
              <span className="hidden sm:inline">Judge</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
