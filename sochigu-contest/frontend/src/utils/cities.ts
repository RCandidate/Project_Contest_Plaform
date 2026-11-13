import type { AnalyticsGeography } from "@/types";

// [English (канон), Русское название, ...доп. варианты]
const CITIES: string[][] = [
  ["Moscow", "Москва", "Moskva", "Мск"],
  [
    "Saint Petersburg",
    "Санкт-Петербург",
    "St. Petersburg",
    "Sankt-Peterburg",
    "СПб",
    "Питер",
    "Петербург",
    "Leningrad",
  ],
  ["Novosibirsk", "Новосибирск"],
  ["Yekaterinburg", "Екатеринбург", "Ekaterinburg", "Yekaterinburg"],
  ["Kazan", "Казань"],
  ["Nizhny Novgorod", "Нижний Новгород", "Nizhniy Novgorod", "Н. Новгород"],
  ["Chelyabinsk", "Челябинск"],
  ["Krasnoyarsk", "Красноярск"],
  ["Samara", "Самара"],
  ["Ufa", "Уфа"],
  ["Rostov-on-Don", "Ростов-на-Дону", "Rostov", "Ростов", "Rostov na Donu"],
  ["Omsk", "Омск"],
  ["Krasnodar", "Краснодар"],
  ["Voronezh", "Воронеж"],
  ["Perm", "Пермь"],
  ["Volgograd", "Волгоград"],
  ["Saratov", "Саратов"],
  ["Tyumen", "Тюмень"],
  ["Tolyatti", "Тольятти", "Togliatti"],
  ["Izhevsk", "Ижевск"],
  ["Barnaul", "Барнаул"],
  ["Ulyanovsk", "Ульяновск"],
  ["Irkutsk", "Иркутск"],
  ["Khabarovsk", "Хабаровск"],
  ["Yaroslavl", "Ярославль"],
  ["Vladivostok", "Владивосток"],
  ["Makhachkala", "Махачкала"],
  ["Tomsk", "Томск"],
  ["Orenburg", "Оренбург"],
  ["Kemerovo", "Кемерово"],
  ["Novokuznetsk", "Новокузнецк"],
  ["Ryazan", "Рязань"],
  ["Naberezhnye Chelny", "Набережные Челны", "Naberezhnyye Chelny"],
  ["Astrakhan", "Астрахань"],
  ["Penza", "Пенза"],
  ["Lipetsk", "Липецк"],
  ["Kirov", "Киров"],
  ["Cheboksary", "Чебоксары"],
  ["Tula", "Тула"],
  ["Kaliningrad", "Калининград"],
  ["Kursk", "Курск"],
  ["Stavropol", "Ставрополь"],
  ["Sochi", "Сочи"],
  ["Ulan-Ude", "Улан-Удэ"],
  ["Tver", "Тверь"],
  ["Magnitogorsk", "Магнитогорск"],
  ["Ivanovo", "Иваново"],
  ["Bryansk", "Брянск"],
  ["Belgorod", "Белгород"],
  ["Surgut", "Сургут"],
  ["Vladimir", "Владимир"],
  ["Nizhny Tagil", "Нижний Тагил", "Nizhniy Tagil"],
  ["Arkhangelsk", "Архангельск", "Archangel"],
  ["Chita", "Чита"],
  ["Kaluga", "Калуга"],
  ["Smolensk", "Смоленск"],
  ["Volzhsky", "Волжский", "Volzhskiy"],
  ["Cherepovets", "Череповец"],
  ["Vladikavkaz", "Владикавказ"],
  ["Murmansk", "Мурманск"],
  ["Sevastopol", "Севастополь"],
  ["Simferopol", "Симферополь"],
  ["Yakutsk", "Якутск"],
  ["Saransk", "Саранск"],
  ["Grozny", "Грозный"],
  ["Kurgan", "Курган"],
  ["Oryol", "Орёл", "Orel", "Oryol"],
  ["Podolsk", "Подольск"],
  ["Vologda", "Вологда"],
  ["Tambov", "Тамбов"],
  ["Petrozavodsk", "Петрозаводск"],
  ["Nizhnevartovsk", "Нижневартовск"],
  ["Kostroma", "Кострома"],
  ["Syktyvkar", "Сыктывкар"],
  ["Novorossiysk", "Новороссийск", "Novorossiisk"],
  ["Yoshkar-Ola", "Йошкар-Ола"],
  ["Taganrog", "Таганрог"],
  ["Komsomolsk-on-Amur", "Комсомольск-на-Амуре", "Komsomolsk na Amure"],
  ["Nalchik", "Нальчик"],
  ["Shakhty", "Шахты"],
  ["Dzerzhinsk", "Дзержинск"],
  ["Bratsk", "Братск"],
  ["Orsk", "Орск"],
  ["Angarsk", "Ангарск"],
  ["Engels", "Энгельс"],
  ["Blagoveshchensk", "Благовещенск"],
  ["Veliky Novgorod", "Великий Новгород", "Novgorod", "Новгород"],
  ["Stary Oskol", "Старый Оскол"],
  ["Korolyov", "Королёв", "Korolev"],
  ["Pskov", "Псков"],
  ["Biysk", "Бийск"],
  ["Prokopyevsk", "Прокопьевск"],
  ["Balakovo", "Балаково"],
  ["Rybinsk", "Рыбинск"],
  ["Armavir", "Армавир"],
  ["Lyubertsy", "Люберцы"],
  ["Mytishchi", "Мытищи"],
  ["Khimki", "Химки"],
  ["Balashikha", "Балашиха"],
  ["Yuzhno-Sakhalinsk", "Южно-Сахалинск"],
  ["Petropavlovsk-Kamchatsky", "Петропавловск-Камчатский"],
  ["Abakan", "Абакан"],
  ["Norilsk", "Норильск"],
  ["Severodvinsk", "Северодвинск"],
  ["Nakhodka", "Находка"],
  ["Ussuriysk", "Уссурийск"],
  ["Elista", "Элиста"],
  ["Cherkessk", "Черкесск"],
  ["Maykop", "Майкоп"],
  ["Magadan", "Магадан"],
  ["Gorno-Altaysk", "Горно-Алтайск"],
  ["Kyzyl", "Кызыл"],
  ["Salekhard", "Салехард"],
  ["Khanty-Mansiysk", "Ханты-Мансийск"],
  ["Naryan-Mar", "Нарьян-Мар"],
  ["Anadyr", "Анадырь"],
  ["Magas", "Магас"],
  ["Nazran", "Назрань"],
  ["Derbent", "Дербент"],
  ["Kislovodsk", "Кисловодск"],
  ["Pyatigorsk", "Пятигорск"],
  ["Essentuki", "Ессентуки"],
  ["Zheleznovodsk", "Железноводск"],
  ["Anapa", "Анапа"],
  ["Gelendzhik", "Геленджик"],
  ["Yalta", "Ялта"],
  ["Kerch", "Керчь"],
  ["Evpatoria", "Евпатория"],
  ["Feodosia", "Феодосия"],
  ["Zelenograd", "Зеленоград"],
  ["Odintsovo", "Одинцово"],
  ["Krasnogorsk", "Красногорск"],
  ["Domodedovo", "Домодедово"],
  ["Shchyolkovo", "Щёлково", "Schelkovo"],
  ["Sergiev Posad", "Сергиев Посад"],
  ["Kolomna", "Коломна"],
  ["Elektrostal", "Электросталь"],
  ["Zhukovsky", "Жуковский"],
  ["Dubna", "Дубна"],
  ["Obninsk", "Обнинск"],
  ["Pushkino", "Пушкино"],
  ["Vidnoye", "Видное"],
  ["Noginsk", "Ногинск"],
  ["Serpukhov", "Серпухов"],
  ["Ramenskoye", "Раменское"],
  ["Reutov", "Реутов"],
  ["Dmitrov", "Дмитров"],
  ["Kaspiysk", "Каспийск"],
  ["Khasavyurt", "Хасавюрт"],
  ["Novocherkassk", "Новочеркасск"],
  ["Volgodonsk", "Волгодонск"],
  ["Kamensk-Uralsky", "Каменск-Уральский"],
  ["Pervouralsk", "Первоуральск"],
  ["Berezniki", "Березники"],
  ["Salavat", "Салават"],
  ["Sterlitamak", "Стерлитамак"],
  ["Neftekamsk", "Нефтекамск"],
  ["Oktyabrsky", "Октябрьский"],
  ["Almetyevsk", "Альметьевск"],
  ["Nizhnekamsk", "Нижнекамск"],
  ["Yelabuga", "Елабуга", "Elabuga"],
  ["Zelenodolsk", "Зеленодольск"],
  ["Novocheboksarsk", "Новочебоксарск"],
  ["Zlatoust", "Златоуст"],
  ["Miass", "Миасс"],
  ["Kopeysk", "Копейск"],
  ["Seversk", "Северск"],
  ["Kineshma", "Кинешма"],
  ["Murom", "Муром"],
  ["Kovrov", "Ковров"],
  ["Gus-Khrustalny", "Гусь-Хрустальный"],
  ["Suzdal", "Суздаль"],
  ["Pereslavl-Zalessky", "Переславль-Залесский"],
  ["Uglich", "Углич"],
  ["Sarov", "Саров"],
  ["Arzamas", "Арзамас"],
  ["Kstovo", "Кстово"],
  ["Vyborg", "Выборг"],
  ["Gatchina", "Гатчина"],
  ["Pushkin", "Пушкин"],
  ["Peterhof", "Петергоф"],
  ["Kronstadt", "Кронштадт"],
  ["Kolpino", "Колпино"],
  ["Tikhvin", "Тихвин"],
  ["Sosnovy Bor", "Сосновый Бор"],
  ["Kirishi", "Кириши"],
  ["Veliky Ustyug", "Великий Устюг"],
  ["Kotlas", "Котлас"],
  ["Ukhta", "Ухта"],
  ["Vorkuta", "Воркута"],
  ["Pechora", "Печора"],
  ["Usinsk", "Усинск"],
  ["Apatity", "Апатиты"],
  ["Kandalaksha", "Кандалакша"],
  ["Monchegorsk", "Мончегорск"],
  ["Severomorsk", "Североморск"],
  ["Kostomuksha", "Костомукша"],
  ["Sortavala", "Сортавала"],
  ["Kondopoga", "Кондопога"],
  ["Novy Urengoy", "Новый Уренгой"],
  ["Noyabrsk", "Ноябрьск"],
  ["Nadym", "Надым"],
  ["Nefteyugansk", "Нефтеюганск"],
  ["Nyagan", "Нягань"],
  ["Kogalym", "Когалым"],
  ["Urai", "Урай"],
  ["Langepas", "Лангепас"],
  ["Megion", "Мегион"],
  ["Neryungri", "Нерюнгри"],
  ["Mirny", "Мирный"],
  ["Ust-Ilimsk", "Усть-Илимск"],
  ["Usolye-Sibirskoye", "Усолье-Сибирское"],
  ["Zheleznogorsk", "Железногорск"],
  ["Divnogorsk", "Дивногорск"],
  ["Achinsk", "Ачинск"],
  ["Kansk", "Канск"],
  ["Minusinsk", "Минусинск"],
  ["Sayanogorsk", "Саяногорск"],
  ["Chernogorsk", "Черногорск"],
  ["Rubtsovsk", "Рубцовск"],
  ["Novoaltaysk", "Новоалтайск"],
  ["Berdsk", "Бердск"],
  ["Leninsk-Kuznetsky", "Ленинск-Кузнецкий"],
  ["Kiselyovsk", "Киселёвск", "Kiselevsk"],
  ["Mezhdurechensk", "Междуреченск"],
  ["Anzhero-Sudzhensk", "Анжеро-Судженск"],
  ["Yurga", "Юрга"],
  ["Tobolsk", "Тобольск"],
  ["Ishim", "Ишим"],
  ["Artyom", "Артём", "Artem"],
  ["Arsenyev", "Арсеньев"],
  ["Spassk-Dalny", "Спасск-Дальний"],
  ["Birobidzhan", "Биробиджан"],
  ["Svobodny", "Свободный"],
  ["Belogorsk", "Белогорск"],
  ["Tynda", "Тында"],
  ["Yelizovo", "Елизово"],
  ["Alexandrov", "Александров", "Aleksandrov"],
];

