import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Laptop,
  Download,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  QrCode,
  Info,
  ArrowUpRight,
  Monitor,
} from 'lucide-react';

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaunchModal: React.FC<LaunchModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'phone_tablet' | 'pc' | 'qr'>('quick');

  if (!isOpen) return null;

  // Real accessible URL
  const currentUrl =
    typeof window !== 'undefined' && window.location.href
      ? window.location.href
      : 'https://ais-pre-4loyvjwuamfvlx5jdawz4w-467424541516.europe-west2.run.app';

  // Check if running inside iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مُتقِن - متابعة حفظ وتكرار القرآن الكريم',
          text: 'تطبيق متكامل لمتابعة حفظ ومراجعة سور القرآن الكريم وتتبع عدد التكرارات ونسب الإنجاز.',
          url: currentUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
    } else {
      // If installable is not available directly, open in external tab
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Download size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-quran text-white leading-tight">
                تنزيل وتثبيت تطبيق «مُتقِن» على جهازك
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                خطوات سهلة لتشغيله كتطبيق مستقل على الكمبيوتر، التابلت، والموبايل
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

        {/* Tab navigation inside modal */}
        <div className="px-6 pt-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'quick'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            🚀 الحل السريع (افتحي الرابط هنا)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('phone_tablet')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'phone_tablet'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            📱 التابلت والموبايل (Android & iPad)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pc')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'pc'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            💻 الكمبيوتر واللابتوب (Windows & Mac)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            📷 مسح رمز الكاميرا (QR Code)
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Why it might not show explanation (Crucial for AI Studio iframe preview) */}
          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
              <Info size={18} className="text-amber-700 shrink-0" />
              <span>سبب عدم ظهور خيارات التنزيل لديكِ الآن:</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900/90">
              أنتِ تشاهدين التطبيق حالياً داخل <strong>نافذة المعاينة في موقع التطوير</strong>، والمتصفحات (مثل Chrome و Safari) <strong>تمنع أمنياً ظهور زر التثبيت داخل نوافذ المعاينة</strong>!
            </p>
            <div className="text-xs font-semibold pt-1 text-emerald-950 flex items-center gap-1.5">
              <span>👉</span>
              <span>
                لذلك، كل ما عليكِ فعله هو الضغط على الزر الأخضر بالأسفل <strong>لفتح التطبيق في نافذة مستقلة جديدة</strong>، وستظهر لكِ خيارات التثبيت فوراً!
              </span>
            </div>
          </div>

          {/* Primary Action Button: Open in New Tab */}
          <div className="space-y-3">
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer text-center group"
            >
              <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
              <span>1. اضغطي هنا لفتح التطبيق في صفحة مستقلة كاملة</span>
            </a>

            <div className="text-center text-[11px] text-stone-500">
              (سيفتح التطبيق في صفحة متصفحك العادية لتتمكني من تثبيته على الفور)
            </div>
          </div>

          {/* Direct Install Button if Browser Supports It */}
          {isInstallable && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <button
                type="button"
                onClick={handleDirectInstall}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Download size={16} />
                <span>أو اضغطي هنا لتثبيت التطبيق مباشرة على جهازك بنقرة واحدة</span>
              </button>
            </div>
          )}

          {/* TAB 1: QUICK OVERVIEW & URL COPY */}
          {activeTab === 'quick' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  2. أو انسخي رابط التطبيق المباشر وافتحيه في متصفحك (أو أرسليه لنفسك على واتساب):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-800 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Quick Scan */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-xs shrink-0">
                  <QRCodeSVG value={currentUrl} size={110} level="M" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-stone-900">
                    <QrCode size={16} className="text-emerald-700" />
                    <span>3. أو امسحي الرمز بكاميرا هاتفك أو جهاز التابلت:</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    افتحي الكاميرا على موبايلك أو التابلت ووجّهيها نحو هذا المربع، وسيظهر لك رابط التطبيق لتفتحيه وتثبتيه مباشرة.
                  </p>
                </div>
              </div>

              {/* Share button */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Share2 size={16} />
                <span>مشاركة الرابط عبر الواتساب أو التطبيقات</span>
              </button>
            </div>
          )}

          {/* TAB 2: MOBILE & TABLET DETAILS */}
          {activeTab === 'phone_tablet' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Android */}
                <div className="p-4 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      🤖
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">موبايل وتابلت أندرويد (Android)</h4>
                      <span className="text-[10px] text-stone-500">سامسونج، شاومي، هواوي، أوبو...</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <strong>الخطوة 1:</strong> افتحي الرابط في متصفح <strong>Google Chrome</strong> (وليس داخل تطبيق آخر).
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <strong>الخطوة 2:</strong> اضغطي على زر الثلاث نقاط <strong>( ⋮ )</strong> في أعلى يسار المتصفح.
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <strong>الخطوة 3:</strong> اختاري:
                      <div className="font-bold text-emerald-800 mt-1">
                        «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <strong>الخطوة 4:</strong> اضغطي «تثبيت». سينزل التطبيق فوراً كبرنامج مستقل بأيقونته الرسمية على شاشة هاتفك ويعمل بدون نت!
                    </div>
                  </div>
                </div>

                {/* Apple iPhone & iPad */}
                <div className="p-4 rounded-2xl border-2 border-teal-600/30 bg-teal-50/40 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-teal-200">
                    <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                      🍏
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">الآيباد (iPad) والآيفون (iPhone)</h4>
                      <span className="text-[10px] text-stone-500">نظام أبل iOS عبر متصفح Safari</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
                    <div className="p-2 bg-white rounded-xl border border-teal-200">
                      <strong>الخطوة 1:</strong> افتحي الرابط في متصفح <strong>Safari</strong> الأصلي.
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-teal-200">
                      <strong>الخطوة 2:</strong> اضغطي على زر <strong>المشاركة</strong> (مربع أزرق يخرج منه سهم للأعلى <span className="inline-block px-1.5 py-0.5 bg-stone-100 rounded font-bold">⎋</span> في أسفل أو أعلى الشاشة).
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-teal-200">
                      <strong>الخطوة 3:</strong> مرري للأسفل واختاري:
                      <div className="font-bold text-teal-800 mt-1">
                        «إضافة إلى الشاشة الرئيسية» (Add to Home Screen)
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-teal-200">
                      <strong>الخطوة 4:</strong> اضغطي «إضافة» (Add). سيظهر التطبيق فوراً على شاشة جهازك كأي تطبيق رسمي!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PC & LAPTOP DETAILS */}
          {activeTab === 'pc' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Monitor size={20} className="text-emerald-800" />
                  <h4 className="text-sm font-bold text-stone-900">
                    تثبيت التطبيق على جهاز الكمبيوتر أو اللابتوب (Windows & Mac)
                  </h4>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  عند فتح الرابط في متصفح الكمبيوتر العادي (Chrome أو Edge خارج المعاينة)، يتيح لكِ المتصفح تثبيته بضغطة زر:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                    <span className="font-bold text-stone-900 block">متصفح Google Chrome:</span>
                    <p className="text-stone-600">
                      1. افتحي الرابط في صفحة مستقلة.<br />
                      2. انظري إلى <strong>شريط العنوان في الأعلى (جهة اليسار أو اليمين)</strong>.<br />
                      3. ستظهر أيقونة صغيرة على شكل <strong>كمبيوتر مع سهم لأسفل (🖥️ أو ⬇️)</strong>.<br />
                      4. اضغطي عليها ثم اختاري <strong>«تثبيت» (Install)</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                    <span className="font-bold text-stone-900 block">متصفح Microsoft Edge:</span>
                    <p className="text-stone-600">
                      1. افتحي الرابط في صفحة مستقلة.<br />
                      2. اضغطي على أيقونة المربعات الثلاثة أو القائمة (...) أعلى المتصفح.<br />
                      3. اختاري <strong>«التطبيقات» (Apps)</strong> ثم <strong>«تثبيت هذا الموقع كتطبيق»</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold">
                  ✨ النتيجة: سيتم وضع اختصار لتطبيق «مُتقِن» على سطح المكتب (Desktop) وفي قائمة Start، وسيفتح كنافذة مستقلة بدون شريط المتصفح ويعمل حتى لو فُصلت شبكة الإنترنت!
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QR CODE FULL VIEW */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 inline-flex flex-col items-center justify-center space-y-3 w-full">
                <div className="p-4 bg-white rounded-2xl border-2 border-emerald-600/30 shadow-md">
                  <QRCodeSVG value={currentUrl} size={180} level="M" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h4 className="text-sm font-bold text-stone-900">
                    امسحي هذا الرمز بكاميرا الهاتف أو التابلت
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    افتحي الكاميرا العادية على جهازك ووجّهيها نحو هذا الرمز، وسيظهر لك إشعار للانتقال مباشرة لصفحة التطبيق وتثبيته.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500">
            تطبيق «مُتقِن» - قرآن كريم وتكرار وإتقان
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
