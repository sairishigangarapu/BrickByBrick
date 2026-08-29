// Shared XP/level configuration. Used by both the client-side XPProgress
// component and the server-side markLessonCompleteAction.

export interface LevelConfig {
  level: number;
  name: string;
  description: string;
  xpRequired: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, name: 'Inflation Buster', description: 'Beat inflation with your investments', xpRequired: 0 },
  { level: 2, name: 'Compound Master', description: 'Understand the power of compounding', xpRequired: 50 },
  { level: 3, name: 'Asset Expert', description: 'Know your asset classes', xpRequired: 120 },
  { level: 4, name: 'Wealth Builder', description: 'Start building real wealth', xpRequired: 200 },
  { level: 5, name: 'Financial Ninja', description: 'Master your financial future', xpRequired: 300 },
];

export function getCurrentLevel(xp: number): LevelConfig {
  let current: LevelConfig = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      current = level;
    }
  }
  return current;
}

export function getNextLevel(currentLevelIndex: number): LevelConfig | null {
  return LEVELS[currentLevelIndex + 1] ?? null;
}

export function computeLevelFromXP(xp: number): number {
  return getCurrentLevel(xp).level;
}
