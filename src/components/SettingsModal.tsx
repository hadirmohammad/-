import React, { useRef } from 'react';
import { UserSettings, SurahProgress } from '../types';
import { X, Volume2, VolumeX, Sparkles, Download, Upload, RotateCcw, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  progressMap: Record<number, SurahProgress>;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onImportData: (importedProgress: Record<number, SurahProgress>) => void;
  onResetAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  progressMap,
  isOpen,
  onClose,
  onUpdateSettings,
  onImportData,
  onResetAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify({ progress: progressMap, settings, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutqin-quran-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.progress) {
          onImportData(parsed.progress);
          alert('تم استعادة بيانات حفظ القرآن بنجاح!');
          onClose();
        } else {
          alert('الملف غير متوافق');
        }
      } catch {
        alert('حدث خطأ أثناء قراءة الملف، تأكد من صحة التنسيق.');
      }
    };
    reader.readAsText(file);
  };

  const setMethod = (method: UserSettings['activeMethod'], defaultReps: number) => {
    onUpdateSettings({
      ...settings,
      activeMethod: method,
      defaultMemorizeTarget: defaultReps,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-quran text-stone-900">
              إعدادات التطبيق وخطة التكرار
            </h3>
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
          {/* Target Repetition Methods */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              طرق التكرار المعتمدة المقترحة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('twenty', 20)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  settings.defaultMemorizeTarget === 20
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-500'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-bold font-quran">طريقة الـ 20 تكرار</div>
                <div className="text-[11px] text-stone-500 mt-1">المتوسطة والمحبذة للتثبيت السريع</div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('shanqeeti', 40)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  settings.defaultMemorizeTarget === 40
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-500'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-bold font-quran">طريقة الشناقطة (40)</div>
                <div className="text-[11px] text-stone-500 mt-1">التكرار الراسخ لحفظ لا يُنسى</div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('standard', 10)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  settings.defaultMemorizeTarget === 10
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-500'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-bold font-quran">العشر الميسرة (10)</div>
                <div className="text-[11px] text-stone-500 mt-1">للحفظ السريع والمراجعة السريعة</div>
              </button>
            </div>
          </div>

          {/* Numeric Settings */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                الهدف اليومي للتكرارات:
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={settings.dailyRepetitionGoal}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, dailyRepetitionGoal: Math.max(1, Number(e.target.value)) })
                }
                className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">تكراراً كل يوم</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                افتراضي تكرارات السورة الجديدة:
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={settings.defaultMemorizeTarget}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, defaultMemorizeTarget: Math.max(1, Number(e.target.value)) })
                }
                className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">تكراراً لكل سورة</span>
            </div>
          </div>

          {/* Sound & Celebration Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 size={18} className="text-emerald-700" />
                ) : (
                  <VolumeX size={18} className="text-stone-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-stone-800 block">
                    صوت النقر عند وضع علامة صح
                  </span>
                  <span className="text-[11px] text-stone-500">
                    تأثير صوتي لطيف بدون ملفات خارجية
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-amber-500" />
                <div>
                  <span className="text-xs font-bold text-stone-800 block">
                    مؤثرات الاحتفال عند اكتمال الهدف
                  </span>
                  <span className="text-[11px] text-stone-500">
                    إطلاق ألوان البهجة عند إتمام التكرار
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.celebrationEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, celebrationEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 block">
              النسخ الاحتياطي واستعادة التقدم
            </span>
            <p className="text-[11px] text-stone-500">
              يتم حفظ بياناتك محلياً على هذا الجهاز بشكل تلقائي. يمكنك تصدير نسخة احتياطية كملف JSON لفتحها على أي جهاز آخر.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <Upload size={14} />
                <span>استيراد نسخة سابقة</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone: Reset */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">إعادة ضبط كل شيء والبدء من جديد:</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في تصفير كل تقدم الحفظ والتكرارات؟ لا يمكن التراجع بعد ذلك.')) {
                  onResetAll();
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-800 font-semibold p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
            >
              تصفير كافة البيانات
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
