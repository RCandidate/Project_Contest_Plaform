# Frontend Reference — Конкурс студенческих проектов СочиГУ

Полная документация по дизайн-системе, компонентам и страницам для переноса в другой проект.

---

## 1. ДИЗАЙН-СИСТЕМА

### Шрифт
- **Inter** (400, 500, 600, 700, 800) — подключён через Google Fonts
- Применяется ко всему приложению через `font-sans` в Tailwind

### Цветовая система (HSL-переменные в `index.css`)

| Название | CSS-переменная | HEX | Описание |
|---|---|---|---|
| primary | `--primary: 226 97% 14%` | `#011145` | Основной тёмно-синий |
| primary-mid | `--primary-mid: 215 94% 25%` | `#04367D` | Насыщенный синий |
| primary-light | `--primary-light: 206 44% 76%` | `#A6C5DC` | Мягкий голубой |
| accent | `--accent: 205 97% 87%` | `#BEE3FE` | Светлый голубой |
| accent-hover | `--accent-hover: 205 97% 85%` | светлее | Hover для кнопки |
| background | `--background: 210 20% 98%` | почти белый | Фон страниц |
| foreground | `--foreground: 222 84% 4.9%` | почти чёрный | Основной текст |
| border | `--border: 214 32% 91%` | светло-серый | Разделители |
| destructive | `--destructive: 0 85% 70%` | красный | Ошибки и удаление |
| primary-foreground | `--primary-foreground: 0 0% 98%` | белый | Текст на primary |
| accent-foreground | `--accent-foreground: 226 97% 14%` | `#011145` | Текст на accent |

```css
/* index.css — полный блок переменных */
:root {
  --background: 210 20% 98%;
  --foreground: 222 84% 4.9%;

  --card: 0 0% 100%;
  --card-foreground: 222 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 84% 4.9%;

  --primary: 226 97% 14%;           /* #011145 */
  --primary-foreground: 0 0% 100%;
  --primary-mid: 215 94% 25%;       /* #04367D */
  --primary-light: 206 44% 76%;     /* #A6C5DC */

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 226 97% 14%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215 16% 47%;

  --accent: 205 97% 87%;            /* #BEE3FE */
  --accent-foreground: 226 97% 14%;
  --accent-hover: 205 97% 85%;

  --destructive: 0 85% 70%;
  --destructive-foreground: 0 0% 100%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 226 97% 14%;
  --radius: 0.75rem;

  /* Admin sidebar */
  --sidebar-background: 226 97% 14%;
  --sidebar-foreground: 0 0% 100%;
  --sidebar-accent: 215 94% 32%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 215 94% 32%;
}
```

### Tailwind Config (`tailwind.config.js`)

```js
theme: {
  extend: {
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    colors: {
      primary: {
        DEFAULT: 'hsl(var(--primary))',         // #011145
        mid: 'hsl(var(--primary-mid))',          // #04367D
        light: 'hsl(var(--primary-light))',      // #A6C5DC
        foreground: 'hsl(var(--primary-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',           // #BEE3FE
        hover: 'hsl(var(--accent-hover))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      border: 'hsl(var(--border))',
      destructive: 'hsl(var(--destructive))',
    },
    borderRadius: { DEFAULT: 'var(--radius)' },
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
  },
}
```

### Кастомные CSS-классы

```css
/* Инпут */
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
    focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none;
}

/* Кастомный select со стрелкой */
.select-custom {
  @apply appearance-none pr-8 bg-no-repeat bg-[center_right_0.75rem] bg-white;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E");
}

/* Hero-секция градиент */
.hero-gradient {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-mid)) 100%);
}

/* Градиентный текст */
.text-gradient {
  background: linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary-mid)) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Word cloud */
.wc-word:hover { opacity: 1 !important; transform: scale(1.18); }
[data-wc-tip]::after {
  content: attr(data-wc-tip);
  position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%);
  background: #1e293b; color: #fff; font-size: 12px;
  padding: 3px 8px; border-radius: 5px;
  opacity: 0; transition: opacity 0.15s; pointer-events: none;
}
[data-wc-tip]:hover::after { opacity: 1; }

/* Кастомный scrollbar для geo-панели аналитики */
.geo-scroll::-webkit-scrollbar { width: 4px; }
.geo-scroll::-webkit-scrollbar-thumb { background: #AC7B84; border-radius: 4px; }
```

