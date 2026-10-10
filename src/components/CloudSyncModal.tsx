import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet,
  Copy,
  Check,
  Sparkles,
  Link2,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  signInWithGoogle,
  logOut,
  linkDeviceByCode,
  createSyncCodeForUser,
} from '../lib/firebase';
import { playCheckSound, playSuccessSound } from '../utils/sound';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onForceSync: () => void;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onForceSync,
  isSyncing,
  lastSyncTime,
}) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkMessage, setLinkMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    if (!currentUser) return;
    playCheckSound();
    const code = await createSyncCodeForUser(currentUser.uid);
    setSyncCode(code);
  };

  const handleCopyCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkDevice = async () => {
    if (!inputCode.trim()) return;
    setLinkingLoading(true);
    setLinkMessage(null);
    try {
      const ok = await linkDeviceByCode(inputCode.trim());
      if (ok) {
        playSuccessSound();
        setLinkMessage({ text: 'تم ربط الجهاز بنجاح وجلب خطتك وتكراراتك من السحابة! 🎉', type: 'success' });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setLinkMessage({ text: 'عذراً، لم يتم العثور على جهاز بهذا الكود. تأكدي من صحة الكود.', type: 'error' });
      }
    } catch {
      setLinkMessage({ text: 'حدث خطأ أثناء محاولة الربط.', type: 'error' });
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      playSuccessSound();
      setLinkMessage({ text: 'تم تسجيل الدخول بنجاح ومزامنة حسابك! 🎉', type: 'success' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    playCheckSound();
    setLinkMessage({ text: 'تم تسجيل الخروج بنجاح.', type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Cloud size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-quran text-white leading-tight">
                المزامنة السحابية أونلاين عبر الأجهزة
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                تحديث خطتك وتكراراتك تلقائياً بين الكمبيوتر، التابلت، والموبايل
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Box */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>المزامنة السحابية المباشرة مفعّلة أونلاين</span>
              </div>
              <button
                type="button"
                onClick={onForceSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'جارِ المزامنة...' : 'مزامنة فورية الآن'}</span>
              </button>
            </div>

            <p className="text-xs text-emerald-800 leading-relaxed">
              كل تعديل في الخطة اليومية، أو زيادة في تكرارات الحفظ والمراجعة، يتم حفظه فوراً في السحابة ومزامنته تلقائياً ليظهر على هاتفك والتابلت وجهاز الكمبيوتر.
            </p>

            {lastSyncTime && (
              <div className="text-[11px] text-emerald-700 pt-1 border-t border-emerald-200/60">
                آخر مزامنة ناجحة: {lastSyncTime.toLocaleTimeString('ar-EG')}
              </div>
            )}
          </div>

          {/* Feedback message */}
          {linkMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold ${
                linkMessage.type === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              {linkMessage.text}
            </div>
          )}

          {/* Device Linking Options */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-700">
              طرق ربط أجهزتك معاً لفتح نفس البيانات:
            </h4>

            {/* Option 1: Google Account Sign-In */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-700" />
                    <span>الخيار 1: الربط الدائم عبر حساب Google (موصى به)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    سجّلي الدخول بنفس الحساب على أي جهاز (لابتوب أو تابلت أو هاتف) وستجدين بياناتك متزامنة دائماً.
                  </p>
                </div>
              </div>

              {currentUser && !currentUser.isAnonymous ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200">
                  <div className="text-xs">
                    <span className="text-stone-500 block">الحساب المتصل حالياً:</span>
                    <strong className="text-stone-900">{currentUser.email || currentUser.displayName}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <LogOut size={13} />
                    <span>تسجيل خروج</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 shadow-2xs transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>تسجيل الدخول بحساب Google لمزامنة دائمة</span>
                </button>
              )}
            </div>

            {/* Option 2: Quick Sync Code */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <Link2 size={16} className="text-teal-700" />
                <span>الخيار 2: الربط السريع عبر كود المزامنة (بدون تسجيل دخول)</span>
              </div>
              <p className="text-[11px] text-stone-500">
                يمكنكِ توليد كود من هذا الجهاز وإدخاله في جهازك الآخر (الموبايل أو التابلت) لربطهما معاً فوراً:
              </p>

              {/* Generate code */}
              <div className="flex items-center gap-2">
                {syncCode ? (
                  <div className="flex-1 flex items-center justify-between p-2.5 bg-white border-2 border-emerald-500 rounded-xl">
                    <span className="font-mono font-bold text-base text-emerald-800 tracking-wider">
                      {syncCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-stone-100"
                    >
                      {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                      <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    توليد كود مزامنة لهذا الجهاز
                  </button>
                )}
              </div>

              {/* Enter code from other device */}
              <div className="pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-600 block mb-1">
                  أو إذا كان لديكِ كود من جهاز آخر، أدخليه هنا للربط معه:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="مثال: Q12345"
                    className="w-32 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900 text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleLinkDevice}
                    disabled={linkingLoading || !inputCode.trim()}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {linkingLoading ? 'جارِ الربط...' : 'ربط ومزامنة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <Laptop size={13} />
            <Tablet size={13} />
            <Smartphone size={13} />
            <span>بياناتك متزامنة ومحفوظة بأمان في السحابة</span>
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
