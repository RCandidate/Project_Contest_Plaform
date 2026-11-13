import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { bankApi } from "@/api/bank";
import {
  BankOffer,
  BankTopic,
  BANK_OFFER_STATUS_LABELS,
  BANK_OFFER_STATUS_COLORS,
  BANK_TOPIC_STATUS_LABELS,
  BANK_TOPIC_STATUS_COLORS,
} from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/utils/formatDate";
import { fadeUp } from "@/utils/animations";

const CTA_CLASSES =
  "inline-block px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors";

export function MyOffersPage() {
  const [offers, setOffers] = useState<BankOffer[] | null>(null);
  const [topics, setTopics] = useState<BankTopic[] | null>(null);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    document.title = "Мои предложения — Банк работ";
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    Promise.all([bankApi.getMyOffers(), bankApi.getMyTopics()])
      .then(([o, t]) => {
        if (!cancelled) {
          setOffers(o);
          setTopics(t);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl py-10">
        <motion.h1
          className="text-3xl font-bold text-primary-900 mb-8"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          Мои предложения
        </motion.h1>

        {error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">
              Не удалось загрузить данные. Попробуйте позже.
            </p>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Повторить
            </button>
          </div>
        ) : offers === null || topics === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              {offers.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-14 text-center">
                  <p className="text-gray-500 mb-4">
                    Вы ещё не оставляли предложений.
                  </p>
                  <Link to="/bank" className={CTA_CLASSES}>
                    Перейти в банк
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {offers.map((o) => (
                    <li key={o.id}>
                      <Link
                        to={`/bank/projects/${o.applicationId}`}
                        className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <h2 className="font-semibold text-gray-900 break-words min-w-0">
                            {o.application?.projectTitle ?? "Проект"}
                          </h2>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${BANK_OFFER_STATUS_COLORS[o.status]}`}
                          >
                            {BANK_OFFER_STATUS_LABELS[o.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2 break-words">
                          {o.message}
                        </p>
                        {o.status === "accepted" && (
                          <p className="text-sm text-green-700 mb-2">
                            Авторы приняли предложение и видят ваши контакты.
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatDate(o.createdAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary-900 mb-4">
                Мои темы
              </h2>
              {topics.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-10 text-center">
                  <p className="text-gray-500 mb-4">
                    Вы ещё не предлагали тем.
                  </p>
                  <Link to="/bank?tab=topics" className={CTA_CLASSES}>
                    Предложить тему
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {topics.map((t) => (
                    <li
                      key={t.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-semibold text-gray-900 break-words min-w-0">
                          {t.title}
                        </h3>
                        {t.status && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${BANK_TOPIC_STATUS_COLORS[t.status]}`}
                          >
                            {BANK_TOPIC_STATUS_LABELS[t.status]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-accent-600 font-medium mb-1">
                        {t.organization}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(t.createdAt)}
                      </p>
                      {t.moderationComment && (
                        <p className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-600 break-words">
                          Комментарий модератора: {t.moderationComment}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
