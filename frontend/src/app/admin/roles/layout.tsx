import { AppShell } from '@/components/layout/app-shell';
import { RequireAccess } from '@/components/auth/require-access';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <RequireAccess access="rolesWrite">{children}</RequireAccess>
    </AppShell>
  );
}
