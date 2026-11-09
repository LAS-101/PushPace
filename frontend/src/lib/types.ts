export type ActivityType = "walking" | "gym" | "running";
export type Gender = "male" | "female";

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface Profile extends User {
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: Gender | null;
  updatedAt: string;
}

export interface ProfileInput {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
}

export interface WalkingActivity {
  id: number;
  userId: number;
  /** YYYY-MM-DD */
  date: string;
  /** minutes */
  duration: number;
  /** km */
  distance: number;
  steps: number;
  calories: number;
  createdAt: string;
}

export interface RunningActivity {
  id: number;
  userId: number;
  date: string;
  duration: number;
  distance: number;
  /** min/km */
  pace: number;
  calories: number;
  createdAt: string;
}

export interface GymExercise {
  id: number;
  workoutId: number;
  name: string;
  sets: number;
  reps: number;
  /** kg; 0 means bodyweight */
  weight: number;
}

export interface GymWorkout {
  id: number;
  userId: number;
  date: string;
  duration: number;
  calories: number;
  createdAt: string;
  exercises: GymExercise[];
}

export interface ActivityByType {
  walking: WalkingActivity;
  running: RunningActivity;
  gym: GymWorkout;
}

export type ExerciseInput = Omit<GymExercise, "id" | "workoutId">;

export interface ActivityInputByType {
  walking: Omit<WalkingActivity, "id" | "userId" | "createdAt">;
  running: Omit<RunningActivity, "id" | "userId" | "createdAt">;
  gym: Omit<GymWorkout, "id" | "userId" | "createdAt" | "exercises"> & {
    exercises: ExerciseInput[];
  };
}
