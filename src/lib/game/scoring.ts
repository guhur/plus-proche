import type { Answer, Player } from "@/lib/yjs/types";

interface PlayerRanking {
  playerId: string;
  answer: number;
  distance: number;
}

interface ScoringResult {
  winnerId: string;
  winnerIds: string[];
  loserId: string;
  loserIds: string[];
  rankings: PlayerRanking[];
}

export function calculateRoundResults(
  answers: Answer[],
  correctAnswer: number,
  _players: Player[],
): ScoringResult {
  const rankings = answers
    .map((answer) => ({
      playerId: answer.playerId,
      answer: answer.value,
      distance: Math.abs(answer.value - correctAnswer),
    }))
    .sort((a, b) => a.distance - b.distance);

  const minDistance = rankings[0].distance;
  const maxDistance = rankings[rankings.length - 1].distance;

  const winnerIds = rankings
    .filter((r) => r.distance === minDistance)
    .map((r) => r.playerId);

  const loserIds = rankings
    .filter((r) => r.distance === maxDistance)
    .map((r) => r.playerId);

  const winnerId = winnerIds[0];
  const loserId = loserIds[Math.floor(Math.random() * loserIds.length)];

  return { winnerId, winnerIds, loserId, loserIds, rankings };
}
