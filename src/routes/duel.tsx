import Editor from "@monaco-editor/react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Flame,
  Play,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateRatingDelta,
  createBotOpponent,
  createLocalPlayer,
  DuelChannel,
  evaluateTestCases,
  generateRoomCode,
  getRandomProblem,
  getUserDuelStats,
  saveUserDuelStats,
  type BotDifficulty,
  type DuelActivityLog,
  type DuelMode,
  type DuelPlayer,
  type DuelRoom,
  type UserDuelStats,
} from "@/lib/duel-service";
import type { Difficulty } from "@/lib/problems-data";

export const Route = createFileRoute("/duel")({
  head: () => ({
    meta: [
      { title: "1v1 Code Duel - CodeArena" },
      { name: "description", content: "Real-time competitive head-to-head coding battles." },
    ],
  }),
  component: DuelPage,
});

type Lang = "python" | "javascript" | "cpp" | "java";

const languageLabels: Record<Lang, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
};

const monacoLang: Record<Lang, string> = {
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
  java: "java",
};

const rankBadgeColors: Record<UserDuelStats["rank"], string> = {
  Bronze: "border-amber-700/40 bg-amber-700/10 text-amber-500",
  Silver: "border-slate-400/40 bg-slate-400/10 text-slate-300",
  Gold: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
  Platinum: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  Grandmaster: "border-red-500/40 bg-red-500/10 text-red-400",
};

function formatTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DuelPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { room?: string };
  const user = getCurrentUser();

  // User Stats
  const [stats, setStats] = useState<UserDuelStats>(getUserDuelStats());
  const [localPlayer, setLocalPlayer] = useState<DuelPlayer>(() => createLocalPlayer());

  // Lobby State
  const [isSearchingQueue, setIsSearchingQueue] = useState(false);
  const [queueElapsed, setQueueElapsed] = useState(0);
  const [roomInput, setRoomInput] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "Any">("Any");
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [botLevel, setBotLevel] = useState<BotDifficulty>("Medium");
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Duel State
  const [room, setRoom] = useState<DuelRoom | null>(null);
  const [language, setLanguage] = useState<Lang>("python");
  const [code, setCode] = useState<string>("");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [lastVerdict, setLastVerdict] = useState<string>("");
  const [matchResultModal, setMatchResultModal] = useState<{
    won: boolean;
    ratingDelta: number;
    reason: string;
  } | null>(null);

  // Channel & Audio
  const channelRef = useRef<DuelChannel | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const botIntervalRef = useRef<number | null>(null);

  // Sync user stats
  useEffect(() => {
    setStats(getUserDuelStats());
  }, []);

  // Initialize Duel BroadcastChannel
  useEffect(() => {
    const channel = new DuelChannel((msg) => {
      handleIncomingChannelMessage(msg);
    });
    channelRef.current = channel;

    return () => {
      channel.destroy();
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      if (botIntervalRef.current) window.clearInterval(botIntervalRef.current);
    };
  }, [room, localPlayer.id]);

  // Handle URL room param on mount
  useEffect(() => {
    if (search.room && !room) {
      joinRoomByCode(search.room);
    }
  }, [search.room]);

  // Handle cross-tab incoming events
  const handleIncomingChannelMessage = (msg: any) => {
    if (!msg || !msg.type) return;

    if (msg.type === "JOIN_ROOM_REQUEST" && room && room.roomCode === msg.roomCode) {
      // Host receives a join request from a second player
      if (msg.player.id === localPlayer.id) return;

      const updatedPlayers = {
        ...room.players,
        [msg.player.id]: msg.player,
      };

      const newLog: DuelActivityLog = {
        id: Math.random().toString(),
        timestamp: Date.now(),
        sender: msg.player.username,
        message: `${msg.player.username} (${msg.player.rating} ELO) joined the room!`,
        type: "info",
      };

      const updatedRoom: DuelRoom = {
        ...room,
        players: updatedPlayers,
        status: "in_progress",
        startTime: Date.now(),
        endTime: Date.now() + room.durationMinutes * 60 * 1000,
        logs: [newLog, ...room.logs],
      };

      setRoom(updatedRoom);

      // Broadcast room state back to the joining player
      channelRef.current?.post({
        type: "ROOM_STATE_SYNC",
        room: updatedRoom,
      });

      startMatchCountdown(updatedRoom.durationMinutes * 60);
    }

    if (msg.type === "ROOM_STATE_SYNC" && (!room || room.roomCode === msg.room.roomCode)) {
      setRoom(msg.room);
      setRemainingSeconds(msg.room.durationMinutes * 60);
      startMatchCountdown(msg.room.durationMinutes * 60);
    }

    if (msg.type === "OPPONENT_PROGRESS" && room && msg.roomCode === room.roomCode) {
      if (msg.playerId === localPlayer.id) return;

      setRoom((prev) => {
        if (!prev) return null;
        const opponent = prev.players[msg.playerId];
        if (!opponent) return prev;

        const updatedOpponent: DuelPlayer = {
          ...opponent,
          progress: msg.progress,
          status: msg.status || opponent.status,
          language: msg.language || opponent.language,
        };

        const newLog: DuelActivityLog = {
          id: Math.random().toString(),
          timestamp: Date.now(),
          sender: opponent.username,
          message: msg.logMessage || `Opponent passed ${msg.progress}/${msg.totalTestCases} tests!`,
          type: "progress",
        };

        return {
          ...prev,
          players: {
            ...prev.players,
            [msg.playerId]: updatedOpponent,
          },
          logs: [newLog, ...(prev.logs || [])].slice(0, 30),
        };
      });
    }

    if (msg.type === "OPPONENT_VICTORY" && room && msg.roomCode === room.roomCode) {
      if (msg.winnerId === localPlayer.id) return;

      handleMatchFinish(false, `${msg.winnerName} solved all test cases first!`);
    }
  };

  // Timer countdown handler
  const startMatchCountdown = (seconds: number) => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    setRemainingSeconds(seconds);

    timerIntervalRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeExpired = () => {
    if (!room) return;
    // Determine winner based on highest progress
    const opponent = getOpponent();
    const myProgress = localPlayer.progress;
    const oppProgress = opponent ? opponent.progress : 0;

    if (myProgress > oppProgress) {
      handleMatchFinish(true, "Time expired! You passed more test cases.");
    } else if (myProgress < oppProgress) {
      handleMatchFinish(false, "Time expired! Opponent passed more test cases.");
    } else {
      handleMatchFinish(false, "Time expired! It's a draw.");
    }
  };

  // Helper to find opponent player
  const getOpponent = (): DuelPlayer | undefined => {
    if (!room) return undefined;
    const opponentId = Object.keys(room.players).find((id) => id !== localPlayer.id);
    return opponentId ? room.players[opponentId] : undefined;
  };

  // Match Finish Handler
  const handleMatchFinish = (won: boolean, reason: string) => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    if (botIntervalRef.current) window.clearInterval(botIntervalRef.current);

    const opponent = getOpponent();
    const oppRating = opponent ? opponent.rating : 1200;
    const delta = calculateRatingDelta(stats.rating, oppRating, won);

    const newRating = Math.max(800, stats.rating + delta);
    const updatedStats: UserDuelStats = {
      ...stats,
      rating: newRating,
      wins: won ? stats.wins + 1 : stats.wins,
      losses: won ? stats.losses : stats.losses + 1,
      streak: won ? stats.streak + 1 : 0,
      bestStreak: won ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
      totalMatches: stats.totalMatches + 1,
      rank: stats.rank,
    };

    saveUserDuelStats(updatedStats);
    setStats(updatedStats);

    setMatchResultModal({
      won,
      ratingDelta: delta,
      reason,
    });
  };

  // Setup Code & Defaults when Problem Loaded
  useEffect(() => {
    if (room?.problem) {
      const starter = room.problem.starterCode?.[language] || `// Write your solution for ${room.problem.title}\n`;
      setCode(starter);
      setTestResults(room.problem.testCases || []);
    }
  }, [room?.problem?.id, language]);

  // Start Quick Match Queue
  const startQuickMatch = () => {
    setIsSearchingQueue(true);
    setQueueElapsed(0);

    const queueTimer = window.setInterval(() => {
      setQueueElapsed((prev) => prev + 1);
    }, 1000);

    // After 2.5 seconds, pair with a sparring opponent or bot
    window.setTimeout(() => {
      window.clearInterval(queueTimer);
      setIsSearchingQueue(false);
      startBotMatch("Medium");
    }, 2500);
  };

  // Create Private Room
  const createPrivateRoom = () => {
    const problem = getRandomProblem(selectedDifficulty);
    const roomCode = generateRoomCode();
    const me = {
      ...localPlayer,
      totalTestCases: problem.testCases?.length || 4,
    };

    const newRoom: DuelRoom = {
      roomId: `room_${Date.now()}`,
      roomCode,
      mode: "pvp",
      difficulty: selectedDifficulty,
      durationMinutes: selectedDuration,
      problem,
      status: "waiting",
      players: {
        [me.id]: me,
      },
      logs: [
        {
          id: Math.random().toString(),
          timestamp: Date.now(),
          sender: "System",
          message: `Room ${roomCode} created! Share the code or invite link with an opponent.`,
          type: "info",
        },
      ],
    };

    setRoom(newRoom);
    setLocalPlayer(me);
  };

  // Join Room by Code
  const joinRoomByCode = (codeToJoin?: string) => {
    const targetCode = (codeToJoin || roomInput).trim().toUpperCase();
    if (!targetCode) return;

    // Post Join Request via BroadcastChannel
    const me = {
      ...localPlayer,
    };

    channelRef.current?.post({
      type: "JOIN_ROOM_REQUEST",
      roomCode: targetCode,
      player: me,
    });

    // If no host answers in 1.2s (e.g. testing solo), create a paired simulated session
    window.setTimeout(() => {
      if (!room) {
        const problem = getRandomProblem();
        const opponent = createBotOpponent("Medium", problem.testCases?.length || 4);

        const joinedRoom: DuelRoom = {
          roomId: `room_${Date.now()}`,
          roomCode: targetCode,
          mode: "pvp",
          difficulty: "Any",
          durationMinutes: 10,
          problem,
          status: "in_progress",
          startTime: Date.now(),
          endTime: Date.now() + 10 * 60 * 1000,
          players: {
            [me.id]: { ...me, totalTestCases: problem.testCases?.length || 4 },
            [opponent.id]: opponent,
          },
          logs: [
            {
              id: Math.random().toString(),
              timestamp: Date.now(),
              sender: "System",
              message: `Connected to room ${targetCode}. Match is live!`,
              type: "info",
            },
          ],
        };

        setRoom(joinedRoom);
        startMatchCountdown(600);
        runBotProgression(opponent, problem.testCases?.length || 4, targetCode);
      }
    }, 1000);
  };

  // Start Practice vs Bot
  const startBotMatch = (difficulty: BotDifficulty) => {
    const problem = getRandomProblem(difficulty);
    const totalCases = problem.testCases?.length || 4;
    const opponent = createBotOpponent(difficulty, totalCases);
    const me = {
      ...localPlayer,
      totalTestCases: totalCases,
    };

    const newRoom: DuelRoom = {
      roomId: `bot_room_${Date.now()}`,
      roomCode: generateRoomCode(),
      mode: "bot",
      difficulty,
      durationMinutes: 10,
      problem,
      status: "in_progress",
      startTime: Date.now(),
      endTime: Date.now() + 10 * 60 * 1000,
      players: {
        [me.id]: me,
        [opponent.id]: opponent,
      },
      logs: [
        {
          id: Math.random().toString(),
          timestamp: Date.now(),
          sender: "System",
          message: `1v1 Match started against ${opponent.username} (${opponent.rating} ELO)! Good luck!`,
          type: "info",
        },
      ],
    };

    setRoom(newRoom);
    setLocalPlayer(me);
    startMatchCountdown(600);

    // Run Bot Simulation
    runBotProgression(opponent, totalCases, newRoom.roomCode);
  };

  // Bot AI Progress Simulation
  const runBotProgression = (bot: DuelPlayer, totalCases: number, roomCode: string) => {
    if (botIntervalRef.current) window.clearInterval(botIntervalRef.current);

    let botPassed = 0;
    const stepInterval = Math.floor(Math.random() * 8000 + 12000); // 12-20 seconds per advancement

    botIntervalRef.current = window.setInterval(() => {
      botPassed += 1;

      // Broadcast Bot progress
      channelRef.current?.post({
        type: "OPPONENT_PROGRESS",
        roomCode,
        playerId: bot.id,
        progress: botPassed,
        totalTestCases: totalCases,
        logMessage: `${bot.username} solved test case ${botPassed}/${totalCases}!`,
      });

      // If Bot reaches 100% test cases
      if (botPassed >= totalCases) {
        if (botIntervalRef.current) window.clearInterval(botIntervalRef.current);

        channelRef.current?.post({
          type: "OPPONENT_VICTORY",
          roomCode,
          winnerId: bot.id,
          winnerName: bot.username,
        });

        handleMatchFinish(false, `${bot.username} completed all test cases first!`);
      }
    }, stepInterval);
  };

  // Run Testcases
  const handleRunTests = () => {
    if (!room?.problem) return;
    setIsRunningTests(true);

    window.setTimeout(() => {
      const evaluation = evaluateTestCases(code, language, room.problem.testCases || []);
      setTestResults(evaluation.results);
      setLastVerdict(evaluation.allPassed ? "All Samples Passed" : `${evaluation.passed}/${evaluation.total} Passed`);

      // Update local progress
      setLocalPlayer((prev) => ({
        ...prev,
        progress: evaluation.passed,
      }));

      // Broadcast progress to opponent
      channelRef.current?.post({
        type: "OPPONENT_PROGRESS",
        roomCode: room.roomCode,
        playerId: localPlayer.id,
        progress: evaluation.passed,
        totalTestCases: room.problem.testCases?.length || 4,
        logMessage: `You passed ${evaluation.passed}/${evaluation.total} test cases!`,
      });

      // Add to room log
      setRoom((prev) => {
        if (!prev) return null;
        const newLog: DuelActivityLog = {
          id: Math.random().toString(),
          timestamp: Date.now(),
          sender: "You",
          message: `Ran test cases: ${evaluation.passed}/${evaluation.total} passed.`,
          type: "progress",
        };
        return {
          ...prev,
          logs: [newLog, ...(prev.logs || [])].slice(0, 30),
        };
      });

      setIsRunningTests(false);
    }, 600);
  };

  // Submit Final Solution
  const handleSubmitSolution = () => {
    if (!room?.problem) return;
    setIsSubmitting(true);

    window.setTimeout(() => {
      const evaluation = evaluateTestCases(code, language, room.problem.testCases || []);
      setTestResults(evaluation.results);

      if (evaluation.allPassed) {
        setLastVerdict("Accepted");

        // Broadcast victory
        channelRef.current?.post({
          type: "OPPONENT_VICTORY",
          roomCode: room.roomCode,
          winnerId: localPlayer.id,
          winnerName: localPlayer.username,
        });

        handleMatchFinish(true, "VICTORY! All test cases passed with zero errors!");
      } else {
        setLastVerdict("Wrong Answer");

        // Broadcast progress update
        channelRef.current?.post({
          type: "OPPONENT_PROGRESS",
          roomCode: room.roomCode,
          playerId: localPlayer.id,
          progress: evaluation.passed,
          totalTestCases: room.problem.testCases?.length || 4,
          logMessage: `Submitted: ${evaluation.passed}/${evaluation.total} test cases passed.`,
        });

        // Add to log
        setRoom((prev) => {
          if (!prev) return null;
          const newLog: DuelActivityLog = {
            id: Math.random().toString(),
            timestamp: Date.now(),
            sender: "You",
            message: `Submission failed: ${evaluation.passed}/${evaluation.total} tests passed.`,
            type: "alert",
          };
          return {
            ...prev,
            logs: [newLog, ...(prev.logs || [])].slice(0, 30),
          };
        });
      }

      setIsSubmitting(false);
    }, 800);
  };

  // Copy Room Link
  const copyInviteLink = () => {
    if (!room) return;
    const url = `${window.location.origin}/duel?room=${room.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  };

  // Return to Lobby
  const returnToLobby = () => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    if (botIntervalRef.current) window.clearInterval(botIntervalRef.current);
    setRoom(null);
    setMatchResultModal(null);
    setTestResults([]);
    setLastVerdict("");
    navigate({ to: "/duel", search: {} });
  };

  const opponent = getOpponent();
  const totalCases = room?.problem?.testCases?.length || 4;
  const myPercent = Math.min(100, Math.round((localPlayer.progress / totalCases) * 100));
  const oppPercent = Math.min(100, Math.round(((opponent?.progress || 0) / totalCases) * 100));

  // RENDER: LOBBY VIEW
  if (!room || room.status === "waiting") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero Header */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Swords className="h-3.5 w-3.5" />
              Live Multiplayer Arena
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              1v1 Real-Time Code Duel
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Face off against other developers or AI sparring bots in head-to-head live algorithmic speed battles.
            </p>
          </div>

          {/* User ELO Card */}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{stats.rating} ELO</span>
                <span className={`rounded border px-2 py-0.5 text-[11px] font-bold ${rankBadgeColors[stats.rank]}`}>
                  {stats.rank}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-easy">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {stats.wins}W
                </span>
                <span className="flex items-center gap-1 font-semibold text-hard">
                  <XCircle className="h-3.5 w-3.5" /> {stats.losses}L
                </span>
                {stats.streak > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-amber-400">
                    <Flame className="h-3.5 w-3.5" /> {stats.streak} Streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Waiting in Private Room View */}
        {room && room.status === "waiting" && (
          <section className="mt-8 rounded-xl border border-primary/40 bg-primary/5 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Users className="h-7 w-7 animate-pulse" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Waiting for Opponent...</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Share the Room Code below or send the invite link to challenge a friend!
            </p>

            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-lg border border-border bg-card p-3">
              <span className="font-mono text-xl font-bold tracking-widest text-primary">{room.roomCode}</span>
              <button
                onClick={copyInviteLink}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "Copied!" : "Copy Invite Link"}
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => startBotMatch("Medium")}
                className="rounded-md border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover"
              >
                Practice vs Bot Instead
              </button>
              <button
                onClick={returnToLobby}
                className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel Room
              </button>
            </div>
          </section>
        )}

        {/* Matchmaking Lobby Grid */}
        {(!room || room.status !== "waiting") && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Mode 1: Quick Match */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">Quick Match</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Instantly queue for a ranked 1v1 duel against an active player of similar ELO or sparring AI.
                </p>
              </div>

              <div className="mt-6">
                {isSearchingQueue ? (
                  <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Searching Opponent ({queueElapsed}s)...
                    </div>
                    <p className="text-[11px] text-muted-foreground">Finding an opponent within ±150 ELO...</p>
                  </div>
                ) : (
                  <button
                    onClick={startQuickMatch}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4" /> Find Match Now
                  </button>
                )}
              </div>
            </div>

            {/* Mode 2: Custom Private Room */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-foreground">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">Private Room Duel</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a custom room code to battle a friend or classmate.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">Difficulty</label>
                    <div className="mt-1 grid grid-cols-4 gap-1">
                      {(["Any", "Easy", "Medium", "Hard"] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            selectedDifficulty === diff
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">Duration</label>
                    <div className="mt-1 grid grid-cols-3 gap-1">
                      {[5, 10, 15].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setSelectedDuration(mins)}
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            selectedDuration === mins
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={createPrivateRoom}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
                >
                  Create Room Code
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. DUEL-ABCD)"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => joinRoomByCode()}
                    className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Mode 3: Practice vs AI Bot */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">Solo Duel vs Bot</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Warm up your reflexes against algorithmic bots that simulate live opponent progress.
                </p>

                <div className="mt-4">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">Bot Level</label>
                  <div className="mt-2 space-y-2">
                    {[
                      { level: "Easy" as BotDifficulty, desc: "AlgoNovice (1150 ELO)" },
                      { level: "Medium" as BotDifficulty, desc: "StackNinja (1420 ELO)" },
                      { level: "Hard" as BotDifficulty, desc: "TuringTitan (1780 ELO)" },
                    ].map((item) => (
                      <button
                        key={item.level}
                        onClick={() => setBotLevel(item.level)}
                        className={`flex w-full items-center justify-between rounded-md border p-2 text-left text-xs font-medium transition-colors ${
                          botLevel === item.level
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{item.level}</span>
                        <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => startBotMatch(botLevel)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-3 text-sm font-bold text-foreground transition-colors hover:bg-surface-hover"
                >
                  <Swords className="h-4 w-4 text-primary" /> Start Bot Battle
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // RENDER: ACTIVE DUEL ARENA VIEW
  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden bg-background">
      {/* ARENA HUD TOP BAR */}
      <header className="border-b border-border bg-nav px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Player 1 (You) */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {localPlayer.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{localPlayer.username} (You)</span>
                <span className="text-xs text-primary">{stats.rating} ELO</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Progress: {localPlayer.progress}/{totalCases} Tests</span>
              </div>
            </div>
          </div>

          {/* Synchronized Match Timer & VS Indicator */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hard/30 bg-hard/10 px-3 py-1 font-mono text-sm font-bold text-hard">
                <Clock className="h-4 w-4" /> {formatTime(remainingSeconds)}
              </span>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Match Live</p>
            </div>
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-rose-400">{opponent?.rating || 1250} ELO</span>
                <span className="text-sm font-bold text-foreground">{opponent?.username || "Opponent"}</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                <span>Progress: {opponent?.progress || 0}/{totalCases} Tests</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/20 text-sm font-bold text-rose-400">
              {(opponent?.username || "OP").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* DUAL REAL-TIME PROGRESS BARS */}
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 flex justify-between text-[11px] font-semibold">
              <span className="text-primary">Your Solved Tests</span>
              <span className="text-foreground">{myPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${myPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-[11px] font-semibold">
              <span className="text-rose-400">Opponent's Progress</span>
              <span className="text-foreground">{oppPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${oppPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ARENA WORKSPACE: SPLIT PROBLEM & MONACO EDITOR */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[44%_56%]">
        {/* Left Pane: Problem & Live Battle Log */}
        <div className="flex h-full flex-col overflow-y-auto border-r border-border bg-background">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {room.problem.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">{totalCases} Total Tests</span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-foreground">{room.problem.title}</h2>
          </div>

          <div className="flex-1 space-y-5 p-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{room.problem.description}</p>

            {/* Examples */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Examples</h3>
              {room.problem.examples?.map((ex, idx) => (
                <div key={idx} className="rounded-md border border-border bg-surface p-3 font-mono text-xs">
                  <p className="text-muted-foreground">Input: {ex.input}</p>
                  <p className="mt-1 font-semibold text-foreground">Output: {ex.output}</p>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Constraints</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                {room.problem.constraints?.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Live Battle Activity Log */}
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase text-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" /> Live Battle Log
              </h3>
              <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto font-mono text-[11px]">
                {room.logs?.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(log.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className="font-semibold text-foreground">{log.sender}:</span>
                    <span className={log.type === "alert" ? "text-hard" : log.type === "progress" ? "text-primary" : ""}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Testcase Console */}
        <div className="flex h-full flex-col bg-[#0d1117]">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-nav px-4 py-2">
            <div className="flex items-center gap-1">
              {(Object.keys(languageLabels) as Lang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    language === lang ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {languageLabels[lang]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={isRunningTests || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover disabled:opacity-40"
              >
                <Play className="h-3.5 w-3.5 text-primary" /> {isRunningTests ? "Testing..." : "Run Tests"}
              </button>
              <button
                onClick={handleSubmitSolution}
                disabled={isRunningTests || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" /> {isSubmitting ? "Submitting..." : "Submit Duel"}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language={monacoLang[language]}
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Bottom Testcase & Verdict Console */}
          <div className="h-48 border-t border-border bg-background">
            <div className="flex items-center justify-between border-b border-border bg-nav px-4 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Duel Testcase Console</span>
                {lastVerdict && (
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                      lastVerdict === "Accepted"
                        ? "bg-easy/20 text-easy"
                        : "bg-hard/20 text-hard"
                    }`}
                  >
                    {lastVerdict}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Passed {localPlayer.progress}/{totalCases} cases
              </span>
            </div>

            <div className="h-[calc(12rem-37px)] overflow-y-auto p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {testResults.map((tc, idx) => (
                  <div
                    key={idx}
                    className={`rounded-md border p-2.5 font-mono text-[11px] ${
                      tc.passed
                        ? "border-easy/30 bg-easy/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Case {idx + 1}</span>
                      <span className={tc.passed ? "text-easy font-bold" : "text-muted-foreground"}>
                        {tc.passed ? "Passed ✓" : "Pending / Failed ✗"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-muted-foreground">Input: {tc.input}</p>
                    <p className="truncate text-foreground">Expected: {tc.expected || tc.expected_output}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POST-MATCH VICTORY / DEFEAT MODAL */}
      {matchResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                matchResultModal.won ? "bg-primary/20 text-primary" : "bg-hard/20 text-hard"
              }`}
            >
              {matchResultModal.won ? <Trophy className="h-8 w-8 animate-bounce" /> : <XCircle className="h-8 w-8" />}
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground">
              {matchResultModal.won ? "VICTORY!" : "DEFEAT"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{matchResultModal.reason}</p>

            {/* ELO Rating Adjustment Card */}
            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Rating Adjustment</span>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-foreground">{stats.rating} ELO</span>
                <span
                  className={`text-lg font-bold ${
                    matchResultModal.won ? "text-easy" : "text-hard"
                  }`}
                >
                  {matchResultModal.won ? `+${matchResultModal.ratingDelta}` : `${matchResultModal.ratingDelta}`}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Rank: <span className="font-semibold text-foreground">{stats.rank}</span>
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => startBotMatch("Medium")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Play Again
              </button>
              <button
                onClick={returnToLobby}
                className="flex-1 rounded-lg border border-border bg-surface py-2.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DuelPage;
