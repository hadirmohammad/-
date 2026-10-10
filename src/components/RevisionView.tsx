import React, { useState } from 'react';
import { Surah, SurahProgress, MemorizationStatus } from '../types';
import { SURAHS_DATA } from '../data/surahs';
import { QuickCheckButton } from './QuickCheckButton';
import { CheckCircle2, RotateCcw, Sparkles, Calendar, BookOpen } from 'lucide-react';

interface RevisionViewProps {
  progressMap: Record<number, SurahProgress>;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onIncrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onDecrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onUpdateStatus: (surahId: number, status: MemorizationStatus) => void;
  onStartSession: (surah: Surah) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  progressMap,
  soundEnabled,
  celebrationEnabled,
  onIncrementRepetition,
  onDecrementRepetition,
  onUpdateStatus: _onUpdateStatus,
  onStartSession,
}) => {
  const [filterType, setFilterType] = useState<'all_memorized' | 'in_progress' | 'all'>('all_memorized');
  const [searchQuery, setSearchQuery] = useState('');

  // Find memorized or mastered surahs
  const filteredSurahs = SURAHS_DATA.filter((s) => {
    const item = progressMap[s.id];
    const status = item?.status || 'not_started';

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = s.name.includes(q) || s.englishName.toLowerCase().includes(q) || String(s.id) === q;
      if (!matchName) return false;
    }

    if (filterType === 'all_memorized') {
      return status === 'memorized' || status === 'mastered';
    }
    if (filterType === 'in_progress') {
      return status === 'in_progress';
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles size={16} />
            <span>المعاهدة والمراجعة الدائمة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-quran mb-2">
            مراجعة وتثبيت سور القرآن الكريم
          </h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            قال النبي ﷺ: «تعاهدوا هذا القرآن، فوالذي نفس محمد بيده لهو أشد تفلتا من الإبل في عقلها».
            سجّل تكرارات ورد المراجعة اليومي بالضغط على الخانة الفارغة للتثبيت والإتقان.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all_memorized')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'all_memorized'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            السور المحفوظة (تحتاج مراجعة)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('in_progress')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'in_progress'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            قيد الحفظ (مراجعة مصاحبة)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            كل السور (114)
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="ابحث عن سورة للمراجعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Revision Surahs List */}
      {filteredSurahs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
          <BookOpen size={36} className="mx-auto text-stone-300 mb-2" />
          <p className="text-base font-semibold text-stone-800">لا توجد سور مطابقة في هذا التصنيف</p>
          <p className="text-xs text-stone-500 mt-1">
            قم بتحديد حالة السور كـ (تم الحفظ) في قائمة السور لتبدأ بجدول مراجعتها هنا.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSurahs.map((surah) => {
            const item = progressMap[surah.id] || {
              surahId: surah.id,
              status: 'not_started',
              targetRepetitions: 20,
              completedRepetitions: 0,
              revisionTargetRepetitions: 10,
              revisionCompletedRepetitions: 0,
            };

            const revCount = item.revisionCompletedRepetitions || 0;
            const revTarget = item.revisionTargetRepetitions || 10;
            const percent = Math.min(100, Math.round((revCount / Math.max(1, revTarget)) * 100));

            return (
              <div
                key={surah.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 transition-all hover:border-stone-300 hover:shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 font-bold flex items-center justify-center text-xs tabular-nums">
                      {surah.id}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-quran text-stone-900">
                        سورة {surah.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <span>{surah.versesCount} آية</span>
                        <span aria-hidden="true">·</span>
                        <span>جزء {surah.juz}</span>
                        <span aria-hidden="true">·</span>
                        <span>ص {surah.pageStart}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartSession(surah)}
                    className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    جلسة تكرار
                  </button>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                    <span>نسبة إنجاز تكرار المراجعة</span>
                    <span className="font-bold text-teal-800 tabular-nums">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* The Checkbox element */}
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center justify-between">
                  <QuickCheckButton
                    currentCount={revCount}
                    targetCount={revTarget}
                    surahName={surah.name}
                    soundEnabled={soundEnabled}
                    celebrationEnabled={celebrationEnabled}
                    onIncrement={() => onIncrementRepetition(surah.id, 'revision')}
                    onDecrement={() => onDecrementRepetition(surah.id, 'revision')}
                    label="تكرار مراجعة"
                    size="md"
                  />

                  {item.lastActivityDate && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Calendar size={12} />
                      <span>آخر تكرار: {item.lastActivityDate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
