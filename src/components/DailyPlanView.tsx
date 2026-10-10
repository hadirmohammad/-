import React, { useState } from 'react';
import { QuranDailyPlan, DailyPlanItem } from '../types';
import { SURAHS_DATA } from '../data/surahs';
import { PlanCustomizerModal } from './PlanCustomizerModal';
import {
  advancePlanItem,
  advancePlanToNextDay,
  formatArabicDate,
} from '../utils/storage';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  FastForward,
  Layers,
  History,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { playCheckSound, playSuccessSound } from '../utils/sound';
import { fireCelebration } from '../utils/confetti';

interface DailyPlanViewProps {
  plan: QuranDailyPlan;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onUpdatePlan: (updatedPlan: QuranDailyPlan) => void;
  onStartFullSession: (surahId: number) => void;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  plan,
  soundEnabled,
  celebrationEnabled,
  onUpdatePlan,
  onStartFullSession,
}) => {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [justCheckedItem, setJustCheckedItem] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Active surahs metadata
  const newMemoSurah =
    SURAHS_DATA.find((s) => s.id === plan.newMemorize.surahId) || SURAHS_DATA[16];
  const nearRevSurah =
    SURAHS_DATA.find((s) => s.id === plan.nearRevision.surahId) || SURAHS_DATA[7];
  const distRevSurah =
    SURAHS_DATA.find((s) => s.id === plan.distantRevision.surahId) || SURAHS_DATA[1];

  // Stats
  const completedTasksCount =
    (plan.newMemorize.isCompletedToday ? 1 : 0) +
    (plan.nearRevision.isCompletedToday ? 1 : 0) +
    (plan.distantRevision.isCompletedToday ? 1 : 0);

  const completionPercentage = Math.round((completedTasksCount / 3) * 100);

  const showNotification = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  // Handler for New Memorization repetitions
  const handleIncrementNewMemorize = () => {
    const item = plan.newMemorize;
    const newSessionReps = item.sessionRepetitions + 1;
    const newCumulative = item.cumulativeRepetitions + 1;
    const isCompleted = newSessionReps >= item.targetRepetitionsPerSession;

    setJustCheckedItem('new_memorize');

    if (soundEnabled) {
      if (isCompleted) {
        playSuccessSound();
      } else {
        playCheckSound();
      }
    }

    if (celebrationEnabled && isCompleted) {
      fireCelebration();
    }

    onUpdatePlan({
      ...plan,
      newMemorize: {
        ...item,
        sessionRepetitions: newSessionReps,
        cumulativeRepetitions: newCumulative,
        isCompletedToday: isCompleted || item.isCompletedToday,
      },
    });

    setTimeout(() => setJustCheckedItem(null), 800);
  };

  const handleDecrementNewMemorize = () => {
    const item = plan.newMemorize;
    if (item.sessionRepetitions <= 0) return;

    onUpdatePlan({
      ...plan,
      newMemorize: {
        ...item,
        sessionRepetitions: Math.max(0, item.sessionRepetitions - 1),
        cumulativeRepetitions: Math.max(0, item.cumulativeRepetitions - 1),
        isCompletedToday: item.sessionRepetitions - 1 >= item.targetRepetitionsPerSession,
      },
    });
  };

  // Step an individual item forward or backward
  const handleStepUnit = (
    key: 'newMemorize' | 'nearRevision' | 'distantRevision',
    direction: 'next' | 'prev'
  ) => {
    if (soundEnabled) playCheckSound();
    const updatedItem = advancePlanItem(plan[key], direction);
    onUpdatePlan({
      ...plan,
      [key]: updatedItem,
    });
    showNotification(
      direction === 'next'
        ? `تم الانتقال للورد التالي في ${plan[key].title}: ${updatedItem.unitPrefix} ${updatedItem.currentUnitNumber}`
        : `تم الرجوع للورد السابق في ${plan[key].title}: ${updatedItem.unitPrefix} ${updatedItem.currentUnitNumber}`
    );
  };

  // Complete page & advance to next page in New Memorization
  const handleCompletePageAndAdvance = () => {
    if (soundEnabled) playSuccessSound();
    if (celebrationEnabled) fireCelebration();

    const updatedItem = advancePlanItem(plan.newMemorize, 'next');
    onUpdatePlan({
      ...plan,
      newMemorize: {
        ...updatedItem,
        completedUnitsCount: plan.newMemorize.completedUnitsCount + 1,
        isCompletedToday: false, // Ready for the new page
      },
    });

    showNotification(
      `مبارك إتمام الورد! تم إضافة ورد الحفظ التالي: ${updatedItem.unitPrefix} ${updatedItem.currentUnitNumber}`
    );
  };

  // Handlers for Revision (Once per session + cumulative count)
  const handleToggleRevision = (type: 'nearRevision' | 'distantRevision') => {
    const item = plan[type];
    const isCurrentlyDone = item.isCompletedToday;

    setJustCheckedItem(type);

    if (!isCurrentlyDone) {
      if (soundEnabled) playSuccessSound();
      if (celebrationEnabled) fireCelebration();
    } else {
      if (soundEnabled) playCheckSound();
    }

    onUpdatePlan({
      ...plan,
      [type]: {
        ...item,
        isCompletedToday: !isCurrentlyDone,
        sessionRepetitions: !isCurrentlyDone ? 1 : 0,
        cumulativeRepetitions: !isCurrentlyDone
          ? item.cumulativeRepetitions + 1
          : Math.max(0, item.cumulativeRepetitions - 1),
      },
    });

    setTimeout(() => setJustCheckedItem(null), 800);
  };

  // Master Action: Advance all awrad to next day
  const handleMasterAdvanceToNextDay = () => {
    if (soundEnabled) playSuccessSound();
    if (celebrationEnabled) fireCelebration();

    const advancedPlan = advancePlanToNextDay(plan, true);
    onUpdatePlan(advancedPlan);
    showNotification('🎉 تم ترحيل الورد وإضافة ورد اليوم التالي في الحفظ والمراجعة بنجاح!');
  };

  // Generate 5-day forecast
  const getNextDaysForecast = () => {
    const days = [];
    const today = new Date();
    const memoPace = plan.newMemorize.dailyPace || 1;
    const nearPace = plan.nearRevision.dailyPace || 1;
    const distPace = plan.distantRevision.dailyPace || 1;

    for (let i = 1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayLabel = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(d);

      const nextMemo = plan.newMemorize.currentUnitNumber + i * memoPace;
      const nextNear = plan.nearRevision.currentUnitNumber + i * nearPace;
      const nextDist = plan.distantRevision.currentUnitNumber + i * distPace;

      days.push({
        dayName: i === 1 ? 'غداً' : i === 2 ? 'بعد غد' : dayLabel,
        fullDate: dayLabel,
        newMemoText: `${plan.newMemorize.surahName} (${plan.newMemorize.unitPrefix} ${nextMemo})`,
        nearRevText: `${plan.nearRevision.surahName} (${plan.nearRevision.unitPrefix} ${nextNear})`,
        distRevText: `${plan.distantRevision.surahName} (${plan.distantRevision.unitPrefix} ${nextDist})`,
      });
    }
    return days;
  };

  const newMemoPct = Math.min(
    100,
    Math.round(
      (plan.newMemorize.sessionRepetitions / plan.newMemorize.targetRepetitionsPerSession) * 100
    )
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Banner Notification */}
      {bannerNotice && (
        <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-lg border border-emerald-600 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <Sparkles size={18} className="text-amber-300 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="text-emerald-200 hover:text-white text-xs font-bold px-2 py-1"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Hero Daily Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Sparkles size={14} />
              <span>خطة الحفظ والمراجعة اليومية المرنة</span>
              <span className="text-emerald-200">·</span>
              <span>{formatArabicDate(plan.lastDateActive || new Date().toISOString().split('T')[0])}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-quran text-white tracking-wide">
              جدول الورد اليومي للحفظ والمراجعة
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              خطة ثلاثية متقنة: حفظ جديد ({newMemoSurah.name} · {plan.newMemorize.unitPrefix} {plan.newMemorize.currentUnitNumber}) ·
              مراجعة قريبة ({nearRevSurah.name} · {plan.nearRevision.unitPrefix} {plan.nearRevision.currentUnitNumber}) ·
              مراجعة بعيدة ({distRevSurah.name} · {plan.distantRevision.unitPrefix} {plan.distantRevision.currentUnitNumber}).
            </p>

            {/* Quick Actions Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <SlidersHorizontal size={15} />
                <span>تخطيط وتعديل الخطة بحرية</span>
              </button>

              <button
                type="button"
                onClick={handleMasterAdvanceToNextDay}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                title="ترحيل جميع الأوراد لليوم التالي والبدء بورد الغد"
              >
                <FastForward size={15} className="text-amber-300" />
                <span>بدء ورد الغد / ترحيل لليوم التالي</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForecast(!showForecast)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  showForecast
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-emerald-100'
                }`}
              >
                <CalendarDays size={14} />
                <span>أوراد الأيام القادمة</span>
              </button>

              {plan.history && plan.history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    showHistory
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-100'
                  }`}
                >
                  <History size={14} />
                  <span>سجل الأيام السابقة ({plan.history.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Daily Progress Gauge & Streak */}
          <div className="flex flex-row md:flex-col items-center gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/20"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400 transition-all duration-500 ease-out"
                    strokeDasharray={`${completionPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-white tabular-nums">
                  {completionPercentage}%
                </span>
              </div>

              <div>
                <div className="text-xs text-emerald-200 font-medium">إنجاز ورد اليوم</div>
                <div className="text-lg font-bold text-white tabular-nums">
                  {completedTasksCount} من 3 أوراد
                </div>
                <div className="text-[11px] text-emerald-300">
                  {completedTasksCount === 3 ? '🎉 اكتمل الورد بحمد الله!' : 'باقي القليل للإتقان'}
                </div>
              </div>
            </div>

            {/* Auto Advance Status Badge */}
            <div className="text-[11px] text-emerald-200/90 flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
              <Calendar size={13} className="text-amber-400" />
              <span>
                {plan.autoAdvanceOnNewDay !== false
                  ? '✅ الترحيل التلقائي مفعل يومياً'
                  : '⏸️ الترحيل اليومي يدوي'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Drawer (When Toggled) */}
      {showForecast && (
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-5 border border-stone-800 shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <CalendarDays size={17} />
              <span>معاينة جدول الأوراد المتوقعة للأيام القادمة</span>
            </div>
            <button
              type="button"
              onClick={() => setShowForecast(false)}
              className="text-xs text-stone-400 hover:text-white"
            >
              إغلاق المعاينة
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {getNextDaysForecast().map((f, i) => (
              <div
                key={i}
                className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700 space-y-2 text-right"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">{f.dayName}</span>
                  <span className="text-[10px] text-stone-400">{f.fullDate}</span>
                </div>
                <div className="text-xs space-y-1.5 pt-1 border-t border-stone-700/60">
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-semibold">
                      الحفظ الجديد:
                    </span>
                    <span className="text-xs text-white font-bold">{f.newMemoText}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-400 block font-semibold">
                      المراجعة القريبة:
                    </span>
                    <span className="text-xs text-stone-200">{f.nearRevText}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 block font-semibold">
                      المراجعة البعيدة:
                    </span>
                    <span className="text-xs text-stone-200">{f.distRevText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previous History Drawer (When Toggled) */}
      {showHistory && plan.history && plan.history.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
              <History size={17} />
              <span>سجل الأوراد السابقة المنجزة (التاريخ والإنجاز)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              إغلاق السجل
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {plan.history.map((record) => (
              <div
                key={record.id}
                className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>{record.dayLabel}</span>
                    {record.allCompleted ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        مكتمل بالكامل ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                        جزئي
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      🟢 <strong>الحفظ:</strong> سورة {record.newMemorize.surahName} (
                      {record.newMemorize.unitLabel}) · {record.newMemorize.reps} تكراراً
                    </span>
                    <span>
                      🔵 <strong>مراجعة قريبة:</strong> سورة {record.nearRevision.surahName} (
                      {record.nearRevision.unitLabel})
                    </span>
                    <span>
                      🟠 <strong>مراجعة بعيدة:</strong> سورة {record.distantRevision.surahName} (
                      {record.distantRevision.unitLabel})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Main Daily Task Cards */}
      <div className="space-y-5">
        {/* ========================================================= */}
        {/* 1. الحفظ الجديد */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-5 sm:p-7 shadow-xs relative">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm tabular-nums shrink-0 shadow-xs">
                {newMemoSurah.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    القسم 1: الحفظ الجديد
                  </span>
                  <span className="text-xs text-stone-500">
                    {plan.newMemorize.rateLabel} · {plan.newMemorize.targetRepetitionsPerSession} تكراراً
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-quran text-stone-900 mt-0.5">
                  سورة {newMemoSurah.name} ({newMemoSurah.versesCount} آية)
                </h3>
              </div>
            </div>

            {/* Stepper & Current Target Page */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-stone-500 block">ورد الحفظ اليوم:</span>
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  {plan.newMemorize.unitPrefix} {plan.newMemorize.currentUnitNumber}{' '}
                  <span className="text-xs font-normal text-stone-400">
                    (نطاق ص {plan.newMemorize.startUnit} إلى {plan.newMemorize.endUnit})
                  </span>
                </span>
              </div>

              {/* Prev / Next buttons for easy navigation */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleStepUnit('newMemorize', 'prev')}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="الرجوع للورد السابق"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepUnit('newMemorize', 'next')}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="الانتقال للورد التالي"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                title="تعديل هذا القسم"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Interactive Repetition Area */}
          <div className="py-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
              {/* The Big Clickable Empty Box */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleIncrementNewMemorize}
                  title="انقر لوضع علامة (✓) وزيادة تكرار الحفظ"
                  className={`w-16 h-16 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 ${
                    plan.newMemorize.sessionRepetitions >= plan.newMemorize.targetRepetitionsPerSession
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : justCheckedItem === 'new_memorize'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                      : 'bg-white hover:bg-emerald-50/70 border-stone-300 hover:border-emerald-500 text-stone-400 hover:text-emerald-700 shadow-xs'
                  }`}
                >
                  {plan.newMemorize.sessionRepetitions >= plan.newMemorize.targetRepetitionsPerSession ? (
                    <Check size={32} strokeWidth={3} />
                  ) : justCheckedItem === 'new_memorize' ? (
                    <Check size={32} strokeWidth={3} className="text-emerald-700" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Check size={22} className="opacity-0 hover:opacity-100 text-emerald-600" />
                      <span className="text-[10px] font-bold text-stone-500 mt-0.5">+1</span>
                    </div>
                  )}
                </button>

                <div className="text-right">
                  <div className="text-xs text-stone-500 font-medium">
                    انقر الخانة الفارغة لتسجيل تكرار التلاوة
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-bold text-stone-900 tabular-nums">
                      {plan.newMemorize.sessionRepetitions}
                    </span>
                    <span className="text-sm text-stone-400">/</span>
                    <span className="text-sm font-semibold text-stone-600 tabular-nums">
                      {plan.newMemorize.targetRepetitionsPerSession} تكراراً
                    </span>
                    <span className="text-xs font-bold text-emerald-800 mr-2 tabular-nums">
                      ({newMemoPct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Cumulative stats & Undo */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-xs text-stone-500 text-left sm:text-right pl-3 border-l border-stone-200">
                  <span>إجمالي التكرارات التراكمية:</span>
                  <div className="font-bold text-stone-900 text-sm tabular-nums">
                    {plan.newMemorize.cumulativeRepetitions} تكراراً
                  </div>
                </div>

                {plan.newMemorize.sessionRepetitions > 0 && (
                  <button
                    type="button"
                    onClick={handleDecrementNewMemorize}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    title="تراجع عن تكرار واحد"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Checkbox Matrix for targetRepetitions */}
            <div className="p-3 bg-stone-50/70 rounded-2xl border border-stone-200/60">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold text-stone-700">
                  خانات تكرار {plan.newMemorize.unitPrefix} {plan.newMemorize.currentUnitNumber} (
                  {plan.newMemorize.targetRepetitionsPerSession} خانة):
                </span>
                <span>كل خانة = تلاوة واحدة غيباً أو نظراً</span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: plan.newMemorize.targetRepetitionsPerSession }).map((_, idx) => {
                  const isChecked = idx < plan.newMemorize.sessionRepetitions;
                  const isNext = idx === plan.newMemorize.sessionRepetitions;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newCount = idx + 1;
                        if (soundEnabled) {
                          if (newCount >= plan.newMemorize.targetRepetitionsPerSession)
                            playSuccessSound();
                          else playCheckSound();
                        }
                        if (
                          celebrationEnabled &&
                          newCount === plan.newMemorize.targetRepetitionsPerSession
                        )
                          fireCelebration();

                        onUpdatePlan({
                          ...plan,
                          newMemorize: {
                            ...plan.newMemorize,
                            sessionRepetitions: newCount,
                            cumulativeRepetitions:
                              plan.newMemorize.cumulativeRepetitions +
                              (newCount - plan.newMemorize.sessionRepetitions),
                            isCompletedToday:
                              newCount >= plan.newMemorize.targetRepetitionsPerSession ||
                              plan.newMemorize.isCompletedToday,
                          },
                        });
                      }}
                      className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : isNext
                          ? 'bg-white border-2 border-dashed border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                          : 'bg-white border border-stone-200 text-stone-400 hover:border-stone-400'
                      }`}
                      title={`تكرار رقم ${idx + 1}`}
                    >
                      {isChecked ? <Check size={16} strokeWidth={3} /> : idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Page Completion & Next Page Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
              <div className="text-xs text-stone-500">
                {plan.newMemorize.unitPrefix} {newMemoSurah.name} المنجزة:{' '}
                <strong className="text-stone-900 tabular-nums">
                  {plan.newMemorize.completedUnitsCount}
                </strong>{' '}
                من <span className="tabular-nums">{plan.newMemorize.totalUnitsInSurah}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStartFullSession(newMemoSurah.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  فتح جلسة الحفظ الموسعة
                </button>

                <button
                  type="button"
                  onClick={handleCompletePageAndAdvance}
                  className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                    plan.newMemorize.sessionRepetitions >=
                    plan.newMemorize.targetRepetitionsPerSession
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    إتمام {plan.newMemorize.unitPrefix} {plan.newMemorize.currentUnitNumber} وإضافة الورد التالي
                  </span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. المراجعة القريبة */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-800 text-amber-300 font-bold flex items-center justify-center text-sm tabular-nums shrink-0">
                {nearRevSurah.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                    القسم 2: المراجعة القريبة (الماضي القريب)
                  </span>
                  <span className="text-xs text-stone-500">
                    {plan.nearRevision.rateLabel} · تكرار بالجلسة
                  </span>
                </div>
                <h3 className="text-xl font-bold font-quran text-stone-900 mt-0.5">
                  سورة {nearRevSurah.name} ({nearRevSurah.versesCount} آية)
                </h3>
              </div>
            </div>

            {/* Stepper & Current Target */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-stone-500 block">ورد المراجعة اليوم:</span>
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  {plan.nearRevision.unitPrefix} {plan.nearRevision.currentUnitNumber}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleStepUnit('nearRevision', 'prev')}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="الرجوع للورد السابق"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepUnit('nearRevision', 'next')}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="الانتقال للورد التالي"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="p-2 text-stone-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                title="تعديل هذا القسم"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* The single-session check box */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggleRevision('nearRevision')}
                className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer select-none active:scale-95 ${
                  plan.nearRevision.isCompletedToday
                    ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                    : 'bg-white hover:bg-teal-50 border-stone-300 hover:border-teal-500 text-stone-400'
                }`}
                title="اضغط لوضع علامة صح وإتمام ورد المراجعة القريبة اليوم"
              >
                {plan.nearRevision.isCompletedToday ? (
                  <Check size={26} strokeWidth={3} />
                ) : (
                  <Check size={20} className="opacity-0 hover:opacity-100 text-teal-600" />
                )}
              </button>

              <div>
                <div className="text-xs font-bold text-stone-900">
                  {plan.nearRevision.isCompletedToday
                    ? '✅ تم إتمام ورد المراجعة بنجاح اليوم'
                    : 'خانة وضع علامة (✓) لإتمام ورد المراجعة اليوم'}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  التكرار التراكمي لسورة {nearRevSurah.name}:{' '}
                  <strong className="text-teal-900 tabular-nums">
                    {plan.nearRevision.cumulativeRepetitions}
                  </strong>{' '}
                  مرة مراجعة
                </div>
              </div>
            </div>

            {/* Advance button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepUnit('nearRevision', 'next')}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>الانتقال للورد التالي ({plan.nearRevision.unitPrefix} {plan.nearRevision.currentUnitNumber + 1})</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. المراجعة البعيدة */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-800 text-white font-bold flex items-center justify-center text-sm tabular-nums shrink-0">
                {distRevSurah.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md">
                    القسم 3: المراجعة البعيدة (الماضي البعيد)
                  </span>
                  <span className="text-xs text-stone-500">
                    {plan.distantRevision.rateLabel} · تكرار بالجلسة
                  </span>
                </div>
                <h3 className="text-xl font-bold font-quran text-stone-900 mt-0.5">
                  سورة {distRevSurah.name} ({distRevSurah.versesCount} آية)
                </h3>
              </div>
            </div>

            {/* Stepper & Current Target */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-stone-500 block">ورد المراجعة اليوم:</span>
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  {plan.distantRevision.unitPrefix} {plan.distantRevision.currentUnitNumber}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleStepUnit('distantRevision', 'prev')}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="الرجوع للورد السابق"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepUnit('distantRevision', 'next')}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="الانتقال للورد التالي"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="p-2 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                title="تعديل هذا القسم"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* The single-session check box */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggleRevision('distantRevision')}
                className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer select-none active:scale-95 ${
                  plan.distantRevision.isCompletedToday
                    ? 'bg-amber-700 border-amber-700 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 border-stone-300 hover:border-amber-500 text-stone-400'
                }`}
                title="اضغط لوضع علامة صح وإتمام ورد المراجعة البعيدة اليوم"
              >
                {plan.distantRevision.isCompletedToday ? (
                  <Check size={26} strokeWidth={3} />
                ) : (
                  <Check size={20} className="opacity-0 hover:opacity-100 text-amber-600" />
                )}
              </button>

              <div>
                <div className="text-xs font-bold text-stone-900">
                  {plan.distantRevision.isCompletedToday
                    ? '✅ تم إتمام مراجعة ورد اليوم'
                    : 'خانة وضع علامة (✓) لإتمام ورد المراجعة اليوم'}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  التكرار التراكمي لسورة {distRevSurah.name}:{' '}
                  <strong className="text-amber-900 tabular-nums">
                    {plan.distantRevision.cumulativeRepetitions}
                  </strong>{' '}
                  مرة مراجعة
                </div>
              </div>
            </div>

            {/* Advance button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepUnit('distantRevision', 'next')}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>الانتقال للورد التالي ({plan.distantRevision.unitPrefix} {plan.distantRevision.currentUnitNumber + 1})</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Customizer Modal */}
      <PlanCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        plan={plan}
        onSavePlan={(updated) => {
          onUpdatePlan(updated);
          showNotification('تم حفظ وتطبيق تعديلات الخطة اليومية بنجاح!');
        }}
        onAdvanceNow={handleMasterAdvanceToNextDay}
      />
    </div>
  );
};
