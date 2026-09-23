import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, Crown, Award, Lock, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { RankedTeam } from '../../types';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { Podium3DCanvas } from './Podium3DCanvas';

interface Top5PodiumCardsProps {
  teams: RankedTeam[];
  onOpenReveal?: () => void;
}

export const Top5PodiumCards: React.FC<Top5PodiumCardsProps> = ({ teams, onOpenReveal }) => {
  const { openTeamModal, recentlyUpdatedTeamId, leaderboard } = useLeaderboard();

  // Find Top 5 ranks
  const rank1 = teams.find((t) => t.rank === 1);
  const rank2 = teams.find((t) => t.rank === 2);
  const rank3 = teams.find((t) => t.rank === 3);
  const rank4 = teams.find((t) => t.rank === 4);
  const rank5 = teams.find((t) => t.rank === 5);

  const isRevealActive = leaderboard?.revealSession?.isActive;
  const finalizedCount = leaderboard?.stats?.finalizedCount || 0;
  const isAllFinalized = finalizedCount >= 5;

  const renderMovement = (team: RankedTeam) => {
    const delta = team.rankDelta ?? 0;
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowUp className="w-2.5 h-2.5 text-emerald-600" />
          +{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ArrowDown className="w-2.5 h-2.5 text-rose-600" />
          {delta}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1 text-[10px] font-bold text-gray-300">
        <Minus className="w-2.5 h-2.5" />
      </span>
    );
  };

  const renderCard = (team: RankedTeam | undefined, rankNum: number, position: 'hero' | 'tier2' | 'tier3') => {
    if (!team) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/40 p-3 flex flex-col items-center justify-center text-center text-gray-400 h-full">
          <span className="font-mono text-sm font-bold">#{rankNum}</span>
          <span className="text-[10px]">Awaiting Scores</span>
        </div>
      );
    }

    const isRank1 = rankNum === 1;
    const isUpdated = recentlyUpdatedTeamId === team.id;
    const hasFinalAverage = team.judgement.finalAverage !== null;
    const scoreVal = hasFinalAverage ? team.judgement.finalAverage : null;
    const progressPct = hasFinalAverage ? Math.min(100, Math.round(scoreVal!)) : 0;
    const roundsDone = [team.judgement.round1, team.judgement.round2, team.judgement.round3].filter(
      (r) => r !== null
    ).length;

    return (
      <motion.div
        layout
        layoutId={`podium-card-${team.id}`}
        onClick={() => openTeamModal(team)}
        className={`group relative cursor-pointer rounded-2xl bg-white transition-all duration-300 select-none text-left flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${
          isRank1
            ? 'p-4 sm:p-5 border-2 border-somaiya-300/80 ring-1 ring-somaiya-100 hover:-translate-y-1'
            : position === 'tier2'
            ? 'p-3.5 sm:p-4 border border-gray-200 hover:border-somaiya-200 hover:-translate-y-0.5'
            : 'p-3 sm:p-3.5 border border-gray-200 hover:border-somaiya-200 hover:-translate-y-0.5'
        } ${isUpdated ? 'ring-2 ring-somaiya-600 bg-red-50/30' : ''}`}
        style={{
          boxShadow: isRank1
            ? '0 12px 30px -8px rgba(160, 28, 36, 0.12), 0 4px 10px rgba(0, 0, 0, 0.03)'
            : '0 4px 14px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Somaiya Red Edge Lighting Accent Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isRank1
              ? 'bg-gradient-to-r from-somaiya-800 via-somaiya-600 to-somaiya-800'
              : 'bg-gradient-to-r from-somaiya-700/80 to-somaiya-900/80'
          }`}
        />

        {/* Card Header: Rank, SIH ID, Team, Movement */}
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {/* Rank Badge */}
              <div
                className={`font-mono font-black flex items-center justify-center shrink-0 rounded-lg shadow-2xs ${
                  isRank1
                    ? 'w-8 h-8 text-sm bg-somaiya-700 text-white'
                    : 'w-7 h-7 text-xs bg-gray-900 text-white'
                }`}
              >
                #{rankNum.toString().padStart(2, '0')}
              </div>

              <div className="truncate">
                <span className="text-[10px] font-mono font-bold text-somaiya-700 uppercase tracking-wide">
                  {team.sihId}
                </span>
                <span className="text-gray-300 text-[10px] mx-1">•</span>
                <span className="text-[10px] font-mono text-gray-500">
                  {team.theme}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {renderMovement(team)}
            </div>
          </div>

          {/* Team Name */}
          <h3
            className={`font-black text-gray-950 truncate group-hover:text-somaiya-700 transition-colors ${
              isRank1 ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
            }`}
          >
            {team.teamName}
          </h3>

          {/* Clean Short Project Name */}
          <p className="text-xs text-gray-600 line-clamp-1 font-medium mt-0.5">
            {team.shortProjectName || team.projectName}
          </p>

          {/* 3-Round Status Indicator */}
          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-gray-500">
            <span className={`px-1.5 py-0.5 rounded ${team.judgement.round1 !== null ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              R1: {team.judgement.round1 !== null ? team.judgement.round1 : '—'}
            </span>
            <span className={`px-1.5 py-0.5 rounded ${team.judgement.round2 !== null ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              R2: {team.judgement.round2 !== null ? team.judgement.round2 : '—'}
            </span>
            <span className={`px-1.5 py-0.5 rounded ${team.judgement.round3 !== null ? 'bg-purple-50 text-purple-700 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              R3: {team.judgement.round3 !== null ? team.judgement.round3 : '—'}
            </span>
            {team.judgement.isFinalized && (
              <span className="ml-auto inline-flex items-center gap-0.5 text-emerald-700 font-bold text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                Locked
              </span>
            )}
          </div>
        </div>

        {/* Score & Progress Bar */}
        <div className="mt-2.5 pt-2 border-t border-gray-100/90">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-mono font-semibold text-gray-400">
              Leader: {team.teamLeader}
            </span>

            <div className="flex items-baseline gap-1 font-mono">
              {hasFinalAverage ? (
                <>
                  <motion.span
                    key={scoreVal}
                    initial={{ scale: 1.25, color: '#A01C24' }}
                    animate={{ scale: 1, color: isRank1 ? '#80141B' : '#111827' }}
                    transition={{ duration: 0.35 }}
                    className={`font-black ${isRank1 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}
                  >
                    {scoreVal?.toFixed(2)}
                  </motion.span>
                  <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
                </>
              ) : (
                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  Not Scored
                </span>
              )}
            </div>
          </div>

          {/* Slim progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mt-1 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isRank1
                  ? 'bg-gradient-to-r from-somaiya-800 via-somaiya-600 to-somaiya-700'
                  : 'bg-somaiya-700'
              }`}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between relative rounded-2xl bg-gradient-to-b from-white/90 via-gray-50/50 to-white/90 border border-gray-200/90 shadow-sm p-3.5 sm:p-4 select-none overflow-hidden">
      {/* 3D Three.js Ambient Stage Background */}
      <Podium3DCanvas top5Count={5} />

      {/* Top Header Label & Suspense Status */}
      <div className="flex items-center justify-between pb-1 z-10">
        <div>
          <div className="flex items-center gap-1.5 text-somaiya-700 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Top 5 Qualifiers
          </div>
          <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
            LIVE TOP 5 LEADERBOARD
          </h2>
        </div>

        {/* Suspense / Judging progress pill */}
        <div className="flex items-center gap-2">
          {onOpenReveal && (
            <button
              onClick={onOpenReveal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-somaiya-50 hover:bg-somaiya-100 text-somaiya-800 border border-somaiya-200 text-[11px] font-bold transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-somaiya-700" />
              <span>Ceremony Reveal</span>
            </button>
          )}

          <div className="text-[10px] font-mono text-gray-400 hidden sm:flex items-center gap-1">
            <Clock className="w-3 h-3 text-somaiya-700" />
            <span>3-Round Live Scoring</span>
          </div>
        </div>
      </div>

      {/* Podium Cards Grid:
                 #1
             TEAM NAME
              SCORE
       #2                  #3
    TEAM NAME           TEAM NAME
      SCORE               SCORE
          #4          #5
       TEAM NAME    TEAM NAME
         SCORE        SCORE
      */}
      <div className="flex-1 flex flex-col justify-center gap-2.5 z-10 py-1">
        {/* TIER 1: Center #1 Card */}
        <div className="max-w-md mx-auto w-full">
          {renderCard(rank1, 1, 'hero')}
        </div>

        {/* TIER 2: Flanking #2 & #3 Cards */}
        <div className="grid grid-cols-2 gap-2.5 max-w-2xl mx-auto w-full">
          <div>{renderCard(rank2, 2, 'tier2')}</div>
          <div>{renderCard(rank3, 3, 'tier2')}</div>
        </div>

        {/* TIER 3: Base #4 & #5 Cards */}
        <div className="grid grid-cols-2 gap-2.5 max-w-2xl mx-auto w-full">
          <div>{renderCard(rank4, 4, 'tier3')}</div>
          <div>{renderCard(rank5, 5, 'tier3')}</div>
        </div>
      </div>
    </div>
  );
};