---

## 2. FRAMER MOTION — АНИМАЦИОННЫЕ ВАРИАНТЫ (`utils/animations.ts`)

```ts
const base = { duration: 0.55, ease: 'easeOut' };

// Появление снизу (при монтировании)
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { ...base, delay: 0.2 } },
};

// Появление снизу (при прокрутке)
export const fadeUpView = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0, transition: { ...base, delay: 0.2 } },
  viewport: { once: true },
};

// Простое появление
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

// Stagger-контейнер (при монтировании)
export const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

// Stagger-контейнер (при прокрутке)
export const staggerView = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  viewport: { once: true },
};

// Карточка в stagger-списке
export const cardItem = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Появление слева
export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// Hover-эффект для карточки (большой)
export const hoverCard = {
  whileHover: { scale: 1.08, zIndex: 2, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

// Hover-эффект для карточки (маленький)
export const hoverCardSm = {
  whileHover: { scale: 1.06, zIndex: 2, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

// Hover-эффект для кнопок
export const hoverBtn = {
  whileHover: { scale: 1.08, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  whileTap: { scale: 0.97 },
};

// Hover-эффект для nav-ссылок
export const hoverNav = {
  whileHover: { scale: 1.07, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  whileTap: { scale: 0.97 },
};
```

---

## 3. LAYOUT-КОМПОНЕНТЫ

### Header (`components/layout/Header.tsx`)
- **Фон**: `bg-primary` (тёмно-синий), sticky top-0, z-50
- **Логотип**: `img src={logo_white}` + текст "| Конкурс проектов" (скрыт на мобильном)
- **Навигация**: 8 ссылок (Главная, О конкурсе, Номинации, Эксперты, Новости, Документы, Победители, Контакты)
  - Цвет ссылок: `text-primary-foreground/85`
  - Hover: `hover:bg-white hover:text-primary` + transition
  - Активная ссылка: `bg-white/10`
- **Кнопки auth (не залогинен)**:
  - "Войти" — `border border-primary-foreground/50 text-primary-foreground`, hover: `hover:bg-white hover:text-primary hover:border-white`
  - "Участвовать" — `bg-accent text-accent-foreground`, hover: `hover:bg-accent-hover`
- **Кнопки auth (залогинен)**:
  - "Личный кабинет" — `border border-primary-foreground/50 text-primary-foreground`, hover: `hover:bg-white hover:text-primary hover:border-white`
  - "Выйти" — иконка LogOut, текст "Выйти"
- **Мобильное меню**: hamburger-кнопка (Menu/X иконка), выпадающий список ссылок

### Footer (`components/layout/Footer.tsx`)
- **Фон**: `bg-primary`
- **Структура**: 4 колонки (`md:grid-cols-4 gap-8`)
  1. "СочиГУ | Конкурс проектов" — logo + краткое описание
  2. "Навигация" — 4 ссылки
  3. "Участникам" — 4 ссылки
  4. "Контакты" — адрес, email
- **Разделитель**: `border-t border-primary-mid`
- **Нижняя строка**: `© {year} СочиГУ. Все права защищены.`
- **Цвета текста**: `text-primary-foreground/70`, заголовки `text-primary-foreground`

### PublicLayout (`components/layout/PublicLayout.tsx`)
- Sticky Header → AnimatePresence page transition (opacity 0.12s) → Sticky Footer
- `ScrollToTop` при смене маршрута
- `BackToTopButton` (fixed bottom-6 right-6)
- `AuthModal` подключён глобально

