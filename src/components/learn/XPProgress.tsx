'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { LEVELS, getCurrentLevel, getNextLevel } from '@/lib/levels';

interface UserProgress {
  xp: number;
  level: number;
  completedLessons: string[];
}

export function XPProgress({ initialXP = 0, initialLevel = 1 }: { initialXP?: number; initialLevel?: number }) {
  const [progress, setProgress] = useState<UserProgress>({
    xp: initialXP,
    level: initialLevel,
    completedLessons: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProgress((prev) => ({
      ...prev,
      xp: initialXP,
      level: initialLevel,
    }));
    setIsLoaded(true);

    const handleXPUpdate = (e: any) => {
      if (e?.detail) {
        setProgress((prev) => ({
          ...prev,
          xp: e.detail.xp,
          level: e.detail.level,
        }));
      }
    };

    window.addEventListener('xp-updated', handleXPUpdate);
    return () => window.removeEventListener('xp-updated', handleXPUpdate);
  }, [initialXP, initialLevel]);

  if (!isLoaded) return null;

  const currentLevelIndex = LEVELS.findIndex((l) => l.level === progress.level);
  const currentLevel = LEVELS[currentLevelIndex] ?? LEVELS[0];
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
            <span>{Math.max(0, nextLevel.xpRequired - progress.xp)} XP to {nextLevel.name}</span>
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
              index <= currentLevelIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
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
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('brickbybrick-progress');
  const current = stored ? JSON.parse(stored) : { xp: 0, level: 1, completedLessons: [] };

  const newXP = (current.xp ?? 0) + amount;
  const newLevel = getCurrentLevel(newXP).level;

  const updated = { ...current, xp: newXP, level: newLevel };
  localStorage.setItem('brickbybrick-progress', JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('xp-updated', { detail: updated }));
  return updated;
}

export function markLessonComplete(lessonId: string) {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('brickbybrick-progress');
  const current = stored ? JSON.parse(stored) : { xp: 0, level: 1, completedLessons: [] };

  if (!current.completedLessons?.includes(lessonId)) {
    const updated = {
      ...current,
      completedLessons: [...(current.completedLessons ?? []), lessonId],
    };
    localStorage.setItem('brickbybrick-progress', JSON.stringify(updated));
    window.dispatchEvent(new Event('xp-updated'));
    return true;
  }
  return false;
}
