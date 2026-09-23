# SIH 2026 — K J Somaiya Internal Hackathon Live Leaderboard

A complete, production-grade real-time web application built for the **internal Smart India Hackathon (SIH) 2026 selection event at K J Somaiya Institute of Management (Somaiya Vidyavihar University)**.

---

## 🌟 Highlights & Features

1. **K J Somaiya Institutional Identity**:
   - Somaiya Red accents (`#A01C24`), crisp white backgrounds, subtle charcoal typography, and glassmorphic cards.
   - Official-styled branding for K J Somaiya Institute of Management & SIH 2026.
   - Structured asset folders in `/public/assets/branding/`, `/public/assets/images/`, `/public/assets/gifs/`, and `/public/assets/3d/`.

2. **Cinematic 3D Loading / Intro Sequence**:
   - 3D particle canvas with glowing red lines, perspective grid, and rotating geometric elements.
   - Dynamic sequence: *K J Somaiya Institute of Management* → *Internal Hackathon* → *SIH 2026* → *LIVE LEADERBOARD*.
   - Includes a quick **Skip Intro** button and session memory.

3. **Interactive 3D Top 5 Podium**:
   - Centerpiece elevated 3D stage rendered via Three.js with ambient lighting, red spotlights, and reflective pedestals.
   - Center-elevated Rank #1 with golden-red accents, flanked by Rank #2 and #3, followed by Rank #4 and #5.
   - Dynamic numerical counter animation, progress bars, and rank movement badges (`↑ +2`, `↓ -1`, `•`).

4. **"Find Your Team" Quick Lookup**:
   - Instant search across Team Name, Team Number, and Project Title.
   - Prominent **YOUR CURRENT POSITION** card displaying points needed to overtake the team above and points needed to qualify for the Top 5.

5. **Full Roster Table & Mobile Cards**:
   - Comprehensive standings with deterministic tie handling (*Innovation > Technical Implementation > Earlier Timestamp*).
   - Alternating subtle rows with live point differentials.
   - Automatically adapts into mobile touch cards on smaller screens.

6. **Score Breakdown Modal**:
   - Detailed breakdown across 5 criteria (Max 20 each, total 100):
     - Innovation & Novelty
     - Technical Implementation
     - Feasibility & Scalability
     - Impact & Social Value
     - Presentation & Q&A Defense
   - Full jury feedback notes and chronological revision timeline.

7. **Protected Admin & Judge Panel (`/admin`)**:
   - Secure login with JWT authentication and bcrypt password hashing.
   - Live hackathon metrics: Total Teams, Scored Count, Cohort Average, Highest Score, Cutoff Score.
   - **Judge Scorecard**: Rapid team selector, interactive criteria sliders/steppers, projected rank preview, and one-click live broadcast.
   - **Team Management**: Add, Edit, and Delete teams with modal confirmation.
   - **Event Status Control**: Switch between `LIVE`, `PAUSED`, and `FINAL`.
   - **Score History / Audit Log**: Detailed chronological log of score revisions and judge names.
   - **Export CSV**: One-click download of the complete leaderboard with criteria breakdown.
   - **Reset Demo Data**: One-click restore to 20 realistic student teams.

8. **Zero-Lag Real-Time Synchronization**:
   - Socket.IO WebSockets broadcast changes immediately to all connected spectator screens.
   - Changes trigger smooth rank reordering, glowing highlights, Web Audio API pleasant score chimes, and live toast banners without any page refresh.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Both Server & Client
```bash
npm run dev
```

- **Frontend Leaderboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets**: [http://localhost:5001](http://localhost:5001)
- **Admin Panel**: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 🔑 Default Admin Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin / Jury Chair** | `admin@somaiya.edu` | `admin123` |
| **Jury Member** | `judge@somaiya.edu` | `admin123` |

---

## 📁 Project Structure

```
agitated-volta/
├── client/
│   ├── public/
│   │   └── assets/
│   │       ├── branding/       # Official Somaiya & SIH logos (.svg & .png)
│   │       ├── images/         # Event photos
│   │       ├── gifs/           # Reaction GIFs
│   │       └── 3d/             # 3D models & textures
│   └── src/
│       ├── components/
│       │   ├── admin/          # Admin Dashboard, Scorecard, Team Manager, Audit Log
│       │   ├── background/     # Subtle 3D background canvas
│       │   ├── common/         # Header, Hero, LiveScoreToast
│       │   ├── intro/          # Cinematic 3D Loading Screen
│       │   ├── podium/         # Three.js 3D Podium Stage & Top 5 Cards
│       │   └── teams/          # FindMyTeam, AllTeamsTable, TeamModal
│       ├── context/            # AuthContext & LeaderboardContext (Socket.IO)
│       ├── types/              # TypeScript interface definitions
│       └── utils/              # Web Audio API sound synthesizer
├── server/
│   ├── data/                   # Atomic persistent JSON database
│   └── src/
│       ├── db.ts               # Database service, tie-breaker logic & 20 demo teams
│       ├── index.ts            # Express server & Socket.IO real-time engine
│       └── types.ts            # Server data contracts
└── scripts/
    ├── generate-assets.js      # Asset generation script
    └── verify-workflow.js      # End-to-end automated verification script
```
