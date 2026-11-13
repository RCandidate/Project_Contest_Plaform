import clsx from 'clsx';
import { ApplicationStatus, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/types';

interface Props {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        APPLICATION_STATUS_COLORS[status],
        className,
      )}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
