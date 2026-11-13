import { Spinner } from '@/components/ui/Spinner';

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <Spinner size="lg" />
    </div>
  );
}
