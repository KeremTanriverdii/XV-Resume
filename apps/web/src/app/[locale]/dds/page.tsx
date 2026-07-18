import { Metadata } from "next";
import DdsDashboardClient from "@/components/clientpages/DdsDashboardClient";

export const metadata: Metadata = {
  title: "XV Resume - Sandbox Workspace",
  description: "Isolated sandbox dashboard workspace with Obsidian theme alignment.",
};

export default function DdsDashboardPage() {
  // Render the client component for handling workspace layout and state CRUD
  return <DdsDashboardClient />;
}
