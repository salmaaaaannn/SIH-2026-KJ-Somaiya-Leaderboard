import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Crown, Sparkles, Award } from 'lucide-react';
import { RankedTeam } from '../../types';

interface TopFiveShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: RankedTeam[];
}

export const TopFiveShowcaseModal: React.FC<TopFiveShowcaseModalProps> = ({
  isOpen,
  onClose,
  teams,
}) => {
  if (!isOpen) return null;

  const top5 = teams.slice(0, 5);
  const rank1 = top5[0];
  const rank2 = top5[1];
  const rank3 = top5[2];
  const rank4 = top5[3];
  const rank5 = top5[4];

  const renderCard = (team: RankedTeam | undefined, rankNum: number) => {
    if (!team) return null;
    const isRank1 = rankNum === 1;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: rankNum * 0.1, duration: 0.5, type: 'spring' }}
        className={`relative rounded-2xl p-5 border text-left flex flex-col justify-between shadow-2xl transition-all select-none ${
          isRank1
            ? 'bg-gradient-to-b from-white via-white to-red-50/50 border-amber-400 ring-2 ring-amber-400/40 col-span-2 sm:col-span-1 max-w-sm mx-auto w-full'
            : 'bg-white/95 border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl font-mono font-black flex items-center justify-center text-sm shadow-xs ${
                isRank1
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                  : 'bg-somaiya-700 text-white'
              }`}
            >
              #{rankNum}
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-somaiya-700">
                {team.sihId}
              </div>
              <div className="text-xs font-black text-gray-900 truncate max-w-[150px]">
                {team.teamName}
              </div>
            </div>
          </div>

          {isRank1 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
              <Crown className="w-3 h-3 text-amber-600" />
              Grand Winner
            </span>
          )}
        </div>

        <div className="my-2">
          <p className="text-xs font-semibold text-gray-700 line-clamp-2">
            {team.shortProjectName || team.projectName}
          </p>
          <div className="text-[10px] font-mono text-gray-400 mt-1">
            Lead: {team.teamLeader} • {team.theme}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 flex items-baseline justify-between font-mono">
          <span className="text-[10px] uppercase font-bold text-gray-400">Final Average</span>
          <div>
            <span className="text-2xl font-black text-somaiya-800">
              {team.judgement.finalAverage !== null ? team.judgement.finalAverage.toFixed(2) : 'Not Scored'}
            </span>
            {team.judgement.finalAverage !== null && <span className="text-xs text-gray-400 font-bold"> / 100</span>}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop Darken */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Showcase Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="relative max-w-5xl w-full bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-10 z-10 text-center overflow-hidden"
        >
          {/* Somaiya red light sweep */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-somaiya-700 via-amber-400 to-somaiya-700" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <img
              src="/assets/branding/kj-somaiya-logo.svg"
              alt="Somaiya"
              className="h-10 w-auto"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/branding/kj-somaiya-logo.png';
              }}
            />
            <span className="text-gray-300 text-lg font-light">×</span>
            <img
              src="/assets/branding/sih-logo.png"
              alt="SIH"
              className="h-10 w-auto"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/branding/sih-logo.webp';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-somaiya-50 text-somaiya-800 text-xs font-bold uppercase tracking-wider mb-2 border border-somaiya-200">
            <Trophy className="w-3.5 h-3.5 text-somaiya-700" />
            National Grand Finale Qualifiers
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            SIH 2026 TOP 5 TEAMS
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
            Congratulations to all 16 participating student groups of K J Somaiya Institute of Management!
          </p>

          {/* 3D Showcase Grid */}
          <div className="my-6 max-w-4xl mx-auto space-y-4">
            {/* Rank 1 */}
            <div className="max-w-md mx-auto">{renderCard(rank1, 1)}</div>

            {/* Rank 2 & 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>{renderCard(rank2, 2)}</div>
              <div>{renderCard(rank3, 3)}</div>
            </div>

            {/* Rank 4 & 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>{renderCard(rank4, 4)}</div>
              <div>{renderCard(rank5, 5)}</div>
            </div>
          </div>

          <div className="text-xs font-medium text-gray-400">
            Click outside or press ESC to return to presentation screen.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
