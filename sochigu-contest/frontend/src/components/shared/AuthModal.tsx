import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';

// ── Login ────────────────────────────────────────────────────────────────────

type LoginForm = { email: string; password: string };

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ mode: 'onBlur' });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await authApi.login(data);
      setError(null);
      onSuccess();
      const role = useAuthStore.getState().user?.role;
      const dest = role === 'admin' || role === 'moderator' ? '/admin'
        : role === 'expert' ? '/admin/applications'
        : '/cabinet';
      navigate(dest, { replace: true });
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : typeof raw === 'string' ? raw : null;
      setError(msg ?? 'Неверный email или пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 pt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          {...register('email', {
            required: 'Введите email',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Некорректный email' },
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
          placeholder="email@example.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            {...register('password', { required: true })}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-primary hover:bg-primary-mid disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
      >
        {loading ? 'Входим...' : 'Войти'}
      </button>
    </form>
  );
}

function formatPhone(raw: string, prev = ''): string {
  let digits = raw.replace(/\D/g, '');
  // Если пользователь удалил разделитель (строка короче, но цифры те же) — удаляем ещё одну цифру
  if (prev && raw.length < prev.length && digits === prev.replace(/\D/g, '') && digits.length > 0) {
    digits = digits.slice(0, -1);
  }
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  else if (digits.length > 0 && !digits.startsWith('7')) digits = '7' + digits;
  digits = digits.slice(0, 11);
  if (!digits) return '';
  const rest = digits.slice(1);
  let out = '+7';
  if (rest.length > 0) out += '(' + rest.slice(0, 3);
  if (rest.length >= 3) out += ')' + rest.slice(3, 6);
  if (rest.length >= 6) out += '-' + rest.slice(6, 8);
  if (rest.length >= 8) out += '-' + rest.slice(8, 10);
  return out;
}

// ── Register ─────────────────────────────────────────────────────────────────

type RegisterForm = {
  lastName: string; firstName: string; middleName?: string;
  email: string; phone?: string; password: string; confirmPassword: string;
  university: string; faculty: string; course: string; city: string;
  consent: boolean;
};

