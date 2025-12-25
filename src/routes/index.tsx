import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { UI_TEXTS } from "@/lib/game/constants";
import { generatePin } from "@/lib/game/pin";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");

  const handleCreateGame = () => {
    if (!playerName.trim()) return;

    const pin = generatePin();
    const playerId = uuidv4();

    sessionStorage.setItem("playerName", playerName.trim());
    sessionStorage.setItem("playerId", playerId);
    sessionStorage.setItem("isHost", "true");

    navigate({ to: "/game/$pin", params: { pin } });
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) return;

    sessionStorage.setItem("playerName", playerName.trim());
    navigate({ to: "/join" });
  };

  return (
    <Box minH="100vh" bg="gray.50" py={16}>
      <Container maxW="md">
        <VStack gap={8}>
          <VStack gap={2}>
            <Heading size="2xl" color="blue.600">
              {UI_TEXTS.home.title}
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {UI_TEXTS.home.subtitle}
            </Text>
          </VStack>

          <VStack gap={4} w="full">
            <Input
              placeholder="Votre nom"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              size="lg"
              bg="white"
              textAlign="center"
            />

            <Button
              colorPalette="blue"
              size="lg"
              w="full"
              onClick={handleCreateGame}
              disabled={!playerName.trim()}
            >
              {UI_TEXTS.home.createGame}
            </Button>

            <Button
              variant="outline"
              colorPalette="blue"
              size="lg"
              w="full"
              onClick={handleJoinGame}
              disabled={!playerName.trim()}
            >
              {UI_TEXTS.home.joinGame}
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
