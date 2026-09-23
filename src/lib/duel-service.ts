import { getCurrentUser } from "./auth";
import {
  problems,
  problemDetails,
  type Difficulty,
  type Problem,
  type ProblemDetail,
  type ProblemTestCase,
} from "./problems-data";

export interface DuelPlayer {
  id: string;
  username: string;
  rating: number;
  avatar?: string;
  isReady: boolean;
  progress: number; // test cases passed
  totalTestCases: number;
  language: string;
  status: "idle" | "coding" | "testing" | "submitted";
  verdict?: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error";
  isWinner?: boolean;
  finishedAt?: number;
}

export type DuelMode = "pvp" | "bot";
export type BotDifficulty = "Easy" | "Medium" | "Hard";

export interface DuelRoom {
  roomId: string;
  roomCode: string;
  mode: DuelMode;
  difficulty: Difficulty | "Any";
  durationMinutes: number;
  problem: Problem & ProblemDetail;
  status: "waiting" | "countdown" | "in_progress" | "finished";
  startTime?: number;
  endTime?: number;
  winnerId?: string;
  players: Record<string, DuelPlayer>;
  logs: DuelActivityLog[];
}

export interface DuelActivityLog {
  id: string;
  timestamp: number;
  sender: string;
  message: string;
  type: "info" | "progress" | "alert" | "victory";
}

export interface UserDuelStats {
  rating: number;
  rank: "Bronze" | "Silver" | "Gold" | "Platinum" | "Grandmaster";
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  totalMatches: number;
}

const STATS_KEY = "codearena_duel_stats";
const DUEL_CHANNEL_NAME = "codearena_duel_channel";

// Helper to get or init user duel stats
export function getUserDuelStats(): UserDuelStats {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return {
      rating: 1200,
      rank: "Bronze",
      wins: 0,
      losses: 0,
      draws: 0,
      streak: 0,
      bestStreak: 0,
      totalMatches: 0,
    };
  }

  const raw = localStorage.getItem(STATS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }

  const initialStats: UserDuelStats = {
    rating: 1200,
    rank: "Bronze",
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    bestStreak: 0,
    totalMatches: 0,
  };
  saveUserDuelStats(initialStats);
  return initialStats;
}

export function saveUserDuelStats(stats: UserDuelStats) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  stats.rank = calculateRank(stats.rating);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function calculateRank(rating: number): UserDuelStats["rank"] {
  if (rating >= 1900) return "Grandmaster";
  if (rating >= 1650) return "Platinum";
  if (rating >= 1450) return "Gold";
  if (rating >= 1300) return "Silver";
  return "Bronze";
}

export function calculateRatingDelta(playerRating: number, opponentRating: number, won: boolean): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const actualScore = won ? 1 : 0;
  const kFactor = 32;
  const delta = Math.round(kFactor * (actualScore - expectedScore));
  return won ? Math.max(15, delta) : Math.min(-10, delta);
}

// Generate unique 6-char room code like 'DUEL-4821'
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DUEL-${result}`;
}

export function getRandomProblem(difficulty?: Difficulty | "Any"): Problem & ProblemDetail {
  let pool = problems;
  if (difficulty && difficulty !== "Any") {
    pool = problems.filter((p) => p.difficulty === difficulty);
  }
  if (!pool.length) pool = problems;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const detail = problemDetails[chosen.id] || problemDetails[1];

  return {
    ...chosen,
    description: detail.description,
    examples: detail.examples,
    constraints: detail.constraints,
    testCases: detail.testCases,
    starterCode: detail.starterCode,
    hints: detail.hints,
  };
}

export function createLocalPlayer(overrideName?: string): DuelPlayer {
  const user = getCurrentUser();
  const stats = getUserDuelStats();
  const username = overrideName || user?.username || `Coder_${Math.floor(1000 + Math.random() * 9000)}`;

  let id = "";
  if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
    id = sessionStorage.getItem("codearena_player_id") || "";
    if (!id) {
      id = `player_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("codearena_player_id", id);
    }
  } else {
    id = `player_${Math.random().toString(36).substring(2, 9)}`;
  }

  return {
    id,
    username,
    rating: stats.rating,
    isReady: false,
    progress: 0,
    totalTestCases: 4,
    language: "python",
    status: "idle",
  };
}

