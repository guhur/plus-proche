import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { UI_TEXTS } from "@/lib/game/constants";
import type { Player } from "@/lib/yjs/types";

interface WaitingRoomProps {
  pin: string;
  players: Player[];
  isHost: boolean;
  onStart: () => void;
}

export function WaitingRoom({
  pin,
  players,
  isHost,
  onStart,
}: WaitingRoomProps) {
  const canStart = players.length >= 2;

  return (
    <VStack gap={8} py={8}>
      <VStack gap={2}>
        <Text fontSize="lg" color="gray.600">
          {UI_TEXTS.waiting.sharePin}
        </Text>
        <Heading
          size="4xl"
          letterSpacing="0.3em"
          color="blue.600"
          fontFamily="mono"
        >
          {pin}
        </Heading>
      </VStack>

      <VStack gap={4} w="full" maxW="sm">
        <Text fontWeight="medium" color="gray.700">
          {UI_TEXTS.waiting.players} ({players.length})
        </Text>

        <VStack gap={2} w="full">
          {players.map((player) => (
            <HStack
              key={player.id}
              w="full"
              p={3}
              bg="white"
              borderRadius="md"
              shadow="sm"
              justify="space-between"
            >
              <Text>{player.name}</Text>
              {player.isHost && (
                <Badge colorPalette="blue" size="sm">
                  Hôte
                </Badge>
              )}
            </HStack>
          ))}
        </VStack>
      </VStack>

      {isHost && (
        <Box w="full" maxW="sm">
          <Button
            colorPalette="blue"
            size="lg"
            w="full"
            onClick={onStart}
            disabled={!canStart}
          >
            {UI_TEXTS.waiting.start}
          </Button>
          {!canStart && (
            <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
              {UI_TEXTS.waiting.minPlayers}
            </Text>
          )}
        </Box>
      )}

      {!isHost && <Text color="gray.500">{UI_TEXTS.waiting.title}...</Text>}
    </VStack>
  );
}
