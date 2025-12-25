import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";
import type { Player } from "@/lib/yjs/types";

export function usePlayers(ydoc: Y.Doc | null): {
  players: Player[];
  addPlayer: (player: Player) => void;
  updateScore: (playerId: string, addPoints: number) => void;
} {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!ydoc) return;

    const ymap = ydoc.getMap("players");

    const updatePlayers = () => {
      const playerList: Player[] = [];
      ymap.forEach((playerMap) => {
        const map = playerMap as Y.Map<unknown>;
        playerList.push({
          id: map.get("id") as string,
          name: map.get("name") as string,
          score: map.get("score") as number,
          isHost: map.get("isHost") as boolean,
          joinedAt: map.get("joinedAt") as number,
        });
      });
      playerList.sort((a, b) => a.joinedAt - b.joinedAt);
      setPlayers(playerList);
    };

    updatePlayers();
    ymap.observeDeep(updatePlayers);

    return () => {
      ymap.unobserveDeep(updatePlayers);
    };
  }, [ydoc]);

  const addPlayer = useCallback(
    (player: Player) => {
      if (!ydoc) return;

      const ymap = ydoc.getMap("players");
      const playerMap = new Y.Map();

      ydoc.transact(() => {
        playerMap.set("id", player.id);
        playerMap.set("name", player.name);
        playerMap.set("score", player.score);
        playerMap.set("isHost", player.isHost);
        playerMap.set("joinedAt", player.joinedAt);
        ymap.set(player.id, playerMap);
      });
    },
    [ydoc],
  );

  const updateScore = useCallback(
    (playerId: string, addPoints: number) => {
      if (!ydoc) return;

      const ymap = ydoc.getMap("players");
      const playerMap = ymap.get(playerId) as Y.Map<unknown> | undefined;

      if (playerMap) {
        const currentScore = (playerMap.get("score") as number) ?? 0;
        playerMap.set("score", currentScore + addPoints);
      }
    },
    [ydoc],
  );

  return { players, addPlayer, updateScore };
}
