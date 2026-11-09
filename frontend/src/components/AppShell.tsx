"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import {
  LogoIcon,
  LogoutIcon,
  NavDashboardIcon,
  NavGymIcon,
  NavRunningIcon,
  NavWalkingIcon,
  UserIcon,
} from "./icons";
import { ProfileModal } from "./ProfileModal";

const NAV = [
  { href: "/dashboard", label: "Dashboard", section: "dashboard", Icon: NavDashboardIcon },
  { href: "/walking", label: "Walking", section: "walking", Icon: NavWalkingIcon },
  { href: "/gym", label: "Gym", section: "gym", Icon: NavGymIcon },
  { href: "/running", label: "Running", section: "running", Icon: NavRunningIcon },
] as const;

interface ProfileContextValue {
  /** `undefined` while loading, `null` if it could not be loaded. */
  profile: Profile | null | undefined;
}

const ProfileContext = createContext<ProfileContextValue>({ profile: undefined });

/** The logged-in user's profile (weight is used for calorie estimates). */
export function useProfile() {
  return useContext(ProfileContext).profile;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const section = NAV.find((item) => pathname.startsWith(item.href))?.section ?? "dashboard";

  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [modal, setModal] = useState<"none" | "first-time" | "edit">("none");

  // `proxy.ts` already redirects visitors without a cookie; this catches
  // expired or invalid tokens.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me();
        if (cancelled) return;
        if (!me.authenticated) {
          router.replace("/login");
          return;
        }
        setAuthenticated(true);
        const loaded = await api.getProfile().catch(() => null);
        if (cancelled) return;
        setProfile(loaded);
        if (loaded && !loaded.weight) setModal("first-time");
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className={`page-${section}`}>
      <header>
        <Link className="logo" href="/dashboard">
          <LogoIcon />
          PushPace
        </Link>
        <div className="header-actions">
          <button type="button" className="profile-btn" onClick={() => setModal("edit")} disabled={!authenticated} title="Profile">
            <UserIcon /> <span className="btn-label">Profile</span>
          </button>
          <button type="button" className="btn-logout" onClick={handleLogout} title="Logout">
            <LogoutIcon />
            <span className="btn-label">Logout</span>
          </button>
        </div>
      </header>

      <nav>
        <div className="nav-tabs">
          {NAV.map(({ href, label, section: s, Icon }) => (
            <Link key={href} href={href} className={s === section ? "active" : undefined}>
              <Icon />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <ProfileContext.Provider value={{ profile }}>
        <main>{authenticated ? children : <p className="empty-state">Loading…</p>}</main>
      </ProfileContext.Provider>

      {modal !== "none" && (
        <ProfileModal
          profile={profile ?? null}
          firstTime={modal === "first-time"}
          onClose={() => setModal("none")}
          onSaved={(updated) => {
            setProfile(updated);
            setModal("none");
          }}
        />
      )}
    </div>
  );
}
