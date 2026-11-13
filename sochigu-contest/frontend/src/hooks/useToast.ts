import { useContext } from 'react';
import { ToastContext } from '@/components/shared/Toast';

export function useToast() {
  return useContext(ToastContext);
}
