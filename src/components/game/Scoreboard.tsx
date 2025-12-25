import {
  Badge,
  Button,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { UI_TEXTS } from "@/lib/game/constants";
import type { Player } from "@/lib/yjs/types";

interface ScoreboardProps {
  players: Player[];
}

export function Scoreboard({ players }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          colorPalette="blue"
          size="sm"
          position="fixed"
          bottom={4}
          right={4}
        >
          {UI_TEXTS.game.showRanking}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <Heading size="lg">{UI_TEXTS.scoreboard.title}</Heading>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody pb={6}>
          <VStack gap={2} w="full">
            {sortedPlayers.map((player, index) => (
              <HStack
                key={player.id}
                w="full"
                p={3}
                bg={index === 0 ? "yellow.50" : "white"}
                borderRadius="md"
                shadow="sm"
                justify="space-between"
                borderWidth={index === 0 ? 2 : 1}
                borderColor={index === 0 ? "yellow.300" : "gray.100"}
              >
                <HStack gap={2}>
                  <Text fontWeight="bold" color="gray.400" w={6}>
                    #{index + 1}
                  </Text>
                  <Text>{player.name}</Text>
                  {player.isHost && (
                    <Badge colorPalette="blue" size="sm">
                      Hôte
                    </Badge>
                  )}
                </HStack>
                <Text fontWeight="bold">
                  {player.score} {UI_TEXTS.scoreboard.points}
                </Text>
              </HStack>
            ))}
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
