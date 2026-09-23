import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { useLeaderboard } from '../../context/LeaderboardContext';

export const BottomStatusBar: React.FC = () => {
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

  const eventStatus = leaderboard?.eventStatus || 'LIVE';
  const lastUpdated = leaderboard?.lastUpdated
    ? new Date(leaderboard.lastUpdated).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'LIVE';

  return (
    <footer className="h-9 px-4 sm:px-6 bg-white border-t border-gray-200/90 flex items-center justify-between text-[11px] font-mono select-none shrink-0 z-20">
      {/* Telemetry Chips */}
      <div className="flex items-center gap-2 sm:gap-4 text-gray-600 truncate">
        <span className="font-bold text-gray-900 tracking-wide">
          {stats.totalTeams} TEAMS
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-700">
          <strong className="text-somaiya-700">{stats.finalizedCount}</strong> FINALIZED
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-700">
          HIGHEST <strong className="text-gray-950">{stats.highestAverage > 0 ? stats.highestAverage : '—'}</strong> / 100
        </span>
        <span className="text-gray-300 hidden md:inline">|</span>
        <span className="text-gray-700 hidden md:inline">
          COHORT AVG <strong className="text-gray-950">{stats.cohortAverage > 0 ? stats.cohortAverage : '—'}</strong>
        </span>
      </div>

      {/* Live Status & Clock */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-somaiya-700"></span>
          </span>
          <span className="font-bold text-somaiya-700 tracking-wider text-[10px]">
            {eventStatus}
          </span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-1 text-gray-500 text-[10px]">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{lastUpdated}</span>
        </div>
      </div>
    </footer>
  );
};
