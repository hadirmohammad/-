import React, { useState } from 'react';
import { Surah, SurahProgress, MemorizationStatus } from '../types';
import { QuickCheckButton } from './QuickCheckButton';
import { RepetitionMatrix } from './RepetitionMatrix';
import { ChevronDown, ChevronUp, Play, FileText, CheckCircle2 } from 'lucide-react';

interface SurahCardProps {
  surah: Surah;
  progress: SurahProgress;
  mode: 'memorize' | 'revision';
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onIncrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onDecrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onChangeRepetitions: (surahId: number, newCount: number, type: 'memorize' | 'revision') => void;
  onUpdateStatus: (surahId: number, status: MemorizationStatus) => void;
  onStartSession: (surah: Surah) => void;
  onOpenDetails: (surah: Surah) => void;
}

const STATUS_LABELS: Record<MemorizationStatus, { label: string; textClass: string; borderClass: string; bgClass: string }> = {
  not_started: { label: 'لم يبدأ', textClass: 'text-stone-500', borderClass: 'border-stone-300', bgClass: 'bg-stone-50' },
  in_progress: { label: 'قيد الحفظ', textClass: 'text-amber-800', borderClass: 'border-amber-400', bgClass: 'bg-amber-50/70' },
  memorized: { label: 'تم الحفظ', textClass: 'text-emerald-800', borderClass: 'border-emerald-500', bgClass: 'bg-emerald-50/70' },
  mastered: { label: 'مُتقَن بامتياز', textClass: 'text-teal-900', borderClass: 'border-teal-600', bgClass: 'bg-teal-50' },
};

export const SurahCard: React.FC<SurahCardProps> = ({
  surah,
  progress,
  mode,
  soundEnabled,
  celebrationEnabled,
  onIncrementRepetition,
  onDecrementRepetition,
  onChangeRepetitions,
  onUpdateStatus,
  onStartSession,
  onOpenDetails,
}) => {
  const [showMatrix, setShowMatrix] = useState(false);

  const isRevision = mode === 'revision';
  const currentCount = isRevision
    ? progress.revisionCompletedRepetitions || 0
    : progress.completedRepetitions || 0;
  const targetCount = isRevision
    ? progress.revisionTargetRepetitions || 10
    : progress.targetRepetitions || 20;

  const percent = Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100));
  const statusInfo = STATUS_LABELS[progress.status || 'not_started'];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 transition-all hover:border-stone-300 hover:shadow-xs flex flex-col justify-between gap-3 relative">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Islamic Star / Octagonal Number Token */}
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-xs font-bold text-stone-700 shrink-0 tabular-nums">
            {surah.id}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-quran text-stone-900 tracking-wide leading-tight">
                سورة {surah.name}
              </h3>
              <span className="text-[11px] text-stone-400 font-normal">
                {surah.englishName}
              </span>
            </div>

            {/* Zero-Pill Unboxed Metadata separated by · */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
              <span>{surah.versesCount} آية</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{surah.revelationType === 'meccan' ? 'مكية' : 'مدنية'}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>الجزء {surah.juz}</span>
            </div>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative shrink-0">
          <select
            value={progress.status || 'not_started'}
            onChange={(e) => onUpdateStatus(surah.id, e.target.value as MemorizationStatus)}
            className={`text-xs font-semibold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
          >
            <option value="not_started">لم يبدأ</option>
            <option value="in_progress">قيد الحفظ</option>
            <option value="memorized">تم الحفظ</option>
            <option value="mastered">متقن</option>
          </select>
        </div>
      </div>

      {/* Progress Bar & Percentage Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">
            {isRevision ? 'تقدم المراجعة والتكرار' : 'نسبة تقدم الحفظ والتكرار'}
          </span>
          <span className="font-bold text-emerald-800 tabular-nums text-sm">
            {percent}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              percent >= 100
                ? 'bg-emerald-600'
                : percent >= 50
                ? 'bg-emerald-500'
                : percent > 0
                ? 'bg-amber-500'
                : 'bg-transparent'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Repetition Interaction Area: The Key Empty Checkbox */}
      <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex items-center justify-between gap-3">
        {/* The Quick Checkbox component */}
        <QuickCheckButton
          currentCount={currentCount}
          targetCount={targetCount}
          surahName={surah.name}
          soundEnabled={soundEnabled}
          celebrationEnabled={celebrationEnabled}
          onIncrement={() => onIncrementRepetition(surah.id, isRevision ? 'revision' : 'memorize')}
          onDecrement={() => onDecrementRepetition(surah.id, isRevision ? 'revision' : 'memorize')}
          label={isRevision ? 'تكرار مراجعة' : 'تكرار حفظ'}
          size="md"
        />

        {/* Quick action: Launch session or toggle matrix */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onStartSession(surah)}
            title="جلسة تكرار مركزة"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <Play size={13} />
            <span className="hidden sm:inline">جلسة</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            title={showMatrix ? 'إخفاء شبكة الخانات' : 'عرض شبكة كل الخانات'}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            {showMatrix ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Repetition Matrix */}
      {showMatrix && (
        <div className="pt-1 animate-in fade-in duration-200">
          <RepetitionMatrix
            currentCount={currentCount}
            targetCount={targetCount}
            soundEnabled={soundEnabled}
            celebrationEnabled={celebrationEnabled}
            onChangeCount={(count) =>
              onChangeRepetitions(surah.id, count, isRevision ? 'revision' : 'memorize')
            }
          />
        </div>
      )}

      {/* Footer details: Notes / Ayah range / Pages */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <span>ص {surah.pageStart} - {surah.pageEnd}</span>
          {progress.notes && (
            <span className="text-amber-700 font-medium flex items-center gap-1 truncate max-w-[140px]">
              <FileText size={11} />
              {progress.notes}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenDetails(surah)}
          className="text-stone-600 hover:text-stone-900 font-medium hover:underline cursor-pointer"
        >
          تفاصيل وتعديل
        </button>
      </div>
    </div>
  );
};
