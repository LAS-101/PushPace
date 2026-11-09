import type { Metadata } from "next";
import { CardioActivityPage } from "@/components/CardioActivityPage";

export const metadata: Metadata = { title: "Walking" };

export default function WalkingPage() {
  return <CardioActivityPage type="walking" />;
}
