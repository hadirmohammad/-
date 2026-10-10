import React from 'react';
import { SurahProgress } from '../types';
import { SURAHS_DATA, TOTAL_QURAN_VERSES, TOTAL_SURAHS } from '../data/surahs';
import { getSurahStats, getJuzProgress } from '../utils/storage';
import { BookOpen, Sparkles, Trophy, CheckCircle2, Layers } from 'lucide-react';

interface StatsViewProps {
  progressMap: Record<number, SurahProgress>;
  todayCount: number;
  dailyGoal: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ progressMap, todayCount, dailyGoal }) => {
  const stats = getSurahStats(progressMap);
  const juzStats = getJuzProgress(progressMap);

  const dailyPercent = Math.min(100, Math.round((todayCount / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top 4 KPI Metrics in a row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Quran Memorized % */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>نسبة حفظ القرآن</span>
            <BookOpen size={16} className="text-emerald-700" />
          </div>
          <div className="text-3xl font-bold text-emerald-800 tabular-nums">
            {stats.versesPercent}%
          </div>
          <div className="text-xs text-stone-500 mt-1">
            <strong className="text-stone-800 tabular-nums">{stats.memorizedVerses}</strong> من{' '}
            <span className="tabular-nums">{TOTAL_QURAN_VERSES}</span> آية
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${stats.versesPercent}%` }} />
          </div>
        </div>

        {/* KPI 2: Memorized Surahs */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>السور المحفوظة</span>
            <Trophy size={16} className="text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-stone-900 tabular-nums">
            {stats.memorizedSurahs}{' '}
            <span className="text-sm font-normal text-stone-500">/ {TOTAL_SURAHS}</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            <span>قيد الحفظ: <strong className="text-amber-700 tabular-nums">{stats.inProgressSurahs}</strong> سورة</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.surahsPercent}%` }} />
          </div>
        </div>

        {/* KPI 3: Total Repetitions */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>إجمالي التكرارات المسجلة</span>
            <Sparkles size={16} className="text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-teal-800 tabular-nums">
            {stats.totalRepetitions.toLocaleString('ar-EG')}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            <span>تكرار حفظ وتثبيت</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: `100%` }} />
          </div>
        </div>

        {/* KPI 4: Today's Repetition Goal */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>الهدف اليومي للتكرار</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-stone-900 tabular-nums">
            {todayCount}{' '}
            <span className="text-sm font-normal text-stone-500">/ {dailyGoal}</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            <span>نسبة إنجاز اليوم: <strong className="text-stone-800 tabular-nums">{dailyPercent}%</strong></span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${dailyPercent >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'}`}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Juz-by-Juz Breakdown (الأجزاء من 1 إلى 30) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-emerald-800" />
            <h3 className="text-lg font-bold text-stone-900 font-quran">
              نسبة إنجاز أجزاء القرآن الكريم (30 جزءاً)
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            مبني على الآيات المحفوظة في كل جزء
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 30 }).map((_, idx) => {
            const juzNum = idx + 1;
            const data = juzStats[juzNum];
            const pct = data.totalVerses > 0 ? Math.round((data.memorizedVerses / data.totalVerses) * 100) : 0;
            const isFull = pct >= 100;

            return (
              <div
                key={juzNum}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isFull
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : pct > 0
                    ? 'bg-amber-50/50 border-amber-200 text-stone-900'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <div className="text-xs font-bold font-quran mb-1">
                  الجزء {juzNum}
                </div>
                <div className="text-xl font-bold tabular-nums">
                  {pct}%
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {data.memorizedSurahs}/{data.surahs} سورة
                </div>
                <div className="w-full h-1 bg-stone-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isFull ? 'bg-emerald-600' : pct > 0 ? 'bg-amber-500' : 'bg-transparent'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
