import { useCallback } from "react";

type GameSession = {
  playerId: string;
  playerName: string;
  isHost: boolean;
  joinedAt: number;
};

const STORAGE_PREFIX = "game:";

export function useGameSession(pin: string) {
  const storageKey = `${STORAGE_PREFIX}${pin}`;

  const getSession = useCallback((): GameSession | null => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as GameSession;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saveSession = useCallback(
    (session: GameSession) => {
      localStorage.setItem(storageKey, JSON.stringify(session));
    },
    [storageKey],
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const getPlayerName = useCallback((): string | null => {
    // First check current game session
    const session = getSession();
    if (session?.playerName) return session.playerName;

    // Fallback to last used name (stored globally)
    return localStorage.getItem("lastPlayerName");
  }, [getSession]);

  const savePlayerName = useCallback((name: string) => {
    localStorage.setItem("lastPlayerName", name);
  }, []);

  return {
    getSession,
    saveSession,
    clearSession,
    getPlayerName,
    savePlayerName,
  };
}
