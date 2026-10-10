import React, { useState } from 'react';
import { Check, Plus, RotateCcw } from 'lucide-react';
import { playCheckSound, playSuccessSound } from '../utils/sound';
import { fireCelebration } from '../utils/confetti';

interface QuickCheckButtonProps {
  currentCount: number;
  targetCount: number;
  surahName: string;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onIncrement: () => void;
  onDecrement?: () => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercent?: boolean;
}

export const QuickCheckButton: React.FC<QuickCheckButtonProps> = ({
  currentCount,
  targetCount,
  surahName: _surahName,
  soundEnabled,
  celebrationEnabled,
  onIncrement,
  onDecrement,
  size = 'md',
  label = 'تسجيل تكرار',
  showPercent = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [recentlyChecked, setRecentlyChecked] = useState(false);

  const percentage = Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100));
  const isCompleted = currentCount >= targetCount;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setRecentlyChecked(true);

    if (soundEnabled) {
      if (currentCount + 1 >= targetCount) {
        playSuccessSound();
      } else {
        playCheckSound();
      }
    }

    if (celebrationEnabled && currentCount + 1 === targetCount) {
      fireCelebration();
    }

    onIncrement();

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);

    setTimeout(() => {
      setRecentlyChecked(false);
    }, 1200);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDecrement && currentCount > 0) {
      onDecrement();
    }
  };

  // Dimensions based on size
  const boxClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-11 h-11 rounded-xl text-sm',
    lg: 'w-16 h-16 rounded-2xl text-base',
  }[size];

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 28,
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* The empty/checked interactive box */}
      <button
        type="button"
        onClick={handleClick}
        title="انقر لوضع علامة (✓) وزيادة التكرار"
        className={`relative flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${boxClasses} ${
          isCompleted
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700'
            : recentlyChecked
            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 shadow-sm'
            : 'bg-white hover:bg-emerald-50/70 border-2 border-stone-300 hover:border-emerald-500 text-stone-400 hover:text-emerald-600 shadow-xs'
        } ${isAnimating ? 'scale-90 ring-4 ring-emerald-200' : 'hover:scale-105 active:scale-95'}`}
      >
        {/* Animated Check or Ghost Check */}
        {isCompleted ? (
          <Check size={iconSize} strokeWidth={3} className="animate-in zoom-in-75 duration-150" />
        ) : recentlyChecked ? (
          <Check size={iconSize} strokeWidth={3} className="text-emerald-700 animate-in zoom-in-75 duration-150" />
        ) : (
          <div className="group-hover:opacity-60 flex items-center justify-center">
            {/* Empty box indication with a very subtle plus / check cue on hover */}
            <span className="opacity-0 hover:opacity-100 text-emerald-500 transition-opacity">
              <Check size={iconSize - 2} strokeWidth={2.5} />
            </span>
          </div>
        )}

        {/* Small floating +1 indicator */}
        {isAnimating && (
          <span className="absolute -top-3.5 -right-2 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full px-1.5 py-0.2 shadow-xs animate-bounce pointer-events-none tabular-nums">
            +1
          </span>
        )}
      </button>

      {/* Repetition info & label */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500 font-medium whitespace-nowrap">{label}</span>
          {showPercent && (
            <span
              className={`text-xs font-bold tabular-nums ${
                isCompleted ? 'text-emerald-700' : 'text-stone-700'
              }`}
            >
              {percentage}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-stone-600">
          <span className="font-bold text-stone-900 tabular-nums">{currentCount}</span>
          <span className="text-stone-400">/</span>
          <span className="text-stone-500 tabular-nums">{targetCount} تكرار</span>

          {currentCount > 0 && onDecrement && (
            <button
              type="button"
              onClick={handleUndo}
              title="تراجع عن تكرار واحد (-1)"
              className="mr-1 text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors"
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
