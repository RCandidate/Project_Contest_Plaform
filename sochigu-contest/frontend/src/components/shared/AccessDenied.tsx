import { ShieldOff } from 'lucide-react';

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShieldOff size={48} className="mb-4 text-muted-foreground" />
      <h2 className="mb-2 text-xl font-semibold text-foreground">Нет доступа</h2>
      <p className="text-muted-foreground">У вас недостаточно прав для просмотра этого раздела.</p>
    </div>
  );
}
