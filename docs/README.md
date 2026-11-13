# Конкурс студенческих проектов — СочиГУ

Веб-платформа для проведения всероссийского конкурса студенческих проектов ФГБОУ ВО «Сочинский государственный университет».

## Стек

| Слой | Технология |
|------|-----------|
| Backend | NestJS 10, TypeORM, PostgreSQL |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Auth | JWT (access + refresh tokens), bcrypt |
| Файлы | Multer, локальное хранилище |
| Email | Nodemailer (SMTP) |
| Аналитика | Recharts, react-wordcloud |
| Экспорт | ExcelJS |
| Инфраструктура | Docker Compose, Nginx, Let's Encrypt |

## Структура репозитория

```
GOATs/
├── docs/
│   ├── README.md           # Этот файл
│   ├── ADMIN_GUIDE.md      # Руководство администратора
│   └── frontend-reference.md  # Дизайн-система и компоненты
└── sochigu-contest/
    ├── backend/          # NestJS API
    │   └── src/
    │       ├── auth/           # JWT авторизация + email-верификация
    │       ├── users/          # Пользователи
    │       ├── nominations/    # Номинации
    │       ├── contests/       # Конкурсы (сезоны)
    │       ├── applications/   # Заявки + история статусов
    │       ├── files/          # Загрузка файлов (Multer)
    │       ├── news/           # Новости
    │       ├── documents/      # Документы
    │       ├── winners/        # Победители
    │       ├── analytics/      # Аналитические эндпоинты
    │       ├── contacts/       # Обращения с сайта
    │       ├── mail/           # Email-уведомления
    │       └── common/         # Guards, decorators, enums, filters
    ├── frontend/         # React + Vite
    │   └── src/
    │       ├── api/            # Axios-клиент + методы по сущностям
    │       ├── components/     # UI, layouts, shared
    │       ├── pages/          # public/, auth/, cabinet/, admin/
    │       ├── store/          # Zustand (auth)
    │       ├── types/          # TypeScript типы
    │       └── utils/          # formatDate, formatSize, placeMedal, animations
    ├── docker-compose.yml      # Production: все сервисы в Docker
    └── setup.js               # Первоначальная настройка для нового разработчика
```

## Быстрый старт

> **Требования:** Node.js 18+, npm, Docker Desktop

### 1 команда для нового разработчика

```bash
git clone <repo-url>
cd sochigu-contest

node setup.js     # установит зависимости, создаст .env, проверит Docker
npm run dev       # запустит БД + backend + frontend одновременно
```

Приложение будет доступно:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3002/api

---

### Детали

**Что делает `npm run dev`:**
1. Поднимает PostgreSQL в Docker
2. Запускает NestJS с hot-reload (`nest start --watch`) на порту 3002
3. Запускает Vite dev-server на порту 5173

**Режимы запуска:**

| Команда | Где | Что запускает |
|---------|-----|---------------|
| `npm run dev` | Локальная разработка | PostgreSQL в Docker + NestJS hot-reload + Vite dev-server |
| `npm run prod` | Сервер / production | Все три сервиса в Docker (`docker-compose.yml`) |

**Остальные команды:**

| Команда | Описание |
|---------|----------|
| `npm run setup` | Первоначальная настройка (= `node setup.js`) |
| `npm run db:down` | Остановить БД (dev) |
| `npm run db:reset` | Сбросить БД и данные (удалит volume!) |
| `npm run prod:down` | Остановить все prod-контейнеры |
| `npm run prod:logs` | Логи prod-контейнеров в реальном времени |
| `npm run install:all` | Переустановить все зависимости |
| `npm run build` | Сборка backend + frontend |

**При первом запуске** TypeORM автоматически создаст таблицы (`synchronize: true` в dev-режиме).

**Для production** использовать миграции:
```bash
cd backend
npm run migration:generate -- -n InitialMigration
npm run migration:run
```

---

### Деплой на сервер (production)

```bash
git clone https://github.com/parovozzers/GOATs.git
cd GOATs/sochigu-contest

# 1. Создать .env из шаблона и заполнить реальными значениями
cp backend/.env.prod.example backend/.env
nano backend/.env

# 2. Запустить все сервисы
docker compose up -d --build
```

> **Важно:** `docker-compose.yml` читает переменную `${DB_PASS}` из `backend/.env`.
> Значение `DB_PASS` в `backend/.env` используется и PostgreSQL-контейнером, и бэкендом.

## API эндпоинты

| Метод | Путь | Описание | Доступ |
|-------|------|----------|--------|
| POST | /api/auth/register | Регистрация | Публичный |
| POST | /api/auth/login | Вход | Публичный |
| POST | /api/auth/refresh | Обновление токена | Публичный |
| POST | /api/auth/logout | Выход | Авторизованный |
| GET | /api/auth/verify-email?token= | Подтверждение email | Публичный |
| GET | /api/nominations | Список номинаций | Публичный |
| GET | /api/contests | Список конкурсов | Публичный |
| GET | /api/news | Новости (опубликованные) | Публичный |
| GET | /api/documents | Документы | Публичный |
| GET | /api/winners | Победители | Публичный |
| GET | /api/users/experts | Публичный список экспертов | Публичный |
| GET | /api/applications/my | Мои заявки | Участник |
| POST | /api/applications | Создать заявку | Участник |
| POST | /api/files/upload/:id | Загрузить файл | Участник |
| GET | /api/applications | Все заявки (с фильтрами) | Expert/Moderator/Admin |
| PATCH | /api/applications/:id/status | Сменить статус | Expert/Moderator/Admin |
| GET | /api/analytics/summary | Сводная статистика | Moderator/Admin |
| GET | /api/analytics/by-nomination | По номинациям | Moderator/Admin |
| GET | /api/analytics/timeline | Динамика по дням | Moderator/Admin |
| GET | /api/analytics/geography | География | Moderator/Admin |
| GET | /api/analytics/keywords | Ключевые слова | Moderator/Admin |
| GET | /api/analytics/by-status | По статусам | Moderator/Admin |
| GET | /api/analytics/activity | Активность | Moderator/Admin |
| GET | /api/applications/export/excel | Экспорт Excel | Moderator/Admin |

## Роли пользователей

| Роль | Доступ |
|------|--------|
| `participant` | Личный кабинет, подача заявок |
| `expert` | Просмотр всех заявок, смена статуса |
| `moderator` | + аналитика, пользователи, обращения, новости, экспорт |
| `admin` | Полный доступ: CMS, конкурсы, номинации, эксперты, удаление |

## Статусная машина заявки

```
DRAFT → SUBMITTED → ACCEPTED → ADMITTED → WINNER / RUNNER_UP
                  ↘ REJECTED
```

Каждое изменение статуса: логируется в `application_logs` + email участнику.

## Команда разработки

| Разработчик | Роль | Зона ответственности |
|-------------|------|---------------------|
| Dev 1 | Lead / Backend | Архитектура, Auth, деплой, безопасность, конкурсы |
| Dev 2 | Frontend Junior | Публичные страницы, ЛК, UI-компоненты, графики |
| Dev 3 | Fullstack Junior | Новости/Документы/Победители, CMS, экспорт |