### CabinetLayout (`components/layout/CabinetLayout.tsx`)
- Шапка: logo + "| Личный кабинет" + имя юзера + logout
- Левый sidebar (w-48, hidden на мобильном):
  - "Dashboard" (LayoutDashboard icon) → /cabinet
  - "Моя заявка" (FileText icon) → /cabinet/application
  - Active: `bg-primary-light text-primary font-medium`
- Main: `flex-1 p-6`

### AdminLayout (`components/layout/AdminLayout.tsx`)
- Левый sidebar (fixed, w-56, `bg-primary`, `h-screen`)
- Логотип + "Панель управления" (text-xs text-primary-light)
- 10 пунктов меню с иконками lucide-react:

| Пункт | Иконка | Путь | Роли |
|---|---|---|---|
| Дашборд | LayoutDashboard | /admin | admin, moderator |
| Заявки | FileText | /admin/applications | admin, moderator, expert |
| Пользователи | Users | /admin/users | admin, moderator |
| Аналитика | BarChart3 | /admin/analytics | admin, moderator |
| Новости | Newspaper | /admin/cms/news | admin, moderator |
| Документы | FolderOpen | /admin/cms/documents | admin, moderator |
| Победители | Trophy | /admin/cms/winners | admin |
| Номинации | Tag | /admin/cms/nominations | admin |
| Конкурсы | Calendar | /admin/cms/contests | admin |
| Эксперты | UserCog | /admin/experts | admin |
| Обращения | MessageSquare | /admin/contacts | admin, moderator |

- Active ссылка: `bg-white/10`
- Недоступная ссылка: `opacity-30 cursor-not-allowed` + tooltip "Нет доступа"
- Подвал sidebar: ссылка на публичный сайт + кнопка Выйти

---

## 4. SHARED КОМПОНЕНТЫ

### AuthModal (`components/shared/AuthModal.tsx`)
- **Триггер**: `useUiStore().openAuthModal('login' | 'register')`
- **Два таба**: Login / Register с плавным переходом (layout animation)
- **Валидация**: `mode: 'onBlur'` — ошибки появляются при уходе из поля, не при submit
- **Login поля**: Email, Password
- **Register поля**: Фамилия, Имя, Отчество, Email, Телефон, Пароль, Подтверждение, ВУЗ, Факультет, Кафедра, Курс (1–6), Город, чекбокс согласия
- **Phone formatter**: при вводе форматирует в `+7(XXX)XXX-XX-XX`
- **После регистрации**: автопереключение на вкладку "Войти" + сообщение о письме
- **Стили**: backdrop `bg-black/50 backdrop-blur-sm`, карточка `bg-white rounded-2xl shadow-2xl max-w-md`
- **Закрытие**: кнопка X, ESC, клик на backdrop

### BackToTopButton (`components/shared/BackToTopButton.tsx`)
- Видна при scrollY > 300
- **Адаптивный цвет**: анализирует яркость фона под кнопкой → выбирает тёмный/светлый вариант
- `fixed bottom-6 right-6`, `rounded-full h-11 w-11`

### StatusBadge (`components/shared/StatusBadge.tsx`)
- Props: `status: ApplicationStatus`
- Цвета по статусам:

| Статус | Цвет (Tailwind) | Русский текст |
|---|---|---|
| draft | bg-gray-100 text-gray-700 | Черновик |
| submitted | bg-yellow-100 text-yellow-800 | Подана |
| accepted | bg-green-100 text-green-800 | Принята |
| rejected | bg-red-100 text-red-800 | Отклонена |
| admitted | bg-blue-100 text-blue-800 | Допущена |
| winner | bg-purple-100 text-purple-800 | Победитель |
| runner_up | bg-indigo-100 text-indigo-800 | Призёр |

### RoleGuard (`components/shared/RoleGuard.tsx`)
- Props: `roles: Role[]`, `children`, `redirectTo?`
- Если user.role не входит в roles → показывает `<AccessDenied />` или `<Navigate to={redirectTo}>`

### AccessDenied (`components/shared/AccessDenied.tsx`)
- Иконка ShieldOff (48px), "Нет доступа", подпись

### ProtectedRoute (`components/shared/ProtectedRoute.tsx`)
- Проверяет accessToken + user из auth.store
- Редирект на /login если не авторизован

