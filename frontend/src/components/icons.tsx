import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const line = { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const COLORS = {
  cyan: "#00c8ff",
  green: "#00d68f",
  orange: "#ff6b2b",
};

/* ── Small field icons (13×13) ─────────────────────────── */

export const CalendarIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <line x1="4" y1="1" x2="4" y2="3" {...line} strokeWidth="1.2" />
    <line x1="9" y1="1" x2="9" y2="3" {...line} strokeWidth="1.2" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
    <polyline points="6.5,3.5 6.5,6.5 8.5,8" {...line} strokeWidth="1.2" />
  </svg>
);

export const DistanceIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <path d="M2 9c1-3 3-5 4.5-5S10 6 11 9" {...line} strokeWidth="1.2" />
  </svg>
);

export const StepsIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <circle cx="5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="9" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const CaloriesIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <path d="M6.5 1C6.5 1 3 5 3 7.5a3.5 3.5 0 007 0C10 5 6.5 1 6.5 1z" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const PaceIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
    <line x1="6.5" y1="4" x2="6.5" y2="6.5" {...line} strokeWidth="1.2" />
    <line x1="6.5" y1="6.5" x2="9" y2="9" {...line} strokeWidth="1.2" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <line x1="3" y1="3" x2="10" y2="10" {...line} strokeWidth="1.5" />
    <line x1="10" y1="3" x2="3" y2="10" {...line} strokeWidth="1.5" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg viewBox="0 0 13 13" fill="none" {...p}>
    <circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 12c0-2.76 2.24-5 5-5s5 2.24 5 5" {...line} strokeWidth="1.2" />
  </svg>
);

/* ── Header / nav icons ────────────────────────────────── */

export const LogoIcon = (p: IconProps) => (
  <svg viewBox="0 0 28 28" fill="none" {...p}>
    <polyline points="2,18 8,10 13,16 18,6 22,12 26,8" {...line} stroke={COLORS.cyan} strokeWidth="2.5" />
  </svg>
);

export const LogoutIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const NavDashboardIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <polyline points="1,12 5,7 8,10 11,4 15,6" {...line} strokeWidth="1.5" />
  </svg>
);

export const NavWalkingIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <circle cx="8" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 6l-2 4h2l1 4M10 6l2 4h-2l-1 4M6 10l2-2 2 2" {...line} strokeWidth="1.5" />
  </svg>
);

export const NavGymIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <rect x="1" y="6" width="3" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="12" y="6" width="3" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="7" width="3" height="2" rx=".5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10" y="7" width="3" height="2" rx=".5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="6" y1="8" x2="10" y2="8" {...line} strokeWidth="1.5" />
  </svg>
);

export const NavRunningIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <polyline points="1,11 4,6 7,9 10,3 13,6 15,5" {...line} strokeWidth="1.5" />
  </svg>
);

/* ── Large page / card icons ───────────────────────────── */

export const WalkingIcon = ({ strokeWidth = 2, ...p }: IconProps) => (
  <svg viewBox="0 0 36 36" fill="none" {...p}>
    <circle cx="18" cy="7" r="3.5" stroke={COLORS.green} strokeWidth={strokeWidth} />
    <path
      d="M13 12l-4 8h5l2.5 9M23 12l4 8h-5l-2.5 9M13 20l5-5 5 5"
      {...line}
      stroke={COLORS.green}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const GymIcon = ({ strokeWidth = 2, ...p }: IconProps) => (
  <svg viewBox="0 0 36 36" fill="none" {...p}>
    <rect x="1" y="13" width="6" height="10" rx="2" stroke={COLORS.orange} strokeWidth={strokeWidth} />
    <rect x="29" y="13" width="6" height="10" rx="2" stroke={COLORS.orange} strokeWidth={strokeWidth} />
    <rect x="6" y="15" width="6" height="6" rx="1.5" stroke={COLORS.orange} strokeWidth={strokeWidth} />
    <rect x="24" y="15" width="6" height="6" rx="1.5" stroke={COLORS.orange} strokeWidth={strokeWidth} />
    <line x1="12" y1="18" x2="24" y2="18" {...line} stroke={COLORS.orange} strokeWidth={strokeWidth} />
  </svg>
);

export const RunningIcon = ({ strokeWidth = 2.2, ...p }: IconProps) => (
  <svg viewBox="0 0 36 36" fill="none" {...p}>
    <polyline
      points="2,24 8,14 14,20 20,8 26,14 30,10 34,12"
      {...line}
      stroke={COLORS.cyan}
      strokeWidth={strokeWidth}
    />
  </svg>
);

/* ── Dashboard stat icons (18×18) ──────────────────────── */

export const StatWorkoutsIcon = (p: IconProps) => (
  <svg viewBox="0 0 18 18" fill="none" {...p}>
    <polyline points="1,13 5,8 9,11 13,4 17,7" {...line} stroke={COLORS.cyan} strokeWidth="1.8" />
  </svg>
);

export const StatCaloriesIcon = (p: IconProps) => (
  <svg viewBox="0 0 18 18" fill="none" {...p}>
    <path d="M9 2C9 2 4 7 4 11a5 5 0 0010 0c0-4-5-9-5-9z" {...line} stroke={COLORS.orange} strokeWidth="1.8" />
  </svg>
);

export const StatTimeIcon = (p: IconProps) => (
  <svg viewBox="0 0 18 18" fill="none" {...p}>
    <circle cx="9" cy="9" r="7" stroke={COLORS.cyan} strokeWidth="1.8" />
    <polyline points="9,5 9,9 12,11" {...line} stroke={COLORS.cyan} strokeWidth="1.8" />
  </svg>
);

export const StatDistanceIcon = (p: IconProps) => (
  <svg viewBox="0 0 18 18" fill="none" {...p}>
    <polyline points="2,14 7,8 10,11 16,4" {...line} stroke={COLORS.green} strokeWidth="1.8" />
    <polyline points="13,4 16,4 16,7" {...line} stroke={COLORS.green} strokeWidth="1.8" />
  </svg>
);
