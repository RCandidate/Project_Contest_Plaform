import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Mail, Globe } from "lucide-react";
import { fadeUp, fadeUpView, stagger, staggerView, cardItem } from '@/utils/animations';
import { contactsApi } from '@/api/contacts';

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

export function ContactsPage() {
  useEffect(() => { document.title = 'Контакты — Конкурс СочиГУ'; }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ email?: string; phone?: string; contact?: string; name?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const validatePhone = (v: string) => v.replace(/\D/g, '').length === 11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Введите имя';
    if (!email.trim() && !phone.trim()) {
      errs.contact = 'Заполните email или номер телефона';
    } else {
      if (email.trim() && !validateEmail(email)) errs.email = 'Некорректный email';
      if (phone.trim() && !validatePhone(phone)) errs.phone = 'Некорректный номер телефона';
    }
    if (!message.trim()) errs.message = 'Введите сообщение';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      try {
        await contactsApi.submit({ name, email: email || undefined, phone: phone || undefined, message });
        setSubmitted(true);
        setName(''); setEmail(''); setPhone(''); setMessage(''); setErrors({});
      } catch {
        setErrors(e => ({ ...e, message: 'Ошибка отправки. Попробуйте позже.' }));
      } finally {
        setSubmitting(false);
      }
    }
  };
  return (
    <div>
      <section className="bg-primary-light/50 py-12">
        <div className="container mx-auto px-4">
          <motion.nav
            className="mb-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          >
            <Link to="/" className="hover:text-primary">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Контакты</span>
          </motion.nav>
          <motion.h1
            className="text-4xl font-bold text-foreground"
            initial="hidden" animate="show" variants={fadeUp}
          >
            Контакты
          </motion.h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Контактные данные */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
          >
            <h2 className="mb-6 text-2xl font-bold text-foreground">Организатор</h2>
            <motion.div
              className="space-y-5"
              variants={staggerView}
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            >
              {[
                {
                  icon: MapPin,
                  title: "Организация",
                  content: (
                    <>
                      <p className="text-muted-foreground">ФГБОУ ВО «Сочинский государственный университет»</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">Стартап-студия СочиГУ</p>
                    </>
                  ),
                },
                {
                  icon: Mail,
                  title: "Email",
                  content: (
                    <a href="mailto:startup@sutr.ru"  className="text-primary hover:underline">
                       startup@sutr.ru
                    </a>
                  ),
                },
                {
                  icon: Globe,
                  title: "Сайт конкурса",
                  content: (
                    <a href="https://PROJECT-Sochigu.sochi.university" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      PROJECT-Sochigu.sochi.university                    </a>
                  ),
                },
              ].map(({ icon: Icon, title, content }) => (
                <motion.div key={title} className="flex items-start gap-4" variants={cardItem}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    {content}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Форма */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
            transition={{ delay: 0.15 }}
          >
            <h2 className="mb-6 text-2xl font-bold text-foreground">Обратная связь</h2>
            {submitted ? (
              <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                <p className="text-green-800 font-semibold text-lg mb-1">Сообщение отправлено!</p>
                <p className="text-green-600 text-sm">Мы свяжемся с вами в ближайшее время.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-green-700 hover:underline">Отправить ещё одно</button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">Имя</label>
                  <input id="name" type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)}
                    className={`w-full rounded-lg border bg-background px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring ${errors.name ? 'border-red-400' : 'border-input'}`} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  {errors.contact && <p className="mb-1 text-xs text-red-500">{errors.contact}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">Email</label>
                      <input id="email" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)}
                        onBlur={() => { if (email.trim() && !validateEmail(email)) setErrors(e => ({ ...e, email: 'Некорректный email' })); else setErrors(e => ({ ...e, email: undefined })); }}
                        className={`w-full rounded-lg border bg-background px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring ${errors.email || errors.contact ? 'border-red-400' : 'border-input'}`} />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">Номер телефона</label>
                      <input id="phone" type="tel" placeholder="+7(999)123-45-67" value={phone}
                        onChange={e => setPhone(formatPhone(e.target.value, phone))}
                        onBlur={() => { if (phone.trim() && !validatePhone(phone)) setErrors(e => ({ ...e, phone: 'Некорректный номер телефона' })); else setErrors(e => ({ ...e, phone: undefined })); }}
                        className={`w-full rounded-lg border bg-background px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring ${errors.phone || errors.contact ? 'border-red-400' : 'border-input'}`} />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground">Сообщение</label>
                  <textarea id="message" rows={4} placeholder="Текст сообщения" value={message} onChange={e => setMessage(e.target.value)}
                    className={`w-full resize-y rounded-lg border bg-background px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring ${errors.message ? 'border-red-400' : 'border-input'}`} />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>
                <button type="submit" disabled={submitting}
                  className="rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition-all hover:bg-accent-hover disabled:opacity-60">
                  {submitting ? 'Отправляем...' : 'Отправить'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