### Modal (`components/shared/Modal.tsx`)
- Props: `isOpen`, `onClose`, `title`, `children`
- `fixed inset-0 bg-black/50`, карточка `max-w-lg bg-white rounded-xl`
- Закрытие: ESC + клик на фон + кнопка ×

### Spinner (`components/shared/Spinner.tsx`)
- Варианты: `sm` (w-4), `md` (w-6), `lg` (w-10)
- `animate-spin border-2 border-gray-200 border-t-primary`

### Toast / ToastProvider (`components/shared/Toast.tsx`)
- `fixed top-4 right-4`, автоудаление через 3000ms
- Варианты: `success` (green-600), `error` (red-600), `info` (blue-600)
- Хук: `useToast()` → `showToast(message, variant?)`

---

## 5. ПУБЛИЧНЫЕ СТРАНИЦЫ

### HomePage (`/`)

**Hero-секция:**
- Фон: `hero-gradient` (135deg от `#011145` до `#04367D`), высота `h-[520px]`
- Badge "Приём заявок до 30 октября": `bg-accent/20 text-accent`, `rounded-full px-3 py-1 text-sm`
- H1: white, font-bold, text-4xl md:text-5xl
- Подзаголовок: `text-primary-foreground/85`, text-lg
- Кнопка "Подать заявку": `bg-accent text-accent-foreground hover:bg-accent-hover`
- Кнопка "Узнать подробнее": `border border-primary-foreground/50 text-primary-foreground hover:bg-white hover:text-primary hover:border-white`
- Mascot image: floating animation (y: [0, -14, 0], duration 3.5s)

**Stat cards (4 карточки):**
- Контейнер: stagger + whileInView
- Каждая карточка: `{...hoverCard}`, `bg-white rounded-2xl p-6 text-center shadow-sm`
- Иконка: кружок `bg-accent rounded-full p-3`, иконка `text-primary` (40px)
- Иконки: Trophy, Users, Gift, Award (lucide-react)
- Цифра: `text-4xl font-extrabold text-primary`
- Подпись: `text-sm text-gray-500`

**Этапы конкурса (4 карточки):**
- Контейнер: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- Карточка: `bg-white p-6 text-center shadow-sm border-2 border-primary/10 rounded-2xl group`
- Кружок: `bg-primary-light group-hover:bg-primary transition-colors`, цифра `text-white font-bold text-xl`
- Заголовок: `font-semibold text-primary`
- Анимация: `{...hoverCard}` на карточке

**Ключевые даты (timeline):**
- Ряд: `whileHover="hovered"` (string variant propagation)
- Кружок с датой: `variants={{ hovered: { scale: 1.3 } }}`, `bg-accent text-primary font-bold`
- Текст: `variants={{ hovered: { scale: 1.12 } }}`, `style={{ transformOrigin: 'left center' }}`
- Соединительная линия: обычный `div` — не получает variant, не анимируется

**Новости (3 последних):**
- Карточка: `bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`
- Обёртка: `MotionLink = motion(Link)` — вся карточка кликабельна
- "Читать →": `<span>` (не ссылка, т.к. вся карточка уже ссылка)

### AboutPage (`/about`)
- **Фон страницы**: белый
- **Этапы**: аналогично HomePage — `bg-white`, кружки `bg-primary-light group-hover:bg-primary`, `{...hoverCard}`
- **CheckCircle иконки**: `text-primary`
- **Преимущества**: 3 карточки на `bg-accent/20` фоне

### NominationsPage (`/nominations`)
- Hero-light фон для заголовка
- Карточки номинаций: `border-l-4 border-primary` / `border-l-4 border-accent`

### ExpertsPage (`/experts`)
- 3-колонная сетка карточек экспертов
- Avatar: `h-24 w-24 rounded-full object-cover` или инициалы на `bg-muted`
- Карточка: `hoverCardSm`

