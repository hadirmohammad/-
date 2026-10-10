import { SurahProgress, UserSettings, RepetitionLog, QuranDailyPlan, DailyPlanItem } from '../types';
import { SURAHS_DATA, TOTAL_QURAN_VERSES, TOTAL_SURAHS } from '../data/surahs';

const PROGRESS_KEY = 'mutqin_progress_v1';
const SETTINGS_KEY = 'mutqin_settings_v1';
const LOGS_KEY = 'mutqin_logs_v1';
const PLAN_KEY = 'mutqin_daily_plan_v2';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyRepetitionGoal: 30,
  defaultMemorizeTarget: 20,
  defaultRevisionTarget: 10,
  soundEnabled: true,
  celebrationEnabled: true,
  activeMethod: 'twenty',
};

export function formatArabicDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getDefaultDailyPlan(): QuranDailyPlan {
  const today = new Date().toISOString().split('T')[0];
  return {
    enabled: true,
    autoAdvanceOnNewDay: true,
    autoAdvanceCondition: 'always',
    completedDaysStreak: 1,
    lastDateActive: today,
    history: [],
    newMemorize: {
      id: 'new_memorize',
      title: 'الحفظ الجديد',
      surahId: 17, // سورة الإسراء
      surahName: 'الإسراء',
      rateType: 'page',
      rateLabel: 'معدل صفحة في اليوم',
      dailyPace: 1,
      currentUnitNumber: 282, // Start page of Al-Isra
      startUnit: 282,
      endUnit: 293,
      totalUnitsInSurah: 12, // 12 pages (282 to 293)
      completedUnitsCount: 0,
      targetRepetitionsPerSession: 20, // 20 repetitions
      sessionRepetitions: 0,
      cumulativeRepetitions: 0,
      isCompletedToday: false,
      unitPrefix: 'صفحة',
      customNotes: 'التكرار 20 مرة غيباً ونظراً لتثبيت الحفظ',
    },
    nearRevision: {
      id: 'near_revision',
      title: 'المراجعة القريبة',
      surahId: 8, // سورة الأنفال
      surahName: 'الأنفال',
      rateType: 'hizb',
      rateLabel: 'معدل حزب في اليوم',
      dailyPace: 1,
      currentUnitNumber: 17, // Hizb 17 (pages 177 - 182)
      startUnit: 17,
      endUnit: 18,
      totalUnitsInSurah: 2, // 2 Ahzab (17 and 18)
      completedUnitsCount: 0,
      targetRepetitionsPerSession: 1, // تكرار مرة واحدة كل جلسة
      sessionRepetitions: 0,
      cumulativeRepetitions: 0,
      isCompletedToday: false,
      unitPrefix: 'الحزب',
      customNotes: 'تكرار الحزب مرة واحدة بالسرد الحاضر',
    },
    distantRevision: {
      id: 'distant_revision',
      title: 'المراجعة البعيدة',
      surahId: 2, // سورة البقرة
      surahName: 'البقرة',
      rateType: 'hizb',
      rateLabel: 'معدل حزب في اليوم',
      dailyPace: 1,
      currentUnitNumber: 1, // Hizb 1
      startUnit: 1,
      endUnit: 5,
      totalUnitsInSurah: 5, // 5 Ahzab (1 to 5)
      completedUnitsCount: 0,
      targetRepetitionsPerSession: 1, // تكرار مرة واحدة كل جلسة
      sessionRepetitions: 0,
      cumulativeRepetitions: 0,
      isCompletedToday: false,
      unitPrefix: 'الحزب',
      customNotes: 'مراجعة الماضي البعيد لضمان عدم التفلت',
    },
  };
}

export function advanceUnitNumber(
  current: number,
  pace: number,
  start: number,
  end: number,
  direction: 'next' | 'prev' = 'next'
): { unit: number; wrapped: boolean } {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  if (direction === 'next') {
    const nextVal = current + pace;
    if (nextVal > max) {
      return { unit: min, wrapped: true };
    }
    return { unit: nextVal, wrapped: false };
  } else {
    const prevVal = current - pace;
    if (prevVal < min) {
      return { unit: max, wrapped: true };
    }
    return { unit: prevVal, wrapped: false };
  }
}

export function advancePlanItem(item: DailyPlanItem, direction: 'next' | 'prev' = 'next'): DailyPlanItem {
  const pace = item.dailyPace || 1;
  const { unit } = advanceUnitNumber(
    item.currentUnitNumber,
    pace,
    item.startUnit,
    item.endUnit,
    direction
  );

  return {
    ...item,
    currentUnitNumber: unit,
    completedUnitsCount: direction === 'next' ? item.completedUnitsCount + 1 : Math.max(0, item.completedUnitsCount - 1),
    sessionRepetitions: 0,
    isCompletedToday: false,
  };
}

