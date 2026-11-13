import type { CSSProperties } from 'react';

interface PrintReportProps {
  summary: { totalApplications: number; totalUsers: number; totalUniversities: number };
  byNomination: { nomination: string; count: number }[];
  topUniversities: { university: string; count: number }[];
  geography: { city: string; count: number }[];
  keywords: { keyword: string; count: number }[];
  generatedAt: string;
}

const th: CSSProperties = {
  border: '1px solid #d1d5db',
  padding: '6px 10px',
  textAlign: 'left',
  background: '#f3f4f6',
  fontWeight: 600,
  fontSize: 12,
};
const td: CSSProperties = {
  border: '1px solid #d1d5db',
  padding: '6px 10px',
  fontSize: 12,
};
const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 8,
};
const section: CSSProperties = {
  marginTop: 24,
  breakInside: 'avoid',
};
const h2: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
  color: '#1e3a8a',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: 4,
};

export function PrintReport({ summary, byNomination, topUniversities, geography, keywords, generatedAt }: PrintReportProps) {
  return (
    <div className="hidden print:block" style={{ fontFamily: 'Arial, sans-serif', color: '#111827', padding: '16px 24px' }}>

      {/* Шапка */}
      <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.5px' }}>СочиГУ</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Конкурс студенческих проектов СочиГУ</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Дата генерации: {generatedAt}</div>
      </div>

      {/* Раздел 1: Сводная статистика */}
      <div style={section}>
        <div style={h2}>1. Сводная статистика</div>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Метрика</th>
              <th style={{ ...th, width: 120 }}>Значение</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={td}>Всего заявок</td><td style={td}>{summary.totalApplications}</td></tr>
            <tr><td style={td}>Участников</td><td style={td}>{summary.totalUsers}</td></tr>
            <tr><td style={td}>Вузов</td><td style={td}>{summary.totalUniversities}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Раздел 2: По номинациям */}
      <div style={section}>
        <div style={h2}>2. Заявки по номинациям</div>
        {byNomination.length === 0
          ? <p style={{ fontSize: 12, color: '#9ca3af' }}>Нет данных</p>
          : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Номинация</th>
                  <th style={{ ...th, width: 120 }}>Количество</th>
                </tr>
              </thead>
              <tbody>
                {byNomination.map((row, i) => (
                  <tr key={i}>
                    <td style={td}>{row.nomination}</td>
                    <td style={td}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Раздел 3: Топ-10 вузов */}
      <div style={section}>
        <div style={h2}>3. Топ-10 вузов</div>
        {topUniversities.length === 0
          ? <p style={{ fontSize: 12, color: '#9ca3af' }}>Нет данных</p>
          : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Вуз</th>
                  <th style={{ ...th, width: 120 }}>Заявок</th>
                </tr>
              </thead>
              <tbody>
                {topUniversities.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    <td style={td}>{row.university}</td>
                    <td style={td}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Раздел 4: География */}
      <div style={section}>
        <div style={h2}>4. География участников</div>
        {geography.length === 0
          ? <p style={{ fontSize: 12, color: '#9ca3af' }}>Нет данных</p>
          : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Город</th>
                  <th style={{ ...th, width: 120 }}>Участников</th>
                </tr>
              </thead>
              <tbody>
                {geography.map((row, i) => (
                  <tr key={i}>
                    <td style={td}>{row.city}</td>
                    <td style={td}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Раздел 5: Ключевые слова */}
      <div style={section}>
        <div style={h2}>5. Топ-20 ключевых слов</div>
        {keywords.length === 0
          ? <p style={{ fontSize: 12, color: '#9ca3af' }}>Нет данных</p>
          : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Ключевое слово</th>
                  <th style={{ ...th, width: 120 }}>Упоминаний</th>
                </tr>
              </thead>
              <tbody>
                {keywords.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    <td style={td}>{row.keyword}</td>
                    <td style={td}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Подпись */}
      <div style={{ marginTop: 32, paddingTop: 10, borderTop: '1px solid #e5e7eb', fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>
        Отчёт сгенерирован системой конкурса СочиГУ
      </div>
    </div>
  );
}
