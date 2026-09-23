export type EventState = 'LIVE' | 'PAUSED' | 'FINAL';

export type JudgingStatus =
  | 'NOT_STARTED'
  | 'R1_COMPLETE'
  | 'R2_COMPLETE'
  | 'R3_COMPLETE'
  | 'READY'
  | 'FINALIZED';

export interface RoundConfig {
  round1Max: number;
  round2Max: number;
  round3Max: number;
}

export interface RoundScore {
  roundNumber: 1 | 2 | 3;
  score: number;
  maxScore: number;
  submittedAt: string;
  submittedBy: string;
}

export interface TeamJudgement {
  round1: number | null;
  round2: number | null;
  round3: number | null;
  finalAverage: number | null;
  isFinalized: boolean;
  status: JudgingStatus;
  finalizedAt?: string;
  finalizedBy?: string;
  notes?: string;
}

export interface ScoreHistoryItem {
  id: string;
  teamId: string;
  roundNumber?: number;
  action: 'ROUND_SUBMIT' | 'FINALIZED' | 'RESET';
  previousScore?: number | null;
  newScore?: number | null;
  timestamp: string;
  updatedBy: string;
  changeNote?: string;
}

export interface Team {
  id: string;
  groupNumber: number;
  teamNumber: string;
  teamName: string;
  sihId: string;
  projectName: string;
  shortProjectName?: string;
  theme: string;
  category?: string;
  organization?: string;
  teamLeader: string;
  department?: string;
  members?: string[];
  judgement: TeamJudgement;
  roundScores: RoundScore[];
  history?: ScoreHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RankedTeam extends Team {
  rank: number;
  previousRank?: number;
  rankDelta?: number;
  scoreDiffAbove?: number; // difference in final average from team ranked rank - 1
  scoreDiffTop5?: number; // difference in final average from rank 5 team
  isTop5: boolean;
}

export type RevealStatus = 'LOCKED' | 'COUNTDOWN' | 'REVEALING' | 'WINNER_SUSPENSE' | 'FINALE';

export interface RevealSession {
  isActive: boolean;
  status: RevealStatus;
  currentRank: 5 | 4 | 3 | 2 | 1 | 0; // 0 = finale showing all 5
  subStep: 'rank' | 'countdown' | 'project' | 'team' | 'leader' | 'score' | 'hold';
  countdownValue: number; // 3, 2, 1
  startedAt?: string;
  completedAt?: string;
}

export interface LeaderboardData {
  teams: RankedTeam[];
  eventStatus: EventState;
  roundConfig: RoundConfig;
  revealSession: RevealSession;
  lastUpdated: string;
  stats: {
    totalTeams: number;
    r1Count: number;
    r2Count: number;
    r3Count: number;
    finalizedCount: number;
    highestAverage: number;
    cohortAverage: number;
    top5Cutoff: number;
  };
}
