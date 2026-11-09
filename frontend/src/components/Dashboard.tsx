"use client";

import { type ComponentType, type CSSProperties, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber, sum } from "@/lib/format";
import type { GymWorkout, RunningActivity, WalkingActivity } from "@/lib/types";
import { enterStyle } from "@/lib/useActivities";
import {
  GymIcon,
  RunningIcon,
  StatCaloriesIcon,
  StatDistanceIcon,
  StatTimeIcon,
  StatWorkoutsIcon,
  WalkingIcon,
} from "./icons";

interface DashboardData {
  walking: WalkingActivity[];
  gym: GymWorkout[];
  running: RunningActivity[];
}

/** Counts from 0 to `value` with an ease-out curve. */
function AnimatedNumber({ value, decimals = 0, duration = 1200 }: { value: number; decimals?: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCurrent(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return <>{decimals ? current.toFixed(decimals) : formatNumber(Math.round(current))}</>;
}

function StatCard({
  label,
  Icon,
  value,
  decimals,
  sub,
  index,
}: {
  label: string;
  Icon: ComponentType;
  value: number;
  decimals?: number;
  sub: string;
  index: number;
}) {
  return (
    <div className="stat-card enter" style={enterStyle(index)}>
      <div className="label">
        {label}
        <Icon />
      </div>
      <div className="value">
        <AnimatedNumber value={value} decimals={decimals} />
      </div>
      <div className="sub">{sub}</div>
    </div>
  );
}

function ActivityCard({
  kind,
  title,
  Icon,
  color,
  rows,
  index,
}: {
  kind: "walking" | "gym" | "running";
  title: string;
  Icon: ComponentType<{ strokeWidth?: number }>;
  color: string;
  rows: [string, string][];
  index: number;
}) {
  return (
    <div className={`act-card ${kind} enter`} style={enterStyle(index)}>
      <div className="act-title" style={{ color } as CSSProperties}>
        <Icon strokeWidth={2.4} />
        {title}
      </div>
      {rows.map(([label, value], i) => (
        <div key={label} className="act-row">
          <span className="lbl">{label}</span>
          <span className="val" style={i === 0 ? { color } : undefined}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const safe = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);
    Promise.all([
      safe(api.listActivities("walking")),
      safe(api.listActivities("gym")),
      safe(api.listActivities("running")),
    ]).then(([walking, gym, running]) => setData({ walking, gym, running }));
  }, []);

  if (!data) return <p className="empty-state">Loading…</p>;

  const { walking, gym, running } = data;
  const all = [...walking, ...gym, ...running];
  const totalHours = sum(all, (a) => a.duration) / 60;
  const totalDistance = sum([...walking, ...running], (a) => a.distance);

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Track your fitness progress across all activities</p>

      <div className="stats-grid">
        <StatCard index={0} label="Total Workouts" Icon={StatWorkoutsIcon} value={all.length} sub="all time" />
        <StatCard index={1} label="Calories Burned" Icon={StatCaloriesIcon} value={sum(all, (a) => a.calories)} sub="kcal total" />
        <StatCard index={2} label="Active Time" Icon={StatTimeIcon} value={Number(totalHours.toFixed(1))} decimals={1} sub="hours total" />
        <StatCard index={3} label="Distance" Icon={StatDistanceIcon} value={Number(totalDistance.toFixed(1))} decimals={1} sub="km total" />
      </div>

      <div className="activity-grid">
        <ActivityCard
          index={4}
          kind="walking"
          title="Walking"
          Icon={WalkingIcon}
          color="var(--green)"
          rows={[
            ["Workouts:", `${walking.length} sessions`],
            ["Distance:", `${sum(walking, (a) => a.distance).toFixed(1)} km`],
            ["Calories:", `${formatNumber(sum(walking, (a) => a.calories))} kcal`],
          ]}
        />
        <ActivityCard
          index={5}
          kind="gym"
          title="Gym"
          Icon={GymIcon}
          color="var(--orange)"
          rows={[
            ["Workouts:", `${gym.length} sessions`],
            ["Duration:", `${(sum(gym, (a) => a.duration) / 60).toFixed(0)} hours`],
            ["Calories:", `${formatNumber(sum(gym, (a) => a.calories))} kcal`],
          ]}
        />
        <ActivityCard
          index={6}
          kind="running"
          title="Running"
          Icon={RunningIcon}
          color="var(--cyan)"
          rows={[
            ["Workouts:", `${running.length} sessions`],
            ["Distance:", `${sum(running, (a) => a.distance).toFixed(1)} km`],
            ["Calories:", `${formatNumber(sum(running, (a) => a.calories))} kcal`],
          ]}
        />
      </div>
    </>
  );
}
