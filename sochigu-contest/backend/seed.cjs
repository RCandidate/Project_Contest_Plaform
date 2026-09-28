// Seed script: node seed.cjs
// Заполняет: news, nominations, documents, winners

const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'postgres',
  port: 5432,
  user: process.env.DB_USER || 'sochigu',
  password: process.env.DB_PASS || 'sochigu_pass',
  database: process.env.DB_NAME || 'sochigu_contest',
});

// ─── Данные ───────────────────────────────────────────────

const news = [
  {
    title: 'Открыт приём заявок на конкурс студенческих проектов 2026',
    slug: 'priyom-zayavok-2026',
    excerpt: 'СочиГУ открывает приём заявок на конкурс студенческих проектов «Молодые таланты СочиГУ — 2026». Участвовать могут студенты всех факультетов и курсов.',
    coverImage: 'https://picsum.photos/seed/news1/800/400',
    publishedAt: '2026-03-01T09:00:00Z',
    content: `<p>Сочинский государственный университет объявляет об открытии приёма заявок на ежегодный конкурс студенческих проектов <strong>«Молодые таланты СочиГУ — 2026»</strong>.</p>
<h2>Кто может участвовать</h2>
<p>К участию приглашаются студенты всех факультетов и курсов очной и заочной форм обучения. Допускается участие команд до 5 человек, а также индивидуальные проекты.</p>
<h2>Номинации</h2>
<ul>
  <li>Цифровые технологии и IT</li>
  <li>Экология и устойчивое развитие</li>
  <li>Социальные инициативы</li>
  <li>Бизнес и предпринимательство</li>
  <li>Наука и образование</li>
</ul>
<h2>Сроки</h2>
<p>Приём заявок: <strong>1 марта — 15 апреля 2026 года</strong>.<br>Очный этап: <strong>20 мая 2026 года</strong>.</p>
<p>Для подачи заявки зарегистрируйтесь на платформе и заполните форму в личном кабинете.</p>`,
  },
  {
    title: 'Победители конкурса 2025 года: поздравляем лучших!',
    slug: 'pobiediteli-2025',
    excerpt: 'В конкурсе 2025 года приняли участие более 120 команд из 14 университетов. Объявляем победителей по всем номинациям.',
    coverImage: 'https://picsum.photos/seed/news2/800/400',
    publishedAt: '2025-06-01T12:00:00Z',
    content: `<p>Завершился ежегодный конкурс студенческих проектов СочиГУ. В этом году на конкурс поступило более <strong>120 заявок</strong> от студентов 14 университетов.</p>
<h2>Победители</h2>
<h3>Номинация «Цифровые технологии»</h3>
<p>🥇 <strong>1 место</strong> — команда «Нейро-Сочи» (умная система распределения туристических потоков)<br>🥈 <strong>2 место</strong> — Иван Петров (мобильное приложение для абитуриентов)</p>
<h3>Номинация «Экология»</h3>
<p>🥇 <strong>1 место</strong> — команда «ЭкоЮг» (мониторинг качества воды в прибрежной зоне)</p>
<blockquote>«Этот конкурс — уникальная возможность для студентов не просто предложить идею, но и представить её экспертному сообществу» — Проректор по научной работе</blockquote>
<p>Поздравляем всех участников и победителей!</p>`,
  },
  {
    title: 'Мастер-класс: как правильно оформить заявку на конкурс',
    slug: 'masterklass-zayavka',
    excerpt: 'Бесплатный мастер-класс для участников конкурса: разбираем структуру заявки, типичные ошибки и критерии оценки экспертов.',
    coverImage: 'https://picsum.photos/seed/news3/800/400',
    publishedAt: '2026-02-20T10:00:00Z',
    content: `<p>Университет проводит серию бесплатных мастер-классов для участников конкурса. Эксперты разберут типичные ошибки при оформлении проектных заявок.</p>
<h2>Программа</h2>
<ul>
  <li><strong>10:00–11:00</strong> — Структура проектного описания</li>
  <li><strong>11:00–12:00</strong> — Как сформулировать цель и гипотезу</li>
  <li><strong>12:00–13:00</strong> — Разбор реальных заявок прошлых лет</li>
  <li><strong>13:00–14:00</strong> — Вопросы и ответы</li>
</ul>
<h2>Когда и где</h2>
<p>Дата: <strong>10 марта 2026</strong>, 10:00–14:00<br>Место: Корпус A, ауд. 301</p>`,
  },
  {
    title: 'Состав экспертного жюри конкурса 2026',
    slug: 'sostav-zhyuri-2026',
    excerpt: 'Представляем состав экспертного жюри конкурса 2026 года: представители бизнеса, науки и государственных структур.',
    coverImage: 'https://picsum.photos/seed/news4/800/400',
    publishedAt: '2026-02-15T14:00:00Z',
    content: `<p>Представляем экспертов, которые будут оценивать проекты в этом году.</p>
<h2>Члены жюри</h2>
<ul>
  <li><strong>Анна Волкова</strong> — директор Краснодарского технопарка</li>
  <li><strong>Михаил Соколов</strong> — к.т.н., доцент СочиГУ</li>
  <li><strong>Елена Дмитриева</strong> — руководитель программ поддержки молодёжного предпринимательства</li>
  <li><strong>Артём Новиков</strong> — CTO компании «Цифровой Юг»</li>
  <li><strong>Ирина Захарова</strong> — представитель Министерства науки</li>
</ul>
<h2>Критерии оценки</h2>
<p>Актуальность, инновационность, реализуемость, социальная значимость и качество презентации.</p>`,
  },
  {
    title: 'Гранты для победителей: что получат лучшие проекты',
    slug: 'granty-pobieditelyam',
    excerpt: 'Призовой фонд конкурса 2026 года превысил 1 миллион рублей. Рассказываем, что получат победители в каждой номинации.',
    coverImage: 'https://picsum.photos/seed/news5/800/400',
    publishedAt: '2026-02-10T11:00:00Z',
    content: `<p>В этом году призовой фонд конкурса существенно вырос благодаря поддержке партнёров.</p>
<h2>Призовой фонд</h2>
<ul>
  <li>🥇 1 место — <strong>150 000 ₽</strong> + менторская поддержка</li>
  <li>🥈 2 место — <strong>75 000 ₽</strong></li>
  <li>🥉 3 место — <strong>30 000 ₽</strong></li>
  <li>Специальный приз жюри — <strong>50 000 ₽</strong></li>
</ul>
<h2>Нефинансовые бонусы</h2>
<ul>
  <li>Стажировка в компаниях-партнёрах</li>
  <li>Рекомендательные письма от организаторов</li>
  <li>Размещение в базе инновационных разработок региона</li>
</ul>`,
  },
  {
    title: 'Часто задаваемые вопросы об участии в конкурсе',
    slug: 'faq-uchastie',
    excerpt: 'Ответы на популярные вопросы: кто может участвовать, сколько проектов подать, нужен ли научный руководитель.',
    coverImage: null,
    publishedAt: '2026-02-05T09:30:00Z',
    content: `<p>Собрали ответы на самые популярные вопросы участников.</p>
<h2>Общие вопросы</h2>
<h3>Можно ли участвовать студентам других вузов?</h3>
<p>Да! Конкурс открыт для студентов всех российских университетов.</p>
<h3>Сколько проектов можно подать?</h3>
<p>Не более 2 проектов в разных номинациях.</p>
<h3>Нужен ли научный руководитель?</h3>
<p>Не обязательно, но будет преимуществом при оценке.</p>
<h2>Технические вопросы</h2>
<h3>Какие файлы нужно прикрепить?</h3>
<p>Обязательно: описание проекта (PDF, до 10 МБ). Дополнительно: презентация, прототип, видео.</p>`,
  },
  {
    title: 'Партнёры конкурса 2026 года',
    slug: 'partnyory-2026',
    excerpt: 'Конкурс проводится при поддержке ведущих компаний региона: Цифровой Юг, Краснодарский технопарк и другие.',
    coverImage: 'https://picsum.photos/seed/news7/800/400',
    publishedAt: '2026-01-25T16:00:00Z',
    content: `<p>Конкурс проводится при поддержке ведущих компаний и организаций региона.</p>
<h2>Генеральные партнёры</h2>
<ul>
  <li><strong>Цифровой Юг</strong> — поддерживает номинацию «Цифровые технологии»</li>
  <li><strong>Краснодарский технопарк</strong> — площадка для акселерации стартапов</li>
</ul>
<h2>Партнёры</h2>
<ul>
  <li><strong>ЭкоИнвест</strong> — поддерживает номинацию «Экология»</li>
  <li><strong>Сочи Бизнес Хаб</strong> — поддерживает номинацию «Предпринимательство»</li>
</ul>`,
  },
  {
    title: 'Итоги предзащиты: 42 проекта допущены к финалу',
    slug: 'itogi-predzashchity',
    excerpt: 'Экспертная комиссия завершила предзащиту. К очному финалу допущены 42 проекта из 118. Финалисты получили уведомления на email.',
    coverImage: 'https://picsum.photos/seed/news8/800/400',
    publishedAt: '2026-01-15T18:00:00Z',
    content: `<p>Завершился этап предзащиты проектов. К очному финалу допущены <strong>42 проекта</strong> из 118 поданных заявок.</p>
<h2>Что дальше</h2>
<p>Финалисты должны:</p>
<ul>
  <li>Подтвердить участие до <strong>10 мая 2026</strong> в личном кабинете</li>
  <li>Загрузить финальную презентацию до <strong>15 мая</strong></li>
  <li>Прибыть на площадку <strong>20 мая</strong> не позднее 09:30</li>
</ul>`,
  },
];

