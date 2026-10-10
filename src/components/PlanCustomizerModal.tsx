import React, { useState } from 'react';
import { QuranDailyPlan, DailyPlanItem } from '../types';
import { SURAHS_DATA } from '../data/surahs';
import {
  X,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  FastForward,
  RotateCcw,
  Check,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { playCheckSound, playSuccessSound } from '../utils/sound';

interface PlanCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: QuranDailyPlan;
  onSavePlan: (updatedPlan: QuranDailyPlan) => void;
  onAdvanceNow: () => void;
}

export const PlanCustomizerModal: React.FC<PlanCustomizerModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSavePlan,
  onAdvanceNow,
}) => {
  const [formData, setFormData] = useState<QuranDailyPlan>(() => JSON.parse(JSON.stringify(plan)));
  const [activeSection, setActiveSection] = useState<'all' | 'new' | 'near' | 'distant' | 'settings'>('all');
  const [searchSurahNew, setSearchSurahNew] = useState('');
  const [searchSurahNear, setSearchSurahNear] = useState('');
  const [searchSurahDist, setSearchSurahDist] = useState('');

  if (!isOpen) return null;

  // Helper to update a single item
  const updateItem = (
    key: 'newMemorize' | 'nearRevision' | 'distantRevision',
    updates: Partial<DailyPlanItem>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  };

  // When user selects a surah for an item
  const handleSelectSurah = (
    key: 'newMemorize' | 'nearRevision' | 'distantRevision',
    surahId: number
  ) => {
    const surah = SURAHS_DATA.find((s) => s.id === surahId);
    if (!surah) return;

    const totalPages = Math.max(1, surah.pageEnd - surah.pageStart + 1);

    if (key === 'newMemorize') {
      updateItem('newMemorize', {
        surahId: surah.id,
        surahName: surah.name,
        currentUnitNumber: surah.pageStart,
        startUnit: surah.pageStart,
        endUnit: surah.pageEnd,
        totalUnitsInSurah: totalPages,
        completedUnitsCount: 0,
        rateType: 'page',
        unitPrefix: 'صفحة',
        rateLabel: 'معدل صفحة في اليوم',
      });
    } else {
      updateItem(key, {
        surahId: surah.id,
        surahName: surah.name,
        currentUnitNumber: surah.pageStart,
        startUnit: surah.pageStart,
        endUnit: surah.pageEnd,
        totalUnitsInSurah: totalPages,
        completedUnitsCount: 0,
      });
    }
  };

  // Presets
  const applyPreset = (presetKey: 'shanqeeti' | 'amma' | 'intensive' | 'gentle') => {
    playCheckSound();
    const today = new Date().toISOString().split('T')[0];

    if (presetKey === 'shanqeeti') {
      // 1 Page Al-Isra (20 reps) + Hizb Al-Anfal (1 rep) + Hizb Al-Baqarah (1 rep)
      setFormData({
        ...formData,
        autoAdvanceOnNewDay: true,
        autoAdvanceCondition: 'always',
        newMemorize: {
          id: 'new_memorize',
          title: 'الحفظ الجديد',
          surahId: 17,
          surahName: 'الإسراء',
          rateType: 'page',
          rateLabel: 'معدل صفحة في اليوم',
          dailyPace: 1,
          currentUnitNumber: 282,
          startUnit: 282,
          endUnit: 293,
          totalUnitsInSurah: 12,
          completedUnitsCount: 0,
          targetRepetitionsPerSession: 20,
          sessionRepetitions: 0,
          cumulativeRepetitions: formData.newMemorize.cumulativeRepetitions,
          isCompletedToday: false,
          unitPrefix: 'صفحة',
          customNotes: 'طريقة الشناقطة: تكرار الصفحة 20 مرة للإتقان الراسخ',
        },
        nearRevision: {
          id: 'near_revision',
          title: 'المراجعة القريبة',
          surahId: 8,
          surahName: 'الأنفال',
          rateType: 'hizb',
          rateLabel: 'معدل حزب في اليوم',
          dailyPace: 1,
          currentUnitNumber: 17,
          startUnit: 17,
          endUnit: 18,
          totalUnitsInSurah: 2,
          completedUnitsCount: 0,
          targetRepetitionsPerSession: 1,
          sessionRepetitions: 0,
          cumulativeRepetitions: formData.nearRevision.cumulativeRepetitions,
          isCompletedToday: false,
          unitPrefix: 'الحزب',
          customNotes: 'سرد الحزب مرة واحدة يومياً',
        },
        distantRevision: {
          id: 'distant_revision',
          title: 'المراجعة البعيدة',
          surahId: 2,
          surahName: 'البقرة',
          rateType: 'hizb',
          rateLabel: 'معدل حزب في اليوم',
          dailyPace: 1,
          currentUnitNumber: 1,
          startUnit: 1,
          endUnit: 5,
          totalUnitsInSurah: 5,
          completedUnitsCount: 0,
          targetRepetitionsPerSession: 1,
          sessionRepetitions: 0,
          cumulativeRepetitions: formData.distantRevision.cumulativeRepetitions,
          isCompletedToday: false,
          unitPrefix: 'الحزب',
          customNotes: 'مراجعة الماضي البعيد لضمان عدم النسيان',
        },
      });
    } else if (presetKey === 'amma') {
      // Juz Amma (Surah 78 An-Naba to 114 An-Nas)
      setFormData({
        ...formData,
        autoAdvanceOnNewDay: true,
        autoAdvanceCondition: 'always',
        newMemorize: {
          id: 'new_memorize',
          title: 'الحفظ الجديد (جزء عمّ)',
          surahId: 78,
          surahName: 'النبأ',
          rateType: 'page',
          rateLabel: 'معدل صفحة في اليوم',
          dailyPace: 1,
          currentUnitNumber: 582,
          startUnit: 582,
          endUnit: 604,
          totalUnitsInSurah: 23,
          completedUnitsCount: 0,
          targetRepetitionsPerSession: 15,
          sessionRepetitions: 0,
          cumulativeRepetitions: 0,
          isCompletedToday: false,
          unitPrefix: 'صفحة',
          customNotes: 'حفظ جزء عم صفحة يومياً بتكرار 15 مرة',
        },
        nearRevision: {
          id: 'near_revision',
          title: 'المراجعة القريبة',
          surahId: 67,
          surahName: 'الملك',
          rateType: 'page',
          rateLabel: 'معدل صفحتين في اليوم',
          dailyPace: 2,
          currentUnitNumber: 562,
          startUnit: 562,
          endUnit: 564,
          totalUnitsInSurah: 3,
          completedUnitsCount: 0,
          targetRepetitionsPerSession: 2,
          sessionRepetitions: 0,
          cumulativeRepetitions: 0,
          isCompletedToday: false,
          unitPrefix: 'صفحة',
          customNotes: 'مراجعة السور المقاربة',
        },
        distantRevision: {
          id: 'distant_revision',
          title: 'المراجعة البعيدة',
          surahId: 1,
          surahName: 'الفاتحة وقصار السور',
          rateType: 'hizb',
          rateLabel: 'معدل نصف حزب في اليوم',
          dailyPace: 1,
          currentUnitNumber: 59,
          startUnit: 59,
          endUnit: 60,
          totalUnitsInSurah: 2,
          completedUnitsCount: 0,
          targetRepetitionsPerSession: 1,
          sessionRepetitions: 0,
          cumulativeRepetitions: 0,
          isCompletedToday: false,
          unitPrefix: 'الحزب',
          customNotes: 'تثبيت ما سبق حفظه من قصار السور',
        },
      });
    } else if (presetKey === 'intensive') {
      // 2 pages per day + 1 Hizb revision + 1 Hizb revision
      setFormData({
        ...formData,
        autoAdvanceOnNewDay: true,
        autoAdvanceCondition: 'always',
        newMemorize: {
          ...formData.newMemorize,
          dailyPace: 2,
          rateLabel: 'معدل صفحتين في اليوم',
          targetRepetitionsPerSession: 20,
        },
        nearRevision: {
          ...formData.nearRevision,
          dailyPace: 2,
          rateLabel: 'معدل حزبين في اليوم',
        },
        distantRevision: {
          ...formData.distantRevision,
          dailyPace: 2,
          rateLabel: 'معدل حزبين في اليوم',
        },
      });
    } else if (presetKey === 'gentle') {
      // 1 page + 10 reps
      setFormData({
        ...formData,
        autoAdvanceOnNewDay: true,
        autoAdvanceCondition: 'always',
        newMemorize: {
          ...formData.newMemorize,
          dailyPace: 1,
          rateLabel: 'معدل صفحة في اليوم',
          targetRepetitionsPerSession: 10,
        },
      });
    }
  };

  const handleSave = () => {
    playSuccessSound();
    onSavePlan(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-quran text-white">
                تخطيط وتعديل الخطة اليومية للقرآن
              </h2>
              <p className="text-xs text-emerald-200">
                اختاري السور المستهدفة، معدل الورد اليومي، التكرارات، والترحيل اليومي التلقائي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-3.5 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5 ml-2">
            <Sparkles size={14} className="text-amber-500" />
            نماذج خطط مقترحة جاهزة:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('shanqeeti')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50/50 shadow-2xs transition-all cursor-pointer"
          >
            🌟 خطة الشناقطة (20 تكرار)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('amma')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50/50 shadow-2xs transition-all cursor-pointer"
          >
            📖 خطة جزء عمّ
          </button>
          <button
            type="button"
            onClick={() => applyPreset('intensive')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50/50 shadow-2xs transition-all cursor-pointer"
          >
            ⚡ خطة مكثفة (صفحتان)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('gentle')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50/50 shadow-2xs transition-all cursor-pointer"
          >
            🌱 خطة ميسرة (10 تكرارات)
          </button>
        </div>

        {/* Tab Navigation for sections */}
        <div className="px-6 pt-3 border-b border-stone-200 flex gap-2 overflow-x-auto shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'all'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            كل الأقسام معاً
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('new')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'new'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1. الحفظ الجديد ({formData.newMemorize.surahName})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('near')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'near'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            2. المراجعة القريبة ({formData.nearRevision.surahName})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('distant')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'distant'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            3. المراجعة البعيدة ({formData.distantRevision.surahName})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'settings'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ⚙️ إعدادات الترحيل اليومي
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* =================================================== */}
          {/* Section 1: الحفظ الجديد */}
          {/* =================================================== */}
          {(activeSection === 'all' || activeSection === 'new') && (
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-amber-300 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      خطة الحفظ الجديد
                    </h3>
                    <p className="text-xs text-stone-500">
                      تحديد السورة المستهدفة، معدل الورد، والصفحة المطلوبة
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  الحالي: سورة {formData.newMemorize.surahName} (ص {formData.newMemorize.currentUnitNumber})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Surah */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    السورة المستهدفة للحفظ:
                  </label>
                  <select
                    value={formData.newMemorize.surahId}
                    onChange={(e) => handleSelectSurah('newMemorize', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SURAHS_DATA.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. سورة {s.name} ({s.versesCount} آية - ص {s.pageStart} إلى {s.pageEnd})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Repetitions */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    عدد تكرارات الحفظ في الجلسة:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.newMemorize.targetRepetitionsPerSession}
                      onChange={(e) =>
                        updateItem('newMemorize', {
                          targetRepetitionsPerSession: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-24 bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 text-center focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex gap-1.5">
                      {[10, 15, 20, 30].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => updateItem('newMemorize', { targetRepetitionsPerSession: num })}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            formData.newMemorize.targetRepetitionsPerSession === num
                              ? 'bg-emerald-700 text-white'
                              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Page / Unit */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    الصفحة / الورد المطلوب اليوم:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={formData.newMemorize.currentUnitNumber}
                      onChange={(e) =>
                        updateItem('newMemorize', {
                          currentUnitNumber: Number(e.target.value),
                        })
                      }
                      className="w-28 bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 text-center focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-stone-500">
                      (نطاق السورة: ص {formData.newMemorize.startUnit} إلى ص {formData.newMemorize.endUnit})
                    </span>
                  </div>
                </div>

                {/* Daily Pace */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    معدل التقدم اليومي (كم صفحة كل يوم):
                  </label>
                  <select
                    value={formData.newMemorize.dailyPace || 1}
                    onChange={(e) => {
                      const pace = Number(e.target.value);
                      updateItem('newMemorize', {
                        dailyPace: pace,
                        rateLabel:
                          pace === 1
                            ? 'معدل صفحة في اليوم'
                            : pace === 2
                            ? 'معدل صفحتين في اليوم'
                            : `معدل ${pace} صفحات في اليوم`,
                      });
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>صفحة واحدة كل يوم (المنهج المتزن)</option>
                    <option value={2}>صفحتان كل يوم (منهج سريع)</option>
                    <option value={3}>3 صفحات كل يوم</option>
                  </select>
                </div>

                {/* Custom Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    ملاحظة أو توجيه خاص لورد الحفظ:
                  </label>
                  <input
                    type="text"
                    value={formData.newMemorize.customNotes || ''}
                    onChange={(e) => updateItem('newMemorize', { customNotes: e.target.value })}
                    placeholder="مثال: التكرار 20 مرة غيباً ونظراً لتثبيت الحفظ"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* Section 2: المراجعة القريبة */}
          {/* =================================================== */}
          {(activeSection === 'all' || activeSection === 'near') && (
            <div className="bg-teal-50/50 border border-teal-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      خطة المراجعة القريبة (الماضي القريب)
                    </h3>
                    <p className="text-xs text-stone-500">
                      مراجعة المحفوظ الحديث لتثبيته ومنع تفلته
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                  الحالي: {formData.nearRevision.surahName} ({formData.nearRevision.unitPrefix} {formData.nearRevision.currentUnitNumber})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Surah */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    السورة المستهدفة للمراجعة القريبة:
                  </label>
                  <select
                    value={formData.nearRevision.surahId}
                    onChange={(e) => handleSelectSurah('nearRevision', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {SURAHS_DATA.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. سورة {s.name} ({s.versesCount} آية)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    نوع تقسيم الورد:
                  </label>
                  <select
                    value={formData.nearRevision.rateType}
                    onChange={(e) => {
                      const type = e.target.value as 'hizb' | 'page' | 'juz';
                      const prefix = type === 'hizb' ? 'الحزب' : type === 'page' ? 'صفحة' : 'الجزء';
                      updateItem('nearRevision', {
                        rateType: type,
                        unitPrefix: prefix,
                        rateLabel: `معدل ${prefix} في اليوم`,
                      });
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="hizb">بالأحزاب (الحزب)</option>
                    <option value="page">بالصفحات (الصفحة)</option>
                    <option value="juz">بالأجزاء (الجزء)</option>
                  </select>
                </div>

                {/* Current Unit Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    رقم {formData.nearRevision.unitPrefix} المطلوب اليوم:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={formData.nearRevision.currentUnitNumber}
                    onChange={(e) =>
                      updateItem('nearRevision', {
                        currentUnitNumber: Number(e.target.value),
                      })
                    }
                    className="w-28 bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 text-center focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Daily Pace */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    معدل التقدم اليومي:
                  </label>
                  <select
                    value={formData.nearRevision.dailyPace || 1}
                    onChange={(e) =>
                      updateItem('nearRevision', {
                        dailyPace: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={1}>1 {formData.nearRevision.unitPrefix} كل يوم</option>
                    <option value={2}>2 {formData.nearRevision.unitPrefix} كل يوم</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* Section 3: المراجعة البعيدة */}
          {/* =================================================== */}
          {(activeSection === 'all' || activeSection === 'distant') && (
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-800 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      خطة المراجعة البعيدة (الماضي البعيد)
                    </h3>
                    <p className="text-xs text-stone-500">
                      دوران الختمة والمراجعة العامة لجميع السور المحفوظة قديماً
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                  الحالي: {formData.distantRevision.surahName} ({formData.distantRevision.unitPrefix} {formData.distantRevision.currentUnitNumber})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Surah */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    السورة أو النطاق المستهدف:
                  </label>
                  <select
                    value={formData.distantRevision.surahId}
                    onChange={(e) => handleSelectSurah('distantRevision', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {SURAHS_DATA.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. سورة {s.name} ({s.versesCount} آية)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    نوع تقسيم الورد:
                  </label>
                  <select
                    value={formData.distantRevision.rateType}
                    onChange={(e) => {
                      const type = e.target.value as 'hizb' | 'page' | 'juz';
                      const prefix = type === 'hizb' ? 'الحزب' : type === 'page' ? 'صفحة' : 'الجزء';
                      updateItem('distantRevision', {
                        rateType: type,
                        unitPrefix: prefix,
                        rateLabel: `معدل ${prefix} في اليوم`,
                      });
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="hizb">بالأحزاب (الحزب)</option>
                    <option value="juz">بالأجزاء (الجزء)</option>
                    <option value="page">بالصفحات (الصفحة)</option>
                  </select>
                </div>

                {/* Current Unit Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    رقم {formData.distantRevision.unitPrefix} المطلوب اليوم:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={formData.distantRevision.currentUnitNumber}
                    onChange={(e) =>
                      updateItem('distantRevision', {
                        currentUnitNumber: Number(e.target.value),
                      })
                    }
                    className="w-28 bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 text-center focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Daily Pace */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    معدل التقدم اليومي:
                  </label>
                  <select
                    value={formData.distantRevision.dailyPace || 1}
                    onChange={(e) =>
                      updateItem('distantRevision', {
                        dailyPace: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={1}>1 {formData.distantRevision.unitPrefix} كل يوم</option>
                    <option value={2}>2 {formData.distantRevision.unitPrefix} كل يوم</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* Section 4: إعدادات الترحيل اليومي للورد */}
          {/* =================================================== */}
          {(activeSection === 'all' || activeSection === 'settings') && (
            <div className="bg-stone-50 border border-stone-300/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <div className="w-8 h-8 rounded-xl bg-stone-800 text-white font-bold flex items-center justify-center text-xs">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    إعدادات الترحيل التلقائي للورد كل يوم
                  </h3>
                  <p className="text-xs text-stone-500">
                    التحكم في إضافة الورد الذي بعده كل يوم تلقائياً أو عند الطلب
                  </p>
                </div>
              </div>

              {/* Auto Advance Toggle */}
              <div className="flex items-start justify-between gap-4 p-3.5 bg-white rounded-xl border border-stone-200">
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    إضافة الورد التالي تلقائياً كل يوم جديد
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    عند بدء يوم تقويمي جديد، يقوم التطبيق بترحيل الحفظ والمراجعة للصفحة/الحزب التالي تلقائياً.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={formData.autoAdvanceOnNewDay}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        autoAdvanceOnNewDay: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Condition */}
              {formData.autoAdvanceOnNewDay && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-700 block">
                    شرط الانتقال للورد التالي:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center gap-2 text-xs text-stone-800 cursor-pointer">
                      <input
                        type="radio"
                        name="autoAdvanceCondition"
                        value="always"
                        checked={formData.autoAdvanceCondition === 'always'}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, autoAdvanceCondition: 'always' }))
                        }
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>دائماً مع حلول اليوم الجديد (موصى به للانتظام)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-stone-800 cursor-pointer">
                      <input
                        type="radio"
                        name="autoAdvanceCondition"
                        value="only_if_completed"
                        checked={formData.autoAdvanceCondition === 'only_if_completed'}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, autoAdvanceCondition: 'only_if_completed' }))
                        }
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>فقط إذا أتممت ورد اليوم السابق بالكامل</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Manual Advance Button test */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-xs text-stone-500">
                  هل تريدين اختبار الانتقال الآن مباشرة؟
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playCheckSound();
                    onAdvanceNow();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <FastForward size={14} />
                  <span>ترحيل لليوم التالي الآن (تجربة الورد التالي)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500">
            سيتم حفظ جميع التعديلات ومزامنتها تلقائياً مع جداول الحفظ والمراجعة.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check size={16} strokeWidth={3} />
              <span>حفظ وتطبيق الخطة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
