import { Button, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { UI_TEXTS } from "@/lib/game/constants";

interface AnswerInputProps {
  onSubmit: (value: number) => void;
  hasSubmitted: boolean;
  totalPlayers: number;
  answeredCount: number;
}

export function AnswerInput({
  onSubmit,
  hasSubmitted,
  totalPlayers,
  answeredCount,
}: AnswerInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    if (!Number.isNaN(numValue)) {
      onSubmit(numValue);
    }
  };

  if (hasSubmitted) {
    return (
      <VStack gap={4} py={4}>
        <Text color="gray.600">{UI_TEXTS.game.waiting}</Text>
        <Text fontSize="sm" color="gray.400">
          {answeredCount} / {totalPlayers} joueurs ont répondu
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap={4} py={4} w="full" maxW="sm">
      <HStack gap={2} w="full">
        <Input
          type="number"
          placeholder="Votre reponse"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="lg"
          bg="white"
          textAlign="center"
          fontSize="xl"
        />
        <Button
          colorPalette="blue"
          size="lg"
          onClick={handleSubmit}
          disabled={!value || Number.isNaN(parseFloat(value))}
        >
          {UI_TEXTS.game.submit}
        </Button>
      </HStack>
    </VStack>
  );
}
