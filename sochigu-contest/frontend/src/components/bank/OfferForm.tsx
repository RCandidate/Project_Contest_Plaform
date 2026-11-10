import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { bankApi } from "@/api/bank";
import { BankOffer } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";

type OfferFormFields = {
  message: string;
  contactEmail: string;
  contactPhone: string;
};

interface Props {
  applicationId: string;
  onSent: (offer: BankOffer) => void;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none";

export function OfferForm({ applicationId, onSent }: Props) {
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormFields>({ mode: "onBlur" });

  const onSubmit = async (data: OfferFormFields) => {
    setError(null);
    try {
      const offer = await bankApi.createOffer(applicationId, {
        message: data.message.trim(),
        contactEmail: data.contactEmail.trim() || undefined,
        contactPhone: data.contactPhone.trim() || undefined,
      });
      showToast("Предложение отправлено", "success");
      reset();
      onSent(offer);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Не удалось отправить предложение. Попробуйте позже.",
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label
          htmlFor="offer-message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Ваше предложение
        </label>
        <textarea
          id="offer-message"
          rows={5}
          className={inputClass}
          placeholder="Что вы готовы предложить авторам проекта: стажировку, пилот, партнёрство…"
          {...register("message", {
            required: "Напишите текст предложения",
            validate: (v) =>
              v.trim().length > 0 || "Напишите текст предложения",
            maxLength: { value: 3000, message: "Не длиннее 3000 символов" },
          })}
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="offer-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email для связи{" "}
          <span className="text-gray-400 font-normal">(необязательно)</span>
        </label>
        <input
          id="offer-email"
          type="email"
          className={inputClass}
          placeholder="По умолчанию — email вашего аккаунта"
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
          htmlFor="offer-phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Телефон{" "}
          <span className="text-gray-400 font-normal">(необязательно)</span>
        </label>
        <input
          id="offer-phone"
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-60"
      >
        {isSubmitting && <Spinner size="sm" />}
        Отправить предложение
      </button>
    </form>
  );
}