export function advancePlanToNextDay(plan: QuranDailyPlan, forceAdvance: boolean = true): QuranDailyPlan {
  const today = new Date().toISOString().split('T')[0];
  const allTasksCompleted =
    plan.newMemorize.isCompletedToday &&
    plan.nearRevision.isCompletedToday &&
    plan.distantRevision.isCompletedToday;

  // Create history entry for current/previous active date
  const historyDate = plan.lastDateActive || today;
  const historyRecord = {
    id: `history_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: historyDate,
    dayLabel: formatArabicDate(historyDate),
    newMemorize: {
      surahId: plan.newMemorize.surahId,
      surahName: plan.newMemorize.surahName,
      unitLabel: `${plan.newMemorize.unitPrefix} ${plan.newMemorize.currentUnitNumber}`,
      unitNumber: plan.newMemorize.currentUnitNumber,
      reps: plan.newMemorize.sessionRepetitions,
      targetReps: plan.newMemorize.targetRepetitionsPerSession,
      completed: plan.newMemorize.isCompletedToday,
    },
    nearRevision: {
      surahId: plan.nearRevision.surahId,
      surahName: plan.nearRevision.surahName,
      unitLabel: `${plan.nearRevision.unitPrefix} ${plan.nearRevision.currentUnitNumber}`,
      unitNumber: plan.nearRevision.currentUnitNumber,
      reps: plan.nearRevision.sessionRepetitions,
      completed: plan.nearRevision.isCompletedToday,
    },
    distantRevision: {
      surahId: plan.distantRevision.surahId,
      surahName: plan.distantRevision.surahName,
      unitLabel: `${plan.distantRevision.unitPrefix} ${plan.distantRevision.currentUnitNumber}`,
      unitNumber: plan.distantRevision.currentUnitNumber,
      reps: plan.distantRevision.sessionRepetitions,
      completed: plan.distantRevision.isCompletedToday,
    },
    allCompleted: allTasksCompleted,
    timestamp: Date.now(),
  };

  const existingHistory = plan.history || [];
  const filteredHistory = existingHistory.filter((h) => h.date !== historyDate);
  const updatedHistory = [historyRecord, ...filteredHistory].slice(0, 60);

  const nextNewMemorize = advancePlanItem(plan.newMemorize, 'next');
  const nextNearRevision = advancePlanItem(plan.nearRevision, 'next');
  const nextDistantRevision = advancePlanItem(plan.distantRevision, 'next');

  const newStreak = allTasksCompleted
    ? plan.completedDaysStreak + 1
    : (plan.newMemorize.isCompletedToday ? plan.completedDaysStreak : Math.max(1, plan.completedDaysStreak));

  return {
    ...plan,
    lastDateActive: today,
    completedDaysStreak: newStreak,
    newMemorize: nextNewMemorize,
    nearRevision: nextNearRevision,
    distantRevision: nextDistantRevision,
    history: updatedHistory,
  };
}

export function loadDailyPlan(): QuranDailyPlan {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    const today = new Date().toISOString().split('T')[0];
    if (!raw) {
      const defaultPlan = getDefaultDailyPlan();
      saveDailyPlan(defaultPlan);
      return defaultPlan;
    }
    const parsed: QuranDailyPlan = JSON.parse(raw);

    // Ensure default properties exist if loaded from older versions
    if (parsed.autoAdvanceOnNewDay === undefined) {
      parsed.autoAdvanceOnNewDay = true;
    }
    if (!parsed.autoAdvanceCondition) {
      parsed.autoAdvanceCondition = 'always';
    }
    if (!parsed.newMemorize.dailyPace) parsed.newMemorize.dailyPace = 1;
    if (!parsed.nearRevision.dailyPace) parsed.nearRevision.dailyPace = 1;
    if (!parsed.distantRevision.dailyPace) parsed.distantRevision.dailyPace = 1;
    if (!parsed.history) parsed.history = [];

    // If new calendar day, advance to next wird automatically if autoAdvanceOnNewDay is enabled!
    if (parsed.lastDateActive !== today) {
      const shouldAdvance =
        parsed.autoAdvanceOnNewDay !== false &&
        (parsed.autoAdvanceCondition === 'always' ||
          (parsed.newMemorize.isCompletedToday && parsed.nearRevision.isCompletedToday));

      if (shouldAdvance) {
        const advanced = advancePlanToNextDay(parsed, true);
        advanced.lastDateActive = today;
        saveDailyPlan(advanced);
        return advanced;
      } else {
        // Reset session repetitions for fresh day
        parsed.lastDateActive = today;
        parsed.newMemorize.sessionRepetitions = 0;
        parsed.newMemorize.isCompletedToday = false;
        parsed.nearRevision.sessionRepetitions = 0;
        parsed.nearRevision.isCompletedToday = false;
        parsed.distantRevision.sessionRepetitions = 0;
        parsed.distantRevision.isCompletedToday = false;
        saveDailyPlan(parsed);
        return parsed;
      }
    }
    return parsed;
  } catch {
    return getDefaultDailyPlan();
  }
}

export function saveDailyPlan(plan: QuranDailyPlan): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch (err) {
    console.error('Failed to save daily plan', err);
  }
}

// Initial state for fresh start with gentle demonstration
export function getInitialProgress(): Record<number, SurahProgress> {
  const map: Record<number, SurahProgress> = {};
  
  SURAHS_DATA.forEach((s) => {
    map[s.id] = {
      surahId: s.id,
      status: 'not_started',
      targetRepetitions: 20,
      completedRepetitions: 0,
      revisionTargetRepetitions: 10,
      revisionCompletedRepetitions: 0,
    };
  });

  const today = new Date().toISOString().split('T')[0];
  
  map[1] = {
    ...map[1],
    status: 'mastered',
    completedRepetitions: 20,
    revisionCompletedRepetitions: 15,
    memorizedDate: today,
    lastActivityDate: today,
  };

  // Surah Al-Isra configured in progress
  map[17] = {
    ...map[17],
    status: 'in_progress',
    targetRepetitions: 20,
    completedRepetitions: 0,
    revisionCompletedRepetitions: 0,
    lastActivityDate: today,
    notes: 'الحفظ الجديد بمعدل صفحة في اليوم (20 تكراراً لكل صفحة)',
  };

  // Surah Al-Anfal configured for near revision
  map[8] = {
    ...map[8],
    status: 'memorized',
    targetRepetitions: 20,
    completedRepetitions: 20,
    revisionTargetRepetitions: 10,
    revisionCompletedRepetitions: 3,
    lastActivityDate: today,
    notes: 'المراجعة القريبة بمعدل حزب في اليوم',
  };

  // Surah Al-Baqarah configured for distant revision
  map[2] = {
    ...map[2],
    status: 'memorized',
    targetRepetitions: 20,
    completedRepetitions: 20,
    revisionTargetRepetitions: 10,
    revisionCompletedRepetitions: 8,
    lastActivityDate: today,
    notes: 'المراجعة البعيدة بمعدل حزب في اليوم',
  };

  return map;
}

export function loadProgress(): Record<number, SurahProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      const initial = getInitialProgress();
      saveProgress(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    SURAHS_DATA.forEach((s) => {
      if (!parsed[s.id]) {
        parsed[s.id] = {
          surahId: s.id,
          status: 'not_started',
          targetRepetitions: 20,
          completedRepetitions: 0,
          revisionTargetRepetitions: 10,
          revisionCompletedRepetitions: 0,
        };
      }
    });
    return parsed;
  } catch {
    return getInitialProgress();
  }
}

export function saveProgress(progress: Record<number, SurahProgress>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function loadLogs(): RepetitionLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLogs(logs: RepetitionLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs', err);
  }
}

export function addRepetitionLog(
  surahId: number,
  type: 'memorize' | 'revision' | 'near_revision' | 'distant_revision',
  count: number = 1,
  description?: string
): RepetitionLog {
  const today = new Date().toISOString().split('T')[0];
  const newLog: RepetitionLog = {
    date: today,
    count,
    type,
    timestamp: Date.now(),
    surahId,
    description,
  };

  const logs = loadLogs();
  logs.push(newLog);
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  saveLogs(logs);
  return newLog;
}

export function getTodayRepetitions(logs: RepetitionLog[]): number {
  const today = new Date().toISOString().split('T')[0];
  return logs
    .filter((log) => log.date === today)
    .reduce((sum, item) => sum + (item.count || 1), 0);
}

export function getSurahStats(progressMap: Record<number, SurahProgress>) {
  let memorizedSurahs = 0;
  let inProgressSurahs = 0;
  let memorizedVerses = 0;
  let totalRepetitions = 0;

  SURAHS_DATA.forEach((s) => {
    const item = progressMap[s.id];
    if (!item) return;

    totalRepetitions += (item.completedRepetitions || 0) + (item.revisionCompletedRepetitions || 0);

    if (item.status === 'memorized' || item.status === 'mastered') {
      memorizedSurahs++;
      memorizedVerses += s.versesCount;
    } else if (item.status === 'in_progress') {
      inProgressSurahs++;
    }
  });

  const surahsPercent = Math.round((memorizedSurahs / TOTAL_SURAHS) * 100);
  const versesPercent = Math.round((memorizedVerses / TOTAL_QURAN_VERSES) * 100);

  return {
    memorizedSurahs,
    inProgressSurahs,
    memorizedVerses,
    totalRepetitions,
    surahsPercent,
    versesPercent,
  };
}

export function getJuzProgress(progressMap: Record<number, SurahProgress>) {
  const juzStats: Record<number, { totalVerses: number; memorizedVerses: number; surahs: number; memorizedSurahs: number }> = {};
  
  for (let j = 1; j <= 30; j++) {
    juzStats[j] = { totalVerses: 0, memorizedVerses: 0, surahs: 0, memorizedSurahs: 0 };
  }

  SURAHS_DATA.forEach((s) => {
    const j = s.juz;
    const item = progressMap[s.id];
    juzStats[j].totalVerses += s.versesCount;
    juzStats[j].surahs += 1;
    if (item && (item.status === 'memorized' || item.status === 'mastered')) {
      juzStats[j].memorizedVerses += s.versesCount;
      juzStats[j].memorizedSurahs += 1;
    }
  });

  return juzStats;
}
