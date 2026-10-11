import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(function (t) {
        return (
          <div 
            key={t.id} 
            className={`p-4 rounded-md border shadow-lg pointer-events-auto transition-all duration-300 animate-in slide-in-from-right-full ${
              t.variant === 'destructive' 
                ? 'bg-destructive text-destructive-foreground border-destructive' 
                : 'bg-card text-card-foreground border-border'
            }`}
          >
            {t.title && <h3 className="font-bold text-sm">{t.title}</h3>}
            {t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}
          </div>
        );
      })}
    </div>
  );
}