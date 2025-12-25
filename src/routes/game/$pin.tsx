import {
  Badge,
  Box,
  Container,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Home, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AnswerInput } from "@/components/game/AnswerInput";
import { GameSettings } from "@/components/game/GameSettings";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";
import { ResultsDisplay } from "@/components/game/ResultsDisplay";
import { Scoreboard } from "@/components/game/Scoreboard";
import { WaitingRoom } from "@/components/game/WaitingRoom";
import { useAnswers } from "@/hooks/useAnswers";
import { useGameSession } from "@/hooks/useGameSession";
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
import { GamePhase } from "@/lib/yjs/types";

export const Route = createFileRoute("/game/$pin")({
  component: GamePage,
});

function GamePage() {
  const { pin } = Route.useParams();
  const navigate = useNavigate();
  const { ydoc, isConnected, isSynced, connectedPeers } = useYjsProvider(pin);
  const { gameState } = useGameState(ydoc);
  const { players, updateScore } = usePlayers(ydoc);
  const { answers, submitAnswer, clearAnswers, hasAnswered } = useAnswers(ydoc);
  const { getSession, saveSession, getPlayerName } = useGameSession(pin);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [winnerIds, setWinnerIds] = useState<string[]>([]);
  const [loserId, setLoserId] = useState<string>("");
  const hasInitialized = useRef(false);

  const playerName = getPlayerName() ?? "Joueur";

  // Initialize player on first connect
  useEffect(() => {
    if (!ydoc || !isSynced || hasInitialized.current) return;

    const savedSession = getSession();
    const playersMap = ydoc.getMap("players");
    const gameStateMap = ydoc.getMap("gameState");
    const existingPin = gameStateMap.get("pin");

    // Try to reconnect with saved session
    if (savedSession && playersMap.has(savedSession.playerId)) {
      setPlayerId(savedSession.playerId);
      setIsHost(savedSession.isHost);
      hasInitialized.current = true;
      return;
    }

    // Check if we're supposed to be the host (coming from home page)
    const isCreatingGame = sessionStorage.getItem("isHost") === "true";
    sessionStorage.removeItem("isHost"); // Clear after reading

    if (isCreatingGame && !existingPin) {
      // Create new game as host
      const result = createGame(ydoc, playerName);
      setPlayerId(result.playerId);
      setIsHost(true);
      saveSession({
        playerId: result.playerId,
        playerName,
        isHost: true,
        joinedAt: Date.now(),
      });
      hasInitialized.current = true;
    } else {
      // Join existing game as player
      const newId = joinGame(ydoc, playerName);
      setPlayerId(newId);
      setIsHost(false);
      saveSession({
        playerId: newId,
        playerName,
        isHost: false,
        joinedAt: Date.now(),
      });
      hasInitialized.current = true;
    }
  }, [ydoc, isSynced, playerName, getSession, saveSession]);

  // Check if all players answered
  useEffect(() => {
    if (
      gameState.phase === GamePhase.Question &&
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
        setPhase(ydoc, GamePhase.Results);
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
    setPhase(ydoc, GamePhase.Settings);
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
    setPhase(ydoc, GamePhase.Settings);
  }, [ydoc, clearAnswers]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: "Plus Proche",
        text: `Rejoins ma partie ! Code : ${pin}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [pin]);

  const handleGoHome = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

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
        {/* Header with navigation and status */}
        <HStack justify="space-between" mb={6}>
          <IconButton
            aria-label="Retour à l'accueil"
            variant="ghost"
            size="sm"
            onClick={handleGoHome}
          >
            <Home size={20} />
          </IconButton>
          <Badge colorPalette={isConnected ? "green" : "red"} size="sm">
            {connectedPeers} en ligne
          </Badge>
          <IconButton
            aria-label="Partager la partie"
            variant="ghost"
            size="sm"
            onClick={handleShare}
          >
            <Share2 size={20} />
          </IconButton>
        </HStack>

        {gameState.phase === GamePhase.Waiting && (
          <WaitingRoom
            pin={pin}
            players={players}
            isHost={isHost}
            onStart={handleStartGame}
          />
        )}

        {gameState.phase === GamePhase.Settings &&
          canPickNextRound &&
          !isLoading && (
            <GameSettings
              onConfirm={handleConfirmSettings}
              nextPickerName={nextPicker?.name}
            />
          )}

        {gameState.phase === GamePhase.Settings &&
          canPickNextRound &&
          isLoading && (
            <VStack gap={4} py={8}>
              <Spinner size="xl" color="blue.500" />
              <Text color="gray.600">Génération de la question...</Text>
            </VStack>
          )}

        {gameState.phase === GamePhase.Settings && !canPickNextRound && (
          <VStack gap={4} py={8}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">
              {nextPicker?.name ?? "Un joueur"} choisit le thème...
            </Text>
          </VStack>
        )}

        {gameState.phase === GamePhase.Question && (
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

        {gameState.phase === GamePhase.Results && gameState.currentQuestion && (
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
