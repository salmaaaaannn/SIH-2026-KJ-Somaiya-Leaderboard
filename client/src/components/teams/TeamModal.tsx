import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Shield, Users, Clock, CheckCircle2, ChevronRight, FileText, Info, Sparkles } from 'lucide-react';
import { RankedTeam } from '../../types';

interface TeamModalProps {
  team: RankedTeam | null;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ team, onClose }) => {
  if (!team) return null;

  const judgement = team.judgement;
  const isTop5 = team.rank <= 5 && judgement.finalAverage !== null;
  const r1 = judgement.round1;
  const r2 = judgement.round2;
  const r3 = judgement.round3;
  const finalAvg = judgement.finalAverage;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden z-10 my-8"
        >
          {/* Top Brand Stripe */}
          <div className="h-2 bg-gradient-to-r from-somaiya-700 via-amber-500 to-somaiya-700" />

          {/* Modal Header */}
          <div className="p-6 sm:p-8 bg-gray-50/70 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-somaiya-100 text-somaiya-800 border border-somaiya-200">
                    {team.sihId}
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-800">
                    {team.teamNumber}
                  </span>
                  <span className="text-xs text-somaiya-700 font-bold">
                    {team.theme}
                  </span>
                  {judgement.isFinalized && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Finalized
                    </span>
                  )}
                  {isTop5 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-somaiya-700 text-white shadow-2xs">
                      Top 5 Qualifier
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
                  {team.teamName}
                </h2>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  {team.projectName}
                </p>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  Team Leader: <strong>{team.teamLeader}</strong> • {team.department}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard Hero Banner */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl font-mono font-black text-xl flex items-center justify-center text-white ${
                    team.rank === 1 && finalAvg !== null
                      ? 'bg-somaiya-700 shadow-glow-red'
                      : isTop5
                      ? 'bg-somaiya-800'
                      : 'bg-gray-800'
                  }`}
                >
                  #{team.rank}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Current Standing
                  </div>
                  <div className="text-xs font-semibold text-gray-700">
                    {finalAvg !== null ? (
                      team.rank === 1
                        ? 'Rank #1 Event Leader'
                        : `${team.scoreDiffAbove || 0} pts behind Rank #${team.rank - 1}`
                    ) : (
                      'Evaluation in Progress'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 font-mono">
                {finalAvg !== null ? (
                  <>
                    <span className="text-4xl font-black text-gray-950">
                      {finalAvg.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-gray-400">/ 100</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    Awaiting All 3 Rounds
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* 3-Round Evaluation Breakdown */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-somaiya-700" />
                Three Round Judging Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Round 1 */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-mono font-bold text-blue-700 uppercase">
                    Round 1
                  </div>
                  <div className="text-xs font-bold text-gray-900 mt-0.5">
                    Problem &amp; Approach
                  </div>
                  <div className="mt-3 flex items-baseline justify-between font-mono">
                    <span className="text-xl font-black text-gray-950">
                      {r1 !== null ? r1 : '—'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-2">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${r1 !== null ? Math.min(100, r1) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Round 2 */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-mono font-bold text-amber-700 uppercase">
                    Round 2
                  </div>
                  <div className="text-xs font-bold text-gray-900 mt-0.5">
                    Technical Architecture
                  </div>
                  <div className="mt-3 flex items-baseline justify-between font-mono">
                    <span className="text-xl font-black text-gray-950">
                      {r2 !== null ? r2 : '—'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-2">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${r2 !== null ? Math.min(100, r2) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Round 3 */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-mono font-bold text-purple-700 uppercase">
                    Round 3
                  </div>
                  <div className="text-xs font-bold text-gray-900 mt-0.5">
                    Prototype &amp; Defense
                  </div>
                  <div className="mt-3 flex items-baseline justify-between font-mono">
                    <span className="text-xl font-black text-gray-950">
                      {r3 !== null ? r3 : '—'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-2">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${r3 !== null ? Math.min(100, r3) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Score History / Audit Trail */}
            {team.history && team.history.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Score Revision Timeline ({team.history.length})
                </h3>

                <div className="space-y-2 border-l-2 border-gray-200 pl-4 ml-2">
                  {team.history.map((hist) => (
                    <div key={hist.id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-somaiya-700 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-gray-500 text-[11px]">
                          {new Date(hist.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                          {hist.previousScore !== null ? hist.previousScore : '—'} → {hist.newScore} pts
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 mt-0.5">
                        {hist.changeNote || `Updated by ${hist.updatedBy}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deterministic Tie-Breaker Rule Notice */}
            <div className="flex items-start gap-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-[11px] text-gray-600 leading-relaxed">
              <Info className="w-4 h-4 text-somaiya-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900">Deterministic Tie-Breaker Hierarchy:</strong>
                <ol className="list-decimal pl-4 mt-1 space-y-0.5 text-gray-500 font-mono text-[10px]">
                  <li>Final Average Score DESC</li>
                  <li>Round 3 Score DESC (Prototype defense)</li>
                  <li>Round 2 Score DESC (Technical architecture)</li>
                  <li>Round 1 Score DESC (Problem approach)</li>
                  <li>Earlier Finalization Timestamp ASC</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
