'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UserProgress {
  xp: number;
  level: number;
  completedLessons: string[];
}

const LEVELS = [
  { level: 1, name: 'Inflation Buster', xpRequired: 0, description: 'Beat inflation with your investments' },
  { level: 2, name: 'Compound Master', xpRequired: 50, description: 'Understand the power of compounding' },
  { level: 3, name: 'Asset Expert', xpRequired: 120, description: 'Know your asset classes' },
  { level: 4, name: 'Wealth Builder', xpRequired: 200, description: 'Start building real wealth' },
  { level: 5, name: 'Financial Ninja', xpRequired: 300, description: 'Master your financial future' },
];

function getCurrentLevel(xp: number) {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      currentLevel = level;
    }
  }
  return currentLevel;
}

function getNextLevel(currentLevelIndex: number) {
  return LEVELS[currentLevelIndex + 1] || null;
}

export function XPProgress() {
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    completedLessons: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadProgress = () => {
      const stored = localStorage.getItem('brickbybrick-progress');
      if (stored) {
        setProgress(JSON.parse(stored));
      }
      setIsLoaded(true);
    };

    loadProgress();

    const handleStorage = () => loadProgress();
    const handleXPUpdate = () => loadProgress();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('xp-updated', handleXPUpdate);
    
    const interval = setInterval(loadProgress, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('xp-updated', handleXPUpdate);
      clearInterval(interval);
    };
  }, []);

  if (!isLoaded) return null;

  const currentLevelIndex = LEVELS.findIndex(l => l.level === progress.level);
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = getNextLevel(currentLevelIndex);
  const progressToNext = nextLevel 
    ? ((progress.xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
    : 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Current Level</div>
          <div className="text-lg font-bold text-gray-900">{currentLevel.name}</div>
          <div className="text-xs text-gray-500">{currentLevel.description}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">{progress.xp} XP</div>
        </div>
      </div>

      {nextLevel && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Level {currentLevel.level}</span>
            <span>{nextLevel.xpRequired - progress.xp} XP to {nextLevel.name}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressToNext, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-1">
        {LEVELS.map((level, index) => (
          <div 
            key={level.level}
            className={`text-center p-2 rounded ${
              index <= currentLevelIndex 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <div className="text-xs font-bold">{level.level}</div>
            <div className="text-[10px] truncate">{level.name.split(' ')[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function addXP(amount: number) {
  const stored = localStorage.getItem('brickbybrick-progress');
  const current = stored ? JSON.parse(stored) : { xp: 0, level: 1, completedLessons: [] };
  
  const newXP = current.xp + amount;
  const newLevel = getCurrentLevel(newXP).level;
  
  const updated = { ...current, xp: newXP, level: newLevel };
  localStorage.setItem('brickbybrick-progress', JSON.stringify(updated));
  
  window.dispatchEvent(new Event('xp-updated'));
  
  return updated;
}

export function markLessonComplete(lessonId: string) {
  const stored = localStorage.getItem('brickbybrick-progress');
  const current = stored ? JSON.parse(stored) : { xp: 0, level: 1, completedLessons: [] };
  
  if (!current.completedLessons.includes(lessonId)) {
    const updated = {
      ...current,
      completedLessons: [...current.completedLessons, lessonId],
    };
    localStorage.setItem('brickbybrick-progress', JSON.stringify(updated));
    window.dispatchEvent(new Event('xp-updated'));
    return true;
  }
  return false;
}