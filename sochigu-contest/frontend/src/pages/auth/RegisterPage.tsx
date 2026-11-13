import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/auth';

type RegisterForm = {
  lastName: string;
  firstName: string;
  middleName?: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  university: string;
  faculty: string;
  course: string;
  city: string;
  consent: boolean;
};

export function RegisterPage() {
  useEffect(() => { document.title = 'Регистрация — Конкурс СочиГУ'; }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(true);


  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterForm>({ mode: 'onBlur' });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setLoading(true);
    try {
      const { consent, course, confirmPassword: _, ...rest } = data;
      const res = await authApi.register({ ...rest, course: course ? Number(course) : undefined });
      setRequiresEmailVerification(!res.message?.includes('Войдите'));
      setRegisteredEmail(data.email);
      setRegistered(true);
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : typeof raw === 'string' ? raw : null;
      setError(msg ?? 'Ошибка регистрации. Возможно, такой email уже занят.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {requiresEmailVerification ? (
              <>
                <div className="text-5xl mb-4">📬</div>
                <h1 className="text-2xl font-bold text-primary-900 mb-3">Проверьте почту</h1>
                <p className="text-gray-600 mb-2">
                  Письмо с ссылкой подтверждения отправлено на:
                </p>
                <p className="font-semibold text-primary-800 mb-6 break-all">{registeredEmail}</p>
                <p className="text-gray-500 text-sm mb-6">
                  Перейдите по ссылке в письме, чтобы завершить регистрацию и войти в систему.
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-primary-900 mb-3">Регистрация успешна!</h1>
                <p className="text-gray-600 mb-6">
                  Вы зарегистрированы как <span className="font-semibold">{registeredEmail}</span>. Войдите в систему.
                </p>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="inline-block px-6 py-2 bg-primary hover:bg-primary-mid text-white font-semibold rounded-lg transition-colors text-sm">
                Войти
              </Link>
              <Link to="/" className="inline-block px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors text-sm">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-primary-900 mb-6 text-center">
            Регистрация участника
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName', { required: 'Обязательное поле', maxLength: { value: 50, message: 'Максимум 50 символов' } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Иванов"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName', { required: 'Обязательное поле', maxLength: { value: 50, message: 'Максимум 50 символов' } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Иван"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                Отчество
              </label>
              <input
                id="middleName"
                type="text"
                {...register('middleName', { maxLength: { value: 50, message: 'Максимум 50 символов' } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Иванович"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Обязательное поле',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Некорректный email',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Обязательное поле',
                      minLength: { value: 8, message: 'Минимум 8 символов' },
                    })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Повторите пароль <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Обязательное поле',
                      validate: v => v === getValues('password') || 'Пароли не совпадают',
                    })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                  ВУЗ <span className="text-red-500">*</span>
                </label>
                <input
                  id="university"
                  type="text"
                  {...register('university', { required: 'Обязательное поле', maxLength: { value: 200, message: 'Максимум 200 символов' } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="СочиГУ"
                />
                {errors.university && (
                  <p className="text-red-500 text-xs mt-1">{errors.university.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
                  Факультет/кафедра
                </label>
                <input
                  id="faculty"
                  type="text"
                  {...register('faculty', { maxLength: { value: 200, message: 'Максимум 200 символов' } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="ФИИЦТ"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Курс
                </label>
                <select
                  id="course"
                  {...register('course')}
                  className="w-full select-custom pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Выберите</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Город <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city', { required: 'Обязательное поле', maxLength: { value: 100, message: 'Максимум 100 символов' } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Сочи"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                {...register('consent', {
                  required: 'Необходимо дать согласие на обработку персональных данных',
                })}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="consent" className="text-sm text-gray-600">
                Даю согласие на обработку персональных данных <span className="text-red-500">*</span>
              </label>
            </div>
            {errors.consent && (
              <p className="text-red-500 text-xs mt-1">{errors.consent.message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              Войти
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 hover:underline">
              ← На главную
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}