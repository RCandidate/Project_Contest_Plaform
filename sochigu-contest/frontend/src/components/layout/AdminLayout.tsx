import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { BackToTopButton } from '@/components/shared/BackToTopButton';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Newspaper,
  FolderOpen,
  Trophy,
  Tag,
  UserCog,
  ExternalLink,
  LogOut,
  MessageSquare,
  CalendarRange,
  Briefcase,
} from "lucide-react";
import logoWhite from '@/logo_white.png';
import type { Role } from '@/types';

const sidebarLinks: { to: string; label: string; icon: React.ElementType; exact?: boolean; roles: Role[] }[] = [
  { to: '/admin',               label: 'Дашборд',      icon: LayoutDashboard, exact: true, roles: ['admin', 'moderator'] },
  { to: '/admin/applications',  label: 'Заявки',        icon: FileText,                     roles: ['admin', 'moderator', 'expert'] },
  { to: '/admin/users',         label: 'Пользователи', icon: Users,                         roles: ['admin', 'moderator'] },
  { to: '/admin/analytics',     label: 'Аналитика',    icon: BarChart3,                     roles: ['admin', 'moderator'] },
  { to: '/admin/cms/news',      label: 'Новости',       icon: Newspaper,                    roles: ['admin', 'moderator'] },
  { to: '/admin/cms/documents', label: 'Документы',    icon: FolderOpen,                    roles: ['admin', 'moderator'] },
  { to: '/admin/cms/winners',   label: 'Победители',   icon: Trophy,                        roles: ['admin', 'moderator'] },
  { to: '/admin/cms/nominations', label: 'Номинации',  icon: Tag,                           roles: ['admin', 'moderator'] },
  { to: '/admin/experts',       label: 'Эксперты',     icon: UserCog,                       roles: ['admin', 'moderator'] },
  { to: '/admin/contacts',      label: 'Обращения',    icon: MessageSquare,                 roles: ['admin', 'moderator'] },
  { to: '/bank',                label: 'Банк работ',   icon: Briefcase,                     roles: ['admin', 'moderator'] },
  { to: '/admin/cms/contests',  label: 'Конкурсы',     icon: CalendarRange,                  roles: ['admin'] },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen">
      <aside className="sidebar-print-hide fixed left-0 top-0 z-40 flex h-screen w-56 flex-col bg-primary text-primary-foreground">
        <div className="border-b border-primary-mid p-4 flex items-center gap-3">
          <img src={logoWhite} alt="СочиГУ" className="h-10 w-auto shrink-0" />
          <p className="text-xs text-primary-foreground/70 leading-snug">Панель управления</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            const hasAccess = !user || link.roles.includes(user.role);

            if (!hasAccess) {
              return (
                <span key={link.to}
                  title="Нет доступа"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-30 cursor-not-allowed select-none">
                  <link.icon size={18} />
                  {link.label}
                </span>
              );
            }

            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-mid hover:text-primary-foreground'
                }`}>
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-primary-mid p-3">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground/70 hover:bg-primary-mid">
            <ExternalLink size={16} /> Публичный сайт
          </Link>
          <button onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground/70 hover:bg-primary-mid">
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>
      <main className="print-full ml-56 flex-1 bg-background p-6">
        <Outlet />
      </main>
      <BackToTopButton />
    </div>
  );
}
