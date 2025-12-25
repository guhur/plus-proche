import { useCallback, useEffect, useState } from "react";
import type * as Y from "yjs";
import type { Difficulty, GamePhase, GameState } from "@/lib/yjs/types";

const defaultGameState: GameState = {
  pin: "",
  phase: "waiting",
  hostId: "",
  theme: null,
  difficulty: null,
  currentQuestion: null,
  roundNumber: 0,
  nextPickerId: null,
};

export function useGameState(ydoc: Y.Doc | null): {
  gameState: GameState;
  setPhase: (phase: GamePhase) => void;
  setSettings: (theme: string, difficulty: Difficulty) => void;
} {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);

  useEffect(() => {
    if (!ydoc) return;

    const ymap = ydoc.getMap("gameState");

    const updateState = () => {
      const state = ymap.toJSON() as GameState;
      setGameState({
        ...defaultGameState,
        ...state,
      });
    };

    updateState();
    ymap.observeDeep(updateState);

    return () => {
      ymap.unobserveDeep(updateState);
    };
  }, [ydoc]);

  const setPhase = useCallback(
    (phase: GamePhase) => {
      if (!ydoc) return;
      const ymap = ydoc.getMap("gameState");
      ymap.set("phase", phase);
    },
    [ydoc],
  );

  const setSettings = useCallback(
    (theme: string, difficulty: Difficulty) => {
      if (!ydoc) return;
      const ymap = ydoc.getMap("gameState");
      ydoc.transact(() => {
        ymap.set("theme", theme);
        ymap.set("difficulty", difficulty);
      });
    },
    [ydoc],
  );

  return { gameState, setPhase, setSettings };
}
