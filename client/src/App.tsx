import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLeaderboard } from './context/LeaderboardContext';
import { useAuth } from './context/AuthContext';
import { LoadingScreen } from './components/intro/LoadingScreen';
import { Header } from './components/common/Header';
import { Top5PodiumCards } from './components/podium/Top5PodiumCards';
import { InformationControlPanel } from './components/presentation/InformationControlPanel';
import { BottomStatusBar } from './components/presentation/BottomStatusBar';
import { TopFiveShowcaseModal } from './components/presentation/TopFiveShowcaseModal';
import { TeamModal } from './components/teams/TeamModal';
import { LiveScoreToast } from './components/common/LiveScoreToast';
import { Subtle3DBackground } from './components/background/Subtle3DBackground';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CinematicRevealScreen } from './components/ceremony/CinematicRevealScreen';
import { RefreshCw, AlertCircle, Maximize2 } from 'lucide-react';

export const App: React.FC = () => {
  const { leaderboard, selectedTeam, closeTeamModal, isLoading, error, refreshLeaderboard } = useLeaderboard();
  const { isAuthenticated } = useAuth();

  // Intro loading screen
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return !sessionStorage.getItem('somaiya_sih_intro_played');
  });

  // Dedicated Presentation Mode (16:9 full viewport, ESC to exit)
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Cinematic Top 5 Showcase modal
  const [isTop5ShowcaseOpen, setIsTop5ShowcaseOpen] = useState<boolean>(false);

  // Cinematic Suspense Reveal Ceremony
  const [isRevealOpen, setIsRevealOpen] = useState<boolean>(false);

  useEffect(() => {
    if (leaderboard?.revealSession?.isActive) {
      setIsRevealOpen(true);
    }
  }, [leaderboard?.revealSession?.isActive]);

  // Current view: 'leaderboard' | 'admin' | 'login'
  const [currentView, setCurrentView] = useState<'leaderboard' | 'admin' | 'login'>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      return 'admin';
    }
    return 'leaderboard';
  });

  // Sync browser URL & handle ESC key for presentation mode
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('leaderboard');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPresentationMode) {
          setIsPresentationMode(false);
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        }
        if (isTop5ShowcaseOpen) {
          setIsTop5ShowcaseOpen(false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPresentationMode, isTop5ShowcaseOpen]);

  const togglePresentationMode = () => {
    const next = !isPresentationMode;
    setIsPresentationMode(next);
    if (next) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const navigateTo = (view: 'leaderboard' | 'admin' | 'login') => {
    setCurrentView(view);
    const newPath = view === 'admin' ? '/admin' : view === 'login' ? '/admin/login' : '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('somaiya_sih_intro_played', 'true');
  };

  return (
    <div className={`text-[#111111] bg-[#FAFAFA] relative selection:bg-[#A01C24] selection:text-white ${
      isPresentationMode || currentView === 'leaderboard'
        ? 'lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col'
        : 'min-h-screen flex flex-col'
    }`}>
      {/* 1. Cinematic Intro Screen (under 4 seconds, skippable) */}
      <AnimatePresence>
        {showIntro && <LoadingScreen onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Subtle Background Ambience */}
      <Subtle3DBackground />

      {/* 2. Top Header (K J Somaiya left, SIH 2026 center, SIH logo & controls right) */}
      <Header
        onAdminClick={() => {
          if (isAuthenticated) {
            navigateTo('admin');
          } else {
            navigateTo('login');
          }
        }}
        onViewTop5={() => setIsTop5ShowcaseOpen(true)}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={togglePresentationMode}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden">
        {/* VIEW 1: ADMIN LOGIN */}
        {currentView === 'login' && !isAuthenticated && (
          <AdminLogin
            onBack={() => navigateTo('leaderboard')}
            onSuccess={() => navigateTo('admin')}
          />
        )}

        {/* VIEW 2: ADMIN DASHBOARD (Protected) */}
        {(currentView === 'admin' || (currentView === 'login' && isAuthenticated)) && (
          isAuthenticated ? (
            <AdminDashboard onBackToPublic={() => navigateTo('leaderboard')} />
          ) : (
            <AdminLogin
              onBack={() => navigateTo('leaderboard')}
              onSuccess={() => navigateTo('admin')}
            />
          )
        )}

        {/* VIEW 3: 16:9 SINGLE VIEWPORT EVENT LEADERBOARD */}
        {currentView === 'leaderboard' && (
          <div className="flex-1 min-h-0 flex flex-col p-2.5 sm:p-3.5 max-w-[1920px] w-full mx-auto">
            {/* Loading & Error States */}
            {isLoading && !leaderboard && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <RefreshCw className="w-8 h-8 text-somaiya-700 animate-spin mb-3" />
                <p className="text-xs uppercase tracking-widest font-mono">
                  Loading Live Event Leaderboard...
                </p>
              </div>
            )}

            {error && (
              <div className="max-w-xl mx-auto my-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => refreshLeaderboard()}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold"
                >
                  Retry
                </button>
              </div>
            )}

            {leaderboard && (
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                {/* LEFT SIDE (~58% width on 16:9 screen): 3D TOP 5 PODIUM */}
                <div className="lg:col-span-7 h-full min-h-[460px] lg:min-h-0">
                  <Top5PodiumCards
                    teams={leaderboard.teams}
                    onOpenReveal={() => setIsRevealOpen(true)}
                  />
                </div>

                {/* RIGHT SIDE (~42% width on 16:9 screen): EVENT CONTROL & REMAINING RANKINGS */}
                <div className="lg:col-span-5 h-full min-h-[420px] lg:min-h-0">
                  <InformationControlPanel teams={leaderboard.teams} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Bottom Status Strip (16 TEAMS | SCORED | HIGHEST | AVG | LIVE | LAST UPDATED) */}
      {currentView === 'leaderboard' && <BottomStatusBar />}

      {/* Dedicated Top 5 Final Celebration Showcase Modal */}
      {leaderboard && (
        <TopFiveShowcaseModal
          isOpen={isTop5ShowcaseOpen}
          onClose={() => setIsTop5ShowcaseOpen(false)}
          teams={leaderboard.teams}
        />
      )}

      {/* Cinematic Suspense Reveal Screen (#5 down to #1 Grand Winner) */}
      {isRevealOpen && (
        <CinematicRevealScreen onClose={() => setIsRevealOpen(false)} />
      )}

      {/* Team Details & Full Scorecard Modal */}
      <TeamModal team={selectedTeam} onClose={closeTeamModal} />

      {/* Real-time Score Alert Toast */}
      <LiveScoreToast />
    </div>
  );
};
