/**
 * seed.mjs — Тестовые данные для SochiGU Contest
 *
 * Запуск:
 *   1. docker-compose up -d postgres
 *   2. cd backend && npm run start:dev  (подождать ~10 сек пока запустится)
 *   3. cd ../..  (в папку sochigu-contest)
 *   4. node seed.mjs
 */

import { execSync } from 'child_process';

const BASE = 'http://localhost:3002/api';

// ─── Хелперы ────────────────────────────────────────────────────────────────

async function post(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    console.warn(`  ⚠  POST ${path} → ${res.status}:`, JSON.stringify(data));
    return null;
  }
  return data;
}

async function patch(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    console.warn(`  ⚠  PATCH ${path} → ${res.status}:`, JSON.stringify(data));
    return null;
  }
  return data;
}

function sql(query) {
  try {
    execSync(
      `docker exec sochigu_db psql -U sochigu -d sochigu_contest -c "${query}"`,
      { stdio: 'pipe' }
    );
  } catch (e) {
    console.warn('  ⚠  SQL error:', e.stderr?.toString() || e.message);
  }
}

function log(msg) { console.log('\n' + msg); }
function ok(msg)  { console.log('  ✓', msg); }

// ─── Данные ─────────────────────────────────────────────────────────────────

const ADMIN = {
  email: 'admin@sochigu.ru',
  password: 'Admin1234',
  firstName: 'Администратор',
  lastName: 'Системный',
  university: 'СочиГУ',
};

const STUDENT = {
  email: 'student@sochigu.ru',
  password: 'Student1234',
  firstName: 'Иван',
  lastName: 'Петров',
  middleName: 'Сергеевич',
  university: 'СочиГУ',
  faculty: 'Инженерно-экологический',
  course: 3,
  city: 'Сочи',
  phone: '+7 (999) 123-45-67',
};

const NOMINATIONS = [
  {
    name: 'Бизнес-проекты',
    shortName: 'business',
    description: 'Коммерциализация идей. Pre-Seed и Seed стадии. Проекты с рыночным потенциалом и бизнес-моделью.',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Практико-ориентированные',
    shortName: 'practical',
    description: 'Образовательные и социально значимые проекты. Актуальные решения для общества.',
    isActive: true,
    sortOrder: 2,
  },
];

const NEWS = [
  {
    title: 'Открыт приём заявок на конкурс СочиГУ 2026',
    slug: 'priyom-zayavok-2026',
    excerpt: 'Стартап-студия СочиГУ объявляет о начале приёма заявок на ежегодный конкурс студенческих проектов.',
    content: `Уважаемые студенты!

Стартап-студия Сочинского государственного университета рада объявить об открытии приёма заявок на конкурс студенческих проектов СочиГУ 2026.

Участие в конкурсе бесплатное. К участию приглашаются студенты и аспиранты всех курсов и форм обучения.

**Номинации:**
- Бизнес-проекты (коммерциализация, Pre-Seed/Seed)
- Практико-ориентированные проекты (образовательные, социальные)

**Ключевые даты:**
- Приём заявок: до 30 октября
- Доработка проектов: ноябрь
- Очная презентация: декабрь
- Награждение: декабрь

Подайте заявку на сайте конкурса до 30 октября!`,
    isPublished: true,
  },
  {
    title: 'Встреча с экспертами: как защитить проект',
    slug: 'vstrecha-eksperty-zashchita',
    excerpt: 'В ноябре пройдёт серия онлайн-встреч с членами Экспертного совета. Узнайте, как правильно презентовать свой проект.',
    content: `В рамках подготовки к финальному этапу конкурса Стартап-студия СочиГУ организует серию консультаций с экспертами.

Темы встреч:
- Как оформить бизнес-модель
- Что важно для экспертов при оценке проекта
- Типичные ошибки при защите

Регистрация открыта в личном кабинете.`,
    isPublished: true,
  },
];