### NewsPage (`/news`)
- Пагинация: LIMIT=10
- Карточка новости: `MotionLink` (вся кликабельна), `rounded-xl bg-white shadow-sm border-gray-100`
- Cover: `h-[200px] object-cover` или placeholder `bg-gray-200`
- Skeleton: NewsCardSkeleton (10 штук при загрузке)

### DocumentsPage (`/documents`)
- Таблица с иконками типов файлов (PDF/DOC/ZIP/FILE)
- Кнопка "Скачать" → `/api/documents/{id}/download`

### ContactsPage (`/contacts`)
- 2 колонки: реквизиты слева, форма справа
- Форма: Name, Email (опц.), Phone (опц.), Message
- **Валидация**: требуется хотя бы один из Email / Phone
- **Phone**: автоформат `+7(XXX)XXX-XX-XX` при вводе
- После отправки: success-блок с иконкой ✓

### WinnersPage (`/winners`)
- Фильтры: конкурс (select) + год + номинация
- При наличии конкурсов с данными — показывает фильтр по конкурсу, иначе по году
- WinnerCard: фото + медаль emoji + год badge + название проекта + ВУЗ
- Медали: `placeMedal(place)` → 🥇🥈🥉 или "Xe место"

---

## 6. ЛИЧНЫЙ КАБИНЕТ

### CabinetDashboardPage (`/cabinet`)
- Приветствие "Добро пожаловать, {firstName}!"
- Раздел "Мои данные": `dl grid grid-cols-2` (ФИО, Email, ВУЗ, Факультет, Курс, Город)
- Раздел "Мои заявки": таблица с StatusBadge, кнопка "Создать заявку"

### ApplicationPage (`/cabinet/application`)
- Список заявок + детальная панель справа
- Детали: заголовок, статус, описание, команда, руководитель, файлы
- История статусов: timeline с `border-l`, кружки, fromStatus → toStatus + комментарий
- Кнопки действий: Submit / Withdraw / Delete / Edit
- Confirm-модали для опасных действий

### ApplicationFormPage (`/cabinet/application/new`)
4-шаговая форма (stepper):
1. Выбор номинации
2. Описание проекта + команда (react-hook-form)
3. Загрузка файлов
4. Подтверждение + согласие

---

## 7. АДМИНИСТРАТИВНАЯ ПАНЕЛЬ

### AdminDashboardPage (`/admin`)
- **Фильтр по конкурсу**: select рядом с заголовком, по умолчанию выбирается активный конкурс
- KPI: Всего заявок, Участников, ВУЗов — фильтруются по выбранному конкурсу
- Quick links: карточки → Заявки, Пользователи, Аналитика
- Таблица последних 5 заявок — также фильтруется по конкурсу

### ApplicationsListPage (`/admin/applications`)
- Фильтры: Конкурс + Номинация + Статус + Поиск + ВУЗ (debounce 500ms) + Reset
- **По умолчанию**: автовыбор активного конкурса при загрузке
- Таблица: Название → link, Участник, Номинация, Статус (badge), Дата, Действия
- Пагинация: LIMIT=20
- Кнопка "Экспорт Excel" (с учётом всех фильтров)

### ApplicationDetailPage (`/admin/applications/:id`)
- Смена статуса: select + comment + Save
- Блоки: участник, проект, команда, руководитель, файлы, история

### UsersPage (`/admin/users`)
- Фильтры: поиск по ФИО, Email, Роль
- Таблица: ФИО, Email, Роль, ВУЗ, Дата регистрации, Действия

### AnalyticsPage (`/admin/analytics`)
- **Фильтр по конкурсу**: по умолчанию выбирается активный конкурс
- KPI-карточки (3): заявки, участники, ВУЗы
- Recharts: BarChart (по номинациям) + LineChart (timeline) + BarChart (топ ВУЗов) + BarChart (география)
- Word cloud: ключевые слова из описаний проектов (interactive tooltips)
- Print support: `@media print` стили — все графики корректно печатаются

### ExpertsPage admin (`/admin/experts`)
- Таблица: фото, ФИО, должность, видимость
- Кнопка "Добавить эксперта" → modal поиска по email
- "Редактировать профиль" → modal с загрузкой фото, должность, bio

