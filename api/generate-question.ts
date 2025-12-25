import Anthropic from "@anthropic-ai/sdk";

interface RequestBody {
  theme: string;
  difficulty: number;
  previousQuestions?: string[];
}

interface QuestionResponse {
  question: string;
  answer: number;
  explanation?: string;
}

const DIFFICULTY_PROMPTS: Record<number, string> = {
  1: "tres facile (pour enfants de 8-10 ans)",
  2: "facile (niveau college)",
  3: "moyen (niveau lycee)",
  4: "difficile (culture generale avancee)",
  5: "tres difficile (expert, connaissance pointue)",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { theme, difficulty, previousQuestions = [] } = body;

    const difficultyLabel =
      DIFFICULTY_PROMPTS[difficulty] ?? DIFFICULTY_PROMPTS[3];

    const prompt = `Tu es un maitre de jeu pour un quiz francais appele "Plus Proche".
Genere UNE question de culture generale en francais dont la reponse est un NOMBRE ENTIER ou DECIMAL.

Theme: ${theme}
Difficulte: ${difficultyLabel}

La question doit:
- Avoir une reponse numerique precise et verifiable
- Etre interessante et educative
- Etre formulee clairement en francais
- La reponse doit etre un nombre (pas une date, sauf si c'est une annee)
${previousQuestions.length > 0 ? `- NE PAS etre une des questions suivantes: ${previousQuestions.join(", ")}` : ""}

Exemples de bonnes questions:
- "Combien de couleurs y a-t-il dans un arc-en-ciel?" (7)
- "Combien de pattes a une araignee?" (8)
- "Quelle est la temperature d'ebullition de l'eau en degres Celsius?" (100)
- "Combien de joueurs composent une equipe de football sur le terrain?" (11)

Reponds UNIQUEMENT en JSON valide, sans markdown:
{"question": "La question en francais", "answer": 42, "explanation": "Courte explication"}`;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return new Response(
        JSON.stringify({ error: "Unexpected response type" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const parsed = JSON.parse(content.text) as QuestionResponse;

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating question:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate question" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config = {
  runtime: "edge",
};
