import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUp, ArrowDown, Minus, Clock, Target, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { RankedTeam } from '../../types';
import { useLeaderboard } from '../../context/LeaderboardContext';

interface InformationControlPanelProps {
  teams: RankedTeam[];
}

export const InformationControlPanel: React.FC<InformationControlPanelProps> = ({ teams }) => {
  const { openTeamModal, recentlyUpdatedTeamId, leaderboard } = useLeaderboard();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Ranks #6 through #16 (all remaining 11 teams)
  const remainingTeams = useMemo(() => {
    return teams.filter((t) => t.rank > 5);
  }, [teams]);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return teams
      .filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          t.teamNumber.toLowerCase().includes(q) ||
          t.sihId.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q) ||
          t.teamLeader.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [teams, searchQuery]);

  const activeFoundTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return teams.find((t) => t.id === selectedTeamId) || null;
  }, [teams, selectedTeamId]);

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
    : 'Live';

  const renderMovement = (team: RankedTeam) => {
    const delta = team.rankDelta ?? 0;
    if (delta > 0) {
      return (
        <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <ArrowUp className="w-3 h-3 mr-0.5" />+{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <ArrowDown className="w-3 h-3 mr-0.5" />{delta}
        </span>
      );
    }
    return (
      <span className="text-xs font-bold text-gray-300 px-1">
        <Minus className="w-3 h-3 inline" />
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between gap-2 bg-white/95 rounded-2xl border border-gray-200/90 shadow-sm p-3.5 sm:p-4 select-none overflow-hidden">
      {/* SECTION 1: EVENT STATUS HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-somaiya-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-somaiya-700"></span>
          </span>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-somaiya-700">
              {eventStatus === 'LIVE' ? 'LIVE JUDGING' : eventStatus}
            </div>
            <div className="text-xs font-black text-gray-900 leading-tight">
              Evaluation &amp; Standings
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-[10px] text-gray-400">
          <div className="flex items-center gap-1 justify-end">
            <Clock className="w-2.5 h-2.5" />
            <span>{lastUpdated}</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-semibold">● Realtime Sync</span>
        </div>
      </div>

      {/* SECTION 2: LIVE STATISTICS (4 Compact Badges) */}
      <div className="grid grid-cols-4 gap-2 py-1 shrink-0">
        <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">Teams</div>
          <div className="text-base font-black font-mono text-gray-950 mt-0.5">{stats.totalTeams}</div>
        </div>

        <div className="bg-somaiya-50/60 rounded-xl p-2 text-center border border-somaiya-100">
          <div className="text-[10px] font-mono text-somaiya-800 uppercase tracking-tight">Finalized</div>
          <div className="text-base font-black font-mono text-somaiya-700 mt-0.5">
            {stats.finalizedCount}
          </div>
        </div>

        <div className="bg-amber-50/60 rounded-xl p-2 text-center border border-amber-100">
          <div className="text-[10px] font-mono text-amber-800 uppercase tracking-tight">Highest</div>
          <div className="text-base font-black font-mono text-amber-700 mt-0.5">
            {stats.highestAverage > 0 ? stats.highestAverage : '—'}
          </div>
        </div>

        <div className="bg-blue-50/60 rounded-xl p-2 text-center border border-blue-100">
          <div className="text-[10px] font-mono text-blue-800 uppercase tracking-tight">Average</div>
          <div className="text-base font-black font-mono text-blue-700 mt-0.5">
            {stats.cohortAverage > 0 ? stats.cohortAverage : '—'}
          </div>
        </div>
      </div>

      {/* SECTION 3: CURRENT RANKINGS (Ranks #06 through #16 - Stretched to fill vertical space with bigger text) */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-b border-gray-100 py-1.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-500 uppercase tracking-wider mb-1 px-1 shrink-0">
          <span>Standings #06 – #16</span>
          <span>Final Avg / 100</span>
        </div>

        {/* 11 Teams List - Evenly distributed to fill empty space */}
        <div className="flex-1 flex flex-col justify-between gap-1 overflow-hidden">
          {remainingTeams.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No remaining teams
            </div>
          ) : (
            remainingTeams.map((team) => {
              const isUpdated = recentlyUpdatedTeamId === team.id;
              const hasScore = team.judgement.finalAverage !== null;
              const isFinalized = team.judgement.isFinalized;

              return (
                <div
                  key={team.id}
                  onClick={() => openTeamModal(team)}
                  className={`group cursor-pointer flex-1 min-h-[36px] px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-all ${
                    isUpdated
                      ? 'bg-red-50 border-2 border-somaiya-400 ring-1 ring-somaiya-400 shadow-xs'
                      : 'bg-gray-50/80 hover:bg-somaiya-50/60 border border-gray-200/60 hover:border-somaiya-200 shadow-2xs'
                  }`}
                >
                  {/* Left: Rank Badge + Team Name + Leader / SIH ID */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Rank Badge */}
                    <span className="w-7 h-7 sm:w-8 sm:h-7.5 rounded-lg bg-white border border-gray-200/90 font-mono font-black text-xs sm:text-sm text-gray-800 group-hover:text-somaiya-700 group-hover:border-somaiya-300 flex items-center justify-center shrink-0 shadow-2xs">
                      #{team.rank.toString().padStart(2, '0')}
                    </span>

                    <div className="truncate">
                      {/* Team Name - Bigger, bolder font */}
                      <div className="text-xs sm:text-sm font-black text-gray-950 truncate group-hover:text-somaiya-700 transition-colors leading-tight">
                        {team.teamName}
                      </div>

                      {/* Leader & SIH ID subtitle */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 truncate mt-0.5">
                        <span className="font-semibold text-gray-600 truncate">
                          {team.teamLeader}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-somaiya-700 font-bold">
                          {team.sihId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Movement + Score / Locked status */}
                  <div className="flex items-center gap-2.5 font-mono shrink-0 ml-1">
                    {renderMovement(team)}

                    <div className="text-right">
                      {hasScore ? (
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-sm sm:text-base text-gray-950 group-hover:text-somaiya-800 transition-colors">
                            {team.judgement.finalAverage}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold hidden sm:inline">
                            / 100
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                          Not Scored
                        </span>
                      )}
                    </div>

                    {isFinalized && (
                      <span title="Finalized">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 4: FIND YOUR TEAM SEARCH BAR */}
      <div className="pt-1 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-somaiya-700 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Find Your Team
          </span>
          {activeFoundTeam && (
            <button
              onClick={() => {
                setSelectedTeamId(null);
                setSearchQuery('');
              }}
              className="text-[10px] text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type team name, leader, or SIH ID..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 focus:bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-somaiya-600 font-medium placeholder:text-gray-400 shadow-2xs"
          />

          {/* Autocomplete Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-30 divide-y divide-gray-100">
              {searchResults.length === 0 ? (
                <div className="p-2 text-[11px] text-gray-400 text-center">
                  No matching team found
                </div>
              ) : (
                searchResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTeamId(t.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-somaiya-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 text-xs block">{t.teamName}</span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {t.teamLeader} • {t.sihId}
                      </span>
                    </div>
                    <span className="font-mono font-black text-xs text-somaiya-700">#{t.rank}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Team Instant Preview Card */}
        {activeFoundTeam && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => openTeamModal(activeFoundTeam)}
            className="mt-1.5 p-2 rounded-xl bg-somaiya-50/80 border border-somaiya-300 cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] font-mono font-bold text-somaiya-800 uppercase">
                {activeFoundTeam.teamName} ({activeFoundTeam.sihId})
              </div>
              <div className="text-[11px] text-gray-600 mt-0.5">
                Leader: <strong>{activeFoundTeam.teamLeader}</strong>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-base font-black text-somaiya-800">
                #{activeFoundTeam.rank.toString().padStart(2, '0')}
              </span>
              <div className="text-[10px] text-gray-500">
                {activeFoundTeam.judgement.finalAverage !== null ? `${activeFoundTeam.judgement.finalAverage} avg` : 'Not Scored'}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