### ContactMessagesPage (`/admin/contacts`)
- Фильтр: Все / Ожидание / Выполнено
- Таблица: Имя, Email, Телефон, Дата, Статус, Действия
- Статус badge: yellow (pending), green (done)
- Кнопки "Отметить выполненным" / "Вернуть в ожидание"

### ContactMessageDetailPage (`/admin/contacts/:id`)
- Карточка: Имя, Email, Телефон, Дата, Сообщение, Статус
- Кнопка смены статуса + "Назад"

### CMS — NewsManagePage (`/admin/cms/news`)
- Таблица: title, isPublished, дата, действия
- Modal: Title, Slug (auto-generate), Excerpt, Content, Cover image, isPublished
- Функция `slugify()` транслитерирует русский в латиницу

### CMS — DocumentsManagePage (`/admin/cms/documents`)
- Таблица: название, размер, категория, опубликован, действия
- Modal: Title, Category, File, isPublished

### CMS — WinnersManagePage (`/admin/cms/winners`)
- Фильтр по году
- Modal: Проект, Команда, Описание, Год, Место (1–3), Номинация, ВУЗ, Фото (HEIC поддерживается)

### CMS — NominationsManagePage (`/admin/cms/nominations`)
- Modal: Название, Краткое имя, Описание, Активна, Порядок сортировки

### CMS — ContestsManagePage (`/admin/cms/contests`)
- Таблица: название, даты, статус (активный/нет), действия
- Modal: Название, Описание, Дата начала, Дата окончания
- Кнопка "Сделать активным" — деактивирует все остальные конкурсы
- **Важно**: только один конкурс может быть активным; все новые заявки привязываются к активному конкурсу

---

## 8. РОУТИНГ (`App.tsx`)

```
PUBLIC (PublicLayout):
  /                       → HomePage
  /about                  → AboutPage
  /nominations            → NominationsPage
  /experts                → ExpertsPage
  /partners               → PartnersPage
  /contacts               → ContactsPage
  /news                   → NewsPage
  /news/:slug             → NewsDetailPage
  /documents              → DocumentsPage
  /winners                → WinnersPage

AUTH (без layout):
  /login                  → LoginPage
  /register               → RegisterPage
  /verify-email?token=    → VerifyEmailPage

CABINET (ProtectedRoute + CabinetLayout):
  /cabinet                → CabinetDashboardPage
  /cabinet/application    → ApplicationPage
  /cabinet/application/new           → ApplicationFormPage
  /cabinet/application/:id/edit      → ApplicationFormPage

ADMIN (ProtectedRoute + AdminLayout):
  /admin                             → AdminDashboardPage      [admin, moderator]
  /admin/applications                → ApplicationsListPage    [admin, moderator, expert]
  /admin/applications/:id            → ApplicationDetailPage
  /admin/users                       → UsersPage               [admin, moderator]
  /admin/analytics                   → AnalyticsPage           [admin, moderator]
  /admin/cms/news                    → NewsManagePage          [admin, moderator]
  /admin/cms/documents               → DocumentsManagePage     [admin, moderator]
  /admin/cms/winners                 → WinnersManagePage       [admin, moderator, expert]
  /admin/cms/nominations             → NominationsManagePage   [admin]
  /admin/cms/contests                → ContestsManagePage      [admin]
  /admin/experts                     → ExpertsPage             [admin]
  /admin/contacts                    → ContactMessagesPage     [admin, moderator]
  /admin/contacts/:id                → ContactMessageDetailPage
```

---

## 9. STATE MANAGEMENT

### auth.store.ts (Zustand + persist localStorage)
```ts
state: {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}
actions:
  setAuth(user, accessToken, refreshToken)
  setTokens(accessToken, refreshToken)
  logout()
persist: 'sochigu-auth' (localStorage)
```

### ui.store.ts (Zustand, без persist)
```ts
state: { authModal: 'login' | 'register' | null }
actions:
  openAuthModal(mode: 'login' | 'register')
  closeAuthModal()
```

