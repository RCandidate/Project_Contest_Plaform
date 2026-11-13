import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import { ChevronRight, Users } from "lucide-react";
import { bankApi } from "@/api/bank";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import {
  BankProject,
  BankOffer,
  BankOfferStatus,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { OfferForm } from "@/components/bank/OfferForm";
import { OffersList } from "@/components/bank/OffersList";
import { OfferCard } from "@/components/bank/OfferCard";
import { CommentBlock } from "@/components/bank/ComentBlock";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/formatDate";
import { fadeUp } from "@/utils/animations";

type LoadError = "not-found" | "failed" | null;

export function BankProjectPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUiStore((s) => s.openAuthModal);

  const [project, setProject] = useState<BankProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadError>(null);
  const [offers, setOffers] = useState<BankOffer[]>([]);
  const [retryKey, setRetryKey] = useState(0);

  const { showToast } = useToast();
  const isEmployer = user?.role === "employer";
  const isStaff = user?.role === "admin" || user?.role === "moderator";
  const isParticipant = user?.role === "participant";
  const [projectOffers, setProjectOffers] = useState<BankOffer[]>([]);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    bankApi
      .getProject(id)
      .then((data) => {
        if (cancelled) return;
        setProject(data);
        setLoadError(null);
        document.title = `${data.title} — Банк работ`;
      })
      .catch((err) => {
        if (cancelled) return;
        const status = isAxiosError(err) ? err.response?.status : undefined;
        setLoadError(status === 404 || status === 400 ? "not-found" : "failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  // Свои предложения по этому проекту (только работодатель)
  useEffect(() => {
    if (!id || !isEmployer) {
      setOffers([]);
      return;
    }
    let cancelled = false;
    bankApi
      .getMyOffers()
      .then((all) => {
        if (!cancelled) setOffers(all.filter((o) => o.applicationId === id));
      })
      .catch(() => {
        if (!cancelled) setOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEmployer]);

  // Предложения к проекту: сотрудники видят все, участник — к своим проектам
  useEffect(() => {
    if (!id || !(isStaff || isParticipant)) {
      setProjectOffers([]);
      return;
    }
    let cancelled = false;
    const request = isStaff
      ? bankApi.getProjectOffers(id)
      : bankApi
          .getOffersForMe()
          .then((all) => all.filter((o) => o.applicationId === id));
    request
      .then((list) => {
        if (!cancelled) setProjectOffers(list);
      })
      .catch(() => {
        if (!cancelled) setProjectOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isStaff, isParticipant]);

  const changeOfferStatus = async (
    offerId: string,
    status: BankOfferStatus,
  ) => {
    setBusyOfferId(offerId);
    try {
      const updated = await bankApi.updateOfferStatus(offerId, status);
      setProjectOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, ...updated } : o)),
      );
      showToast("Статус предложения обновлён", "success");
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "Не удалось изменить статус предложения"),
        "error",
      );
    } finally {
      setBusyOfferId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl py-10 space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (loadError || !project) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl py-20 text-center">
          <p
            className={`mb-4 ${loadError === "failed" ? "text-red-500" : "text-gray-500"}`}
          >
            {loadError === "failed"
              ? "Не удалось загрузить проект. Попробуйте позже."
              : "Проект не найден или больше недоступен."}
          </p>
          <div className="flex justify-center gap-3">
            {loadError === "failed" && (
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Повторить
              </button>
            )}
            <Link
              to="/bank"
              className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
            >
              В банк работ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl py-10">
        <nav
          aria-label="Хлебные крошки"
          className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 min-w-0"
        >
          <Link to="/bank" className="hover:text-primary-700 shrink-0">
            Банк работ
          </Link>
          <ChevronRight size={14} aria-hidden className="shrink-0" />
          <span className="text-gray-700 truncate">{project.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <motion.article
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8"
              initial="hidden"
              animate="show"
              variants={fadeUp}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${APPLICATION_STATUS_COLORS[project.status]}`}
                >
                  {APPLICATION_STATUS_LABELS[project.status]}
                </span>
                {project.contest && (
                  <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    {project.contest.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 leading-tight mb-2 break-words">
                {project.title}
              </h1>
              {project.nomination && (
                <p className="text-sm text-accent-600 font-medium mb-5">
                  {project.nomination.name}
                </p>
              )}

              <p className="text-gray-700 whitespace-pre-line break-words leading-relaxed mb-6">
                {project.description ?? project.summary}
              </p>

              {project.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.keywords.map((k) => (
                    <span
                      key={k}
                      className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <span className="flex items-center gap-1">
                  <Users size={14} aria-hidden />
                  Команда: {project.teamSize} чел.
                </span>
                <span>Заявка подана {formatDate(project.createdAt)}</span>
              </div>
            </motion.article>

            {(isStaff || (isParticipant && projectOffers.length > 0)) && (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h2 className="font-bold text-gray-900 mb-4">
                  Предложения работодателей
                </h2>
                {projectOffers.length === 0 ? (
                  <p className="text-sm text-gray-500">Предложений пока нет.</p>
                ) : (
                  <ul className="space-y-3">
                    {projectOffers.map((o) => (
                      <li key={o.id}>
                        <OfferCard
                          offer={o}
                          mode={isStaff ? "staff" : "owner"}
                          busy={busyOfferId === o.id}
                          onChangeStatus={changeOfferStatus}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {(isEmployer || isStaff || isParticipant) && (
              <CommentBlock applicationId={project.id} canDelete={isStaff} />
            )}
          </div>

          <aside className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="font-bold text-gray-900 mb-1">
              Предложение авторам
            </h2>

            {isEmployer ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Предложите сотрудничество, стажировку или пилотный проект.
                  Контакты увидят только авторы.
                </p>
                <OfferForm
                  applicationId={project.id}
                  onSent={(offer) => setOffers((prev) => [offer, ...prev])}
                />
                {offers.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Ваши предложения
                    </h3>
                    <OffersList offers={offers} />
                  </div>
                )}
              </>
            ) : user ? (
              <p className="text-sm text-gray-500">
                Оставлять предложения к проектам могут только работодатели.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Войдите как работодатель, чтобы оставить предложение авторам
                  проекта.
                </p>
                <button
                  onClick={() => openAuthModal("login")}
                  className="w-full bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-800 transition-colors"
                >
                  Войти
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
