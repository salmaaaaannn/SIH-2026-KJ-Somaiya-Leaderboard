import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  EventState,
  LeaderboardData,
  RankedTeam,
  RevealSession,
  RoundConfig,
  RoundScore,
  ScoreHistoryItem,
  Team,
  TeamJudgement
} from './types';

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'superadmin' | 'judge';
}

interface DatabaseSchema {
  teams: Team[];
  eventStatus: EventState;
  roundConfig: RoundConfig;
  revealSession: RevealSession;
  lastUpdated: string;
  adminUsers: AdminUser[];
  previousRanks: Record<string, number>;
}

// THE EXACT 16 SIH GROUPS
const REAL_16_TEAMS_METADATA = [
  {
    groupNumber: 1,
    teamNumber: 'TEAM-01',
    teamName: 'Give Teas',
    sihId: 'SIH26162',
    projectName: 'AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data',
    shortProjectName: 'AI Industrial Fire & Thermal Detection',
    theme: 'Disaster Management',
    category: 'Software',
    organization: 'National Technical Research Organisation (NTRO)',
    department: 'National Technical Research Organisation (NTRO)',
    teamLeader: 'Akshay Patil',
    members: ['Akshay Gosavi', 'Priyanka Shinde', 'Dhiraj Nimje', 'Sahil Singh', 'Umesh Menaria'],
  },
  {
    groupNumber: 2,
    teamNumber: 'TEAM-02',
    teamName: 'Pensieve',
    sihId: 'SIH26003',
    projectName: 'AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)',
    shortProjectName: 'Cognitive Gaming for Dementia Care',
    theme: 'MedTech / BioTech / HealthTech',
    category: 'Software',
    organization: 'Ministry of Development of North Eastern Region (MDoNER)',
    department: 'Ministry of Development of North Eastern Region (MDoNER)',
    teamLeader: 'Aarya Rahate',
    members: ['Vivin Poojary', 'Neel Joshi', 'Aditi Kulkarni', 'Shreya Gade', 'Zainab Bharmal'],
  },
  {
    groupNumber: 3,
    teamNumber: 'TEAM-03',
    teamName: 'Console.log',
    sihId: 'SIH26089',
    projectName: 'Cooperative Gig Services Platform for Household & Community Services',
    shortProjectName: 'Cooperative Gig Community Platform',
    theme: 'Agriculture, FoodTech & Rural Development',
    category: 'Software',
    organization: 'Ministry of Cooperation',
    department: 'National Council for Cooperative Training (NCCT)',
    teamLeader: 'Lipsa Lenka',
    members: ['Nancy Thakur', 'Shravani Hinge', 'Omkar Zad', 'Austin Agi Thoppil', 'Sajith Unnikrishnan'],
  },
  {
    groupNumber: 4,
    teamNumber: 'TEAM-04',
    teamName: 'Nexora',
    sihId: 'SIH26028',
    projectName: 'Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains',
    shortProjectName: 'Dynamic Train Arrival ETA Forecast',
    theme: 'Smart Automation',
    category: 'Software',
    organization: 'Ministry of Railways',
    department: 'Ministry of Railways',
    teamLeader: 'Vandit Shah',
    members: ['Hetvi Visaria', 'Kashyap Patil', 'Shashank Maheshwar', 'Kartik Pandey', 'Sayed Abdulaziz'],
  },
  {
    groupNumber: 5,
    teamNumber: 'TEAM-05',
    teamName: 'E20Squad',
    sihId: 'SIH26100',
    projectName: 'AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement',
    shortProjectName: 'GeM Procurement Bid Compliance AI',
    theme: 'Smart Automation',
    category: 'Software',
    organization: 'Ministry of Petroleum & Natural Gas',
    department: 'Chennai Petroleum Corporation Limited(CPCL)',
    teamLeader: 'Sahil Tambe',
    members: ['Amey Rane', 'Om Pandey', 'Harsh Gohil', 'Shruti Pawar', 'Yashashree Tasgaonkar'],
  },
  {
    groupNumber: 6,
    teamNumber: 'TEAM-06',
    teamName: 'Byte Brigade',
    sihId: 'SIH26034',
    projectName: 'Software System to check compliance of Packaged Commodities under Legal Metrology(Packaged Commodities) Rules, 2011 by scanning products, images and labels.',
    shortProjectName: 'Legal Metrology Compliance Scanner',
    theme: 'Miscellaneous',
    category: 'Software',
    organization: 'Ministry of Consumer Affairs, Food & Public Distribution',
    department: 'Department of Consumer Affairs (DoCA)',
    teamLeader: 'Saakshi Mishra',
    members: ['Lakchita Nadar', 'Aayesha Kaliwala', 'Shubham Kondhalkar', 'Mahesh Ghodake', 'Sujal Patil'],
  },
  {
    groupNumber: 7,
    teamNumber: 'TEAM-07',
    teamName: 'DragonFlys',
    sihId: 'SIH26136',
    projectName: 'Startup friendly public procurement mechanism that enables government departments to identify,pilot, procure,and scale innovative solutions from eligible startups',
    shortProjectName: 'Startup Public Procurement Mechanism',
    theme: 'Miscellaneous',
    category: 'Software',
    organization: 'Government Of Maharashtra',
    department: 'Maharashtra State Innovation Society, Department of Skills, Employment, Entrepreneurship and Innovation',
    teamLeader: 'Kaustubh Ghadshi',
    members: ['Zahabiya Tawawala', 'Palak Kadam', 'Piyush Nirmal', 'Ritesh Myakal', 'Sahil Shinde'],
  },
  {
    groupNumber: 8,
    teamNumber: 'TEAM-08',
    teamName: 'Binary Brains',
    sihId: 'SIH26151',
    projectName: 'Dark web threat actor de-anonymization',
    shortProjectName: 'Dark Web Threat De-Anonymization',
    theme: 'Blockchain & Cybersecurity',
    category: 'Software',
    organization: 'National Technical Research Organisation (NTRO)',
    department: 'National Technical Research Organisation (NTRO)',
    teamLeader: 'Aryan Dalvi',
    members: ['Shubham chavan', 'Mohammad Harnekar', 'Aaditi Mhatre', 'Alisha Zaidi', 'Vignesh Nair'],
  },
  {
    groupNumber: 9,
    teamNumber: 'TEAM-09',
    teamName: 'Aarambh',
    sihId: 'SIH26044',
    projectName: 'Portal for Academia - Industry collaboration for Skill Mapping, Internships and Placement',
    shortProjectName: 'Academia-Industry Placement Portal',
    theme: 'Smart Automation',
    category: 'Software',
    organization: 'Ministry of Ayush',
    department: 'All India Institute of Ayurveda',
    teamLeader: 'Nikhil Gupta',
    members: ['Shrawani Salaskar', 'Aman Singh', 'Sakshi Kalamkar', 'Suryansh', 'Sujal Duraphe'],
  },
  {
    groupNumber: 10,
    teamNumber: 'TEAM-10',
    teamName: 'Cheatcodes',
    sihId: 'SIH26033',
    projectName: 'Multiple intermediaries reduce farmers earnings and increase consumer prices.',
    shortProjectName: 'Direct Farmer Marketplace Platform',
    theme: 'Agriculture, FoodTech & Rural Development',
    category: 'Software',
    organization: 'Ministry of Consumer Affairs, Food & Public Distribution',
    department: 'Department of Consumer Affairs (DoCA)',
    teamLeader: 'Shardul Rajesh Patil',
    members: ['Gautam Maheshwary', 'Pranshu Dimri', 'Manan Sharma', 'Nidhi Gupta', 'Devna Srivastava'],
  },
  {
    groupNumber: 11,
    teamNumber: 'TEAM-11',
    teamName: 'Desi Developers',
    sihId: 'SIH26229',
    projectName: 'Kabadiwala Connect – Bringing the Informal Collector into the Formal Recycling Chain',
    shortProjectName: 'Kabadiwala Connect Recycling Network',
    theme: 'Clean & Green Technology',
    category: 'Software',
    organization: 'Ministry of Mines (MoM)',
    department: 'Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC)',
    teamLeader: 'Kashish Sanjay Maurya',
    members: ['Atharva Dattaram Shivdikar', 'Ashish Sanjay Gupta', 'Vaishnavi Sidramappa Uranna', 'Aaryan Rajesh Tibrewal', 'Alwin Mathew Alex'],
  },
  {
    groupNumber: 12,
    teamNumber: 'TEAM-12',
    teamName: 'Tacobytes',
    sihId: 'SIH26117',
    projectName: 'Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work',
    shortProjectName: 'Sovereign Agentic AI Workbench',
    theme: 'Smart Automation',
    category: 'Software',
    organization: 'Mangalore Refinery and Petrochemicals Limited (MRPL)',
    department: 'Mangalore Refinery and Petrochemicals Limited (MRPL)',
    teamLeader: 'Krishna Mahajan',
    members: ['Manhar Mishra', 'Joanna Mohapatra', 'Vimal Vijayan', 'Rutuja Patil', 'Uttkarsh Mishra'],
  },
  {
    groupNumber: 13,
    teamNumber: 'TEAM-13',
    teamName: 'ByteCoders',
    sihId: 'SIH26145',
    projectName: 'AI-Based Detection of Cyber Threats in Unidirectional IP Traffic',
    shortProjectName: 'Unidirectional IP Threat Detection',
    theme: 'Blockchain & Cybersecurity',
    category: 'Software',
    organization: 'National Technical Research Organisation (NTRO)',
    department: 'National Technical Research Organisation (NTRO)',
    teamLeader: 'Shubham Chaubey',
    members: ['Tanishka Bajaj', 'Khushi Shah', 'Sourav Sharma', 'Saish Patil', 'Sarvesh Konde'],
  },
  {
    groupNumber: 14,
    teamNumber: 'TEAM-14',
    teamName: 'First Row',
    sihId: 'SIH26176',
    projectName: 'ORCA Marine EcOsystem Reasoning with Collaborative Agents',
    shortProjectName: 'ORCA Marine Multi-Agent AI',
    theme: 'Space Technology',
    category: 'Software',
    organization: 'Indian Space Research Organisation(ISRO)',
    department: 'Department of Space / Indian Space Research Organisation',
    teamLeader: 'Abin Cheruvathoor',
    members: ['Abhiraj Paniker', 'Vaibhav Shetti', 'Akhil Nair', 'Isha Sapling', 'Mrunmayee Sivalkar'],
  },
  {
    groupNumber: 15,
    teamNumber: 'TEAM-15',
    teamName: 'DarKnight',
    sihId: 'SIH26043',
    projectName: 'A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships',
    shortProjectName: 'Collaborative Societal Challenge Platform',
    theme: 'Smart Education',
    category: 'Software',
    organization: 'Government of Jharkhand',
    department: 'Department of Higher & Technical Education',
    teamLeader: 'Aniket Salve',
    members: ['Aditi Gole', 'Srushti Mohite', 'Ekta Vaishnav', 'Ashish Saw', 'Omkar Sakpal'],
  },
  {
    groupNumber: 16,
    teamNumber: 'TEAM-16',
    teamName: 'HexaHack',
    sihId: 'SIH26016',
    projectName: 'Real-Time National Land Acquisition & Management System for End-to-End Digital Monitoring and Decision Support',
    shortProjectName: 'National Land Acquisition & Monitoring',
    theme: 'Smart Automation',
    category: 'Software',
    organization: 'Ministry of Rural Development',
    department: 'Dept of land resources (DoLR)',
    teamLeader: 'Dhruvi Jayesh Devalia',
    members: ['Hasti Atul Rambhia', 'Tanmay Pradeep Manjre', 'Rohit Vijay Pokharkar', 'Adarsh Divakar Shetty', 'Sakshi Santosh Thorat'],
  },
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadDatabase();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed.teams && parsed.teams.length === 16 && parsed.teams[0].judgement !== undefined) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse database file, reinitializing', err);
      }
    }
    return this.initDefaultData();
  }

  private saveDatabase() {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public initDefaultData(): DatabaseSchema {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const initialTeams: Team[] = REAL_16_TEAMS_METADATA.map((item, index) => {
      const id = `team-${(index + 1).toString().padStart(2, '0')}`;
      return {
        id,
        groupNumber: item.groupNumber,
        teamNumber: item.teamNumber,
        teamName: item.teamName,
        sihId: item.sihId,
        projectName: item.projectName,
        shortProjectName: item.shortProjectName,
        theme: item.theme,
        category: item.category,
        organization: item.organization,
        department: item.department,
        teamLeader: item.teamLeader,
        members: item.members,
        // INITIALIZE ALL SCORES TO EMPTY (NO DUMMY SCORES)
        judgement: {
          round1: null,
          round2: null,
          round3: null,
          finalAverage: null,
          isFinalized: false,
          status: 'NOT_STARTED',
        },
        roundScores: [],
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const defaultSchema: DatabaseSchema = {
      teams: initialTeams,
      eventStatus: 'LIVE',
      roundConfig: {
        round1Max: 100,
        round2Max: 100,
        round3Max: 100,
      },
      revealSession: {
        isActive: false,
        status: 'LOCKED',
        currentRank: 5,
        subStep: 'rank',
        countdownValue: 3,
      },
      lastUpdated: new Date().toISOString(),
      adminUsers: [
        {
          id: 'admin-01',
          email: 'admin@somaiya.edu',
          passwordHash,
          name: 'Somaiya SIH Administrator',
          role: 'superadmin'
        },
        {
          id: 'admin-02',
          email: 'judge@somaiya.edu',
          passwordHash,
          name: 'Chief Jury Panel',
          role: 'judge'
        }
      ],
      previousRanks: {},
    };

    const ranked = this.calculateRankings(defaultSchema.teams);
    ranked.forEach((t) => {
      defaultSchema.previousRanks[t.id] = t.rank;
    });

    this.data = defaultSchema;
    this.saveDatabase();
    return defaultSchema;
  }

  /**
   * Deterministic Tie Breaking logic:
   * 1. Final Average DESC (Only teams with calculated final averages are ranked first)
   * 2. Higher Round 3 score DESC
   * 3. Higher Round 2 score DESC
   * 4. Higher Round 1 score DESC
   * 5. Earlier finalization timestamp ASC
   */
  private calculateRankings(teams: Team[]): RankedTeam[] {
    const scoredTeams = teams.filter((t) => t.judgement.finalAverage !== null && t.judgement.finalAverage > 0);
    const unscoredTeams = teams.filter((t) => t.judgement.finalAverage === null || t.judgement.finalAverage === 0);

    scoredTeams.sort((a, b) => {
      const avgA = a.judgement.finalAverage!;
      const avgB = b.judgement.finalAverage!;

      // 1. Final average descending
      if (avgB !== avgA) {
        return avgB - avgA;
      }

      // 2. Higher Round 3 score
      const r3A = a.judgement.round3 ?? 0;
      const r3B = b.judgement.round3 ?? 0;
      if (r3B !== r3A) return r3B - r3A;

      // 3. Higher Round 2 score
      const r2A = a.judgement.round2 ?? 0;
      const r2B = b.judgement.round2 ?? 0;
      if (r2B !== r2A) return r2B - r2A;

      // 4. Higher Round 1 score
      const r1A = a.judgement.round1 ?? 0;
      const r1B = b.judgement.round1 ?? 0;
      if (r1B !== r1A) return r1B - r1A;

      // 5. Earlier finalization time
      const timeA = a.judgement.finalizedAt ? new Date(a.judgement.finalizedAt).getTime() : 0;
      const timeB = b.judgement.finalizedAt ? new Date(b.judgement.finalizedAt).getTime() : 0;
      return timeA - timeB;
    });

    // Unscored teams sorted by group number
    unscoredTeams.sort((a, b) => a.groupNumber - b.groupNumber);

    const allOrdered = [...scoredTeams, ...unscoredTeams];
    const top5Cutoff = scoredTeams.length >= 5
      ? scoredTeams[4].judgement.finalAverage!
      : (scoredTeams[scoredTeams.length - 1]?.judgement.finalAverage || 0);

    return allOrdered.map((team, idx) => {
      const rank = idx + 1;
      const prevRank = this.data?.previousRanks?.[team.id] ?? rank;
      const rankDelta = prevRank - rank;

      let scoreDiffAbove = 0;
      if (idx > 0 && team.judgement.finalAverage && allOrdered[idx - 1].judgement.finalAverage) {
        scoreDiffAbove = Number(
          (allOrdered[idx - 1].judgement.finalAverage! - team.judgement.finalAverage).toFixed(2)
        );
      }

      let scoreDiffTop5 = 0;
      if (rank > 5 && team.judgement.finalAverage && top5Cutoff > 0) {
        scoreDiffTop5 = Number((top5Cutoff - team.judgement.finalAverage).toFixed(2));
      }

      return {
        ...team,
        rank,
        previousRank: prevRank,
        rankDelta,
        scoreDiffAbove,
        scoreDiffTop5,
        isTop5: rank <= 5 && team.judgement.finalAverage !== null,
      };
    });
  }

  public getLeaderboard(): LeaderboardData {
    const rankedTeams = this.calculateRankings(this.data.teams);
    const scoredTeams = rankedTeams.filter((t) => t.judgement.finalAverage !== null && t.judgement.finalAverage > 0);
    const r1Count = rankedTeams.filter((t) => t.judgement.round1 !== null).length;
    const r2Count = rankedTeams.filter((t) => t.judgement.round2 !== null).length;
    const r3Count = rankedTeams.filter((t) => t.judgement.round3 !== null).length;
    const finalizedCount = rankedTeams.filter((t) => t.judgement.isFinalized).length;

    const totalSum = scoredTeams.reduce((sum, t) => sum + (t.judgement.finalAverage || 0), 0);
    const cohortAverage = scoredTeams.length > 0 ? Number((totalSum / scoredTeams.length).toFixed(2)) : 0;
    const highestAverage = scoredTeams.length > 0 ? scoredTeams[0].judgement.finalAverage! : 0;
    const top5Cutoff = scoredTeams.length >= 5 ? scoredTeams[4].judgement.finalAverage! : 0;

    return {
      teams: rankedTeams,
      eventStatus: this.data.eventStatus,
      roundConfig: this.data.roundConfig,
      revealSession: this.data.revealSession,
      lastUpdated: this.data.lastUpdated,
      stats: {
        totalTeams: this.data.teams.length,
        r1Count,
        r2Count,
        r3Count,
        finalizedCount,
        highestAverage,
        cohortAverage,
        top5Cutoff,
      },
    };
  }

  public getTeamById(id: string): RankedTeam | null {
    const leaderboard = this.getLeaderboard();
    return leaderboard.teams.find((t) =>
      t.id === id ||
      t.teamNumber.toLowerCase() === id.toLowerCase() ||
      t.sihId.toLowerCase() === id.toLowerCase()
    ) || null;
  }

  public addTeam(teamData: {
    teamNumber: string;
    teamName: string;
    sihId: string;
    projectName: string;
    shortProjectName?: string;
    theme: string;
    teamLeader: string;
    department?: string;
    members?: string[];
  }): RankedTeam {
    const id = `team-${(this.data.teams.length + 1).toString().padStart(2, '0')}`;
    const newTeam: Team = {
      id,
      groupNumber: this.data.teams.length + 1,
      teamNumber: teamData.teamNumber,
      teamName: teamData.teamName,
      sihId: teamData.sihId,
      projectName: teamData.projectName,
      shortProjectName: teamData.shortProjectName || teamData.projectName.slice(0, 45),
      theme: teamData.theme,
      teamLeader: teamData.teamLeader,
      department: teamData.department || 'KJ Somaiya Institute of Management',
      members: teamData.members || [teamData.teamLeader],
      judgement: {
        round1: null,
        round2: null,
        round3: null,
        finalAverage: null,
        isFinalized: false,
        status: 'NOT_STARTED',
      },
      roundScores: [],
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.teams.push(newTeam);
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.getTeamById(id)!;
  }

  public updateTeam(id: string, updates: Partial<Team>): RankedTeam | null {
    const team = this.data.teams.find((t) => t.id === id);
    if (!team) return null;
    Object.assign(team, updates, { updatedAt: new Date().toISOString() });
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.getTeamById(id);
  }

  public deleteTeam(id: string): boolean {
    const initialLen = this.data.teams.length;
    this.data.teams = this.data.teams.filter((t) => t.id !== id);
    if (this.data.teams.length !== initialLen) {
      this.data.lastUpdated = new Date().toISOString();
      this.saveDatabase();
      return true;
    }
    return false;
  }

  /**
   * Submit or update an individual round score (1, 2, or 3)
   */
  public submitRoundScore(
    teamId: string,
    roundNumber: 1 | 2 | 3,
    score: number,
    judgeName: string = 'Authorized Judge'
  ): { team: RankedTeam; oldRoundScore: number | null; newRoundScore: number } | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    this.snapshotCurrentRanks();

    // Determine max for this round
    const maxScore =
      roundNumber === 1
        ? this.data.roundConfig.round1Max
        : roundNumber === 2
        ? this.data.roundConfig.round2Max
        : this.data.roundConfig.round3Max;

    // Validate score is numeric and between 0 and maxScore
    const validScore = Math.max(0, Math.min(maxScore, Number(Number(score).toFixed(2))));

    const roundKey = `round${roundNumber}` as 'round1' | 'round2' | 'round3';
    const oldScore = team.judgement[roundKey];

    team.judgement[roundKey] = validScore;

    // Record in roundScores array
    const existingIndex = team.roundScores.findIndex((r) => r.roundNumber === roundNumber);
    const record: RoundScore = {
      roundNumber,
      score: validScore,
      maxScore,
      submittedAt: new Date().toISOString(),
      submittedBy: judgeName,
    };

    if (existingIndex >= 0) {
      team.roundScores[existingIndex] = record;
    } else {
      team.roundScores.push(record);
    }

    // Check completion of all 3 rounds:
    const r1 = team.judgement.round1;
    const r2 = team.judgement.round2;
    const r3 = team.judgement.round3;

    if (r1 !== null || r2 !== null || r3 !== null) {
      const scoredRounds = [r1, r2, r3].filter((r) => r !== null) as number[];
      const sum = scoredRounds.reduce((a, b) => a + b, 0);
      team.judgement.finalAverage = Number((sum / scoredRounds.length).toFixed(2));
      
      if (scoredRounds.length === 3 && !team.judgement.isFinalized) {
        team.judgement.status = 'READY';
      } else if (scoredRounds.length < 3) {
        if (r3 !== null) team.judgement.status = 'R3_COMPLETE';
        else if (r2 !== null) team.judgement.status = 'R2_COMPLETE';
        else if (r1 !== null) team.judgement.status = 'R1_COMPLETE';
      }
    } else {
      team.judgement.finalAverage = null;
      team.judgement.status = 'NOT_STARTED';
    }

    // Append to score history audit trail
    if (!team.history) team.history = [];
    team.history.unshift({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      teamId,
      roundNumber,
      action: 'ROUND_SUBMIT',
      previousScore: oldScore,
      newScore: validScore,
      timestamp: new Date().toISOString(),
      updatedBy: judgeName,
      changeNote: `Round ${roundNumber} score saved: ${validScore} / ${maxScore}`,
    });

    team.updatedAt = new Date().toISOString();
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();

    const rankedTeam = this.getTeamById(teamId)!;
    return {
      team: rankedTeam,
      oldRoundScore: oldScore,
      newRoundScore: validScore,
    };
  }

  /**
   * Save all scores for a team simultaneously (Round 1, 2, 3) in one atomic transaction
   */
  public saveTeamRoundScores(
    teamId: string,
    scores: {
      round1?: number | null;
      round2?: number | null;
      round3?: number | null;
    },
    judgeName: string = 'Authorized Judge'
  ): RankedTeam | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    this.snapshotCurrentRanks();

    const rounds = [1, 2, 3] as const;
    rounds.forEach((rNum) => {
      const key = `round${rNum}` as 'round1' | 'round2' | 'round3';
      if (scores[key] !== undefined) {
        const val = scores[key];
        const maxScore =
          rNum === 1
            ? this.data.roundConfig.round1Max
            : rNum === 2
            ? this.data.roundConfig.round2Max
            : this.data.roundConfig.round3Max;

        const validScore =
          val === null || val === undefined || isNaN(Number(val))
            ? null
            : Math.max(0, Math.min(maxScore, Number(Number(val).toFixed(2))));

        const oldScore = team.judgement[key];
        team.judgement[key] = validScore;

        if (validScore !== null) {
          const existingIndex = team.roundScores.findIndex((r) => r.roundNumber === rNum);
          const record: RoundScore = {
            roundNumber: rNum,
            score: validScore,
            maxScore,
            submittedAt: new Date().toISOString(),
            submittedBy: judgeName,
          };
          if (existingIndex >= 0) {
            team.roundScores[existingIndex] = record;
          } else {
            team.roundScores.push(record);
          }
        } else {
          team.roundScores = team.roundScores.filter((r) => r.roundNumber !== rNum);
        }

        if (oldScore !== validScore) {
          if (!team.history) team.history = [];
          team.history.unshift({
            id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            teamId,
            roundNumber: rNum,
            action: 'ROUND_SUBMIT',
            previousScore: oldScore,
            newScore: validScore ?? 0,
            timestamp: new Date().toISOString(),
            updatedBy: judgeName,
            changeNote: `Round ${rNum} updated: ${validScore !== null ? validScore : 'cleared'} / ${maxScore}`,
          });
        }
      }
    });

    const r1 = team.judgement.round1;
    const r2 = team.judgement.round2;
    const r3 = team.judgement.round3;

    if (r1 !== null || r2 !== null || r3 !== null) {
      const scoredRounds = [r1, r2, r3].filter((r) => r !== null) as number[];
      const sum = scoredRounds.reduce((a, b) => a + b, 0);
      team.judgement.finalAverage = Number((sum / scoredRounds.length).toFixed(2));
      
      if (scoredRounds.length === 3 && !team.judgement.isFinalized) {
        team.judgement.status = 'READY';
      } else if (scoredRounds.length < 3) {
        if (r3 !== null) team.judgement.status = 'R3_COMPLETE';
        else if (r2 !== null) team.judgement.status = 'R2_COMPLETE';
        else if (r1 !== null) team.judgement.status = 'R1_COMPLETE';
        team.judgement.isFinalized = false;
      }
    } else {
      team.judgement.finalAverage = null;
      team.judgement.status = 'NOT_STARTED';
      team.judgement.isFinalized = false;
    }

    team.updatedAt = new Date().toISOString();
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();

    return this.getTeamById(teamId);
  }

  /**
   * Finalize team result after all 3 rounds are submitted
   */
  public finalizeTeam(
    teamId: string,
    adminName: string = 'Administrator'
  ): RankedTeam | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    if (
      team.judgement.round1 === null ||
      team.judgement.round2 === null ||
      team.judgement.round3 === null ||
      team.judgement.finalAverage === null
    ) {
      throw new Error('All 3 rounds must be submitted before final result can be saved.');
    }

    this.snapshotCurrentRanks();

    const now = new Date().toISOString();
    team.judgement.isFinalized = true;
    team.judgement.status = 'FINALIZED';
    team.judgement.finalizedAt = now;
    team.judgement.finalizedBy = adminName;
    team.updatedAt = now;

    if (!team.history) team.history = [];
    team.history.unshift({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      teamId,
      action: 'FINALIZED',
      previousScore: null,
      newScore: team.judgement.finalAverage,
      timestamp: now,
      updatedBy: adminName,
      changeNote: `Final Result Locked: Average ${team.judgement.finalAverage}`,
    });

    this.data.lastUpdated = now;
    this.saveDatabase();

    return this.getTeamById(teamId);
  }

  /**
   * Update round configuration (maximum scores)
   */
  public updateRoundConfig(config: Partial<RoundConfig>): RoundConfig {
    this.data.roundConfig = {
      round1Max: Number(config.round1Max) || this.data.roundConfig.round1Max,
      round2Max: Number(config.round2Max) || this.data.roundConfig.round2Max,
      round3Max: Number(config.round3Max) || this.data.roundConfig.round3Max,
    };
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.data.roundConfig;
  }

  /**
   * Reveal Session Control
   */
  public startReveal(): RevealSession {
    this.data.revealSession = {
      isActive: true,
      status: 'COUNTDOWN',
      currentRank: 5,
      subStep: 'rank',
      countdownValue: 3,
      startedAt: new Date().toISOString(),
    };
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.data.revealSession;
  }

  public setRevealStep(
    currentRank: 5 | 4 | 3 | 2 | 1 | 0,
    subStep: 'rank' | 'countdown' | 'project' | 'team' | 'leader' | 'score' | 'hold',
    countdownValue: number = 3,
    status: 'LOCKED' | 'COUNTDOWN' | 'REVEALING' | 'WINNER_SUSPENSE' | 'FINALE' = 'REVEALING'
  ): RevealSession {
    this.data.revealSession = {
      isActive: true,
      status,
      currentRank,
      subStep,
      countdownValue,
      startedAt: this.data.revealSession.startedAt || new Date().toISOString(),
      completedAt: currentRank === 0 ? new Date().toISOString() : undefined,
    };
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.data.revealSession;
  }

  public resetReveal(): RevealSession {
    this.data.revealSession = {
      isActive: false,
      status: 'LOCKED',
      currentRank: 5,
      subStep: 'rank',
      countdownValue: 3,
    };
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.data.revealSession;
  }

  /**
   * Reset all scores to empty (preserves all 16 real teams!)
   */
  public resetScoresToEmpty(): LeaderboardData {
    this.snapshotCurrentRanks();
    this.data.teams.forEach((t) => {
      t.judgement = {
        round1: null,
        round2: null,
        round3: null,
        finalAverage: null,
        isFinalized: false,
        status: 'NOT_STARTED',
      };
      t.roundScores = [];
      t.history = [];
      t.updatedAt = new Date().toISOString();
    });
    this.resetReveal();
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.getLeaderboard();
  }

  public setEventStatus(status: EventState): EventState {
    this.data.eventStatus = status;
    this.data.lastUpdated = new Date().toISOString();
    this.saveDatabase();
    return this.data.eventStatus;
  }

  public getAdminUser(email: string): AdminUser | null {
    return this.data.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  private snapshotCurrentRanks() {
    const currentRanks = this.calculateRankings(this.data.teams);
    this.data.previousRanks = {};
    currentRanks.forEach((t) => {
      this.data.previousRanks[t.id] = t.rank;
    });
  }

  public generateCSV(): string {
    const leaderboard = this.getLeaderboard();
    const headers = [
      'Rank',
      'Team Number',
      'Team Name',
      'SIH ID',
      'Project Title',
      'Theme',
      'Team Leader',
      `Round 1 (/${this.data.roundConfig.round1Max})`,
      `Round 2 (/${this.data.roundConfig.round2Max})`,
      `Round 3 (/${this.data.roundConfig.round3Max})`,
      'Final Average',
      'Status',
      'Finalized At',
    ];

    const rows = leaderboard.teams.map((t) => [
      t.rank,
      `"${t.teamNumber.replace(/"/g, '""')}"`,
      `"${t.teamName.replace(/"/g, '""')}"`,
      `"${t.sihId.replace(/"/g, '""')}"`,
      `"${t.projectName.replace(/"/g, '""')}"`,
      `"${t.theme.replace(/"/g, '""')}"`,
      `"${t.teamLeader.replace(/"/g, '""')}"`,
      t.judgement.round1 !== null ? t.judgement.round1 : '—',
      t.judgement.round2 !== null ? t.judgement.round2 : '—',
      t.judgement.round3 !== null ? t.judgement.round3 : '—',
      t.judgement.finalAverage !== null ? t.judgement.finalAverage : 'Not Scored',
      t.judgement.status,
      t.judgement.finalizedAt ? new Date(t.judgement.finalizedAt).toLocaleString() : '—',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const db = new DatabaseService();
