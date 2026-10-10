import React from 'react';
import { Check } from 'lucide-react';
import { playCheckSound, playSuccessSound } from '../utils/sound';
import { fireCelebration } from '../utils/confetti';

interface RepetitionMatrixProps {
  currentCount: number;
  targetCount: number;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onChangeCount: (newCount: number) => void;
  maxDisplay?: number;
}

export const RepetitionMatrix: React.FC<RepetitionMatrixProps> = ({
  currentCount,
  targetCount,
  soundEnabled,
  celebrationEnabled,
  onChangeCount,
  maxDisplay = 40,
}) => {
  const displayTarget = Math.min(maxDisplay, targetCount);

  const handleBoxClick = (index: number) => {
    // index is 0-based, so checking box at index results in count = index + 1
    // If clicking on the exact currentCount, uncheck it to decrement
    let newCount: number;
    if (index + 1 === currentCount) {
      newCount = index;
    } else {
      newCount = index + 1;
    }

    if (soundEnabled) {
      if (newCount >= targetCount && newCount > currentCount) {
        playSuccessSound();
      } else {
        playCheckSound();
      }
    }

    if (celebrationEnabled && newCount === targetCount && newCount > currentCount) {
      fireCelebration();
    }

    onChangeCount(newCount);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
        <span>مصفوفة خانات التكرار (انقر الخانة لوضع علامة صح):</span>
        <span className="font-semibold text-stone-800 tabular-nums">
          {currentCount} من {targetCount}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 p-2 bg-stone-100/70 rounded-xl border border-stone-200/60 max-h-44 overflow-y-auto">
        {Array.from({ length: displayTarget }).map((_, idx) => {
          const isChecked = idx < currentCount;
          const isNextEmpty = idx === currentCount;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleBoxClick(idx)}
              title={
                isChecked
                  ? `تكرار رقم ${idx + 1} (مكتمل - انقر للإلغاء)`
                  : `انقر لوضع علامة صح للتكرار رقم ${idx + 1}`
              }
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isChecked
                  ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                  : isNextEmpty
                  ? 'bg-white border-2 border-dashed border-emerald-400 text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50'
                  : 'bg-white/80 border border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
              }`}
            >
              {isChecked ? (
                <Check size={14} strokeWidth={3} />
              ) : isNextEmpty ? (
                <span className="text-[10px] tabular-nums font-bold text-emerald-700">{idx + 1}</span>
              ) : (
                <span className="text-[10px] tabular-nums text-stone-400">{idx + 1}</span>
              )}
            </button>
          );
        })}

        {targetCount > maxDisplay && (
          <div className="flex items-center justify-center px-2 text-xs text-stone-400 font-medium">
            +{targetCount - maxDisplay} خانة أخرى
          </div>
        )}
      </div>
    </div>
  );
};
