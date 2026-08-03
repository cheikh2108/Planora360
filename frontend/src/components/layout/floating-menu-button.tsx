'use client';

import { useMobileMenu } from './mobile-menu-context';
import { LayoutGrid, X } from 'lucide-react';

export function FloatingMenuButton() {
  const { open, toggle } = useMobileMenu();

  return (
    <button
      onClick={toggle}
      aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
      className="lg:hidden fixed bottom-6 right-5 z-[60] w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-90 hover:scale-105"
      style={{
        background: 'radial-gradient(circle at 35% 30%, #1e3560, #0a1628)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div
        className="transition-all duration-200"
        style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
      >
        {open
          ? <X size={22} className="text-white" strokeWidth={2.5} />
          : <LayoutGrid size={20} className="text-white" strokeWidth={2} />
        }
      </div>
    </button>
  );
}