function RegisterForm({ onSuccess, onRegistered }: { onSuccess: () => void; onRegistered: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<RegisterForm>({ mode: 'onBlur' });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setLoading(true);
    try {
      const { consent: _, course, confirmPassword: __, ...rest } = data;
      await authApi.register({ ...rest, course: course ? Number(course) : undefined });
      onRegistered();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : typeof raw === 'string' ? raw : null;
      setError(msg ?? 'Ошибка регистрации. Возможно, такой email уже занят.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-6 pt-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Фамилия <span className="text-red-500">*</span></label>
          <input type="text" {...register('lastName', { required: 'Обязательное поле' })} className={field} placeholder="Иванов" />
          {errors.lastName && <p className="text-red-500 text-xs mt-0.5">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Имя <span className="text-red-500">*</span></label>
          <input type="text" {...register('firstName', { required: 'Обязательное поле' })} className={field} placeholder="Иван" />
          {errors.firstName && <p className="text-red-500 text-xs mt-0.5">{errors.firstName.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Отчество</label>
        <input type="text" {...register('middleName')} className={field} placeholder="Иванович" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input type="email" {...register('email', {
            required: 'Обязательное поле',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Некорректный email' },
          })} className={field} placeholder="email@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Телефон</label>
          {(() => {
            const phoneReg = register('phone', {
              validate: v => !v || v.replace(/\D/g, '').length === 11 || 'Введите корректный номер телефона',
            });
            return (
              <>
                <input type="tel" {...phoneReg}
                  onChange={(e) => { e.target.value = formatPhone(e.target.value, getValues('phone') ?? ''); phoneReg.onChange(e); }}
                  className={errors.phone ? `${field} border-red-400` : field}
                  placeholder="+7(999)123-45-67" />
                {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone.message}</p>}
              </>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Пароль <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} {...register('password', {
              required: 'Обязательное поле',
              minLength: { value: 8, message: 'Минимум 8 символов' },
            })} className={`${field} pr-8`} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Повторите пароль <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type={showConfirm ? 'text' : 'password'} {...register('confirmPassword', {
              required: 'Обязательное поле',
              validate: v => v === getValues('password') || 'Пароли не совпадают',
            })} className={`${field} pr-8`} placeholder="••••••••" />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-0.5">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ВУЗ <span className="text-red-500">*</span></label>
          <input type="text" {...register('university', { required: 'Обязательное поле' })} className={field} placeholder="СочиГУ" />
          {errors.university && <p className="text-red-500 text-xs mt-0.5">{errors.university.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Институт/факультет/кафедра</label>
          <input type="text" {...register('faculty')} className={field} placeholder="ФИИЦТ" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Курс</label>
          <select {...register('course')} className={`${field} select-custom pl-3`}>
            <option value="">Выберите</option>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Город <span className="text-red-500">*</span></label>
          <input type="text" {...register('city', { required: 'Обязательное поле' })} className={field} placeholder="Сочи" />
          {errors.city && <p className="text-red-500 text-xs mt-0.5">{errors.city.message}</p>}
        </div>
      </div>

      <div className="flex items-start gap-2">
        <input id="modal-consent" type="checkbox"
          {...register('consent', { required: 'Необходимо дать согласие' })}
          className="mt-0.5 w-4 h-4 rounded border-gray-300"
        />
        <label htmlFor="modal-consent" className="text-xs text-gray-600">
          Даю согласие на обработку персональных данных <span className="text-red-500">*</span>
        </label>
      </div>
      {errors.consent && <p className="text-red-500 text-xs">{errors.consent.message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-accent-foreground font-semibold transition-colors text-sm"
      >
        {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────

export function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal } = useUiStore();
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [visible, setVisible] = useState(true);
  const [justRegistered, setJustRegistered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const prevAuthModal = useRef<typeof authModal>(null);

  // Вычисляется во время рендера: при первом открытии prevAuthModal.current ещё null
  // (эффект ещё не запустился), поэтому берём authModal напрямую — без layout-анимации
  const displayMode: 'login' | 'register' =
    authModal !== null && prevAuthModal.current === null ? authModal : activeMode;

  useEffect(() => {
    if (authModal && !prevAuthModal.current) {
      // Модалка открывается заново — синхронизируем activeMode (displayMode уже правильный)
      clearTimeout(timerRef.current);
      setActiveMode(authModal);
      setVisible(true);
    } else if (authModal && prevAuthModal.current) {
      // Модалка уже открыта — анимированный переход
      switchMode(authModal);
    }
    if (!authModal) { prevAuthModal.current = null; setJustRegistered(false); }
    else prevAuthModal.current = authModal;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModal]);

  const switchMode = (m: 'login' | 'register') => {
    if (m === activeMode) return;
    clearTimeout(timerRef.current);
    setVisible(false);                          // 1. старая форма гаснет
    timerRef.current = setTimeout(() => {
      setActiveMode(m);                         // 2. контент меняется → layout анимирует высоту
      timerRef.current = setTimeout(() => {
        setVisible(true);                       // 3. новая форма появляется
      }, 500);
    }, 220);
  };

  useEffect(() => {
    return () => { clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAuthModal]);

  useEffect(() => {
    document.body.style.overflow = authModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [authModal]);

  return (
    <AnimatePresence>
      {authModal && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop — анимируется независимо, поэтому blur появляется вместе с формой */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={closeAuthModal}
          />

          {/* Card */}
          <motion.div
            layout
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ clipPath: 'inset(0 0 100% 0 round 1rem)', opacity: 0 }}
            animate={{ clipPath: 'inset(0 0 0% 0 round 1rem)', opacity: 1 }}
            exit={{ clipPath: 'inset(0 0 100% 0 round 1rem)', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              layout
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Закрыть"
            >
              <X size={20} />
            </motion.button>

            {/* Tabs */}
            <motion.div layout className="flex border-b border-gray-200">
              {(['login', 'register'] as const).map((m) => (
                <motion.button
                  layout
                  key={m}
                  onClick={() => { switchMode(m); openAuthModal(m); }}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                    displayMode === m
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? 'Войти' : 'Регистрация'}
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {displayMode === 'login'
                ? <>
                    {justRegistered && (
                      <div className="mx-6 mt-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
                        Регистрация успешна! Войдите в систему.
                      </div>
                    )}
                    <LoginForm onSuccess={() => { setJustRegistered(false); closeAuthModal(); }} />
                  </>
                : <RegisterForm
                    onSuccess={closeAuthModal}
                    onRegistered={() => {
                      setJustRegistered(true);
                      switchMode('login');
                      openAuthModal('login');
                    }}
                  />
              }
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