const nominations = [
  { name: 'Цифровые технологии и IT', shortName: 'IT', description: 'Проекты в области программного обеспечения, мобильных приложений, искусственного интеллекта и цифровизации.', sortOrder: 1 },
  { name: 'Экология и устойчивое развитие', shortName: 'Экология', description: 'Проекты в области охраны окружающей среды, рационального природопользования и «зелёных» технологий.', sortOrder: 2 },
  { name: 'Социальные инициативы', shortName: 'Социум', description: 'Проекты, направленные на решение социальных проблем и улучшение качества жизни.', sortOrder: 3 },
  { name: 'Бизнес и предпринимательство', shortName: 'Бизнес', description: 'Стартапы и бизнес-модели с потенциалом коммерциализации.', sortOrder: 4 },
  { name: 'Наука и образование', shortName: 'Наука', description: 'Научно-исследовательские и образовательные проекты.', sortOrder: 5 },
];

const documents = [
  { title: 'Положение о конкурсе студенческих проектов 2026', fileName: 'polozhenie-konkurs-2026.pdf', storagePath: '/uploads/docs/polozhenie-2026.pdf', mimeType: 'application/pdf', size: 524288, category: 'Нормативные документы', sortOrder: 1 },
  { title: 'Регламент проведения очного этапа', fileName: 'reglament-ochny-etap.pdf', storagePath: '/uploads/docs/reglament.pdf', mimeType: 'application/pdf', size: 307200, category: 'Нормативные документы', sortOrder: 2 },
  { title: 'Критерии оценки проектов', fileName: 'kriterii-ocenki.pdf', storagePath: '/uploads/docs/kriterii.pdf', mimeType: 'application/pdf', size: 204800, category: 'Нормативные документы', sortOrder: 3 },
  { title: 'Шаблон заявки участника (Word)', fileName: 'shablon-zayavki.docx', storagePath: '/uploads/docs/shablon-zayavki.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 102400, category: 'Шаблоны', sortOrder: 4 },
  { title: 'Шаблон презентации проекта (PowerPoint)', fileName: 'shablon-prezentacii.pptx', storagePath: '/uploads/docs/shablon-prezentacii.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 2621440, category: 'Шаблоны', sortOrder: 5 },
  { title: 'Архив шаблонов документов', fileName: 'templates-2026.zip', storagePath: '/uploads/docs/templates-2026.zip', mimeType: 'application/zip', size: 3145728, category: 'Шаблоны', sortOrder: 6 },
];

// ─── Seed ─────────────────────────────────────────────────

async function seed() {
  await client.connect();
  console.log('Connected to PostgreSQL\n');

  // Порядок важен: сначала удаляем зависимые таблицы
  await client.query('DELETE FROM winners');
  await client.query('DELETE FROM nominations');
  await client.query('DELETE FROM documents');
  await client.query('DELETE FROM news');
  console.log('Cleared: winners, nominations, documents, news\n');

  // 1. News
  for (const item of news) {
    await client.query(
      `INSERT INTO news (id, title, slug, content, excerpt, "coverImage", "isPublished", "publishedAt", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, $6, NOW(), NOW())`,
      [item.title, item.slug, item.content, item.excerpt, item.coverImage, item.publishedAt],
    );
    console.log(`  ✓ News: ${item.title}`);
  }

  // 2. Nominations (нужны до winners)
  const nominationIds = [];
  for (const nom of nominations) {
    const res = await client.query(
      `INSERT INTO nominations (id, name, "shortName", description, "isActive", "sortOrder", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, true, $4, NOW(), NOW()) RETURNING id`,
      [nom.name, nom.shortName, nom.description, nom.sortOrder],
    );
    nominationIds.push(res.rows[0].id);
    console.log(`  ✓ Nomination: ${nom.name}`);
  }

  // 3. Documents
  for (const doc of documents) {
    await client.query(
      `INSERT INTO documents (id, title, "fileName", "storagePath", "mimeType", size, category, "isPublished", "sortOrder", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, $7, NOW(), NOW())`,
      [doc.title, doc.fileName, doc.storagePath, doc.mimeType, doc.size, doc.category, doc.sortOrder],
    );
    console.log(`  ✓ Document: ${doc.title}`);
  }

  // 4. Winners (nominationIds: 0=IT, 1=Экология, 2=Социум, 3=Бизнес, 4=Наука)
  const winners = [
    { projectTitle: 'Нейро-Сочи: умная навигация туристических потоков', teamName: 'Команда «НейроЮг»', description: 'Система ML-анализа и перераспределения туристических потоков в Сочи', year: 2025, place: 1, nominationId: nominationIds[0], photoUrl: 'https://picsum.photos/seed/w1/600/400', university: 'СочиГУ' },
    { projectTitle: 'SmartCampus: мобильное приложение для студентов', teamName: 'Иван Петров', description: null, year: 2025, place: 2, nominationId: nominationIds[0], photoUrl: null, university: 'КубГУ' },
    { projectTitle: 'EcoMonitor: мониторинг качества воды Чёрного моря', teamName: 'Команда «ЭкоЮг»', description: 'Сеть IoT-датчиков и веб-платформа анализа данных', year: 2025, place: 1, nominationId: nominationIds[1], photoUrl: 'https://picsum.photos/seed/w3/600/400', university: 'СочиГУ' },
    { projectTitle: 'GreenRoute: сервис экологичных маршрутов', teamName: 'Команда «ГринТрэвел»', description: null, year: 2025, place: 2, nominationId: nominationIds[1], photoUrl: null, university: 'АГПУ' },
    { projectTitle: 'Помощник пожилых: платформа социальной помощи', teamName: 'Анна Смирнова, Дарья Козлова', description: 'Цифровая платформа для волонтёрской помощи пожилым людям', year: 2025, place: 1, nominationId: nominationIds[2], photoUrl: 'https://picsum.photos/seed/w5/600/400', university: 'СочиГУ' },
    { projectTitle: 'AI-ассистент для абитуриентов СочиГУ', teamName: 'Команда «ТechStart»', description: 'Чат-бот на основе LLM для ответов на вопросы абитуриентов', year: 2024, place: 1, nominationId: nominationIds[0], photoUrl: 'https://picsum.photos/seed/w6/600/400', university: 'СочиГУ' },
    { projectTitle: 'Биоразлагаемая упаковка из морских водорослей', teamName: 'Команда «АльгоПак»', description: null, year: 2024, place: 1, nominationId: nominationIds[1], photoUrl: 'https://picsum.photos/seed/w7/600/400', university: 'КубГТУ' },
    { projectTitle: 'EdTech-платформа для репетиторов Краснодарского края', teamName: 'Максим Орлов', description: null, year: 2024, place: 1, nominationId: nominationIds[4], photoUrl: null, university: 'КубГУ' },
    { projectTitle: 'LocalFood: маркетплейс фермерских продуктов', teamName: 'Команда «ФермаМаркет»', description: 'Платформа прямых продаж от местных производителей', year: 2024, place: 1, nominationId: nominationIds[3], photoUrl: 'https://picsum.photos/seed/w9/600/400', university: 'СочиГУ' },
  ];

  for (const w of winners) {
    await client.query(
      `INSERT INTO winners (id, "projectTitle", "teamName", description, year, place, "nominationId", "photoUrl", university, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [w.projectTitle, w.teamName, w.description, w.year, w.place, w.nominationId, w.photoUrl, w.university],
    );
    console.log(`  ✓ Winner [${w.year} #${w.place}]: ${w.projectTitle}`);
  }

  console.log(`\n✅ Done: ${news.length} news, ${nominations.length} nominations, ${documents.length} documents, ${winners.length} winners`);
  await client.end();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
