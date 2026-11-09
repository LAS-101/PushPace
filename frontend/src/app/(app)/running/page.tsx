import type { Metadata } from "next";
import { CardioActivityPage } from "@/components/CardioActivityPage";

export const metadata: Metadata = { title: "Running" };

export default function RunningPage() {
  return <CardioActivityPage type="running" />;
}