// ─── Основной сценарий ───────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  SochiGU Contest — Seed тестовых данных  ');
  console.log('═══════════════════════════════════════════');

  // 1. Регистрация администратора
  log('1. Регистрация администратора...');
  const adminReg = await post('/auth/register', ADMIN);
  if (adminReg) {
    ok(`Зарегистрирован: ${ADMIN.email}`);
  } else {
    ok(`(уже существует, продолжаем)`);
  }

  // 2. Повышение роли до admin через SQL
  log('2. Устанавливаем роль admin через БД...');
  sql(`UPDATE users SET role='admin' WHERE email='${ADMIN.email}';`);
  ok('Роль установлена');

  // 3. Логин как admin
  log('3. Вход как администратор...');
  const adminLogin = await post('/auth/login', { email: ADMIN.email, password: ADMIN.password });
  if (!adminLogin?.accessToken) {
    console.error('❌ Не удалось войти как admin. Проверь что бэкенд запущен (порт 3000).');
    process.exit(1);
  }
  const adminToken = adminLogin.accessToken;
  ok(`Токен получен`);

  // 4. Создание номинаций
  log('4. Создаём номинации...');
  for (const nom of NOMINATIONS) {
    const result = await post('/nominations', nom, adminToken);
    if (result) ok(`Номинация: «${nom.name}»`);
  }

  // 5. Создание новостей
  log('5. Создаём новости...');
  for (const article of NEWS) {
    const result = await post('/news', article, adminToken);
    if (result) ok(`Новость: «${article.title}»`);
  }

  // 6. Регистрация тестового студента
  log('6. Регистрируем тестового участника...');
  const studentReg = await post('/auth/register', STUDENT);
  if (studentReg) {
    ok(`Зарегистрирован: ${STUDENT.email}`);
  } else {
    ok('(уже существует)');
  }

  // 7. Создаём тестовую заявку от имени студента
  log('7. Создаём тестовую заявку...');
  const studentLogin = await post('/auth/login', { email: STUDENT.email, password: STUDENT.password });

  if (studentLogin?.accessToken) {
    const studentToken = studentLogin.accessToken;

    // Получаем id первой номинации
    const nomsRes = await fetch(BASE + '/nominations');
    const noms = await nomsRes.json().catch(() => []);

    if (noms.length > 0) {
      const app = await post('/applications', {
        nominationId: noms[0].id,
        projectTitle: 'Умная система мониторинга качества воды',
        projectDescription: `Проект направлен на создание автоматизированной системы мониторинга качества воды в прибрежных зонах Черноморского побережья. Система использует IoT-датчики для сбора данных в реальном времени и алгоритмы машинного обучения для прогнозирования загрязнений.

Актуальность: ухудшение качества воды является серьёзной экологической проблемой для туристических регионов. Наша система позволит своевременно обнаруживать загрязнения и информировать соответствующие службы.

Планируемые результаты: снижение времени реакции на экологические инциденты на 70%, охват 15 точек мониторинга вдоль побережья.`,
        keywords: ['IoT', 'экология', 'машинное обучение', 'вода', 'мониторинг'],
        teamMembers: [
          { name: 'Петров Иван', role: 'Руководитель', email: 'student@sochigu.ru' },
          { name: 'Сидорова Мария', role: 'Разработчик', email: 'sidorova@sochigu.ru' },
          { name: 'Козлов Алексей', role: 'Аналитик', email: '' },
        ],
        supervisor: {
          name: 'Иванов Дмитрий Петрович',
          title: 'Доцент кафедры информационных систем',
          email: 'ivanov.dp@sochigu.ru',
        },
      }, studentToken);

      if (app) {
        ok(`Заявка создана: «${app.projectTitle}»`);
      }
    } else {
      ok('(пропущено — номинации не найдены)');
    }
  }

  // 8. Итог
  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Готово! Данные для входа:');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  👑 АДМИНИСТРАТОР:');
  console.log(`     Email:    ${ADMIN.email}`);
  console.log(`     Пароль:   ${ADMIN.password}`);
  console.log(`     Кабинет:  http://localhost:5173/admin`);
  console.log('');
  console.log('  🎓 УЧАСТНИК:');
  console.log(`     Email:    ${STUDENT.email}`);
  console.log(`     Пароль:   ${STUDENT.password}`);
  console.log(`     Кабинет:  http://localhost:5173/cabinet`);
  console.log('');
  console.log('  📋 Что создано:');
  console.log('     • 2 номинации (Бизнес / Практико-ориентированные)');
  console.log('     • 2 опубликованные новости');
  console.log('     • 1 тестовая заявка (черновик) у участника');
  console.log('');
}

main().catch(err => {
  console.error('\n❌ Ошибка:', err.message);
  process.exit(1);
});
