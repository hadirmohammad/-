import React, { useState, useEffect } from 'react';
import { Surah, SurahProgress } from '../types';
import { SURAHS_DATA } from '../data/surahs';
import { Check, RotateCcw, Plus, Sparkles, BookOpen, Clock, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';
import { playCheckSound, playSuccessSound } from '../utils/sound';
import { fireCelebration } from '../utils/confetti';

interface ActiveSessionViewProps {
  initialSurahId?: number;
  progressMap: Record<number, SurahProgress>;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onIncrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onDecrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onChangeRepetitions: (surahId: number, newCount: number, type: 'memorize' | 'revision') => void;
  onUpdateTarget: (surahId: number, newTarget: number, type: 'memorize' | 'revision') => void;
}

export const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({
  initialSurahId = 1,
  progressMap,
  soundEnabled,
  celebrationEnabled,
  onIncrementRepetition,
  onDecrementRepetition,
  onChangeRepetitions,
  onUpdateTarget,
}) => {
  const [selectedSurahId, setSelectedSurahId] = useState<number>(initialSurahId);
  const [sessionMode, setSessionMode] = useState<'memorize' | 'revision'>('memorize');
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [justChecked, setJustChecked] = useState<boolean>(false);

  // Sync initialSurahId if changes from parent
  useEffect(() => {
    if (initialSurahId) {
      setSelectedSurahId(initialSurahId);
    }
  }, [initialSurahId]);

  // Session timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const currentSurah = SURAHS_DATA.find((s) => s.id === selectedSurahId) || SURAHS_DATA[0];
  const surahProgress = progressMap[selectedSurahId] || {
    surahId: selectedSurahId,
    status: 'not_started',
    targetRepetitions: 20,
    completedRepetitions: 0,
    revisionTargetRepetitions: 10,
    revisionCompletedRepetitions: 0,
  };

  const isRevision = sessionMode === 'revision';
  const totalCount = isRevision
    ? surahProgress.revisionCompletedRepetitions || 0
    : surahProgress.completedRepetitions || 0;
  const targetCount = isRevision
    ? surahProgress.revisionTargetRepetitions || 10
    : surahProgress.targetRepetitions || 20;

  const percentage = Math.min(100, Math.round((totalCount / Math.max(1, targetCount)) * 100));
  const isTargetAchieved = totalCount >= targetCount;

  const handleBoxClick = () => {
    setJustChecked(true);
    setSessionCount((c) => c + 1);

    if (soundEnabled) {
      if (totalCount + 1 >= targetCount) {
        playSuccessSound();
      } else {
        playCheckSound();
      }
    }

    if (celebrationEnabled && totalCount + 1 === targetCount) {
      fireCelebration();
    }

    onIncrementRepetition(selectedSurahId, sessionMode);

    setTimeout(() => {
      setJustChecked(false);
    }, 700);
  };

  const handleMatrixBoxClick = (index: number) => {
    const newCount = index + 1 === totalCount ? index : index + 1;
    if (soundEnabled) {
      if (newCount >= targetCount && newCount > totalCount) {
        playSuccessSound();
      } else {
        playCheckSound();
      }
    }
    if (celebrationEnabled && newCount === targetCount && newCount > totalCount) {
      fireCelebration();
    }
    onChangeRepetitions(selectedSurahId, newCount, sessionMode);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const presetTargets = [10, 20, 30, 40];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Surah Selector & Session Mode Strip */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Surah Dropdown with previous / next */}
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            disabled={selectedSurahId <= 1}
            onClick={() => setSelectedSurahId((id) => Math.max(1, id - 1))}
            className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="السورة السابقة"
          >
            <ChevronRight size={18} />
          </button>

          <div className="flex-1">
            <label htmlFor="session-surah-select" className="block text-xs text-stone-500 mb-1 font-medium">
              اختر السورة للتكرار:
            </label>
            <select
              id="session-surah-select"
              value={selectedSurahId}
              onChange={(e) => {
                setSelectedSurahId(Number(e.target.value));
                setSessionCount(0);
              }}
              className="w-full text-base font-bold font-quran bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {SURAHS_DATA.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. سورة {s.name} ({s.versesCount} آية - جزء {s.juz})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={selectedSurahId >= 114}
            onClick={() => setSelectedSurahId((id) => Math.min(114, id + 1))}
            className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="السورة التالية"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Mode Toggle (Segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setSessionMode('memorize')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              sessionMode === 'memorize'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            تكرار الحفظ الجديد
          </button>
          <button
            type="button"
            onClick={() => setSessionMode('revision')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              sessionMode === 'revision'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            تكرار المراجعة والتثبيت
          </button>
        </div>
      </div>

      {/* Main Focus Box: Big Interactive Checkbox & Live Progress */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Subtle decorative Quranic background glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700" />

        {/* Surah Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>سورة رقم {currentSurah.id}</span>
            <span aria-hidden="true">·</span>
            <span>{currentSurah.versesCount} آية</span>
            <span aria-hidden="true">·</span>
            <span>{currentSurah.revelationType === 'meccan' ? 'مكية' : 'مدنية'}</span>
            <span aria-hidden="true">·</span>
            <span>الجزء {currentSurah.juz} (صفحة {currentSurah.pageStart})</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold font-quran text-stone-900 tracking-wide mt-1">
            سورة {currentSurah.name}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {isRevision ? 'جلسة تثبيت ومراجعة مستمرة' : 'جلسة حفظ وتكرار متقن'}
          </p>
        </div>

        {/* THE CORE REQUEST: Large tactile Check Box for Instant Increment */}
        <div className="my-8 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleBoxClick}
            className={`group relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-4 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 active:scale-95 ${
              isTargetAchieved
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : justChecked
                ? 'bg-emerald-100 border-emerald-600 text-emerald-800 scale-105 shadow-md'
                : 'bg-stone-50 hover:bg-emerald-50/60 border-stone-300 hover:border-emerald-500 text-stone-400 hover:text-emerald-700 shadow-sm'
            }`}
          >
            {/* Visual Checkmark inside the box */}
            {isTargetAchieved ? (
              <Check size={68} strokeWidth={3.5} className="animate-in zoom-in-50 duration-200" />
            ) : justChecked ? (
              <Check size={68} strokeWidth={3.5} className="text-emerald-700 animate-in zoom-in-75 duration-150" />
            ) : (
              <div className="flex flex-col items-center">
                {/* Empty check box icon representation with dashed box */}
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-stone-400 group-hover:border-emerald-600 flex items-center justify-center transition-colors mb-2">
                  <Check size={32} className="opacity-0 group-hover:opacity-60 text-emerald-600 transition-opacity" />
                </div>
                <span className="text-xs font-semibold text-stone-600 group-hover:text-emerald-800">
                  انقر لوضع (✓)
                </span>
              </div>
            )}

            {/* Float +1 animation */}
            {justChecked && (
              <span className="absolute -top-3 text-sm font-bold text-emerald-800 bg-white border border-emerald-300 rounded-full px-3 py-0.5 shadow-sm animate-bounce tabular-nums">
                +1 تكرار
              </span>
            )}
          </button>

          <p className="text-sm font-medium text-stone-600 mt-4">
            ضع علامة صح داخل الخانة لتسجيل تكرار التلاوة
          </p>
        </div>

        {/* Live Progress Bar & Quantitative Display */}
        <div className="max-w-md mx-auto space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600 font-medium">نسبة التقدم والإنجاز</span>
            <span className="text-2xl font-bold text-emerald-800 tabular-nums">
              {percentage}%
            </span>
          </div>

          <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                percentage >= 100
                  ? 'bg-emerald-600'
                  : percentage >= 50
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>
              تم إنجاز: <strong className="text-stone-900 tabular-nums">{totalCount}</strong> من{' '}
              <strong className="text-stone-900 tabular-nums">{targetCount}</strong> تكرار
            </span>
            <span>
              المتبقي: <strong className="text-stone-900 tabular-nums">{Math.max(0, targetCount - totalCount)}</strong>
            </span>
          </div>
        </div>

        {/* Quick Target Repetitions Selector */}
        <div className="max-w-md mx-auto pt-3 pb-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <span>هدف التكرار للسورة:</span>
          <div className="flex items-center gap-1.5">
            {presetTargets.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onUpdateTarget(selectedSurahId, num, sessionMode)}
                className={`px-2.5 py-1 rounded-md font-semibold tabular-nums transition-colors cursor-pointer ${
                  targetCount === num
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Repetition Boxes Matrix: User can see each checkbox filled */}
        <div className="max-w-xl mx-auto pt-4 border-t border-stone-100 text-right">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
            <span className="font-semibold">خانات التكرار بالتفصيل (انقر أي خانة لتحديدها):</span>
            <span className="text-stone-400">
              {totalCount >= targetCount ? 'أحسنت! اكتمل الهدف المبارك' : 'كل خانة = تكرار واحد'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 justify-center">
            {Array.from({ length: targetCount }).map((_, idx) => {
              const isChecked = idx < totalCount;
              const isNext = idx === totalCount;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMatrixBoxClick(idx)}
                  title={`خانة التكرار ${idx + 1}`}
                  className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                      : isNext
                      ? 'bg-white border-2 border-dashed border-emerald-500 text-emerald-700 hover:bg-emerald-50 ring-2 ring-emerald-200'
                      : 'bg-white border border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-700'
                  }`}
                >
                  {isChecked ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <span className="tabular-nums">{idx + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Session Bottom Bar: Quick Adjustments, Session Timer & Count */}
        <div className="max-w-xl mx-auto mt-6 pt-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          {/* Timer & Session tally */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-stone-400" />
              <span>وقت الجلسة:</span>
              <span className="font-bold text-stone-800 tabular-nums">{formatTime(secondsElapsed)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              <span>تكرارات الجلسة:</span>
              <span className="font-bold text-emerald-800 tabular-nums">+{sessionCount}</span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={totalCount <= 0}
              onClick={() => onDecrementRepetition(selectedSurahId, sessionMode)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="تراجع عن تكرار واحد"
            >
              <RotateCcw size={13} />
              <span>تراجع (-1)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextTarget = Math.min(targetCount, totalCount + 5);
                onChangeRepetitions(selectedSurahId, nextTarget, sessionMode);
                setSessionCount((c) => c + 5);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200 cursor-pointer font-semibold"
              title="إضافة 5 تكرارات دفعة واحدة"
            >
              <Plus size={13} />
              <span>+5 تكرار</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
