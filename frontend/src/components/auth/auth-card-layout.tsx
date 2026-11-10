import { ShieldCheck } from 'lucide-react';

/**
 * Mise en page des écrans d'accès hors session (mot de passe oublié, réinitialisation) :
 * même structure que l'écran de première connexion, panneau d'aide à gauche sur grand écran.
 */
export function AuthCardLayout({
  asideTitle,
  asideText,
  asideItems,
  children,
}: {
  asideTitle: string;
  asideText: string;
  asideItems?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-1.5 bg-[#2563eb] shrink-0" />

      <div className="hidden lg:flex w-[48%] shrink-0 flex-col bg-[#eef5ff] relative overflow-hidden border-r border-[#2563eb]/10 items-center justify-center px-12">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#2563eb]/10 pointer-events-none" aria-hidden="true" />
        <div className="relative flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0b1629] flex items-center justify-center">
            <ShieldCheck size={28} className="text-[#2563eb]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#0b1629] tracking-tight">{asideTitle}</p>
            <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">{asideText}</p>
          </div>
          {asideItems && (
            <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-5 w-full max-w-xs text-left space-y-2.5">
              {asideItems.map(item => (
                <div key={item} className="flex items-center gap-2.5 text-[12px] text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
