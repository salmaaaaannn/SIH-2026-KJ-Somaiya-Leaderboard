import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { LeaderboardData, RankedTeam, RoundConfig } from '../types';
import { soundEffects } from '../utils/audio';
import { apiUrl, API_BASE } from '../utils/api';

interface ScoreChangeNotification {
  id: string;
  teamId: string;
  teamName: string;
  projectName: string;
  oldScore: number;
  newScore: number;
  rank: number;
  previousRank: number;
  timestamp: number;
}

interface LeaderboardContextType {
  leaderboard: LeaderboardData | null;
  selectedTeam: RankedTeam | null;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  soundEnabled: boolean;
  notification: ScoreChangeNotification | null;
  recentlyUpdatedTeamId: string | null;
  openTeamModal: (team: RankedTeam) => void;
  closeTeamModal: () => void;
  toggleSound: () => void;
  refreshLeaderboard: () => Promise<void>;
  submitRoundScore: (teamId: string, roundNumber: 1 | 2 | 3, score: number, token?: string) => Promise<boolean>;
  saveTeamScores: (
    teamId: string,
    scores: { round1?: number | null; round2?: number | null; round3?: number | null },
    token?: string
  ) => Promise<boolean>;
  saveBulkScores: (
    updates: Array<{ teamId: string; round1?: number | null; round2?: number | null; round3?: number | null }>,
    token?: string
  ) => Promise<boolean>;
  finalizeTeamScore: (teamId: string, token?: string) => Promise<boolean>;
  updateRoundLimits: (config: Partial<RoundConfig>, token?: string) => Promise<boolean>;
  startRevealSession: (token?: string) => Promise<boolean>;
  stepRevealSession: (stepData: {
    currentRank: 5 | 4 | 3 | 2 | 1 | 0;
    subStep: 'rank' | 'countdown' | 'project' | 'team' | 'leader' | 'score' | 'hold';
    countdownValue?: number;
    status?: 'LOCKED' | 'COUNTDOWN' | 'REVEALING' | 'WINNER_SUSPENSE' | 'FINALE';
  }, token?: string) => Promise<boolean>;
  resetRevealSession: (token?: string) => Promise<boolean>;
  resetScoresEmpty: (token?: string) => Promise<boolean>;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<RankedTeam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<ScoreChangeNotification | null>(null);
  const [recentlyUpdatedTeamId, setRecentlyUpdatedTeamId] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/leaderboard'));
      if (!res.ok) throw new Error(`Failed to fetch live leaderboard (HTTP ${res.status}).`);
      const data: LeaderboardData = await res.json();
      setLeaderboard(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to connect to live leaderboard.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Determine socket host (direct backend if dev port 5173, otherwise same origin)
    const socketHost = API_BASE || window.location.origin;
    const socket: Socket = io(socketHost, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('leaderboard:update', (data: LeaderboardData) => {
      setLeaderboard(data);
      // If modal is open, keep selected team synced
      setSelectedTeam(prev => {
        if (!prev) return null;
        return data.teams.find(t => t.id === prev.id) || prev;
      });
    });

    socket.on('reveal:state', (session) => {
      setLeaderboard(prev => prev ? { ...prev, revealSession: session } : prev);
    });

    socket.on('score:changed', (payload: {
      teamId: string;
      teamName: string;
      projectName: string;
      oldScore: number;
      newScore: number;
      rank: number;
      previousRank: number;
    }) => {
      const notifItem: ScoreChangeNotification = {
        ...payload,
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
      };
      setNotification(notifItem);
      setRecentlyUpdatedTeamId(payload.teamId);

      // Sound feedback
      if (soundEnabled) {
        if (payload.rank === 1 && payload.previousRank !== 1) {
          soundEffects.playRankOneChime();
          // Mild tasteful celebration confetti for top rank takeover
          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#A01C24', '#D97706', '#FFFFFF', '#111827'],
            });
          } catch {
            // graceful
          }
        } else {
          soundEffects.playScoreUpdate();
        }
      }

      // Auto-clear notification after 6 seconds
      setTimeout(() => {
        setNotification(current => (current?.id === notifItem.id ? null : current));
      }, 6000);

      // Auto-clear highlight after 5 seconds
      setTimeout(() => {
        setRecentlyUpdatedTeamId(current => (current === payload.teamId ? null : current));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchLeaderboard, soundEnabled]);

  const openTeamModal = (team: RankedTeam) => {
    setSelectedTeam(team);
  };

  const closeTeamModal = () => {
    setSelectedTeam(null);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
  };

  const getAuthHeaders = (token?: string) => {
    const t =
      token ||
      localStorage.getItem('somaiya_sih_admin_token') ||
      localStorage.getItem('sih_admin_token') ||
      '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
    };
  };

