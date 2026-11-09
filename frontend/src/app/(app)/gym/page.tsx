import type { Metadata } from "next";
import { GymPage } from "@/components/GymPage";

export const metadata: Metadata = { title: "Gym" };

export default function Page() {
  return <GymPage />;
}
