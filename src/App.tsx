import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DailyPlanView } from './components/DailyPlanView';
import { SurahListView } from './components/SurahListView';
import { ActiveSessionView } from './components/ActiveSessionView';
import { RevisionView } from './components/RevisionView';
import { StatsView } from './components/StatsView';
import { SurahDetailModal } from './components/SurahDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { LaunchModal } from './components/LaunchModal';
import { InstallBanner } from './components/InstallBanner';
import {
  loadProgress,
  saveProgress,
  loadSettings,
  saveSettings,
  loadLogs,
  saveLogs,
  loadDailyPlan,
  saveDailyPlan,
  getDefaultDailyPlan,
  addRepetitionLog,
  getTodayRepetitions,
  getInitialProgress,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { Surah, SurahProgress, MemorizationStatus, UserSettings, RepetitionLog, QuranDailyPlan } from './types';
import { SURAHS_DATA } from './data/surahs';
import { Check, Sparkles } from 'lucide-react';
import { CloudSyncModal } from './components/CloudSyncModal';
import {
  ensureSignedIn,
  testConnection,
  saveCloudDailyPlan,
  subscribeToCloudDailyPlan,
  saveCloudProgress,
  subscribeToCloudProgress,
  saveCloudSettings,
  subscribeToCloudSettings,
  auth,
} from './lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [progressMap, setProgressMap] = useState<Record<number, SurahProgress>>({});
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<RepetitionLog[]>([]);
  const [dailyPlan, setDailyPlan] = useState<QuranDailyPlan>(getDefaultDailyPlan);
  const [activeTab, setActiveTab] = useState<'plan' | 'surahs' | 'session' | 'revision' | 'stats'>('plan');
  const [sessionSurahId, setSessionSurahId] = useState<number>(17); // Default to Al-Isra for new memorization
  const [detailsSurah, setDetailsSurah] = useState<Surah | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState<boolean>(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data from localStorage on mount and start Firestore cloud synchronization
  useEffect(() => {
    const loadedProgress = loadProgress();
    const loadedSettings = loadSettings();
    const loadedLogs = loadLogs();
    const loadedPlan = loadDailyPlan();

    setProgressMap(loadedProgress);
    setSettings(loadedSettings);
    setLogs(loadedLogs);
    setDailyPlan(loadedPlan);

    // Test connection & authenticate
    testConnection();
    ensureSignedIn();

    // Listen to Auth & subscribe to live Cloud Sync
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const effectiveUid = localStorage.getItem('mutqin_linked_uid') || user.uid;

        // 1. Subscribe to Cloud Daily Plan
        const unsubPlan = subscribeToCloudDailyPlan(effectiveUid, (cloudPlan) => {
          if (cloudPlan && cloudPlan.newMemorize) {
            setDailyPlan(cloudPlan);
            saveDailyPlan(cloudPlan);
            setLastSyncTime(new Date());
          }
        });

        // 2. Subscribe to Cloud Progress
        const unsubProgress = subscribeToCloudProgress(effectiveUid, (cloudMap) => {
          if (cloudMap && Object.keys(cloudMap).length > 0) {
            setProgressMap(cloudMap);
            saveProgress(cloudMap);
            setLastSyncTime(new Date());
          }
        });

        // 3. Subscribe to Cloud Settings
        const unsubSettings = subscribeToCloudSettings(effectiveUid, (cloudSettings) => {
          if (cloudSettings) {
            setSettings(cloudSettings);
            saveSettings(cloudSettings);
            setLastSyncTime(new Date());
          }
        });

        return () => {
          unsubPlan();
          unsubProgress();
          unsubSettings();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);


  // Show transient toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Increment repetition (+1) with the empty checkbox
  const handleIncrementRepetition = (surahId: number, type: 'memorize' | 'revision') => {
    const today = new Date().toISOString().split('T')[0];
    const surah = SURAHS_DATA.find((s) => s.id === surahId);
    const surahName = surah ? surah.name : '';

    setProgressMap((prev) => {
      const current = prev[surahId] || {
        surahId,
        status: 'not_started',
        targetRepetitions: settings.defaultMemorizeTarget,
        completedRepetitions: 0,
        revisionTargetRepetitions: settings.defaultRevisionTarget,
        revisionCompletedRepetitions: 0,
      };

      const isRevision = type === 'revision';
      const updatedCount = isRevision
        ? (current.revisionCompletedRepetitions || 0) + 1
        : (current.completedRepetitions || 0) + 1;

      const target = isRevision
        ? (current.revisionTargetRepetitions || 10)
        : (current.targetRepetitions || 20);

      const percent = Math.min(100, Math.round((updatedCount / Math.max(1, target)) * 100));

      // Auto upgrade status if not started
      let newStatus = current.status;
      if (newStatus === 'not_started' && updatedCount > 0) {
        newStatus = 'in_progress';
      }
      if (updatedCount >= target && newStatus === 'in_progress') {
        newStatus = 'memorized';
      }

      const updatedItem: SurahProgress = {
        ...current,
        status: newStatus,
        completedRepetitions: isRevision ? current.completedRepetitions : updatedCount,
        revisionCompletedRepetitions: isRevision ? updatedCount : current.revisionCompletedRepetitions,
        lastActivityDate: today,
        memorizedDate: newStatus === 'memorized' && !current.memorizedDate ? today : current.memorizedDate,
      };

      const nextMap = { ...prev, [surahId]: updatedItem };
      saveProgress(nextMap);
      syncProgressToCloud(nextMap);

      showToast(`+1 تكرار لسورة ${surahName} (${updatedCount}/${target} تكرار - ${percent}%)`);

      return nextMap;
    });

    // Add log
    const newLog = addRepetitionLog(surahId, type);
    setLogs((prev) => [...prev, newLog]);
  };

  // Decrement repetition (-1) undo
  const handleDecrementRepetition = (surahId: number, type: 'memorize' | 'revision') => {
    setProgressMap((prev) => {
      const current = prev[surahId];
      if (!current) return prev;

      const isRevision = type === 'revision';
      const updatedCount = isRevision
        ? Math.max(0, (current.revisionCompletedRepetitions || 0) - 1)
        : Math.max(0, (current.completedRepetitions || 0) - 1);

      const updatedItem: SurahProgress = {
        ...current,
        completedRepetitions: isRevision ? current.completedRepetitions : updatedCount,
        revisionCompletedRepetitions: isRevision ? updatedCount : current.revisionCompletedRepetitions,
      };

      const nextMap = { ...prev, [surahId]: updatedItem };
      saveProgress(nextMap);
      syncProgressToCloud(nextMap);
      return nextMap;
    });
  };

  // Change repetitions directly to specific count
  const handleChangeRepetitions = (surahId: number, newCount: number, type: 'memorize' | 'revision') => {
    const today = new Date().toISOString().split('T')[0];
    setProgressMap((prev) => {
      const current = prev[surahId] || {
        surahId,
        status: 'not_started',
        targetRepetitions: settings.defaultMemorizeTarget,
        completedRepetitions: 0,
        revisionTargetRepetitions: settings.defaultRevisionTarget,
        revisionCompletedRepetitions: 0,
      };

      const isRevision = type === 'revision';
      const updatedItem: SurahProgress = {
        ...current,
        completedRepetitions: isRevision ? current.completedRepetitions : newCount,
        revisionCompletedRepetitions: isRevision ? newCount : current.revisionCompletedRepetitions,
        lastActivityDate: today,
      };

      const nextMap = { ...prev, [surahId]: updatedItem };
      saveProgress(nextMap);
      syncProgressToCloud(nextMap);
      return nextMap;
    });
  };

  // Update Surah status
  const handleUpdateStatus = (surahId: number, status: MemorizationStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setProgressMap((prev) => {
      const current = prev[surahId] || {
        surahId,
        status,
        targetRepetitions: settings.defaultMemorizeTarget,
        completedRepetitions: 0,
        revisionTargetRepetitions: settings.defaultRevisionTarget,
        revisionCompletedRepetitions: 0,
      };

      const updatedItem: SurahProgress = {
        ...current,
        status,
        memorizedDate: status === 'memorized' || status === 'mastered' ? today : current.memorizedDate,
        lastActivityDate: today,
      };

      const nextMap = { ...prev, [surahId]: updatedItem };
      saveProgress(nextMap);
      syncProgressToCloud(nextMap);
      return nextMap;
    });
  };

  // Update Surah repetition target
  const handleUpdateTarget = (surahId: number, newTarget: number, type: 'memorize' | 'revision') => {
    setProgressMap((prev) => {
      const current = prev[surahId] || {
        surahId,
        status: 'not_started',
        targetRepetitions: settings.defaultMemorizeTarget,
        completedRepetitions: 0,
        revisionTargetRepetitions: settings.defaultRevisionTarget,
        revisionCompletedRepetitions: 0,
      };

      const updatedItem: SurahProgress = {
        ...current,
        targetRepetitions: type === 'memorize' ? newTarget : current.targetRepetitions,
        revisionTargetRepetitions: type === 'revision' ? newTarget : current.revisionTargetRepetitions,
      };

      const nextMap = { ...prev, [surahId]: updatedItem };
      saveProgress(nextMap);
      syncProgressToCloud(nextMap);
      return nextMap;
    });
  };

  // Start active session for specific surah
  const handleStartSession = (surah: Surah) => {
    setSessionSurahId(surah.id);
    setActiveTab('session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartSessionById = (surahId: number) => {
    setSessionSurahId(surahId);
    setActiveTab('session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const syncProgressToCloud = (map: Record<number, SurahProgress>) => {
    const activeUid = localStorage.getItem('mutqin_linked_uid') || auth.currentUser?.uid;
    if (activeUid) {
      saveCloudProgress(activeUid, map);
      setLastSyncTime(new Date());
    }
  };

  const syncPlanToCloud = (plan: QuranDailyPlan) => {
    const activeUid = localStorage.getItem('mutqin_linked_uid') || auth.currentUser?.uid;
    if (activeUid) {
      saveCloudDailyPlan(activeUid, plan);
      setLastSyncTime(new Date());
    }
  };

  const syncSettingsToCloud = (newSettings: UserSettings) => {
    const activeUid = localStorage.getItem('mutqin_linked_uid') || auth.currentUser?.uid;
    if (activeUid) {
      saveCloudSettings(activeUid, newSettings);
      setLastSyncTime(new Date());
    }
  };

  const handleForceSyncNow = async () => {
    const activeUid = localStorage.getItem('mutqin_linked_uid') || auth.currentUser?.uid;
    if (!activeUid) return;
    setIsSyncing(true);
    try {
      await Promise.all([
        saveCloudDailyPlan(activeUid, dailyPlan),
        saveCloudProgress(activeUid, progressMap),
        saveCloudSettings(activeUid, settings),
      ]);
      setLastSyncTime(new Date());
      showToast('تمت المزامنة السحابية بنجاح أونلاين! ☁️');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Update daily plan and synchronize cumulative repetitions
  const handleUpdateDailyPlan = (updatedPlan: QuranDailyPlan) => {
    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
    syncPlanToCloud(updatedPlan);

    // Sync dynamically to progressMap for the selected Surahs
    setProgressMap((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const next = { ...prev };

      const newId = updatedPlan.newMemorize.surahId;
      const nearId = updatedPlan.nearRevision.surahId;
      const distId = updatedPlan.distantRevision.surahId;

      if (newId && next[newId]) {
        next[newId] = {
          ...next[newId],
          completedRepetitions: updatedPlan.newMemorize.cumulativeRepetitions,
          status:
            updatedPlan.newMemorize.completedUnitsCount >=
            (updatedPlan.newMemorize.totalUnitsInSurah || 1)
              ? 'memorized'
              : updatedPlan.newMemorize.cumulativeRepetitions > 0
              ? 'in_progress'
              : next[newId].status,
          lastActivityDate: today,
        };
      }

      if (nearId && next[nearId]) {
        next[nearId] = {
          ...next[nearId],
          revisionCompletedRepetitions: updatedPlan.nearRevision.cumulativeRepetitions,
          lastActivityDate: today,
        };
      }

      if (distId && next[distId]) {
        next[distId] = {
          ...next[distId],
          revisionCompletedRepetitions: updatedPlan.distantRevision.cumulativeRepetitions,
          lastActivityDate: today,
        };
      }

      saveProgress(next);
      syncProgressToCloud(next);
      return next;
    });
  };

  // Save changes from SurahDetailModal
  const handleSaveDetails = (updated: Partial<SurahProgress>) => {
    if (!detailsSurah) return;
    setProgressMap((prev) => {
      const current = prev[detailsSurah.id] || {
        surahId: detailsSurah.id,
        status: 'not_started',
        targetRepetitions: settings.defaultMemorizeTarget,
        completedRepetitions: 0,
        revisionTargetRepetitions: settings.defaultRevisionTarget,
        revisionCompletedRepetitions: 0,
      };

      const nextMap = {
        ...prev,
        [detailsSurah.id]: {
          ...current,
          ...updated,
        },
      };

      saveProgress(nextMap);
      syncProgressToCloud(nextMap);
      return nextMap;
    });
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    syncSettingsToCloud(newSettings);
  };

  // Import JSON progress data
  const handleImportData = (imported: Record<number, SurahProgress>) => {
    setProgressMap(imported);
    saveProgress(imported);
    syncProgressToCloud(imported);
  };

  // Reset all
  const handleResetAll = () => {
    const initial = getInitialProgress();
    setProgressMap(initial);
    saveProgress(initial);
    syncProgressToCloud(initial);
    setLogs([]);
    saveLogs([]);
  };

  const todayCount = getTodayRepetitions(logs);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check size={13} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Install Banner for Mobile and Tablet */}
      <InstallBanner onOpenLaunchModal={() => setIsLaunchModalOpen(true)} />

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLaunchModal={() => setIsLaunchModalOpen(true)}
        onOpenCloudSync={() => setIsCloudModalOpen(true)}
        onStartQuickSession={() => {
          setActiveTab('session');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        todayCount={todayCount}
        dailyGoal={settings.dailyRepetitionGoal}
        isSyncing={isSyncing}
      />


      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {activeTab === 'plan' && (
          <DailyPlanView
            plan={dailyPlan}
            soundEnabled={settings.soundEnabled}
            celebrationEnabled={settings.celebrationEnabled}
            onUpdatePlan={handleUpdateDailyPlan}
            onStartFullSession={handleStartSessionById}
          />
        )}

        {activeTab === 'surahs' && (
          <SurahListView
            progressMap={progressMap}
            soundEnabled={settings.soundEnabled}
            celebrationEnabled={settings.celebrationEnabled}
            onIncrementRepetition={handleIncrementRepetition}
            onDecrementRepetition={handleDecrementRepetition}
            onChangeRepetitions={handleChangeRepetitions}
            onUpdateStatus={handleUpdateStatus}
            onStartSession={handleStartSession}
            onOpenDetails={setDetailsSurah}
          />
        )}

        {activeTab === 'session' && (
          <ActiveSessionView
            initialSurahId={sessionSurahId}
            progressMap={progressMap}
            soundEnabled={settings.soundEnabled}
            celebrationEnabled={settings.celebrationEnabled}
            onIncrementRepetition={handleIncrementRepetition}
            onDecrementRepetition={handleDecrementRepetition}
            onChangeRepetitions={handleChangeRepetitions}
            onUpdateTarget={handleUpdateTarget}
          />
        )}

        {activeTab === 'revision' && (
          <RevisionView
            progressMap={progressMap}
            soundEnabled={settings.soundEnabled}
            celebrationEnabled={settings.celebrationEnabled}
            onIncrementRepetition={handleIncrementRepetition}
            onDecrementRepetition={handleDecrementRepetition}
            onUpdateStatus={handleUpdateStatus}
            onStartSession={handleStartSession}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            progressMap={progressMap}
            todayCount={todayCount}
            dailyGoal={settings.dailyRepetitionGoal}
          />
        )}
      </main>

      {/* Modal: Surah Details */}
      {detailsSurah && (
        <SurahDetailModal
          surah={detailsSurah}
          progress={
            progressMap[detailsSurah.id] || {
              surahId: detailsSurah.id,
              status: 'not_started',
              targetRepetitions: settings.defaultMemorizeTarget,
              completedRepetitions: 0,
              revisionTargetRepetitions: settings.defaultRevisionTarget,
              revisionCompletedRepetitions: 0,
            }
          }
          soundEnabled={settings.soundEnabled}
          celebrationEnabled={settings.celebrationEnabled}
          onClose={() => setDetailsSurah(null)}
          onSave={handleSaveDetails}
          onIncrementRepetition={handleIncrementRepetition}
          onDecrementRepetition={handleDecrementRepetition}
          onChangeRepetitions={handleChangeRepetitions}
        />
      )}

      {/* Modal: Settings & Backup */}
      <SettingsModal
        settings={settings}
        progressMap={progressMap}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onImportData={handleImportData}
        onResetAll={handleResetAll}
      />

      {/* Modal: Launch & Deploy */}
      <LaunchModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
      />

      {/* Modal: Cloud Synchronization */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentUser={currentUser}
        onForceSync={handleForceSyncNow}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />


      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-quran text-stone-700 text-sm">
            <span>مُتْـقِـن · لخدمة حَفَظَة كتاب الله تعالى</span>
          </div>
          <div>
            <span>اللهم اجعل القرآن العظيم ربيع قلوبنا ونور صدورنا وجلاء أحزاننا وذهاب همومنا</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
