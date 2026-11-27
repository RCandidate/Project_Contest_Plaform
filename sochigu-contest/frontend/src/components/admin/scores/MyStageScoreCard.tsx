import { MyScoreForm } from "@/components/admin/scores/MyScoreForm";
import { FinalScoreForm } from "@/components/admin/scores/FinalScoreForm";

interface Props {
  applicationId: string;
  isDraft: boolean;
}

// «Моя оценка очного этапа»: сверху текущая форма (баллы 0–100, качества,
// особое мнение), ниже критерии очного этапа (общие, бизнес, практико-ориентированные).
export function MyStageScoreCard({ applicationId, isDraft }: Props) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Моя оценка очного этапа
      </h2>
      <MyScoreForm applicationId={applicationId} isDraft={isDraft} embedded />
      <div className="border-t border-gray-100" />
      <FinalScoreForm applicationId={applicationId} embedded />
    </section>
  );
}