export function createBotOpponent(difficulty: BotDifficulty, totalTests: number): DuelPlayer {
  const botNames: Record<BotDifficulty, string[]> = {
    Easy: ["AlgoNovice [Bot]", "ByteBuddy [Bot]", "PawnCoder [Bot]"],
    Medium: ["AlgoWarrior [Bot]", "StackNinja [Bot]", "MatrixRacer [Bot]"],
    Hard: ["GrandmasterBot [AI]", "TuringTitan [AI]", "QuantumCoder [AI]"],
  };

  const ratings: Record<BotDifficulty, number> = {
    Easy: 1150,
    Medium: 1420,
    Hard: 1780,
  };

  const names = botNames[difficulty];
  const username = names[Math.floor(Math.random() * names.length)];

  return {
    id: `bot_${Math.random().toString(36).substring(2, 7)}`,
    username,
    rating: ratings[difficulty] + Math.floor(Math.random() * 50 - 25),
    isReady: true,
    progress: 0,
    totalTestCases: totalTests,
    language: ["python", "cpp", "javascript"][Math.floor(Math.random() * 3)],
    status: "coding",
  };
}

// Cross-tab BroadcastChannel communication bridge
export class DuelChannel {
  private channel: BroadcastChannel | null = null;
  private onMessageCallback: ((event: any) => void) | null = null;

  constructor(onMessage: (event: any) => void) {
    this.onMessageCallback = onMessage;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(DUEL_CHANNEL_NAME);
      this.channel.onmessage = (ev) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(ev.data);
        }
      };
    }

    // Storage fallback for broader browser coverage
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === "codearena_duel_event_bus" && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (this.onMessageCallback) {
          this.onMessageCallback(payload);
        }
      } catch {
        // ignore
      }
    }
  };

  public post(message: any) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
    // write to storage fallback
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(
        "codearena_duel_event_bus",
        JSON.stringify({ ...message, _ts: Date.now() })
      );
    }
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent);
    }
  }
}

// In-browser mock testcase evaluator
export function evaluateTestCases(
  code: string,
  language: string,
  testCases: ProblemTestCase[]
): {
  passed: number;
  total: number;
  results: { input: string; expected: string; actual: string; passed: boolean }[];
  allPassed: boolean;
} {
  const total = testCases.length || 1;
  const results: { input: string; expected: string; actual: string; passed: boolean }[] = [];

  const trimmed = code.trim();
  if (!trimmed) {
    return {
      passed: 0,
      total,
      results: testCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected_output,
        actual: "No code provided",
        passed: false,
      })),
      allPassed: false,
    };
  }

  // Quick heuristic / syntax checking
  // If JavaScript, we can test safely or simulate outputs
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let isPassed = false;
    let actualOutput = "";

    try {
      if (language === "javascript") {
        // Safe evaluation simulation for common test cases
        if (trimmed.includes("return") || trimmed.includes("console.log")) {
          // If code looks like a solution attempt
          isPassed = Math.random() > 0.15; // 85% success for sensible code in quick demo
        } else {
          isPassed = false;
        }
      } else {
        // Python / C++ / Java
        // Count code complexity / tokens
        const hasCoreLoops = trimmed.includes("for") || trimmed.includes("while") || trimmed.includes("if");
        const hasLogic = trimmed.length > 50;
        isPassed = hasCoreLoops && hasLogic;
      }
    } catch {
      isPassed = false;
    }

    // Deterministic simulation based on code length & keywords
    const hash = (trimmed.length * 31 + i * 17) % 10;
    if (trimmed.length > 60 && hash > 1) {
      isPassed = true;
    }

    if (isPassed) {
      actualOutput = tc.expected_output;
      passedCount++;
    } else {
      actualOutput = `Output mismatch: received "${tc.expected_output.slice(0, 1)}..."`;
    }

    results.push({
      input: tc.input,
      expected: tc.expected_output,
      actual: actualOutput,
      passed: isPassed,
    });
  }

  return {
    passed: passedCount,
    total,
    results,
    allPassed: passedCount === total,
  };
}
