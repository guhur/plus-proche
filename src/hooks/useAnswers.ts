import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";
import type { Answer } from "@/lib/yjs/types";

export function useAnswers(ydoc: Y.Doc | null): {
  answers: Answer[];
  submitAnswer: (playerId: string, value: number) => void;
  clearAnswers: () => void;
  hasAnswered: (playerId: string) => boolean;
} {
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (!ydoc) return;

    const ymap = ydoc.getMap("answers");

    const updateAnswers = () => {
      const answerList: Answer[] = [];
      ymap.forEach((answerMap) => {
        const map = answerMap as Y.Map<unknown>;
        answerList.push({
          playerId: map.get("playerId") as string,
          value: map.get("value") as number,
          submittedAt: map.get("submittedAt") as number,
        });
      });
      answerList.sort((a, b) => a.submittedAt - b.submittedAt);
      setAnswers(answerList);
    };

    updateAnswers();
    ymap.observeDeep(updateAnswers);

    return () => {
      ymap.unobserveDeep(updateAnswers);
    };
  }, [ydoc]);

  const submitAnswer = useCallback(
    (playerId: string, value: number) => {
      if (!ydoc) return;

      const ymap = ydoc.getMap("answers");

      ydoc.transact(() => {
        const answerMap = new Y.Map();
        answerMap.set("playerId", playerId);
        answerMap.set("value", value);
        answerMap.set("submittedAt", Date.now());
        ymap.set(playerId, answerMap);
      });
    },
    [ydoc],
  );

  const clearAnswers = useCallback(() => {
    if (!ydoc) return;

    const ymap = ydoc.getMap("answers");
    ydoc.transact(() => {
      ymap.forEach((_, key) => {
        ymap.delete(key);
      });
    });
  }, [ydoc]);

  const hasAnswered = useCallback(
    (playerId: string) => {
      return answers.some((a) => a.playerId === playerId);
    },
    [answers],
  );

  return { answers, submitAnswer, clearAnswers, hasAnswered };
}
