import React, { useState, useMemo } from 'react';
import { Surah, SurahProgress, MemorizationStatus } from '../types';
import { SURAHS_DATA } from '../data/surahs';
import { SurahCard } from './SurahCard';
import { SurahRow } from './SurahRow';
import { Search, LayoutGrid, List, SlidersHorizontal, CheckCircle2, RotateCcw } from 'lucide-react';

interface SurahListViewProps {
  progressMap: Record<number, SurahProgress>;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onIncrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onDecrementRepetition: (surahId: number, type: 'memorize' | 'revision') => void;
  onChangeRepetitions: (surahId: number, newCount: number, type: 'memorize' | 'revision') => void;
  onUpdateStatus: (surahId: number, status: MemorizationStatus) => void;
  onStartSession: (surah: Surah) => void;
  onOpenDetails: (surah: Surah) => void;
}

export const SurahListView: React.FC<SurahListViewProps> = ({
  progressMap,
  soundEnabled,
  celebrationEnabled,
  onIncrementRepetition,
  onDecrementRepetition,
  onChangeRepetitions,
  onUpdateStatus,
  onStartSession,
  onOpenDetails,
}) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | MemorizationStatus>('all');
  const [juzFilter, setJuzFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'progress_desc' | 'verses_desc'>('order');
  const [repetitionMode, setRepetitionMode] = useState<'memorize' | 'revision'>('memorize');

  // Filter & Sort
  const filteredSurahs = useMemo(() => {
    return SURAHS_DATA.filter((s) => {
      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = s.name.includes(q) || s.englishName.toLowerCase().includes(q) || String(s.id) === q;
        if (!matchesName) return false;
      }

      // Status
      const item = progressMap[s.id];
      const curStatus = item?.status || 'not_started';
      if (statusFilter !== 'all' && curStatus !== statusFilter) {
        return false;
      }

      // Juz
      if (juzFilter !== 'all' && s.juz !== juzFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'all' && s.revelationType !== typeFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'order') return a.id - b.id;

      if (sortBy === 'verses_desc') return b.versesCount - a.versesCount;

      if (sortBy === 'progress_desc') {
        const itemA = progressMap[a.id];
        const itemB = progressMap[b.id];
        const targetA = repetitionMode === 'revision' ? (itemA?.revisionTargetRepetitions || 10) : (itemA?.targetRepetitions || 20);
        const countA = repetitionMode === 'revision' ? (itemA?.revisionCompletedRepetitions || 0) : (itemA?.completedRepetitions || 0);
        const pctA = countA / Math.max(1, targetA);

        const targetB = repetitionMode === 'revision' ? (itemB?.revisionTargetRepetitions || 10) : (itemB?.targetRepetitions || 20);
        const countB = repetitionMode === 'revision' ? (itemB?.revisionCompletedRepetitions || 0) : (itemB?.completedRepetitions || 0);
        const pctB = countB / Math.max(1, targetB);

        return pctB - pctA;
      }

      return a.id - b.id;
    });
  }, [search, statusFilter, juzFilter, typeFilter, sortBy, repetitionMode, progressMap]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 space-y-4">
        {/* Row 1: Search + View toggle + Repetition Mode Switch */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم السورة، رقمها (مثلاً: الكهف أو 18)..."
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl pr-10 pl-4 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Repetition Mode Segment (حفظ جديد vs مراجعة وتثبيت) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setRepetitionMode('memorize')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                repetitionMode === 'memorize'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              عرض خانات الحفظ
            </button>
            <button
              type="button"
              onClick={() => setRepetitionMode('revision')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                repetitionMode === 'revision'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              عرض خانات المراجعة
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="عرض الشبكة"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="عرض القائمة المفصلة"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Row 2: Status & Category filter buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'كافة السور (114)' },
                { id: 'in_progress', label: 'قيد الحفظ' },
                { id: 'memorized', label: 'تم الحفظ' },
                { id: 'mastered', label: 'مُتقَن' },
                { id: 'not_started', label: 'لم يبدأ' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === item.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Juz filter & Sort */}
          <div className="flex items-center gap-2">
            {/* Juz dropdown */}
            <select
              value={juzFilter}
              onChange={(e) => setJuzFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 cursor-pointer focus:outline-none"
            >
              <option value="all">كل الأجزاء (1 - 30)</option>
              {Array.from({ length: 30 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  الجزء {idx + 1}
                </option>
              ))}
            </select>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 cursor-pointer focus:outline-none"
            >
              <option value="order">ترتيب المصحف (1 - 114)</option>
              <option value="progress_desc">الأعلى نسبة تقدم</option>
              <option value="verses_desc">الأكثر آيات</option>
            </select>
          </div>
        </div>
      </div>

      {/* Surahs Counter / Instructions reminder */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          يتم عرض <strong className="text-stone-900 tabular-nums">{filteredSurahs.length}</strong> سورة
        </span>
        <span className="text-emerald-800 font-medium">
          💡 انقر على الخانة الفارغة في أي سورة لوضع علامة صح (✓) وزيادة التكرار فوراً
        </span>
      </div>

      {/* Grid or List Display */}
      {filteredSurahs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500">
          <p className="text-base font-semibold text-stone-800">لا توجد سور مطابقة لبحثك</p>
          <p className="text-xs text-stone-500 mt-1">جرب تغيير شروط البحث أو الفلاتر</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <SurahCard
              key={surah.id}
              surah={surah}
              progress={
                progressMap[surah.id] || {
                  surahId: surah.id,
                  status: 'not_started',
                  targetRepetitions: 20,
                  completedRepetitions: 0,
                  revisionTargetRepetitions: 10,
                  revisionCompletedRepetitions: 0,
                }
              }
              mode={repetitionMode}
              soundEnabled={soundEnabled}
              celebrationEnabled={celebrationEnabled}
              onIncrementRepetition={onIncrementRepetition}
              onDecrementRepetition={onDecrementRepetition}
              onChangeRepetitions={onChangeRepetitions}
              onUpdateStatus={onUpdateStatus}
              onStartSession={onStartSession}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
          {filteredSurahs.map((surah) => (
            <SurahRow
              key={surah.id}
              surah={surah}
              progress={
                progressMap[surah.id] || {
                  surahId: surah.id,
                  status: 'not_started',
                  targetRepetitions: 20,
                  completedRepetitions: 0,
                  revisionTargetRepetitions: 10,
                  revisionCompletedRepetitions: 0,
                }
              }
              mode={repetitionMode}
              soundEnabled={soundEnabled}
              celebrationEnabled={celebrationEnabled}
              onIncrementRepetition={onIncrementRepetition}
              onDecrementRepetition={onDecrementRepetition}
              onUpdateStatus={onUpdateStatus}
              onStartSession={onStartSession}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
