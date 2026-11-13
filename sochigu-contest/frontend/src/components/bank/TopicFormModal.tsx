import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { bankApi } from "@/api/bank";
import { getApiErrorMessage } from "@/utils/apiError";

type TopicFormFields = {
  title: string;
  description: string;
  organization: string;
  contactEmail: string;
  contactPhone: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // true — тему публикует сотрудник сразу, false — уходит на модерацию
  publishedImmediately: boolean;
  onCreated: () => void;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none";

export function TopicFormModal({
  isOpen,
  onClose,
  publishedImmediately,
  onCreated,
}: Props) {
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TopicFormFields>({ mode: "onBlur" });

  const close = () => {
    setError(null);
    onClose();
  };

  const onSubmit = async (data: TopicFormFields) => {
    setError(null);
    try {
      await bankApi.createTopic({
        title: data.title.trim(),
        description: data.description.trim(),
        organization: data.organization.trim(),
        contactEmail: data.contactEmail.trim() || undefined,
        contactPhone: data.contactPhone.trim() || undefined,
      });
      showToast(
        publishedImmediately
          ? "Тема опубликована"
          : "Тема отправлена на модерацию",
        "success",
      );
      reset();
      onCreated();
      close();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Не удалось отправить тему. Попробуйте позже."),
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Предложить тему">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <label
            htmlFor="topic-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Название
          </label>
          <input
            id="topic-title"
            className={inputClass}
            {...register("title", {
              required: "Укажите название темы",
              validate: (v) => v.trim().length > 0 || "Укажите название темы",
              maxLength: { value: 200, message: "Не длиннее 200 символов" },
            })}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="topic-org"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Организация
          </label>
          <input
            id="topic-org"
            className={inputClass}
            {...register("organization", {
              required: "Укажите организацию",
              validate: (v) => v.trim().length > 0 || "Укажите организацию",
              maxLength: { value: 255, message: "Не длиннее 255 символов" },
            })}
          />
          {errors.organization && (
            <p className="text-red-500 text-xs mt-1">
              {errors.organization.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="topic-desc"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Описание
          </label>
          <textarea
            id="topic-desc"
            rows={6}
            className={inputClass}
            placeholder="В чём задача, какой результат ожидается, какие требования к исполнителям"
            {...register("description", {
              required: "Укажите описание темы",
              validate: (v) => v.trim().length > 0 || "Укажите описание темы",
              maxLength: { value: 5000, message: "Не длиннее 5000 символов" },
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="topic-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email{" "}
              <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <input
              id="topic-email"
              type="email"
              className={inputClass}
              {...register("contactEmail", {
                pattern: {
                  value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Некорректный email",
                },
              })}
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactEmail.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="topic-phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Телефон{" "}
              <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <input
              id="topic-phone"
              type="tel"
              className={inputClass}
              {...register("contactPhone", {
                maxLength: { value: 50, message: "Не длиннее 50 символов" },
              })}
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactPhone.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Контакты не показываются публично.
          {!publishedImmediately && " Тема появится в банке после проверки."}
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-60"
          >
            {isSubmitting && <Spinner size="sm" />}
            Отправить
          </button>
        </div>
      </form>
    </Modal>
  );
}
