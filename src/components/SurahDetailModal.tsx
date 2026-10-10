import React, { useState } from 'react';
import { Surah, SurahProgress, MemorizationStatus } from '../types';
import { QuickCheckButton } from './QuickCheckButton';
import { RepetitionMatrix } from './RepetitionMatrix';
import { X, Save, BookOpen, Check, Calendar, FileText } from 'lucide-react';

interface SurahDetailModalProps {
  surah: Surah | null;
  progress: SurahProgress | null;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onClose: () => void;
  onSave: (updated: Partial<SurahProgress>) => void;
  onIncrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onDecrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onChangeRepetitions: (surahId: number, newCount: number, type: 'memorize' | 'revision') => void;
}

export const SurahDetailModal: React.FC<SurahDetailModalProps> = ({
  surah,
  progress,
  soundEnabled,
  celebrationEnabled,
  onClose,
  onSave,
  onIncrementRepetition,
  onDecrementRepetition,
  onChangeRepetitions,
}) => {
  if (!surah || !progress) return null;

  const [status, setStatus] = useState<MemorizationStatus>(progress.status || 'not_started');
  const [targetRepetitions, setTargetRepetitions] = useState<number>(progress.targetRepetitions || 20);
  const [completedRepetitions, setCompletedRepetitions] = useState<number>(progress.completedRepetitions || 0);
  const [revisionTarget, setRevisionTarget] = useState<number>(progress.revisionTargetRepetitions || 10);
  const [revisionCompleted, setRevisionCompleted] = useState<number>(progress.revisionCompletedRepetitions || 0);
  const [notes, setNotes] = useState<string>(progress.notes || '');
  const [startAyah, setStartAyah] = useState<number | undefined>(progress.startAyah);
  const [endAyah, setEndAyah] = useState<number | undefined>(progress.endAyah);

  const handleSave = () => {
    onSave({
      status,
      targetRepetitions,
      completedRepetitions,
      revisionTargetRepetitions: revisionTarget,
      revisionCompletedRepetitions: revisionCompleted,
      notes,
      startAyah,
      endAyah,
      lastActivityDate: new Date().toISOString().split('T')[0],
      memorizedDate:
        (status === 'memorized' || status === 'mastered') && !progress.memorizedDate
          ? new Date().toISOString().split('T')[0]
          : progress.memorizedDate,
    });
    onClose();
  };

  const memorizationPercent = Math.min(
    100,
    Math.round((completedRepetitions / Math.max(1, targetRepetitions)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-stone-800 text-sm tabular-nums">
              {surah.id}
            </div>
            <div>
              <h3 className="text-2xl font-bold font-quran text-stone-900 leading-tight">
                سورة {surah.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <span>{surah.versesCount} آية</span>
                <span aria-hidden="true">·</span>
                <span>{surah.revelationType === 'meccan' ? 'مكية' : 'مدنية'}</span>
                <span aria-hidden="true">·</span>
                <span>جزء {surah.juz}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Status Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              حالة حفظ السورة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'not_started', label: 'لم يبدأ' },
                  { id: 'in_progress', label: 'قيد الحفظ' },
                  { id: 'memorized', label: 'تم الحفظ' },
                  { id: 'mastered', label: 'مُتقَن' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    status === item.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Memorization Repetition Area */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-stone-900 block">
                  تكرار الحفظ الجديد
                </span>
                <span className="text-xs text-stone-500">
                  نسبة الإنجاز: {memorizationPercent}%
                </span>
              </div>

              {/* Quick interactive empty checkbox inside modal */}
              <QuickCheckButton
                currentCount={completedRepetitions}
                targetCount={targetRepetitions}
                surahName={surah.name}
                soundEnabled={soundEnabled}
                celebrationEnabled={celebrationEnabled}
                onIncrement={() => {
                  setCompletedRepetitions((c) => c + 1);
                  onIncrementRepetition(surah.id, 'memorize');
                }}
                onDecrement={() => {
                  setCompletedRepetitions((c) => Math.max(0, c - 1));
                  onDecrementRepetition(surah.id, 'memorize');
                }}
                size="md"
              />
            </div>

            {/* Inputs: Target & Completed count */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
              <div>
                <label className="block text-xs text-stone-600 mb-1">
                  هدف التكرارات للحفظ:
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={targetRepetitions}
                  onChange={(e) => setTargetRepetitions(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">
                  التكرارات المنجزة حالياً:
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={completedRepetitions}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    setCompletedRepetitions(val);
                    onChangeRepetitions(surah.id, val, 'memorize');
                  }}
                  className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Repetition Matrix representation */}
            <div className="pt-2">
              <RepetitionMatrix
                currentCount={completedRepetitions}
                targetCount={targetRepetitions}
                soundEnabled={soundEnabled}
                celebrationEnabled={celebrationEnabled}
                onChangeCount={(val) => {
                  setCompletedRepetitions(val);
                  onChangeRepetitions(surah.id, val, 'memorize');
                }}
                maxDisplay={30}
              />
            </div>
          </div>

          {/* Ayah Range (Useful for large Surahs like Al-Baqarah) */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
            <span className="text-xs font-semibold text-stone-700 block">
              نطاق الآيات المستهدفة حالياً (اختياري للسور الطويلة):
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">من آية:</label>
                <input
                  type="number"
                  min="1"
                  max={surah.versesCount}
                  placeholder="1"
                  value={startAyah || ''}
                  onChange={(e) => setStartAyah(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">إلى آية:</label>
                <input
                  type="number"
                  min="1"
                  max={surah.versesCount}
                  placeholder={String(surah.versesCount)}
                  value={endAyah || ''}
                  onChange={(e) => setEndAyah(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ملاحظات أو وقفات تدبرية:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك عن هذه السورة، المتشابهات، أو خطتك..."
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Save size={14} />
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