---

## 10. API СЛОЙ

### client.ts
- baseURL: `/api`
- Request interceptor: `Authorization: Bearer {accessToken}`
- Response interceptor: 401 → refresh токен → повтор запроса → при ошибке logout + /login

### Эндпоинты

| Модуль | Методы |
|---|---|
| auth | register, login, logout, verifyEmail, refresh |
| applications | create, getMy, getAll, getById, update, submit, updateStatus, delete, withdraw, exportExcel |
| files | uploadFile(appId, file, category), downloadFile(id) |
| news | getPublished, getBySlug, getAll (admin), create, update, remove, uploadPhoto |
| users | getAll, getMe, updateMe, updateRole, updateExpertProfile, getPublicExperts, uploadPhoto |
| winners | getAll, getYears, getContests, create, update, remove, uploadPhoto |
| documents | getAll, getAllAdmin, create, update, remove |
| nominations | getAll, getAllAdmin, create, update, remove |
| contests | getAll, getActive, create, update, remove, setActive |
| contacts | submit, getAll, getById, updateStatus |
| analytics | getSummary, getByNomination, getTimeline, getGeography, getKeywords, getByStatus, getActivity |

---

## 11. ТИПЫ (`types/index.ts`)

```ts
type Role = 'participant' | 'expert' | 'moderator' | 'admin'

type ApplicationStatus =
  'draft' | 'submitted' | 'accepted' | 'rejected' | 'admitted' | 'winner' | 'runner_up'

type ContactMessageStatus = 'pending' | 'done'

interface Contest {
  id: string; name: string; description?: string;
  startDate: string; endDate: string; isActive: boolean; createdAt: string;
}

interface User {
  id: string; email: string; firstName: string; lastName: string; middleName?: string;
  phone?: string; university?: string; faculty?: string; department?: string;
  course?: number; city?: string; role: Role; isActive: boolean;
  isEmailVerified?: boolean; createdAt: string;
  avatarUrl?: string; position?: string; bio?: string; isExpertVisible?: boolean;
}

interface Application {
  id: string; userId: string; nominationId: string; nomination?: Nomination;
  contestId?: string; contest?: Contest;
  projectTitle: string; projectDescription: string; keywords?: string[];
  teamMembers?: TeamMember[]; supervisor?: Supervisor; status: ApplicationStatus;
  adminComment?: string; submittedAt?: string;
  files?: AppFile[]; logs?: ApplicationLog[]; user?: User;
  createdAt: string; updatedAt: string;
}

interface News {
  id: string; title: string; slug: string; content: string;
  excerpt?: string; coverImage?: string; isPublished: boolean;
  contestId?: string; publishedAt?: string; createdAt: string;
}

interface Winner {
  id: string; projectTitle: string; teamName: string; description?: string;
  year: number; place: number; nomination?: Nomination; nominationId: string;
  contest?: Contest; contestId?: string;
  photoUrl?: string; university?: string;
}

interface ContactMessage {
  id: string; name: string; email?: string; phone?: string;
  message: string; status: ContactMessageStatus; createdAt: string;
}

interface AnalyticsSummary {
  totalApplications: number; totalUsers: number; totalUniversities: number;
  newThisWeek: number; underReview: number; teamApplications: number; avgTeamSize: number;
}

interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; limit: number;
}

// Константы статусов (используются в таблицах и фильтрах)
const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string>
const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string>
```

---

## 12. УТИЛИТЫ

```ts
// utils/formatDate.ts
formatDate(dateStr: string): string
// → "23 декабря 2024" (ru-RU)

// utils/format.ts
formatDate(str: string): string     // → "23 декабря 2024, 14:30"
formatSize(bytes: number): string   // → "1.5 МБ" / "256 КБ"

// utils/placeMedal.ts
placeMedal(place: number): string   // 1→'🥇', 2→'🥈', 3→'🥉', иначе→'Xe место'

// AuthModal + ContactsPage
formatPhone(raw: string): string
// Убирает не-цифры, нормализует 8→7, ограничивает 11 цифрами
// → "+7(912)345-67-89"
```

