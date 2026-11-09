"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { estimateRunningCalories, estimateWalkingCalories } from "@/lib/calories";
import { formatDate, formatNumber } from "@/lib/format";
import type { RunningActivity, WalkingActivity } from "@/lib/types";
import { enterStyle, useActivities } from "@/lib/useActivities";
import { useProfile } from "./AppShell";
import {
  CalendarIcon,
  CaloriesIcon,
  ClockIcon,
  DistanceIcon,
  PaceIcon,
  RunningIcon,
  StepsIcon,
  WalkingIcon,
} from "./icons";
import { Modal } from "./Modal";

type CardioType = "walking" | "running";

/** Everything that differs between the walking and running pages. */
const CONFIG = {
  walking: {
    title: "Walking",
    subtitle: "Track your walking activities and progress",
    Icon: WalkingIcon,
    buttonClass: "btn-green",
    addLabel: "Add Walk",
    empty: "No walking activities yet. Add your first walk!",
    durationPlaceholder: "45",
    distancePlaceholder: "4.2",
    caloriesPlaceholder: "210",
    estimate: estimateWalkingCalories,
    extra: {
      name: "steps",
      label: "Steps",
      Icon: StepsIcon,
      placeholder: "5400",
      step: 1,
      format: (a: WalkingActivity | RunningActivity) => formatNumber((a as WalkingActivity).steps),
    },
  },
  running: {
    title: "Running",
    subtitle: "Track your running activities and improve your pace",
    Icon: RunningIcon,
    buttonClass: "btn-cyan",
    addLabel: "Add Run",
    empty: "No running activities yet. Add your first run!",
    durationPlaceholder: "35",
    distancePlaceholder: "5.0",
    caloriesPlaceholder: "300",
    estimate: estimateRunningCalories,
    extra: {
      name: "pace",
      label: "Pace",
      Icon: PaceIcon,
      placeholder: "6.5",
      step: 0.1,
      format: (a: WalkingActivity | RunningActivity) => `${(a as RunningActivity).pace} min/km`,
    },
  },
} as const;

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <div className="field-label">
        {icon} {label}
      </div>
      <div className="field-value">{children}</div>
    </div>
  );
}

export function CardioActivityPage({ type }: { type: CardioType }) {
  const config = CONFIG[type];
  const { items, loading, reload, remove } = useActivities(type);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title-row">
            <config.Icon />
            {config.title}
          </div>
          <p className="page-sub">{config.subtitle}</p>
        </div>
        <button type="button" className={`btn ${config.buttonClass}`} onClick={() => setAdding(true)}>
          + {config.addLabel}
        </button>
      </div>

      <h2>Recent Activities</h2>

      <div className="activity-list">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : items.length === 0 ? (
          <p className="empty-state">{config.empty}</p>
        ) : (
          items.map((act, i) => (
            <div
              key={act.id}
              className="activity-row enter"
              style={enterStyle(i)}
              title="Right-click to delete"
              onContextMenu={(e) => {
                e.preventDefault();
                void remove(act.id, `Delete this ${type} activity?`);
              }}
            >
              <Field icon={<CalendarIcon />} label="Date">
                {formatDate(act.date)}
              </Field>
              <Field icon={<ClockIcon />} label="Duration">
                {act.duration} min
              </Field>
              <Field icon={<DistanceIcon />} label="Distance">
                {act.distance} km
              </Field>
              <Field icon={<config.extra.Icon />} label={config.extra.label}>
                {config.extra.format(act)}
              </Field>
              <Field icon={<CaloriesIcon />} label="Calories">
                {act.calories} kcal
              </Field>
            </div>
          ))
        )}
      </div>

      {adding && (
        <AddCardioModal
          type={type}
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            void reload();
          }}
        />
      )}
    </>
  );
}

function AddCardioModal({
  type,
  onClose,
  onCreated,
}: {
  type: CardioType;
  onClose: () => void;
  onCreated: () => void;
}) {
  const config = CONFIG[type];
  const profile = useProfile();
  const weight = profile?.weight ?? null;
  const [distance, setDistance] = useState("");
  const [saving, setSaving] = useState(false);

  const autoCalories = weight ? config.estimate(parseFloat(distance) || 0, weight) : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const num = (name: string) => parseFloat(String(fd.get(name))) || 0;
    const base = {
      date: String(fd.get("date")),
      duration: Math.trunc(num("duration")),
      distance: num("distance"),
      calories: autoCalories ?? Math.trunc(num("calories")),
    };

    setSaving(true);
    try {
      if (type === "walking") {
        await api.createActivity("walking", { ...base, steps: Math.trunc(num("steps")) });
      } else {
        await api.createActivity("running", { ...base, pace: num("pace") });
      }
      onCreated();
    } catch (error) {
      alert(`Error creating activity: ${errorMessage(error)}`);
      setSaving(false);
    }
  }

  return (
    <Modal title={config.addLabel} onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="field-date">Date</label>
          <input type="date" id="field-date" name="date" required />
        </div>
        <div className="form-group">
          <label htmlFor="field-duration">Duration (min)</label>
          <input
            type="number"
            id="field-duration"
            name="duration"
            min={1}
            placeholder={config.durationPlaceholder}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="field-distance">Distance (km)</label>
          <input
            type="number"
            id="field-distance"
            name="distance"
            min={0}
            step={0.1}
            placeholder={config.distancePlaceholder}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor={`field-${config.extra.name}`}>
            {type === "running" ? "Pace (min/km)" : config.extra.label}
          </label>
          <input
            type="number"
            id={`field-${config.extra.name}`}
            name={config.extra.name}
            min={0}
            step={config.extra.step}
            placeholder={config.extra.placeholder}
            required
          />
        </div>
        <div className="form-group">
          {autoCalories !== null ? (
            <>
              <label htmlFor="field-calories">Calories (kcal) — auto-calculated</label>
              <input type="number" id="field-calories" name="calories" value={autoCalories} readOnly className="readonly" />
            </>
          ) : (
            <>
              <label htmlFor="field-calories">Calories (kcal)</label>
              <input
                type="number"
                id="field-calories"
                name="calories"
                min={0}
                placeholder={config.caloriesPlaceholder}
                required
              />
            </>
          )}
        </div>
        <button type="submit" className="modal-submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </Modal>
  );
}
