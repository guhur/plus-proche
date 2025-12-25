import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { DIFFICULTY_LABELS, THEMES } from "@/lib/game/constants";
import type { Difficulty } from "@/lib/yjs/types";

interface GameSettingsProps {
  onConfirm: (theme: string, difficulty: Difficulty) => void;
  nextPickerName?: string;
}

export function GameSettings({ onConfirm, nextPickerName }: GameSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(3);

  const handleConfirm = () => {
    if (!selectedTheme) return;
    onConfirm(selectedTheme, selectedDifficulty);
  };

  return (
    <VStack gap={8} py={8}>
      {nextPickerName && (
        <Text fontSize="lg" color="blue.600">
          <strong>{nextPickerName}</strong> choisit le thème !
        </Text>
      )}

      <VStack gap={4} w="full" maxW="md">
        <Heading size="md">Thème</Heading>
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
          {THEMES.map((theme) => (
            <Button
              key={theme}
              size="sm"
              variant={selectedTheme === theme ? "solid" : "outline"}
              colorPalette={selectedTheme === theme ? "blue" : "gray"}
              onClick={() => setSelectedTheme(theme)}
            >
              {theme}
            </Button>
          ))}
        </Box>
      </VStack>

      <VStack gap={4} w="full" maxW="md">
        <Heading size="md">Difficulté</Heading>
        <HStack gap={2} flexWrap="wrap" justify="center">
          {([1, 2, 3, 4, 5] as Difficulty[]).map((level) => (
            <Button
              key={level}
              size="sm"
              variant={selectedDifficulty === level ? "solid" : "outline"}
              colorPalette={selectedDifficulty === level ? "blue" : "gray"}
              onClick={() => setSelectedDifficulty(level)}
            >
              {DIFFICULTY_LABELS[level]}
            </Button>
          ))}
        </HStack>
      </VStack>

      <Button
        colorPalette="blue"
        size="lg"
        onClick={handleConfirm}
        disabled={!selectedTheme}
      >
        Lancer la question
      </Button>
    </VStack>
  );
}
