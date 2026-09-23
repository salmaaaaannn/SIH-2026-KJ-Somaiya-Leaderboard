import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { useLeaderboard } from '../../context/LeaderboardContext';

export const HeroSection: React.FC = () => {
  const { leaderboard } = useLeaderboard();

  const stats = leaderboard?.stats || {
    totalTeams: 16,
    r1Count: 0,
    r2Count: 0,
    r3Count: 0,
    finalizedCount: 0,
    highestAverage: 0,
    cohortAverage: 0,
    top5Cutoff: 0,
  };

  const lastUpdated = leaderboard?.lastUpdated
    ? new Date(leaderboard.lastUpdated).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Live';

  return (
    <div className="relative pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Header Block */}
      <div className="text-center max-w-3xl mx-auto">
        {/* Pulsating Live Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-somaiya-50 border border-somaiya-200/80 shadow-xs mb-4"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-somaiya-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-somaiya-700"></span>
          </span>
          <span className="text-xs font-bold text-somaiya-800 tracking-wider uppercase">
            LIVE LEADERBOARD
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-600" />
            Scores update live
          </span>
        </motion.div>

        {/* Large SIH 2026 Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight"
        >
          SIH <span className="text-somaiya-700">2026</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg sm:text-xl font-bold text-gray-800 mt-2 tracking-tight"
        >
          K J Somaiya Institute of Management — Internal Hackathon
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl mx-auto"
        >
          Evaluating top engineering &amp; management student innovations to represent Somaiya Vidyavihar University at the National Smart India Hackathon 2026.
        </motion.p>
      </div>

      {/* Live Statistics Ribbon */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto"
      >
        {/* Total Teams */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Teams
            </div>
            <div className="text-lg font-black text-gray-900 font-mono">
              {stats.totalTeams}
            </div>
          </div>
        </div>

        {/* Teams Scored */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Finalized
            </div>
            <div className="text-lg font-black text-gray-900 font-mono">
              {stats.finalizedCount} / {stats.totalTeams}
            </div>
          </div>
        </div>

        {/* Top 5 Cutoff */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-somaiya-100 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-somaiya-50 text-somaiya-700 flex items-center justify-center shrink-0 border border-somaiya-200">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-somaiya-900 uppercase tracking-wider">
              Top 5 Cutoff
            </div>
            <div className="text-lg font-black text-somaiya-700 font-mono">
              {stats.top5Cutoff > 0 ? stats.top5Cutoff : '—'} <span className="text-xs font-normal text-gray-500">pts</span>
            </div>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-amber-100 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
              Leading Score
            </div>
            <div className="text-lg font-black text-gray-900 font-mono">
              {stats.highestAverage > 0 ? stats.highestAverage : '—'} <span className="text-xs font-normal text-gray-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="col-span-2 md:col-span-1 bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Cohort Avg
            </div>
            <div className="text-lg font-black text-gray-900 font-mono">
              {stats.cohortAverage > 0 ? stats.cohortAverage : '—'} <span className="text-xs font-normal text-gray-500">pts</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sync Status Timestamp */}
      <div className="mt-3 text-center text-[11px] text-gray-500 font-mono">
        Telemetry Synced: <span className="font-semibold text-gray-700">{lastUpdated}</span>
      </div>
    </div>
  );
};
