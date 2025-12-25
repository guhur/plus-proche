import { v4 as uuidv4 } from "uuid";
import * as Y from "yjs";
import type { Question } from "@/lib/yjs/types";
import { GamePhase } from "@/lib/yjs/types";
import { generatePin } from "./pin";

export function createGame(
  ydoc: Y.Doc,
  playerName: string,
): { pin: string; playerId: string } {
  const pin = generatePin();
  const playerId = uuidv4();

  ydoc.transact(() => {
    const gameState = ydoc.getMap("gameState");
    gameState.set("pin", pin);
    gameState.set("phase", GamePhase.Waiting);
    gameState.set("hostId", playerId);
    gameState.set("theme", null);
    gameState.set("difficulty", null);
    gameState.set("currentQuestion", null);
    gameState.set("roundNumber", 0);
    gameState.set("nextPickerId", null);

    const players = ydoc.getMap("players");
    const playerMap = new Y.Map();
    playerMap.set("id", playerId);
    playerMap.set("name", playerName);
    playerMap.set("score", 0);
    playerMap.set("isHost", true);
    playerMap.set("joinedAt", Date.now());
    players.set(playerId, playerMap);
  });

  return { pin, playerId };
}

export function joinGame(ydoc: Y.Doc, playerName: string): string {
  const playerId = uuidv4();

  ydoc.transact(() => {
    const players = ydoc.getMap("players");
    const playerMap = new Y.Map();
    playerMap.set("id", playerId);
    playerMap.set("name", playerName);
    playerMap.set("score", 0);
    playerMap.set("isHost", false);
    playerMap.set("joinedAt", Date.now());
    players.set(playerId, playerMap);
  });

  return playerId;
}

export function setPhase(ydoc: Y.Doc, phase: GamePhase): void {
  const gameState = ydoc.getMap("gameState");
  gameState.set("phase", phase);
}

export function setQuestion(ydoc: Y.Doc, question: Question): void {
  const gameState = ydoc.getMap("gameState");

  ydoc.transact(() => {
    gameState.set("currentQuestion", question);
    gameState.set("roundNumber", (gameState.get("roundNumber") as number) + 1);
    gameState.set("phase", GamePhase.Question);

    const answers = ydoc.getMap("answers");
    answers.forEach((_, key) => {
      answers.delete(key);
    });
  });
}
