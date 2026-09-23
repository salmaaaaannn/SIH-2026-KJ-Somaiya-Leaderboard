import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Target, Sparkles, ChevronRight, X, AlertCircle } from 'lucide-react';
import { RankedTeam } from '../../types';
import { useLeaderboard } from '../../context/LeaderboardContext';

interface FindMyTeamProps {
  teams: RankedTeam[];
}

export const FindMyTeam: React.FC<FindMyTeamProps> = ({ teams }) => {
  const { openTeamModal } = useLeaderboard();
  const [query, setQuery] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Search filter
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return teams.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.teamNumber.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [teams, query]);

  // Keep selected team dynamically up to date with live ranking changes
  const activeTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return teams.find((t) => t.id === selectedTeamId) || null;
  }, [teams, selectedTeamId]);

  const handleSelect = (team: RankedTeam) => {
    setSelectedTeamId(team.id);
    setQuery('');
  };

  const handleClear = () => {
    setSelectedTeamId(null);
    setQuery('');
  };

  return (
    <div className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Search Input Card */}
      <div className="relative rounded-2xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-somaiya-700 text-xs font-bold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              Participant Position Tracker
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-950">
              Find Your Team
            </h3>
            <p className="text-xs text-gray-500">
              Instant lookup by Team Name, ID, or Problem Statement to see your real-time standing &amp; point gaps.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team or project..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-xl border border-gray-200 focus:border-somaiya-600 focus:ring-2 focus:ring-somaiya-100 outline-none transition-all placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown Suggestions */}
            {query.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-30">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-gray-500 text-center">
                    No teams matching "{query}"
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelect(t)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-somaiya-50/60 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <span className="font-mono text-somaiya-700">{t.teamNumber}</span>
                            <span>•</span>
                            <span>{t.teamName}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {t.projectName}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-black text-gray-900">
                            #{t.rank}
                          </span>
                          <div className="text-[10px] text-gray-400">
                            {t.judgement.finalAverage !== null ? `${t.judgement.finalAverage} avg` : 'Not Scored'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Team Prominent Showcase: "YOUR CURRENT POSITION" */}
        <AnimatePresence>
          {activeTeam && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="rounded-xl bg-gradient-to-r from-somaiya-50 via-white to-somaiya-50/50 border-2 border-somaiya-300 p-4 sm:p-5 relative overflow-hidden shadow-xs">
                {/* Close Button */}
                <button
                  onClick={handleClear}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1 rounded-md"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Rank & Team Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-somaiya-700 text-white shadow-glow-red shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Rank</span>
                      <span className="text-2xl font-black font-mono">#{activeTeam.rank}</span>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-somaiya-100 text-somaiya-800 text-[10px] font-mono font-bold tracking-wider mb-1">
                        YOUR CURRENT POSITION
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-gray-950">
                        {activeTeam.teamName}{' '}
                        <span className="text-xs font-mono font-semibold text-gray-400">
                          ({activeTeam.teamNumber})
                        </span>
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-1 max-w-lg">
                        {activeTeam.projectName}
                      </p>
                    </div>
                  </div>

                  {/* Middle / Right: Points & Gap Telemetry */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-white/80 backdrop-blur-xs px-4 py-3 rounded-xl border border-gray-200">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Current Score
                      </div>
                      <div className="text-xl font-black font-mono text-gray-900">
                        {activeTeam.judgement.finalAverage !== null ? (
                          <>
                            {activeTeam.judgement.finalAverage}{' '}
                            <span className="text-xs font-medium text-gray-400">/ 100</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 font-normal">Not Scored</span>
                        )}
                      </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                    {/* Gap from team above */}
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        To Next Rank
                      </div>
                      {activeTeam.rank === 1 ? (
                        <div className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Leading the Event
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-somaiya-700">
                          {activeTeam.scoreDiffAbove || 1} pts away from Rank #{activeTeam.rank - 1}
                        </div>
                      )}
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                    {/* Top 5 Status */}
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Top 5 Qualification
                      </div>
                      {activeTeam.rank <= 5 ? (
                        <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Qualified in Top 5!
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-amber-700">
                          {activeTeam.scoreDiffTop5 || 0} pts behind Rank #5 Cutoff
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => openTeamModal(activeTeam)}
                      className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-somaiya-700 text-white text-xs font-semibold transition-colors"
                    >
                      <span>Full Scorecard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
