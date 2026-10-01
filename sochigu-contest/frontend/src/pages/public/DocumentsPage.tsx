import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { documentsApi } from '@/api/documents';
import { Document } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { formatFileSize } from '@/utils/formatFileSize';
import { fadeUp, fadeUpView, stagger, staggerView, cardItem } from '@/utils/animations';

import mascot from '../../../mascot-documents.png';

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') {
    return (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#FEE2E2" />
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="700" fill="#DC2626" fontFamily="sans-serif">PDF</text>
      </svg>
    );
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#DBEAFE" />
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1D4ED8" fontFamily="sans-serif">DOC</text>
      </svg>
    );
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
    return (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#FEF3C7" />
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="700" fill="#D97706" fontFamily="sans-serif">ZIP</text>
      </svg>
    );
  }
  return (
    <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#F3F4F6" />
      <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6B7280" fontFamily="sans-serif">FILE</text>
    </svg>
  );
}

function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-md bg-gray-200 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="hidden sm:block h-3 bg-gray-100 rounded w-16 flex-shrink-0" />
      <div className="hidden md:block h-3 bg-gray-100 rounded w-14 flex-shrink-0" />
      <div className="w-20 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
    </div>
  );
}

function DocumentRow({ doc }: { doc: Document }) {
  return (
    <motion.div
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg group"
      variants={cardItem}
    >
      <FileIcon mimeType={doc.mimeType} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{doc.title}</p>
        {doc.category && <p className="text-sm text-gray-500 truncate">{doc.category}</p>}
      </div>
      <time className="hidden sm:block text-sm text-gray-400 flex-shrink-0 whitespace-nowrap">
        {formatDate(doc.updatedAt)}
      </time>
      <span className="hidden md:block text-sm text-gray-400 flex-shrink-0 w-16 text-right">
        {formatFileSize(doc.size)}
      </span>
      <a
        href={`/api/documents/${doc.id}/download`}
        download
        className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-primary-700 text-primary-700 text-sm font-medium hover:bg-primary-700 hover:text-white transition-colors"
      >
        Скачать
      </a>
    </motion.div>
  );
}

function groupByCategory(docs: Document[]): Map<string, Document[]> {
  const map = new Map<string, Document[]>();
  for (const doc of docs) {
    const key = doc.category || 'Общее';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(doc);
  }
  return map;
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { document.title = 'Документы — Конкурс СочиГУ'; }, []);

  function loadDocuments() {
    setLoading(true);
    setError(false);
    documentsApi.getAll()
      .then(setDocuments)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadDocuments(); }, []);

  const grouped = groupByCategory(documents);
  const hasMultipleCategories = grouped.size > 1;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl py-10">
        <motion.h1
          className="text-3xl font-bold text-primary-900 mb-8"
          initial="hidden" animate="show" variants={fadeUp}
        >
          Документы конкурса
        </motion.h1>

        {error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Не удалось загрузить документы. Попробуйте позже.</p>
            <button
              onClick={loadDocuments}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Повторить
            </button>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => <DocumentRowSkeleton key={i} />)}
          </div>
        ) : documents.length === 0 ? (
          <p className="text-gray-500 text-center py-20">Документов пока нет.</p>
        ) : hasMultipleCategories ? (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([category, docs]) => (
              <motion.section
                key={category}
                initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
              >
                <h2 className="text-lg font-semibold text-gray-700 mb-3 px-1">{category}</h2>
                <motion.div
                  className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100"
                  variants={staggerView}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
                >
                  {docs.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}
                </motion.div>
              </motion.section>
            ))}
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100"
            variants={stagger}
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          >
            {documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}
          </motion.div>
        )}
      </div>
    </main>
  );
}
