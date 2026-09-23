import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, ArrowDown, ChevronRight, X } from 'lucide-react';
import { useLeaderboard } from '../../context/LeaderboardContext';

export const LiveScoreToast: React.FC = () => {
  const { notification, openTeamModal, leaderboard } = useLeaderboard();

  if (!notification) return null;

  const scoreDiff = notification.newScore - notification.oldScore;
  const isRankImproved = notification.rank < notification.previousRank;
  const team = leaderboard?.teams.find((t) => t.id === notification.teamId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full select-none"
      >
        <div
          onClick={() => team && openTeamModal(team)}
          className="cursor-pointer rounded-2xl bg-white border-2 border-somaiya-600 shadow-2xl p-4 flex items-center justify-between gap-3 overflow-hidden relative group hover:border-somaiya-700 transition-colors"
        >
          {/* Glowing pulse indicator */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-somaiya-700" />

          <div className="flex items-center gap-3 pl-1">
            <div className="w-10 h-10 rounded-xl bg-somaiya-50 text-somaiya-700 flex items-center justify-center shrink-0 border border-somaiya-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-somaiya-100 text-somaiya-800">
                  LIVE UPDATE
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  Rank #{notification.rank}
                </span>
              </div>

              <div className="text-sm font-bold text-gray-950 truncate max-w-[190px] mt-0.5">
                {notification.teamName}
              </div>

              <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                <span>
                  {notification.oldScore} →{' '}
                  <strong className="text-gray-900">{notification.newScore} pts</strong>
                </span>
                {scoreDiff !== 0 && (
                  <span
                    className={`font-bold ${
                      scoreDiff > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    ({scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400 group-hover:text-somaiya-700 group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
