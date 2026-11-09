"use client";

import { type FormEvent, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { estimateGymCalories } from "@/lib/calories";
import { formatDate } from "@/lib/format";
import type { ExerciseInput } from "@/lib/types";
import { enterStyle, useActivities } from "@/lib/useActivities";
import { useProfile } from "./AppShell";
import { CalendarIcon, CaloriesIcon, ClockIcon, CloseIcon, GymIcon } from "./icons";
import { Modal } from "./Modal";

export function GymPage() {
  const { items: workouts, loading, reload, remove } = useActivities("gym");
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title-row">
            <GymIcon />
            Gym
          </div>
          <p className="page-sub">Track your gym workouts and strength training</p>
        </div>
        <button type="button" className="btn btn-orange" onClick={() => setAdding(true)}>
          + Add Workout
        </button>
      </div>

      <h2>Recent Workouts</h2>

      <div className="workout-list">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : workouts.length === 0 ? (
          <p className="empty-state">No gym workouts yet. Add your first workout!</p>
        ) : (
          workouts.map((w, i) => (
            <div
              key={w.id}
              className="workout-card enter"
              style={enterStyle(i)}
              title="Right-click to delete"
              onContextMenu={(e) => {
                e.preventDefault();
                void remove(w.id, "Delete this gym workout?");
              }}
            >
              <div className="workout-meta">
                <div className="meta-field">
                  <div className="field-label">
                    <CalendarIcon /> Date
                  </div>
                  <div className="field-value">{formatDate(w.date)}</div>
                </div>
                <div className="meta-field">
                  <div className="field-label">
                    <ClockIcon /> Duration
                  </div>
                  <div className="field-value">{w.duration} min</div>
                </div>
                <div className="meta-field">
                  <div className="field-label">
                    <CaloriesIcon /> Calories
                  </div>
                  <div className="field-value">{w.calories} kcal</div>
                </div>
              </div>

              {w.exercises.length > 0 && (
                <>
                  <div className="exercises-label">Exercises:</div>
                  <div className="exercises-grid">
                    {w.exercises.map((ex) => (
                      <div key={ex.id} className="exercise-card">
                        <div className="exercise-name">{ex.name}</div>
                        <div className="exercise-detail-row">
                          <span className="ex-badge ex-sets">{ex.sets} sets</span>
                          <span className="ex-badge ex-reps">{ex.reps} reps</span>
                          <span className="ex-badge ex-weight">
                            {ex.weight > 0 ? `${ex.weight} kg` : "Bodyweight"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {adding && (
        <AddWorkoutModal
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

interface ExerciseRow {
  key: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

let nextRowKey = 1;
const newRow = (): ExerciseRow => ({ key: nextRowKey++, name: "", sets: "", reps: "", weight: "" });

function toExercises(rows: ExerciseRow[]): ExerciseInput[] {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      sets: parseInt(row.sets, 10) || 0,
      reps: parseInt(row.reps, 10) || 0,
      weight: parseFloat(row.weight) || 0,
    }))
    .filter((ex) => ex.name !== "");
}

function AddWorkoutModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const profile = useProfile();
  const weight = profile?.weight ?? null;

  const [rows, setRows] = useState<ExerciseRow[]>(() => [newRow()]);
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  const exercises = toExercises(rows);
  const durationMin = parseInt(duration, 10) || 0;
  const autoCalories = weight ? estimateGymCalories(exercises, durationMin, weight) : null;

  const updateRow = (key: number, patch: Partial<ExerciseRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (exercises.length === 0) {
      alert("Add at least one exercise with a name.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await api.createActivity("gym", {
        date: String(fd.get("date")),
        duration: durationMin,
        calories: autoCalories ?? (parseInt(String(fd.get("calories")), 10) || 0),
        exercises,
      });
      onCreated();
    } catch (error) {
      alert(`Error creating workout: ${errorMessage(error)}`);
      setSaving(false);
    }
  }

  return (
    <Modal title="Add Workout" onClose={onClose} wide>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gym-date">Date</label>
            <input type="date" id="gym-date" name="date" required />
          </div>
          <div className="form-group">
            <label htmlFor="gym-duration">Duration (min)</label>
            <input
              type="number"
              id="gym-duration"
              name="duration"
              min={1}
              placeholder="60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="exercises-form-section">
          <div className="exercises-form-header">
            <span className="exercises-form-title">Exercises</span>
            <button type="button" className="add-exercise-btn" onClick={() => setRows((r) => [...r, newRow()])}>
              + Add Exercise
            </button>
          </div>
          <div className="exercise-rows-header">
            <span>Exercise Name</span>
            <span>Sets</span>
            <span>Reps</span>
            <span>Weight (kg)</span>
            <span />
          </div>
          <div>
            {rows.map((row, index) => (
              <div key={row.key} className="exercise-input-row">
                <input
                  type="text"
                  placeholder="Bench Press"
                  aria-label="Exercise name"
                  value={row.name}
                  autoFocus={index === rows.length - 1}
                  onChange={(e) => updateRow(row.key, { name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="3"
                  min={1}
                  aria-label="Sets"
                  value={row.sets}
                  onChange={(e) => updateRow(row.key, { sets: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="10"
                  min={1}
                  aria-label="Reps"
                  value={row.reps}
                  onChange={(e) => updateRow(row.key, { reps: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="60"
                  min={0}
                  step={0.5}
                  aria-label="Weight (kg)"
                  value={row.weight}
                  onChange={(e) => updateRow(row.key, { weight: e.target.value })}
                />
                <button
                  type="button"
                  className="remove-ex-btn"
                  aria-label="Remove exercise"
                  onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          {autoCalories !== null ? (
            <>
              <label htmlFor="gym-calories">Calories (kcal) — auto-calculated</label>
              <input type="number" id="gym-calories" name="calories" value={autoCalories} readOnly className="readonly" />
            </>
          ) : (
            <>
              <label htmlFor="gym-calories">Calories (kcal)</label>
              <input type="number" id="gym-calories" name="calories" min={0} placeholder="300" required />
            </>
          )}
        </div>

        <button type="submit" className="modal-submit" disabled={saving}>
          {saving ? "Saving…" : "Save Workout"}
        </button>
      </form>
    </Modal>
  );
}
