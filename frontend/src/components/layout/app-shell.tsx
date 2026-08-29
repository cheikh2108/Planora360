'use client';

import { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { MobileMenuProvider, useMobileMenu } from './mobile-menu-context';
import { ToastProvider } from '@/components/ui/toast';

function Shell({ children }: { children: React.ReactNode }) {
  const { open, close } = useMobileMenu();

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) close();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [close]);

  return (
    <div className="flex h-full min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={close} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MobileMenuProvider>
        <Shell>{children}</Shell>
      </MobileMenuProvider>
    </ToastProvider>
  );
}
