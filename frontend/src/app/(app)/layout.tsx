import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

/** Shared header + nav for every page behind login. */
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
