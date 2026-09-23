import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Sparkles,
  Clock,
  Search,
  Check,
  FileSpreadsheet,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { RankedTeam } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

interface JudgeScorecardProps {
  teams: RankedTeam[];
  onScoreUpdated?: () => void;
}

interface RowState {
  r1: string;
  r2: string;
  r3: string;
  isDirty: boolean;
  justSaved?: boolean;
}

export const JudgeScorecard: React.FC<JudgeScorecardProps> = ({ teams, onScoreUpdated }) => {
  const { token, user } = useAuth();
  const {
    leaderboard,
    saveTeamScores,
    saveBulkScores,
    finalizeTeamScore,
    refreshLeaderboard,
  } = useLeaderboard();

  const roundConfig = leaderboard?.roundConfig || {
    round1Max: 100,
    round2Max: 100,
    round3Max: 100,
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'SCORED' | 'UNSCORED' | 'READY' | 'FINALIZED'>('ALL');
  const [judgeName, setJudgeName] = useState<string>(user?.name || 'Chief Jury Panel');

  // Per-team row input state: teamId -> RowState
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  // Loading states
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState<boolean>(false);
  const [finalizingTeamId, setFinalizingTeamId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Finalize confirmation modal
  const [confirmTeam, setConfirmTeam] = useState<RankedTeam | null>(null);

  // Initialize and synchronize row states when teams data arrives or updates
  useEffect(() => {
    setRowStates((prev) => {
      const next: Record<string, RowState> = { ...prev };
      teams.forEach((t) => {
        // If row is not currently modified (not dirty), sync with latest server state
        if (!prev[t.id] || !prev[t.id].isDirty) {
          next[t.id] = {
            r1: t.judgement.round1 !== null ? String(t.judgement.round1) : '',
            r2: t.judgement.round2 !== null ? String(t.judgement.round2) : '',
            r3: t.judgement.round3 !== null ? String(t.judgement.round3) : '',
            isDirty: false,
            justSaved: prev[t.id]?.justSaved || false,
          };
        }
      });
      return next;
    });
  }, [teams]);

  // Handle cell input change
  const handleCellChange = (teamId: string, round: 'r1' | 'r2' | 'r3', value: string) => {
    setRowStates((prev) => {
      const current = prev[teamId] || { r1: '', r2: '', r3: '', isDirty: false };
      return {
        ...prev,
        [teamId]: {
          ...current,
          [round]: value,
          isDirty: true,
          justSaved: false,
        },
      };
    });
  };

  // Helper to parse input values
  const parseScore = (val: string, max: number): number | null => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return Math.max(0, Math.min(max, Number(num.toFixed(2))));
  };

  // Calculate row live average
  const getRowLiveAverage = (teamId: string) => {
    const row = rowStates[teamId];
    if (!row) return null;
    const r1 = row.r1 !== '' && !isNaN(Number(row.r1)) ? Number(row.r1) : null;
    const r2 = row.r2 !== '' && !isNaN(Number(row.r2)) ? Number(row.r2) : null;
    const r3 = row.r3 !== '' && !isNaN(Number(row.r3)) ? Number(row.r3) : null;

    if (r1 !== null && r2 !== null && r3 !== null) {
      return Number(((r1 + r2 + r3) / 3).toFixed(2));
    }
    return null;
  };

  // Count dirty rows
  const dirtyTeamIds = useMemo(() => {
    return Object.keys(rowStates).filter((id) => rowStates[id]?.isDirty);
  }, [rowStates]);

  // Save single team scores
  const handleSaveTeam = async (team: RankedTeam) => {
    const row = rowStates[team.id];
    if (!row) return;

    const r1 = parseScore(row.r1, roundConfig.round1Max);
    const r2 = parseScore(row.r2, roundConfig.round2Max);
    const r3 = parseScore(row.r3, roundConfig.round3Max);

    setSavingTeamId(team.id);
    setNotification(null);

    const success = await saveTeamScores(
      team.id,
      {
        round1: r1,
        round2: r2,
        round3: r3,
      },
      token || undefined
    );

    setSavingTeamId(null);

    if (success) {
      setRowStates((prev) => ({
        ...prev,
        [team.id]: {
          ...prev[team.id],
          isDirty: false,
          justSaved: true,
        },
      }));
      setNotification({
        type: 'success',
        message: `✓ Scores saved for ${team.teamName} (${team.teamNumber})`,
      });

      // Clear justSaved flag after 3 seconds
      setTimeout(() => {
        setRowStates((prev) => {
          if (!prev[team.id]) return prev;
          return {
            ...prev,
            [team.id]: {
              ...prev[team.id],
              justSaved: false,
            },
          };
        });
      }, 3000);

      await refreshLeaderboard();
      if (onScoreUpdated) onScoreUpdated();
    } else {
      setNotification({
        type: 'error',
        message: `Failed to save scores for ${team.teamName}. Please try again.`,
      });
    }
  };

  // Save all modified rows at once
  const handleSaveAllDirty = async () => {
    if (dirtyTeamIds.length === 0) return;

    setIsBulkSaving(true);
    setNotification(null);

    const updates = dirtyTeamIds.map((teamId) => {
      const row = rowStates[teamId];
      return {
        teamId,
        round1: parseScore(row.r1, roundConfig.round1Max),
        round2: parseScore(row.r2, roundConfig.round2Max),
        round3: parseScore(row.r3, roundConfig.round3Max),
      };
    });

    const success = await saveBulkScores(updates, token || undefined);
    setIsBulkSaving(false);

    if (success) {
      setRowStates((prev) => {
        const next = { ...prev };
        dirtyTeamIds.forEach((id) => {
          if (next[id]) {
            next[id] = { ...next[id], isDirty: false, justSaved: true };
          }
        });
        return next;
      });

      setNotification({
        type: 'success',
        message: `✓ Successfully saved scores for all ${dirtyTeamIds.length} modified teams!`,
      });

      setTimeout(() => {
        setRowStates((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((id) => {
            if (next[id]) next[id] = { ...next[id], justSaved: false };
          });
          return next;
        });
      }, 3000);

      await refreshLeaderboard();
      if (onScoreUpdated) onScoreUpdated();
    } else {
      setNotification({
        type: 'error',
        message: 'Failed to bulk save scores. Please verify authorization.',
      });
    }
  };

  // Finalize team result
  const handleFinalizeTeam = async () => {
    if (!confirmTeam) return;

    setFinalizingTeamId(confirmTeam.id);
    const success = await finalizeTeamScore(confirmTeam.id, token || undefined);
    setFinalizingTeamId(null);
    setConfirmTeam(null);

    if (success) {
      setNotification({
        type: 'success',
        message: `✓ FINAL RESULT LOCKED: ${confirmTeam.teamName} verified for official leaderboard ranking!`,
      });
      await refreshLeaderboard();
      if (onScoreUpdated) onScoreUpdated();
    } else {
      setNotification({
        type: 'error',
        message: 'Failed to lock final result. Please verify all 3 rounds are saved.',
      });
    }
  };

  // Filtered and searched list of teams
  const filteredTeams = useMemo(() => {
    let list = [...teams];

    // Status filter
    if (filterMode === 'SCORED') {
      list = list.filter((t) => t.judgement.finalAverage !== null && t.judgement.finalAverage > 0);
    } else if (filterMode === 'UNSCORED') {
      list = list.filter((t) => t.judgement.finalAverage === null || t.judgement.finalAverage === 0);
    } else if (filterMode === 'READY') {
      list = list.filter((t) => t.judgement.status === 'READY' || (t.judgement.round1 !== null && t.judgement.round2 !== null && t.judgement.round3 !== null && !t.judgement.isFinalized));
    } else if (filterMode === 'FINALIZED') {
      list = list.filter((t) => t.judgement.isFinalized);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          t.teamNumber.toLowerCase().includes(q) ||
          `group ${t.groupNumber}`.toLowerCase().includes(q) ||
          `g${t.groupNumber}`.toLowerCase().includes(q) ||
          t.sihId.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q) ||
          t.teamLeader.toLowerCase().includes(q)
      );
    }

    return list;
  }, [teams, filterMode, searchQuery]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
      {/* Top Banner: Excel Spreadsheet Judging Form Controls */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-somaiya-100 text-somaiya-800">
                <FileSpreadsheet className="w-5 h-5 text-somaiya-700" />
              </span>
              <h2 className="text-xl font-black text-gray-950 tracking-tight">
                Excel Judging Sheet — 3-Round Evaluation
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter numeric marks for <strong>Round 1, Round 2, Round 3</strong>. The system automatically computes the average.
            </p>
          </div>

          {/* Quick Stats & Jury Identity */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs text-xs">
              <span className="font-bold text-gray-600">Jury Name:</span>
              <input
                type="text"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
                placeholder="Judge / Jury Panel"
                className="font-medium text-gray-900 focus:outline-none border-b border-dashed border-gray-300 focus:border-somaiya-600 px-1 py-0.5 text-xs"
              />
            </div>

            {/* Unsaved changes badge & Bulk Save button */}
            {dirtyTeamIds.length > 0 && (
              <motion.button
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={handleSaveAllDirty}
                disabled={isBulkSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-somaiya-700 hover:bg-somaiya-800 text-white text-xs font-black shadow-md shadow-somaiya-700/20 transition-all hover:scale-[1.02]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {isBulkSaving ? 'SAVING ALL...' : `SAVE ALL CHANGES (${dirtyTeamIds.length})`}
                </span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterMode === 'ALL'
                  ? 'bg-somaiya-700 text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              All 16 Teams
            </button>
            <button
              onClick={() => setFilterMode('SCORED')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterMode === 'SCORED'
                  ? 'bg-somaiya-700 text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Scored ({teams.filter((t) => t.judgement.finalAverage !== null && t.judgement.finalAverage > 0).length})
            </button>
            <button
              onClick={() => setFilterMode('UNSCORED')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterMode === 'UNSCORED'
                  ? 'bg-somaiya-700 text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Unscored ({teams.filter((t) => t.judgement.finalAverage === null || t.judgement.finalAverage === 0).length})
            </button>
            <button
              onClick={() => setFilterMode('READY')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterMode === 'READY'
                  ? 'bg-somaiya-700 text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Ready to Finalize ({teams.filter((t) => t.judgement.round1 !== null && t.judgement.round2 !== null && t.judgement.round3 !== null && !t.judgement.isFinalized).length})
            </button>
            <button
              onClick={() => setFilterMode('FINALIZED')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterMode === 'FINALIZED'
                  ? 'bg-somaiya-700 text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Finalized ({teams.filter((t) => t.judgement.isFinalized).length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Group, Team, SIH ID, Leader..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600 focus:ring-1 focus:ring-somaiya-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Global Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>

      {/* SPREADSHEET TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans text-xs">
          <thead>
            <tr className="bg-gray-100/90 text-gray-700 uppercase font-mono font-bold tracking-wider text-[11px] border-b border-gray-200">
              <th className="py-3.5 px-3 text-center w-16">GROUP</th>
              <th className="py-3.5 px-4 min-w-[180px]">TEAM</th>
              <th className="py-3.5 px-3 w-28 text-center">SIH ID</th>
              <th className="py-3.5 px-4 min-w-[220px]">PROJECT</th>
              <th className="py-3.5 px-3 w-28 text-center bg-blue-50/50 border-l border-r border-blue-100 text-blue-900">
                ROUND 1 <span className="block text-[9px] text-blue-600 font-normal">Max {roundConfig.round1Max}</span>
              </th>
              <th className="py-3.5 px-3 w-28 text-center bg-amber-50/50 border-r border-amber-100 text-amber-900">
                ROUND 2 <span className="block text-[9px] text-amber-600 font-normal">Max {roundConfig.round2Max}</span>
              </th>
              <th className="py-3.5 px-3 w-28 text-center bg-purple-50/50 border-r border-purple-100 text-purple-900">
                ROUND 3 <span className="block text-[9px] text-purple-600 font-normal">Max {roundConfig.round3Max}</span>
              </th>
              <th className="py-3.5 px-3 w-32 text-center bg-gray-50 border-r border-gray-200 text-gray-900">
                AVERAGE <span className="block text-[9px] text-gray-500 font-normal">(R1+R2+R3)/3</span>
              </th>
              <th className="py-3.5 px-3 w-28 text-center">STATUS</th>
              <th className="py-3.5 px-4 w-44 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400 font-medium">
                  No teams found matching your search or filter.
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => {
                const row = rowStates[team.id] || {
                  r1: team.judgement.round1 !== null ? String(team.judgement.round1) : '',
                  r2: team.judgement.round2 !== null ? String(team.judgement.round2) : '',
                  r3: team.judgement.round3 !== null ? String(team.judgement.round3) : '',
                  isDirty: false,
                  justSaved: false,
                };

                const liveAvg = getRowLiveAverage(team.id);
                const isFinalized = team.judgement.isFinalized;
                const isSaving = savingTeamId === team.id;
                const isJustSaved = row.justSaved;
                const hasDirty = row.isDirty;

                // Check missing rounds
                const r1Filled = row.r1 !== '' && !isNaN(Number(row.r1));
                const r2Filled = row.r2 !== '' && !isNaN(Number(row.r2));
                const r3Filled = row.r3 !== '' && !isNaN(Number(row.r3));
                const allThreeFilled = r1Filled && r2Filled && r3Filled;

                // Missing text
                const missingRounds: string[] = [];
                if (!r1Filled) missingRounds.push('R1');
                if (!r2Filled) missingRounds.push('R2');
                if (!r3Filled) missingRounds.push('R3');

                return (
                  <tr
                    key={team.id}
                    className={`transition-colors ${
                      isJustSaved
                        ? 'bg-emerald-50/70'
                        : hasDirty
                        ? 'bg-amber-50/40'
                        : isFinalized
                        ? 'bg-white hover:bg-gray-50/70'
                        : 'bg-white hover:bg-gray-50/80'
                    }`}
                  >
                    {/* 1. GROUP */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-gray-700">
                      <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-xs">
                        G{team.groupNumber.toString().padStart(2, '0')}
                      </span>
                    </td>

                    {/* 2. TEAM */}
                    <td className="py-3 px-4">
                      <div className="font-black text-gray-950 text-xs hover:text-somaiya-700 transition-colors">
                        {team.teamName}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                        Leader: <strong className="text-gray-700">{team.teamLeader}</strong>
                      </div>
                    </td>

                    {/* 3. SIH ID */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-[11px] font-bold text-somaiya-700 bg-somaiya-50 px-2 py-0.5 rounded border border-somaiya-200">
                        {team.sihId}
                      </span>
                    </td>

                    {/* 4. PROJECT (Short Title, No Paragraphs) */}
                    <td className="py-3 px-4">
                      <div
                        className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-xs"
                        title={team.projectName}
                      >
                        {team.shortProjectName || team.projectName}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                        {team.theme}
                      </div>
                    </td>

                    {/* 5. ROUND 1 INPUT */}
                    <td className="py-2.5 px-2 text-center bg-blue-50/20 border-l border-r border-blue-100/60">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min={0}
                          max={roundConfig.round1Max}
                          step={0.5}
                          placeholder="—"
                          value={row.r1}
                          onChange={(e) => handleCellChange(team.id, 'r1', e.target.value)}
                          className={`w-20 px-2 py-1.5 text-center font-mono font-black text-sm rounded-lg border shadow-2xs transition-all focus:outline-none ${
                            row.r1 !== ''
                              ? 'bg-white border-blue-300 text-blue-900 focus:ring-2 focus:ring-blue-500'
                              : 'bg-white/80 border-gray-300 text-gray-400 focus:bg-white focus:border-somaiya-600 focus:ring-2 focus:ring-somaiya-600'
                          }`}
                        />
                      </div>
                      <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                        {team.judgement.round1 !== null ? `Saved: ${team.judgement.round1}` : 'Not Scored'}
                      </div>
                    </td>

                    {/* 6. ROUND 2 INPUT */}
                    <td className="py-2.5 px-2 text-center bg-amber-50/20 border-r border-amber-100/60">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min={0}
                          max={roundConfig.round2Max}
                          step={0.5}
                          placeholder="—"
                          value={row.r2}
                          onChange={(e) => handleCellChange(team.id, 'r2', e.target.value)}
                          className={`w-20 px-2 py-1.5 text-center font-mono font-black text-sm rounded-lg border shadow-2xs transition-all focus:outline-none ${
                            row.r2 !== ''
                              ? 'bg-white border-amber-300 text-amber-900 focus:ring-2 focus:ring-amber-500'
                              : 'bg-white/80 border-gray-300 text-gray-400 focus:bg-white focus:border-somaiya-600 focus:ring-2 focus:ring-somaiya-600'
                          }`}
                        />
                      </div>
                      <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                        {team.judgement.round2 !== null ? `Saved: ${team.judgement.round2}` : 'Not Scored'}
                      </div>
                    </td>

                    {/* 7. ROUND 3 INPUT */}
                    <td className="py-2.5 px-2 text-center bg-purple-50/20 border-r border-purple-100/60">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min={0}
                          max={roundConfig.round3Max}
                          step={0.5}
                          placeholder="—"
                          value={row.r3}
                          onChange={(e) => handleCellChange(team.id, 'r3', e.target.value)}
                          className={`w-20 px-2 py-1.5 text-center font-mono font-black text-sm rounded-lg border shadow-2xs transition-all focus:outline-none ${
                            row.r3 !== ''
                              ? 'bg-white border-purple-300 text-purple-900 focus:ring-2 focus:ring-purple-500'
                              : 'bg-white/80 border-gray-300 text-gray-400 focus:bg-white focus:border-somaiya-600 focus:ring-2 focus:ring-somaiya-600'
                          }`}
                        />
                      </div>
                      <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                        {team.judgement.round3 !== null ? `Saved: ${team.judgement.round3}` : 'Not Scored'}
                      </div>
                    </td>

                    {/* 8. AUTOMATIC AVERAGE */}
                    <td className="py-3 px-3 text-center bg-gray-50/60 border-r border-gray-200">
                      {liveAvg !== null ? (
                        <div>
                          <span className="font-mono text-base font-black text-somaiya-800">
                            {liveAvg.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 block font-semibold">
                            / 100
                          </span>
                        </div>
                      ) : missingRounds.length === 3 ? (
                        <span className="font-mono text-xs text-gray-400">
                          Not Scored
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                          Awaiting {missingRounds.join(', ')}
                        </span>
                      )}
                    </td>

                    {/* 9. STATUS */}
                    <td className="py-3 px-3 text-center">
                      {isFinalized ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          FINALIZED
                        </span>
                      ) : allThreeFilled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
                          READY
                        </span>
                      ) : missingRounds.length < 3 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {3 - missingRounds.length}/3 SCORED
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">
                          NOT STARTED
                        </span>
                      )}
                    </td>

                    {/* 10. ACTION (Per-team Save & Finalize Buttons) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* SAVE SCORES BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleSaveTeam(team)}
                          disabled={isSaving}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                            isJustSaved
                              ? 'bg-emerald-600 text-white'
                              : hasDirty
                              ? 'bg-somaiya-700 hover:bg-somaiya-800 text-white shadow-somaiya-700/20'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                          }`}
                          title="Save entered round scores for this team"
                        >
                          {isJustSaved ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>SAVED</span>
                            </>
                          ) : isSaving ? (
                            <span>Saving...</span>
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              <span>SAVE</span>
                            </>
                          )}
                        </button>

                        {/* FINALIZE RESULT BUTTON */}
                        {isFinalized ? (
                          <span
                            className="p-1.5 text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200"
                            title="Result is locked and official"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmTeam(team)}
                            disabled={!allThreeFilled || hasDirty}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                              allThreeFilled && !hasDirty
                                ? 'bg-gray-900 hover:bg-black text-white cursor-pointer'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                            }`}
                            title={
                              hasDirty
                                ? 'Save round scores first before finalizing'
                                : allThreeFilled
                                ? 'Lock final average and make rank official'
                                : 'Requires all 3 rounds to be scored'
                            }
                          >
                            <Lock className="w-3 h-3" />
                            <span>FINALIZE</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-4 flex-wrap font-mono">
          <span>Total Teams: <strong>16</strong></span>
          <span>•</span>
          <span>Scored: <strong>{teams.filter((t) => t.judgement.finalAverage !== null).length} / 16</strong></span>
          <span>•</span>
          <span>Finalized: <strong className="text-emerald-700">{teams.filter((t) => t.judgement.isFinalized).length} / 16</strong></span>
        </div>
        <div className="text-[11px] text-gray-400">
          Deterministic Tie-breaker: Final Avg → Round 3 → Round 2 → Round 1 → Finalization Time.
        </div>
      </div>

      {/* CONFIRM FINALIZE RESULT MODAL */}
      <AnimatePresence>
        {confirmTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmTeam(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-7 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-somaiya-100 text-somaiya-700 flex items-center justify-center mb-4 mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-gray-950 text-center">
                Lock &amp; Finalize Result?
              </h3>
              <p className="text-xs text-gray-600 text-center mt-1.5 leading-relaxed">
                You are about to lock the official result for:
                <br />
                <strong className="text-gray-950 text-sm">{confirmTeam.teamName}</strong> ({confirmTeam.teamNumber} • {confirmTeam.sihId})
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Round 1:</span>
                  <span className="font-mono font-bold text-gray-900">{confirmTeam.judgement.round1} / {roundConfig.round1Max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Round 2:</span>
                  <span className="font-mono font-bold text-gray-900">{confirmTeam.judgement.round2} / {roundConfig.round2Max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Round 3:</span>
                  <span className="font-mono font-bold text-gray-900">{confirmTeam.judgement.round3} / {roundConfig.round3Max}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between text-sm font-bold text-somaiya-800">
                  <span>Final Calculated Average:</span>
                  <span className="font-mono font-black text-base">{confirmTeam.judgement.finalAverage} / 100</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmTeam(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeTeam}
                  disabled={finalizingTeamId === confirmTeam.id}
                  className="flex-1 py-2.5 rounded-xl bg-somaiya-700 hover:bg-somaiya-800 text-white font-black text-xs shadow-md shadow-somaiya-700/20"
                >
                  {finalizingTeamId === confirmTeam.id ? 'Locking...' : 'Yes, Lock & Finalize'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
