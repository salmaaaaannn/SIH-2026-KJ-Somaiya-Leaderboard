import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Download,
  RotateCcw,
  LogOut,
  Users,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Clock,
  Award,
  AlertTriangle,
  PauseCircle,
  CheckCircle,
  Play,
  Sliders,
  Tv,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { JudgeScorecard } from './JudgeScorecard';
import { TeamManager } from './TeamManager';
import { ScoreHistoryLog } from './ScoreHistoryLog';
import { EventState, RoundConfig } from '../../types';
import { apiUrl } from '../../utils/api';

interface AdminDashboardProps {
  onBackToPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPublic }) => {
  const { user, logout, token } = useAuth();
  const {
    leaderboard,
    refreshLeaderboard,
    updateRoundLimits,
    startRevealSession,
    resetRevealSession,
    resetScoresEmpty,
  } = useLeaderboard();

  const [activeTab, setActiveTab] = useState<'scorecard' | 'matrix' | 'teams' | 'history'>('scorecard');
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [revealModalOpen, setRevealModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Round max configs
  const [r1Max, setR1Max] = useState<number>(leaderboard?.roundConfig?.round1Max || 100);
  const [r2Max, setR2Max] = useState<number>(leaderboard?.roundConfig?.round2Max || 100);
  const [r3Max, setR3Max] = useState<number>(leaderboard?.roundConfig?.round3Max || 100);

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
  const revealSession = leaderboard?.revealSession;

  const handleStatusChange = async (newStatus: EventState) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(apiUrl('/api/admin/event-status'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update event status');
      await refreshLeaderboard();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetScores = async () => {
    setIsProcessing(true);
    try {
      await resetScoresEmpty(token || undefined);
      await refreshLeaderboard();
      setResetModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveRoundConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await updateRoundLimits(
        {
          round1Max: Number(r1Max),
          round2Max: Number(r2Max),
          round3Max: Number(r3Max),
        },
        token || undefined
      );
      await refreshLeaderboard();
      setConfigModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartReveal = async () => {
    setIsProcessing(true);
    try {
      await startRevealSession(token || undefined);
      await refreshLeaderboard();
      setRevealModalOpen(false);
      onBackToPublic(); // Directly take to reveal presentation screen
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetReveal = async () => {
    setIsProcessing(true);
    try {
      await resetRevealSession(token || undefined);
      await refreshLeaderboard();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/export-csv'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to download CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sih-2026-somaiya-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading CSV', err);
    }
  };

  const lastUpdatedFormatted = leaderboard?.lastUpdated
    ? new Date(leaderboard.lastUpdated).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Now';

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      {/* Top Admin Sub-bar */}
      <div className="bg-gray-900 text-white px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-somaiya-700 flex items-center justify-center font-bold text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Jury Evaluation &amp; Admin Control Center
            </div>
            <div className="text-[11px] text-gray-400">
              User: <strong className="text-white">{user?.name || user?.email}</strong> ({user?.role})
            </div>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Top 5 Reveal Trigger */}
          {revealSession?.isActive ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>REVEAL SESSION ACTIVE</span>
              <button
                onClick={handleResetReveal}
                className="ml-2 underline text-[11px] hover:text-white"
              >
                End Reveal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setRevealModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 text-xs font-black transition-all shadow-md shadow-amber-500/20"
              title="Launch the suspenseful Top 5 winner countdown and ceremony"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-950" />
              <span>START TOP 5 REVEAL</span>
            </button>
          )}

          {/* Round Max Config */}
          <button
            onClick={() => setConfigModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition-colors shadow-2xs"
            title="Configure maximum points for Round 1, Round 2, Round 3"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Round Max Config</span>
          </button>

          {/* Reset Scores to Empty (Preserves 16 teams) */}
          <button
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-rose-300 text-xs font-semibold border border-gray-700 transition-colors shadow-2xs"
            title="Clear all round scores back to Not Scored"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset All Scores</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition-colors shadow-2xs"
            title="Download complete scoresheet CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* View Public Leaderboard */}
          <button
            onClick={onBackToPublic}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-somaiya-700 hover:bg-somaiya-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Presentation Screen</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Dashboard Title & Event Status Controller */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              3-Round Judging &amp; Event Control
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              K J Somaiya Institute of Management — SIH 2026 Internal Selection (16 Real Teams)
            </p>
          </div>

          {/* Event Status Selector */}
          <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">
              Event Status:
            </span>

            <button
              onClick={() => handleStatusChange('LIVE')}
              disabled={updatingStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                eventStatus === 'LIVE'
                  ? 'bg-somaiya-50 text-somaiya-800 border border-somaiya-200 shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-somaiya-700 animate-pulse" />
              <span>LIVE</span>
            </button>

            <button
              onClick={() => handleStatusChange('PAUSED')}
              disabled={updatingStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                eventStatus === 'PAUSED'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>PAUSED</span>
            </button>

            <button
              onClick={() => handleStatusChange('FINAL')}
              disabled={updatingStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                eventStatus === 'FINAL'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>FINAL</span>
            </button>
          </div>
        </div>

        {/* 3-Round Progress Statistics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Teams</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-gray-900 font-mono">{stats.totalTeams}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Official SIH 2026</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-blue-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Round 1</span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                Max {leaderboard?.roundConfig?.round1Max || 100}
              </span>
            </div>
            <div className="text-2xl font-black text-blue-700 font-mono">
              {stats.r1Count}
              <span className="text-xs font-normal text-gray-400 font-sans"> / 16</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Problem &amp; Approach</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-amber-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Round 2</span>
              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                Max {leaderboard?.roundConfig?.round2Max || 100}
              </span>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono">
              {stats.r2Count}
              <span className="text-xs font-normal text-gray-400 font-sans"> / 16</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Technical Rigor</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-purple-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Round 3</span>
              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                Max {leaderboard?.roundConfig?.round3Max || 100}
              </span>
            </div>
            <div className="text-2xl font-black text-purple-700 font-mono">
              {stats.r3Count}
              <span className="text-xs font-normal text-gray-400 font-sans"> / 16</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Prototype Defense</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Finalized</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {stats.finalizedCount}
              <span className="text-xs font-normal text-gray-400 font-sans"> / 16</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Rank eligible</div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-somaiya-700 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Cohort Avg</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-somaiya-800 font-mono">
              {stats.cohortAverage > 0 ? stats.cohortAverage : '—'}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">All 3 rounds avg</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'scorecard'
                ? 'bg-somaiya-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Judge Scorecard (3 Rounds)</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-somaiya-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>16 Teams Judging Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-somaiya-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Team Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-somaiya-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Evaluation Audit Log</span>
          </button>
        </div>

        {/* Tab Body */}
        {leaderboard && (
          <div>
            {activeTab === 'scorecard' && <JudgeScorecard teams={leaderboard.teams} />}

            {activeTab === 'matrix' && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-xs font-bold text-somaiya-700 uppercase tracking-wider">
                      Master Evaluation Overview
                    </h3>
                    <h4 className="text-xl font-black text-gray-950">
                      16 Teams 3-Round Matrix
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    Updated: {lastUpdatedFormatted}
                  </span>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-bold">
                        <th className="py-3 px-3">Rank</th>
                        <th className="py-3 px-3">Team</th>
                        <th className="py-3 px-3">Project Title</th>
                        <th className="py-3 px-3 text-center">Round 1 (/{leaderboard.roundConfig.round1Max})</th>
                        <th className="py-3 px-3 text-center">Round 2 (/{leaderboard.roundConfig.round2Max})</th>
                        <th className="py-3 px-3 text-center">Round 3 (/{leaderboard.roundConfig.round3Max})</th>
                        <th className="py-3 px-3 text-center">Final Avg</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.teams.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-black text-gray-900">
                            #{t.rank}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-gray-900">{t.teamName}</div>
                            <div className="font-mono text-[11px] text-somaiya-700">
                              {t.teamNumber} • {t.sihId}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-600 max-w-xs truncate">
                            {t.shortProjectName || t.projectName}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            {t.judgement.round1 !== null ? (
                              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                {t.judgement.round1}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            {t.judgement.round2 !== null ? (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                {t.judgement.round2}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            {t.judgement.round3 !== null ? (
                              <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                {t.judgement.round3}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-black text-sm">
                            {t.judgement.finalAverage !== null ? (
                              <span className="text-somaiya-800">
                                {t.judgement.finalAverage}
                              </span>
                            ) : (
                              <span className="text-gray-400 font-normal text-xs">Not Scored</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {t.judgement.isFinalized ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                FINALIZED
                              </span>
                            ) : t.judgement.status === 'READY' ? (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                READY
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-medium">
                                {t.judgement.status.replace('_', ' ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'teams' && <TeamManager teams={leaderboard.teams} />}
            {activeTab === 'history' && <ScoreHistoryLog teams={leaderboard.teams} />}
          </div>
        )}
      </div>

      {/* TOP 5 REVEAL CONFIRMATION MODAL */}
      <AnimatePresence>
        {revealModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRevealModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 z-10 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-gray-950">
                Launch Top 5 Reveal Ceremony?
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                This will trigger the cinematic suspense presentation on <strong>all connected screens and projectors</strong>.
                Winners will be revealed backwards from <strong>#5 down to #1 Grand Winner</strong> with dramatic 3-second countdowns and spotlight animations.
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left text-xs text-amber-900 space-y-1 font-medium">
                <div className="font-bold">Reveal Sequence:</div>
                <div>• Step 1: 3-2-1 Countdown for Rank 5</div>
                <div>• Step 2: Project Name → Team Name → Leader → Score reveal</div>
                <div>• Step 3: Progressive step-down to Rank 1 with fanfare</div>
                <div>• Step 4: Finale Celebration displaying all 5 winners</div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRevealModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartReveal}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  {isProcessing ? 'Launching...' : 'YES, START TOP 5 REVEAL NOW'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROUND CONFIGURATION MODAL */}
      <AnimatePresence>
        {configModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-lg font-black text-gray-950">
                  Configure Round Max Scores
                </h3>
                <button
                  onClick={() => setConfigModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRoundConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Round 1 Maximum Points (Default 100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={r1Max}
                    onChange={(e) => setR1Max(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Round 2 Maximum Points (Default 100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={r2Max}
                    onChange={(e) => setR2Max(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Round 3 Maximum Points (Default 100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={r3Max}
                    onChange={(e) => setR3Max(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600 font-mono font-bold text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfigModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-somaiya-700 hover:bg-somaiya-800 text-white font-bold"
                  >
                    {isProcessing ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESET SCORES TO EMPTY MODAL */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-gray-950">
                Clear All Evaluation Scores?
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                This will reset all 16 teams back to <strong>Not Scored</strong>.
                No dummy scores or fake 0s will be present.
                All 16 official team records, SIH IDs, and project titles will remain <strong>strictly preserved</strong>.
              </p>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetScores}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
                >
                  {isProcessing ? 'Resetting...' : 'Yes, Reset All Scores'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
