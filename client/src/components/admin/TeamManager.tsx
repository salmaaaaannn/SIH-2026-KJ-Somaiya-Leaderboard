import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, AlertTriangle } from 'lucide-react';
import { RankedTeam } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { apiUrl } from '../../utils/api';

interface TeamManagerProps {
  teams: RankedTeam[];
}

export const TeamManager: React.FC<TeamManagerProps> = ({ teams }) => {
  const { token } = useAuth();
  const { refreshLeaderboard } = useLeaderboard();

  const [search, setSearch] = useState<string>('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [activeTeam, setActiveTeam] = useState<RankedTeam | null>(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<RankedTeam | null>(null);

  // Form fields
  const [teamNumber, setTeamNumber] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [sihId, setSihId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [shortProjectName, setShortProjectName] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [teamLeader, setTeamLeader] = useState<string>('');
  const [department, setDepartment] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const openAddModal = () => {
    setActiveTeam(null);
    setTeamNumber(`TEAM-${(teams.length + 1).toString().padStart(2, '0')}`);
    setTeamName('');
    setSihId('SIH26');
    setProjectName('');
    setShortProjectName('');
    setTheme('Smart Automation');
    setTeamLeader('');
    setDepartment('KJ Somaiya Institute of Management');
    setError(null);
    setModalMode('add');
  };

  const openEditModal = (team: RankedTeam) => {
    setActiveTeam(team);
    setTeamNumber(team.teamNumber);
    setTeamName(team.teamName);
    setSihId(team.sihId);
    setProjectName(team.projectName);
    setShortProjectName(team.shortProjectName || '');
    setTheme(team.theme || '');
    setTeamLeader(team.teamLeader || '');
    setDepartment(team.department || '');
    setError(null);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveTeam(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (modalMode === 'add') {
        const res = await fetch(apiUrl('/api/admin/teams'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamNumber,
            teamName,
            sihId,
            projectName,
            shortProjectName,
            theme,
            teamLeader,
            department,
            members: [teamLeader],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add team.');
      } else if (modalMode === 'edit' && activeTeam) {
        const res = await fetch(apiUrl(`/api/admin/teams/${activeTeam.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamNumber,
            teamName,
            sihId,
            projectName,
            shortProjectName,
            theme,
            teamLeader,
            department,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update team.');
      }

      await refreshLeaderboard();
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTeam) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/teams/${deleteConfirmTeam.id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete team.');
      await refreshLeaderboard();
      setDeleteConfirmTeam(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting team';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = teams.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.teamName.toLowerCase().includes(q) ||
      t.teamNumber.toLowerCase().includes(q) ||
      t.sihId.toLowerCase().includes(q) ||
      t.projectName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h3 className="text-xs font-bold text-somaiya-700 uppercase tracking-wider">
            Team Management
          </h3>
          <h4 className="text-xl font-extrabold text-gray-950">
            Registered Teams Directory ({teams.length})
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or SIH ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600"
            />
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-somaiya-700 hover:bg-somaiya-800 text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team</span>
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-bold">
              <th className="py-3 px-3">SIH ID</th>
              <th className="py-3 px-3">Team Name</th>
              <th className="py-3 px-3">Theme</th>
              <th className="py-3 px-3">Team Leader</th>
              <th className="py-3 px-3">Project Title</th>
              <th className="py-3 px-3 text-center">Score</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-somaiya-700">
                  {t.sihId}
                </td>
                <td className="py-3 px-3 font-bold text-gray-900">{t.teamName}</td>
                <td className="py-3 px-3 font-medium text-gray-600">{t.theme}</td>
                <td className="py-3 px-3 font-medium text-gray-800">{t.teamLeader}</td>
                <td className="py-3 px-3 text-gray-500 max-w-xs truncate">
                  {t.shortProjectName || t.projectName}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black">
                  {t.judgement.finalAverage !== null ? `${t.judgement.finalAverage}` : '—'}
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                      title="Edit Team"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTeam(t)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-lg font-black text-gray-950">
                  {modalMode === 'add' ? 'Add New Team' : 'Edit Team Information'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      SIH Problem Statement ID
                    </label>
                    <input
                      type="text"
                      required
                      value={sihId}
                      onChange={(e) => setSihId(e.target.value)}
                      placeholder="e.g. SIH26162"
                      className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Give Teas"
                      className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Team Leader Name
                    </label>
                    <input
                      type="text"
                      required
                      value={teamLeader}
                      onChange={(e) => setTeamLeader(e.target.value)}
                      placeholder="e.g. Akshay Patil"
                      className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Theme / Domain
                    </label>
                    <input
                      type="text"
                      required
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="e.g. Disaster Management"
                      className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Full Project Title
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project title..."
                    className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Short Project Name (for 16:9 3D Cards)
                  </label>
                  <input
                    type="text"
                    value={shortProjectName}
                    onChange={(e) => setShortProjectName(e.target.value)}
                    placeholder="e.g. Industrial Fire Detection via Satellite"
                    className="w-full px-3 py-2 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-somaiya-600"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-somaiya-700 hover:bg-somaiya-800 text-white font-bold"
                  >
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Create Team' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmTeam(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-gray-950">
                Confirm Team Deletion
              </h3>
              <p className="text-xs text-gray-600 mt-2">
                Are you sure you want to delete team{' '}
                <strong>
                  {deleteConfirmTeam.teamName} ({deleteConfirmTeam.sihId})
                </strong>
                ?
              </p>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmTeam(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
                >
                  {saving ? 'Deleting...' : 'Yes, Delete Team'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