---

## 13. ЗАВИСИМОСТИ

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.22.3",
  "react-hook-form": "^7.51.0",
  "zustand": "^4.x",
  "axios": "^1.6.7",
  "framer-motion": "^12.36.0",
  "lucide-react": "^0.575.0",
  "recharts": "^2.x",
  "react-wordcloud": "^1.2.7",
  "clsx": "^2.1.0",
  "tailwindcss": "^3.x",
  "vite": "^5.x",
  "typescript": "^5.x"
}
```

> **Важно**: `react-wordcloud@1.2.7` требует peer dep React 16, но работает с React 18 через `legacy-peer-deps=true` (`.npmrc` уже настроен).

---

## 14. ВАЖНЫЕ ДЕТАЛИ РЕАЛИЗАЦИИ

1. **Phone formatting**: одна и та же `formatPhone()` функция используется в `ContactsPage` и `AuthModal/RegisterForm`. При изменении поведения — менять в обоих местах.

2. **Ключевые даты hover**: используется string variant `whileHover="hovered"` на родителе, а `variants={{ hovered: { scale: ... } }}` только на кружке и тексте. Соединительная линия — обычный `div`, не получает вариант и не анимируется.

3. **Весь news card кликабелен**: `MotionLink = motion(Link)` оборачивает всю карточку. "Читать →" внутри — `<span>`, не `<Link>`.

4. **Синее свечение кнопок**: причина — `--accent-hover` с яркостью 75% давал насыщенный голубой при hover. Исправлено на 85% lightness.

5. **RetryKey pattern**: для повтора `useEffect` с пустыми deps (NewsPage, WinnersPage, AnalyticsPage) — используется `retryKey` счётчик в зависимостях, инкрементируется по кнопке "Повторить".

6. **Expert redirect**: эксперт после логина → `/admin/applications` (не `/cabinet`, не `/admin`).

7. **RoleGuard vs ProtectedRoute**: `ProtectedRoute` проверяет только авторизацию, `RoleGuard` проверяет конкретные роли внутри admin-зоны.

8. **Print support**: `AnalyticsPage` имеет `@media print` стили — можно печатать графики.

9. **HEIC support**: загрузка фото победителей (WinnersManagePage) поддерживает HEIC — конвертируется на backend через `heic-convert`.

10. **Sidebar AdminLayout**: пункты меню содержат массив `roles[]`. При отсутствии доступа — `<span>` с `opacity-30` вместо `<Link>`, tooltip "Нет доступа". **При добавлении новых страниц** нужно обновлять и `AdminLayout.tsx` (roles в sidebarLinks), и `App.tsx` (RoleGuard).

11. **Email verification flow**: после регистрации бэкенд отправляет письмо с токеном, пользователь переходит на `/verify-email?token=...`, компонент `VerifyEmailPage` вызывает `authApi.verifyEmail(token)` и показывает результат. Без подтверждения email пользователь не может войти (`isEmailVerified = false`). Письмо можно переотправить через `/api/auth/resend-verification`.

12. **react-hook-form mode: onBlur**: все формы (AuthModal login/register, RegisterPage, LoginPage, ApplicationFormPage) используют `useForm({ mode: 'onBlur' })`. Это значит — ошибка валидации появляется сразу при уходе из поля, а не только после нажатия Submit. Если добавляешь новую форму — используй `mode: 'onBlur'` по умолчанию.

13. **Contest filter auto-select**: `ApplicationsListPage` при загрузке автоматически выставляет фильтр на активный конкурс (`list.find(c => c.isActive)`). Аналогично работает `WinnersPage` для публичного просмотра. Если активного конкурса нет — фильтр остаётся пустым (показываются все).

14. **ContestsManagePage**: страница управления конкурсами (`/admin/cms/contests`). Только один конкурс может быть активным — при активации нового предыдущий автоматически деактивируется на бэкенде. `isActive` конкурса влияет на авто-выбор фильтра в AdminPanel и на публичную страницу Winners.
