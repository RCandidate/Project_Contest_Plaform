import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { bankApi } from "@/api/bank";
import { nominationsApi } from "@/api/nominations";
import { contestsApi } from "@/api/contests";
import { useAuthStore } from "@/store/auth.store";
import {
  BankProject,
  BankTopic,
  BankTopicStatus,
  Nomination,
  Contest,
  BANK_TOPIC_STATUS_LABELS,
  BANK_TOPIC_STATUS_COLORS,
} from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import {
  ProjectCard,
  ProjectCardSkeleton,
} from "@/components/bank/ProjectCard";
import { TopicFormModal } from "@/components/bank/TopicFormModal";
import { TopicModerationPanel } from "@/components/bank/TopicModerationPanel";
import { NewOffersNotice } from "@/components/bank/NewOffersNotice";
import { formatDate } from "@/utils/formatDate";
import { fadeUp, stagger, cardItem, hoverCardSm } from "@/utils/animations";

const LIMIT = 12;
const GRID_CLASSES = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6";
const SELECT_CLASSES =
  "select-custom pl-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500";

type Tab = "projects" | "topics";

interface TopicBadgeData {
  label: string;
  classes: string;
}

const PUBLIC_TOPIC_BADGES: Partial<Record<BankTopicStatus, TopicBadgeData>> = {
  published: { label: "Свободна", classes: "bg-green-100 text-green-800" },
  taken: { label: "Занята", classes: "bg-gray-200 text-gray-700" },
};

// Сотрудники видят статус модерации, остальные — «Свободна / Занята»
function topicBadge(topic: BankTopic, isStaff: boolean): TopicBadgeData | null {
  if (!topic.status) return null;
  if (isStaff) {
    return {
      label: BANK_TOPIC_STATUS_LABELS[topic.status],
      classes: BANK_TOPIC_STATUS_COLORS[topic.status],
    };
  }
  return PUBLIC_TOPIC_BADGES[topic.status] ?? null;
}