// ─── Нормализация ключа ──────────────────────────────────────────────────────
// Регистр, ё/е, префиксы «г.»/«город», дефисы, точки, пробелы — всё игнорируется
export function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\(.*?\)/g, " ") // "Москва (МО)" → "москва"
    .replace(/^(г\.?|гор\.?|город|city of|city|g\.)\s+/, "")
    .replace(/[\s\-–—_.,'’`]+/g, " ")
    .trim();
}

// ─── Словарь: ключ → английское каноническое имя ─────────────────────────────
const CITY_MAP = new Map<string, string>();
for (const [en, ...variants] of CITIES) {
  CITY_MAP.set(normalizeKey(en), en);
  for (const v of variants) CITY_MAP.set(normalizeKey(v), en);
}

// ─── Транслитерация для городов, которых нет в словаре ───────────────────────
const TR: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function transliterate(s: string): string {
  const lower = s
    .toLowerCase()
    .replace(/(ый|ой)(?=[\s-]|$)/g, "y") // Новый → Novy
    .replace(/ий(?=[\s-]|$)/g, "iy"); // Великий → Veliky-style: iy
  return [...lower].map((ch) => TR[ch] ?? ch).join("");
}

function titleCase(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

const HAS_CYRILLIC = /[а-яё]/i;

// ─── Публичный API ───────────────────────────────────────────────────────────
export function canonicalCity(raw: string): string {
  const key = normalizeKey(raw);
  const known = CITY_MAP.get(key);
  if (known) return known;

  if (HAS_CYRILLIC.test(raw)) {
    const tr = titleCase(transliterate(normalizeKey(raw)));
    // после транслитерации ещё раз пробуем найти в словаре
    return CITY_MAP.get(normalizeKey(tr)) ?? tr;
  }
  return titleCase(raw);
}

export function mergeGeography(
  list: AnalyticsGeography[],
): AnalyticsGeography[] {
  const acc = new Map<string, AnalyticsGeography>();
  for (const { city, count } of list) {
    if (!city || !city.trim()) continue;
    const canon = canonicalCity(city);
    const key = normalizeKey(canon);
    const prev = acc.get(key);
    if (prev) prev.count += count;
    else acc.set(key, { city: canon, count });
  }
  return [...acc.values()].sort(
    (a, b) => b.count - a.count || a.city.localeCompare(b.city),
  );
}
