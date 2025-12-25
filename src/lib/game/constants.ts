export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Très facile",
  2: "Facile",
  3: "Moyen",
  4: "Difficile",
  5: "Très difficile",
};

export const THEMES = [
  "Histoire",
  "Géographie",
  "Sciences",
  "Sport",
  "Cinéma",
  "Musique",
  "Littérature",
  "Art",
  "Nature",
  "Technologie",
  "Gastronomie",
  "Culture générale",
] as const;

export const UI_TEXTS = {
  home: {
    title: "Plus Proche",
    subtitle: "Le jeu où le plus proche gagne !",
    createGame: "Créer une partie",
    joinGame: "Rejoindre",
  },
  join: {
    title: "Rejoindre une partie",
    pinLabel: "Code PIN",
    pinPlaceholder: "1234",
    nameLabel: "Votre nom",
    namePlaceholder: "Entrez votre nom",
    submit: "Rejoindre",
  },
  waiting: {
    title: "En attente des joueurs",
    sharePin: "Partagez ce code :",
    players: "Joueurs connectés",
    start: "Commencer la partie",
    minPlayers: "Il faut au moins 2 joueurs",
  },
  game: {
    round: "Manche",
    submit: "Valider",
    waiting: "En attente des autres joueurs...",
    correctAnswer: "Réponse correcte :",
    winner: "Gagnant de la manche :",
    nextPicker: "Choisit le prochain thème :",
    nextRound: "Manche suivante",
    showRanking: "Voir le classement",
  },
  scoreboard: {
    title: "Classement",
    points: "points",
  },
} as const;
