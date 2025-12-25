import type { Difficulty } from "@/lib/yjs/types";

interface GenerateQuestionParams {
  theme: string;
  difficulty: Difficulty;
  previousQuestions?: string[];
}

interface GeneratedQuestion {
  question: string;
  answer: number;
  explanation?: string;
}

export async function generateQuestion(
  params: GenerateQuestionParams,
): Promise<GeneratedQuestion> {
  const response = await fetch("/api/generate-question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la generation de la question");
  }

  return response.json();
}
