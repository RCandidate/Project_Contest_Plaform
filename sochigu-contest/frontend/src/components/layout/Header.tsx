import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { authApi } from '@/api/auth';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoWhite from '@/logo_white.png';
import { hoverBtn } from '@/utils/animations';

const MotionLink = motion(Link);
const spring = { type: 'spring' as const, stiffness: 300, damping: 22 };
const hoverNav = { whileHover: { scale: 1.07, transition: spring }, whileTap: { scale: 0.96 } };

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/about', label: 'О конкурсе' },
  { to: '/nominations', label: 'Номинации' },
  { to: '/experts', label: 'Экспертный совет' },
  { to: '/news', label: 'Новости' },
  { to: '/documents', label: 'Документы' },
  { to: '/winners', label: 'Победители' },
  { to: '/contacts', label: 'Контакты' },
];

export function Header() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { openAuthModal } = useUiStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await authApi.logout(); navigate('/'); };
  const cabinetPath = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'expert' ? '/admin' : '/cabinet';

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <MotionLink to="/" className="flex items-center gap-2 text-primary-foreground" {...hoverNav}>
          <img src={logoWhite} alt="СочиГУ" className="h-10 w-auto" />
          <span className="hidden text-sm font-medium text-primary-foreground/80 sm:inline">Конкурс проектов</span>
        </MotionLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <MotionLink key={link.to} to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-white hover:text-primary"
              {...hoverNav}>
              {link.label}
            </MotionLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <MotionLink to={cabinetPath}
                className="rounded-lg border border-primary-foreground/30 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-white hover:text-primary hover:border-white"
                {...hoverBtn}>
                Личный кабинет
              </MotionLink>
              <motion.button onClick={handleLogout}
                className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                {...hoverNav}>
                Выйти
              </motion.button>
            </>
          ) : (
            <>
              <motion.button onClick={() => openAuthModal('login')}
                className="rounded-lg border border-primary-foreground/30 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-white hover:text-primary hover:border-white"
                {...hoverBtn}>
                Войти
              </motion.button>
              <motion.button onClick={() => openAuthModal('register')}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
                {...hoverBtn}>
                Участвовать
              </motion.button>
            </>
          )}
        </div>

        <button className="text-primary-foreground lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-primary-mid bg-primary px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-white hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-primary-mid pt-3">
            {user ? (
              <>
                <Link to={cabinetPath} onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-primary-foreground/30 px-4 py-2 text-center text-sm font-medium text-primary-foreground">
                  Личный кабинет
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="text-sm text-primary-foreground/70">Выйти</button>
              </>
            ) : (
              <>
                <button onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                  className="rounded-lg border border-primary-foreground/30 px-4 py-2 text-center text-sm font-medium text-primary-foreground">Войти</button>
                <button onClick={() => { openAuthModal('register'); setMobileOpen(false); }}
                  className="rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground">Участвовать</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
