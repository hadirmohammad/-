export type MemorizationStatus = 'not_started' | 'in_progress' | 'memorized' | 'mastered';

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  versesCount: number;
  revelationType: 'meccan' | 'medinan';
  juz: number;
  pageStart: number;
  pageEnd: number;
}

export interface RepetitionLog {
  date: string; // YYYY-MM-DD
  count: number;
  type: 'memorize' | 'revision' | 'near_revision' | 'distant_revision';
  timestamp: number;
  surahId?: number;
  description?: string;
}

export interface SurahProgress {
  surahId: number;
  status: MemorizationStatus;
  targetRepetitions: number;
  completedRepetitions: number;
  revisionTargetRepetitions: number;
  revisionCompletedRepetitions: number;
  lastActivityDate?: string;
  memorizedDate?: string;
  notes?: string;
  startAyah?: number;
  endAyah?: number;
}

export interface UserSettings {
  dailyRepetitionGoal: number;
  defaultMemorizeTarget: number;
  defaultRevisionTarget: number;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  activeMethod: 'standard' | 'shanqeeti' | 'twenty' | 'custom';
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DailyPlanItem {
  id: 'new_memorize' | 'near_revision' | 'distant_revision';
  title: string; // e.g. "الحفظ الجديد"
  surahId: number; // e.g. 17 (الإسراء)
  surahName: string;
  rateType: 'page' | 'hizb' | 'juz' | 'verses';
  rateLabel: string; // e.g. "صفحة في اليوم"
  dailyPace: number; // e.g. 1 page per day, 2 pages, 1 hizb, etc.
  currentUnitNumber: number; // Current page or hizb number
  startUnit: number;
  endUnit: number;
  totalUnitsInSurah: number;
  completedUnitsCount: number;
  targetRepetitionsPerSession: number; // 20 for new, 1 for revision
  sessionRepetitions: number; // reps done today in active session
  cumulativeRepetitions: number; // total cumulative repetitions across all time
  isCompletedToday: boolean;
  unitPrefix: string; // "صفحة" or "حزب"
  customNotes?: string;
}

export interface DailyPlanHistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "السبت 10 أكتوبر"
  newMemorize: {
    surahId: number;
    surahName: string;
    unitLabel: string;
    unitNumber: number;
    reps: number;
    targetReps: number;
    completed: boolean;
  };
  nearRevision: {
    surahId: number;
    surahName: string;
    unitLabel: string;
    unitNumber: number;
    reps: number;
    completed: boolean;
  };
  distantRevision: {
    surahId: number;
    surahName: string;
    unitLabel: string;
    unitNumber: number;
    reps: number;
    completed: boolean;
  };
  allCompleted: boolean;
  timestamp: number;
}

export interface QuranDailyPlan {
  enabled: boolean;
  autoAdvanceOnNewDay: boolean; // Whether each day advances to the next wird
  autoAdvanceCondition: 'always' | 'only_if_completed';
  newMemorize: DailyPlanItem;
  nearRevision: DailyPlanItem;
  distantRevision: DailyPlanItem;
  lastDateActive: string;
  completedDaysStreak: number;
  history?: DailyPlanHistoryRecord[];
}

