import React from 'react';
import { Surah, SurahProgress, MemorizationStatus } from '../types';
import { QuickCheckButton } from './QuickCheckButton';
import { Play } from 'lucide-react';

interface SurahRowProps {
  surah: Surah;
  progress: SurahProgress;
  mode: 'memorize' | 'revision';
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onIncrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onDecrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onUpdateStatus: (surahId: number, status: MemorizationStatus) => void;
  onStartSession: (surah: Surah) => void;
  onOpenDetails: (surah: Surah) => void;
}

const STATUS_LABELS: Record<MemorizationStatus, { label: string; textClass: string; bgClass: string }> = {
  not_started: { label: 'لم يبدأ', textClass: 'text-stone-500', bgClass: 'bg-stone-100' },
  in_progress: { label: 'قيد الحفظ', textClass: 'text-amber-800', bgClass: 'bg-amber-100/60' },
  memorized: { label: 'تم الحفظ', textClass: 'text-emerald-800', bgClass: 'bg-emerald-100/60' },
  mastered: { label: 'متقن', textClass: 'text-teal-900', bgClass: 'bg-teal-100/70' },
};

export const SurahRow: React.FC<SurahRowProps> = ({
  surah,
  progress,
  mode,
  soundEnabled,
  celebrationEnabled,
  onIncrementRepetition,
  onDecrementRepetition,
  onUpdateStatus,
  onStartSession,
  onOpenDetails,
}) => {
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
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-stone-50 border-b border-stone-200/80 transition-colors">
      {/* Col 1: Number & Surah Name */}
      <div className="flex items-center gap-3 min-w-[180px] sm:min-w-[220px]">
        <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center text-xs font-bold tabular-nums shrink-0">
          {surah.id}
        </div>
        <div>
          <button
            type="button"
            onClick={() => onOpenDetails(surah)}
            className="text-right text-base font-bold font-quran text-stone-900 hover:text-emerald-800 block cursor-pointer"
          >
            سورة {surah.name}
          </button>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>{surah.versesCount} آية</span>
            <span aria-hidden="true">·</span>
            <span>جزء {surah.juz}</span>
            <span aria-hidden="true">·</span>
            <span>{surah.revelationType === 'meccan' ? 'مكية' : 'مدنية'}</span>
          </div>
        </div>
      </div>

      {/* Col 2: Status */}
      <div className="hidden md:block shrink-0">
        <select
          value={progress.status || 'not_started'}
          onChange={(e) => onUpdateStatus(surah.id, e.target.value as MemorizationStatus)}
          className={`text-xs font-semibold py-1 px-2 rounded-lg border border-stone-200 cursor-pointer ${statusInfo.bgClass} ${statusInfo.textClass}`}
        >
          <option value="not_started">لم يبدأ</option>
          <option value="in_progress">قيد الحفظ</option>
          <option value="memorized">تم الحفظ</option>
          <option value="mastered">متقن</option>
        </select>
      </div>

      {/* Col 3: Progress Bar & Percent */}
      <div className="hidden lg:flex flex-col gap-1 w-36 shrink-0">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span>التقدم</span>
          <span className="font-bold text-emerald-800 tabular-nums">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              percent >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Col 4: Interactive Empty Check Box (The Key Feature) */}
      <div className="shrink-0">
        <QuickCheckButton
          currentCount={currentCount}
          targetCount={targetCount}
          surahName={surah.name}
          soundEnabled={soundEnabled}
          celebrationEnabled={celebrationEnabled}
          onIncrement={() => onIncrementRepetition(surah.id, isRevision ? 'revision' : 'memorize')}
          onDecrement={() => onDecrementRepetition(surah.id, isRevision ? 'revision' : 'memorize')}
          label="تكرار"
          size="sm"
        />
      </div>

      {/* Col 5: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onStartSession(surah)}
          title="جلسة تكرار"
          className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
        >
          <Play size={16} />
        </button>
      </div>
    </div>
  );
};
