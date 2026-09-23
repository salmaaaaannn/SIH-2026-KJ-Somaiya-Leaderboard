import React, { useState } from 'react';
import { Clock, Shield, Filter, Search, ArrowRight, UserCheck } from 'lucide-react';
import { RankedTeam } from '../../types';

interface ScoreHistoryLogProps {
  teams: RankedTeam[];
}

export const ScoreHistoryLog: React.FC<ScoreHistoryLogProps> = ({ teams }) => {
  const [filterTeamId, setFilterTeamId] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Flatten all history items
  const allHistory = teams.flatMap((team) => {
    return (team.history || []).map((h) => ({
      ...h,
      teamNumber: team.teamNumber,
      teamName: team.teamName,
      projectName: team.projectName,
    }));
  });

  // Sort descending by timestamp
  allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredHistory = allHistory.filter((item) => {
    if (filterTeamId !== 'all' && item.teamId !== filterTeamId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.teamName.toLowerCase().includes(q) ||
        item.teamNumber.toLowerCase().includes(q) ||
        item.updatedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h3 className="text-xs font-bold text-somaiya-700 uppercase tracking-wider">
            Transparency &amp; Governance
          </h3>
          <h4 className="text-xl font-extrabold text-gray-950">
            Jury Evaluation Audit Trail ({allHistory.length} events)
          </h4>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterTeamId}
            onChange={(e) => setFilterTeamId(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600 font-medium"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.teamNumber} - {t.teamName}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evaluator or team..."
            className="px-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="mt-6 space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No audit logs found matching current filter.
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-somaiya-100 text-somaiya-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-somaiya-700">
                      {item.teamNumber}
                    </span>
                    <span className="font-bold text-gray-900">{item.teamName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-600 mt-1">
                    {item.changeNote || 'Score recorded'}
                  </div>

                  {item.roundNumber && (
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-mono text-gray-500">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold">Round {item.roundNumber} Evaluation</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Score Delta & Evaluator */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                <div className="flex items-center gap-1.5 font-mono font-black text-sm">
                  <span className="text-gray-400">{item.previousScore}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-somaiya-700 text-base">{item.newScore} pts</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span>{item.updatedBy}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
