import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Tablet, Laptop, Download, X, Check, Share2, HelpCircle } from 'lucide-react';

interface InstallBannerProps {
  onOpenLaunchModal: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onOpenLaunchModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // If already running inside standalone app, do not show banner
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        onOpenLaunchModal();
      }
    } else {
      onOpenLaunchModal();
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-4 py-2.5 shadow-sm border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-md text-amber-300 font-bold shrink-0">
              <Laptop size={14} />
              <Tablet size={14} />
              <Smartphone size={14} />
            </div>
            <span className="font-medium text-emerald-100">
              يمكنك تنزيل وتثبيت «مُتقِن» كتطبيق أصيل على جهاز الكمبيوتر، التابلت، أو هاتفك ليعمل حتى بدون إنترنت!
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3 py-1 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>تثبيت التطبيق الآن</span>
            </button>

            <button
              type="button"
              onClick={onOpenLaunchModal}
              className="hidden sm:inline-flex bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              طرق التنزيل
            </button>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-emerald-300 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="إغلاق هذا الإشعار"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up Guide for iPad, iPhone and Android Tablet */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base font-quran">
                <Tablet size={20} className="text-emerald-800" />
                <span>خطوات تثبيت التطبيق على جهازك</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Apple iPad / iPhone */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <span>🍏 لأجهزة أبل (آيباد iPad أو آيفون iPhone عبر متصفح Safari):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-600 leading-relaxed pr-1">
                <li>اضغط على زر <strong>المشاركة</strong> (أيقونة المربع الأزرق الذي يخرج منه سهم للأعلى ⎋) في شريط متصفح Safari.</li>
                <li>مرر القائمة لأسفل واختر: <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.</li>
                <li>اضغط على <strong>«إضافة» (Add)</strong> في أعلى الزاوية.</li>
              </ol>
            </div>

            {/* Android Tablet / Phone */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <span>🤖 لأجهزة أندرويد (تابلت سامسونج أو هاتف أندرويد عبر Chrome):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-600 leading-relaxed pr-1">
                <li>اضغط على زر <strong>الثلاث نقاط (⋮)</strong> في أعلى متصفح Chrome.</li>
                <li>اختر: <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                <li>اضغط على <strong>«تثبيت» (Install)</strong> لتنزل أيقونة التطبيق فوراً.</li>
              </ol>
            </div>

            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowGuide(false);
                  onOpenLaunchModal();
                }}
                className="text-xs text-emerald-800 font-bold hover:underline"
              >
                مسح رمز QR من جهاز آخر
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
