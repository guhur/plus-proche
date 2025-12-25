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
import { UI_TEXTS } from "@/lib/game/constants";
import { isValidPin } from "@/lib/game/pin";

export const Route = createFileRoute("/join")({
  component: JoinPage,
});

function JoinPage() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const playerName = localStorage.getItem("lastPlayerName") ?? "";

  const handleJoin = () => {
    if (!isValidPin(pin)) {
      setError("Le code PIN doit contenir 4 chiffres");
      return;
    }

    navigate({ to: "/game/$pin", params: { pin } });
  };

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    setError("");
  };

  return (
    <Box minH="100vh" bg="gray.50" py={16}>
      <Container maxW="md">
        <VStack gap={8}>
          <Heading size="xl" color="blue.600">
            {UI_TEXTS.join.title}
          </Heading>

          {playerName && (
            <Text color="gray.600">
              Bienvenue, <strong>{playerName}</strong>
            </Text>
          )}

          <VStack gap={4} w="full">
            <VStack gap={2} w="full">
              <Text fontWeight="medium">{UI_TEXTS.join.pinLabel}</Text>
              <Input
                placeholder={UI_TEXTS.join.pinPlaceholder}
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                size="lg"
                bg="white"
                textAlign="center"
                fontSize="2xl"
                letterSpacing="0.5em"
                maxLength={4}
              />
              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}
            </VStack>

            <Button
              colorPalette="blue"
              size="lg"
              w="full"
              onClick={handleJoin}
              disabled={pin.length !== 4}
            >
              {UI_TEXTS.join.submit}
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
