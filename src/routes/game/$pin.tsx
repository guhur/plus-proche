import { Badge, Box, Container, Spinner, Text, VStack } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AnswerInput } from "@/components/game/AnswerInput";
import { GameSettings } from "@/components/game/GameSettings";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";
import { ResultsDisplay } from "@/components/game/ResultsDisplay";
import { Scoreboard } from "@/components/game/Scoreboard";
import { WaitingRoom } from "@/components/game/WaitingRoom";
import { useAnswers } from "@/hooks/useAnswers";
import { useGameState } from "@/hooks/useGameState";
import { usePlayers } from "@/hooks/usePlayers";
import { useYjsProvider } from "@/hooks/useYjsProvider";
import { generateQuestion } from "@/lib/api/questions";
import {
  createGame,
  joinGame,
  setPhase,
  setQuestion,
} from "@/lib/game/actions";
import { calculateRoundResults } from "@/lib/game/scoring";
import type { Difficulty, Question } from "@/lib/yjs/types";

export const Route = createFileRoute("/game/$pin")({
  component: GamePage,
});

function GamePage() {
  const { pin } = Route.useParams();
  const { ydoc, isConnected, isSynced, connectedPeers } = useYjsProvider(pin);
  const { gameState } = useGameState(ydoc);
  const { players, updateScore } = usePlayers(ydoc);
  const { answers, submitAnswer, clearAnswers, hasAnswered } = useAnswers(ydoc);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [winnerIds, setWinnerIds] = useState<string[]>([]);
  const [loserId, setLoserId] = useState<string>("");
  const hasInitialized = useRef(false);

  const isHost = sessionStorage.getItem("isHost") === "true";
  const playerName = sessionStorage.getItem("playerName") ?? "Joueur";

  // Initialize player on first connect
  useEffect(() => {
    if (!ydoc || !isSynced || hasInitialized.current) return;

    const existingPlayerId = sessionStorage.getItem("playerId");

    // Host creates the game
    if (isHost) {
      // Check if game already exists (e.g., page refresh)
      const gameStateMap = ydoc.getMap("gameState");
      const existingPin = gameStateMap.get("pin");

      if (!existingPin) {
        // Create new game
        const result = createGame(ydoc, playerName);
        setPlayerId(result.playerId);
        sessionStorage.setItem("playerId", result.playerId);
        hasInitialized.current = true;
      } else if (existingPlayerId) {
        // Rejoin existing game
        const playersMap = ydoc.getMap("players");
        if (playersMap.has(existingPlayerId)) {
          setPlayerId(existingPlayerId);
        } else {
          // Player was removed, rejoin
          const newId = joinGame(ydoc, playerName);
          setPlayerId(newId);
          sessionStorage.setItem("playerId", newId);
        }
        hasInitialized.current = true;
      }
    } else {
      // Non-host joins the game
      const playersMap = ydoc.getMap("players");

      if (existingPlayerId && playersMap.has(existingPlayerId)) {
        // Already in game
        setPlayerId(existingPlayerId);
      } else {
        // Join as new player
        const newId = joinGame(ydoc, playerName);
        setPlayerId(newId);
        sessionStorage.setItem("playerId", newId);
      }
      hasInitialized.current = true;
    }
  }, [ydoc, isSynced, isHost, playerName]);

  // Check if all players answered
  useEffect(() => {
    if (
      gameState.phase === "question" &&
      answers.length === players.length &&
      players.length > 0 &&
      gameState.currentQuestion
    ) {
      const result = calculateRoundResults(
        answers,
        gameState.currentQuestion.correctAnswer,
        players,
      );

      setWinnerIds(result.winnerIds);
      setLoserId(result.loserId);

      // Update scores for winners
      if (ydoc) {
        result.winnerIds.forEach((id) => {
          updateScore(id, 1);
        });
        setPhase(ydoc, "results");
        ydoc.getMap("gameState").set("nextPickerId", result.loserId);
      }
    }
  }, [
    answers,
    players,
    gameState.phase,
    gameState.currentQuestion,
    ydoc,
    updateScore,
  ]);

  const handleStartGame = useCallback(() => {
    if (!ydoc) return;
    setPhase(ydoc, "settings");
  }, [ydoc]);

  const handleConfirmSettings = useCallback(
    async (theme: string, difficulty: Difficulty) => {
      if (!ydoc) return;

      setIsLoading(true);
      try {
        const generated = await generateQuestion({ theme, difficulty });

        const question: Question = {
          id: uuidv4(),
          text: generated.question,
          correctAnswer: generated.answer,
          theme,
          difficulty,
          generatedAt: Date.now(),
        };

        setQuestion(ydoc, question);
      } catch (error) {
        console.error("Failed to generate question:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [ydoc],
  );

  const handleSubmitAnswer = useCallback(
    (value: number) => {
      if (!playerId) return;
      submitAnswer(playerId, value);
    },
    [playerId, submitAnswer],
  );

  const handleNextRound = useCallback(() => {
    if (!ydoc) return;
    clearAnswers();
    setPhase(ydoc, "settings");
  }, [ydoc, clearAnswers]);

  // Loading state with connection info
  if (!isSynced) {
    return (
      <Box minH="100vh" bg="gray.50" py={16}>
        <Container maxW="md">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Connexion en cours...</Text>
            <VStack gap={2}>
              <Badge colorPalette={isConnected ? "green" : "orange"}>
                {isConnected ? "Connecté au réseau" : "Connexion..."}
              </Badge>
              <Text fontSize="sm" color="gray.500">
                {connectedPeers} joueur{connectedPeers > 1 ? "s" : ""} en ligne
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  const nextPicker = players.find((p) => p.id === gameState.nextPickerId);
  const canPickNextRound =
    gameState.nextPickerId === playerId ||
    (gameState.nextPickerId === null && isHost);

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="lg">
        {/* Connection status */}
        <Box position="fixed" top={4} right={4}>
          <Badge colorPalette={isConnected ? "green" : "red"} size="sm">
            {connectedPeers} en ligne
          </Badge>
        </Box>

        {gameState.phase === "waiting" && (
          <WaitingRoom
            pin={pin}
            players={players}
            isHost={isHost}
            onStart={handleStartGame}
          />
        )}

        {gameState.phase === "settings" && canPickNextRound && (
          <GameSettings
            onConfirm={handleConfirmSettings}
            nextPickerName={nextPicker?.name}
          />
        )}

        {gameState.phase === "settings" && !canPickNextRound && (
          <VStack gap={4} py={8}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">
              {nextPicker?.name ?? "Un joueur"} choisit le thème...
            </Text>
          </VStack>
        )}

        {gameState.phase === "question" && (
          <VStack gap={8}>
            <QuestionDisplay
              question={gameState.currentQuestion}
              roundNumber={gameState.roundNumber}
              isLoading={isLoading}
            />
            {playerId && (
              <AnswerInput
                onSubmit={handleSubmitAnswer}
                hasSubmitted={hasAnswered(playerId)}
                totalPlayers={players.length}
                answeredCount={answers.length}
              />
            )}
          </VStack>
        )}

        {gameState.phase === "results" && gameState.currentQuestion && (
          <ResultsDisplay
            correctAnswer={gameState.currentQuestion.correctAnswer}
            answers={answers}
            players={players}
            winnerIds={winnerIds}
            loserId={loserId}
            onNextRound={handleNextRound}
            canStartNextRound={canPickNextRound}
          />
        )}

        {players.length > 0 && <Scoreboard players={players} />}
      </Container>
    </Box>
  );
}