  const extractErrorMessage = async (res: Response, fallback: string): Promise<string> => {
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const parsed = await res.json();
        return parsed.error || parsed.message || fallback;
      }
      const text = await res.text();
      return text && text.trim().length > 0 && text.length < 200
        ? text.trim()
        : `${fallback} (HTTP ${res.status})`;
    } catch {
      return `${fallback} (HTTP ${res.status})`;
    }
  };

  const submitRoundScore = async (
    teamId: string,
    roundNumber: 1 | 2 | 3,
    score: number,
    token?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/rounds/score'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ teamId, roundNumber, score }),
      });
      if (!res.ok) {
        const errMessage = await extractErrorMessage(res, 'Failed to submit round score.');
        console.error('Error submitting round score:', errMessage);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error submitting round score:', err);
      return false;
    }
  };

  const saveTeamScores = async (
    teamId: string,
    scores: { round1?: number | null; round2?: number | null; round3?: number | null },
    token?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/rounds/team-scores'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ teamId, ...scores }),
      });
      if (!res.ok) {
        const errMessage = await extractErrorMessage(res, 'Failed to save team scores.');
        console.error('Error saving team scores:', errMessage);
        return false;
      }
      const data = await res.json().catch(() => null);
      if (data?.team) {
        setLeaderboard((prev) => {
          if (!prev) return prev;
          const nextTeams = prev.teams.map((t) => (t.id === teamId ? { ...t, ...data.team } : t));
          return { ...prev, teams: nextTeams };
        });
      }
      return true;
    } catch (err) {
      console.error('Error saving team scores:', err);
      return false;
    }
  };

  const saveBulkScores = async (
    updates: Array<{ teamId: string; round1?: number | null; round2?: number | null; round3?: number | null }>,
    token?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/rounds/bulk-save'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) {
        const errMessage = await extractErrorMessage(res, 'Failed to bulk save scores.');
        console.error('Error bulk saving scores:', errMessage);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error bulk saving scores:', err);
      return false;
    }
  };

  const finalizeTeamScore = async (teamId: string, token?: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/rounds/finalize'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) {
        const errMessage = await extractErrorMessage(res, 'Failed to finalize team.');
        console.error('Error finalizing team:', errMessage);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error finalizing team:', err);
      return false;
    }
  };

  const updateRoundLimits = async (config: Partial<RoundConfig>, token?: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/rounds/config'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(config),
      });
      return res.ok;
    } catch (err) {
      console.error('Error updating round limits:', err);
      return false;
    }
  };

  const startRevealSession = async (token?: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/reveal/start'), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      return res.ok;
    } catch (err) {
      console.error('Error starting reveal session:', err);
      return false;
    }
  };

  const stepRevealSession = async (
    stepData: {
      currentRank: 5 | 4 | 3 | 2 | 1 | 0;
      subStep: 'rank' | 'countdown' | 'project' | 'team' | 'leader' | 'score' | 'hold';
      countdownValue?: number;
      status?: 'LOCKED' | 'COUNTDOWN' | 'REVEALING' | 'WINNER_SUSPENSE' | 'FINALE';
    },
    token?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/reveal/step'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(stepData),
      });
      return res.ok;
    } catch (err) {
      console.error('Error stepping reveal session:', err);
      return false;
    }
  };

  const resetRevealSession = async (token?: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/reveal/reset'), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      return res.ok;
    } catch (err) {
      console.error('Error resetting reveal session:', err);
      return false;
    }
  };

  const resetScoresEmpty = async (token?: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/admin/reset-scores-empty'), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      return res.ok;
    } catch (err) {
      console.error('Error resetting scores to empty:', err);
      return false;
    }
  };

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        selectedTeam,
        isLoading,
        isConnected,
        error,
        soundEnabled,
        notification,
        recentlyUpdatedTeamId,
        openTeamModal,
        closeTeamModal,
        toggleSound,
        refreshLeaderboard: fetchLeaderboard,
        submitRoundScore,
        saveTeamScores,
        saveBulkScores,
        finalizeTeamScore,
        updateRoundLimits,
        startRevealSession,
        stepRevealSession,
        resetRevealSession,
        resetScoresEmpty,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};
