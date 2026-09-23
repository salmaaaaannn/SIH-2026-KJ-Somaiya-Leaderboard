import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Sparkles,
  Award,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { RankedTeam } from '../../types';
import { soundEffects } from '../../utils/audio';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { useAuth } from '../../context/AuthContext';

interface CinematicRevealScreenProps {
  onClose: () => void;
}

type RevealPhase =
  | 'INTRO'
  | 'COUNTDOWN'
  | 'CARD_PROJECT'
  | 'CARD_TEAM'
  | 'CARD_LEADER'
  | 'CARD_SCORE'
  | 'WINNER_PROMPT'
  | 'WINNER_REVEAL'
  | 'FINALE';

export const CinematicRevealScreen: React.FC<CinematicRevealScreenProps> = ({ onClose }) => {
  const { leaderboard, stepRevealSession, resetRevealSession } = useLeaderboard();
  const { token, isAuthenticated } = useAuth();

  // Top 5 teams ordered by rank (Rank 1 to 5)
  const top5Teams = useMemo(() => {
    if (!leaderboard) return [];
    return leaderboard.teams.slice(0, 5);
  }, [leaderboard]);

  // Current rank being revealed: 5, 4, 3, 2, 1
  const [currentRank, setCurrentRank] = useState<number>(5);
  const [phase, setPhase] = useState<RevealPhase>('INTRO');
  const [countdownVal, setCountdownVal] = useState<number>(3);
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Active team currently being revealed
  const currentTeam: RankedTeam | undefined = useMemo(() => {
    return top5Teams.find((t) => t.rank === currentRank);
  }, [top5Teams, currentRank]);

  // Trigger confetti for Rank 1
  const triggerGrandConfetti = useCallback(() => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#A01C24', '#F59E0B', '#FFFFFF', '#D97706'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#A01C24', '#FFD700', '#F59E0B'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#A01C24', '#FFFFFF', '#E11D48'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#FFD700', '#F59E0B'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  // Advance state machine
  const advance = useCallback(() => {
    if (phase === 'INTRO') {
      setCurrentRank(5);
      setPhase('COUNTDOWN');
      setCountdownVal(3);
      if (soundOn) soundEffects.playCountdownBeep(false);
      return;
    }

    if (phase === 'COUNTDOWN') {
      setPhase('CARD_PROJECT');
      if (soundOn) soundEffects.playSuspensePulse();
      return;
    }

    if (phase === 'CARD_PROJECT') {
      setPhase('CARD_TEAM');
      if (soundOn) soundEffects.playScoreUpdate();
      return;
    }

    if (phase === 'CARD_TEAM') {
      setPhase('CARD_LEADER');
      return;
    }

    if (phase === 'CARD_LEADER') {
      setPhase('CARD_SCORE');
      if (soundOn) soundEffects.playScoreUpdate();
      setRevealedRanks((prev) => (prev.includes(currentRank) ? prev : [...prev, currentRank]));
      return;
    }

    if (phase === 'CARD_SCORE') {
      if (currentRank > 2) {
        // Move to next rank down (5 -> 4 -> 3 -> 2)
        const nextRank = currentRank - 1;
        setCurrentRank(nextRank);
        setPhase('COUNTDOWN');
        setCountdownVal(3);
        if (soundOn) soundEffects.playCountdownBeep(false);
      } else if (currentRank === 2) {
        // Move to Winner suspense prompt for Rank 1
        setCurrentRank(1);
        setPhase('WINNER_PROMPT');
        if (soundOn) soundEffects.playSuspensePulse();
      } else {
        // After Rank 1 is finished, go to FINALE
        setPhase('FINALE');
      }
      return;
    }

    if (phase === 'WINNER_PROMPT') {
      setPhase('COUNTDOWN');
      setCountdownVal(3);
      if (soundOn) soundEffects.playCountdownBeep(false);
      return;
    }

    if (phase === 'WINNER_REVEAL') {
      setPhase('FINALE');
    }
  }, [phase, currentRank, soundOn]);

  // Countdown timer effect
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;

    if (countdownVal > 1) {
      const timer = setTimeout(() => {
        setCountdownVal((v) => v - 1);
        if (soundOn) soundEffects.playCountdownBeep(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownVal === 1) {
      const timer = setTimeout(() => {
        setCountdownVal(0);
        if (soundOn) soundEffects.playCountdownBeep(true);
        if (currentRank === 1) {
          setPhase('WINNER_REVEAL');
          setRevealedRanks((prev) => (prev.includes(1) ? prev : [...prev, 1]));
          if (soundOn) soundEffects.playGrandWinnerFanfare();
          triggerGrandConfetti();
        } else {
          setPhase('CARD_PROJECT');
          if (soundOn) soundEffects.playSuspensePulse();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, countdownVal, currentRank, soundOn, triggerGrandConfetti]);

  // Keyboard navigation: Spacebar / ArrowRight to advance, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        advance();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0708] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#A01C24]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-amber-500/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      {/* Top Bar Header */}
      <header className="relative z-10 px-6 sm:px-10 py-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src="/assets/branding/kj-somaiya-logo.svg"
            alt="Somaiya"
            className="h-8 w-auto brightness-0 invert opacity-90 hidden sm:block"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/branding/kj-somaiya-logo.png';
            }}
          />
          <img
            src="/assets/branding/sih-logo.png"
            alt="SIH"
            className="h-8 w-auto bg-white/10 p-0.5 rounded-lg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/branding/sih-logo.webp';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-somaiya-400 uppercase tracking-widest">
                SIH 2026 Internal Hackathon
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                Official Selection Ceremony
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-white tracking-wide">
              K J Somaiya Institute of Management
            </h2>
          </div>
        </div>

        {/* Progress Tracker (5 -> 4 -> 3 -> 2 -> 1) */}
        <div className="flex items-center gap-2">
          {[5, 4, 3, 2, 1].map((r) => {
            const isRevealed = revealedRanks.includes(r);
            const isCurrent = currentRank === r && phase !== 'INTRO' && phase !== 'FINALE';
            return (
              <div
                key={r}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-400 text-gray-950 shadow-md shadow-amber-400/30 scale-105'
                    : isRevealed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 text-gray-500 border border-white/10'
                }`}
              >
                {isRevealed && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-gray-950 animate-ping" />}
                <span>#{r}</span>
              </div>
            );
          })}
        </div>

        {/* Presenter Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
            title={soundOn ? 'Mute Ceremony Audio' : 'Unmute Ceremony Audio'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={advance}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-somaiya-700 hover:bg-somaiya-600 text-white text-xs font-extrabold transition-all shadow-md shadow-somaiya-700/30"
          >
            <span>{phase === 'INTRO' ? 'START CEREMONY' : phase === 'FINALE' ? 'FINALE' : 'NEXT STEP'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 transition-colors border border-white/10"
            title="Exit Presentation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-12">
        <AnimatePresence mode="wait">
          {/* INTRO SCREEN */}
          {phase === 'INTRO' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-somaiya-700/20 text-somaiya-300 border border-somaiya-600/30 text-xs font-mono font-bold uppercase tracking-widest mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Top 5 Qualifying Teams Reveal</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none mb-4">
                Smart India Hackathon 2026
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-somaiya-300 via-amber-200 to-white mb-6">
                Internal Selection Results • K J Somaiya Institute of Management
              </p>

              <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
                Judges have evaluated all 16 teams through Round 1, Round 2, and Round 3.
                The final scores are locked. We will now reveal the <strong>Top 5 teams</strong> representing our institute at the national SIH 2026 hackathon.
              </p>

              <button
                onClick={advance}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-somaiya-700 to-somaiya-800 hover:from-somaiya-600 hover:to-somaiya-700 text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-somaiya-700/30 hover:scale-105 transition-all"
              >
                <Trophy className="w-5 h-5 text-amber-300" />
                <span>BEGIN TOP 5 REVEAL</span>
              </button>
            </motion.div>
          )}

          {/* COUNTDOWN SCREEN (3... 2... 1...) */}
          {phase === 'COUNTDOWN' && (
            <motion.div
              key={`countdown-${currentRank}-${countdownVal}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center"
            >
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
                {currentRank === 1 ? 'REVEALING THE GRAND WINNER' : `REVEALING RANK #${currentRank}`}
              </div>

              <div className="font-mono text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                {countdownVal > 0 ? countdownVal : '✦'}
              </div>

              <div className="text-xs text-gray-500 font-mono mt-4">
                Suspense Drumroll • Hold for Reveal
              </div>
            </motion.div>
          )}

          {/* CARDS FOR RANK 5, 4, 3, 2 (Ordered Reveal: Project -> Team -> Leader -> Score) */}
          {(phase === 'CARD_PROJECT' ||
            phase === 'CARD_TEAM' ||
            phase === 'CARD_LEADER' ||
            phase === 'CARD_SCORE') &&
            currentTeam && (
              <motion.div
                key={`card-${currentRank}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
              >
                {/* Rank Badge Accent */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-somaiya-700/80 border border-somaiya-500 flex items-center justify-center font-mono font-black text-3xl text-amber-300 shadow-inner">
                      #{currentRank}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                        {currentRank === 2
                          ? '1st Runner Up'
                          : currentRank === 3
                          ? '2nd Runner Up'
                          : 'Top 5 Finalist'}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {currentTeam.sihId} • {currentTeam.teamNumber}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 font-semibold">
                    {currentTeam.theme}
                  </span>
                </div>

                {/* 1. PROJECT NAME REVEAL */}
                <div className="mt-6">
                  <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Project Title:
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {currentTeam.projectName}
                  </h2>
                </div>

                {/* 2. TEAM NAME REVEAL */}
                <div className="mt-6 min-h-[50px]">
                  {phase !== 'CARD_PROJECT' ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="text-xs font-mono font-bold text-somaiya-400 uppercase tracking-wider mb-1">
                        Team Name:
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-gray-200">
                        {currentTeam.teamName}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-10 rounded-xl bg-white/5 animate-pulse flex items-center px-4 text-xs font-mono text-gray-600">
                      Decrypting Team Name...
                    </div>
                  )}
                </div>

                {/* 3. TEAM LEADER REVEAL */}
                <div className="mt-4 min-h-[40px]">
                  {phase === 'CARD_LEADER' || phase === 'CARD_SCORE' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-gray-300 font-mono"
                    >
                      Team Leader: <strong className="text-white text-sm">{currentTeam.teamLeader}</strong> • {currentTeam.department}
                    </motion.div>
                  ) : null}
                </div>

                {/* 4. FINAL AVERAGE REVEAL */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-gray-400 font-mono">
                    Evaluation: (Round 1: {currentTeam.judgement.round1} • Round 2: {currentTeam.judgement.round2} • Round 3: {currentTeam.judgement.round3})
                  </div>

                  {phase === 'CARD_SCORE' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-baseline gap-1.5 px-5 py-2.5 rounded-2xl bg-somaiya-700/40 border border-somaiya-500/50 text-amber-300"
                    >
                      <span className="text-xs font-mono uppercase font-bold text-gray-300">Final Avg:</span>
                      <span className="font-mono text-3xl font-black text-white">
                        {currentTeam.judgement.finalAverage?.toFixed(2)}
                      </span>
                      <span className="text-xs font-mono text-gray-400">/ 100</span>
                    </motion.div>
                  ) : (
                    <div className="text-xs font-mono text-amber-400 animate-pulse">
                      Revealing final average score...
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          {/* GRAND WINNER SUSPENSE PROMPT (#1) */}
          {phase === 'WINNER_PROMPT' && (
            <motion.div
              key="winner-prompt"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center max-w-3xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                <Crown className="w-10 h-10 text-amber-300 animate-bounce" />
              </div>

              <div className="text-sm font-mono font-black text-amber-400 tracking-widest uppercase mb-3">
                Final Selection Moment
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-6">
                AND NOW... THE WINNER OF <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
                  SIH 2026 INTERNAL HACKATHON
                </span>
              </h1>

              <p className="text-base text-gray-400 font-mono mb-8">
                Press Space or Click to begin the Grand Champion countdown
              </p>

              <button
                onClick={advance}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-400/30 hover:scale-105 transition-all"
              >
                REVEAL #1 GRAND WINNER
              </button>
            </motion.div>
          )}

          {/* GRAND WINNER REVEAL (#1 FULLSCREEN FANFARE) */}
          {phase === 'WINNER_REVEAL' && top5Teams[0] && (
            <motion.div
              key="winner-reveal"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="w-full max-w-4xl text-center relative"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-400 text-gray-950 font-mono font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-400/40 mb-4 animate-pulse">
                <Crown className="w-4 h-4 text-gray-950" />
                <span>SIH 2026 GRAND CHAMPION • RANK #1</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 tracking-tight leading-none mb-3">
                {top5Teams[0].teamName}
              </h1>

              <p className="text-lg sm:text-xl font-bold text-gray-300 max-w-2xl mx-auto mb-4">
                "{top5Teams[0].projectName}"
              </p>

              <div className="flex items-center justify-center gap-4 text-sm font-mono text-gray-400 mb-8">
                <span>{top5Teams[0].teamNumber}</span>
                <span>•</span>
                <span>{top5Teams[0].sihId}</span>
                <span>•</span>
                <span className="text-amber-300 font-bold">Leader: {top5Teams[0].teamLeader}</span>
              </div>

              {/* Large Champion Score Banner */}
              <div className="inline-flex items-baseline gap-2 px-8 py-4 rounded-3xl bg-somaiya-700/60 border-2 border-amber-400/60 text-white shadow-2xl backdrop-blur-xl">
                <span className="text-xs font-mono uppercase font-bold text-amber-200">Champion Average:</span>
                <span className="font-mono text-5xl font-black text-amber-300">
                  {top5Teams[0].judgement.finalAverage?.toFixed(2)}
                </span>
                <span className="text-sm font-mono text-gray-300">/ 100</span>
              </div>

              <div className="mt-8">
                <button
                  onClick={advance}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider border border-white/20 transition-all"
                >
                  VIEW COMPLETE TOP 5 HALL OF FAME →
                </button>
              </div>
            </motion.div>
          )}

          {/* FINALE: ALL 5 REVEALED TOGETHER */}
          {phase === 'FINALE' && (
            <motion.div
              key="finale"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-6xl"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Official SIH 2026 Nominees Finalized</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">
                  K J Somaiya Internal Selection — Top 5 Teams
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  These 5 teams will advance to represent K J Somaiya Institute of Management at the national level.
                </p>
              </div>

              {/* Top 5 Hall of Fame Podium Display */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {top5Teams.map((team) => {
                  const isWinner = team.rank === 1;
                  return (
                    <div
                      key={team.id}
                      className={`rounded-3xl p-5 border backdrop-blur-md flex flex-col justify-between transition-all ${
                        isWinner
                          ? 'bg-gradient-to-b from-amber-400/20 to-somaiya-700/30 border-amber-400/60 shadow-xl shadow-amber-400/20 -translate-y-2'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`w-9 h-9 rounded-xl font-mono font-black text-base flex items-center justify-center ${
                              isWinner
                                ? 'bg-amber-400 text-gray-950'
                                : team.rank === 2
                                ? 'bg-slate-300 text-gray-950'
                                : team.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            #{team.rank}
                          </span>
                          <span className="font-mono text-[11px] text-gray-400">
                            {team.teamNumber}
                          </span>
                        </div>

                        <h3 className="font-black text-white text-base leading-snug line-clamp-2">
                          {team.teamName}
                        </h3>

                        <p className="text-[11px] text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                          {team.projectName}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/10">
                        <div className="text-[10px] text-gray-400 font-mono truncate">
                          Leader: {team.teamLeader}
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-[10px] font-mono text-gray-400 uppercase">Avg Score:</span>
                          <span className="font-mono font-black text-lg text-amber-300">
                            {team.judgement.finalAverage?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-somaiya-700 hover:bg-somaiya-800 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Return to Live Leaderboard View
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Presentation Footer */}
      <footer className="relative z-10 px-6 sm:px-10 py-3 flex items-center justify-between border-t border-white/10 bg-black/40 text-[11px] text-gray-400 font-mono">
        <div>K J Somaiya Institute of Management • SIH 2026 Live Leaderboard Engine</div>
        <div className="flex items-center gap-3">
          <span>Press Space or Right Arrow to advance</span>
          <span>•</span>
          <span>Press ESC to exit</span>
        </div>
      </footer>
    </div>
  );
};
