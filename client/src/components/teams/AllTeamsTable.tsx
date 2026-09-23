import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, ChevronRight, Award, Shield, Filter, ExternalLink } from 'lucide-react';
import { RankedTeam } from '../../types';
import { useLeaderboard } from '../../context/LeaderboardContext';

interface AllTeamsTableProps {
  teams: RankedTeam[];
}

export const AllTeamsTable: React.FC<AllTeamsTableProps> = ({ teams }) => {
  const { openTeamModal, recentlyUpdatedTeamId } = useLeaderboard();
  const [filter, setFilter] = useState<'all' | 'top5' | 'contenders' | 'all-others'>('all');

  const filteredTeams = useMemo(() => {
    switch (filter) {
      case 'top5':
        return teams.filter((t) => t.rank <= 5);
      case 'contenders':
        return teams.filter((t) => t.rank > 5 && t.rank <= 10);
      case 'all-others':
        return teams.filter((t) => t.rank > 5);
      case 'all':
      default:
        return teams;
    }
  }, [teams, filter]);

  const renderRankDeltaBadge = (team: RankedTeam) => {
    const delta = team.rankDelta ?? 0;
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
          <ArrowUp className="w-2.5 h-2.5 text-emerald-600" />
          <span>+{delta}</span>
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">
          <ArrowDown className="w-2.5 h-2.5 text-rose-600" />
          <span>{delta}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1 py-0.5 text-[9px] font-bold text-gray-300">
        <Minus className="w-2.5 h-2.5" />
      </span>
    );
  };

  return (
    <section className="my-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-somaiya-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            Full Roster Standings
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            ALL PARTICIPATING TEAMS
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time standings, differential telemetry, and individual score breakdowns.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            All Teams ({teams.length})
          </button>
          <button
            onClick={() => setFilter('top5')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'top5'
                ? 'bg-white text-somaiya-700 font-bold shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Top 5
          </button>
          <button
            onClick={() => setFilter('contenders')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'contenders'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Contenders (6-10)
          </button>
          <button
            onClick={() => setFilter('all-others')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all-others'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Ranks 6+
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW (hidden on mobile, shown md+) */}
      <div className="hidden md:block rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-4 w-20 text-center">Rank</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Project &amp; Statement</th>
                <th className="py-3.5 px-4 text-center">Gap to Ahead</th>
                <th className="py-3.5 px-4 text-center">Top 5 Gap</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTeams.map((team, idx) => {
                const isRecentlyChanged = recentlyUpdatedTeamId === team.id;
                const isTop5 = team.rank <= 5;
                const isEven = idx % 2 === 0;

                return (
                  <motion.tr
                    key={team.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      backgroundColor: isRecentlyChanged
                        ? 'rgba(254, 226, 226, 0.7)'
                        : isEven
                        ? 'rgba(255, 255, 255, 1)'
                        : 'rgba(249, 250, 251, 0.7)',
                    }}
                    transition={{ duration: 0.3 }}
                    onClick={() => openTeamModal(team)}
                    className="cursor-pointer hover:bg-somaiya-50/50 transition-colors group select-none"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span
                          className={`font-mono font-black text-sm ${
                            team.rank === 1
                              ? 'text-amber-600'
                              : isTop5
                              ? 'text-somaiya-700'
                              : 'text-gray-700'
                          }`}
                        >
                          #{team.rank}
                        </span>
                        <div className="mt-0.5">{renderRankDeltaBadge(team)}</div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-bold text-gray-950 group-hover:text-somaiya-700 transition-colors flex items-center gap-2">
                          <span>{team.teamName}</span>
                          <span className="font-mono text-xs text-somaiya-700 font-bold bg-somaiya-50 px-1.5 py-0.5 rounded border border-somaiya-100">
                            {team.teamNumber}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {team.department || 'KJ Somaiya Institute of Management'}
                        </div>
                      </div>
                    </td>

                    {/* Project Name */}
                    <td className="py-4 px-4 max-w-xs">
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {team.projectName}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                          {team.sihId} • {team.theme}
                        </div>
                      </div>
                    </td>

                    {/* Difference from Team Above */}
                    <td className="py-4 px-4 text-center font-mono text-xs">
                      {team.rank === 1 ? (
                        <span className="text-[11px] font-bold text-amber-600">— Lead</span>
                      ) : team.judgement.finalAverage !== null ? (
                        <span className="text-gray-600 font-medium">
                          +{team.scoreDiffAbove || 0} pts
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Difference from Top 5 */}
                    <td className="py-4 px-4 text-center font-mono text-xs">
                      {isTop5 ? (
                        <span className="text-emerald-700 font-bold text-[11px]">Qualified</span>
                      ) : team.judgement.finalAverage !== null ? (
                        <span className="text-somaiya-700 font-bold">
                          +{team.scoreDiffTop5 || 0} pts
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        {team.judgement.finalAverage !== null ? (
                          <>
                            <span className="font-mono font-black text-lg text-gray-900">
                              {team.judgement.finalAverage}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
                          </>
                        ) : (
                          <span className="text-xs font-mono text-gray-400">Not Scored</span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      {isTop5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-somaiya-100 text-somaiya-800 border border-somaiya-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-somaiya-700" />
                          Top 5
                        </span>
                      ) : team.rank <= 10 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Contender
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                          Participant
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTeamModal(team);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 group-hover:text-somaiya-700 px-2 py-1 rounded-md hover:bg-white transition-colors"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD VIEW (shown on screens < md) */}
      <div className="md:hidden space-y-3">
        {filteredTeams.map((team) => {
          const isRecentlyChanged = recentlyUpdatedTeamId === team.id;
          const isTop5 = team.rank <= 5;

          return (
            <motion.div
              key={team.id}
              layout
              onClick={() => openTeamModal(team)}
              className={`rounded-xl border p-4 transition-all bg-white select-none ${
                isRecentlyChanged
                  ? 'ring-2 ring-somaiya-600 bg-red-50/40'
                  : 'border-gray-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg font-mono font-black flex items-center justify-center text-sm shadow-xs ${
                      team.rank === 1
                        ? 'bg-amber-500 text-white'
                        : isTop5
                        ? 'bg-somaiya-700 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    #{team.rank}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-somaiya-700">
                      {team.teamNumber}
                    </div>
                    <div className="font-bold text-sm text-gray-950">
                      {team.teamName}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="font-mono font-black text-lg text-gray-900">
                    {team.judgement.finalAverage !== null ? (
                      <>
                        {team.judgement.finalAverage}
                        <span className="text-xs text-gray-400 font-normal"> / 100</span>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-gray-400 font-normal">Not Scored</span>
                    )}
                  </div>
                  {renderRankDeltaBadge(team)}
                </div>
              </div>

              <div className="text-xs text-gray-600 font-medium line-clamp-2 my-2">
                {team.projectName}
              </div>

              {/* Differential footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-500">
                <div>
                  {team.rank === 1 ? (
                    <span className="text-amber-600 font-bold">1st Place</span>
                  ) : (
                    <span>+{team.scoreDiffAbove || 0} pts to #{team.rank - 1}</span>
                  )}
                </div>

                <div>
                  {isTop5 ? (
                    <span className="text-somaiya-700 font-bold bg-somaiya-50 px-2 py-0.5 rounded">
                      Top 5
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      +{team.scoreDiffTop5 || 0} pts to Top 5
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
