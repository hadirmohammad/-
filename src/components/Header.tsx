import React from 'react';
import { BookOpen, Repeat, BarChart3, Settings, Sparkles, Share2, CalendarCheck, Download, Cloud } from 'lucide-react';

interface HeaderProps {
  activeTab: 'plan' | 'surahs' | 'session' | 'revision' | 'stats';
  onSelectTab: (tab: 'plan' | 'surahs' | 'session' | 'revision' | 'stats') => void;
  onOpenSettings: () => void;
  onOpenLaunchModal: () => void;
  onOpenCloudSync: () => void;
  onStartQuickSession: () => void;
  todayCount: number;
  dailyGoal: number;
  isCloudOnline?: boolean;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenLaunchModal,
  onOpenCloudSync,
  onStartQuickSession,
  todayCount,
  dailyGoal,
  isCloudOnline = true,
  isSyncing = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element in display style) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('plan')}
              className="text-right flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-emerald-900 transition-colors">
                مـ
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900 block leading-tight font-quran">
                  مُتْـقِـن
                </span>
                <span className="text-[11px] text-stone-500 font-medium block">
                  متابعة حفظ وتكرار القرآن الكريم
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <button
              type="button"
              onClick={() => onSelectTab('plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'plan'
                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <CalendarCheck size={16} className={activeTab === 'plan' ? 'text-emerald-700' : ''} />
              <span>ورد اليوم (الخطة اليومية)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('surahs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'surahs'
                  ? 'bg-stone-100 text-stone-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BookOpen size={16} />
              <span>قائمة السور (114)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('session')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'session'
                  ? 'bg-stone-100 text-stone-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Repeat size={16} />
              <span>جلسة تكرار تفاعلية</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('revision')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'revision'
                  ? 'bg-stone-100 text-stone-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Sparkles size={16} />
              <span>المراجعة والتثبيت</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-stone-100 text-stone-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BarChart3 size={16} />
              <span>الإحصائيات</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Quick Settings button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Daily Tally Pill-free text */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-stone-600 pl-2">
              <span className="text-stone-400">تكرارات اليوم:</span>
              <span className="font-bold text-emerald-800 tabular-nums">{todayCount}</span>
              <span className="text-stone-400">/</span>
              <span className="text-stone-500 tabular-nums">{dailyGoal}</span>
            </div>

            {/* Cloud Sync Status Indicator */}
            <button
              type="button"
              onClick={onOpenCloudSync}
              title="المزامنة السحابية أونلاين عبر الأجهزة"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all cursor-pointer shrink-0"
            >
              <Cloud size={14} className={isSyncing ? 'text-amber-600 animate-bounce' : 'text-emerald-700'} />
              <span className="hidden sm:inline">{isSyncing ? 'مزامنة...' : 'مزامنة أونلاين'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onStartQuickSession}
              className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-95 rounded-lg transition-all shadow-xs items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Repeat size={13} />
              <span>جلسة تكرار</span>
            </button>

            <button
              type="button"
              onClick={onOpenLaunchModal}
              title="تنزيل وتثبيت التطبيق على الكمبيوتر، التابلت، أو الموبايل"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <Download size={14} />
              <span>تثبيت التطبيق</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="الإعدادات والنسخ الاحتياطي"
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200/80 bg-stone-50/90 py-1.5 px-2 text-xs">
        <button
          type="button"
          onClick={() => onSelectTab('plan')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md ${
            activeTab === 'plan' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <CalendarCheck size={16} />
          <span>ورد اليوم</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('surahs')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md ${
            activeTab === 'surahs' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <BookOpen size={16} />
          <span>السور</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('session')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md ${
            activeTab === 'session' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <Repeat size={16} />
          <span>تكرار</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('revision')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md ${
            activeTab === 'revision' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <Sparkles size={16} />
          <span>مراجعة</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('stats')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md ${
            activeTab === 'stats' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <BarChart3 size={16} />
          <span>إحصائيات</span>
        </button>
      </div>
    </header>
  );
};
