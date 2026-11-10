import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-5">
        <div>
          <h3 className="mb-3 text-lg font-bold">
            <span className="text-accent">СочиГУ</span> | Конкурс проектов
          </h3>
          <p className="text-base text-primary-foreground/70">
            Конкурс студенческих проектов Сочинского государственного
            университета
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Навигация</h4>
          <ul className="space-y-2 text-base text-primary-foreground/70">
            <li>
              <Link to="/" className="hover:text-primary-foreground">
                Главная
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary-foreground">
                О конкурсе
              </Link>
            </li>
            <li>
              <Link to="/nominations" className="hover:text-primary-foreground">
                Номинации
              </Link>
            </li>
            <li>
              <Link to="/news" className="hover:text-primary-foreground">
                Новости
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Участникам</h4>
          <ul className="space-y-2 text-base text-primary-foreground/70">
            <li>
              <Link to="/documents" className="hover:text-primary-foreground">
                Документы
              </Link>
            </li>
            <li>
              <Link to="/winners" className="hover:text-primary-foreground">
                Победители
              </Link>
            </li>
            <li>
              <Link to="/bank" className="hover:text-primary-foreground">
                Банк работ
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary-foreground">
                Регистрация
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-primary-foreground">
                Войти
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Партнёры</h4>
          <ul className="space-y-2 text-base text-primary-foreground/70">
            <li>
              <a
                href="https://nti2035.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-foreground"
              >
                НТИ 2035
              </a>
            </li>
            <li>
              <a
                href="https://rmpvo.ru/feedback/events/for_students.php"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-foreground"
              >
                РМПВО
              </a>
            </li>
            <li>
              <a
                href="https://www.fasie.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-foreground"
              >
                ФАСИЕ
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Контакты</h4>
          <ul className="space-y-2 text-base text-primary-foreground/70">
            <li>Стартап-студия СочиГУ</li>
            <li>г. Сочи, ул. Пластунская, 94</li>
            <li>startup@sutr.ru</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-mid">
        <div className="container mx-auto px-4 py-4 text-center text-base text-primary-foreground/50">
          © {new Date().getFullYear()} СочиГУ. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
