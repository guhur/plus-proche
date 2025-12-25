import { Box, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { DIFFICULTY_LABELS, UI_TEXTS } from "@/lib/game/constants";
import type { Question } from "@/lib/yjs/types";

interface QuestionDisplayProps {
  question: Question | null;
  roundNumber: number;
  isLoading?: boolean;
}

export function QuestionDisplay({
  question,
  roundNumber,
  isLoading,
}: QuestionDisplayProps) {
  if (isLoading) {
    return (
      <VStack gap={4} py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text color="gray.600">Génération de la question...</Text>
      </VStack>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <VStack gap={6} py={8}>
      <VStack gap={1}>
        <Text fontSize="sm" color="gray.500">
          {UI_TEXTS.game.round} {roundNumber}
        </Text>
        <Text fontSize="xs" color="gray.400">
          {question.theme} - {DIFFICULTY_LABELS[question.difficulty]}
        </Text>
      </VStack>

      <Box
        bg="white"
        p={8}
        borderRadius="xl"
        shadow="md"
        maxW="lg"
        w="full"
        textAlign="center"
      >
        <Heading size="lg" color="gray.800" lineHeight="tall">
          {question.text}
        </Heading>
      </Box>
    </VStack>
  );
}
