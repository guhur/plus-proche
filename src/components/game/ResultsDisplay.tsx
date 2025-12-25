import { Badge, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { UI_TEXTS } from "@/lib/game/constants";
import type { Answer, Player } from "@/lib/yjs/types";

interface ResultsDisplayProps {
  correctAnswer: number;
  answers: Answer[];
  players: Player[];
  winnerIds: string[];
  loserId: string;
  onNextRound: () => void;
  canStartNextRound: boolean;
}

export function ResultsDisplay({
  correctAnswer,
  answers,
  players,
  winnerIds,
  loserId,
  onNextRound,
  canStartNextRound,
}: ResultsDisplayProps) {
  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name ?? "Inconnu";

  const sortedAnswers = [...answers].sort((a, b) => {
    const distA = Math.abs(a.value - correctAnswer);
    const distB = Math.abs(b.value - correctAnswer);
    return distA - distB;
  });

  return (
    <VStack gap={8} py={8}>
      <VStack gap={2}>
        <Text fontSize="lg" color="gray.600">
          {UI_TEXTS.game.correctAnswer}
        </Text>
        <Heading size="3xl" color="green.500">
          {correctAnswer}
        </Heading>
      </VStack>

      <VStack gap={4} w="full" maxW="md">
        <Text fontWeight="medium">Résultats</Text>

        <VStack gap={2} w="full">
          {sortedAnswers.map((answer, index) => {
            const isWinner = winnerIds.includes(answer.playerId);
            const isLoser = answer.playerId === loserId;
            const distance = Math.abs(answer.value - correctAnswer);

            return (
              <HStack
                key={answer.playerId}
                w="full"
                p={3}
                bg={isWinner ? "green.50" : isLoser ? "red.50" : "white"}
                borderRadius="md"
                shadow="sm"
                justify="space-between"
                borderWidth={isWinner ? 2 : 0}
                borderColor={isWinner ? "green.300" : undefined}
              >
                <HStack gap={2}>
                  <Text fontWeight="bold" color="gray.400" w={6}>
                    #{index + 1}
                  </Text>
                  <Text>{getPlayerName(answer.playerId)}</Text>
                </HStack>
                <HStack gap={2}>
                  <Text fontWeight="bold">{answer.value}</Text>
                  <Text fontSize="sm" color="gray.500">
                    (±{distance})
                  </Text>
                  {isWinner && (
                    <Badge colorPalette="green" size="sm">
                      +1
                    </Badge>
                  )}
                </HStack>
              </HStack>
            );
          })}
        </VStack>
      </VStack>

      <VStack gap={2}>
        <Text color="gray.600">
          {UI_TEXTS.game.nextPicker} <strong>{getPlayerName(loserId)}</strong>
        </Text>
      </VStack>

      {canStartNextRound && (
        <Button colorPalette="blue" size="lg" onClick={onNextRound}>
          {UI_TEXTS.game.nextRound}
        </Button>
      )}
    </VStack>
  );
}