function TopicBadge({ badge }: { badge: TopicBadgeData | null }) {
  if (!badge) return null;
  return (
    <span
      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badge.classes}`}
    >
      {badge.label}
    </span>
  );
}

function TopicCard({
  topic,
  badge,
  onOpen,
}: {
  topic: BankTopic;
  badge: TopicBadgeData | null;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col text-left hover:shadow-md transition-shadow relative"
      variants={cardItem}
      {...hoverCardSm}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs text-accent-600 font-medium">
          {topic.organization}
        </p>
        <TopicBadge badge={badge} />
      </div>
      <h2 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
        {topic.title}
      </h2>
      <p className="text-sm text-gray-600 line-clamp-4 mb-3">
        {topic.description}
      </p>
      <p className="mt-auto pt-2 text-xs text-gray-400">
        {formatDate(topic.createdAt)}
      </p>
    </motion.button>
  );
}

export function BankPage() {
  const user = useAuthStore((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "topics" ? "topics" : "projects";

  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [nominationId, setNominationId] = useState("");
  const [contestId, setContestId] = useState("");

  const [projects, setProjects] = useState<BankProject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [topics, setTopics] = useState<BankTopic[] | null>(null);
  const [topicsError, setTopicsError] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<BankTopic | null>(null);
  const [topicFormOpen, setTopicFormOpen] = useState(false);
  const [topicStatus, setTopicStatus] = useState<"" | BankTopicStatus>("");

  const role = user?.role;
 const isStaff = role === "admin" || role === "moderator";
 const canPropose = role === "employer" || isStaff;
 const hasFilters = Boolean(
   searchInput || nominationId || contestId || topicStatus,
 );

  useEffect(() => {
    document.title = "Банк работ — Конкурс СочиГУ";
    Promise.all([nominationsApi.getAll(), contestsApi.getAll()])
      .then(([noms, ctsts]) => {
        setNominations(noms);
        setContests(ctsts);
      })
      .catch(() => {
        /* фильтры необязательны: витрина работает и без них */
      });
  }, []);

  // Дебаунс поиска
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Проекты: первая страница при смене фильтров
  useEffect(() => {
    if (tab !== "projects") return;
    let cancelled = false;
    setLoading(true);
    bankApi
      .getProjects({
        search: search || undefined,
        nominationId: nominationId || undefined,
        contestId: contestId || undefined,
        page: 1,
        limit: LIMIT,
      })
      .then((res) => {
        if (cancelled) return;
        setProjects(res.data);
        setTotal(res.total);
        setPage(1);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, search, nominationId, contestId, retryKey]);

  // Темы: грузим при первом открытии вкладки
  useEffect(() => {
    if (tab !== "topics" || topics !== null) return;
    let cancelled = false;
    (isStaff ? bankApi.getAdminTopics() : bankApi.getTopics())
      .then((data) => {
        if (!cancelled) {
          setTopics(data);
          setTopicsError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTopicsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, topics, retryKey, isStaff]);

  // После входа или выхода список тем нужно загрузить заново
  useEffect(() => {
    setTopics(null);
  }, [isStaff]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await bankApi.getProjects({
        search: search || undefined,
        nominationId: nominationId || undefined,
        contestId: contestId || undefined,
        page: page + 1,
        limit: LIMIT,
      });
      setProjects((prev) => [...prev, ...res.data]);
      setTotal(res.total);
      setPage(page + 1);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setNominationId("");
    setContestId('');
    setTopicStatus('');
  };

  const switchTab = (t: Tab) =>
    setSearchParams(t === "topics" ? { tab: "topics" } : {}, { replace: true });

  const handleTopicUpdated = (updated: BankTopic) => {
    setTopics(
      (prev) =>
        prev &&
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
    );
    setSelectedTopic((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  const needle = search.toLowerCase();
  const visibleTopics = (topics ?? []).filter(
    (t) =>
      (!topicStatus || t.status === topicStatus) &&
      (!needle ||
        t.title.toLowerCase().includes(needle) ||
        t.organization.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle)),
  );

  const retry = () => {
    setError(false);
    setTopicsError(false);
    setRetryKey((k) => k + 1);
  };

  const errorBlock = (text: string) => (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4">{text}</p>
      <button
        onClick={retry}
        className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Повторить
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl py-10">
        <motion.h1
          className="text-3xl font-bold text-primary-900 mb-2"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          Банк работ
        </motion.h1>
        <motion.p
          className="text-gray-500 mb-8"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          Проекты конкурса, открытые для сотрудничества, и темы от
          работодателей.
        </motion.p>

        {role === "participant" && <NewOffersNotice />}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div
            role="tablist"
            className="inline-flex rounded-lg border border-gray-200 bg-white p-1"
          >
            {(
              [
                ["projects", "Проекты"],
                ["topics", "Темы"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => switchTab(key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === key
                    ? "bg-primary-700 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "topics" && canPropose && (
            <button
              onClick={() => setTopicFormOpen(true)}
              className="flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 transition-colors"
            >
              <Plus size={16} aria-hidden />
              Предложить тему
            </button>
          )}
        </motion.div>

        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              tab === "projects"
                ? "Поиск по названию и описанию"
                : "Поиск по темам"
            }
            aria-label="Поиск"
            className="w-full sm:w-72 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {tab === "projects" && contests.length > 0 && (
            <select
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              className={SELECT_CLASSES}
              aria-label="Конкурс"
            >
              <option value="">Все конкурсы</option>
              {contests.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {tab === "projects" && (
            <select
              value={nominationId}
              onChange={(e) => setNominationId(e.target.value)}
              className={SELECT_CLASSES}
              aria-label="Номинация"
            >
              <option value="">Все номинации</option>
              {nominations.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          )}
          {tab === "topics" && isStaff && (
            <select
              value={topicStatus}
              onChange={(e) =>
                setTopicStatus(e.target.value as "" | BankTopicStatus)
              }
              className={SELECT_CLASSES}
              aria-label="Статус темы"
            >
              <option value="">Все статусы</option>
              {(Object.keys(BANK_TOPIC_STATUS_LABELS) as BankTopicStatus[]).map(
                (st) => (
                  <option key={st} value={st}>
                    {BANK_TOPIC_STATUS_LABELS[st]}
                  </option>
                ),
              )}
            </select>
          )}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>

        {tab === "projects" ? (
          error ? (
            errorBlock("Не удалось загрузить проекты. Попробуйте позже.")
          ) : loading ? (
            <div className={GRID_CLASSES}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-center py-20">
              {hasFilters
                ? "По вашему запросу ничего не найдено."
                : "Пока нет проектов."}
            </p>
          ) : (
            <>
              <motion.div
                key={`${search}-${nominationId}-${contestId}`}
                className={GRID_CLASSES}
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </motion.div>
              {projects.length < total && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-60"
                  >
                    {loadingMore && <Spinner size="sm" />}
                    Показать ещё
                  </button>
                </div>
              )}
            </>
          )
        ) : topicsError ? (
          errorBlock("Не удалось загрузить темы. Попробуйте позже.")
        ) : topics === null ? (
          <div className={GRID_CLASSES}>
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleTopics.length === 0 ? (
          <p className="text-gray-500 text-center py-20">
            {needle ? "По вашему запросу ничего не найдено." : "Пока нет тем."}
          </p>
        ) : (
          <motion.div
            key={needle}
            className={GRID_CLASSES}
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {visibleTopics.map((t) => (
              <TopicCard
                key={t.id}
                topic={t}
                badge={topicBadge(t, isStaff)}
                onOpen={() => setSelectedTopic(t)}
              />
            ))}
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={selectedTopic !== null}
        onClose={() => setSelectedTopic(null)}
        title={selectedTopic?.title ?? ""}
      >
        {selectedTopic && (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-accent-600 font-medium">
                {selectedTopic.organization}
              </p>
              <TopicBadge badge={topicBadge(selectedTopic, isStaff)} />
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line break-words">
              {selectedTopic.description}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(selectedTopic.createdAt)}
            </p>

            {isStaff && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm text-gray-600 space-y-1 break-words">
                {selectedTopic.author && (
                  <p>
                    Автор: {selectedTopic.author.lastName}{" "}
                    {selectedTopic.author.firstName} (
                    {selectedTopic.author.email})
                  </p>
                )}
                <p>
                  Контакты:{" "}
                  {[selectedTopic.contactEmail, selectedTopic.contactPhone]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            )}
            {isStaff && (
              <TopicModerationPanel
                topic={selectedTopic}
                onUpdated={handleTopicUpdated}
              />
            )}

            <p className="text-sm text-gray-500 border-t border-gray-100 pt-3">
              Хотите взяться за эту тему? Напишите организаторам на странице{" "}
              <Link
                to="/contacts"
                className="text-primary-700 underline hover:no-underline"
              >
                «Контакты»
              </Link>
              .
            </p>
          </div>
        )}
      </Modal>

      <TopicFormModal
        isOpen={topicFormOpen}
        onClose={() => setTopicFormOpen(false)}
        publishedImmediately={role !== "employer"}
        onCreated={() => setTopics(null)}
      />
    </main>
  );
}
