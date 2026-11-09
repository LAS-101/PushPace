import type { ExerciseInput } from "./types";

/** Approximate MET values for common strength exercises. */
const MET_TABLE: Record<string, number> = {
  "bench press": 3.5,
  bench: 3.5,
  squat: 5.0,
  squats: 5.0,
  deadlift: 6.0,
  deadlifts: 6.0,
  "pull-up": 8.0,
  "pull-ups": 8.0,
  pullup: 8.0,
  pullups: 8.0,
  "shoulder press": 4.0,
  "overhead press": 4.0,
  "bicep curl": 3.0,
  "bicep curls": 3.0,
  curl: 3.0,
  tricep: 3.0,
  row: 4.5,
  rows: 4.5,
  "lat pulldown": 4.0,
  "leg press": 4.5,
  lunge: 4.0,
  lunges: 4.0,
  plank: 3.0,
  crunch: 3.5,
  crunches: 3.5,
  dip: 5.0,
  dips: 5.0,
};
const DEFAULT_MET = 4.0;

export function getMET(exerciseName: string): number {
  const lower = exerciseName.toLowerCase();
  for (const key in MET_TABLE) {
    if (lower.includes(key)) return MET_TABLE[key];
  }
  return DEFAULT_MET;
}

export function estimateGymCalories(
  exercises: Pick<ExerciseInput, "name">[],
  durationMin: number,
  weightKg: number,
): number {
  if (!weightKg || !durationMin) return 0;
  const avgMET =
    exercises.length === 0
      ? DEFAULT_MET
      : exercises.reduce((sum, ex) => sum + getMET(ex.name), 0) / exercises.length;
  return Math.round(avgMET * weightKg * (durationMin / 60));
}

export function estimateRunningCalories(distanceKm: number, weightKg: number): number {
  if (!weightKg || !distanceKm) return 0;
  return Math.round(distanceKm * weightKg * 1.036);
}

export function estimateWalkingCalories(distanceKm: number, weightKg: number): number {
  if (!weightKg || !distanceKm) return 0;
  return Math.round(distanceKm * weightKg * 0.53);
}
