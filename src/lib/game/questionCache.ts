const CACHE_KEY = "questionCache";
const MAX_QUESTIONS_PER_THEME = 20;

type CachedQuestion = {
  theme: string;
  question: string;
};

function getAllCachedQuestions(): CachedQuestion[] {
  const stored = localStorage.getItem(CACHE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as CachedQuestion[];
  } catch {
    return [];
  }
}

export function getRecentQuestions(theme: string): string[] {
  const all = getAllCachedQuestions();
  return all
    .filter((q) => q.theme === theme)
    .slice(0, MAX_QUESTIONS_PER_THEME)
    .map((q) => q.question);
}

export function addQuestionToCache(theme: string, question: string): void {
  const all = getAllCachedQuestions();

  // Add new question at the beginning
  all.unshift({ theme, question });

  // Keep only the last N questions per theme
  const themeCount: Record<string, number> = {};
  const trimmed = all.filter((q) => {
    themeCount[q.theme] = (themeCount[q.theme] ?? 0) + 1;
    return themeCount[q.theme] <= MAX_QUESTIONS_PER_THEME;
  });

  localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
}
