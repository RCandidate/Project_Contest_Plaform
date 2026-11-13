#!/usr/bin/env node
/**
 * setup.js — первоначальная настройка проекта для нового разработчика.
 * Запуск: node setup.js  или  npm run setup
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const ok = (msg) => console.log(`${GREEN}✓${RESET} ${msg}`);
const warn = (msg) => console.log(`${YELLOW}⚠${RESET}  ${msg}`);
const err = (msg) => console.log(`${RED}✗${RESET} ${msg}`);
const info = (msg) => console.log(`${CYAN}→${RESET} ${msg}`);
const step = (msg) => console.log(`\n${BOLD}${msg}${RESET}`);

let hasErrors = false;

// ─── Проверка Node.js ────────────────────────────────────────────────────────
step('1. Проверка Node.js');
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0], 10);
if (nodeMajor < 18) {
  err(`Node.js ${nodeVersion} — нужна версия 18+. Скачай: https://nodejs.org`);
  hasErrors = true;
} else {
  ok(`Node.js ${nodeVersion}`);
}

// ─── Проверка npm ────────────────────────────────────────────────────────────
try {
  const npmVersion = execSync('npm --version', { stdio: 'pipe' }).toString().trim();
  ok(`npm ${npmVersion}`);
} catch {
  err('npm не найден. Установи Node.js: https://nodejs.org');
  hasErrors = true;
}

// ─── Проверка Docker ─────────────────────────────────────────────────────────
step('2. Проверка Docker');
try {
  const dockerVersion = execSync('docker --version', { stdio: 'pipe' }).toString().trim();
  ok(dockerVersion);
  // Проверяем что Docker daemon запущен
  execSync('docker info', { stdio: 'pipe' });
  ok('Docker daemon запущен');
} catch (e) {
  if (e.message.includes('docker info')) {
    warn('Docker установлен, но daemon не запущен. Запусти Docker Desktop.');
    warn('База данных не запустится без Docker. npm run dev всё равно сработает,');
    warn('но backend упадёт с ошибкой подключения к БД.');
  } else {
    err('Docker не установлен. Скачай Docker Desktop: https://www.docker.com/products/docker-desktop');
    warn('Без Docker БД не запустится. Можно настроить PostgreSQL вручную (см. README).');
  }
}

// ─── .env файл ───────────────────────────────────────────────────────────────
step('3. Настройка окружения');
const envExample = path.join(__dirname, 'backend', '.env.example');
const envFile = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envExample)) {
  warn('.env.example не найден в backend/ — пропускаем');
} else if (fs.existsSync(envFile)) {
  ok('backend/.env уже существует');
} else {
  fs.copyFileSync(envExample, envFile);
  ok('backend/.env создан из .env.example');
  warn('Открой backend/.env и проверь значения JWT_SECRET и JWT_REFRESH_SECRET!');
}

// ─── Установка зависимостей ───────────────────────────────────────────────────
step('4. Установка зависимостей');

function install(label, cwd) {
  info(`Устанавливаю ${label}...`);
  const result = spawnSync('npm', ['install'], {
    cwd: path.join(__dirname, cwd),
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    err(`Ошибка установки ${label}`);
    hasErrors = true;
  } else {
    ok(`${label} — готово`);
  }
}

install('корневые зависимости (concurrently)', '.');
install('backend', 'backend');
install('frontend', 'frontend');

// ─── Итог ────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
if (hasErrors) {
  err(`Некоторые шаги завершились с ошибками. Исправь их выше и запусти setup снова.`);
  process.exit(1);
} else {
  ok(`${BOLD}Установка завершена!${RESET}`);
  console.log(`
${BOLD}Следующие шаги:${RESET}

  ${CYAN}npm run dev${RESET}        — локальная разработка (БД в Docker, backend и frontend нативно)
  ${CYAN}npm run prod${RESET}       — продакшн-запуск (всё в Docker, как на сервере)

  ${CYAN}npm run db:down${RESET}    — остановить БД (dev)
  ${CYAN}npm run prod:down${RESET}  — остановить все контейнеры (prod)
  ${CYAN}npm run prod:logs${RESET}  — посмотреть логи prod-контейнеров

  Приложение будет доступно:
    dev  →  Frontend: http://localhost:5173  |  Backend: http://localhost:3000/api
    prod →  Frontend: http://localhost:5173  |  Backend: http://localhost:3000/api
`);
}
